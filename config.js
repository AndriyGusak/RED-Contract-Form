// Налаштування форми. endpoint — адреса скрипта Google-таблиці (instrumenty/Code.gs), туди форма шле зашифровані відповіді.
// email — запасний шлях: якщо надіслати не вдалося, орендар шле текст поштою (адресу видно в коді сторінки).
// publicKey — відкритий ключ для шифрування (створює instrumenty/klyuch.mjs); закритий ключ сюди не потрапляє.
window.FORMA = {
  endpoint: 'https://script.google.com/macros/s/AKfycbzy8pfDvJ4lodYRaDClZptq243gVRzNNmeNI79HcQQ_zzHv--NzjASWW18DkPVQ8FVg/exec',
  email: '',
  publicKey: {"kty":"RSA","n":"q_8IgEalfGtybM55v45tA4dsWO6QzgYsk1hqEb8NElcrU5coie5fRQ-7B1mcKv6lVKJbfzJmUl5q6IcPQh7949C2LQVkzFBx8Vg0RseNOl56kEKjnlHoKPKpFrrNBGgIDFgpDVd2QNJma0VLbS53obaq1b_TbHykdRdDePvq8jgB8NF-HEoPF5bROdZmhnJAgZjt7CmSTeNHvJ8UYmJwlt--NnNPF8nLZKOqcnWDa7bhbehsmrH54TOSlCg3nRsL2trV94mUorsxPiGL9MoBzAEEF_3u3R4uD7b9kqaR29KB-jiYemh9KOIfKIU_PKvnlOBqIQ3nkUhUErXxN4BQ9jJAy1Jx6W4h474fE6LgvdO_m3pLIdzj9owRbd-aeElsK4kFKs3AY7UTluQhjxwKY2PFdDHdQpBFziKE1grny1AoiZOxiUMO-bHTT9mTL8X1WpXqoSW0fGpuj8zI-SlwLVaGU9sRpJ5LLmXDIzg1TkEOoMeGZhL9pign-wZD3tUb","e":"AQAB","alg":"RSA-OAEP-256","ext":true},
};
