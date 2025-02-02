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
    return chrome.storage.sync.set(settings);
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
    const powerButtons = document.querySelectorAll('.status, .power-button');
    const statusTexts = document.querySelectorAll('.status div:last-child, .power-status-text');
    
    powerButtons.forEach(button => {
        if (isEnabled) {
            button.classList.remove('disabled');
        } else {
            button.classList.add('disabled');
        }
    });
    
    statusTexts.forEach(text => {
        text.textContent = isEnabled ? 'Factful is enabled for this site' : 'Factful is disabled for this site';
    });
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

async function togglePower(currentDomain, currentTab) {
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
        try {
            await chrome.scripting.executeScript({
                target: { tabId: currentTab.id },
                func: (enabled) => {
                    localStorage.setItem('canFactfulRun', enabled.toString());
                },
                args: [!isCurrentlyEnabled]
            });
        } catch (err) {
            console.error('Failed to set localStorage:', err);
        }
    }
    
    chrome.tabs.reload(currentTab.id);
}

async function initializePowerButtons(currentDomain, currentTab) {
    const powerButtons = document.querySelectorAll('.status, .power-button');
    powerButtons.forEach(button => {
        button.addEventListener('click', () => togglePower(currentDomain, currentTab));
    });
}

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && changes.disabledDomains) {
        getCurrentTab().then(tab => {
            const domain = getDomainFromUrl(tab.url);
            const isEnabled = !changes.disabledDomains.newValue.includes(domain);
            updatePowerStatus(isEnabled);
        });
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    debug('Widget initialized');

    const currentTab = await getCurrentTab();
    const currentDomain = getDomainFromUrl(currentTab.url);
    const settings = await loadSettings();
    
    applySettings(settings, currentDomain);
    await initializePowerButtons(currentDomain, currentTab);

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
    if (languageSelect) {
        languageSelect.addEventListener('change', (e) => {
            saveSettings({
                ...settings,
                language: e.target.value
            });
        });
    }

    document.querySelector('.widget-container').addEventListener('click', (e) => {
        debug(`Click detected on element: ${e.target.tagName} with classes: ${e.target.className}`);
    });
});