/**
 * Componente compartilhado de card de receita.
 * Usado por: Home, páginas de categoria, Explorar, e perfil (favoritos).
 * Precisa ser incluído ANTES de qualquer script que chame essas funções.
 */

/**
 * Resolve o caminho de uma imagem/vídeo vindo da API pra funcionar em qualquer página,
 * não importa a profundidade de pastas, e continuar funcionando depois da migração pra CDN:
 *   - "IMG/Brigadeiro.jpg"                 -> "/IMG/Brigadeiro.jpg" (raiz do site)
 *   - "https://ik.imagekit.io/.../x.jpg"   -> inalterado (URL absoluta do CDN)
 */
function resolverCaminhoMidia(caminho) {
  if (!caminho) return '';
  if (/^https?:\/\//.test(caminho)) return caminho;
  return '/' + caminho.replace(/^\/+/, '');
}

// Cria o elemento <article class="receita-card"> a partir dos dados vindos da API.
function criarCardReceita(receita) {
  const card = document.createElement('article');
  card.className = 'receita-card';
  card.setAttribute('data-id', receita.id);
  card.innerHTML = `
    <div class="receita-imagem" style="background-image: url('${resolverCaminhoMidia(receita.imagem)}');">
      <span class="favoritar-btn"><i class="far fa-heart"></i></span>
    </div>
    <div class="receita-info">
      <h3>${receita.nome}</h3>
      <div class="meta-info">
        <span><i class="far fa-clock"></i> ${receita.tempo || ''}</span>
        <span><i class="fas fa-utensils"></i> ${receita.porcoes || ''}</span>
      </div>
      <a href="/receita/${receita.id}" class="btn-secondary">Ver Receita</a>
    </div>
  `;
  return card;
}

// Marca como favoritados os cards, dentro de `container`, cujo id está nos favoritos do usuário logado.
async function marcarFavoritosNoContainer(container) {
  try {
    const res = await fetch('/api/favoritos', { credentials: 'include' });
    if (!res.ok) return; // não logado, ou erro — cards ficam como "não favoritado"
    const favoritos = await res.json();
    favoritos.forEach(fav => {
      const card = container.querySelector(`.receita-card[data-id="${fav.receitaId}"]`);
      if (!card) return;
      const btn = card.querySelector('.favoritar-btn');
      if (btn) {
        btn.classList.add('favoritado');
        btn.innerHTML = '<i class="fas fa-heart"></i>';
      }
    });
  } catch (err) {
    console.error('Erro ao marcar favoritos:', err);
  }
}

// Ativa o clique de favoritar/desfavoritar em todo .favoritar-btn dentro de `container`.
// `aoRemover(card)`, se passado, é chamado quando uma receita é desfavoritada (útil na tela de perfil, pra remover o card da lista).
function ativarBotoesFavoritar(container, aoRemover) {
  container.querySelectorAll('.favoritar-btn').forEach(btn => {
    if (btn.dataset.ativado) return; // evita duplicar o listener se a função for chamada mais de uma vez
    btn.dataset.ativado = 'true';

    btn.addEventListener('click', async function (e) {
      e.stopPropagation();
      e.preventDefault();
      const card = this.closest('.receita-card');
      const receitaId = card.getAttribute('data-id');

      try {
        if (this.classList.contains('favoritado')) {
          const res = await fetch(`/api/favoritos/${receitaId}`, { method: 'DELETE' });
          const data = await res.json();
          if (data.success) {
            this.classList.remove('favoritado');
            this.innerHTML = '<i class="far fa-heart"></i>';
            if (aoRemover) aoRemover(card);
          } else {
            alert('Erro ao remover dos favoritos.');
          }
        } else {
          const res = await fetch('/api/favoritos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ receitaId })
          });
          const data = await res.json();
          if (data.success) {
            this.classList.add('favoritado');
            this.innerHTML = '<i class="fas fa-heart"></i>';
          } else {
            alert('Você precisa estar logado para favoritar receitas.');
          }
        }
      } catch (err) {
        console.error('Erro ao favoritar/desfavoritar:', err);
      }
    });
  });
}
