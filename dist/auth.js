const hashParams = new URLSearchParams(window.location.hash.substr(1));

const accessToken = hashParams.get("access_token");
const expiresAt = hashParams.get("expires_at");
const refreshToken = hashParams.get("refresh_token");
const tokenType = hashParams.get("token_type");

if (accessToken && expiresAt && refreshToken && tokenType) {
    chrome.storage.local.set({ access_token: accessToken, expires_at: expiresAt, refresh_token: refreshToken }, () => {
        console.log("[Authenticator] Access token saved in storage.");

        document.getElementById("auth-message").innerText = "Authentication successful! You can close this tab now.";
    });
}
