document.addEventListener('DOMContentLoaded', function () {

  // === LOGIN ===
  const formLogin = document.querySelector('.formulario-login');

  if (formLogin) {
    formLogin.addEventListener('submit', async function (e) {
      e.preventDefault(); // Evita recarregar a página

      const email = document.getElementById('email').value.trim();
      const senha = document.getElementById('senha').value.trim();
      const lembrar = document.querySelector('input[name="lembrar"]').checked;

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include', // Mantém a sessão
          body: JSON.stringify({ email, senha, lembrar })
        });

        const data = await response.json();

        if (data.success) {
          sessionStorage.setItem('usuarioLogado', 'true');
          window.location.href = data.redirect || '/home';
        } else {
          alert(data.message || 'Email ou senha incorretos.');
        }
      } catch (err) {
        console.error('Erro na requisição de login:', err);
        alert('Erro ao conectar com o servidor.');
      }
    });
  }

  // === MOSTRAR/ESCONDER SENHA ===
  const senhaInput = document.getElementById('senha');
  const toggleSenha = document.getElementById('toggleSenha');

  if (senhaInput && toggleSenha) {
    toggleSenha.addEventListener('click', () => {
      const icon = toggleSenha.querySelector('i');
      const isPassword = senhaInput.type === 'password';
      senhaInput.type = isPassword ? 'text' : 'password';
      icon.classList.toggle('fa-eye');
      icon.classList.toggle('fa-eye-slash');
    });
  }

  // === RECUPERAÇÃO DE SENHA ===
  const btnAbrir = document.getElementById('abrirRecuperacao');
  const formRecuperacao = document.getElementById('form-recuperacao');
  const btnEnviar = document.getElementById('enviarRecuperacao');
  const msg = document.getElementById('mensagemRecuperacao');
  const inputEmail = document.getElementById('emailRecuperacao');

  if (btnAbrir && formRecuperacao) {
    btnAbrir.addEventListener('click', (e) => {
      e.preventDefault();
      formRecuperacao.style.display = 'block';
      msg.textContent = '';
      inputEmail.value = '';
      inputEmail.focus();
    });
  }

  if (btnEnviar && inputEmail) {
    btnEnviar.addEventListener('click', () => {
      const email = inputEmail.value.trim();
      if (!email) {
        msg.textContent = 'Por favor, insira um e-mail válido.';
        msg.style.color = 'red';
        return;
      }

      // Simulação de envio (você pode integrar com backend real depois)
      msg.style.color = 'green';
      msg.textContent = 'Se este e-mail estiver cadastrado, você receberá um link para redefinir sua senha.';
    });
  }

});
