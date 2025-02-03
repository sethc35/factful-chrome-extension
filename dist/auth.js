const hashParams = new URLSearchParams(window.location.hash.substr(1));

const accessToken = hashParams.get("access_token");
const expiresAt = hashParams.get("expires_at");
const refreshToken = hashParams.get("refresh_token");
const tokenType = hashParams.get("token_type");

if (accessToken && expiresAt && refreshToken && tokenType) {
    chrome.storage.local.set({ access_token: accessToken, expires_at: expiresAt, refresh_token: refreshToken }, () => {

        document.getElementById("auth-message").innerText = "Authentication successful! This tab will close in 3 seconds.";

        setTimeout(() => {
            document.getElementById("auth-message").innerText = "Authentication successful! This tab will close in 2 seconds.";
        }, 1000);

        setTimeout(() => {
            document.getElementById("auth-message").innerText = "Authentication successful! This tab will close in 1 second.";
        }, 2000);

        setTimeout(() => {
            window.close();
        }, 3000);
    });
}