// Registrar Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('SW registrado:', registration);
            })
            .catch(error => {
                console.log('SW registro fallido:', error);
            });
    });
}

// Detectar modo standalone
if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('Ejecutando como PWA');
}

// Instalación
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallButton();
});

function showInstallButton() {
    const installButton = document.createElement('button');
    installButton.innerHTML = '<i class="fas fa-download"></i> Instalar App';
    installButton.className = 'install-button';
    installButton.onclick = () => {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('Usuario aceptó instalación');
            }
            deferredPrompt = null;
        });
    };
    document.body.appendChild(installButton);
}