/* eslint-disable */

var Backend = Backend || {};

import { supabase } from "../supabase.js";

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
    try {
        const query = encodeURIComponent(parameter);
        let endpoint;
        let isSearch = false;
        
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
                break;
            default:
                throw new Error('Unknown command');
        }

        // Different URL structure for search
        const url = isSearch 
            ? `https://backend.factful.io/${endpoint}/${query}`
            : `https://backend.factful.io/${endpoint}?word=${query}`;

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
    if (message.action === 'fetchData') {
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
    
    if (message.action === 'sendCommand') {
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

    if (message.action === "getUserSession") {
        console.log('[Authenticator] Retrieving user session...');
        
        chrome.storage.local.get("access_token", async ({ accessToken }) => {
            if (accessToken) {
                const response = await fetch(`https://backend.factful.io/verify_access_token`, {
                    method: "GET",
                    headers: {
                      Authorization: `Bearer ${accessToken}`
                    }
                });
              
                if (!response.ok) {
                    window.postMessage({ type: "factfulUserSession", data: { error: "Failed to verify access token" } }, "*");
                } else {
                    const data = await response.json();

                    window.postMessage({ type: "factfulUserSession", data: data }, "*");
                }
            }
        });
        return true;
    }
});