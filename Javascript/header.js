// header.js

document.addEventListener('DOMContentLoaded', async function () {
    const searchBtn = document.querySelector('.barra-pesquisa button');
    const searchInput = document.querySelector('.barra-pesquisa input');
  
    // Criar container dos resultados
    const resultadosContainer = document.createElement('div');
    resultadosContainer.id = 'resultados-busca';
    resultadosContainer.className = 'resultados-busca-container';
    document.querySelector('header').appendChild(resultadosContainer);
  
    // Busca ao clicar no botão
    if (searchBtn) {
      searchBtn.addEventListener('click', buscarReceitas);
    }
  
    // Busca ao pressionar Enter
    if (searchInput) {
      searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
          buscarReceitas();
        }
      });
  
      // Busca em tempo real
      searchInput.addEventListener('input', function () {
        if (searchInput.value.length > 2) {
          buscarReceitas();
        } else {
          resultadosContainer.style.display = 'none';
        }
      });
    }
  
    // Função de busca
    async function buscarReceitas() {
      const query = searchInput.value.trim();
      if (query) {
        try {
          const response = await fetch(`/api/receitas/buscar?termo=${encodeURIComponent(query)}`);
          const receitas = await response.json();
          exibirResultados(receitas);
        } catch (error) {
          console.error('Erro na busca:', error);
          resultadosContainer.innerHTML = '<p>Erro ao buscar receitas. Tente novamente.</p>';
        }
      }
    }
  
    // Exibição dos resultados da busca
    function exibirResultados(receitas) {
      resultadosContainer.innerHTML = '';
  
      if (receitas.length === 0) {
        resultadosContainer.innerHTML = '<p>Nenhuma receita encontrada. Tente outro termo.</p>';
        resultadosContainer.style.display = 'block';
        return;
      }
  
      receitas.forEach((receita) => {
        const card = document.createElement('a');
        card.href = `receita.html?id=${receita._id}`;
        card.className = 'resultado-item';
        card.innerHTML = `
          <div class="resultado-imagem" style="background-image: url('${receita.imagem || 'IMG/default.jpg'}')"></div>
          <div class="resultado-info">
              <h4>${receita.titulo}</h4>
              <p>${receita.categoria} • ${receita.tempoPreparo} min</p>
          </div>`;
        resultadosContainer.appendChild(card);
      });
  
      resultadosContainer.style.display = 'block';
    }
  
    // Fechar resultados ao clicar fora
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.barra-pesquisa') && !e.target.closest('#resultados-busca')) {
        resultadosContainer.style.display = 'none';
      }
    });
  
    // Verificar login do usuário
    const loginLink = document.getElementById('loginLink');
    const logoutLink = document.getElementById('logoutLink');
    const perfilLink = document.getElementById('perfilLink');
    const saudacao = document.getElementById('saudacaoUsuario');
  
    try {
      const response = await fetch('/api/auth/usuario');
      const data = await response.json();
  
      if (data.logado) {
        sessionStorage.setItem('usuarioLogado', 'true');
        if (loginLink) loginLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'inline-block';
        if (perfilLink) perfilLink.style.display = 'inline-block';
        if (saudacao) saudacao.textContent = `Olá, ${data.nome}!`;
      } else {
        sessionStorage.removeItem('usuarioLogado');
        if (loginLink) loginLink.style.display = 'inline-block';
        if (logoutLink) logoutLink.style.display = 'none';
        if (perfilLink) perfilLink.style.display = 'none';
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
  });
  