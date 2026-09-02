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
  });
  