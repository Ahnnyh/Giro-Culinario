document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-nova-receita');
  const avisoLogin = document.getElementById('aviso-login');
  const mensagemErro = document.getElementById('mensagem-erro');
  const botaoPublicar = document.getElementById('botao-publicar-receita');

  // Bloqueia o formulário se o usuário não estiver logado
  (async () => {
    try {
      const res = await fetch('/api/auth/usuario');
      const data = await res.json();
      if (!data.logado) {
        avisoLogin.style.display = 'block';
        form.style.display = 'none';
      }
    } catch (err) {
      console.error('Erro ao verificar login:', err);
    }
  })();

  // --- Listas dinâmicas (ingredientes / modo de preparo) ---
  function criarItemLista(lista, texto) {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.textContent = texto;

    const botaoRemover = document.createElement('button');
    botaoRemover.type = 'button';
    botaoRemover.className = 'remover-item';
    botaoRemover.innerHTML = '<i class="fas fa-times"></i>';
    botaoRemover.addEventListener('click', () => li.remove());

    li.appendChild(span);
    li.appendChild(botaoRemover);
    lista.appendChild(li);
  }

  function configurarListaDinamica(idInput, idBotao, idLista) {
    const input = document.getElementById(idInput);
    const botao = document.getElementById(idBotao);
    const lista = document.getElementById(idLista);

    function adicionar() {
      const texto = input.value.trim();
      if (!texto) return;
      criarItemLista(lista, texto);
      input.value = '';
      input.focus();
    }

    botao.addEventListener('click', adicionar);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        adicionar();
      }
    });
  }

  configurarListaDinamica('campo-novo-ingrediente', 'botao-add-ingrediente', 'lista-ingredientes');
  configurarListaDinamica('campo-novo-passo', 'botao-add-passo', 'lista-preparo');

  function textosDaLista(idLista) {
    return Array.from(document.getElementById(idLista).querySelectorAll('li span')).map(s => s.textContent);
  }

  // --- Preview de arquivos ---
  function configurarPreview(idInput, idPreview) {
    const input = document.getElementById(idInput);
    const preview = document.getElementById(idPreview);

    input.addEventListener('change', () => {
      const arquivo = input.files[0];
      preview.innerHTML = '';
      if (!arquivo) {
        preview.style.display = 'none';
        return;
      }

      if (arquivo.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(arquivo);
        video.controls = true;
        video.style.maxWidth = '200px';
        preview.appendChild(video);
      } else {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(arquivo);
        preview.appendChild(img);
      }
      preview.style.display = 'block';
    });
  }

  configurarPreview('campo-imagem', 'preview-imagem-principal');
  configurarPreview('campo-midia', 'preview-midia-preparo');

  // --- Envio do formulário ---
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    mensagemErro.style.display = 'none';

    const ingredientes = textosDaLista('lista-ingredientes');
    const preparo = textosDaLista('lista-preparo');

    if (!ingredientes.length) {
      return mostrarErro('Adicione ao menos um ingrediente.');
    }
    if (!preparo.length) {
      return mostrarErro('Adicione ao menos um passo do modo de preparo.');
    }

    const dados = new FormData();
    dados.append('nome', document.getElementById('campo-nome').value);
    dados.append('categoria', document.getElementById('campo-categoria').value);
    dados.append('tempo', document.getElementById('campo-tempo').value);
    dados.append('porcoes', document.getElementById('campo-porcoes').value);
    dados.append('ingredientes', JSON.stringify(ingredientes));
    dados.append('preparo', JSON.stringify(preparo));

    const arquivoImagem = document.getElementById('campo-imagem').files[0];
    if (arquivoImagem) dados.append('imagemPrincipal', arquivoImagem);

    const arquivoMidia = document.getElementById('campo-midia').files[0];
    if (arquivoMidia) dados.append('midiaPreparo', arquivoMidia);

    botaoPublicar.disabled = true;
    botaoPublicar.textContent = 'Publicando...';

    try {
      const resposta = await fetch('/api/receitas', {
        method: 'POST',
        body: dados
      });

      const resultado = await resposta.json();

      if (!resposta.ok) {
        return mostrarErro(resultado.message || 'Erro ao publicar a receita.');
      }

      window.location.href = `/receita/${resultado.id}`;
    } catch (err) {
      console.error('Erro ao publicar receita:', err);
      mostrarErro('Erro de conexão. Tente novamente.');
    } finally {
      botaoPublicar.disabled = false;
      botaoPublicar.textContent = 'Publicar Receita';
    }
  });

  function mostrarErro(texto) {
    mensagemErro.textContent = texto;
    mensagemErro.style.display = 'block';
    botaoPublicar.disabled = false;
    botaoPublicar.textContent = 'Publicar Receita';
  }
});
