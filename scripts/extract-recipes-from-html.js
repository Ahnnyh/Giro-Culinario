/**
 * Lê Backend/receitas.json (lista resumida) + as 20 páginas HTML de receita
 * existentes e extrai o conteúdo completo (ingredientes, modo de preparo,
 * vídeo/gif de preparo) de cada uma, gerando scripts/receitas-seed.json.
 *
 * Esse arquivo gerado é o que o scripts/seed-receitas.js usa pra popular o banco.
 *
 * Uso:
 *   npm install cheerio --save-dev
 *   node scripts/extract-recipes-from-html.js
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const ROOT = path.join(__dirname, '..');
const RECEITAS_JSON = path.join(ROOT, 'Backend', 'receitas.json');
const OUTPUT = path.join(__dirname, 'receitas-seed.json');

// IDs que aparecem na seção "Receitas em Destaque" da Home atual
const DESTAQUES = ['pao-de-queijo', 'arancini-de-queijo', 'pad-thai-tradicional', 'falafel-assado'];

function extrairCategoria(linkOriginal) {
  // "../TodasReceitas/Brasileira/brigadeiro.html" -> "Brasileira"
  const partes = linkOriginal.split('/');
  return partes[partes.length - 2];
}

function encontrarArquivoHtml(categoria, idReceita, nomeArquivoOriginal) {
  const pastaCategoria = path.join(ROOT, 'TodasReceitas', categoria);
  const candidatos = fs.readdirSync(pastaCategoria);

  // Tenta pelo nome exato indicado no receitas.json primeiro
  if (candidatos.includes(nomeArquivoOriginal)) {
    return path.join(pastaCategoria, nomeArquivoOriginal);
  }

  // Fallback: procura um arquivo cujo nome (sem extensão, normalizado) combine com o id da receita
  const idNormalizado = idReceita.replace(/-/g, '');
  const encontrado = candidatos.find(arq => {
    const semExtensao = arq.replace(/\.html$/, '').replace(/[_-]/g, '');
    return semExtensao.toLowerCase() === idNormalizado.toLowerCase();
  });

  return encontrado ? path.join(pastaCategoria, encontrado) : null;
}

function extrairDadosDaPagina(caminhoHtml) {
  const html = fs.readFileSync(caminhoHtml, 'utf-8');
  const $ = cheerio.load(html);

  const ingredientes = $('.subcard.ingredientes li')
    .map((_, el) => $(el).text().trim())
    .get();

  const preparo = $('.subcard.preparo li')
    .map((_, el) => $(el).text().replace(/\s+/g, ' ').trim())
    .get();

  const videoEl = $('.gif-container video').first();
  const imgGifEl = $('.gif-container img').first();

  let midiaPreparo = null;
  let tipoMidiaPreparo = null;

  if (videoEl.length) {
    midiaPreparo = videoEl.attr('src');
    tipoMidiaPreparo = 'video';
  } else if (imgGifEl.length) {
    midiaPreparo = imgGifEl.attr('src');
    tipoMidiaPreparo = 'gif';
  }

  // Normaliza caminho relativo (../../IMG/x) para caminho a partir da raiz (IMG/x)
  if (midiaPreparo) {
    midiaPreparo = midiaPreparo.replace(/^(\.\.\/)+/, '');
  }

  return { ingredientes, preparo, midiaPreparo, tipoMidiaPreparo };
}

function main() {
  const listaResumida = JSON.parse(fs.readFileSync(RECEITAS_JSON, 'utf-8'));
  const receitasCompletas = [];
  const avisos = [];

  for (const item of listaResumida) {
    const categoria = extrairCategoria(item.link);
    const nomeArquivoOriginal = path.basename(item.link);
    const caminhoHtml = encontrarArquivoHtml(categoria, item.id, nomeArquivoOriginal);

    if (!caminhoHtml) {
      avisos.push(`⚠️  Não encontrei o arquivo HTML de "${item.id}" (esperado: ${item.link})`);
      continue;
    }

    const { ingredientes, preparo, midiaPreparo, tipoMidiaPreparo } = extrairDadosDaPagina(caminhoHtml);

    if (!ingredientes.length || !preparo.length) {
      avisos.push(`⚠️  "${item.id}" ficou com ingredientes ou preparo vazio — confira ${caminhoHtml}`);
    }

    receitasCompletas.push({
      id: item.id,
      nome: item.nome,
      categoria,
      imagem: item.imagem.replace(/^(\.\.\/)+/, ''),
      tempo: item.tempo || null,
      porcoes: item.porcoes || null,
      ingredientes,
      preparo,
      midiaPreparo,
      tipoMidiaPreparo,
      destaque: DESTAQUES.includes(item.id)
    });
  }

  fs.writeFileSync(OUTPUT, JSON.stringify(receitasCompletas, null, 2), 'utf-8');

  console.log(`✅ ${receitasCompletas.length} receita(s) extraída(s) com sucesso.`);
  console.log(`   Salvo em: ${OUTPUT}`);

  if (avisos.length) {
    console.log(`\n${avisos.length} aviso(s):`);
    avisos.forEach(a => console.log('  ' + a));
  }

  console.log(`\nRevise o arquivo gerado e depois rode: node scripts/seed-receitas.js`);
}

main();
