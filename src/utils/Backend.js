/* eslint-disable */

var Backend = Backend || {};

Backend.fetchData = async function(textInput) {
    try {
        const query = encodeURIComponent(textInput);
        const response = await fetch(`https://backend.factful.io/process_text?input=${query}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Backend fetchData received data:", data);
        return data || {};

    } catch (error) {
        console.log("fetchData() Error: " + error);
        return { error: error.message };
    }
}

Backend.sendCommand = async function(command, parameter) {
    const accessToken = getAccessToken();
    if (!accessToken) {
        return;
    }
    
    try {
        const query = encodeURIComponent(parameter);
        let endpoint;
        let isSearch = false;
        let isGenerate = false;
        console.log('query + command: ', query, command);
        
        switch (command) {
            case '/synonym':
                endpoint = 'get-syn';
                break;
            case '/antonym':
                endpoint = 'get-ant';
                break;
            case '/search':
                endpoint = 'quick_search';
                isSearch = true;
                isGenerate = false;
                break;
            case '/generate':
                endpoint = 'generate-text';
                isSearch = false;
                isGenerate = true;
                break;
            default:
                throw new Error('Unknown command (sendCommand)');
        }

        var url;
        if (isSearch) {
            url = `https://backend.factful.io/${endpoint}/${query}`;
        } else if (isGenerate) {
            console.log('generate exception hit')
            url = `https://backend.factful.io/${endpoint}?prompt=${query}`;
        } else {
            url = `https://backend.factful.io/${endpoint}?word=${query}`;
        }

        console.log('url hitting: ', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log(response, url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(`Backend ${command} received data:`, data);

        if (isSearch && data.output) {
            return {
                search_results: [data.output]
            };
        }

        return data || {};

    } catch (error) {
        console.log(`sendCommand() Error: ${error}`);
        return { error: error.message };
    }
}

Backend.sendButton = async function(command, input, language) {
    try {
        const query = encodeURIComponent(input);
        let endpoint;
        let isSearch = false;
        let isTranslate = false;
        
        switch (command) {
            case 'paraphrase':
                endpoint = 'paraphrase';
                break;
            case 'summarize':
                endpoint = 'summarize';
                break;
            case 'translate':
                endpoint = 'translate';
                isTranslate = true;
                isSearch = false;
                break;
            case 'search':
                endpoint = 'smart-search';
                isSearch = true;
                isTranslate = false; // insurance
                break;
            default:
                throw new Error('Unknown command');
        }

        const url = isTranslate 
            ? `https://backend.factful.io/translate?text=${query}&language=${language}`
            : isSearch
                ? `https://backend.factful.io/${endpoint}?query=${query}`
                : `https://backend.factful.io/${endpoint}?text=${query}`
    
        console.log('url of sendbutton: ', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(`Backend ${command} received data:`, data);

        if (isSearch && data.output) {
            return {
                search_results: [data.output]
            };
        }

        return data || {};

    } catch (error) {
        console.log(`sendCommand() Error: ${error}`);
        return { error: error.message };
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "fetchData") {
        (async () => {
            try {
                const data = await Backend.fetchData(message.textInput);
                sendResponse(data);
            } catch (error) {
                console.log('Error fetching data: ', error);
                sendResponse({ error: 'Failed to fetch data' });
            }
        })();
        return true;
    }
    
    if (message.action === "sendCommand") {
        (async () => {
            try {
                const data = await Backend.sendCommand(message.command, message.parameter);
                sendResponse(data);
            } catch (error) {
                console.log('Error processing command: ', error);
                sendResponse({ error: 'Failed to process command' });
            }
        })();
        return true;
    }

    if (message.action === "sendButton") {
        (async () => {
            try {
                console.log('params: ', message);
                const data = await Backend.sendButton(
                    message.command, 
                    message.input || message.parameter,
                    message.language
                );
                sendResponse(data);
            } catch (error) {
                console.log('Error processing command: ', error);
                sendResponse({ error: 'Failed to process command' });
            }
        })();
        return true;
    }

    if (message.action === "initiateAuthentication") {
        handleAuthentication();

        sendResponse({ message: '[Authenticator] User authentication initiated' });

        return true;
    }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        isGoogleDocsTab(tabId, async (isGoogleDocs) => {
            if (isGoogleDocs) {
                console.log(`[Authenticator] Relay script injected into tab ${tabId}.`);

                await injectRelayScript(tabId)
                validateAccessTokenForGoogleDocs(tabId);
            } else {
                validateAccessToken(tabId);
            }
        });
    }
});
  
chrome.tabs.onActivated.addListener(({ tabId }) => {
    isGoogleDocsTab(tabId, async (isGoogleDocs) => {
        if (isGoogleDocs) {
            console.log(`[Authenticator] Relay script injected into tab ${tabId}.`);

            await injectRelayScript(tabId)
            validateAccessTokenForGoogleDocs(tabId);
        } else {
            validateAccessToken(tabId);
        }
    });
});

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.access_token && changes.access_token.newValue) {
        console.log("[Authenticator] Access token updated:", changes.access_token.newValue);
    }
});

