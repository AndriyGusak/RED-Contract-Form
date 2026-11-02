// Спільне для двох пробних сторінок: поля, збереження в цьому браузері, перевірки, текст для договору.
// Дані нікуди не надсилаються: лише localStorage і файл, який людина завантажує сама.
const KEY = 'red-rekvizyty-orendaria-v1';

// Банки за кодом (МФО) у IBAN: позиції 5–10. Невідомий код — назву банку вводять вручну.
const BANKS = {
  '322001': 'АТ «Універсал Банк»',
  '305299': 'АТ КБ «ПриватБанк»',
  '300465': 'АТ «Ощадбанк»',
  '322313': 'АТ «Укрексімбанк»',
  '380805': 'АТ «Райффайзен Банк»',
  '300528': 'АТ «ОТП Банк»',
  '351005': 'АТ «УКРСИББАНК»',
  '334851': 'АТ «ПУМБ»',
  '320478': 'АТ «Укргазбанк»',
  '325365': 'АТ «Кредобанк»',
  '300614': 'АТ «Креді Агріколь Банк»',
  '307770': 'АТ «А-Банк»'
};

const TAX = [
  'Платник єдиного податку 1 групи',
  'Платник єдиного податку 2 групи',
  'Платник єдиного податку 3 групи, без ПДВ',
  'Платник єдиного податку 3 групи, платник ПДВ',
  'Загальна система, платник ПДВ',
  'Загальна система, не платник ПДВ'
];

const EMPTY = {
  kind: 'ФОП', name: '', code: '', addr1: '', addr2: '', tax: '',
  spos: '', sname: '', basis: 'Статут', dno: '', ddate: '',
  iban: '', bank: '', email: '', phone: '',
  prem: '', start: '01.11.2026', act: '', agree: false, files: [], ref: '', savedAt: ''
};

// Посилання може підставити приміщення, початок і вид діяльності: index.html?prem=…&start=…&act=…
// ref — мітка посилання (кому його надіслали); орендар її не бачить, вона їде у відповіді.
function fromLink() {
  const q = new URLSearchParams(location.search), o = {};
  ['prem', 'start', 'act', 'ref'].forEach(k => { if (q.get(k)) o[k] = q.get(k).slice(0, 120); });
  return o;
}

function load() {
  let s = {};
  try { s = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) {}
  const d = Object.assign({}, EMPTY, s);
  Object.entries(fromLink()).forEach(([k, v]) => { if (!d[k] || k === 'ref') d[k] = v; });
  return d;
}
function forget() { try { localStorage.removeItem(KEY); } catch (e) {} }
function save(d) {
  d.savedAt = new Date().toISOString();
  try { localStorage.setItem(KEY, JSON.stringify(d)); return true; } catch (e) { return false; }
}

const digits = s => String(s || '').replace(/\D/g, '');
const ibanClean = s => String(s || '').replace(/\s/g, '').toUpperCase();
const ibanPretty = s => ibanClean(s).replace(/(.{4})/g, '$1 ').trim();

function ibanOk(s) {
  const v = ibanClean(s);
  if (!/^UA\d{27}$/.test(v)) return false;
  const r = (v.slice(4) + v.slice(0, 4)).replace(/[A-Z]/g, c => c.charCodeAt(0) - 55);
  let m = 0;
  for (const ch of r) m = (m * 10 + +ch) % 97;
  return m === 1;
}
const bankByIban = s => { const v = ibanClean(s); return /^UA\d{8}/.test(v) ? BANKS[v.slice(4, 10)] || '' : ''; };

function rnokppOk(s) {
  const d = digits(s);
  if (d.length !== 10) return false;
  const w = [-1, 5, 7, 9, 4, 6, 10, 5, 7];
  const sum = w.reduce((a, k, i) => a + k * +d[i], 0);
  return (sum % 11) % 10 === +d[9];
}
const edrpouOk = s => /^\d{8}$/.test(digits(s)) && digits(s).length === String(s).trim().length;
const emailOk = s => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s).trim());
const phoneOk = s => { const d = digits(s); return d.length === 12 && d.startsWith('380'); };
const dateOk = s => /^\d{2}\.\d{2}\.\d{4}$/.test(String(s).trim());

