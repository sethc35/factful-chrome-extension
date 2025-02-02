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
    
    const offsetLeft = pageRect.left - 45;
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
            img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAdQAAAEHCAYAAAAXjbftAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAHlrSURBVHgB7b0FYB3Xlf//vTPzGMQsmS0zQ2KH7KRJGiwmbQqbppR226awhV+X6u5/u223u+0WdrvldptSUkpDdchhNsQQM8q2LFksPX4z93/vnZn3nmQZJMsg63yS8QPNG7gzc889cM8BCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCOJ0YSCI02TVmr3++59Khze9erg8/ddPVpRWVvtLKsJhI5AOcs3Q5DoMXm5xr5np25/oPNzd092+N4Opn+itu+IdbRMnF8curhuX3u9H8t5bmQmCIIhRCAlUYlh8+Afc82LT3kmbv3vFlWGfZyqCs6r7rJrp1sEnZsIzj4FlNGh9YnFvMV0sAQ4eB7I6R6bZQlFts68ovNVnZVp0c1cs1tnano7euKf8DR/aeNuVs5vKwvu7V906Ow2CIIhRAAlUYkisWsPDv7l/95Id377pc0agrT6b6J7Ew+8KAn4gHWdI7QI0oWQyqZiK24sV3mJSqIrvLQ5IPZR5AW85YIQ5DPE5E+fIdvVoxustuhVoszwzdhZf/sG/vP+ji14IvVLRumoVs0AQBHGeQgKVOCm33MP1+3/+UH20+Z63tzZ1fwhdrY3wzRb3ThZIHhTCcZtY64izthSawZNssd15jYol5LzvFssEIW9rhWwWixYRAnqTEL7ie9ad1ovqnqudPuUP7ZuaX5zxke/vevVrk3oYYxwEQRDnCSRQiRMy97OvhZoe+tybu9qN9/N4egUyCU3dNsl94q8+sXSKpdAqK1XPBE6d8IDPQmtFxFmE2hqoFrsLCO01Jl77uKaFDwVL4g+nItc8e+XnP/nA6g8WdYAgCIIgzme+8RoP6f6FP9H8Vx+G580WvEs4WFhqhWLRxOIVC3M+j9SiO9v1OK9+sRSJ/c7j0FcI0/DbOKLvNxG+uU33BZ4smX75h1es2usHQRAEQZyPTPmbXyzwlMx9AZ7lFjxvFEKtbIQF53CWqFjqxDKTQ7uEI/xBDs8CU/NP31q9+O3X4eZnIyAIgiCI84Xw1f93hafyludR/GYT2gxHU6w4DwSqq8GGndd6Dv8KDt8bLZS8YT9CC/993LgbSkAQBEEQ5xrPO15ewkqvXY/S91vQpDZY5QjTmvNEoA4UriVCW50mTMHzLWBcStOn/GrVKm6AIAiCIM4V4et/dTkrumYrSt8lhFPEEaKFy/kmUAsFa6UQqsIM7FmR1LzLvkF+VYIgzjY6CEKw+I5fTTr01IP/aWazi9H9JLMDwAcqen04P5FyNQ1YnYCvzNCNZHHbzntfSnU1HwJBEMRZQgMx5ll1D/duvPf//WcmEb0CfTsZlMW0UJjGkZ87er4icz6EgOR2ZK2aqUh2Llqxhky/BEGcPajDGePccgvXv/LVr3wkky2+DulXdFg9sMdZ7lhLzintxvmPnP+aEUuJeBs3Ur6Jk7d+9RE5UTYLgiCIswCZfMc4B3tfWpxp2fMvFqI1SK1lKoWgQiZrkJppL0YP8tgDwgLMmJn1WrGD+h+QfjIOgiCIswCZfMcyt2z2Jo1xt2QTRdMRe7kga5Y0n3bB9plyjB5UgmA7V3Bs9zT0rgqAIAjiLEECdQxTf+Qny9LNL38aaDbApVnXCe5BK2zhNNqQ5yBv6YBMyp9FaEkGBEEQZwkSqGOUVfds9h7ese4jQKWB9EHYwjQJO/hoNGmlAxEuU01o2CWLXsOkO1IgCII4S5BAHaM88LqnnnfFloNVCPnZg5FFxroFhrCMYGycrE/uG8d90erd9W+YnwRBEMRZggTqGGTVKq6t/8qbPsV5Yz1Se2EHH40k8rbSh7CM4G3IfGKTWR727mi+/t3LKMKXIIizBgnUMcjjqSNleqB3Ajw6gyXNvWlcMLCY+CeSTbejpfaBUekIJgiCIEYLRtHEq5k2rgPGzXYu3BFPBeh1EtgXLvqAxV/wN+/I7dtzLWfFFzcZV/zmMhAEQZxFKLHDGGMV59p/1TbO7LIWRBGX2mnnEH4tbxfLWeQsGw/sZAqFQUzyuxrYxo8+uzg4j4qPDWIJivdCabSEiZkLrZiJ7XCpUcq5rkedVxP9DSfubB53vyeiSGwvBcMXTgbjr3i7wZlTr5UgCOKMQwJ1jPHkl/d5zfC4WsS4Zs81HQpCMKrMSXKRgrMMdlRwoclY3lJyuyVilYW2fCyuhK9hAvyBMLgQqLGeXpjNh4X87LTlJROC1pS/E69IOduTwtP1saJgvydCrMu7kInPHof9T05etQprxEIClSCIswIJ1DHGa1t2+eKp8nlIHBb+05MJKEkI9m3iBhpJoSczEvmcxdUg5TqukJWxQLXip7WovPx6zJw3A0U15fAYulo9Fc8g3tGGQwePYNvTa4E9T4ufh8XPpJYqhXEH8kKVO9v2In+7Hk9bFcfDxG+9ZdwbmOF58gp10CdTawmCIEYEEqhjjM57VxWBJS8BqxOy6tXjrOVOexFCLieTLOe96650BZz8TgrVqPO9MOFqS6GX1GDJp7+MaROjkHI0Iy29FocuVo+GxW8rQ2hoHIdZyxZhz6Y3YvtDf0B8zyYos60p9xW3t5VTMAu1VRODJ55wjs3s1TV2wAOCIIizCAnUMUbFpKzv6EGfR2mT6eMpb6UYPM2zK1x5wWdh2lX+T/naa/9O82HKm27HjMlFyoPJLbmmEKa6rc1anAvTr1yEyA7omLNkIqonfQyv/emPOPzaOqGkSu1U+Gb5ZtiCc+DsF3kM8tZlA74X61kThArcwrLpw9mKo2TuPVOI66can7FjfdTu3xwGe88wzN3izDOcfQz3fM7GftgpfleIbAM1ih7s+hLH52zdCMR5wqyVd87b8sLul4V51IvkahwrrKSJN+q8l0LVNeXKwKJie54nF35OVZVG5vqVWuwO51V+ng3P1Mtw9Uc/hqqaqBKomgwN0qAEqITL/2Sfy+VTy9VN6DUY+mIZ7Nq2HxvvvQ+JvWvED8V+mdBms8LfChlAJU3UZc7xwPnsBjFJbVaYotk0+V3S62MfSCdf+DWIYXPtt47WPPfM9sv71m9YgnhcXOC0Aa94aX2hJDDn5tjyd63onTUxzCZVhEwNWWao4bkYOlmmLkZPciSV61/Et5q61NrALqegv+Ysd4cw5N/zgk5dbIA7v1K3E2PirWXZW3fGh4xp/YWANfjAkQ0Qnlz9zl6XaRrv5yxgxwpaeSbiIMSqOCXEwJKpTQ6yPhdtdfLNqJMsaFNN/W7Qfbl9O3Nfjdw+uBoHiQa2TPlX5hQ/hnplLCu+EGNeTUYNxkt8WkdNEd9VXqo/PSPKzvcajucc0lDHGJHoDD+0ZvFcH8Hg7kX3lpDC1Gu/1WQ2pRKwiE8onz5YpgneJSNqxfNlSYHcIJYWKM1WL0XVuBpES4LQWb7/lEKUuY++6P3Ue7E4Squy8nq9OhYtnoqZc/8Oz625Bq1P/hk93S2wOqU0ni5WFgLTSjvSWUYIt4nDFYI0vU+8r1R7QXAiDN9LL9fd9rvn9v73QhBDQ2qX0fHX3pDo6Pvc6s+tXA6eMdQ11qrEH70IVtZg2aqv4KqltSgO6chacnCUVdfPVGMzeV3ERTWVuFPbLPz3WE6mQJ1AAJ/yOqeqN/CCdc+2YnYqx8gHrMdx6udmDrI1bcBnrupKyFGCJdaXI5ZuMWZt6mbcOJR97Debst9u8OhPXzqdjaYSVGcVEqhjjIT3qEcIIsM20R4vZkd+7/pHvWBl41Az+1JUz78c3uIIMqkUeje/gqb1TyPRtBF2cJJ8YIX2aB5GMOCH1yOFJrc71wH06xJ4vlvQxFA/mbWEz5VhxdVz0X7RdBxs6kLvti2IdTXDFL12WjhjGTPh9zEEiutxpCWDrue/KbRY0ZvzVvGasBjv3XPF4gUte0EMhR+8yj0eX+TzWWvKF2HMFhexT0hMYY3gYnDlDaFizmLc8IF3YvaMcjVYSmX44EZc9f7kAomTMfHcwo796A5wdecbR8FlWdO6cn9bZkK73/rezp38B1OnMsqTPQgkUMcYzJRjUCn8Bvog3WheGcUrBaRfLf7q2Zj7vk9jYuM45e8U5jTl/8zMuAHjli7CS398HL3rhWWVNQrZLH7ry8BTMgG6NsCg5r4f0NnKj8qnCvfxZUrbkcK4rMiD0kgl0o2lSIrO29Acg5VY32NoMMSydmMrNq4vh5kSXYBRC5be2zlxxQe+//M7GOXxHSIfX+a/I6td+U8wgj6k1op2liZ1acoPwuepxS133Y7pE6NK+eTuOGzwMdMABpecjJ+qdkWcCfgAiZqzanNW0DVw2z7MmC4evynxdPafXojLkSt+C+IYSKCOMYy0kHgsbNnzPQvNQNIvKU28UpAKwcWE/zM8EQv/9h8xe1oVlByWj5yjVsgpMJMb61Fx17vxp3/cjmSz8KNqAbCQH3rNOGWVZQUPLFOPK0dLewq7N+5EKpVBZakfUxZME5217mzXMQ4y250mO23L+d4nhKeuhs3CW2fampE8JsMr/axiMYTZOfFyWlt4+6d3rP7kyyCGhHfFN2anX/3px5HVfUg+DNtXLQZWhjCl+4pww//3n5gztUgMbGzNkhX0xScXi2xIXxNniePEG7EBF0Zeb2Fvgt8QTtU0Kz/YYd31l+18w02N2E5BS/2hXL5jjGT3piR4t5Bucq5nobnXNfE63/EM6lfciMkTK4SfDOCDaBNp8YfikIE5t/yN6HTLhZSNwvCHEC4K5UNKpGB0F/G5vTslzMT74Os6iNeeWof9RxL9hKmL1F6ULi2WRNpCc1sCHT0ZO4KCcVuXZQX+LrMzYxjsvsiuP90PYkjMXLXZq++47wZo82Ygsx/2oKrDDggTGmrVsquxcEYFehOWHZ2tQsmoHx3tyGdssGUg8lqb0qtq2dqqMPfPPNiRun7fPmXKIgogDXWM0bJ3bxxWyLKLcRdiOIvQWo0Z0MoqMHHpEnj0wcdc8rmTwZNpYZ+tndQA/8RGJA92CN8mR0mxP6fCFPrJ5DdTxoUx6Z3XKz9pY3cCQWFdlA/pYP407vz7+A/+gHjLbhgeL+ovvx4Lr5gOzSi0SumWgV1PzFt51SfXrv63oaZ/GvO8/uMvh1mX93ZYh3WY8r5wo7uFQPWHsfDiixD0e8S15uBDiYMhLhjkAFYOozRNPasRi7PLd6bi0ux7GEQOEqhjjKMdFTEwvRXpaIM93WWgq1Gqo35UjpuCqlo5H1VNDuhn4pPIz9JPmskCUSFAy6qKcWjbBkQWvxUVxT47BcQgQUmJFMejP7kX6a5uLLv9VpQWB1QksDmIQNWdUODlt78FJVEDPX1Z7N7brszAuVj/rq49rOrq//31Vz76zVtvZVRdZhiUlU29vr1lZyO4z3F8y/zO4m1gDqqn12HG4ilIiQvk1UmSjkVcE7Ay9du2CS1tYtruXkN2ECRQCyCT71hj6UcSetmUl4VQhVpyFMxH5Tvh85fC69GVn4U7iRgGiwqUcUJS8Hk8Qiv1lWLqNStVZqTCoAYXTWxr46ZmdL7wJ8R2vIq9W3aqFTPZ/D54TlW1cgkgDJ1jy/ZOBLwalsyvQUBGENsr9c25eNKP3vLRm75HwnR4rFrDjfbtf/4gWIWOrJxKJX3rTlCadRR1C1egLOJV0Z9k5B3b2O4W+RxLbZXpmSTTQfSDBOoY47q3zk6EAkc2IVRiQast+Iv0qcrpZVHRcwp/qBCwtimWOwn9WEGErh1pq7Ls6vZSe8kbsPzvPofGCUVO4gZ+jBk3nuboeG2LuOuEFqz7EI8n81G+uf3Yny3XBytWfeLeNVj/7S/j4d8/l5+Nz6TGhNaaiOf5ez/TcCpJiYlB+PY37pvBrPQUO1+ATMwhLRZBcVEvgr+oHDOXL4LPY/ek9hQnntdYBvxHXNjYz6b93sN43O9LZUH0gwTqGOOiT0zJWD07W8Eylp0y0MUNUJI5fCNIp3qEMJOCzQ7+ySW4Yflp+sr84/jUZjZWYOasOvszZyqIiQ/QajRmC2LlfBX/V5SFc8JamnxtQZoX4HKfTa1xdD95L6xUAl0vPYlUxikdx9VQef+kCpVCiRgGiz7MPd2Pfu0O7rmiCtk9yPnRtTphg/ehdMHNmDkupK6J5mgnLD830b0J8gtxQWM/myq1UoYz9npZONwBoh8kUMcYqxizkv4bdsI0moFpg6yhJoGiq7sbHd3JnBlWCTuTu+qhLTCVYOO55Aw5TUXeVYPcWYauoXTOTMhgl+DEyWiYVHtMiL7bN8t9yty/nZ1J2MnSTFVLVYXwa9xZT9s7Leo/CmJYbHr+x1O4oS1DplnYGNpgT5uK2NOQNBMXXT0Hfm/hFeK2C4BxEqBjDq6mzhiainfoFs/mk3M9IIE6ABKoY5D6K2/ebLCnNsE7kdvFwF2kBUcW/+5Gcs/L2P3iK8rEIxVK1xx7rGFvgHrCMejKburBJUsasOjzX8dlH3wfKuuqVOestiD+2N3ei77OPiVM1QQe8RqOem1hqgcRWbQUfoM5KWJl5Rp+MDMNZO4dBqs413xtv7mY+6bMhrWb2V1B1hamrAreeVdi8uSanIlPQkbdsQl3MgMrC4XsD0y+qypgPTVlSr9CyARIoI5JvrhsSTtPtjSJ3tKyJ/BLZGIHeTt0qxR+PNuHHU+uQcvBo/AYeaHJuZtswTb5snwO81yPywb853xpF30T21owvwENDSUwDNusK2fmyNenHt+BP//8CTzwy8eQSttSvK4iiKLpSxEePwXzl8zIZSKX0cL1ZcaOlYyRH2cYrJr46WgsVXwNEkdCMKV2KmO6ZJ7kkDAlFGHxxXNRUeQT2oht8lfF+xgK5v6OQgYfERKniOZ4WryGtnVZqe8AJXU4FhKoY5A772QZX/2ih1jm1V6Z3chGph6UQXvyGZGVZISm2rIVz/zqHmzZelTl0VW+UfCCfonlEz4U+NJOGKDCcv/kv3LmtK68YS5WvGMFUibD2kfXiX1yBH0M13zyw7jyb+/ExJmTclHAGZOnJpdqm0AMi6qaSIOVZFcBKXER3WLuYvEJM29tBabMm6MGPMilhRzlwlRCvt5hobKccTvPr3hOrZoi9kJ9PSi15yCQQB2jvOfbzz4GH7bBP118kpVapBCVHavUVDJKS4X1OpKb78Wr3/w8/vDf92DdljYh5Ow0ZIMO9gs6rMJpMNx1sgJOgLCTssF570YLl0S8mNhQhFlXLEXbxlfU3EfZhxeFPagsD6hoU1WtS/ymKKQdDvq9+0AMGVlR5ujW9bcjtb4caTkXWUb3imvOhPnfzGD8pPGYPLE4t77jLR+wEZzAvE9caMjrnxbPftCnvVhX43mAtNPBIYE6RvnhzSzumfHR7yG5NwtWj/ytIC2oUrjKKiOyo00jm+SIv/IXJONJNRdU+VOGmti80CSsEuznsyjl44a5MjF2NXdAjxarAIhctDDLVapUyfNLQsbu66YoSUAMkZmf3l/NY9vehMAspkrgqbYXlgrvVBiBLky89i0IB+xrZJvjGQar+TmoaR+kBF6Q2C6bhJdZv7q8gjWDGBTKlDSGqfC0PnUoVP8q4smLYW6DncNVxvjIyf2e/IpmCxCei8lThEKT5fkpNK4tcIjwggmqnNsVjg+3JbF780HwTAqHnnkKM295m6ooYw0YByt/nmVlQjp7Qby3QAyZrT97w/UIXlaOXmkxj8CefyysFOLa+sddiTnTypQVwnJzJju9qRuccv4zzBuTOC7SJSMGV4c1zVoL4riQhjqG+dB1Xz8cCu35X0SDXfDIJA+yVJf0qUp/akHeayuN6LLLUFPqz5loj+E45r9jGKSfUz5UbuFwUzuOtMYx8603Yc6syuPk9+XwellXXwYvgRgy9dfeU6qnO29EurcIlswaJwdQohswZDS1hRlvuALVJUZuVvLAaU0U2DM2Ec9oQvhQH6krDuwFcVxIQx3DrFrFrJIP7/5z4pfXXm15lr0Tmcd15UuzkwrCLTMMbzWmNI5TQSo8C8eDOohkPFlHm5tk2v9r6ROdUB1E/XsvUr5UpZXKmqsWjjU1it9HfNresMeiB3sYtK//72kmm3ExEk3MzookI3vLREM3gFXMx/Klk4SpnSEjfeUDatqyUaP1kXY60gjtdH/Ip9/7wt1qwjJxHEhDHeN0/nByd0nF/J8xc1MHfAtg+1ClliqFqUe9eicsQM2E8QW/ciakDaff4oN/kPl8ZTk4aVLOZp0MTGqOTsGq9pxYKQWeHV+TpaTcw4CVlMwEi1aCyaI8MgBNXuM6sZRi3MKpqCoPqXJ9qiYtp5SCY518TD/bUuc3XpODcBDHhQQqgU+8/9413gnT/xm8w4QxAbZAlR2tMGB4JqBu8gSUVUWc+acDMrcOcSpCImkia1pwCsmorEeyao2ddNuZjCPltcZUMIyCO//YWZkOh4Pex943v7gbxJBYsYobiaYDdyF7SDhId8EOPpMNXwOtyIM5Fy+Bz6/3sz/YBgUSqmMR99EWAywrGsCr184ClUY8CSRQCWX6Dba2/UY3U4/AM4vbdlbhUzPmQC+qQNX8i+H3arBM5xFjw8vlKre6ZVc3Hv/9Mzi0+zDiSVmwWlMhvBmTo+lwL7q7k452ZAcgqaUgOYSZNV9eXJx+mcL2h86rj/xiOU/Gp8NMMFs7lU0oBk56BFUT6tE4o05dCyM3l1gb8oCJuHBQd4D9eO5tLPfeS0GAJ4d8qISio+PRnobFb/7Ckd2JaNa7fDm616luNFJcjJrxlSrKT8kw7tZFdJyhQ+hs5QPaOCGCV1638PR9zyCCPgRKq6EZXph9LWhNh7HwhitRVuIXo2JLaKia8zuunmpxCJnykPHIW5ZGKIfoEPnBq9zz0cuXvg/eGi+S6wv+Iq9kDA2LL0Ntuczla6mCCO5YW0VhgzjXnKu45bTwwvgMdm+6AftBnBQSqIRCany33HLP64/V4P91PXP3z3hw4RQk9iA882KURD1OoJCz7nAebUfrLI54cPWtK9HR3ouWlh4cbE2oCePFkWmYUR1AeXXEDkbqZ2zksv4iN02+dv7M6F9IOx06d33y3ydx3jYHpqwJLU29MqI7JRTUxfCX1WLeZYvh1TU1kLFyiRxIlI5llBDnvN1n6I9Ris9TgwQqkePee2+VdsBnUf/P30HLC9+Ab6Jv/LxZyp9p8dOM8sxlUJJvLBSXRVBcGsH0mYVjb7s8lJs4Iue7E++zWd5VFGa/vn0GawcxJBZ9+FXP+v+77i1cf+MsZJ6F7SOXo5ZxwkHmRcnC6zCtPghTBSFprgmCOI84N5eDm8L8v9GDLEXUnyLkQyWO5eDqXyDT8b/eCdOT9XWlqi5qXicsSIjvkMua5JZtO+nT79x2DPlcwM73ymM6IAuT2Fsy5NdXFwe9D4AYMpt/8a/juBm9GukWP5TlLiiWetGwcq5xAsuumqYyIvFjJv5KlxkZA8YasgKUE93brRnsoRlZP2VGOkVIQyUG4aWey976ra+bc99YGYoGbxGdraHKuNnpchQ57dE6jn9nkPmm/X7nrnayhOuyDGuWP1Nd5vtPeDxNIIaMr3z79FRH7UXClu5MLO0SDV+t5p565lyBqVPqckk0CisJEWMXZSvi2FnuYY8sW0SJ8E8VEqjEoLzn7z8Vf25rlym0UaE22hql5nSynT1ZGB7hhQsYOR+nhOVy9bJ8mrrCfnnQXBDciW0aVLBmU1lrc13Et+pLV3vWku90ePRlGq5Hpk/YdPfAzoBVY796Qrj0ivkoi3pVOkmT503vLhSSNDaR11341NctWeTZS8/dqUMmX2JQNu3vnW3o2lJhktUypiXz59rFxsWi6cCTzx7AgYM9uYQLhd0u51Y+MUNhdqTBFitXabXfImRySvzhRZ+u//PX3hR4gR7q4bFi1aFyq2PnbTCqxCjnCOz5xcKHqo9DoLYCk+fOFoq/5mio9txfO7paU/8RYwt3gGtaPDWumK+eylgKxClDGipxDA/t5L7Ht/Zdlczw8bKjVQkWctZeLjRTHZMrgOe/8x0ULVyGuVcsRl11VM0l9Xuc0m48P131eChzr5OA3UG4a3m2N2l1eQ3cU1vk+VFcD20jYTo8ZJk2XZ/3BfDSYpgHYI+fq6AEKtMxoXEWxo8rUevSBENCIR91MR4OetizDUHvUyCGBAlU4hie35qs7Ynzd4qnywd3CoUz7UUJV/H/tLkTYfZeg3U/+yEefepB1Fx2BcbNmIu6KbUIh7xKsJqO1jOYM1VF8XKu1hEarUwZ0WdobE/WwgtFId+Tty0O3L9yIiPfzWkw6zMHS7jeuQSB6xh6HoU9VSYqGr8Y3lAcjde/CSExOLKDkci0S8CdZx7zG/zuBRMZZUYaIiRQiWPwBaw3pLv5JMNw/KFOoIrUb2TQikwVKDOozFi+BFnNh3Xf+zIO/bUTh555DNH6epTUT0N45iKMm1SJoF8TwlWH36unGbdaLWidJpeRTDwj8997DS1maDggFKZ16TReKvFg1zffHugkrfT0ef1nb7sCvpWTEJOxXHZeZhd/3XLMn1aibPgyWZU+SHNzPvqFrFWge7Pc7NpjfcUnZmwMNpQHRj7funbY0rVNIIYMCVSiH3v3cv9XXuq5QdfhywUXDcAuDm4L2rnL5iCT+AK2/eFXyKSFIrR9D3q2bQR76vfY6Q/D8IpOu3YxwummZ677+09+IeTRDknR3Nkd41k9aPl1zic2RFOBHqTvusX213wLxOlSveCLFe27X1+ZyfBKmHLqrpx7ym2ZKq7r+CsuR1lER9Z0bAijePgy6KHLObWsf97EwdZjpyIrc41z4QrW3EQZIB7w8NVFUe8BEEOGBCrRj7v3JS9OZqwlfhmoUjBNxsVNWC+jQjXDfr/0DRehuKYBL//5T0jt2GhPpckwpDMdSPOjQMduMx4Iv/jzdxWtI83z7NC194EZmXjZbbCywmwfg62hisUKQa+agMsvmaLSSdo2vtEdfHSiG6pwoOBO0XIyAB3z99zfBkpZxt1EjAW/udCEKxP3g3DBMHYw7NHvu2UKlWkbDhTGR+SQ+V73HU5f6tH1ElsLld+esLvK5cqfNrsWV9/5PhTNni+lqei4hfvT7BS2RVms/Ig5/pb/9wcSpmcPrapxJliiFErpl82etl/94zHxkuWor4mqiG3pIc9P5D+/GeoRcsfgy3O/Lfjk3LeFi3RjyAQXsuqR7rxXn3Hsvi+EW5nnIurt62+KG8Kjsc2TKoz19KwODxKoRI7m3tR4C+xKpnG/nWpQcuKReK7Ml+iRqirCuPFTH8aMv/0X0W/PFApRmeiR6oRTNtpx7VK2GcRZQaYaTDT1fAx6QKgdruVOXFCjAXo4jdlLlwnftj4KROjQyRU/smPnlIVbWVNyBYt4PpnXcW7tQk3W1VhZv7/D+Xv+v9GMHZXP5QDLLA6xZ5bVoxPEsCCTL6G45x6uP3Kke77oeWZossvQ7O7kVAJTlDbrdCpBn4Hll84QGus/Yt2zG9G+5leWb/I77vnhnYszIM4KOx756g082dcIrUjID+k7lU0vrqMeQEmJT5Vp41ZBxSCMjgQOp+TuhAywsoVge5+FvngayaSp8lHLv2UzppN45Hi/zg8jPYaOSMhARZEhtFfmTAXjtkDlA6LXR/noRA6ghXa6a9Y4z+9JOx0+JFDHLJx94J6ekp/cWtSxZg03jkYStd59+tuF/7Sc81xyhSFszn6xVBFwjvJiA1ddvxAtM6pYZdRTf/E30ouzsHrSJqwfr/rXcc3NvVNv+Pw/voK0YRoBM1XmCyVqSjMxXhpJfHYu4vRQD49V92z2fvkdN74XvnleJF+GPVXGifBNN6N0/kdRXezNDYKUNpcz7Y9Ov6BrkpViUgrOzr4sXtzUjr33/xQ9MY5ESs6+EuevhWDqJeB1M5z7deD55lJ9qRdPshPhvt2ob5yM+detRGNdwGk3RwPmx9nMKKIg8DAb9uOBi0pBeXtPgwvNs04IQblqFdiWmVuMA0dq/PubO3yzIlpJ1G/VMM1XneKsMpVl0e37eiZ1PfDdydf+07/uCAWNCeKxqtIZmyGEoccZgjvbO5Hht38H1O8ruWhqkrj8kBWrdAnlQCZdwoanX8hsWfN8qW/BDQnNo1tW1sxyy0xaGd6jG3pfqCjYUVke2FocNnaUBNn2TbvY1ooqI3XTl2qTq6jI8QnxXvK9WZl1q3/OubEYyedgJ8I3hXRoFMPnSrz3+9/FkqlhZPOORWUOHY2BNrxfikT7Nty4vQ1/vfuPaFv/KNLpKnHeEaFpdqP68rfioisaMbE6BMMXcCKAT4KZFWImjYdXb0LTUw/jqvffhuUr5qtgLntOdoHpuN/wb3S0o6otJNpB+k5NzttK/Z73ffAi40EQw4Y01AuEH/yFB59q7apYu2335J8e7KlHs17HvS1zNM6mvnI4UZtJZoqQtQLMo2mabsDr1ZA0qrB7c9MVc5dMhJJ63NZKpd9JBas42z5+98COWcEd73LXrGZ76Q3xvlx+4/MwoTVY8AT9CEQCYd3QwE1LabVCmKotmKLHOtwSe9P+/emM+F1XOBrYeaSZv/yzj7RtXvKVg2svXVR34JvXguaqDmDRh7ln/S9X3si16bMQfwa2duoV1yCrbHqlF1+NeZOCjs+MFQRQjOJmLLgFN+/pxc/+81fge9cLYegT57wfwbIpuPi9H8LN1y+wK+qA9UtkcbIzl7Hu77l9BTZcPAf3f/cnag72ssvnqUIR3GL5sWThmHKUNKd77GK4ZQW9bFtFkb4LxGlBAnUUs3kz9/7X6y11jz7dceUXfvfqbM3QZjJDn2ZZeomZygR4IuvxeoTw9HkRCPrs4ArnKZIvyRmXoHnt85g6pwFFwldkWv31Urty6Slg5X+gfK7HlcBM+beaDyTgjdarY3F9WvKATNPK7V/XdRjhgEd8XSHka0Usa14Ei8V6d7Ud2Lnx4Po/PVj0xN/9peeByLpIx6pVpLVKNv182mTOy64Haxc23b3im/FiaRMXZbpo3yLMWzIFQY+OVNZJouxOBhmlCRyYIxwNIeRaujN45Oe/AN8nhKks36lVQy+tx5Lb3o0rr5yr1pWpMWXkL+fHqJQnZf70UnS/88144vf3o2F6I2orArlAp9GGW7hCFku0bEtFzGOwx8rKcBjEaUECdRSxinPt/i/Dz7LbGxJp4+JlX113s5XJTA8Wh8ZrfpVF16MZjBmafFScSjCOr0zOMeOOA0j1A6I38JWVo+3IfhxYvxlzL5/vZELqv89T7jNOoX+SHdDBliQye56G55J35k1lzivvZznm9kjfEZWG4REWaRbl3JrNoqHpPX3pt/33L1//aFV18SNL/2HTfaYn9fpNWJQcy8I1Wjd/alsrFiC1Qaj6Mkev07BGNULTZ2ParMnI8IK5lheIfp8Qg7KXn9qKw6+9LkaJ0gUoujVLw4SpM3DdGxfC59ULytLZA7589uiTb19O05W/W7x4MrasnYGNL7yGupsuHvXNpx4v8cAbOttT4mMPXFKOPhCnBQnUUYBMVr/qV3vGf+996xcFI74VXT2plWbWGu8LeL3eqN+O0NPzpib5kFiWOwm9wM/E7OLdUg9k4u+6z4NARTleeeJFlEwYh9r60mP2PaRB+El6mHTWwqYnn4MRKYMvElQHrGmFhsfCWfj29nJTGJxgJ/Xe4oYcMURKwku7+5JL27qsd0cCxoM/Y5sevvabTS+u/kxDB8YgHXHjRmQOh2G511G2XZm4OcKYtmAmxjeUOskcGC4kY3kiYeL1l59Gtjctbv7tolebK157Memt71a5ijOmLRCZO3pjhb7XU3BtOOuHgzpmTyvD1n19SGYs4b7QMJrDUFQubXH2EYOtu6TMs5VcKKcPzUM9j7nlHq6v+Prhxe/9tw2f3XOw78embny3L2l9QJhvp4YiAa98ljOit+CytJoQVtJkms2atum0QAAVwplt41EaqzCBeWsnQa8cj5d+ew86erP2Osjn9XSnwhdKy2O2qg1YJAVz6Lnzft+eNrQ+/zD8864BcwUp485UhFN/lqWQlYJYDCrUa8DvnZhM8Y/0pMz/eeH5g1+Z/Q/7ln/6eTVfZMyw4Is7K6z2LbdAKxUjpgTssbLUTmcgWOrF5CXLIAzo4prmr+iFgBRnzR1JtB6V6RXl/SvnA8WUC2HKuDCyptXfqTnIfea6N060D4l0V1RPnYqjsQD6YplR24pqcMHtaUDinLJ1JfojtbVIgDhtSEM9D5n2+W2RinCg8dGHN3wk1Ze6OlIaqhAdRNA1Zhb6Gl2zjfvQK7PtgO1pg0Q0upO5ZSRu0bRZ6N5q4ekf/QTL3vUOVFYVSTOQM7J3IyhZLnOSHdl48pG5a9GVpt7mQx1Y98BfYU2/Cv6isAo8yuWQPcGmjjtpnuf9wVyarTyGIc5lvF4S/OD+A2033v3T7idmfOb177Oote71VbPTuICxy7Qt/QJYQzEyR2FnRRKwYhWpWl5Vi9mNJdB06ae+sJQQdf8nUsh09ojRpRSqHnHe4sYVT4IMIFJxAG5dXodCD2r/SGF2/J3AzqRUXR1BpG09DjdPQGlxLUYrlu1NFoMsbX1Dkf4EaacjA2mo5xFfeohHx39q61vbW5M/3LSn40EhIz5QVBEZL0RYMCs1UFXkO98FuEFG7qI5wT0Dv88JRSAnDDWnYoxUWKwsF0J1LvpKpmH1j3+LV9dsRp8wo8ntub5XV/ANuk1euNjRo1KI6k4HvmN3Bx77xT1IBysQnjRDadS5To3lNeJjYMdZBkEen2XK89EMYQivF2OOv2lujd97cGfyGxM+ueWiFav4BTt4rLzjlSqub1sOT0g0+D7kG6oIMqnDnPd8AEUh24/InP9GJYPcJPJMDL8HLCCLpofslSx5Y+s41JoQQtU2y3LkheoxM1xOpqIWRASXhD0oq6vH6weS8Bmj29wr7oZ4xMv+b141awUxIpBAPQ+QGsZN32ye9b3frP3X3u7094UR9xahcclK0CybsU25I0mh1qmEKrdH8aH6CfBPnIOtL27H6h/8HFt3dyJr2WZfy0nuKxUcIdudOqb5LbIBXbWcotDRncaz9z2JF773dfCqqQhPntHPZ3rmuiPbJGz4/fWG1/Phzvbk/2w/svlvn2+6MM3AR3/7kau4/7pGpHaKT04JWSbHD6KF65dg+Zwy9d5W1EavEDjeoQdDXoRLw45A7XZGVh5s33YEGWvkFC/Zfl6hANcuXISmTQeRzB53KHjeI8MWvQyHdC3zEogRg0y+5xApSOf8w97KCR/f9O7O3sznAiF/tdREmRhdM5Vbs//I+lQ46WB74PpKqOaDmAI14+CvbkDX61vw0vf+A2snXYpJMypQUV2FaFUZIqLz8vl025wmdiTLf1mmDG6wlE821ptAd8tR7Nx1EIde2iy01Dh8y96NQFmxk6OQ52bZnMmuyDVP64buN3z6wngyM+vGf1x/8ZRPbfwuJs1Zt+suu1TcaKdq+arKzs333JROZUrBj8BO5NAmhEupsH6GMOPqS1AU1pC23eOjWZwel5KwHw3VpXh9vbyz6qB8yMI/0vPC4+i+YSoifk25CNxEDMMdntpxBQxTGyuw4e7/xaGOZagv9YzKNhXukVTYrz1UFfXtADFikEA9hyz65wMLW4703pUxrTf7g76oFKaFZlCNDQwHOjMoE65j/pVBTTJgqGTWbKSnTEPm0D7semkttmWLofs5ikMZIVAtBHwGvIZHBbmkxW+yYrSeSKbR3hWAlU7B6+1DeMHl8JZEnSka+XMZzM97plADBbEzr8/rE6bmt3X2mNP5uvXf+8RD/PffvZ71YJTTt3/1nHSi7FpYvczWTiNQ5dr4RHiKy7D8okZxfbgzZ5LlzL6nxkkc3OcJfp+GivpGcWM9Kg5XGHb4IWnbQax9E1o604jU+DAS5yHvW+nCqCrxwiyejH2HY6grLbYD60bZXF6dsdaIV3vkuUnoBTFikEA9B8j5pKu/euSy19bv/3qwODTfMHSfjNY91WCfM4E7P08pkaouorg5vAb0CVPgnzAZLJOG2dOBWF8ves0MMj1ZoZlaKgGDZmgqh6onaKCosgSWLyKErw/ivIRAs0Wn2zWf7bNzs+LIKGjh0/VyQ18gmv/Lv/7dq9NWfP3gd5/8Qv1BjGJSkUnzcXRnFGoKoXhRQ5V60WOWYMKCmZg4qbq/X+dMmwbOAWJsh8rpM2AUMWQ7xYAiI9uCozfei+aWPkyt9TvGEX5srdMh4DZbxMdQPH85Dm7YBcxejNGEPH1TZiWzsGVmlb72HZTKc0QhgXqWufnrB2p//NFNn+juy340WhEtUpmCBszHLBQ8Z0sA2TURpVasqSqSar+8IApSaKN6WTVC5TXqqdS1XFLt3Oic57KFO0hrtXNeKoF5wfQFHSfnhMFKp3pejrovXy0nLYxo7Hp4fJ/dsqvzjeXv3/Cpf377vOfvun70mYCnfIf7dv3dzL+HZ4Kw6a6HU6xMXKt6GFETUy+7AdGglvOdmkPOiXf+a11uFPmE8cWIFlWio1dG+wr7No8j26ahZf0GmPOuUgF2/TTzIfqTmRPY5AbbTZ8YwM6HHhNCeyGKQlru3j+ffdTyGZfHn8xwa3KV/sjsShwFMaJQUNJZ5LYftVQ9s/7wl2KJ7N/6gp6iTNo864LzRNjKS34KjnyvS+HpzPvMmW6F1mkKM6/U+uz5r6Za1GezYBHrcWdR789hklO3aqU6O0t2LJpmWnyusOB975v3rX/re//vSAijjOavzHgbzKoo0jJjnJwqYzmvJkrKGzB7VpUd0c2YUwUIF5x2KpHnVh71IFg518mUJP31neIPHnS37UImY+eoPt3bT83dhJTXHI0NUbTwWnT2DByHnb81UuX5y/hGn8EOjo94HmCknY44JFDPEiu+017/0Jr9/6KHg3/jC/mihmGnoD+vcFRjzZkWM9j8VTbYtJwhLOcE57zcTi4XsKRr0A1tWk+KfXnNM0fef+MPDgUxSnjfz7g/3r7nHQhNNZCVrmCP8xcZKdaG6ivfguqSvAEqnw1oNIbQnBgZcR6SZtiFl4kTFAMKQ1hRZI1s3Y9DLd3o6kvngpFOV6hy2yWP0pIAWHkdWvc19/M0s3Ph1zhF1HDLBA/6tAe76rEXxIhDAvUsMOefmuZsWLv3fzWf5/3CL+m3lTyezxYE+xl0Ew2dq+fRPYYLFTsJP9RJqhJctqaqG17P1J609a2XXu38Rfl7Xpm2as35P2f151+9Yw43JkxH3wbxqQu298ajzL0Iz8E1186Vk/bhxGSN/ikzJ0CeozLDzpaJFoQfmTu+5Gw7enYeRNOeo2oaF/jpD2FdF4Lh9WJqcSeO7N+j7qPRofgzGDpvC3k9f17JWBbEiEMC9Qxz5Teb6g4eOPqvutd3tS/gM5TZxcxPUxmbnAfnzvJZpuQ18Xm9unj/JmEd/NY9v1t3+fmcCEKWaTMO/uWNMC4aDy7nnsrMQEKAaDIhfhmKL16J8eUeZd7ThhzZOzqRZthJdQFxwn57tAQZ2RsHYr1oOtSs3BaKfmXrhodsSynAa+tqsLVZGAiyecspP68fa4t7NPZ6xEjtAXFGIIF6BnnLL3rK1q0/8kXd632jx6N75XM+0kkaRifnQefO8m+c6bEye5THE/RddbjP+saR3p233HMPP5XYqbPO5l9cMcFM19+AxD6vHdnruH9l3gori2UXj1OpIy1+gsCuCwh5KWVJupqoaI5pl9upB1ViC1kTtQf7D3fCfexGyo8vg3ui9ePQ12Mh3hMfFY2sMy0W9umP1ZX4qEzbGYIE6hniqq/sqVrz1y1fYoZxhyGEqZwWIwN3JDKq112Ic4hj/pURmnKxVBSn5vVHQwuPtMV+/LG/bvjOzI+9POt801b99aGF3Kicb4dXy8oyMhBJnEhgBooWrcDMBXNVIgfLjh8bdXMkh4Ibu8uV1ghMXTJdSA4hWJloF0u4Cc0uHHx5HXqSll1gnMlsX3bErjXgv6Egn9y6ujAqU1uw+3BvLmmEytKF88ONqkKjmJPpTLw3DOyqK7b+vLiOxUGcEUigngFWreLapl1dd2r+4Hv8AV+Qm1Y+cpaE6HlHYdCUNI/KqUwenydoWux9ze3WV57/48/evOY88qt2t6feDpQIm66cky8HaSk7oQH6MGfRAlSU+XNa94WMG01r2VVT1Ptx1RFpBhIfwlCBSUx83vss2noyyIcsnH7DyE0VBXSEqidjW1MKhmPLUIOz8y7W0I7cj3rYK7MDXjL3nkFIoJ4BHvEdWRRL8Y97A54S99k9j4P/iEGQvlWP3xNMpc3r+NFtX/vhvq6P37OB18l0kTiHLPrKvhrE9lwPLaPZ95actuFVRcSDpRomLZ6HgDG2Hmupo0oNUZp9x08cD1Q2iPYoVn+RahmYF7sOxgtyppy+xFM1iEU718yfh8Mbd6n81rzAjXA+PO2FfnMxmEjXF2t/pjJtZxYSqCOI7GznfXF34/qNTV+LFAcq4CSddyfUX+hRtBcETq8rpwxJM316/Z+8E9/8tslBv/YfT+/qu//vH4rf8N9rWsM4B8j6uOv/6ep/AxYEEZeJHGJQeXvZXCDLUDt9JeZOLYJ1vlfiGqHDc8sxqKQKzDZvV9eWoWLqNCHtpEDNiHbZL/5wBK+/ugvJDEZs6pYKTBKbmj6tAtj/FA53murz+YYc/8l28Wh4atok/Ukq03Zmof59BJn7xQPFTc09Hw2G/Rcrv47FycR7phnhqBv3ejFZeq6zHVmjAtOmVUmNRO9NmQsOdWS/9dpR7yf/7bFk49nWVh//4yu13GidZffcMoGBEKaoFU+xDEpKYOabbhYKGTv/A2TOUKtJk24wqKO8JChkqZybWymEqTT7RpHYvAa98ZEVelJLrSkxkC6aip37ugr8qOcH7m1gciT8Ov99HSPf6ZmGBOoIYmXSS8VT/TavRw/KCiy5OqJnkHOWLOF8IGdOH7lJIXaAi/1gJFv2oWJCNcori3IF0RmzJqfS/HO7W1Pf+vqa1PU7OffhLNHx53+9nPtunoyULBAizLzKf2rY1VUmXIGlM4pzOWvHIjLoyCsGFGX1M8WHPnERhfkXWaGeVSLZvRvtwo86kkjrU9CroXrJcrRs2AZ3Jtx5NStVHIrfQHMoqK8HccYhgTpC3PKD3UUH2/q+qulag6xh6iaFV53wCHVwx8s4ZI01TZjbkauuGNVFJ9r+wiNI7Vpvfz9gGUr/phRe0ZaZZBrpI52YOHcODF13asbKBAJybo1eJN5ev/5A8jff/H3fL794f+z6b6zurTyTGmvFkr+t9vi6b0a8vQhcpmCVSZ2K7ARJ/grMu/ZihP22L3EsilP3nL1CBa2ePQ3eUtE2Rrn4Rljnswn0dFvYs6fNWW+Euj1ua8XzG4Po2L0enX1ygHN+DHCdcC35LhUN4P5FNZ7tIM44JFBHgHs41599NXarEKJzCr+3NdSR797cpBBnQwM+n1Fty2VxkR7w7m5h2WvASCAT/yc6jqIoFEfd1HpkVFk9ZmfbEe/kXGKpnfi9iMRS5tva4tb3d3VaX/rHh3pv/vUmXnUmBGvftgcmZ/q6roZl6so3qBbx1kwD6QRqy4O5nL32UY7NG0MOsmqrQgiHhBnckHN0hQZvboHVm0Hnju1Ipkci/NnJCu0MXqpKgziUrUJzW6JfLuxzjxxg8ZaIT394SimVaTsbkEAdAX74w866ru74bYGQ/6xMrXD7A5mwXtOYykk7Vk2/hkdDrKVFdBztYEXFOF1UwXXRnqldu1Ay71KUFfuUkFLClLFcvVrZ3PIrj8E0YQ4eZ0K7o6nT+vajm7v/5yuPJ259dDcvGknBWlQxuQieBj90Z86pQleJC8DaUBwJw9CcgCrnGMcCAwcO8lpVF4uRTtVCYbNvh10fVvhRNR86WncjkRopa5H9KhNGlAifrb+qHl17D55X5gF5bMIkvamsJLGWgpHODlS+7TRZtYb7v/vTte8KF0eW8DOcTlBqRtw2OzpaqqUE6okpTN19gSFOK53OIr3lZfhm3gSvzzMiHVqyLwW9ewtmL3u7XfaNqyhJR1DJcmhOjVfRq0rfqhjWwORmwKOz8VmTj9/clLr5YGd261M79Ke/vLrvPq9X3zm5wt92yyzEhtuxMV+JDywrDuEI8p5e055naXmRSKacQZX7twsfbtdLg5OmV0k5KVBDfg1ll70B+5/7jfijTPAgBh48g0NNR9DdnUBReOQKC0nPTijkw7TyPhxtkTE/09R9Mdg1OFsJNlQyB1X7FVZ9ief+FbXedhBnBRKop8mv7ttRa2rsGp7NhgyPkTO5nZlHx66banh1FUEsS6TJqR1en6HeD86FraqkOoSpN9sGb22lo7oP83xdtV/0QsmdG1A0/RJhyvMhI4uoa3YJNF6wnsqzLzPvWLa2aMg6slKTFX13UNeMeNKasy9pzRYa7Fu8urV9f0dm3St7PRu//Xxm1wS/sS/ajdaVK089QTmzklb+3GQclJx/KgYQWrkqJt7eE+/nYhgLCqqaMsPzOqptgrU96zOnlWMd84r2EaZxq0+MvPYjvs9AR0s7xtUGR6yBmFM4uLquFs9saMMNcoAlfe44d9hTZTjCXra3rEx7kLTTswcJ1NNE55kF3GLzNa/GTOvM5um1A5KgMvkw0clL7SzW1oVwZalK1j2WjL6q2LNoA3PP02A18+EP+mBmrdNuA/X7jv2YfOXblJlXpvDTtYK/waneAldjtf24cmK/XczGXkvm0pWXS4x/ak2L12azuCSeSPe2dCc713K+JxLyvrbqkcTG6iL/tmn12BepRfdixo4bhtpxqLlT6BvCRCEDX6QmlEvNIw4ojU2vt+BWnj/KsaKnuu2tfJdORZ2sECZ15X7xISyUeDm1SKYi7BZjkCT2HmjG/AXjMBKt425B3iPVkxqQfHwPkl19CMiAqHP8MIoBoBnx63dfVArK23sWIYF6GsgyX//9m80f9viNEhVTZ9ka5BnDcdzI4t7x3ZuR3Po4jFAlrPJ3qkjUMYPTWaX6Yki1d6H48ivVZxWUcxodpRykJPfugemtwfiJNUI7zQ9iCtHcA7DyHboU7jntsOA3ruJraPAKU1yZWFMsbEo8YV6zN5HB7tZk7Nmd6PQZes+dv+9t8etsv9jUEXEXtWrc6hQuv05m8eSmLc2Tnvr5N3vMJj0AvAhboArBanWpcmVdf/0BXnzrSsyeEhX3IYPXI3PKcntu5DA793z90PNvqDbwKWMDBhJVRTp8l78Nqad+Lj7JYLWMGnzs2NUJYZq3MxsN815xpz7nswgzVFWGUckOYnNTDEukQD0HcGdwp0r1MRzoTfG/UhHxswsJ1NOg7Wiyoa8ntTAY8anO9NjAoJH1X6rpHH1x9G1aA/R2wz/vjfDXNkI39AvZU3os3BZ+ZvMeoXzUwBsKOz5l+xoMObLajZoWvWz8yD5MnlGNQNAtf3bqpc/cfQ9+L/SfMywtCrqtZUqHXkiai9Npa6Y07AqNVs56zTLOs+InYmFm9YQqq272isiBg7+FLSCkW6wDKuBGbsIox6N3/xG1n343ast9SGbsKFTl+1W+Xnu/2hCsf+ezhnuiY+N28VdMmVKBLc8ViwYVbWQKDdVqQesrj6Ct72pEA24g3/DP0hXIcgztEw0drJmM1/fFsXT+2W27gQMDoaEnI162ur4kuQvEWYWifE+D+589cL1uCI3juE/PyIg4d/OZzi70PP1bWN4wole8HaEJM6ALf+pYDPBVU1u6k0dKZzT+IJUxX1VNcJoNwcwUeNch1MydL7QY+9EYavT0YPOETwUp9OQik6x7PZrm9zCvz6sFxfuoz8NK/F6tbPpll3iDlRW2kguhqEJGNcfEDSLMmuZOtK1fi4d+9zC6+rKquLjUTqXp2bSdv8q/Kzv/U11kDVF7kVHOzsJwXizaCRZ5b8iI54m1YqCR7XUGTBlZFRxo2Y62nqxTH/X0Hxw1G9rZb8PCeTj6yos4V9izyLjUwF8qibDv39QYoWCkswwJ1GHyrfW8uLmp9Y2hsI/Z0yiG15GeDKm5yGkc3dvXoveh78KYugiVF10FI+B3Og5tzCXel+bVbCYL7+4fP3jVDRd9dmlj6EOJ3vgfhJra50wVHRrK2cnQc/AwqidPFebeCjHKdz2lZ0/XsO+h/PV0F9PRoOvqi3H5F/4NoapaIRwmiGWyWKESKjhJ+FGtviPY8oe/4L++8n/YvPmw8ilK/x53TNOyCEvWZCdd5Hry9C1H2+Yq+MdZClrlvF7EP43TpotmmiU+yUo8YjShy6o8Pmzd3SWeKdmip2cN7We5EI09vbFUmK224WB7VtkebJN7fmGaddoLhAWXOwsca657x4jbJCm8QY8unIAPvmuObyMFI519yOQ7TP60pqXB4/VMOhvTuLu3vojM5pcRuuJ98NWPUxG9yswzBuy8gxnlpPDr3fhcRovWPnvvxyr7RKf/2twvHvh8c2vXvmQy9V5f0CeljJ0usGCQM2hTSfOsk17I3LsJVW95szLfpbPcUXhZYQDwWWnvwmOWAs1O2GB/bqj045JPfA4bHnoYRzduAo/7bXMml5pYtzqP7ufuxt271mPqRQtRO28ZaiY3IOjTVXDVqQz6uLPfY1p/lHXPHTGGQFkxevfJcGzRTimpsMWwb912pJZVKS12pBJgSKFWVWQgUzSZr11/JJWYWS5dtbo1wplXZH8j3RtqvrR0e4i+wDR5vChobKmt8DxcV6z9ZmWDj0y95wgSqMNATtivet+GueGSSJWMuD0Ten4ugvDQNqTXP4XQJbfBX1dn25Ywsvlrz1cKz4/n/oGK5rWano+t+NR3H3rkc/fCGYnvWfQfh77Wvrdtd1tn8ouBsL9Bdjiq84Gj/Q3cHvKWhURPDHq8CZOE/1SV01SCTCs4En7sQQ3c2JnA2XUuwli8b5hUh4oP3I6mHXuwcdM+dDUdES7VFrGS0FSzaWXaTHoMbFrfiU0v/h5hfxyG4bGF6UCB2q/Dd/Q7X1GGFU8UdmSeYDICTvhwxajDlHF3LJdHU7NVePVZqEr291ZOK+IFDcY4s5NcaGqV3EGcbDSaU4gLj1E7Tmtbzs7cF8azmpGOHTpYA6tTqPJBplI2ehcgveMZ9CQuRWlo5B5ceXaybN6Uy69IvnzPQ3s3lZWnVFgYVwZ3y76hpJo5iNboJgBxbzPZLnJys6VGc5odvKwmQAv/jqUhkzVgpnTNF8r6p87YOX5a7eP1lfoTS6siO26Zg+S7QJwrSKAOg2+9AL/JrJk6tyIqAKWgXxiJR9Ry5tZlenrR+8KjCC2/Ef6GeiVIDJYPvDlfFYbjGUqHquC529Gc33GncRNNezJa9VVCmFa3Fq6/9rN1bavWrPnRr/9Yurm1J/MFIREvMww9ahYWeHf+k/2Vmrdo21SRfOUBVF79HpSFvEibbsIMViB4nX8c7YAXSjmGwTWd4zXEELCFIAqihpWOgkBAR+O8qWJpzO9b5i5mtmbZT066QnmwgC33olhwi5KbhsGf9ersixVl0bWrhjBX9nzEWPnQJbxj98+4WTcVmQPCOh5FV1czDrbEUTo57NxUQ7tQdrKPQnMxV20vn9vb3zT5qTu/OuMm0dZnp92eAw46b38H4lxDPtRhsPr1noBu6OMsi3nOiJvC7kMR2/wMjIkL4K1pVGZeNyvShZoIv9AHlvvO8ePlTGeiHVIH1qeK0y/cO9g2Vq1cmd3x3XnPhLz+z3gN9udMxkzb6RllSkE7TaOcYqSibD26nRQjEUPWW4a58+ptn7VM5KCUAgv2rAM7d680IefNocg7687g9bAHTjwnNG2TraYW26/pWitsqZmvNlOwOJ/tDE8D/wZbuXMEq9Al9UyWLetJ8L9LxVOTMMq54k2LdumsqxU+GcDlkSWEEO/OoHl/G3h+XlABp3YtNfsOsd8zO8+ztB4kTZQftksBEWMQ0lCHwaF93SXMY0ziWe7oAyOLNDXGjrSCH1qP0I2fVUFJF5IIHag92VqXI5vcrx2N0HDyFasUc7Id0hl46xd1TJ12SdujG38QgrB0Bj3Qu7vADmWEPbEP5k2LkBSCZ0fN+5/f2vfXe7IaM735ABRb3VOdoa8MCFXBinWDe7w42i2ENUsoH2ooYCDg08R70Vkato9MCjXpWzVVFRs4iRxsLfeMmt85TjoNp//3OLXNFlwHVyBrKvsT94sxx43NXYn0fZv4371pDmvBKOWyea+3P5Fs60GJrAkviwlsFYbs8ejatRXpS8fDq3rAwgY71SvJc6ke7bm+HMI4joxpVu3YkZaZI7aBGHOc0X7gQmX8neuW9WWNe0RHX1+oLY5UlK9MJ9i75hfQGleiZNIkuzwbhm4yPVcMZkBzDWuum8h153mFr8/v0+Hx6vAJbdGvtEYNAdHTBf3ivVez9THN7sBY7scQUhBtUqEUrSMn4up24whxwLW4WLO7rSc5JZ7IltpJF0S7ih4vnRLm3XRWZZtKxpPIJDJKSKPjKMymV2GJ7+WcTZltJ6NFkCkR7reyClQUMZQV6agt86NkwnhEIt7cNIXBkj8ctyGGyZksflBovlbWXyv3PinGdj+6bG70y7fPYKN2Coa+4BfvNzd87Sdqvi7fI5ydN6N22Uy899MfVYn03fMfSq5dxuxgMVOmm2QsL1A5i1dGjH+7fb727+wEma+ICxPSUIeBD2ZJV4aHvX4v3HyiI4nZ0wPTDCFUUqLMSOdaOz0myvZk6ztl5WQ8i8QjhKPXL4SlEJqyIE8oJLU/ITClFigEpsdjz6WVcyY1RzixnN+vYJ/OeznAEP8XiXWL3L8WrufGutRX+OG6PguDkpTvtDB41WnjjHmZELpCC81wxJNZpNImYr1JxI92ItvahPThHry6OQ08tQmTlszBzIWTERa+zIw5+oqlHXPPFlixC66vX5hFr9++L/bgqlX80VWrRmfWnXlvveKFdRu/ZkKP6EgLY0UmhrZDvejsSKC6xAOeH0CcMtLcbjqGeJPnI+49jPtjyezcHb1eeW+2gRhTkEAdBszjKeVxM2DP0DsDmkN3k+jKgjDCESFYzTObzvAUGcy0nTPP4lihawjzbGmJH8VRH4ojHoSDhtJGhV9TJS+w/U5uwvmCDR2zffdflvtSTRlg6Oc37LeeY4gvbLWsM++kUMvP9YPOF2per5cJIQ8UCaGvqYDSIKzGUrHuZCXIY70xNG0/gC0vrUd33MTlK6fbx3QhRiMwOW+VN/QlcWvNVd0vY5VKyzTqmDxt/L51ulf4CoSJIR0VErAd6aYmdDQfAp8Ude7toT3HyqvtZMRy/fuGmsoCLZO1xvfE09UggTrmIIE6DCzNW8Z5wsf5yJtglWaX7IZWJASq0OwyKfOch44VBIL2P18nAEbO45TaZyTkRXlZACVCiBaFbeGpfHLc3ko+1y23K2KcQjwIz0Wu9lfVc0KcucfBBsk7e+wQQOWSL/hGy52Hc4w53xhX02fs43Wy4YiVo8UhzFw6E2VTp+C5//sjNgrBO3fJlEHNhSNmubCDhY79nucFQb+o48LvT+cYxE+9huaNpczLUjG/TM80KgXqvbcKx7j3qg2IHb4YsgKNDMBNd2HPgXZcdpm4H5zr7ObCPRXhmgsEc9ZXuby5Yy5nmLCrRZ8k2n4LJVcYW5BAHQ4aokwbGVFqT0+T9U0t59UUWoGp8vO6auHxcsOeLfpF3Vo8l70pFPQgGvairNSP0qhXaaHShKtG75YbBDuYoBmpc+H9VOdBm8iVvNwRpAMHQf1+y/NTAgummLjtn6s3KiyfNaVeTLjkYhx87ilMnDVBaLQeXIjIcxeW+0qfrteLj6M2YUB0Ru09PVt3XCRGSWIkl1JJMHbtPOLkOD59mZcTwioiXQt3xDNVTp0iE8SYgQTqMDA1VswKnXoYmaCRXIcttS0hYK1TKlg+mDH29OEF6YGUT1SNvDmCQgstLfKjvNgnhKlH+UT9PparwJK1Cmfrn9lBwKAm6AItbaCw1XImBe20tUc5V3XCuGJse6EC3T2JsyNQB5q2eX4gMJjZfUR2KS0mJo/EM+lG8fFJjFL0rvU7YFQIt2dKJkUQJxZGz8tPozvxVkT8uVA5nD4yUMkKiEHIxBcOqukzCRBjBhKowyBrauUYIY3R1YSUL0alypNBPB7EOmOwZJKak/pPR05oqTyyyiTKVRIJ6eeU+dOkKbesNITqMj8CAU2ZcoUpMPc7lfe14DD5KZrNziiunZrbU15kLtUN2zpwZO8hTJ9citJxNcKnq6tE66c8UcLVVMV7v9DE+7w+pEWbmSbvt47a/RmxKHC88NQ2TJ49ETXlAWQsJ0mFZp+Daa8ywntUQltLWBiHUUxnc30T9IoD4GWTgPWi56sEendid3MKiyYHcn7Qkbhv5djN0PU3NPfiB+LjfhBjBkrsMAxEJxzQnfqjIxnhKzclp3gYoWogJud5ZFAYjlqYQ4AXLoN8PxykuVkmL5DTWOqrQpg1tQwXz6vG0rmVmDY+jLIiAyE5xUVYsmQHpASp1FzPt7toQCNIoSNlXlkQ8PW14snVm/Dcb+/Hri37kM3yXBsOvqEB33DHLGwxdB7tQnHqIKJRfy4BxZlFDL662/Dy/WvQG8/AMOysWqmMhdefWY8Dh2NuDocRPR5VBYfxIEYxRVf/Q5MeNJ6CHuYqVojLKj0+7N7f2S9QbSRQlZAyfKbPMGeDGFOQQB0GusfQRloDcbcntURvzXiwzH5k+tqRy3iQX1P9ywcshV3CYN2o/M5yln4CRApwoW36fQbKSgJYMqcSKxZLIVqOyfUhYd71qAQHHoM5KfdQEBV5pgXI8OhfBSR/vjUNZbjkbVfhxr+5EpXzFmDz6jV48KerceBAR74mqrKjDgg7ZugXUCVN8a1tvVj350dRcfGVKA6frcQ4HEtvuFSYMAJ48jcPo60rra6LFHjp0jo8++O7cWBfO05m1BjqvSs9gZrORnX2nx/dfmmPntrQBJ9fPAJFdiEB9OHQSxsQS7vBChgR7Oh/K5RO48185AIGiFEACdRhIPyb2ZEa0varhuJ03Jbowby1UxHbtlEFARUKVRmJmItSLej33ShQuapKQV64cGfupmnZwU9iR3IOaEVZAI0TirFwdiUuX1qN5QsqUVfpl/U4c1NB3DmbOS3YjWpUO2L5O2iAxHY1pMJluORKh51ocfzPTo52FXep3g/wQ8tzDwsT9qKFE3DjJ29H6ZQJePlPq/Hs6vVIxVPi3O31jrTF0dqRRGdfGn0JE4mUpV5b25PYtH4vHv/p71FUUY5FS8erOqHHHjMvuK6s3zL0BkAu97ucq/uGt18KHojgqV/eh87utDK/L5xThbK5C7D/uWeFxjpIW2v5Rd0rBZ9Punt5Pc3R7R669VZmplntHiRa42BTxQkJ64+vEfGdj6GrN+skEhw52Sdvu/a4NVfowmEQYwbyoQ4DoaC2SeFkR+LyAu1yeEkeCn8vkWZf/7TlSL+4Gj0b16Bo7kqZCyinjmoFg2lWkPeu3545coFNTHTCPq+cC+pBNGKgOOJVQiUihKpHCE8958d1hKYS4MfvXgY9x5OetrvhM8mxB5GL3nXOSSL9wjJ4SvpBL7psKprHFeP115pUhHJtsQcdMRP3Pb4N6f2b4GW98norX6usS9qX0JGNNmDGZcsxa8Ekod3r+ZHGGT4/d95sJODB5TddgleefA2rf34/lr31akwcV4T66hCa2kyVEcrjuCTyP85r28ccauH7QS+tilzVpLY1mqeBlF766Vc6n/jaPu4tn4PULlX2rjfWg+ajcdSXeWDxkfL9MxWHEE+b1R3dZoX4ohfEmIAE6jDglnlEanoG089YZKXH70XRwivQ/eyD6NReQPEU4Y7xhpU05Vre6yO1DeZooO58SenD8fkNFZErhWdEmCRlogKpeRrCRCiFg9YvSpnnsxMp7bPAIXvcg8R5iysversSSuP0BAL2fFhHmDiBNmpgIIXl+MlVaJhYBV2YtmVyp9piAx/8m7nIxKcglsoikbaUMJXXpThsIByNoi+roTfFTelNNXRN1r3UXGX4TLlS3UuWFTuIRjy46sbFePZhC8/84k/oe/O1KiGFmc3YQWED5IJS1qGy2eblf2F1utyKg++bM6sgzGt0cvM1kw/f/URTV9Y3CUjJUnddSHWk0LrzAPj0OSN2dqqh5HWyWHFrj+8icZ/tpfmoYwMSqMNAZ1abGoJKEXYGojnlFrNCYOuRKIpWvgV9m59E55r7gJIS6MEwwtOWoLymzDbvMruSSsDvUfNCQyGPndjdYxcgltqYbRa1cgnnNcaP6fTP/DzXs+dKcifxvPz4JvTt2YaLbrsOVXXltvWX2RmU3EQOmqOV67qcb2mhuSuL0rCO8tKgUGkCqu1kG3p0O3hJbsMnTPJFASCRwdrX9ic3dietcWKPU5jGy8QWZU0wpR6eCZ2V8UIrAnD5dUvxmhDyL9/9B9TNnqR0o+P/lqNHaN+GuDf8HsOxruCU0O0g4lEtFK6vm9D7C9M6AuHcFHq+OBvhRzUnoWXHs0KbnC2emZHxgLkjDzHICh7pNi9tadD/AlnZnLjgIR/qMGAZq8viVio3oB1pYSSjKh2TnRHwo3jxtYhecr1QUP0wd76EqQ0BLJ9fgaVzKrBoVjkWz6rAnMYSTGkIo7bUh+KgriqmGE5qP5XIW2M5DZaPeFzjOeAkhy+1z+XXLUCoph7P//YxJGJppbmbbt7dgiZwMzfZC0dvXPhKe7LCF5k3GVtCQZM5fpNi6RS+1OZupbX63rYo+PBVswN/Fw1rd+i69ikheH+YNfnmRIp38zMc9utOcZqxfAEWvWkl9j36yDEBaoUEfTqee/J1HNyyS/1O+ue5E6ntuJ7x6vO7EUuazn0C5BqLIz3atSzpR/XP/dQfkBGeTUOWc0uJ0VE5mttSYqCRwUidnq38q2ugx9J8WksLKkGMCUigDoOMmTmqaVpfXqCO7NDd7eulALDNfAzekgr4isfDM+1KTJxcLzpATU1vkcnZVYJ5zY7GdNP0ucKzf0wwCoTI6BWoubNh6DfftFBKymkyobAPy99yKYIBC88+tsEOzuKD+IAZCgp4y6QNwleatNCTsBBPWSrIR34nV5Lmco8UzGJDnXE+96X92X+NpTDvQ5PD6+oqIndX+6OfLQub10+u1m7y6vgHse1fCzH9iPjZa+J9u7AUCE2FiZ5cWm7dtOx5k7u8fiqgyln6XbuB7eB8Lc3ZC5fPQtXKa5yB0+CtJgS9MF+LY8/aam5h89mmcI6DzzyB7ljWKUmWax9h22ZNuAC46s7bXoDWm4Ehc9eLy5BuR1tzswpAG0nsWvSM9aSsSUeT2QkgxgRk8h0GlifYHAikjgqFpjxfZpMdm+v2FDiZEqOifuV2hRoRb+/E7AUNKCv2IWW62XHsPKL9tAkMjDIt8Ov1KwvKBj+W81kPkQMHx+TpFLPJDTzs6THOgAJQEc2BkA9L3vMOPPa9X2LXtImYMq1SdnSOsCqQGo6W6n6U5t++NFMDF8sHCAuvmqKiO1OHVByx2I2QqzNiSeu/1nvT9W9f6P3R7CLWIf4cF4sUQM/Ibf1sDffzor7I3i5/46GW2MxMxqwSO6oVRogacTp1YnBWInbvNzn3yWnAjGmGdIWLXQgzhaUXTlJyL43GkcusJY9ICvipM8dh34bNJzCY2GkuGdP7X3953mKDh4+mYCX7lJ9YY/YcV9mSmQzvLvKwdbgAWNxY0vqA1Z6BXiKrjQuBegTW7h4c3bMH2pQFMEfEh2pfLVV03OQVR3vY+Hvu4brUkEFc0JBAHQZTx1cffe31fdvEiH+G/OwGBPUTYjh9XPOd7DDTsT7oqU5UT7va1pZU5CpznGon2c6oNtT1R8340GxN88iBduzc04lll05UWY/y2jjLm+/EyZcXezDuisux+/kXUT/pRngNO5hMKxxogPUbeNiCxEJM+Rl1O4hL7Nera/20O5UekrHyo7380y/vzIY3NPH/nd/ADhUe8x0rmVR/5HJULM/JzhUzEdh7OB5tzVrFsV5eEjetABeL7tGLhdm4SOc85PF6/H0JzO/oTV1bEvUGpLla+cTtw3X84vZZSz/6kbaE8qXLqTVDw9aQ29r6YBVNUKZh7hQIkBV3/D4c7EkmduICYJW8FmW3PY7unpvAhB9VEyNMPYim1l5nAOEKxNNHNqG4hQJ9SbNh2UzlwyGBeoFDAnUYvHl5uOuVl+MbuT94g3j21IR32cnL6iQqcfwImFNtbcsxA4rXxKEDqCoByiqjTjAScOpTxkeveXcgymxr2ucfKAqhY/NjWI8YLr5yXj5mud8AQk6REYOgxko8+PJW7N/bhsbGKidAyW2ZfPvYvkNuCyxZZDwLxJRioatr7NF4LtqWOUFNln2xqjpi/GOvtab9z+3q/cYlUyKtxzsHR1Ppc5bDyB03Z1/+stjol6DduBbs+VZoG/p6Jzzzne8E5r33jmsmNJQy2S1b/Q9e3XO7dzfz1leeOnDp+9/XE/DqM0zLOqVnW/7W9S0fff4plM6aoSLBJdJ8LLT5VElA++sli0IXTCmyyon+B1u3dNwonALixHsgKxxvXr8L2dsuVc/uyJRltAd1wuogjBpsSaxYRkFh1BZpJ04N8qEOgzsXs4y/JLoxm812u7VK87nkR06YwtGYZNAI27cWlVe8BQGfba7jo9gHejowx08sT1/WW53zpuux7/HV2HuoN2e+dbVTt6SbDBApKo2gri6M3j07lEBSHWeB4O2XgII783udoK50Rpp/LeF/tOeicjesSx6Hk/zCkIUwNavkSB//SFPc+7GmJh7AEJFBP7KI9yrGsovFPXbX9Sz10/dGt09554c/8fy3/uWJJ//wUGr7tiNcJpiQKROlybuludvc9MyG5Lp7f7e+/OrbPjOuoeyHohPvG8I+1Wv70T60d2XQOKMaroKbERsSlu9tjFt/vqn2wknynj2yd7+4CTLiDhLXWtw3ZhrZTc+iucu068OM5KMltiV88It6U5lJIC54SEMdJkvmRDY/uiZ2gPkhJ24PavYdLnZnnfeZJYXv1FPcgMkTS/uVILtwZOpgbeZ6DY89SVcYyvOf1BDG7gXLsff5l1D/1quQz9nvCld7kb+pG1+N/UfiqsC5GqRo9vb5cSdfui+2+TchJE3QpyFQkNtP/lpzLobcpgYePtJjfeBFZr4i7oW/insii9PkpX9q2Lno2m+9d9cLD7/pQE/wutKetVf6vR6mMQtdmeI9PMl+FyotX7P7W9NfuuNX3e/XDXbKxgvloxfnuem5TQiWlqOyImIn+bDjlpLFIe3XU1ho/YU0j7Kj+Kqd6Nq1RQjSBUqnMKLCBHQAh9uSGF8ezmeedG4A9+NQtVY5kJODk5TFKoSgXiS+egXEBQ1pqMNk3tS6PaaVfSKf3QhnBPlwm9ueQv2yxSpY5EIlH+Waj3YddD0glzHIdNIyzr+oES0796C1pQ+Fkb6Fqf40IUTHz5mMq6+fg6BXzUTNlZyz4YPsK/93uc9kxkQyZRcFKDwg3Uld5QQCI5VFXW/a/PtXDmAaRoi1qz/dfM23/+9HxePK39Oz8YlZRvueBf7UoYVdL/75+or33/Ufhx7/2xeck5BKlj7YNlzxwG1LL9JCy00k0vzFJzbwrr07sxdfv9QKh31cKL5pxrSjPt34r6mTQ/9z580sjguIaz7/oSP+YO/L8Aa5itLjnWrq8I6dHblANxeWv52GjGxjaT1PZrinM65dKgYqpMBc4NAFHiarVrLsTT9s/sWaNQfvDEYDUZmKUNOZiv6U2HPR8gxVc3UDT9Jd7UiZPkyd2aCEgzYSZWWGcTxnCzfhgmvWtSno0ZxwZts8a39VWl0OX/1MtO3ci7qaObYHrEB9t5wgIn/Ai+KQjoqIju64hd6UWZD3dpCI5wGDpIwQQH1CoBYH86ZSBqfguia1Ea40EllsoDvBF+/uND+6eTP/zOzZLI0R4F7b9yrT2PXu2fpc7vtdd4nzvcv2wQoMPshAOZ/eEslsT9+azrbe6u0vvjK97XDf/uz+TVvnf+hvu0srIkXxhGmZpnmgLOJ5MjEx/PDHZrMMLjCWN1Slnk0ePgqjSkjTPh1cWLNZGC0vvoj4GxoQ9g0yYcn1rbsfT2ADYE5Al5t5LOQFDnWb81v6dGFjRiuICxYSqKfBXz5UvbXi+SPPmFnzBsNjqOTzOT8ehkcuGMl5zbTuR/mEWpSUhnM1Gy882DGRyNzNEwgMmkZPmnCzecc16is0tB3tgrwEKs3ggNGG8qeK/5JZu6MrCcv5uwydMRMx4R+1+ODm5fzv7b+7kaCFoxn3mg0IrvU091q3zZrIfyXev4CzAxOK1uDaqXP846dUrS7uOPAP5oGd/u33/LCxcvm1B2755j/vvLLRysYQ9YZ8MP1BxKTP9EJNlycHwyh73270bImBTYzCEmMUowSJQy+hq+/NiPh8GGD1tSkc16mUn0N6ykvb0igHCdQLGjL5ngaiw7HG1wR/bGb5UZmIvlDXOR2Bmns1s0i1JzBlznRVXs01dY4dBm/F3FSR3JQRoLy+Dm3pQL46T+GS+50dYCSnHUlfazSgoaLIQInQWmWe4+P5pG1ZxPoVEnf+0u/twGoynJul64/yO/d28mKcBX64VsZFDa6hSpJpjrkzyl9cVrFy6wP/sXIdsg//tvWZTz/3v2+NtN46u6jjjtnsyK1T2dGb61j8Qs89W/OWT7zE9B2HEZQlS1Pi4qXR03UQTYd687msHUak6Lhwv3f0YC6Vc7uwIYF6mpRPrn7a62UPC5Up6+o4p/PEqCBDtQHR8Xe3IaLvR1XjONfSiQvraSwwoTF23GVw7Gkj7hQlf0U50h2dyCQSdpCQU0qOqWlM0iRrqe+lBptK81zQV1BoqRVh2wwsfaty3qXy4WqO6Z7DSdFnf+/3nFr3KteR80GP9lpX7ziSuuxsdKSLFknt3DruM23PvdX9MpKY2Tb1sTU+K+AdN0xqNtDTASaDsUUzZPcj09mJpo1b1fQ3pYG67hu3NOJpXEIx3g4d6DYv3XIUIRAXLCRQT5O/fiDaWVca+Ek6ntqn684UmkGWoSDXl7l841s3o3zOcpQV+Z2A19N0nJ535GaO2tGmlpVblI8U/PgRuPbPwJw5g1zYeT19zcik08fXNN2F5RP7SROuFHxFASFUowaifkMJaYtbOTO0TJqgOxptRCynegWkednQUdmW1t605WBPCc4C7ATToG1F24qAwKFMcW82VdeJ5GHRCwoDAk+KxqlGx6Ftwq9uOvlS7HuLjcBYSNzPeiprToWRKAVxwUI+1NNEjvRXrOHPR/+0/XvigfkPbnJDBcEMCPs99RwM9rg4GU/CkzyExotvU1GkbmDNaMb2ijqJ+sFyiedl9iGvpzCIyF5XRqGqrFBOABLPbcXZnhP0If8ghaLOMkL7zOaSNoBj0FJmNvnBiQV7ylPIy1QdUb94TWaYzHKjzKTSTNzeHsf0CRGEZYm34xR0KRS0rjDOZLnRm7Ku6ebR/xMfn8YwkdmVXq8Y/BaYedTZ9WF4RNt6MjI46Ripb2fcYjorfugh7uvrQ7biluPfUk89Kf5ZAWvmvf3XueWW/Gl+WSxfKnh/Ir6kxjHnj0YsA7xK33Lf9zr+8pkboDeIm6BNCFY/Wtt70Re37GxRhUJ1GE/fgJOVzd/QGQvUiPcHQFyQkEAdAZ5cybI/W8N/8JmfrV3KmfF2w6N5B65zvKJaA00EMlGE1NDSOzchOH4Jqsv96qG2cA7NCcezY/O8f2mwqGG7/8wnR5Aj/6MHuzB3bhVKg5rS/CTSn2m4JtaC38vKLnEh0GSC+mTGchLbDzwwex/SRGsJa6dHLxS4TGWT4gWDkeNNyXGzI8nfS5+qzOHrEuuJ488/fgYlt16MmpJqsZ7rL8+vY88P7t9Iqu6sOK6+JK892pu9CsMUqGs4N97/9sffaVSWh00z60a9OQ2mSV1a3DIm9/1qm3/K3IkrambOMTRtYNSy3c57th649OOvbriD1881jaeyAWkDlxZtzXCUfTj58Uw90/eRr1osdsCTmxMm7su7PmW5MXOQv/xvoRBrznt7FZXLCk7+KNh7zfD/9fn2ikHB6vMpn+31b33Da3c/IBrAW6oh0ywOsxsdO7fjaEs7Koql3OP5W8yB8XwEb0Fa7H641pVCpNkgabGalh5zqvj7KzL+AsQFBwnUEULma73563v+5ZkNrUXwha41TdOwE5Gf+shWPoKZTFb5/dLNO7Dgve8WHbzUiAZqp4XhT+eIwnicYxLx2+N66avsS2TR05dBR3dSdFb7cGRXC1YsuxkRf15KOyJx4GbhNWw3n5xvGk9BtYNKpevuy/mF/GwKYZ01SuDzeXGiPA2uifi4OL4z5ogJ2REGIwHU1oVxcOtOzJ9d5egr3InudSOR2SB7s/+WNbkey/BLxLracDrSxEsIHk5q/xJKsSrGbVWeO4MVZZoUm5ThvS2d4If/8NfAtdWTWUlZ0J2Nax8Nl/NjOV74/WNTreLyb3iKTXGKmmFmbeewplLNcrdJRbNzs8eaZfB2U1eF7ZX4cKSJnWvx1G++oJ+H2h+91z8JT8IuHHBecPN7gq13324KswbziaGUbfbtbMXhAwcxY1q1fZXV8IEfJx/2wHjvPMdGpotnOs0jvSk+ccsWXfa7IzKViji/IIE6gvzlC5O2X/3ve//xlU0dAV/IvzKTMVU166EIValYZI4cFA67iWgYV+FoWMjJTiWGGM55wnu3s5G6msok4AT8SG2yszeDdiFA2ztSSCQzqlg6LKGp7dyAyknTUBy0BwmuOTZnWhvQTnK7sj28hh2AJPtx4zjn3tfWhUxZDZg/mDu+wY/b3uYAxeP45wjbajC5LoBdzUlVAk13E9SfBI2xnJm7PW7NbOkb3rSJSA10ePxlhqEHZRUc9+gktlizk/0bwSLEdm3Cgz/9A954+5tRXBKWuWRFO3J0dfTi5QdfRez11Sx4+QfCunDueoVZM5vVHRP8IMfvr4GZ+qvo+rtRkNfdWdX9fAot4X2jEPk6mnF+cStjJpvy8b/wffuE8Vt2hV3ipGuwdW8XrlRr5PwMKPAu9LN2DAXhKtDTGTa9uUgVLyKBegFCAnWEefTzEze855fddz64evsvmc+/SPT+nqE+eYmWZkybX4dg2CfLP0HrZ6/E4HPkzjLcqXIjkx10p7LoFkK0szuFtk5biNpzcuX/mujULVvTzvRi6oSgHb0r53QWdFiDYXdiTAhUTeXKzTidOCsIZpLI6Szt+3aj0peCZuiOwC3sCQu26bQhBmxjkDO0dVBL5bRFSeNMNG3biu6eJCpKA6JzdOrNniAKWQlj2IK1T/ysN4mZGIZAbZPxURp3MvHb2xxYKlAeRuzQIaCkBKnWjbj/+zGUL38jisIeVTC85bVXgJYd0ConIdF8EIFxk8Tv7QAsO80gH3D2UNVsYMnsU73o306W89kJpT4ZllT76zL5MgDnDxPqos/sPRK6BZlKIfHEeVpe7HttnxvBZWun/e7TE6SqPAEyyFuz8wRP1zxqYNUN4oKDBOoZ4O73Fu264duHP/7iusP/AMN7g65r3uyAnGaF3XlOXooOM9MbA4/FUD9rhhIUmnEOzboFqHR7TmUSeUS9CQvdwpTb0hbH0Y6EEKJZCPOhOgepwcmgrFwQEuSUWhPphAcVJSHHJctxsipjbrclNVWvIYOUBv7FOTaxaOUNqKtlKk9vfh2Wt7wy+/ilULKDsQsNx/w4e7YFpk/su7o8iGD7dvR0N6KyLAg4ObGODRVzzIDOJmTKQ+mXTWa50Z2FLPf3JIZIuMhx2hXsrXCvOQvGkcPwL3wPArXlkLIwnbbEtUmqc45MXwg+fRGsWBy9a9cLE3kWmtfMCQ43Q1X+LI7fJjZDsFxbSfDsfi01Y/jly+S0o7v+mKhr72LehJkxNOHK1UI+aUfVxeBGM6yMYfmZIcYd6urqBXklTTlyc/M9eWQt2aysGyS/0l/57Y8nIPWU2IHHVvetg7C2/xUPv3gzAv6Rm/stL5+sp5tMWpN1r+eut/2o40Xhd04xTc9ms0lpf89qzJdrVG6ZLP9eeSBU3kIj6E1fMUffOX1eoGXlCOSJJkYWEqhniAc/Wbv2mlW7PrLlaPYTwtz2CX/IFxFCRsv73OyO0C33Jr83xFMTF51iaVESpZVFjplzwON8miH8AzvknDLH+n8/0FNpSk00nhXm3DQ6ulLoaI8rTVQ+6bILk2ZDw6upoA33l5ZTvUWJgngMCDWgvKK8XxSu640czOjobkcGLElB6YoTR7bk/i5NwssuGi8EtNBiuZMK0BGmlnMO7nHIZBB6zuR7Mi3V0cPEP6GAjiK9C11CzSxsQ37cX7n7sVMSyv139lqTMAz69tuW6sLvGArGCe4X/gj0gF+Ycr0YTM7LY0glZASYF4ajyat2cS0fx9jSGfrfKbzg/RAwArDSOscwKqo2LrqxvKf06qVGZP7neDY2RRyPnre/yqjlSkSK6zVvtBFa3XxhzgiqyceMOwmWpTfYrTrvnBSzq1jYrvLKS/x1t84Xg1dTDH40x0vMsHH9odxgdkQMQdzRbU2rSM9k7kQm/T7x7Mh4MjghB8fZzYDoCfGb5//qb1t82ZS1P12b+ellC43npqjcy2N3TvH5BAnUM8gjq6ZI894/XfKVfc/v2Nv9ccs0LxfSJyyneNhxHZbdSzqdfVZoeHz3elTf+i6VGcmmMPoHwzI3FZJX1lzh5MaY2NvVZRky8Z00aSaEKTchzIUd0pTblRYaaQrplJk3ZebVQTixG3Ajkl3sPLdi7WQ3fHo3jGiR8kMaui1Ic2XqCrXC3GL/XWrFEb+GRIarQKdct+7MIY347cQMvUkL7b1mPhiHOdtgduUPKTciQjAauh0sdgq12XPl3OTvpO+3ozebm+jPjy9R+6G0E3GcXWkexBCRmtmSf9qz2Ny3QUv2VgvBFBO3kM82x/IscqZlKT+69yLbFEYqVj5wI2o9qaiZsR6gZw8Su31gHu/x9yuXHmFCDkwW3fV+MaJqgV0jXVJ4b55a7LmmRdne4qEFqi9btbl0y8/+/Z97tjz8UWRKDISFgi+DhJnQJlEPFkigcfnluPq2azG+wqMSc8j6tR4DJ7V+DDg65Ez8YDjZZT2dzElOKJtPbMXHTmgROPaX6hqKa5kxUR5PW9NTGX79xi3ZryXqjR+JP3aCOOeQQD0LXP3341dHv9G6o6m1fcXhjvRnEylzoi/g9aliX7B9pNJEmmhpF52BgSmNFSqQxBUrrp/OndrhfBji0Nn1KbJjProT11VFlbQdVHS0MyH8hSn0Ca00Jcy5cjaEbtjFP91D0FEQTFSg0GqFx8WY7fMTnb9HWKgCXvucrdz6/JgOLG+ltd2G8rjk7yqjGrpidkJ7t/OT5dRKQpoSrD6hUcjECz1Ju15ov8MQBxvwaPDnOlu3rqkG3k/f649b/cadCpFK562Wxy8wcOz2PBpTU3+GwoJ/a64ov2PtLb0t3X9j9vYGevqkySIlNua3q6xb2by6LqlsQKongVRfy/E3KsuAhiOIHe2yG8U+k4Ljzp0dtKJyhGd9GIlNjyN78BHxndxuquDcTlGw9DyPNHyXfmfFxO9rRnXblE+88q0d32o4dKKfrFrD/d+45fovxMxJHxGyQthed4kBw+tQwVCGcEVHizH3xrfgxpsvQlmRRx1L0il0YA45nb/Z77zPDsPZT/43PnETx9JmSVMXPmdy1i7uxV8wMgGfc0igngVW2VMldq/ifO8TXzn8SE8qc9P+g523Cr/qfI/XGxAdulfmAk5vW4PaZZeiQnQQGXMkH+wBWm5BWrWEisrNCg00hZ7eFHqFSVdGkmZkUJFrslXTKtxC6vltWZarYeZDZNyEDaxA8CsBaWaFmdFSfiR7pH3CA86JJHfLUrBG/VIbNZycuvYaUjNTsTrcTiOoCSEhBwUplXHJ9r9Kk7TUvH0epgSznjNvF4rykwgI9SdNBWGxgiO02wfHbGOgpi6V9Ixl6RgCXp6tCYSDHzV8/pnJyqsd/zU7K12+uoa6ptowsbtMfIiKk+qALXxO5H8ehMxBZrEpDSi66W/0zEutpRWee8W3xxWoq1Zx7f97+8dvsWKd74a1y4P0q7CDYqViJ5R88ygmTW/EzW+5WAymPKpFzLPRKOcBtjEpHyGfNrWy3pT10bWH9UdBCSPOOSRQzyKOYG0Sy/985yH+k0d3t1zy7EtNVzFDvyQb65mWSvLqxnkTZT3Nfvnj+s3zdDvsU543Y2tqUhAkpKARJtuk0LKk5tkTy6CnJ42k0EDT6awqP+fx6Epjk1G1tm+O2QnnXXNzzkQrO1ymOvlj0tTazjn1VtPyx+sVFsYsl8KUqbm2eaHLBzlq94SZLVQZ1BQQcOQyLEmbqz1PUFOma7mvkOhza4V1cPeRFPbtbsaSpeOU31SaXP1ee2TP+vlvrQI75InblDGfHYrk+MM0uL7HwnUcMcr6G0OVldhiAZmCTgxQTik4x+SGX5xTjRi4aLqwY+ZSW54F4eG2kSWro5pCK5UlztQU0oHqn+xCTqSpOoMM3smQlSZjyyPul+gJfoA/JDcV+b0brohhQS3apezN2gcjhapntioaseC9t6Ei6kVSuEkMxwoyJlDNyRyBKj9YrDuhLepNmMtAAvWcQwL1HHHX9Uzazp74wav8mZe39oy/794n3z3hokvevWBa2cT2OIz0cYbc7DimSRc5RcVUEZ5cCE7hAxUCNJ7IKgEai6WVT9SybL0vl/Rb9Ea+gNFvH/2SrWksl0hg0GMaGA/BcOy6MrsQzygfkNSApYDLF+pmg52ojbPpwTIkuT7WrKPuym17xXalLy2WMPH6mg246vKJSoNVcy0dzVmeL8sF5KgTPKUBCvNGxfo6cv5ZV5geEy6k4mKcdbgz4GAxMWDZCZyqnVQdlTglpnIPSb/vYFaCM40upweFhE82MlfcXOPR3/xgH+UJcSdSa8IsG6wVMnkdy2ST/hP9ZMfG7oq0Z/FMWUAOkauRiyiWFk29Wm1vfG0IKfGMBDzS1Ht22+Sc0u+5UINILgYVne1JFpUFzMnse2455YebsHnPPd1TfvO+930HRtRkqdVFwkHkZsQXPY8uuo8AjrUkSiMjZ46eAke6cEtKPwRN6P4ESlYmvGWVZaV18z3x/ZuKrN4DwUJ/pfM7ezvMye5uh8WwQs1KxjdK6WfJ/6y0+Dcl3qSFlVRIWCstpKbJ7O0qMePOluC251N1XM4kw4IJA1yz5LnZUlUuhZP65aI+yxBfzXH0uj90D19GM6aRTmih4hlCmPaFcmfmSuN+809YgTx35rjY0q9/r6kklWXv1w6QkVXeTcb9VirT7e1pb9bLq8ZL27UusyurnPc8LfogXYooK5//RqmPHIXuW/t6udIiLQRkKtbXa3Dd0MNBnymnWXClGHGGfJiXCbgqqtqnnEVkN5ps/diRvt6unb1M6xKrZnPnqxractqpnzG8ghvRxvEWl3HM3LlGDPkpK9aANnTaW0145IURLwWWYhmFNsCXe2w5cmd78nJmLTPFxe0jfy/vH3Wap9pvOI7sjNMKMWEz74DuizSZmVhCzmCyt+ca7WXKp7AQj5XCLZiawq2eYN4coS4DlLbKSszSqulpnXk8YoBjCIOvlt8XUGCTH3gwLNcexx5q4XcM/TcxlH6Su8O1/l8zhmNC9Fn/4aLKlDlwdKqiz5CvKccdTwVzzVWWuEDZVKy1K9G7Jw4tXXjfFvREssNB/n733diJ9O7fm+ln7gYxYpBAHSKr1nBj076eiQEjrRm6j/kspmWNjCasUKotZdyk5cyBk0HxwsSpqZTkhvgoBWFWzlqQuVeNLDKJZDLtyfiYmWEBy7R0bkUQMDNJMRYXY82sIZQi3X51959NiS7ETKgHJpsWtkOjQF0QVjldGNTE9rnuBTfMABeaLhd74ulsjBs++T7I5bY1nzjudJylvUHuT/VZpmFZyWyIy1IkYsSvHrxeWXfZz7knHbUfxKLuY6ajxwN2ZxCU2gTE+EKsILzC3BuS35egr61bY1HTDMXE1ktqeQpH9a5MhcfI9ua68Yxwg2WTjIXDzjmK8/cZcdUG8nMqax+34bePK5nNd1bZZIz5jbBaX342/EFuGdyKZ3SPp5sZrEwIg3hSTySFfifaxKeJ/kcPWIYZ45Z4VdfMLawqLJppX8zZdjD3vc+0su2ZcDaQAIsHezWPaB/ZNhHRWHqAac5ho61TtJVzjOoaeuxz0rNxTfOFtXQ67ePi8vlNpmXk3Ek9zbKm8JR6UlwTrwGf10z0Jq20OE6ZSseU95EsgiInJZb5zcKkfXIddexpMPe9i/wuqydy94WZts9DF/eF4RMu+/ix2xCnK+6t/G/c9axkzIqEAqZM7yDPw74mxw9WNsR9lnKulXudCsvbZIwYk/eZL5U0mF/36Bnd8IjnKCOkdp+Z4AG/17Svjxj6ZONCjJhmwAha8p70iPuqp0cGlzEm75kQEnpStGtYtKdo2dx5yXN3zzkiQxROAfV7t/3EM9abTohnL8myom1MI8isdFJsb3DF2u9EP6e9frUNPWs/g4XruM/qwO2EvLYx3f2deojFoNz9fdoOqhfXzj4PM11wXcXxBZxtZcWNiCTTdb3XMPSAGGRkdNkn6aIPMjSPJVM+x81k1qNFLCSFccyfFJ1CouPnd0zsAkEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEEQBEGMNf5/v2S1DO8Pa6YAAAAASUVORK5CYII=';
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