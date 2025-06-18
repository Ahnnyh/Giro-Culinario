document.addEventListener('DOMContentLoaded', function () {
  // ======== SUBMISSÃO DO FORMULÁRIO DE CADASTRO ========
  const formCadastro = document.getElementById('formCadastro');

  if (formCadastro) {
    formCadastro.addEventListener('submit', async function (e) {
      e.preventDefault(); // Impede recarregamento da página

      // Coleta os dados do formulário
      const nome = document.getElementById('nome').value;
      const email = document.getElementById('email-cadastro').value;
      const senha = document.getElementById('senha-cadastro').value;


      try {
        // Envia os dados via fetch para o backend
        const response = await fetch('/api/auth/cadastro', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ nome, email, senha })
        });

        const data = await response.json();

        if (data.success) {
          // Armazena estado de login na session e redireciona
          sessionStorage.setItem('usuarioLogado', 'true');
          window.location.href = data.redirect;
        } else {
          alert(data.message || 'Erro no cadastro');
        }
      } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor');
      }
    });
  }

  // ======== MOSTRAR / ESCONDER SENHA =========
  function toggleSenha(inputId, toggleId) {
    const input = document.getElementById(inputId);
    const toggle = document.getElementById(toggleId);

    if (input && toggle) {
      toggle.addEventListener('click', () => {
        const icon = toggle.querySelector('i');

        if (input.type === 'password') {
          input.type = 'text';
          icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
          input.type = 'password';
          icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
      });
    }
  }

  // Ativa o toggle para os dois campos de senha
  toggleSenha('senha-cadastro', 'toggleSenhaCadastro');
  toggleSenha('confirmar-senha', 'toggleConfirmarSenha');
});
