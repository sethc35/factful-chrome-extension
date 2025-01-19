/* eslint-disable */

export class Tooltip {
  constructor() {
    this.tooltip = document.createElement("div");
    this.tooltip.className = "precise-tooltip";
    this.tooltip.style.position = "fixed";
    this.tooltip.style.zIndex = "2147483647";
    this.tooltip.style.display = "none";
    this.tooltip.style.opacity = "0";
    this.tooltipContent = document.createElement("div");
    this.tooltipContent.className = "precise-tooltip-content";
    this.errorTypeLabel = document.createElement("div");
    this.errorTypeLabel.className = "precise-tooltip-type";
    this.suggestionText = document.createElement("div");
    this.suggestionText.className = "precise-tooltip-suggestion";
    this.citationsContainer = document.createElement("div");
    this.citationsContainer.className = "precise-tooltip-citations";
    this.citationsContainer.style.display = "none";
    this.citationsList = document.createElement("ul");
    this.clickPrompt = document.createElement("div");
    this.clickPrompt.className = "precise-tooltip-prompt";
    this.clickPrompt.textContent = "Click to apply suggestion";
    this.citationsContainer.appendChild(this.citationsList);
    this.tooltipContent.appendChild(this.errorTypeLabel);
    this.tooltipContent.appendChild(this.suggestionText);
    this.tooltipContent.appendChild(this.citationsContainer);
    this.tooltipContent.appendChild(this.clickPrompt);
    this.tooltip.appendChild(this.tooltipContent);
    document.body.appendChild(this.tooltip);
    this.onTooltipClick = null;
    this.tooltip.addEventListener("click", e => {
      const correctionId = this.tooltip.dataset.correctionId;
      if (this.onTooltipClick && correctionId) {
        this.onTooltipClick(correctionId);
      }
    });
  }

  showTooltip(data, boundingRect) {
    this.tooltip.style.display = "block";
    this.errorTypeLabel.textContent = data.errorType ? data.errorType + " Error" : "Unknown Error";
    this.suggestionText.textContent = data.correctedText || "";
    this.tooltip.dataset.correctionId = data.correctionId || "";
    if (data.errorType === "Factuality" && data.citations && data.citations.length > 0) {
      this.citationsList.innerHTML = "";
      data.citations.forEach(c => {
        const li = document.createElement("li");
        const link = document.createElement("a");
        link.href = c;
        link.textContent = c;
        link.target = "_blank";
        li.appendChild(link);
        this.citationsList.appendChild(li);
      });
      this.citationsContainer.style.display = "block";
    } else {
      this.citationsContainer.style.display = "none";
    }
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const tooltipRect = this.tooltip.getBoundingClientRect();
    let tooltipX = boundingRect.left + (boundingRect.right - boundingRect.left) / 2;
    let tooltipY;
    tooltipX = Math.min(Math.max(tooltipRect.width / 2 + 10, tooltipX), viewportWidth - (tooltipRect.width / 2 + 10));
    const spaceBelow = viewportHeight - boundingRect.bottom;
    const spaceAbove = boundingRect.top;
    if (spaceBelow >= tooltipRect.height + 10) {
      tooltipY = boundingRect.bottom + 8;
      this.tooltip.classList.remove("tooltip-top");
      this.tooltip.classList.add("tooltip-bottom");
    } else if (spaceAbove >= tooltipRect.height + 10) {
      tooltipY = boundingRect.top - tooltipRect.height - 8;
      this.tooltip.classList.remove("tooltip-bottom");
      this.tooltip.classList.add("tooltip-top");
    } else {
      if (spaceBelow >= spaceAbove) {
        tooltipY = viewportHeight - tooltipRect.height - 10;
        this.tooltip.classList.remove("tooltip-top");
        this.tooltip.classList.add("tooltip-bottom");
      } else {
        tooltipY = 10;
        this.tooltip.classList.remove("tooltip-bottom");
        this.tooltip.classList.add("tooltip-top");
      }
    }
    this.tooltip.style.left = `${tooltipX - tooltipRect.width / 2}px`;
    this.tooltip.style.top = `${tooltipY}px`;
    this.tooltip.offsetHeight;
    this.tooltip.classList.add("animate-in");
    this.tooltip.style.opacity = "1";
  }

  hideTooltip() {
    this.tooltip.style.opacity = "0";
    setTimeout(() => {
      if (this.tooltip.style.opacity === "0") {
        this.tooltip.style.display = "none";
      }
    }, 500);
  }
}
