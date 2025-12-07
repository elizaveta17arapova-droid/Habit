// Простая установка PWA
class PWAInstall {
  constructor() {
    this.setup();
  }

  setup() {
    // Регистрируем Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }

    // Показываем кнопку установки
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.showInstallBtn(e);
    });
  }

  showInstallBtn(event) {
    const btn = document.createElement('button');
    btn.innerHTML = '📱 Установить приложение';
    btn.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #667eea;
      color: white;
      padding: 12px 20px;
      border: none;
      border-radius: 25px;
      cursor: pointer;
      z-index: 1000;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    `;
    
    btn.onclick = () => this.installApp(event);
    document.body.appendChild(btn);
  }

  installApp(event) {
    event.prompt();
    event.userChoice.then((choice) => {
      if (choice.outcome === 'accepted') {
        console.log('✅ Приложение установлено!');
      }
    });
  }
}

// Запускаем при загрузке
new PWAInstall();