// pwa-install.js - ПОЛНОСТЬЮ ЗАМЕНИТЕ
(function() {
  console.log('PWA Install script loading...');
  
  const installBtn = document.getElementById('installBtn');
  if (!installBtn) {
    console.warn('Кнопка установки не найдена');
    return;
  }
  
  installBtn.style.display = 'none';
  
  let deferredPrompt;
  
  // Показываем/скрываем кнопку
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('beforeinstallprompt fired');
    e.preventDefault();
    deferredPrompt = e;
    
    installBtn.style.display = 'block';
    
    installBtn.onclick = async () => {
      if (!deferredPrompt) return;
      
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User ${outcome} the install`);
      
      deferredPrompt = null;
      installBtn.style.display = 'none';
    };
  });
  
  // Скрыть после установки
  window.addEventListener('appinstalled', () => {
    console.log('App installed successfully');
    installBtn.style.display = 'none';
    deferredPrompt = null;
  });
  
  // Проверка уже установленного приложения
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('Running in standalone mode');
    installBtn.style.display = 'none';
  }
  
  // Service Worker регистрация (ТОЛЬКО если на localhost или HTTPS)
  if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => {
          console.log('✅ Service Worker registered:', reg);
        })
        .catch(err => {
          console.error('❌ Service Worker registration failed:', err);
        });
    }
  } else {
    console.log('Service Worker requires HTTP(S) protocol');
  }
})();