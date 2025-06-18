document.addEventListener('DOMContentLoaded', function() {
    const video = document.querySelector('.hero-video');
    const hero = document.querySelector('.hero');
    
    // Verifica se o elemento de vídeo existe
    if (!video) return;
    
    // Configurações para mobile
    if (window.innerWidth < 768) {
        video.setAttribute('playsinline', '');
        video.setAttribute('muted', '');
        video.setAttribute('autoplay', '');
    }
    
    // Tenta reproduzir o vídeo
    const playPromise = video.play();
    
    // Fallback para navegadores que bloqueiam autoplay
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            video.muted = true;
            video.play();
        });
    }
    
    // Fallback para caso o vídeo não carregue
    video.addEventListener('error', function() {
        const fallback = document.querySelector('.hero-fallback');
        if (fallback) {
            fallback.style.display = 'block';
        }
    });
});