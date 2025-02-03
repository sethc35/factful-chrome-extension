function debug(message) {
    
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

async function getDocsEnabledState(tabId) {
    try {
        const result = await chrome.scripting.executeScript({
            target: { tabId },
            func: () => localStorage.getItem('canFactfulRun')
        });
        return result[0].result !== 'false';
    } catch (error) {
        
        return true;
    }
}

async function updatePowerStatus(isEnabled, currentDomain, tabId) {
    const powerButtons = document.querySelectorAll('.status, .power-button');
    const statusTexts = document.querySelectorAll('.status div:last-child, .power-status-text');
    
    if (currentDomain === 'docs.google.com') {
        isEnabled = await getDocsEnabledState(tabId);
    }
    
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

async function applySettings(settings, currentDomain, tabId) {
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
    await updatePowerStatus(isEnabled, currentDomain, tabId);
}

async function togglePower(currentDomain, currentTab) {
    const currentSettings = await loadSettings();
    let isCurrentlyEnabled = !currentSettings.disabledDomains.includes(currentDomain);
    
    if (currentDomain === 'docs.google.com') {
        isCurrentlyEnabled = await getDocsEnabledState(currentTab.id);
    }
    
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
            
        }
    }
    
    await updatePowerStatus(!isCurrentlyEnabled, currentDomain, currentTab.id);
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
        getCurrentTab().then(async tab => {
            const domain = getDomainFromUrl(tab.url);
            const isEnabled = !changes.disabledDomains.newValue.includes(domain);
            await updatePowerStatus(isEnabled, domain, tab.id);
        });
    }
});

document.addEventListener('DOMContentLoaded', async () => {

    const browserName = (() => {
        if (navigator.userAgent.includes("Firefox")) return "Firefox";
        if (navigator.userAgent.includes("Edge")) return "Edge";
        if (navigator.userAgent.includes("Opera")) return "Opera";
        if (navigator.userAgent.includes("Chrome")) return "Chrome";
        if (navigator.userAgent.includes("Safari")) return "Safari";
        return "Chrome"; 
    })();
    
    document.getElementById('browser-name').textContent = browserName;

    debug('Widget initialized');

    const currentTab = await getCurrentTab();
    const currentDomain = getDomainFromUrl(currentTab.url);
    const settings = await loadSettings();
    
    await applySettings(settings, currentDomain, currentTab.id);
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