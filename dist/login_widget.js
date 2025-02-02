
document.addEventListener('DOMContentLoaded', function() {
    const loginButton = document.getElementById('login-button');
    
    loginButton.addEventListener('click', function() {
        chrome.runtime.sendMessage({ action: 'initiateAuthentication' }, function(response) {
            console.log('Authentication response:', response);

            loginButton.textContent = 'Logging in...';
            loginButton.disabled = true;
        });
    });
});