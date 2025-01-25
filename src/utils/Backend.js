/* eslint-disable */

var Backend = Backend || {};

Backend.fetchData = async function(textInput) {
    try {
        const query = encodeURIComponent(textInput);
        const response = await fetch(`http://127.0.0.1:5000/process_text?input=${query}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('backend response: ', response);

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
                endpoint = 'synonym';
                break;
            case '/antonym':
                endpoint = 'antonym';
                break;
            case '/generate':
                endpoint = 'generate';
                isSearch = true;
                break;
            default:
                throw new Error('Unknown command');
        }

        // Different URL structure for search
        const url = isSearch 
            ? `http://127.0.0.1:5000/${endpoint}?input=${query}`
            : `http://127.0.0.1:5000/${endpoint}?word=${query}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('boomeranged respojnse: ', response)

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
});