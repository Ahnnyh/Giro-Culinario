document.addEventListener('DOMContentLoaded', () => {
  // =================== AVALIAÇÃO POR ESTRELAS ===================
  const estrelas = document.querySelectorAll('.estrela');
  const feedback = document.querySelector('.feedback-avaliacao');
  let estrelasSelecionadas = 0;

  estrelas.forEach((estrela, index) => {
    estrela.dataset.valor = index + 1;

    estrela.addEventListener('mouseover', () => {
      highlightStars(index + 1);
    });

    estrela.addEventListener('mouseout', () => {
      highlightStars(estrelasSelecionadas);
    });

    estrela.addEventListener('click', () => {
      estrelasSelecionadas = index + 1;
      highlightStars(estrelasSelecionadas);
      if (feedback) {
        feedback.textContent = `Você avaliou com ${estrelasSelecionadas} estrela${estrelasSelecionadas > 1 ? 's' : ''}. Obrigado!`;
      }
    });
  });

  function highlightStars(valor) {
    estrelas.forEach((estrela, i) => {
      estrela.classList.toggle('selecionada', i < valor);
      estrela.textContent = i < valor ? '★' : '☆';
    });
  }

  // =================== PREVIEW DA IMAGEM ===================
  document.getElementById("imagem-comentario").addEventListener("change", function () {
    const preview = document.getElementById("preview-imagem");
    const arquivo = this.files[0];

    if (arquivo) {
      const leitor = new FileReader();
      leitor.onload = function (e) {
        preview.innerHTML = `<img src="${e.target.result}" alt="Prévia da imagem" />`;
        preview.style.display = "block";
      };
      leitor.readAsDataURL(arquivo);
    } else {
      preview.innerHTML = "";
      preview.style.display = "none";
    }
  });

  // =================== BUSCAR COMENTÁRIOS ===================
  async function carregarComentarios() {
    const receitaId = document.querySelector('main')?.dataset.receitaId;
    const lista = document.getElementById('lista-comentarios');
    if (!receitaId || !lista) return;

    try {
      const userRes = await fetch('/api/auth/usuario');
      const userData = await userRes.json();
      const userId = userData.logado ? userData.id : null;

      const res = await fetch(`/api/comentarios/${receitaId}`);
      const comentarios = await res.json();

      lista.innerHTML = '';

      
comentarios.forEach(c => {
  const div = document.createElement('div');
  div.classList.add('comentario');

  const estrelasHTML = '★'.repeat(c.estrelas || 0) + '☆'.repeat(5 - (c.estrelas || 0));

  div.innerHTML = `
    <div class="cabecalho-comentario">
      <span class="autor-comentario">${c.User?.nome || 'Usuário'}</span>
      ${
        userId === c.userId
          ? `<button class="btn-excluir" data-id="${c.id}" title="Excluir">
               <i class="fas fa-trash-alt"></i>
             </button>`
          : ''
      }
    </div>
    <div class="avaliacao-comentario">
      <span class="estrelas-comentario">${estrelasHTML}</span>
      <span class="numero-estrelas">(${c.estrelas || 0})</span>
    </div>
    <p class="texto-comentario">${c.texto}</p>
    <span class="data-comentario">${new Date(c.createdAt).toLocaleDateString()}</span>
  `;

  lista.appendChild(div);
});


      // Excluir comentário
      document.querySelectorAll('.btn-excluir').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          if (confirm('Deseja excluir?')) {
            const delRes = await fetch(`/api/comentarios/${id}`, { method: 'DELETE' });
            const data = await delRes.json();
            if (data.success) btn.parentElement.remove();
          }
        });
      });

    } catch (e) {
      console.error('Erro ao carregar comentários', e);
    }
  }

  carregarComentarios(); // Chamada inicial ao carregar a página

  // =================== ENVIAR COMENTÁRIO ===================
  document.getElementById("form-comentario").addEventListener("submit", async function (e) {
    e.preventDefault();

    const receitaId = document.querySelector('main')?.dataset.receitaId;
    const comentario = document.getElementById("comentario-usuario").value.trim();
    if (!comentario || !receitaId) return;

    const userRes = await fetch('/api/auth/usuario');
    const userData = await userRes.json();
    if (!userData.logado) {
      alert('Você precisa estar logado para comentar.');
      return window.location.href = "/login";
    }

    const res = await fetch('/api/comentarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
         texto: comentario,
  estrelas: estrelasSelecionadas,
  receitaId
      })
    });

    const data = await res.json();
    if (data.success) {
      document.getElementById("comentario-usuario").value = '';
      document.getElementById("preview-imagem").style.display = "none";
      estrelasSelecionadas = 0;
      highlightStars(0);
      carregarComentarios();
    } else {
      alert('Erro ao enviar comentário.');
    }
  });

}); // Fim do DOMContentLoaded

// =================== CURTIR E DESCURTIR (visuais apenas) ===================
function curtirComentario(botao) {
  const contador = botao.querySelector(".contador-like");
  contador.textContent = parseInt(contador.textContent) + 1;
}

function descurtirComentario(botao) {
  const contador = botao.querySelector(".contador-like");
  contador.textContent = parseInt(contador.textContent) + 1;
}
