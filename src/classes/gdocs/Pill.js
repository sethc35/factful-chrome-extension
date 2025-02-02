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

    console.log("[Pill] Changing authentication state to: ", isAuthenticated);

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
        zIndex: "9999999",
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
    logoImg.src = 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAmEAAAJnCAYAAADfrIRWAAAAAXNSR0IArs4c6QAAAARzQklUCAgICHwIZIgAAAAJcEhZcwAADsQAAA7EAZUrDhsAAANgaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49J++7vycgaWQ9J1c1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCc/Pgo8eDp4bXBtZXRhIHhtbG5zOng9J2Fkb2JlOm5zOm1ldGEvJz4KPHJkZjpSREYgeG1sbnM6cmRmPSdodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjJz4KCiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0nJwogIHhtbG5zOkF0dHJpYj0naHR0cDovL25zLmF0dHJpYnV0aW9uLmNvbS9hZHMvMS4wLyc+CiAgPEF0dHJpYjpBZHM+CiAgIDxyZGY6U2VxPgogICAgPHJkZjpsaSByZGY6cGFyc2VUeXBlPSdSZXNvdXJjZSc+CiAgICAgPEF0dHJpYjpDcmVhdGVkPjIwMjQtMDUtMTg8L0F0dHJpYjpDcmVhdGVkPgogICAgIDxBdHRyaWI6RXh0SWQ+NmI5MmIzYzctOTk2Mi00ZDM5LTllNDctNGEzNzk5YjViYjMyPC9BdHRyaWI6RXh0SWQ+CiAgICAgPEF0dHJpYjpGYklkPjUyNTI2NTkxNDE3OTU4MDwvQXR0cmliOkZiSWQ+CiAgICAgPEF0dHJpYjpUb3VjaFR5cGU+MjwvQXR0cmliOlRvdWNoVHlwZT4KICAgIDwvcmRmOmxpPgogICA8L3JkZjpTZXE+CiAgPC9BdHRyaWI6QWRzPgogPC9yZGY6RGVzY3JpcHRpb24+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczpkYz0naHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8nPgogIDxkYzp0aXRsZT4KICAgPHJkZjpBbHQ+CiAgICA8cmRmOmxpIHhtbDpsYW5nPSd4LWRlZmF1bHQnPlVudGl0bGVkIGRlc2lnbiAtIDE8L3JkZjpsaT4KICAgPC9yZGY6QWx0PgogIDwvZGM6dGl0bGU+CiA8L3JkZjpE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';
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
        console.log('No page element found');
        return;
    }

    const pageRect = page.getBoundingClientRect();
    
    const offsetLeft = pageRect.left - 60;
    const offsetTop = pageRect.top + 30;

    this.pillContainer.style.left = `${offsetLeft}px`;
    this.pillContainer.style.top = `${offsetTop}px`;

    console.log('Pill positioning:', {
        pageRect,
        offsetLeft,
        offsetTop,
        pillElement: this.pillContainer.getBoundingClientRect()
    });
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
            console.error('Error during correction acceptance:', error);
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
      svg.setAttribute("fill", "#34A853");

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
      const currentState = JSON.parse(localStorage.getItem("factful-extension-can-run"));
      localStorage.setItem("factful-extension-can-run", JSON.stringify(!currentState));
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
    console.log("[Authenticator] Initiating user authentication...");

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

            const suggestionTab = document.createElement('button');
            suggestionTab.className = 'tab-button active';
            suggestionTab.setAttribute('data-tab', 'suggestions');
    
            const tabIcon = document.createElement('span');
            tabIcon.className = 'tab-icon active';
            
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute('width', '12');
            svg.setAttribute('height', '12');
            svg.setAttribute('viewBox', '0 0 24 24');
            svg.setAttribute('fill', 'none');
            svg.setAttribute('stroke', 'currentColor');
            svg.setAttribute('stroke-width', '2');
    
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute('d', 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z');
            svg.appendChild(path);
            tabIcon.appendChild(svg);
    
            const tabText = document.createElement('span');
            tabText.textContent = 'Suggestions';
    
            suggestionTab.appendChild(tabIcon);
            suggestionTab.appendChild(tabText);
            tabs.appendChild(suggestionTab);

            const content = document.createElement('div');
            content.className = 'content';
    
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
            document.body.appendChild(sidebarContainer);

            const grammarCount = this.corrections?.filter(c => c.error_type === 'Grammar').length || 0;
            const factualityCount = this.corrections?.filter(c => c.error_type === 'Factuality').length || 0;
            const totalCount = this.corrections?.length || 0;
            
            document.querySelector('#all-corrections .corrections-counter').textContent = totalCount;
            document.querySelector('#grammar-corrections .corrections-counter').textContent = grammarCount;
            document.querySelector('#factuality-corrections .corrections-counter').textContent = factualityCount;
    
            const img = document.createElement('img');
            img.src = 'pseudo-url';
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
            }`;
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