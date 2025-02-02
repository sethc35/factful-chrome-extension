const getBrowserName = () => {
    if (navigator.userAgent.includes("Firefox")) return "Firefox";
    if (navigator.userAgent.includes("Edge")) return "Edge";
    if (navigator.userAgent.includes("Opera")) return "Opera";
    if (navigator.userAgent.includes("Chrome")) return "Chrome";
    if (navigator.userAgent.includes("Safari")) return "Safari";
    return "Chrome"; 
};

window.addEventListener('DOMContentLoaded', () => {
    const browserName = getBrowserName();
    document.getElementById('browserName').textContent = browserName;
    document.getElementById('browserNameMessage').textContent = browserName;
    
    const logo = document.getElementById('factfulLogo');
    logo.src = chrome.runtime.getURL('assets/factful-icon-transparent.png');

    const icon = document.getElementById('extensionIcon');
    icon.src = chrome.runtime.getURL('assets/extension.png');
});

document.getElementById('getStarted').addEventListener('click', () => {
    window.close();
});