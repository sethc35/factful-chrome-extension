/* eslint-disable no-useless-catch */
    export class Pill {
    constructor(numCorrections, corrections, handlers) {
        this.numCorrections = numCorrections;
        this.corrections = corrections || [];
        this.pillContainer = null;
        this.pillElement = null;
        this.tooltip = null;
        this.handlers = handlers;
        this.isAuthenticated = false;
        this.createPillElement();
        this.applyInitialStyles();
        this.attachEventListeners();
        this.calculateOffset();
    }

    changeAuthenticationState(isAuthenticated) {
        this.isAuthenticated = isAuthenticated;

        if (isAuthenticated) {
            this.tooltip.style.opacity = "0";
            this.tooltip.style.display = "none";
        } else {
            this.tooltip.style.opacity = "75";
            this.tooltip.style.display = "block";
        }

        if (this.pillElement.style.backgroundColor !== "rgb(234, 67, 53)") {
            this.pillElement.style.backgroundColor = isAuthenticated ? "#4285f4" : "#fabc05";
        }
    }

    createPillElement() {
        this.pillContainer = document.createElement("div");
        this.pillContainer.className = "enhanced-corrections-pill-container";
        Object.assign(this.pillContainer.style, {
            position: "fixed",
            display: "flex",
            flexDirection: "column",
            gap: "12.5px",
            alignItems: "center",
            justifyContent: "center",
            left: "0px",
            top: "0px",
            visibility: "visible",
            zIndex: "100", // 50 covers both, 100 overrides tab, 9999999 overrides everything
        });

        this.pillElement = document.createElement("div");
        this.pillElement.className = "enhanced-corrections-pill";
        Object.assign(this.pillElement.style, {
            width: "36px",
            height: "60px",
            borderRadius: "18px",
            backgroundColor: "#fabc05",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 1px 3px rgba(60,64,67,.3), 0 4px 8px 3px rgba(60,64,67,.15)",
            cursor: "pointer",
            transition: "all 150ms cubic-bezier(0.4,0,0.2,1)",
            overflow: "hidden",
            userSelect: "none",
            willChange: "transform"
        });

        const pillNumber = document.createElement("div");
        pillNumber.className = "enhanced-corrections-pill-number";
        Object.assign(pillNumber.style, {
            marginTop: "5px",
            color: "#fff",
            fontSize: "14px",
            fontFamily: "'Google Sans', Roboto, Arial, sans-serif",
            fontWeight: "500",
            textAlign: "center",
            width: "100%",
            zIndex: "1",
            pointerEvents: "none",
            display: "none"
        });
        this.pillElement.appendChild(pillNumber);

        const innerSection = document.createElement("div");
        innerSection.className = "inner-section";
        Object.assign(innerSection.style, {
            width: "28px",
            height: "48px",
            borderRadius: "14px",
            backgroundColor: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 1px 2px rgba(60,64,67,0.3)",
            transition: "all 150ms cubic-bezier(0.4,0,0.2,1)"
        });

        const logoImg = document.createElement("img");
        logoImg.src = 'logo-url';
        logoImg.alt = "Logo";
        Object.assign(logoImg.style, {
            width: "16px",
            height: "16px"
        });
        innerSection.appendChild(logoImg);
        this.pillElement.appendChild(innerSection);

        const starContainer = document.createElement("div");
        starContainer.className = "enhanced-corrections-pill-star-container";
        starContainer.ariaLabel = "Open/close sidebar";
        Object.assign(starContainer.style, {
            width: "28px",
            height: "40px",
            borderRadius: "12px",
            backgroundColor: "#fff",
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 1px 2px rgba(60,64,67,0.3)"
        });

        const starSvg = this.createStarSvg();
        starContainer.appendChild(starSvg);
        this.pillElement.appendChild(starContainer);

        const powerBtn = this.createPowerButton();
        this.pillElement.appendChild(powerBtn);

        const authBtn = this.createAuthButton();
        this.pillElement.appendChild(authBtn);

        this.tooltip = document.createElement("div");
        this.tooltip.className = "enhanced-corrections-pill-tooltip";
        this.tooltip.textContent = "You are not signed in.";
        Object.assign(this.tooltip.style, {
            position: "relative",
            display: 'flex',
            width: '75px',
            fontSize: '12px',
            color: '#fff',
            fontFamily: 'Inter',
            backgroundColor: 'black',
            padding: '5px 10px',
            borderRadius: '5px',
            opacity: 75,
            textAlign: 'center',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'all 0.3s ease-in-out',
            boxShadow: '0 1px 2px rgba(60,64,67,0.3)'
        });

        const styles = document.createElement('style');
        styles.textContent = `
            .enhanced-corrections-pill-tooltip::after {
                content: "";
                position: absolute;
                top: -9px;
                left: 50%;
                transform: translateX(-50%);
                border-width: 5px;
                border-style: solid;
                border-color: transparent transparent black transparent;
            }
        `
        this.tooltip.appendChild(styles);

        this.pillContainer.appendChild(this.pillElement);
        this.pillContainer.appendChild(this.tooltip);

        document.body.appendChild(this.pillContainer);
    }

    calculateOffset() {
        const page = document.querySelector('.kix-page-paginated');
        if (!page) {
            return;
        }

        const pageRect = page.getBoundingClientRect();
        
        const offsetLeft = pageRect.left - 60;
        const offsetTop = pageRect.top + 30;

        this.pillContainer.style.left = `${offsetLeft}px`;
        this.pillContainer.style.top = `${offsetTop}px`;
    }

    createCorrectionElement(correction) {
        const container = document.createElement('div');
        container.className = 'correction-container';
        container.setAttribute('data-type', correction.error_type.toLowerCase());

        const typeLabel = document.createElement('div');
        typeLabel.className = 'correction-type';

        const labelContainer = document.createElement('div');
        labelContainer.className = 'label-container';

        const labelDot = document.createElement('span');
        labelDot.className = `label-dot ${correction.error_type.toLowerCase()}`;

        labelContainer.appendChild(labelDot);
        labelContainer.appendChild(typeLabel);

        typeLabel.textContent = correction.error_type;;
        container.appendChild(labelContainer);

        const instruction = document.createElement('div');
        instruction.className = 'correction-instruction';
        instruction.textContent = 'Correct your text to:';
        container.appendChild(instruction);

        const correctedText = document.createElement('div');
        correctedText.className = 'correction-text';
        correctedText.textContent = correction.corrected_text;
        container.appendChild(correctedText);

        const acceptButton = document.createElement('button');
        acceptButton.className = 'correction-accept-button';
        acceptButton.textContent = 'Accept';
        container.appendChild(acceptButton);

        acceptButton.addEventListener('click', async () => {
            try {
                await this.handlers.handleCorrection(correction);
                container.style.opacity = '0';
                setTimeout(() => {
                    container.remove();
                }, 100);
            } catch (error) {
                
            }
        });

        container.addEventListener('mouseenter', () => {
            this.handlers.handleHighlight(correction, true);
            container.style.transform = 'scale(1.05)';
            container.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
            container.style.borderColor = '#0177FC';
        });

        container.addEventListener('mouseleave', () => {
            this.handlers.handleHighlight(correction, false);
            container.style.transform = 'scale(1)';
            container.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
            container.style.borderColor = '#e5e7eb';
        });

        return container;
    }

    createStarSvg() {
        const starSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        starSvg.setAttribute("width", "16");
        starSvg.setAttribute("height", "16");
        starSvg.setAttribute("viewBox", "0 0 20 20");
        starSvg.setAttribute("fill", "none");

        const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
        title.textContent = "Open/close sidebar";

        const starPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        starPath.setAttribute("d", "M10 0C10.3395 5.37596 14.624 9.66052 20 10C14.624 10.3395 10.3395 14.624 10 20C9.66052 14.624 5.37596 10.3395 0 10C5.37596 9.66052 9.66052 5.37596 10 0Z");
        starPath.setAttribute("fill", "#4285f4");

        starSvg.prepend(title);
        starSvg.appendChild(starPath);

        return starSvg;
    }

    createPowerButton() {
        const powerBtn = document.createElement("div");
        Object.assign(powerBtn.style, {
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            backgroundColor: "#fff",
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 1px 2px rgba(60,64,67,0.3)"
        });

        const powerSvg = this.createPowerSvg();
        powerBtn.appendChild(powerSvg);

        powerBtn.addEventListener("click", this.handlePowerClick.bind(this));
        return powerBtn;
    }

    createPowerSvg() {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "18");
        svg.setAttribute("height", "18");
        svg.setAttribute("viewBox", "0 0 512 512");
        svg.setAttribute("fill", "#4285f4");

        const paths = [
            "M256,512C128.502,512,24.774,408.272,24.774,280.774c0-84.49,46.065-162.23,120.216-202.879c12.006-6.577,27.057-2.18,33.633,9.816c6.577,11.997,2.182,27.055-9.814,33.633c-58.282,31.949-94.487,93.039-94.487,159.43c0,100.177,81.5,181.677,181.677,181.677s181.677-81.5,181.677-181.677c0-66.682-36.44-127.899-95.097-159.764c-12.022-6.532-16.475-21.573-9.943-33.595s21.572-16.475,33.595-9.944c74.631,40.542,120.992,118.444,120.992,203.304C487.226,408.272,383.498,512,256,512z",
            "M256,214.71c-13.682,0-24.774-11.092-24.774-24.774V24.774C231.226,11.092,242.318,0,256,0c13.682,0,24.774,11.092,24.774,24.774v165.161C280.774,203.617,269.682,214.71,256,214.71z"
        ];

        const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
        title.textContent = "Power on/off";

        svg.prepend(title);

        paths.forEach(d => {
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", d);
            svg.appendChild(path);
        });

        return svg;
    }

    handlePowerClick() {
        let enabled = localStorage.getItem('canFactfulRun');
        if (enabled === null) {
            enabled = false;
        } else {
            enabled = JSON.parse(enabled);
        }

        localStorage.setItem('canFactfulRun', JSON.stringify(!enabled));

        window.location.reload();
    }


    createAuthButton() {
        const authBtn = document.createElement("div");
        Object.assign(authBtn.style, {
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            backgroundColor: "#fff",
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 1px 2px rgba(60,64,67,0.3)"
        });

        const authSvg = this.createAuthSvg();
        authBtn.appendChild(authSvg);

        authBtn.addEventListener("click", this.handleAuthClick.bind(this));
        return authBtn;
    }

    createAuthSvg() {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "18");
        svg.setAttribute("height", "18");
        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("fill", "#4285f4");
        svg.setAttribute("stroke", "#4285f4");
        svg.setAttribute("stroke-width", "0");
        svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

        const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
        title.textContent = "Sign in/log out";

        const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path1.setAttribute("d", "M0 0h24v24H0z");
        path1.setAttribute("fill", "none");

        const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path2.setAttribute("d", "M11 7 9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z");

        svg.prepend(title)
        svg.appendChild(path1);
        svg.appendChild(path2);

        return svg;
    }

    handleAuthClick() {
        window.postMessage({ action: 'initiateFactfulAuthentication' }, '*');
    }

    initializeSidebarBehavior(sidebarContainer) {
        const tabButtons = sidebarContainer.querySelectorAll('.tab-button');
        const tabContents = sidebarContainer.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                tabButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.querySelector('.tab-icon').classList.remove('active');
                });

                tabContents.forEach(content => {
                    content.classList.add('hidden');
                });

                button.classList.add('active');
                button.querySelector('.tab-icon').classList.add('active');

                const tabId = button.getAttribute('data-tab');
                sidebarContainer.querySelector(`#${tabId}`).classList.remove('hidden');
            });
        });

        const correctionButtons = sidebarContainer.querySelectorAll('.correction-button');
        correctionButtons.forEach(button => {
            button.addEventListener('click', () => {
                correctionButtons.forEach(btn => btn.classList.remove('selected'));
                button.classList.add('selected');
                
                const type = button.id.replace('-corrections', '');
                const containers = sidebarContainer.querySelectorAll('.correction-container');
                
                containers.forEach(container => {
                    if (type === 'all' || container.getAttribute('data-type') === type) {
                        container.style.display = 'block';
                    } else {
                        container.style.display = 'none';
                    }
                });
            });
        });
    }

    applyInitialStyles() {
        const pillNumber = this.pillElement.querySelector(".enhanced-corrections-pill-number");
        
        if (this.numCorrections > 0) {
            this.pillElement.style.backgroundColor = "#EA4335";
            this.pillElement.style.height = "90px";
            pillNumber.textContent = String(this.numCorrections);
            pillNumber.style.display = "block";
        } else {
            this.pillElement.style.backgroundColor = this.isAuthenticated ? "#4285F4" : "#fabc05";
            this.pillElement.style.height = "60px";
            pillNumber.textContent = "";
            pillNumber.style.display = "none";
        }
    }

    attachEventListeners() {
        const innerSection = this.pillElement.querySelector(".inner-section");
        const starContainer = this.pillElement.querySelector(".enhanced-corrections-pill-star-container");
        const powerBtn = this.pillElement.querySelector("div > div:nth-last-child(2)");
        const authBtn = this.pillElement.querySelector("div > div:last-child");

        starContainer.addEventListener("click", () => {
            let sidebarContainer = document.getElementById('factful-sidebar-container');
            
            if (!sidebarContainer) {
                sidebarContainer = document.createElement('div');
                sidebarContainer.id = 'factful-sidebar-container';
                sidebarContainer.style.cssText = `
                    position: fixed;
                    top: 0;
                    right: 0;
                    height: 100vh;
                    width: 27.5%;
                    background: white;
                    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
                    z-index: 9999;
                    transition: transform 0.3s ease;
                `;

                const sidebar = document.createElement('div');
                sidebar.className = 'sidebar';

                const tabs = document.createElement('div');
                tabs.className = 'tabs';

                const content = document.createElement('div');
                content.className = 'content';

                const suggestionTab = document.createElement('button');
                suggestionTab.className = 'tab-button active';
                suggestionTab.setAttribute('data-tab', 'suggestions');

                const suggestionIcon = document.createElement('span');
                suggestionIcon.className = 'tab-icon active';

                const suggestionSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                suggestionSvg.setAttribute('width', '12');
                suggestionSvg.setAttribute('height', '12');
                suggestionSvg.setAttribute('viewBox', '0 0 24 24');
                suggestionSvg.setAttribute('fill', 'none');
                suggestionSvg.setAttribute('stroke', 'currentColor');
                suggestionSvg.setAttribute('stroke-width', '2');

                const suggestionPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
                suggestionPath.setAttribute('d', 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z');
                suggestionSvg.appendChild(suggestionPath);
                suggestionIcon.appendChild(suggestionSvg);

                const suggestionText = document.createElement('span');
                suggestionText.textContent = 'Suggestions';

                suggestionTab.appendChild(suggestionIcon);
                suggestionTab.appendChild(suggestionText);

                const composeTab = document.createElement('button');
                composeTab.className = 'tab-button';
                composeTab.setAttribute('data-tab', 'compose');

                const composeIcon = document.createElement('span');
                composeIcon.className = 'tab-icon';

                const composeSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                composeSvg.setAttribute('width', '12');
                composeSvg.setAttribute('height', '12');
                composeSvg.setAttribute('viewBox', '0 0 24 24');
                composeSvg.setAttribute('fill', 'none');
                composeSvg.setAttribute('stroke', 'currentColor');
                composeSvg.setAttribute('stroke-width', '2');

                const composePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
                composePath.setAttribute('d', 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z');
                composeSvg.appendChild(composePath);
                composeIcon.appendChild(composeSvg);

                const composeText = document.createElement('span');
                composeText.textContent = 'Compose';

                composeTab.appendChild(composeIcon);
                composeTab.appendChild(composeText);

                const composeContent = document.createElement('div');
                composeContent.id = 'compose';
                composeContent.className = 'tab-content hidden';

                const chatContainer = document.createElement('div');
                chatContainer.className = 'chat-container';

                const messagesContainer = document.createElement('div');
                messagesContainer.className = 'messages-container';

                const inputContainer = document.createElement('div');
                inputContainer.className = 'input-container';

                const chatInput = document.createElement('textarea');
                chatInput.className = 'chat-input';
                chatInput.placeholder = 'This is a report generator. Type what you want to generate!';

                const searchBadge = document.createElement('button');
                searchBadge.className = 'search-badge';
                searchBadge.textContent = 'Search';
                searchBadge.dataset.enabled = 'false';

                searchBadge.addEventListener('click', () => {
                    const isEnabled = searchBadge.dataset.enabled === 'true';
                    searchBadge.dataset.enabled = isEnabled ? 'false' : 'true';
                    
                    if (searchBadge.dataset.enabled === 'true') {
                        searchBadge.classList.add('enabled');
                    } else {
                        searchBadge.classList.remove('enabled');
                    }
                });                

                const sendButton = document.createElement('button');
                sendButton.className = 'send-button';

                const sendIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                sendIcon.setAttribute("width", "24");
                sendIcon.setAttribute("height", "24");
                sendIcon.setAttribute("viewBox", "0 0 24 24");
                sendIcon.setAttribute("fill", "none");
                sendIcon.setAttribute("stroke", "currentColor");
                sendIcon.setAttribute("stroke-width", "2");

                const sendPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
                sendPath.setAttribute("d", "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z");

                sendIcon.appendChild(sendPath);
                sendButton.appendChild(sendIcon);

                inputContainer.appendChild(chatInput);
                inputContainer.appendChild(searchBadge);
                inputContainer.appendChild(sendButton);

                chatContainer.appendChild(messagesContainer);
                chatContainer.appendChild(inputContainer);
                composeContent.appendChild(chatContainer);

                tabs.appendChild(suggestionTab);
                tabs.appendChild(composeTab);

                content.appendChild(composeContent);
                sidebar.appendChild(tabs);
                sidebar.appendChild(content);
                sidebarContainer.appendChild(sidebar);
        
                const suggestionsContent = document.createElement('div');
                suggestionsContent.id = 'suggestions';
                suggestionsContent.className = 'tab-content';
        
                const suggestionsSidebar = document.createElement('div');
                suggestionsSidebar.id = 'suggestions-sidebar';

                const correctionTypeContainer = document.createElement('div');
                correctionTypeContainer.id = 'correction-type-container';

                const correctionTypes = [
                    { id: 'all-corrections', text: 'All', selected: true },
                    { id: 'grammar-corrections', text: 'Grammar' },
                    { id: 'factuality-corrections', text: 'Factuality' }
                ];
        
                correctionTypes.forEach(type => {
                    const button = document.createElement('div');
                    button.id = type.id;
                    button.className = `correction-button${type.selected ? ' selected' : ''}`;
                
                    const span = document.createElement('span');
                    span.textContent = type.text;
                
                    const counter = document.createElement('span');
                    counter.className = 'corrections-counter';
                    counter.textContent = '0';
                
                    button.appendChild(span);
                    button.appendChild(counter);
                    correctionTypeContainer.appendChild(button);
                });
                
                const notFound = document.createElement('div');
                notFound.id = 'suggestions-sidebar-not-found';

                suggestionsSidebar.appendChild(correctionTypeContainer);
                suggestionsSidebar.appendChild(notFound);
                suggestionsContent.appendChild(suggestionsSidebar);
                content.appendChild(suggestionsContent);
                sidebar.appendChild(tabs);
                sidebar.appendChild(content);
                sidebarContainer.appendChild(sidebar);

                const sendMessage = () => {
                    const message = chatInput.value.trim();
                    if (message) {
                        this.handleMessage(message);
                        chatInput.value = '';
                    }
                };

                sendButton.addEventListener('click', sendMessage);

                chatInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                    }
                });

                document.body.appendChild(sidebarContainer);
                document.body.appendChild(sidebarContainer);

                const grammarCount = this.corrections?.filter(c => c.error_type === 'Grammar').length || 0;
                const factualityCount = this.corrections?.filter(c => c.error_type === 'Factuality').length || 0;
                const totalCount = this.corrections?.length || 0;
                
                document.querySelector('#all-corrections .corrections-counter').textContent = totalCount;
                document.querySelector('#grammar-corrections .corrections-counter').textContent = grammarCount;
                document.querySelector('#factuality-corrections .corrections-counter').textContent = factualityCount;
        
                const img = document.createElement('img');
                img.src = 'pseudo-img'
                img.alt = 'No suggestions';
        
                const message = document.createElement('div');
                const text1 = document.createTextNode('Nothing to be fact checked yet.');
                const lineBreak = document.createElement('br');
                const text2 = document.createTextNode('Start writing to see Factful\'s feedback.');

                message.appendChild(text1);
                message.appendChild(lineBreak);
                message.appendChild(text2);
        
                notFound.appendChild(img);
                notFound.appendChild(message);

                const correctionsContainer = document.createElement('div');
                correctionsContainer.className = 'corrections-container';

                if (this.corrections && this.corrections.length > 0) {
                    notFound.style.display = 'none';

                    this.corrections.forEach(correction => {
                        const correctionElement = this.createCorrectionElement(correction);
                        correctionsContainer.appendChild(correctionElement);
                    });
                } else {
                    notFound.style.display = 'flex';
                }

                suggestionsSidebar.appendChild(correctionsContainer);

                const styles = document.createElement('style');
                styles.textContent = `* {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
                }

                .sidebar {
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    width: 100%;
                    background-color: white;
                }

                .tabs {
                    display: flex;
                    border-bottom: 1px solid #e5e7eb;
                }

                .tab-button {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 12px;
                    font-weight: 600;
                    font-size: 0.6rem;
                    border: none;
                    background: none;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .tab-button:hover {
                    color: #0177FC;
                    background-color: #EBF5FF;
                }

                .tab-button.active {
                    border-bottom: 2px solid #0177FC;
                }

                .tab-icon {
                    padding: 4px;
                    background-color: #F8F8F8;
                    border-radius: 6px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }

                .tab-icon.active {
                    background-color: #0389FF;
                    color: white;
                }

                .tab-icon svg {
                    width: 12px;
                    height: 12px;
                }

                .content {
                    flex: 1;
                    padding: 16px;
                    background-color: white;
                    border-radius: 16px;
                    overflow-y: auto;
                }

                .tab-content {
                    display: flex;
                    flex-direction: column;
                    gap: 40px;
                }

                .tab-content.hidden {
                    display: none;
                }

                .section {
                    margin-bottom: 40px;
                }

                .section-title {
                    display: flex;
                    align-items: center;
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #05003C;
                    margin-bottom: 8px;
                }

                .section-title svg {
                    margin-right: 8px;
                    width: 20px;
                    height: 20px;
                }

                .section-subtitle {
                    font-size: 0.75rem;
                    color: #6B7280;
                    margin-bottom: 16px;
                }

                .quick-actions-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                }

                .quick-action-button {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 8px 12px;
                    font-size: 0.875rem;
                    color: #0177FC;
                    background-color: #D2E7FE;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }

                .quick-action-button:hover {
                    background-color: #EBF5FF;
                }

                .quick-action-button svg {
                    width: 16px;
                    height: 16px;
                }

                .search-container {
                    position: relative;
                }

                .search-input {
                    width: 100%;
                    padding: 12px;
                    padding-left: 36px;
                    font-size: 0.75rem;
                    border: 1px solid #D2E7FE;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    transition: all 0.2s;
                }

                .search-input:focus {
                    outline: none;
                    border-color: #0177FC;
                    box-shadow: 0 0 0 3px rgba(1, 119, 252, 0.2);
                }

                .search-icon {
                    position: absolute;
                    left: 10px;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 16px;
                    height: 16px;
                    color: #0177FC;
                }

                .commands-title {
                    font-weight: 600;
                    color: #1E3A8A;
                }

                #suggestions-sidebar {
                    position: relative;
                    color: var(--p-font-color);
                    width: 100%;
                    height: 100%;
                    background-color: white;
                    overflow: hidden;
                    transition: 0.5s;
                    scrollbar-width: thin;
                    scrollbar-color: transparent transparent;
                    
                }
                

                #suggestions-sidebar-header {
                    z-index: 5;
                    color: var(--h-font-color);
                    font-family: 'Roboto Flex';
                    font-size: 24px;
                    font-style: normal;
                    line-height: normal;
                    text-align: left;
                    font-weight: 500;
                    position: relative;
                }

                
                #correction-type-container {
                    display: flex;
                    font-family: 'Roboto Flex';
                    color: var(--h-font-color);
                    font-size: 12px;
                    flex-direction: row;
                    gap: 5%;
                    justify-content: center;
                    
                }
                
                .correction-button {
                    display: flex;
                    align-items: center;
                    padding: 7.5px;
                    border-radius: 10px;
                    transition: 0.25s ease;
                    background-color: #f5f5f5;
                    cursor: pointer;
                    font-weight: 300;
                }
                
                .correction-button.selected {
                    background-color: #dfefff;
                    color: #0177FC;
                    font-weight: 600;
                }
                
                .correction-button.selected .corrections-counter {
                    background-color:#cce4ff;
                    color: #0177FC
                }
                
                .correction-button:hover {
                    filter: brightness(0.9);
                }
                
                .correction-button.selected:hover {
                    filter: none;
                }
                
                .correction-button .corrections-counter {
                    font-size: 0.6rem;
                    margin-left: 0.25rem;
                    color: #161937;
                    display: flex;
                    height: 20px;
                    width: 20px;
                    justify-content: center;
                    align-items: center;
                    background-color: #EEEEEE;
                    border-radius: 0.2rem;
                }
                
                #suggestions-sidebar-not-found {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    width: 100%;

                    top: 0;
                    padding: 20px;
                ;
                }

                #suggestions-sidebar-not-found img {
                    width: 60%;
                    height: auto;
                    margin-bottom: 16px;
                    justify-content: center;
                }

                #suggestions-sidebar-not-found div {
                    text-align: center;
                    color: #6B7280;
                    font-size: 0.75rem;
                    justify-content: center;
                }
                    
                .corrections-container {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    padding: 16px;
                    overflow-y: auto;
                }

                .correction-container {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    padding: 16px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease;
                }
                .correction-container:hover {
                    transform: scale(1.05);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
                    border-color: #0177FC;
                }

                .correction-type {
                    font-size: 12px;
                    font-weight: 600;
                    color: #0177FC;
                    text-transform: uppercase;
                    margin-bottom: 8px;
                }

                .correction-instruction {
                    font-size: 14px;
                    color: #6B7280;
                    margin-bottom: 8px;
                }

                .correction-text {
                    font-size: 14px;
                    color: #111827;
                    background: #F3F4F6;
                    padding: 12px;
                    border-radius: 6px;
                    margin-bottom: 12px;
                }

                .correction-accept-button {
                    background: #0177FC;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    padding: 8px 16px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }

                .correction-accept-button:hover {
                    background: #0056b3;
                }

                .label-container {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .label-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    display: inline-block;
                    transform: translateY(-4px);
                }

                .label-dot.grammar {
                    background-color: #ff99a3;
                }

                .label-dot.factuality {
                    background-color: #99ccff;
                }
                    
                .chat-container {
                    display: flex;
                    flex-direction: column;
                    height: calc(100vh - 100px);
                    background: white;
                }

                .chat-bubble {
                    max-width: 80%;
                    background-color: #f1f1f1;
                    border-radius: 10px;
                    padding: 10px;
                    margin: 10px;
                    word-wrap: break-word;
                    white-space: pre-wrap;
                }

                .messages-container {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .message {
                    max-width: 80%;
                    padding: 12px 16px;
                    border-radius: 12px;
                    font-size: 14px;
                    line-height: 1.4;
                }

                .message.user {
                    align-self: flex-end;
                    background: #0177FC;
                    color: white;
                }

                .message.bot {
                    align-self: flex-start;
                    background: #F3F4F6;
                    color: #111827;
                }

                .input-container {
                    display: flex;
                    gap: 8px;
                    padding: 16px;
                    background: white;
                    border-top: 1px solid #e5e7eb;
                }

                .chat-input {
                    flex: 1;
                    padding: 12px;
                    border: 1px solid #D2E7FE;
                    border-radius: 8px;
                    resize: none;
                    font-size: 14px;
                    line-height: 1.4;
                    max-height: 120px;
                    min-height: 48px;
                }

                .chat-input:focus {
                    outline: none;
                    border-color: #0177FC;
                    box-shadow: 0 0 0 3px rgba(1, 119, 252, 0.2);
                }

                .send-button {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 48px;
                    height: 48px;
                    border: none;
                    border-radius: 8px;
                    background: #0177FC;
                    color: white;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }

                .send-button:hover {
                    background: #0056b3;
                }

                .send-button svg {
                    width: 20px;
                    height: 20px;
                }
                .copy-button {
                    margin-left: 10px;
                    padding: 5px 10px;
                    background-color: #0177fc;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                }

                .copy-button:hover {
                    background-color: #0056b3;
                }

                .message.bot {
                    outline: none; /* Remove focus outline */
                    cursor: text; /* Show text cursor when hovering over the bubble */
                }

                .message.bot:focus {
                    box-shadow: 0 0 4px rgba(0, 123, 255, 0.5); /* Highlight focused bubble */
                }

                .spinner {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .path {
                    stroke-dasharray: 90, 150;
                    stroke-dashoffset: 0;
                    animation: dash 1.5s ease-in-out infinite;
                }

                @keyframes dash {
                    0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
                    50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
                    100% { stroke-dasharray: 90, 150; stroke-dashoffset: -125; }
                }
                .search-badge {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 80px; /* Adjust width to fit the "Search" text */
                    height: 40px; /* Same height as send button */
                    border: none;
                    border-radius: 8px;
                    background-color: #ddd; /* Default background */
                    color: black;
                    font-size: 14px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: background-color 0.3s ease, color 0.3s ease;
                }

                .search-badge.enabled {
                    background-color: #0177FC;
                    color: white;
                }

                .search-badge:hover {
                    background-color: #0056b3;
                    color: white;
                }
                `;
                sidebarContainer.appendChild(styles);
        
                document.body.appendChild(sidebarContainer);

                this.initializeSidebarBehavior(sidebarContainer);
            } else {
                const isHidden = sidebarContainer.style.transform === 'translateX(100%)';
                sidebarContainer.style.transform = isHidden ? 'translateX(0)' : 'translateX(100%)';
            }
        });

        this.pillElement.addEventListener("mouseenter", () => {
            const currentHeight = this.pillElement.style.backgroundColor === "rgb(234, 67, 53)" ? "150px" : "120px";
            this.pillElement.style.height = currentHeight;
            this.pillElement.style.transform = "scale(1.05)";
            innerSection.style.display = "none";
            starContainer.style.display = "flex";
            powerBtn.style.display = "flex";
            authBtn.style.display = "flex";
        });

        this.pillElement.addEventListener("mouseleave", () => {
            const defaultHeight = this.pillElement.style.backgroundColor === "rgb(234, 67, 53)" ? "90px" : "60px";
            this.pillElement.style.height = defaultHeight;
            this.pillElement.style.transform = "scale(1)";
            innerSection.style.display = "flex";
            starContainer.style.display = "none";
            powerBtn.style.display = "none";
            authBtn.style.display = "none";
        });

        window.addEventListener('scroll', () => {
            requestAnimationFrame(() => this.calculateOffset());
        });

        window.addEventListener('resize', () => {
            requestAnimationFrame(() => this.calculateOffset());
        });

        const observer = new MutationObserver((mutations) => {
            let shouldUpdate = false;
            
            for (const mutation of mutations) {
                if (mutation.target.closest('.corrections-pills-container')) continue;
                
                if (mutation.type === 'childList' && 
                    mutation.target.classList.contains('kix-page-paginated')) {
                    shouldUpdate = true;
                    break;
                }
            }

            if (shouldUpdate) {
                requestAnimationFrame(() => this.calculateOffset());
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class']
        });
    }

    insertIntroductoryBubble() {
        const messagesContainer = document.querySelector('.messages-container');

        if (!messagesContainer) {
            
            return;
        }

        const introMessage = document.createElement('div');
        introMessage.classList.add('message', 'bot');
        introMessage.textContent = 'I can generate reports about anything you want. How can I assist you today?';

        messagesContainer.appendChild(introMessage);

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    async handleMessage(message) {
        const messagesContainer = document.querySelector('.messages-container');
        const sendButton = document.querySelector('.send-button');
        const searchBadge = document.querySelector('.search-badge');
    
        if (!sendButton || !messagesContainer) return;

        const useSearch = searchBadge.dataset.enabled === 'true';

        sendButton.disabled = true;
        sendButton.style.backgroundColor = "#a0a0a0";
        sendButton.replaceChildren();
    
        const spinner = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        spinner.setAttribute("class", "spinner");
        spinner.setAttribute("width", "20");
        spinner.setAttribute("height", "20");
        spinner.setAttribute("viewBox", "0 0 50 50");
    
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("class", "path");
        circle.setAttribute("cx", "25");
        circle.setAttribute("cy", "25");
        circle.setAttribute("r", "20");
        circle.setAttribute("fill", "none");
        circle.setAttribute("stroke-width", "5");
        circle.setAttribute("stroke", "#ffffff");
        circle.setAttribute("stroke-linecap", "round");
    
        spinner.appendChild(circle);
        sendButton.appendChild(spinner);

        const userMessage = document.createElement('div');
        userMessage.classList.add('message', 'user');
        userMessage.textContent = message;
        messagesContainer.appendChild(userMessage);
    
        try {
            await this.makeApiCall(message, useSearch);
        } catch (error) {
            
    
            const errorMessage = document.createElement('div');
            errorMessage.classList.add('message', 'bot');
            errorMessage.textContent = 'Sorry, there was an error processing your message.';
            messagesContainer.appendChild(errorMessage);
        }

        sendButton.disabled = false;
        sendButton.style.backgroundColor = "#0177FC";
        sendButton.replaceChildren();
    
        const sendIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        sendIcon.setAttribute("width", "24");
        sendIcon.setAttribute("height", "24");
        sendIcon.setAttribute("viewBox", "0 0 24 24");
        sendIcon.setAttribute("fill", "none");
        sendIcon.setAttribute("stroke", "currentColor");
        sendIcon.setAttribute("stroke-width", "2");
    
        const sendPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        sendPath.setAttribute("d", "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z");
    
        sendIcon.appendChild(sendPath);
        sendButton.appendChild(sendIcon);
    
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }    

    async makeApiCall(message, useSearch) {
        try {
            window.postMessage({
                action: 'generateHtml',
                data: message,
                useSearch: useSearch
            }, '*');
    
            return new Promise((resolve, reject) => {
                const handleResponse = (event) => {
                    if (event.data.action === 'htmlResponse') {
                        window.removeEventListener('message', handleResponse);
    
                        const htmlContent = event.data.result.generated_text;
    
                        try {
                            this.insertHtmlIntoChatBubble(htmlContent);
                            resolve();
                        } catch (error) {
                            reject(error);
                        }
                    }
                };
    
                window.addEventListener('message', handleResponse);
            });
        } catch (error) {
            
            throw error;
        }
    }    

    insertHtmlIntoChatBubble(htmlContent) {
        const messagesContainer = document.querySelector('.messages-container');

        if (!messagesContainer) {
            
            return;
        }

        const bubbleWrapper = document.createElement('div');
        bubbleWrapper.classList.add('message-wrapper');
        bubbleWrapper.style.display = 'flex';
        bubbleWrapper.style.alignItems = 'center';
        bubbleWrapper.style.gap = '10px';

        const botMessage = document.createElement('div');
        botMessage.classList.add('message', 'bot');
        botMessage.contentEditable = 'true';

        const trustedHTML = window.trustedTypes?.defaultPolicy?.createHTML(htmlContent) || htmlContent;
        botMessage.innerHTML = trustedHTML;

        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copy';
        copyButton.classList.add('copy-button');

        copyButton.addEventListener('click', () => {
            const range = document.createRange();
            range.selectNodeContents(botMessage);

            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);

            try {
                document.execCommand('copy');
                copyButton.textContent = '✔ Copied!';
                copyButton.style.backgroundColor = 'green';
                copyButton.style.color = 'white';

                setTimeout(() => {
                    copyButton.textContent = 'Copy';
                    copyButton.style.backgroundColor = '';
                    copyButton.style.color = '';
                }, 2000);
            } catch (err) {
                
                copyButton.textContent = 'Copy failed!';
                copyButton.style.backgroundColor = 'red';
                copyButton.style.color = 'white';
            }

            selection.removeAllRanges();
        });

        bubbleWrapper.appendChild(botMessage);
        bubbleWrapper.appendChild(copyButton);

        messagesContainer.appendChild(bubbleWrapper);

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }


    updateCorrections(numCorrections, newCorrections) {
        this.numCorrections = numCorrections;
        this.corrections = newCorrections;
        this.applyInitialStyles();

        const sidebarContainer = document.getElementById('factful-sidebar-container');
        if (sidebarContainer) {
            const correctionsContainer = sidebarContainer.querySelector('.corrections-container');
            const notFound = sidebarContainer.querySelector('#suggestions-sidebar-not-found');
            
            if (correctionsContainer) {
                correctionsContainer.replaceChildren();
                
                if (this.corrections && this.corrections.length > 0) {
                    notFound.style.display = 'none';
                    this.corrections.forEach(correction => {
                        const correctionElement = this.createCorrectionElement(correction);
                        correctionsContainer.appendChild(correctionElement);
                    });
                } else {
                    notFound.style.display = 'flex';
                }
            }

            const grammarCount = this.corrections.filter(c => c.error_type === 'Grammar').length;
            const factualityCount = this.corrections.filter(c => c.error_type === 'Factuality').length;
            const totalCount = this.corrections.length;

            const allCounter = sidebarContainer.querySelector('#all-corrections .corrections-counter');
            const grammarCounter = sidebarContainer.querySelector('#grammar-corrections .corrections-counter');
            const factualityCounter = sidebarContainer.querySelector('#factuality-corrections .corrections-counter');

            if (allCounter) allCounter.textContent = totalCount;
            if (grammarCounter) grammarCounter.textContent = grammarCount;
            if (factualityCounter) factualityCounter.textContent = factualityCount;
        }
    }
}