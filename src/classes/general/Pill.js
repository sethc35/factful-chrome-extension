import { ChatWindow } from './ChatWindow.js';

export class Pill {
    constructor(logoUrl) {
        this.logoUrl = logoUrl;
        this.container = this.createPill();
        document.body.appendChild(this.container);
        this.chatWindow = new ChatWindow();
        this.activeElement = null;

        document.addEventListener("focusin", (event) => {
            if (this.isTextInput(event.target)) {
                this.showAtElement(event.target);
            }
        });
    }

    createPill() {
        const container = document.createElement("div");
        container.classList.add("pill-container");
        container.style.position = "absolute";
        container.style.display = "none";
        container.style.zIndex = "9999";
        container.style.alignItems = "center";
        container.style.justifyContent = "center";
        container.style.padding = "8px";
        container.style.borderRadius = "20px";
        container.style.backgroundColor = "#ffffff";
        container.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
        container.style.cursor = "pointer";
        container.style.gap = "4px";

        const logoImg = document.createElement("img");
        logoImg.src = this.logoUrl;
        logoImg.classList.add("pill-logo");
        logoImg.style.width = "20px";
        logoImg.style.height = "20px";

        const starSvg = this.createStarSvg();
        starSvg.style.cursor = "pointer";
        starSvg.addEventListener("click", () => {
            console.log('star clicked');
            this.chatWindow.showAtElement(this.container);
        });

        container.appendChild(logoImg);
        container.appendChild(starSvg);

        return container;
    }

    showAtElement(element) {
        this.activeElement = element;
        this.updatePosition();
        this.container.style.display = "flex";

        this.adjustPosition = () => this.updatePosition();
        element.addEventListener('scroll', this.adjustPosition);
        window.addEventListener('scroll', this.adjustPosition);
        window.addEventListener('resize', this.adjustPosition);
    }

    updatePosition() {
        if (!this.activeElement) return;

        const rect = this.activeElement.getBoundingClientRect();
        const offsetX = 10;
        const offsetY = 10;

        this.container.style.left = `${rect.right - this.container.offsetWidth - offsetX}px`;
        this.container.style.top = `${rect.bottom - this.container.offsetHeight - offsetY}px`;
    }

    hide() {
        this.container.style.display = "none";
        this.activeElement = null;

        window.removeEventListener('scroll', this.adjustPosition);
        window.removeEventListener('resize', this.adjustPosition);
    }

    isTextInput(element) {
        return element.tagName === "TEXTAREA" || (element.tagName === "INPUT" && element.type === "text") || element.isContentEditable;
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
}
