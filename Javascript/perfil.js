document.addEventListener('DOMContentLoaded', async () => {
  const nomeInput = document.getElementById('nomeUsuario');
  const emailInput = document.getElementById('emailUsuario');
  const editarBtn = document.getElementById('editarDadosBtn');
  const salvarBtn = document.getElementById('salvarDadosBtn');

// FAVORITOS - carregar do backend
const listaFavoritos = document.getElementById('listaFavoritos');
const nenhumFavorito = document.getElementById('nenhumFavorito');

try {
  console.log('🔄 Buscando favoritos do backend...');
  const res = await fetch('/api/favoritos', { credentials: 'include' });
  const favoritos = await res.json();
  console.log('✅ Favoritos recebidos:', favoritos);

  if (!favoritos || favoritos.length === 0) {
    console.log('ℹ️ Nenhum favorito encontrado.');
    nenhumFavorito.style.display = 'block';
  } else {
    nenhumFavorito.style.display = 'none';

    // Ordenar por mais recente
    favoritos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    console.log('📦 Carregando dados das receitas...');
    const resReceitas = await fetch('/api/receitas');
    const receitasInfo = await resReceitas.json();

    favoritos.forEach(data => {
      const receita = receitasInfo.find(r => r.id === data.receitaId);
      if (!receita) {
        console.warn(`⚠️ Receita com ID "${data.receitaId}" não encontrada`);
        return;
      }

      const card = criarCardReceita(receita);
      listaFavoritos.appendChild(card);

      // No perfil, o coração já começa preenchido (é uma lista só de favoritos)
      card.querySelector('.favoritar-btn').classList.add('favoritado');
      card.querySelector('.favoritar-btn').innerHTML = '<i class="fas fa-heart"></i>';
    });

    ativarBotoesFavoritar(listaFavoritos, (card) => {
      card.remove();
      if (listaFavoritos.children.length === 0) {
        nenhumFavorito.style.display = 'block';
      }
    });
  }
} catch (err) {
  console.error('❌ Erro ao carregar favoritos:', err);
  nenhumFavorito.style.display = 'block';
}

  
// Carregar dados do usuário
  try {
    const respostaUsuario = await fetch('/api/auth/usuario', {
      credentials: 'include'
    });
    const dataUsuario = await respostaUsuario.json();

    if (!dataUsuario.logado) {
      window.location.href = '/login';
      return;
    }

    nomeInput.value = dataUsuario.nome;
    emailInput.value = dataUsuario.email;
    document.getElementById('logoutLink').style.display = 'inline';
    document.getElementById('loginLink').style.display = 'none';
  } catch (err) {
    console.error(err);
    alert('Erro ao carregar dados do usuário.');
    window.location.href = '/login';
  }

  // Habilitar edição
  editarBtn.addEventListener('click', () => {
    nomeInput.disabled = false;
    emailInput.disabled = false;
    editarBtn.style.display = 'none';
    salvarBtn.style.display = 'inline';
  });

  // Salvar dados atualizados
  salvarBtn.addEventListener('click', async () => {
    const nome = nomeInput.value.trim();
    const email = emailInput.value.trim();

    try {
      const resposta = await fetch('/api/auth/atualizar-dados', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email }),
        credentials: 'include'
      });

      const data = await resposta.json();
      if (data.success) {
        alert('Dados atualizados com sucesso!');
        nomeInput.disabled = true;
        emailInput.disabled = true;
        salvarBtn.style.display = 'none';
        editarBtn.style.display = 'inline';
      } else {
        alert(data.message || 'Erro ao atualizar dados.');
      }
    } catch (err) {
      alert('Erro ao salvar alterações.');
    }
  });

// Mostrar/esconder formulário de alterar senha
const mostrarAlterarSenhaBtn = document.getElementById('mostrarAlterarSenhaBtn');
const formAlterarSenha = document.getElementById('formAlterarSenha');

mostrarAlterarSenhaBtn.addEventListener('click', () => {
  if (formAlterarSenha.style.display === 'none') {
    formAlterarSenha.style.display = 'flex'; // ou 'block' se preferir
    formAlterarSenha.scrollIntoView({ behavior: 'smooth' }); // rola até o campo suavemente
  } else {
    formAlterarSenha.style.display = 'none';
  }
});


  // Alterar senha
  document.getElementById('alterarSenhaBtn').addEventListener('click', async () => {
    const senhaAtual = document.getElementById('senhaAtual').value;
    const novaSenha = document.getElementById('novaSenha').value;
    const confirmarNovaSenha = document.getElementById('confirmarNovaSenha').value;
    const msgErro = document.getElementById('mensagemErro');
    const msgSucesso = document.getElementById('mensagemSucesso');

    msgErro.textContent = '';
    msgSucesso.textContent = '';

    if (novaSenha !== confirmarNovaSenha) {
      msgErro.textContent = 'As senhas não coincidem.';
      return;
    }

    try {
      const resposta = await fetch('/api/auth/alterar-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senhaAtual, novaSenha }),
        credentials: 'include'
      });

      const data = await resposta.json();
      if (data.success) {
        msgSucesso.textContent = 'Senha alterada com sucesso.';
        document.getElementById('senhaAtual').value = '';
        document.getElementById('novaSenha').value = '';
        document.getElementById('confirmarNovaSenha').value = '';
      } else {
        msgErro.textContent = data.message || 'Erro ao alterar senha.';
      }
    } catch (err) {
      msgErro.textContent = 'Erro ao alterar senha.';
    }
  });
});
