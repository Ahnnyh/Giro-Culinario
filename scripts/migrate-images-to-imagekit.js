/**
 * Faz upload de todas as imagens/gifs/vídeos da pasta IMG/ para o ImageKit
 * e gera um arquivo scripts/image-map.json com o mapeamento:
 *   { "nome-original-do-arquivo.jpg": "https://ik.imagekit.io/.../arquivo.jpg" }
 *
 * Uso:
 *   1) npm install imagekit --save-dev
 *   2) Defina no seu .env:
 *        IMAGEKIT_PUBLIC_KEY=xxxx
 *        IMAGEKIT_PRIVATE_KEY=xxxx
 *        IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/xxxx
 *   3) node scripts/migrate-images-to-imagekit.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const ImageKit = require('imagekit');

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

const IMG_DIR = path.join(__dirname, '..', 'IMG');
const OUTPUT_MAP = path.join(__dirname, 'image-map.json');
const IMAGEKIT_FOLDER = '/giro-culinario';

// Transforma "Pão de queijo.jpg" em "pao-de-queijo.jpg" (sem acento, sem espaço, minúsculo)
function slugify(filename) {
  const ext = path.extname(filename);
  const nameOnly = filename.slice(0, -ext.length || undefined);
  const slug = nameOnly
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug + ext.toLowerCase();
}

async function migrar() {
  if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
    console.error('❌ Configure IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY e IMAGEKIT_URL_ENDPOINT no .env antes de rodar.');
    process.exit(1);
  }

  const arquivos = fs.readdirSync(IMG_DIR).filter(f => !f.startsWith('.'));
  const mapa = {};
  let ok = 0, falhas = 0;

  console.log(`Encontrados ${arquivos.length} arquivos em IMG/. Iniciando upload...\n`);

  for (const arquivo of arquivos) {
    const caminhoCompleto = path.join(IMG_DIR, arquivo);
    const nomeNovo = slugify(arquivo);

    try {
      const buffer = fs.readFileSync(caminhoCompleto);
      const resultado = await imagekit.upload({
        file: buffer,
        fileName: nomeNovo,
        folder: IMAGEKIT_FOLDER,
        useUniqueFileName: false
      });

      mapa[arquivo] = resultado.url;
      ok++;
      console.log(`✅ ${arquivo} → ${resultado.url}`);
    } catch (erro) {
      falhas++;
      console.error(`❌ Falha ao subir ${arquivo}:`, erro.message);
    }
  }

  fs.writeFileSync(OUTPUT_MAP, JSON.stringify(mapa, null, 2), 'utf-8');

  console.log(`\nConcluído: ${ok} enviados, ${falhas} falharam.`);
  console.log(`Mapa salvo em: ${OUTPUT_MAP}`);
  console.log(`\nPróximo passo: node scripts/replace-image-links.js --dry-run`);
}

migrar();

