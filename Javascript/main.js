document.addEventListener('DOMContentLoaded', function () {
    // Menu Mobile
    const menuToggle = document.createElement('div');
    menuToggle.className = 'menu-toggle';
    menuToggle.innerHTML = '<span></span><span></span><span></span>';
    document.querySelector('header').appendChild(menuToggle);
  
    const menu = document.querySelector('.menu-principal ul');
  
    menuToggle.addEventListener('click', function () {
      this.classList.toggle('active');
      menu.classList.toggle('active');
    });
  
    // Scroll no Header
    const header = document.querySelector('header');
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 100);
    });
  
    // Animação nos cards
    document.querySelectorAll('.receita-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px)';
        card.style.boxShadow = '0 15px 30px rgba(0,0,0,0.15)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
      });
    });
  
    // Validação newsletter
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const email = this.querySelector('input').value;
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          alert('Obrigado por assinar nossa newsletter!');
          this.reset();
        } else {
          alert('Por favor, insira um e-mail válido.');
        }
      });
    }
  
    // Marcar como favorito ao carregar (do servidor)
    fetch('/api/favoritos')
      .then(res => res.json())
      .then(favoritos => {
        favoritos.forEach(fav => {
          const card = document.querySelector(`.receita-card[data-id="${fav.receitaId}"]`);
          if (card) {
            const btn = card.querySelector('.favoritar-btn');
            if (btn) {
              btn.classList.add('favoritado');
              btn.innerHTML = '<i class="fas fa-heart"></i>';
            }
          }
        });
      })
      .catch(err => console.error('Erro ao carregar favoritos:', err));
  
    // Favoritar ou desfavoritar
    document.querySelectorAll('.favoritar-btn').forEach(btn => {
      btn.addEventListener('click', async function (e) {
        e.stopPropagation();
        const card = this.closest('.receita-card');
        const receitaId = card.getAttribute('data-id');
  
        try {
          if (this.classList.contains('favoritado')) {
            const res = await fetch(`/api/favoritos/${receitaId}`, {
              method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
              this.classList.remove('favoritado');
              this.innerHTML = '<i class="far fa-heart"></i>';
            } else {
              alert('Erro ao remover dos favoritos.');
            }
          } else {
            const titulo = card.querySelector('h3')?.innerText || '';
            const imagemStyle = card.querySelector('.receita-imagem')?.style.backgroundImage;
            const imagem = imagemStyle ? imagemStyle.slice(5, -2).replace(/\\+/g, '') : '';
            const link = card.querySelector('a.btn-secondary')?.getAttribute('href') || '#';
  
            const res = await fetch(`/api/favoritos`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ receitaId, titulo, imagem, link })
            });
  
            const data = await res.json();
            if (data.success) {
              this.classList.add('favoritado');
              this.innerHTML = '<i class="fas fa-heart"></i>';
            } else {
              alert('Erro ao adicionar aos favoritos.');
            }
          }
        } catch (error) {
          console.error('Erro ao processar favorito:', error);
          alert('Erro de conexão ao tentar favoritar.');
        }
      });
    });
  });
  