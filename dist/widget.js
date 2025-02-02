function debug(message) {
    console.log(message);
    const debugDiv = document.getElementById('debugOutput');
}

const DEFAULT_SETTINGS = {
    outputType: 'detailed',
    language: 'en-US',
    disabledDomains: []
};

function saveSettings(settings) {
    chrome.storage.sync.set(settings, () => {
        debug('Settings saved');
    });
}

function loadSettings() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
            debug('Settings loaded');
            resolve(settings);
        });
    });
}

function getCurrentTab() {
    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            resolve(tabs[0]);
        });
    });
}

function getDomainFromUrl(url) {
    const urlObj = new URL(url);
    return urlObj.hostname;
}

function updatePowerStatus(isEnabled) {
    const statusContainer = document.querySelector('.status');
    const statusText = document.querySelector('.status div:last-child');
    
    if (isEnabled) {
        statusContainer.classList.remove('disabled');
        statusText.textContent = 'Factful is enabled for this site';
    } else {
        statusContainer.classList.add('disabled');
        statusText.textContent = 'Factful is disabled for this site';
    }
}

function applySettings(settings, currentDomain) {
    const languageSelect = document.querySelector('.language-select');
    if (languageSelect) {
        languageSelect.value = settings.language;
    }

    const buttons = document.querySelectorAll('.output-type .option-button');
    buttons.forEach(button => {
        if (button.dataset.type === settings.outputType) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });

    const isEnabled = !settings.disabledDomains.includes(currentDomain);
    updatePowerStatus(isEnabled);
}

document.addEventListener('DOMContentLoaded', async () => {
    debug('Widget initialized');

    const currentTab = await getCurrentTab();
    const currentDomain = getDomainFromUrl(currentTab.url);
    const settings = await loadSettings();
    
    applySettings(settings, currentDomain);

    const outputButtons = document.querySelectorAll('.output-type .option-button');
    outputButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            outputButtons.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            
            saveSettings({
                ...settings,
                outputType: e.target.dataset.type
            });
        });
    });

    const languageSelect = document.querySelector('.language-select');
    languageSelect.addEventListener('change', (e) => {
        saveSettings({
            ...settings,
            language: e.target.value
        });
    });

    const powerButton = document.querySelector('.status');
    powerButton.addEventListener('click', async () => {
        const currentSettings = await loadSettings();
        const isCurrentlyEnabled = !currentSettings.disabledDomains.includes(currentDomain);
        
        let newDisabledDomains;
        if (isCurrentlyEnabled) {
            newDisabledDomains = [...currentSettings.disabledDomains, currentDomain];
        } else {
            newDisabledDomains = currentSettings.disabledDomains.filter(domain => domain !== currentDomain);
        }
        
        await saveSettings({
            ...currentSettings,
            disabledDomains: newDisabledDomains
        });
        
        updatePowerStatus(!isCurrentlyEnabled);
    
        if (currentDomain === 'docs.google.com') {
            chrome.scripting.executeScript({
                target: { tabId: currentTab.id },
                func: (enabled) => {
                    localStorage.setItem('canFactfulRun', enabled.toString());
                    console.log(`Set canFactfulRun to ${enabled}`);
                },
                args: [!isCurrentlyEnabled]
            }).then(() => {
                chrome.tabs.reload(currentTab.id);
            }).catch(err => {
                console.error('Failed to set localStorage:', err);
                chrome.tabs.reload(currentTab.id);
            });
        } else {
            chrome.tabs.reload(currentTab.id);
        }
    });

    document.querySelector('.widget-container').addEventListener('click', (e) => {
        debug(`Click detected on element: ${e.target.tagName} with classes: ${e.target.className}`);
    });
});