/* eslint-disable */

var Backend = Backend || {};
const DEFAULT_SETTINGS = {
    outputType: 'detailed',
    language: 'en-US',
    disabledDomains: []
};

Backend.fetchData = async function(textInput) {
    try {
        const query = encodeURIComponent(textInput);
        const settings = await returnSettings();
        const accessToken = await getAccessToken();
        const url = `https://backend.factful.io/process_text?input=${query}&locale=${settings.language}&style=${settings.outputType}`

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                return { error: "Unauthorized" }
            }

            throw new Error(`[APIService] HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        
        return data || {};

    } catch (error) {
        
        return { error: error.message };
    }
}

Backend.sendCommand = async function(command, parameter, useSearch = false, context = '') {
    const accessToken = await getAccessToken();
    const settings = await returnSettings();
    if (!accessToken) {
        return;
    }

    try {
        const query = encodeURIComponent(parameter);
        let endpoint;
        let isSearch = false;
        let isGenerate = false;
        
        switch (command) {
            case '/synonym':
                endpoint = 'get-syn';
                break;
            case '/antonym':
                endpoint = 'get-ant';
                break;
            case '/search':
                endpoint = 'smart-search';
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
            url = `https://backend.factful.io/${endpoint}?query=${query}&context=${context}`;
        } else if (isGenerate) {
            url = `https://backend.factful.io/${endpoint}?prompt=${query}&locale=${settings.language}&style=${settings.outputType}&use_search=${useSearch}`;
        } else {
            url = `https://backend.factful.io/${endpoint}?word=${query}`;
        }

        

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        

        if (isSearch && data.output) {
            return {
                search_results: [data.output]
            };
        }

        return data || {};

    } catch (error) {
        
        return { error: error.message };
    }
}

Backend.sendButton = async function(command, input, language, useSearch = false) {
    try {
        const query = encodeURIComponent(input);
        const settings = await returnSettings();
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
                : `https://backend.factful.io/${endpoint}?text=${query}&locale=${settings.language}&style=${settings.outputType}`

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        

        if (isSearch && data.output) {
            return {
                search_results: [data.output]
            };
        }

        return data || {};

    } catch (error) {
        
        return { error: error.message };
    }
}

