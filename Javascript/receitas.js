document.addEventListener('DOMContentLoaded', () => {

  //  Animação de entrada para cards principais
  const cards = document.querySelectorAll('.card-receita');

  const observerCards = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        observerCards.unobserve(entry.target); // anima só uma vez
      }
    });
  }, { threshold: 0.2 });

  cards.forEach(card => observerCards.observe(card));

  //  Animação de entrada para subcards
  const subcards = document.querySelectorAll('.subcard');

  const observerSubcards = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        observerSubcards.unobserve(entry.target); // também só uma vez
      }
    });
  }, { threshold: 0.2 });

  subcards.forEach(subcard => observerSubcards.observe(subcard));
});