function injectRelayScript(tabId) {
    return new Promise((resolve, reject) => {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => {
                if (window.__factful_relay_injected__) return;

                window.__factful_relay_injected__ = true;

                window.addEventListener('message', (event) => {
                    if (event.data.action === 'initiateFactfulAuthentication') {
                        console.log('[Authenticator] Authentication initiation request recieved.');

                        chrome.runtime.sendMessage(chrome.runtime.id, { action: 'initiateAuthentication' });
                    }
                });
                    
                function relayData(data) {
                    console.log('data relayed: ', data);
                    window.postMessage({ action: 'setFactfulAccessToken', payload: data }, '*');
                }
                    
                window.relayData = relayData;

                console.log('[Authenticator] Relay script successfully injected.');
            }
        }, () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve();
            }
        });
    });
}

function relayData(data, tabId) {
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: (data) => {
            if (window.relayData) {
                window.relayData(data);
            } else {
                console.error('[Authenticator] relayData is not defined.');
            }
        },
        args: [data],
    });
}

function validateAccessTokenForGoogleDocs(tabId) {
    console.log('[Authenticator] Retrieving access token...');
        
    chrome.storage.local.get("access_token", async (data) => {
        const accessToken = data.access_token;

        if (accessToken) {
            console.log(accessToken);
            const response = await fetch(`https://backend.factful.io/verify_access_token`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${accessToken}`
                }
            });
                
            const data = await response.json();

            if (!response.ok) {
                console.log('[Authenticator] Error verifying access token:', data.error, data.details);

                chrome.storage.local.remove("access_token");

                relayData({ error: "Failed to verify access token" }, tabId);
            } else {
                console.log('[Authenticator] Response received from API: ', data.data);

                relayData({ session: data.data, accessToken: accessToken }, tabId);
            }
        } else {
            console.log('[Authenticator] No access token found.');
                
            relayData({ error: "Access token does not exist" }, tabId);
        }
    });
}

function validateAccessToken(tabId) {
    console.log('[Authenticator] Retrieving access token...');
        
    chrome.storage.local.get("access_token", async (data) => {
        const accessToken = data.access_token;

        if (accessToken) {
            const response = await fetch(`https://backend.factful.io/verify_access_token`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${accessToken}`
                }
            });
                
            const data = await response.json();

            if (!response.ok) {
                console.log('[Authenticator] Error verifying access token:', data.error, data.details);

                chrome.storage.local.remove("access_token");

                chrome.tabs.sendMessage(tabId, { action: "setAccessToken", error: "Failed to verify access token" });
            } else {
                console.log('[Authenticator] Response received from API: ', data.data);

                chrome.tabs.sendMessage(tabId, { action: "setAccessToken", session: data.data, accessToken: accessToken });
            }
        } else {
            console.log('[Authenticator] No access token found.');
                
            chrome.tabs.sendMessage(tabId, { action: "setAccessToken", error: "Access token does not exist" });
        }
    });
}

function isGoogleDocsTab(tabId, callback) {
    chrome.tabs.get(tabId, (tab) => {
        if (chrome.runtime.lastError || !tab.url) {
            callback(false); 

            return;
        }
        callback(tab.url.startsWith('https://docs.google.com'));
    });
}

async function getAccessToken() {
    return new Promise((resolve) => {
        chrome.storage.local.get("access_token", (data) => {
            resolve(data.access_token);
        });
    });
}

function initiateAuthentication() {
    const SUPABASE_URL = "https://ybxboifzbpuhrqbbcneb.supabase.co";
    const redirectUrl = `chrome-extension://${chrome.runtime.id}/auth.html`;

    chrome.tabs.create({ url: `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}` });
}

async function handleAuthentication() {
    const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const originalUrl = currentTab.url;
    const originalTabId = currentTab.id;

    const SUPABASE_URL = "https://ybxboifzbpuhrqbbcneb.supabase.co";
    const redirectUrl = `https://app.factful.io/`;
    const authUrl = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`;

    const authTab = await chrome.tabs.create({ url: authUrl });

    const handleAuthComplete = async (tabId, changeInfo, tab) => {
        if (tabId === authTab.id && changeInfo.url) {
            const newUrl = changeInfo.url;
            
            if (newUrl.startsWith('https://app.factful.io')) {
                try {
                    const hashParams = new URLSearchParams(new URL(newUrl).hash.substring(1));

                    const accessToken = hashParams.get('access_token');
                    const expiresAt = hashParams.get('expires_at');

                    if (accessToken && expiresAt) {
                        await chrome.storage.local.set({
                            access_token: accessToken,
                            expires_at: expiresAt,
                            auth_url: newUrl
                        });

                        await chrome.tabs.remove(authTab.id);

                        if (originalTabId) {
                            await chrome.tabs.update(originalTabId, {
                                active: true,
                                url: originalUrl
                            });
                        }

                        chrome.tabs.onUpdated.removeListener(handleAuthComplete);

                        return {
                            success: true,
                            accessToken,
                            expiresAt,
                            authUrl: newUrl
                        };
                    }
                } catch (error) {
                    console.error('Authentication error:', error);
                    chrome.tabs.onUpdated.removeListener(handleAuthComplete);
                    throw error;
                }
            }
        }
    };

    chrome.tabs.onUpdated.addListener(handleAuthComplete);

    setTimeout(() => {
        chrome.tabs.onUpdated.removeListener(handleAuthComplete);
    }, 300000); // auth expires after 5 min
}