Backend.fetchHtml = async function(textInput, useSearch = false) {
    try {
        const query = encodeURIComponent(textInput);
        const settings = await returnSettings();
        
        
        const response = await fetch(`https://backend.factful.io/generate-html?prompt=${query}&locale=${settings.language}&style=${settings.outputType}&use_search=${useSearch}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

                if (!response.ok) {
                    if (response.status === 401) {
                        return { error: "Unauthorized" }
                    }

                    throw new Error(`[APIService] HTTP error! Status: ${response.status}`);
                }

        const data = await response.json();
        
        return data || {};

    } catch (error) {
        
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
                
                sendResponse({ error: 'Failed to process command' });
            }
        })();
        return true;
    }

    if (message.action === "sendButton") {
        (async () => {
            try {
                
                const data = await Backend.sendButton(
                    message.command, 
                    message.input || message.parameter,
                    message.language
                );
                sendResponse(data);
            } catch (error) {
                
                sendResponse({ error: 'Failed to process command' });
            }
        })();
        return true;
    }

    if (message.action === "initiateAuthentication") {
        handleAuthentication();

        sendResponse({ message: 'User authentication initiated' });

        return true;
    }

    if (message.action === "getAccessToken") {
        chrome.storage.local.get("access_token", (data) => {
            sendResponse({ access_token: data.access_token || null });
        });
        return true;
    }

    if (message.action === "fetchHtml") {
        (async () => {
            try {
                const messageData = message.data;
                
                
                const data = await Backend.fetchHtml(messageData.data, messageData.useSearch);
                
                sendResponse(data);
            } catch (error) {
                
                sendResponse({ error: 'Failed to fetch HTML' });
            }
        })();
        return true;
    }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        isGoogleDocsTab(tabId, async (isGoogleDocs) => {
            if (isGoogleDocs) {
                

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
            

            await injectRelayScript(tabId)
            validateAccessTokenForGoogleDocs(tabId);
        } else {
            validateAccessToken(tabId);
        }
    });
});

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.access_token && changes.access_token.newValue) {
        
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
                        
                        chrome.runtime.sendMessage(chrome.runtime.id, { action: 'initiateAuthentication' });

                    } else if (event.data.action === 'generateHtml') {
                        const { data, useSearch } = event.data;

                        chrome.runtime.sendMessage(chrome.runtime.id, {
                            action: 'fetchHtml',
                            data: event.data,
                            useSearch: event.data.useSearch
                        }, response => {
                            window.postMessage({
                                action: 'htmlResponse',
                                result: response
                            }, '*');
                        });
                    } else if (event.data.action === 'sendCommand' && event.data.command === '/search') {
                        try {
                            chrome.runtime.sendMessage({ action: 'getAccessToken' }, async (response) => {
                                const accessToken = response.access_token;
                                
                                const query = encodeURIComponent(event.data.parameter);
                                const url = `https://backend.factful.io/smart-search?query=${query}`;
                                
                                const apiResponse = await fetch(url, {
                                    method: 'GET',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${accessToken}`
                                    }
                                });

                                const data = await apiResponse.json();
                                
                                window.postMessage({
                                    action: 'searchResponse',
                                    result: {
                                        ok: apiResponse.ok,
                                        status: apiResponse.status,
                                        data: data
                                    }
                                }, '*');
                            });
                        } catch (error) {
                            window.postMessage({
                                action: 'searchResponse',
                                result: { 
                                    ok: false, 
                                    error: error.message 
                                }
                            }, '*');
                        }
                    } else if (event.data.action === 'sendCommand' && event.data.command === '/generate') {
                        try {
                            chrome.runtime.sendMessage({ action: 'getAccessToken' }, async (response) => {
                                const accessToken = response.access_token;
                                const query = encodeURIComponent(event.data.parameter);
                                const url = `https://backend.factful.io/generate-text?prompt=${query}`;
                                
                                const apiResponse = await fetch(url, {
                                    method: 'GET',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${accessToken}`
                                    }
                                });
                    
                                const data = await apiResponse.json();
                                
                                window.postMessage({
                                    action: 'generateResponse',
                                    result: {
                                        ok: apiResponse.ok,
                                        status: apiResponse.status,
                                        data: data
                                    }
                                }, '*');
                            });
                        } catch (error) {
                            window.postMessage({
                                action: 'generateResponse',
                                result: { 
                                    ok: false, 
                                    error: error.message 
                                }
                            }, '*');
                        }
                    }
                });

                function relayData(data) {
                    window.postMessage({ action: 'setFactfulAccessToken', payload: data }, '*');
                }

                window.relayData = relayData;
                
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
                
            }
        },
        args: [data],
    });
}

function validateAccessTokenForGoogleDocs(tabId) {    
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
                

                chrome.storage.local.remove("access_token");

                relayData({ error: "Failed to verify access token" }, tabId);
                chrome.action.setPopup({ popup: "login_widget.html" });

            } else {
                

                relayData({ session: data.data, accessToken: accessToken }, tabId);
                chrome.action.setPopup({ popup: "widget.html" });
            }
        } else {
            
                
            relayData({ error: "Access token does not exist" }, tabId);
            chrome.action.setPopup({ popup: "login_widget.html" });

        }
    });
}

function validateAccessToken(tabId) {    
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
                

                chrome.storage.local.remove("access_token");

                chrome.tabs.sendMessage(tabId, { action: "setAccessToken", error: "Failed to verify access token" });
                chrome.action.setPopup({ popup: "login_widget.html" });
            } else {
                
                const userId = data.data.user.id;
                chrome.storage.local.set({ user_id: userId }, function() {
                    
                });
                chrome.tabs.sendMessage(tabId, { action: "setAccessToken", session: data.data, accessToken: accessToken });
                chrome.action.setPopup({ popup: "widget.html" });
            }
        } else {
            
                
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

async function returnSettings() {
    const settings = await chrome.storage.sync.get({
        disabledDomains: [],
        outputType: 'detailed',
        language: 'US&English'
    });

    return settings;
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
                    const refreshToken = hashParams.get("refresh_token");
                    const tokenType = hashParams.get("token_type");

                    if (accessToken && expiresAt) {
                        await chrome.storage.local.set({
                            access_token: accessToken,
                            expires_at: expiresAt,
                            auth_url: newUrl
                        });

                        await chrome.storage.sync.set(DEFAULT_SETTINGS);

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
                    chrome.tabs.onUpdated.removeListener(handleAuthComplete);
                    throw error;
                }
            }
        }
    };

    chrome.tabs.onUpdated.addListener(handleAuthComplete);

    setTimeout(() => {
        chrome.tabs.onUpdated.removeListener(handleAuthComplete);
    }, 300000); // 5 min
}

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        chrome.tabs.create({
            url: 'https://factful.io/extension'
        });
       
        chrome.windows.create({
            url: chrome.runtime.getURL('welcome.html'),
            type: 'popup',
            width: 450,
            height: 400
        });
    }
});