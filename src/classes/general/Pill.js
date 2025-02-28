/* eslint-disable no-undef */

export class Pill {
    constructor(logoUrl, chatWindow) {
        this.logoUrl = logoUrl;
        this.chatWindow = chatWindow;
        this.isAuthenticated = false;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.position = { x: 0, y: 0 };
        
        this.initializeStructure();
        this.initializeDragEvents();
        this.loadPosition();
    }

    initializeStructure() {
        this.pillContainer = document.createElement('div');
        this.pillContainer.style.position = 'fixed';
        this.pillContainer.style.display = 'flex';
        this.pillContainer.style.flexDirection = 'column';
        this.pillContainer.style.alignItems = 'center';
        this.pillContainer.style.justifyContent = 'center';
        this.pillContainer.style.gap = '12.5px';
        this.pillContainer.style.zIndex = '9999';
        this.pillContainer.style.left = '0px';
        this.pillContainer.style.top = '0px';
        document.body.appendChild(this.pillContainer);
    
        this.pill = this.createPill();
        this.pillContainer.appendChild(this.pill);
    
        this.tooltip = this.createTooltip();
        this.pillContainer.appendChild(this.tooltip);
    }

    initializeDragEvents() {
        this.pill.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));

        this.hasMoved = false;
    }

    handleMouseDown(e) {
        this.isDragging = true;
        this.hasMoved = false;
        const pillRect = this.pillContainer.getBoundingClientRect();
        this.dragOffset = {
            x: e.clientX - pillRect.left,
            y: e.clientY - pillRect.top
        };
        this.startDragPos = {
            x: e.clientX,
            y: e.clientY
        };
        e.preventDefault();
    }    

    handleMouseMove(e) {
        if (!this.isDragging) return;

        const moveThreshold = 3;
        if (!this.hasMoved) {
            const dx = Math.abs(e.clientX - this.startDragPos.x);
            const dy = Math.abs(e.clientY - this.startDragPos.y);
            if (dx > moveThreshold || dy > moveThreshold) {
                this.hasMoved = true;
            }
        }
        
        let newX = e.clientX - this.dragOffset.x;
        let newY = e.clientY - this.dragOffset.y;

        const pillRect = this.pillContainer.getBoundingClientRect();
        const maxX = window.innerWidth - pillRect.width;
        const maxY = window.innerHeight - pillRect.height;
        
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));
        
        this.position = { x: newX, y: newY };
        this.updatePillPosition();
    }

    handleMouseUp(e) {
        if (this.isDragging) {
            if (this.hasMoved) {
                e.stopPropagation();

                const preventNextClick = (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    document.removeEventListener('click', preventNextClick, true);
                };
                
                document.addEventListener('click', preventNextClick, true);
            }
            
            this.isDragging = false;
            this.savePosition();
        }
    }

    loadPosition() {
        chrome.storage.sync.get(['pillPositionX', 'pillPositionY'], (result) => {
            if (result.pillPositionX !== undefined && result.pillPositionY !== undefined) {
                this.position = {
                    x: Number(result.pillPositionX),
                    y: Number(result.pillPositionY)
                };
            } else {
                this.position = { x: 0, y: 0 };
            }
            this.updatePillPosition();
        });
    }

    savePosition() {
        chrome.storage.sync.set({
            pillPositionX: this.position.x,
            pillPositionY: this.position.y
        });
    }

    updatePillPosition() {
        this.pillContainer.style.transform = `translate3d(${this.position.x}px, ${this.position.y}px, 0)`;
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
        pill.style.transition = "all 150ms cubic-bezier(0.4,0,0.2,1)";
        pill.style.willChange = "transform";
    
        const logoImg = document.createElement("img");
        logoImg.src = this.logoUrl || 'logo-url';
        logoImg.style.width = "20px";
        logoImg.style.height = "20px";
        logoImg.addEventListener("click", (e) => {
            if (this.hasMoved) {
                e.stopPropagation();
                return;
            }
            this.handleAuthClick();
        });
    
        const starSvg = this.createStarSvg();
        starSvg.style.cursor = "pointer";
        starSvg.addEventListener("click", (e) => {
            if (this.hasMoved) {
                e.stopPropagation();
                return;
            }
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
    
        authBtn.addEventListener("click", (e) => {
            if (this.hasMoved) {
                e.stopPropagation();
                return;
            }
            this.handleAuthClick();
        });
        
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
    
        svg.prepend(title);
        svg.appendChild(path1);
        svg.appendChild(path2);
    
        return svg;
    }
    
    handleAuthClick() {
        chrome.runtime.sendMessage(chrome.runtime.id, { action: 'initiateAuthentication' }, (response) => {});
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
        `;
        
        tooltip.appendChild(styles);

        return tooltip;
    }

    destroy() {
        document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
        document.removeEventListener('mouseup', this.handleMouseUp.bind(this));
        this.pillContainer.remove();
    }
}