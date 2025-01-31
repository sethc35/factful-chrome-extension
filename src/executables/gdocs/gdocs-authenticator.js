console.log("[Authenticator] Content script loaded!");

validateUserSession();

window.addEventListener("message", function(event) {
    if (event.data.type && (event.data.action == "getUserSession")) {
        validateUserSession();
    }
});

function validateUserSession() {
    console.log("[Authenticator] Validating user session...");

    chrome.runtime.sendMessage({ action: "getUserSession" }, async (response) => {
        if (response.error) {
            console.log("[Authenticator] Invalid/expired access token. Redirecting to login page...");

            window.postMessage({ type: "factfulUserSession", isValid: false }, "*");
        } else {
            console.log("[Authenticator] Response received from service worker: ", response.session);

            window.postMessage({ type: "factfulUserSession", isValid: true, accessToken: response.accessToken }, "*");
        }
    });
}