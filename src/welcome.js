
window.addEventListener('DOMContentLoaded', () => {

    const logo = document.getElementById('factfulLogo');
    logo.src = chrome.runtime.getURL('assets/factful-icon-transparent.png');

    const icon = document.getElementById('extensionIcon');
    icon.src = chrome.runtime.getURL('assets/extension.png');
});

document.getElementById('getStarted').addEventListener('click', () => {
    window.close();
});
