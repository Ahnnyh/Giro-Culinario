/**
 * Preenche um container `.receitas-grid` com receitas vindas da API.
 * Controlado por atributos data- no próprio container:
 *
 *   <div class="receitas-grid" data-fonte="categoria" data-categoria="Brasileira"></div>
 *   <div class="receitas-grid" data-fonte="destaques"></div>
 *   <div class="receitas-grid" data-fonte="todas"></div>
 */
document.addEventListener('DOMContentLoaded', async () => {
  const grids = document.querySelectorAll('.receitas-grid[data-fonte]');
  if (!grids.length) return;

  for (const grid of grids) {
    const fonte = grid.dataset.fonte;
    let url = '/api/receitas';

    if (fonte === 'destaques') {
      url = '/api/receitas/destaques';
    } else if (fonte === 'categoria' && grid.dataset.categoria) {
      url = `/api/receitas?categoria=${encodeURIComponent(grid.dataset.categoria)}`;
    }

    try {
      const resposta = await fetch(url);
      const receitas = await resposta.json();

      grid.innerHTML = '';
      if (!receitas.length) {
        grid.innerHTML = '<p>Nenhuma receita encontrada.</p>';
        continue;
      }

      receitas.forEach(receita => grid.appendChild(criarCardReceita(receita)));

      ativarBotoesFavoritar(grid);
      await marcarFavoritosNoContainer(grid);
    } catch (erro) {
      console.error('Erro ao carregar receitas:', erro);
      grid.innerHTML = '<p>Não foi possível carregar as receitas agora.</p>';
    }
  }
});
