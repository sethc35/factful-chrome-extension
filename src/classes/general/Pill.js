import { ChatWindow } from './ChatWindow.js';

export class Pill {
    constructor(logoUrl) {
        this.logoUrl = logoUrl;
        this.chatWindow = new ChatWindow();
        this.activeElement = null;
        this.resizeObserver = null;
        this.isChatWindowOpen = false;

        this.initializeStructure();
        this.initializeObservers();

        document.addEventListener("focusin", (event) => {
            if (this.isTextInput(event.target)) {
                this.showAtElement(event.target);
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

        this.chatWindow.onVisibilityChange = (isVisible) => {
            this.isChatWindowOpen = isVisible;
            if (this.activeElement) {
                if (isVisible) {
                    this.chatWindow.enableHighlighting();
                } else {
                    this.chatWindow.disableHighlighting();
                }
            }
        };
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
        this.contentWrapper.appendChild(this.pillContainer);
    
        this.pill = this.createPill();
        this.pill.style.pointerEvents = 'auto';
        this.pillContainer.appendChild(this.pill);
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

    handleAuthClick() {
        console.log("[Authenticator] Initiating user authentication...");
    
        window.postMessage({ action: 'initiateFactfulAuthentication' }, '*');
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
        pill.style.gap = "4px";
        pill.style.pointerEvents = 'auto';
    
        const logoImg = document.createElement("img");
        logoImg.src = 'pseudo-url';
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
    
        pill.appendChild(logoImg);
        pill.appendChild(starSvg);
    
        return pill;
    }

    showAtElement(element) {
        if (this.activeElement && this.resizeObserver) {
            this.resizeObserver.unobserve(this.activeElement);
        }

        this.activeElement = element;
        this.resizeObserver.observe(element);
        this.updatePosition();
        this.overlayContainer.style.display = 'block';
        this.pill.style.display = 'flex';

        if (this.isChatWindowOpen) {
            this.chatWindow.enableHighlighting();
        }
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
        this.chatWindow.disableHighlighting();
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
        
        const starPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        starPath.setAttribute("d", "M10 0C10.3395 5.37596 14.624 9.66052 20 10C14.624 10.3395 10.3395 14.624 10 20C9.66052 14.624 5.37596 10.3395 0 10C5.37596 9.66052 9.66052 5.37596 10 0Z");
        starPath.setAttribute("fill", "#4285f4");
        
        starSvg.appendChild(starPath);
        return starSvg;
    }

    destroy() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        
        this.overlayContainer.remove();
        this.chatWindow.hide();
    }
}