const ImageKit = require('imagekit');

let imagekit = null;

// Só inicializa se as credenciais estiverem configuradas — evita derrubar o
// servidor inteiro em ambientes (ex: dev local sem upload) onde ainda não foram definidas.
if (process.env.IMAGEKIT_PUBLIC_KEY && process.env.IMAGEKIT_PRIVATE_KEY && process.env.IMAGEKIT_URL_ENDPOINT) {
  imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
  });
} else {
  console.warn('⚠️  Variáveis do ImageKit não configuradas — upload de novas receitas ficará indisponível.');
}

module.exports = imagekit;
