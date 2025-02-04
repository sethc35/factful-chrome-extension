
export class Pill {
    constructor(logoUrl, chatWindow) {
        this.logoUrl = logoUrl;
        this.chatWindow = chatWindow;
        this.activeElement = null;
        this.resizeObserver = null;
        this.isChatWindowOpen = false;
        this.isAuthenticated = false;

        this.initializeStructure();
        this.initializeObservers();

        document.addEventListener("focusin", (event) => {
            if (this.shouldShowPill(event.target)) {
                
                this.showAtElement(event.target);
            } else {
                this.hide();
            }
        });    

        document.addEventListener("focusout", (event) => {
            if (!this.shouldShowPill(event.target)) {
                this.hide();
            }
        });

        document.addEventListener('click', (event) => {
            if (!this.shouldShowPill(event.target)) {
                this.hide();
            }
        });

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.removedNodes.forEach((node) => {
                    if (node.contains && node.contains(this.activeElement)) {
                        this.activeElement = null;
                        this.updatePosition();
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    initializeStructure() {
        this.overlayContainer = document.createElement('div');
        this.overlayContainer.style.position = 'absolute';
        this.overlayContainer.style.top = '0';
        this.overlayContainer.style.left = '0';
        this.overlayContainer.style.zIndex = '9999';
        this.overlayContainer.style.pointerEvents = 'none';
        document.body.appendChild(this.overlayContainer);
    
        this.contentWrapper = document.createElement('div');
        this.contentWrapper.style.boxSizing = 'content-box';
        this.contentWrapper.style.position = 'relative';
        this.contentWrapper.style.pointerEvents = 'none';
        this.overlayContainer.appendChild(this.contentWrapper);
    
        this.pillContainer = document.createElement('div');
        this.pillContainer.style.position = 'absolute';
        this.pillContainer.style.pointerEvents = 'none';
        this.pillContainer.style.display = 'flex';
        this.pillContainer.style.flexDirection = 'column';
        this.pillContainer.style.alignItems = 'center';
        this.pillContainer.style.justifyContent = 'center';
        this.pillContainer.style.gap = '12.5px'
        this.pillContainer.style.transition = 'all 0.25s ease-in-out';
        this.contentWrapper.appendChild(this.pillContainer);
    
        this.pill = this.createPill();
        this.pill.style.pointerEvents = 'auto';
        this.pillContainer.appendChild(this.pill);

        this.tooltip = this.createTooltip();
        this.tooltip.style.pointerEvents = 'none';
        this.pillContainer.appendChild(this.tooltip);
    }    

    initializeObservers() {
        this.resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                if (entry.target === this.activeElement) {
                    this.updatePosition();
                }
            }
        });

        window.addEventListener('scroll', () => this.updatePosition(), true);
        window.addEventListener('resize', () => this.updatePosition());
    }

    changeAuthenticationState(isAuthenticated) {
        this.isAuthenticated = isAuthenticated;
    
        
    
        if (isAuthenticated) {
            this.tooltip.style.opacity = "0";
            this.tooltip.style.display = "none";
        } else {
            this.tooltip.style.opacity = "75";
            this.tooltip.style.display = "flex";
        }
    }

    createPill() {
        const pill = document.createElement("div");
        pill.style.display = "flex";
        pill.style.alignItems = "center";
        pill.style.justifyContent = "center";
        pill.style.padding = "8px";
        pill.style.borderRadius = "20px";
        pill.style.backgroundColor = "#ffffff";
        pill.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
        pill.style.cursor = "pointer";
        pill.style.gap = "8px";
        pill.style.pointerEvents = 'auto';
        pill.style.transition = "all 150ms cubic-bezier(0.4,0,0.2,1)";
        pill.style.willChange = "transform";
    
        const logoImg = document.createElement("img");
        logoImg.src = 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAmEAAAJnCAYAAADfrIRWAAAAAXNSR0IArs4c6QAAAARzQklUCAgICHwIZIgAAAAJcEhZcwAADsQAAA7EAZUrDhsAAANgaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8P3hwYWNrZXQgYmVnaW49J++7vycgaWQ9J1c1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCc/Pgo8eDp4bXBtZXRhIHhtbG5zOng9J2Fkb2JlOm5zOm1ldGEvJz4KPHJkZjpSREYgeG1sbnM6cmRmPSdodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjJz4KCiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0nJwogIHhtbG5zOkF0dHJpYj0naHR0cDovL25zLmF0dHJpYnV0aW9uLmNvbS9hZHMvMS4wLyc+CiAgPEF0dHJpYjpBZHM+CiAgIDxyZGY6U2VxPgogICAgPHJkZjpsaSByZGY6cGFyc2VUeXBlPSdSZXNvdXJjZSc+CiAgICAgPEF0dHJpYjpDcmVhdGVkPjIwMjQtMDUtMTg8L0F0dHJpYjpDcmVhdGVkPgogICAgIDxBdHRyaWI6RXh0SWQ+NmI5MmIzYzctOTk2Mi00ZDM5LTllNDctNGEzNzk5YjViYjMyPC9BdHRyaWI6RXh0SWQ+CiAgICAgPEF0dHJpYjpGYklkPjUyNTI2NTkxNDE3OTU4MDwvQXR0cmliOkZiSWQ+CiAgICAgPEF0dHJpYjpUb3VjaFR5cGU+MjwvQXR0cmliOlRvdWNoVHlwZT4KICAgIDwvcmRmOmxpPgogICA8L3JkZjpTZXE+CiAgPC9BdHRyaWI6QWRzPgogPC9yZGY6RGVzY3JpcHRpb24+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczpkYz0naHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8nPgogIDxkYzp0aXRsZT4KICAgPHJkZjpBbHQ+CiAgICA8cmRmOmxpIHhtbDpsYW5nPSd4LWRlZmF1bHQnPlVudGl0bGVkIGRlc2lnbiAtIDE8L3JkZjpsaT4KICAgPC9yZGY6QWx0PgogIDwvZGM6dGl0bGU+CiA8L3JkZjpE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';
        logoImg.style.width = "20px";
        logoImg.style.height = "20px";
        logoImg.style.pointerEvents = 'auto';
        logoImg.addEventListener("click", () => {
            this.handleAuthClick();
        });
    
        const starSvg = this.createStarSvg();
        starSvg.style.cursor = "pointer";
        starSvg.style.pointerEvents = 'auto';
        starSvg.addEventListener("click", () => {
            this.chatWindow.showAtElement();
        });

        const authBtn = this.createAuthButton();
    
        pill.appendChild(logoImg);
        pill.appendChild(starSvg);
        pill.appendChild(authBtn);

        pill.addEventListener("mouseenter", () => {
            pill.style.transform = "scale(1.05)";
            authBtn.style.display = 'flex';
        });

        pill.addEventListener("mouseleave", () => {
            pill.style.transform = "scale(1)";
            authBtn.style.display = 'none';
        });
    
        return pill;
    }

    showAtElement(element) {
        if (!this.shouldShowPill(element)) {
            this.hide();
            return;
        }
    
        if (this.activeElement && this.resizeObserver) {
            this.resizeObserver.unobserve(this.activeElement);
        }
    
        this.activeElement = element;
        this.resizeObserver.observe(element);
        this.updatePosition();

        this.overlayContainer.style.display = 'block';
        this.pill.style.display = 'flex';
    }

    updatePosition() {
        if (!this.activeElement) return;

        const rect = this.activeElement.getBoundingClientRect();
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;

        this.overlayContainer.style.top = `${rect.top + scrollY}px`;
        this.overlayContainer.style.left = `${rect.left + scrollX}px`;

        this.contentWrapper.style.width = `${rect.width}px`;
        this.contentWrapper.style.height = `${rect.height}px`;

        this.pillContainer.style.right = '10px';
        this.pillContainer.style.bottom = '10px';
    }

    hide() {
        if (this.activeElement && this.resizeObserver) {
            this.resizeObserver.unobserve(this.activeElement);
        }
        
        this.overlayContainer.style.display = 'none';
        this.activeElement = null;
    }

    isTextInput(element) {
        if (element.closest('.command-badge-overlay') || element.tagName === "INPUT") {
            return false;
        }
        
        if (element.tagName === "TEXTAREA" || element.isContentEditable) {
            return true;
        }

        return false;
    }

    createStarSvg() {
        const starSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        starSvg.setAttribute("width", "16");
        starSvg.setAttribute("height", "16");
        starSvg.setAttribute("viewBox", "0 0 20 20");
        starSvg.setAttribute("fill", "none");

        const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
        title.textContent = "Open AI helper";
        
        const starPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        starPath.setAttribute("d", "M10 0C10.3395 5.37596 14.624 9.66052 20 10C14.624 10.3395 10.3395 14.624 10 20C9.66052 14.624 5.37596 10.3395 0 10C5.37596 9.66052 9.66052 5.37596 10 0Z");
        starPath.setAttribute("fill", "#4285f4");
        
        starSvg.prepend(title);
        starSvg.appendChild(starPath);
        return starSvg;
    }

    createAuthButton() {
        const authBtn = document.createElement("div");
        Object.assign(authBtn.style, {
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            backgroundColor: "#fff",
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s ease-in-out",
        });
    
        const authSvg = this.createAuthSvg();
        authBtn.appendChild(authSvg);
    
        authBtn.addEventListener("click", this.handleAuthClick.bind(this));
        return authBtn;
    }

    shouldShowPill(element) {
        if (element.tagName === 'INPUT' || 
            element.closest('.command-badge-overlay') ||
            (!element.isContentEditable && element.tagName !== 'TEXTAREA')) {
            return false;
        }

        if ((element.tagName === 'TEXTAREA' || element.isContentEditable)) {
            const rect = element.getBoundingClientRect();
            return (rect.width > 50 && rect.height > 20);
        }
    
        return false;
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
        chrome.runtime.sendMessage(chrome.runtime.id, { action: 'initiateAuthentication' }, (response) => {
        });
    }

    createTooltip() {
        const tooltip = document.createElement("div");
        tooltip.className = "enhanced-corrections-pill-tooltip";
        tooltip.textContent = "You are not signed in.";
        Object.assign(tooltip.style, {
            position: "relative",
            display: 'flex',
            width: '75px',
            fontSize: '12px',
            color: '#fff',
            fontFamily: 'Inter',
            backgroundColor: 'black',
            padding: '5px 7.5px',
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
        
        tooltip.appendChild(styles);

        return tooltip;
    }

    destroy() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        
        this.overlayContainer.remove();
    }
}