// header.js

document.addEventListener('DOMContentLoaded', async function () {

  // Verificar login do usuário
  const loginLink = document.getElementById('loginLink');
  const logoutLink = document.getElementById('logoutLink');
  const perfilDropdown = document.getElementById('perfilDropdown'); // páginas com "Meu Perfil" como dropdown
  const adicionarReceitaLink = document.getElementById('adicionarReceitaLink');
  const saudacao = document.getElementById('saudacaoUsuario'); // só existe no hero da Home

  try {
    const response = await fetch('/api/auth/usuario');
    const data = await response.json();

    if (data.logado) {
      sessionStorage.setItem('usuarioLogado', 'true');
      if (loginLink) loginLink.style.display = 'none';
      if (perfilDropdown) {
        perfilDropdown.style.display = 'inline-block';
      } else if (logoutLink) {
        // Páginas sem o dropdown (ex: perfil.html, Login, Cadastro) — alterna o Sair direto
        logoutLink.style.display = 'inline-block';
      }
      if (adicionarReceitaLink) adicionarReceitaLink.style.display = 'inline-block';
      if (saudacao) saudacao.textContent = `Olá, ${data.nome}!`;
    } else {
      sessionStorage.removeItem('usuarioLogado');
      if (loginLink) loginLink.style.display = 'inline-block';
      if (perfilDropdown) {
        perfilDropdown.style.display = 'none';
      } else if (logoutLink) {
        logoutLink.style.display = 'none';
      }
      if (adicionarReceitaLink) adicionarReceitaLink.style.display = 'none';
      if (saudacao) saudacao.textContent = '';
    }
  } catch (err) {
    console.error('Erro ao verificar login:', err);
  }

  // Logout
  if (logoutLink) {
    logoutLink.addEventListener('click', function (e) {
      e.preventDefault();
      fetch('/api/auth/logout')
        .then(() => {
          sessionStorage.removeItem('usuarioLogado');
          window.location.href = '/login';
        })
        .catch(err => {
          console.error('Erro ao sair:', err);
          alert('Erro ao sair.');
        });
    });
  }

  // Indicador de página atual no menu (considera links dentro de dropdowns também)
  const paginaAtual = window.location.pathname;
  const ehPaginaDeReceitas = paginaAtual.startsWith('/PaginaCulinarias') || paginaAtual.startsWith('/receita/');

  document.querySelectorAll('.menu-principal > ul > li').forEach(item => {
    const link = item.querySelector(':scope > a');
    if (!link) return;

    if (item.classList.contains('dropdown')) {
      const algumSubmenuEhPaginaAtual = Array.from(item.querySelectorAll('.submenu a'))
        .some(a => a.pathname === paginaAtual);
      if (algumSubmenuEhPaginaAtual || ehPaginaDeReceitas) {
        link.classList.add('ativo');
      }
    } else if (link.pathname === paginaAtual) {
      link.classList.add('ativo');
    }
  });
});
