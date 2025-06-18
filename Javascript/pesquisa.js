const todasReceitas = [];

async function carregarReceitas() {
  try {
    const resposta = await fetch('http://localhost:3000/v1/receitas');
    const receitas = await resposta.json();
    todasReceitas.length = 0; // limpa caso já tenha algo
    todasReceitas.push(...receitas);
  } catch (erro) {
    console.error("Erro ao carregar receitas:", erro);
  }
}

function criarResultadoHTML(receita) {
  return `
    <a href="${receita.link}" class="resultado-item" target="_blank" rel="noopener noreferrer">
      <div class="resultado-imagem" style="background-image: url('${receita.imagem}')"></div>
      <div class="resultado-info">
        <h4>${receita.nome}</h4>
        <p>${receita.tempo} - ${receita.porcoes}</p>
      </div>
    </a>
  `;
}

function configurarBusca() {
  const input = document.getElementById('buscaReceitas');
  const container = document.getElementById('resultadoBusca');

  input.addEventListener('input', () => {
    const termo = input.value.toLowerCase().trim();
  
    if (!termo) {
      container.innerHTML = "";
      container.style.display = "none";
      return;
    }
  
    const resultados = todasReceitas
      .filter(receita => receita.nome.toLowerCase().includes(termo))
      .sort((a, b) => {
        const nomeA = a.nome.toLowerCase();
        const nomeB = b.nome.toLowerCase();
  
        const aComeca = nomeA.startsWith(termo) ? 0 : 1;
        const bComeca = nomeB.startsWith(termo) ? 0 : 1;
  
        if (aComeca !== bComeca) return aComeca - bComeca;
  
        return nomeA.localeCompare(nomeB); // mantém ordem alfabética depois
      });
  
    container.innerHTML = resultados.length
      ? resultados.map(criarResultadoHTML).join('')
      : "<p style='padding: 10px;'>Nenhuma receita encontrada.</p>";
      
    container.style.display = "block";
  });
}  

document.addEventListener("DOMContentLoaded", async () => {
  await carregarReceitas();
  configurarBusca();
});
