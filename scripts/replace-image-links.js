/**
 * Lê scripts/image-map.json (gerado pelo migrate-images-to-imagekit.js)
 * e substitui, em todo o projeto (incluindo scripts/receitas-seed.json),
 * qualquer referência a "IMG/<arquivo>" (com qualquer prefixo: ../../IMG/, /IMG/, IMG/)
 * pela URL do ImageKit.
 *
 * Uso:
 *   node scripts/replace-image-links.js         → aplica as substituições
 *   node scripts/replace-image-links.js --dry-run → só mostra o que mudaria, sem gravar
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const MAP_PATH = path.join(__dirname, 'image-map.json');
const DRY_RUN = process.argv.includes('--dry-run');

// Pastas que nunca devem ser varridas
const PASTAS_IGNORADAS = new Set(['node_modules', '.git', 'IMG']);
const ARQUIVOS_IGNORADOS = new Set(['image-map.json']); // o próprio mapa não deve ser reescrito
const EXTENSOES_ALVO = new Set(['.html', '.css', '.js', '.json']);

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function listarArquivos(dir, resultado = []) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (PASTAS_IGNORADAS.has(item.name) || ARQUIVOS_IGNORADOS.has(item.name)) continue;
    const caminho = path.join(dir, item.name);
    if (item.isDirectory()) {
      listarArquivos(caminho, resultado);
    } else if (EXTENSOES_ALVO.has(path.extname(item.name))) {
      resultado.push(caminho);
    }
  }
  return resultado;
}

function main() {
  if (!fs.existsSync(MAP_PATH)) {
    console.error(`❌ Não encontrei ${MAP_PATH}. Rode antes: node scripts/migrate-images-to-cloudinary.js`);
    process.exit(1);
  }

  const mapa = JSON.parse(fs.readFileSync(MAP_PATH, 'utf-8'));
  const arquivosDoProjeto = listarArquivos(ROOT);

  // Ordena os nomes por tamanho decrescente para evitar que um nome
  // que é substring de outro (ex: "Pizza.jpg" dentro de "Pizza.jpg.bak") seja trocado errado.
  const nomesArquivo = Object.keys(mapa).sort((a, b) => b.length - a.length);
  const usados = new Set();
  let totalSubstituicoes = 0;

  for (const arquivoDoProjeto of arquivosDoProjeto) {
    let conteudo = fs.readFileSync(arquivoDoProjeto, 'utf-8');
    let conteudoOriginal = conteudo;
    let mudouEsseArquivo = false;

    for (const nomeArquivo of nomesArquivo) {
      const url = mapa[nomeArquivo];
      // Casa qualquer prefixo de caminho terminando em "IMG/" + o nome exato do arquivo
      const regex = new RegExp(`(?:[./]*IMG/)${escapeRegex(nomeArquivo)}`, 'g');

      if (regex.test(conteudo)) {
        conteudo = conteudo.replace(regex, url);
        usados.add(nomeArquivo);
        mudouEsseArquivo = true;
      }
    }

    if (mudouEsseArquivo) {
      const nOcorrencias = (conteudoOriginal.match(/IMG\//g) || []).length -
                            (conteudo.match(/IMG\//g) || []).length;
      totalSubstituicoes += nOcorrencias;
      console.log(`${DRY_RUN ? '[dry-run] ' : ''}✏️  ${path.relative(ROOT, arquivoDoProjeto)} (${nOcorrencias} ocorrência(s))`);

      if (!DRY_RUN) {
        fs.writeFileSync(arquivoDoProjeto, conteudo, 'utf-8');
      }
    }
  }

  const naoUsados = nomesArquivo.filter(n => !usados.has(n));

  console.log(`\nTotal de substituições: ${totalSubstituicoes}`);
  if (naoUsados.length) {
    console.log(`\n⚠️  ${naoUsados.length} imagem(ns) do ImageKit não foram referenciadas em nenhum arquivo (upload feito, mas sem uso encontrado):`);
    naoUsados.forEach(n => console.log(`   - ${n}`));
  }

  if (DRY_RUN) {
    console.log('\nNenhum arquivo foi alterado (--dry-run). Rode sem essa flag para aplicar de verdade.');
  } else {
    console.log('\n✅ Substituições aplicadas. Revise com "git diff" antes de commitar.');
    console.log('\n⚠️  IMPORTANTE: se scripts/receitas-seed.json apareceu na lista acima,');
    console.log('   as receitas já salvas no banco AINDA apontam para os caminhos antigos.');
    console.log('   Rode: node scripts/seed-receitas.js   para atualizar o banco com as novas URLs.');
    console.log('\nDepois de confirmar que tudo funciona, você pode apagar a pasta IMG/ do projeto.');
  }
}

main();
