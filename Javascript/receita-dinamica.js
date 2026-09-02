/**
 * Preenche a página TodasReceitas/receita.html com os dados da receita
 * indicada na URL (/receita/:id), buscados via API.
 */
document.addEventListener('DOMContentLoaded', async () => {
  const main = document.querySelector('main');

  // Extrai o id tanto de /receita/algum-id (URL limpa, servida pelo backend)
  // quanto de receita.html?id=algum-id (acesso direto ao arquivo estático).
  const partesCaminho = window.location.pathname.split('/').filter(Boolean);
  const idPelaRota = partesCaminho[0] === 'receita' ? partesCaminho[1] : null;
  const idPelaQuery = new URLSearchParams(window.location.search).get('id');
  const receitaId = idPelaRota || idPelaQuery;

  if (!receitaId) {
    document.getElementById('receita-titulo').textContent = 'Receita não especificada';
    return;
  }

  // Disponibiliza o id imediatamente para script.js (comentários/avaliação),
  // sem precisar esperar a resposta da API.
  main.dataset.receitaId = receitaId;

  try {
    const resposta = await fetch(`/api/receitas/${receitaId}`);
    if (!resposta.ok) {
      document.getElementById('receita-titulo').textContent = 'Receita não encontrada';
      return;
    }

    const receita = await resposta.json();

    document.getElementById('titulo-pagina').textContent = `${receita.nome} | Giro Culinário`;
    document.getElementById('receita-titulo').textContent = receita.nome;

    const imagemPrincipal = document.getElementById('receita-imagem-principal');
    imagemPrincipal.src = resolverCaminhoMidia(receita.imagem);
    imagemPrincipal.alt = receita.nome;

    const listaIngredientes = document.getElementById('receita-ingredientes');
    listaIngredientes.innerHTML = receita.ingredientes.map(item => `<li>${item}</li>`).join('');

    const listaPreparo = document.getElementById('receita-preparo');
    listaPreparo.innerHTML = receita.preparo.map(passo => `<li>${passo}</li>`).join('');

    const midiaContainer = document.getElementById('receita-midia-container');
    if (receita.midiaPreparo) {
      const src = resolverCaminhoMidia(receita.midiaPreparo);
      if (receita.tipoMidiaPreparo === 'video') {
        midiaContainer.insertAdjacentHTML('beforeend',
          `<video src="${src}" class="gif-cozinhar" autoplay loop muted playsinline aria-label="Preparo de ${receita.nome}"></video>`);
      } else {
        midiaContainer.insertAdjacentHTML('beforeend',
          `<img src="${src}" class="gif-cozinhar" alt="Preparo de ${receita.nome}">`);
      }
    } else {
      midiaContainer.style.display = 'none';
    }
  } catch (erro) {
    console.error('Erro ao carregar receita:', erro);
    document.getElementById('receita-titulo').textContent = 'Erro ao carregar a receita';
  }
});