// Перелік полів для перевірки й тексту. need — обов'язкове; ok — перевірка формату.
function rows(d) {
  const fop = d.kind === 'ФОП';
  const r = [
    ['Тип', d.kind === 'ФОП' ? 'ФОП' : 'Юридична особа', true],
    [fop ? 'ПІБ' : 'Повна назва', d.name, true],
    [fop ? 'РНОКПП' : 'ЄДРПОУ', d.code, true, fop ? rnokppOk(d.code) : edrpouOk(d.code), 'num'],
    ['Адреса, рядок 1', d.addr1, true],
    ['Адреса, рядок 2', d.addr2, true],
    ['Податковий статус', d.tax, true]
  ];
  if (!fop) {
    r.push(['Посада підписанта', d.spos, true], ['ПІБ підписанта', d.sname, true],
      ['Діє на підставі', d.basis === 'Довіреність' ? `Довіреності № ${d.dno || '…'} від ${d.ddate || '…'}` : 'Статуту', true,
        d.basis !== 'Довіреність' || (d.dno && dateOk(d.ddate))]);
  }
  r.push(['IBAN', ibanPretty(d.iban), true, ibanOk(d.iban), 'num'], ['Банк', d.bank, true],
    ['E-mail', d.email, true, emailOk(d.email)], ['Телефон', d.phone, true, phoneOk(d.phone), 'num'],
    ['Приміщення', d.prem, false], ['Початок оренди', d.start, false, !d.start || dateOk(d.start), 'num'],
    ['Що буде в приміщенні', d.act, false],
    ['Документи', (d.files || []).map(x => x.name).join(', '), false]);
  return r;
}
// Документи орендаря: виписка з ЄДР, довіреність. Їдуть у зашифрованій відповіді разом з реквізитами.
// Фото зменшуємо до 2000 px (JPEG), PDF — до 3 МБ, щоб влізло в пам'ять браузера й у відправку.
const DOCS = { edr: 'Виписка з ЄДР', dov: 'Довіреність' };
async function readDoc(file) {
  if (/^image\//.test(file.type)) {
    const img = await createImageBitmap(file);
    const k = Math.min(1, 2000 / Math.max(img.width, img.height));
    const c = document.createElement('canvas');
    c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return { name: file.name.replace(/\.[^.]+$/, '') + '.jpg', type: 'image/jpeg', data: c.toDataURL('image/jpeg', 0.85).split(',')[1] };
  }
  if (file.type !== 'application/pdf') throw new Error('Підходять PDF або фото');
  if (file.size > 3e6) throw new Error('PDF більший за 3 МБ');
  const data = await new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(r.result.split(',')[1]); r.onerror = no; r.readAsDataURL(file); });
  return { name: file.name, type: file.type, data };
}

const problems = d => rows(d).filter(([, v, need, ok]) => (need && !String(v || '').trim()) || (String(v || '').trim() && ok === false));

// Текст блоку реквізитів, як у договорі: адреса у 2 рядки, «ЄДРПОУ» — лише код.
function contractText(d) {
  const fop = d.kind === 'ФОП';
  const L = [];
  L.push(fop ? 'Фізична особа-підприємець' : '', d.name || '[назва]');
  L.push((fop ? 'РНОКПП ' : 'ЄДРПОУ ') + (d.code || '[код]'));
  L.push((d.addr1 || '[індекс, місто,]'), (d.addr2 || '[вулиця, будинок, офіс/кв.]'));
  L.push('IBAN ' + (ibanPretty(d.iban) || '[UA…]'), d.bank || '[банк]');
  L.push(d.tax || '[податковий статус]');
  if (d.email || d.phone) L.push([d.email, d.phone].filter(Boolean).join(', '));
  if (!fop) {
    L.push('', (d.spos || '[посада]') + ' ' + (d.sname || '[ПІБ]'));
    L.push('діє на підставі ' + (d.basis === 'Довіреність' ? `довіреності № ${d.dno || '…'} від ${d.ddate || '…'}` : 'статуту'));
  }
  return L.filter((x, i) => x !== '' || i > 0).join('\n');
}

function toast(msg) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.append(t); }
  t.textContent = msg; t.classList.add('on');
  clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove('on'), 2200);
}
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Шифрування: AES-GCM для даних, ключ AES загорнуто відкритим ключем RSA-OAEP з config.js.
// Розшифрувати може лише власник закритого ключа (instrumenty/rozshyfruvaty.mjs).
const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
async function encrypt(obj) {
  const pub = await crypto.subtle.importKey('jwk', FORMA.publicKey, { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['wrapKey']);
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const c = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(obj)));
  const k = await crypto.subtle.wrapKey('raw', key, pub, { name: 'RSA-OAEP' });
  return 'RED1:' + b64(k) + ':' + b64(iv) + ':' + b64(c) + ':END';
}
const canSend = () => !!(window.FORMA && FORMA.publicKey && window.crypto && crypto.subtle);
// Зашифрований текст орендар сам надсилає поштою чи в месенджер; сторінка нічого нікуди не відправляє.
const seal = d => encrypt(Object.assign({}, d, { sentAt: new Date().toISOString() }));
// Google Apps Script (instrumenty/Code.gs) дописує зашифрований текст у таблицю. Відповідь без CORS непрозора,
// тож успіх не підтверджується, але мережеву помилку fetch покаже — тоді орендар надсилає текст сам.
const post = txt => fetch(FORMA.endpoint, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: txt });
