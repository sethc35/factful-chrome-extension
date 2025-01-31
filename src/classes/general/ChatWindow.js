/* eslint-disable no-unused-vars */

import getCaretCoordinates from "textarea-caret";

export class ChatWindow {
  constructor() {
    const styleTag = document.createElement("style");
    styleTag.textContent = `
      .chat-window {
        position: fixed;
        display: none;
        z-index: 10000;
        width: 540px;
        background-color: #fff;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        overflow: hidden;
        font-family: "Arial", sans-serif;
      }
      .chat-header {
        background-color: #f8f8f8;
        padding: 14px 16px;
        border-bottom: 1px solid #e0e0e0;
        cursor: move;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .chat-header svg {
        flex-shrink: 0;
      }
      .chat-header h3 {
        font-size: 16px;
        color: #05003C;
        margin: 0;
        font-weight: 600;
        user-select: none;
      }
      .chat-body {
        padding: 16px;
        overflow-y: auto;
      }
      .enhancements-section {
        margin-bottom: 2rem;
      }
      .enhancements-section h4 {
        display: flex;
        align-items: center;
        font-size: 1rem;
        font-weight: 600;
        margin: 0 0 4px;
        color: #05003C;
        gap: 8px;
      }
      .enhancements-section p {
        font-size: 12px;
        color: #71717a;
        margin: 0 0 12px;
      }
      .quick-actions-container {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .quick-actions-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      .quick-action-button,
      .translate-button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        width: 100%;
        padding: 8px 12px;
        font-size: 12px;
        font-weight: 500;
        color: #9ca3af;
        background-color: #f3f4f6;
        border: none;
        border-radius: 8px;
        transition: background-color 0.3s, color 0.3s, opacity 0.3s;
        cursor: not-allowed;
        opacity: 0.5;
      }
      .quick-action-button.enabled,
      .translate-button.enabled {
        color: #0177FC;
        background-color: #D2E7FE;
        cursor: pointer;
        opacity: 1;
      }
      .quick-action-button.enabled:hover,
      .translate-button.enabled:hover {
        background-color: rgba(173, 216, 250, 0.5);
      }
      .translate-row {
        margin-top: 4px;
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .translate-row select {
        padding: 8px;
        font-size: 12px;
        border-radius: 8px;
        border: 1px solid #ccc;
        flex: 1;
      }
      .research-section {
        margin-top: 32px;
      }
      .research-section h4 {
        display: flex;
        align-items: center;
        font-size: 1rem;
        font-weight: 600;
        margin: 0 0 4px;
        color: #05003C;
        gap: 8px;
      }
      .research-section p {
        font-size: 12px;
        color: #71717a;
        margin: 0 0 12px;
      }
      .research-input-wrapper {
        color: #000 !important;
        background-color: #fff;
        position: relative;
      }
      .research-input-wrapper input {
        width: 92.5%;
        padding: 8px 20px 8px 20px;
        font-size: 12px;
        color: #4b5563;
        border: 1px solid rgba(0, 0, 0, 0.2);
        border-radius: 8px;
        outline: none;
        transition: box-shadow 0.2s, border-color 0.2s;
      }
      .research-input-wrapper input:focus {
        border-color: #0177FC;
        box-shadow: 0 0 0 2px rgba(1, 119, 252, 0.2);
      }
      .research-input-wrapper .search-icon {
        position: absolute;
        top: 50%;
        left: 8px;
        transform: translateY(-50%);
        width: 16px;
        height: 16px;
        color: #0177FC;
      }
      .icon-star {
        width: 20px;
        height: 20px;
        stroke: #05003C;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
        fill: none;
      }
      .icon-search {
        width: 20px;
        height: 20px;
        stroke: currentColor;
        fill: none;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
      .grammarly-caret {
        position: absolute;
        width: 8px;
        height: 8px;
        pointer-events: none;
        z-index: 999999;
        display: none;
      }
      .custom-selection-highlight {
        position: absolute;
        background: rgba(1, 119, 252, 0.15);
        pointer-events: none;
        border-radius: 2px;
        z-index: 999998;
      }
      .highlight-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 999900;
      }
      .highlight-rect {
        position: absolute;
        background: rgba(1, 119, 252, 0.15);
        pointer-events: none;
        border-radius: 2px;
      }
    `;
    document.head.appendChild(styleTag);

    this.chatWindow = document.createElement("div");
    this.chatWindow.classList.add("chat-window");

    const header = document.createElement("div");
    header.classList.add("chat-header");
    const starIcon = document.createElement("svg");
    starIcon.setAttribute("viewBox", "0 0 24 24");
    starIcon.classList.add("icon-star");
    const starPolygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    starPolygon.setAttribute("points", "12 .587 15.09 7.829 23 9.339 17.55 14.454 19.18 22.413 12 18.769 4.82 22.413 6.45 14.454 1 9.339 8.91 7.829 12 .587");
    starIcon.appendChild(starPolygon);
    header.appendChild(starIcon);
    const title = document.createElement("h3");
    title.textContent = "Enhancements";
    header.appendChild(title);

    const body = document.createElement("div");
    body.classList.add("chat-body");

    const quickActionsSection = document.createElement("div");
    quickActionsSection.classList.add("enhancements-section");
    const qaTitle = document.createElement("h4");
    qaTitle.textContent = "Quick Actions";
    quickActionsSection.appendChild(qaTitle);
    const qaSubtitle = document.createElement("p");
    qaSubtitle.textContent = "Select text to apply changes.";
    quickActionsSection.appendChild(qaSubtitle);

    const quickActionsContainer = document.createElement("div");
    quickActionsContainer.classList.add("quick-actions-container");

    const quickActionsRow = document.createElement("div");
    quickActionsRow.classList.add("quick-actions-row");
    this.paraphraseButton = document.createElement("button");
    this.paraphraseButton.classList.add("quick-action-button");
    this.paraphraseButton.textContent = "Paraphrase";
    this.summarizeButton = document.createElement("button");
    this.summarizeButton.classList.add("quick-action-button");
    this.summarizeButton.textContent = "Summarize";
    quickActionsRow.appendChild(this.paraphraseButton);
    quickActionsRow.appendChild(this.summarizeButton);
    quickActionsContainer.appendChild(quickActionsRow);

    const translateRow = document.createElement("div");
    translateRow.classList.add("translate-row");
    this.translateButton = document.createElement("button");
    this.translateButton.classList.add("translate-button");
    this.translateButton.textContent = "Translate";
    const languageSelect = document.createElement("select");
    languageSelect.style.color = "#000";
    languageSelect.style.backgroundColor = "#fff";
    languageSelect.style.border = "1px solid #ccc";
    ["English", "Spanish", "French", "German"].forEach(lang => {
      const opt = document.createElement("option");
      opt.value = lang;
      opt.textContent = lang;
      opt.style.color = "#000";
      opt.style.backgroundColor = "#fff";
      languageSelect.appendChild(opt);
    });
    translateRow.appendChild(this.translateButton);
    translateRow.appendChild(languageSelect);
    quickActionsContainer.appendChild(translateRow);

    quickActionsSection.appendChild(quickActionsContainer);

    const researchSection = document.createElement("div");
    researchSection.classList.add("research-section");
    const researchTitle = document.createElement("h4");
    researchTitle.textContent = "Research";
    researchSection.appendChild(researchTitle);
    const researchSubtitle = document.createElement("p");
    researchSubtitle.textContent = "Search for anything on the web.";
    researchSection.appendChild(researchSubtitle);
    const searchContainer = document.createElement("div");
    searchContainer.classList.add("research-input-wrapper");
    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = "How long was the Queen's rule?";
    const searchIcon = document.createElement("svg");
    searchIcon.classList.add("search-icon", "icon-search");
    searchIcon.setAttribute("viewBox", "0 0 24 24");
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", "11");
    circle.setAttribute("cy", "11");
    circle.setAttribute("r", "8");
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", "21");
    line.setAttribute("y1", "21");
    line.setAttribute("x2", "16.65");
    line.setAttribute("y2", "16.65");
    searchIcon.appendChild(circle);
    searchIcon.appendChild(line);
    searchContainer.appendChild(searchIcon);
    searchContainer.appendChild(searchInput);
    researchSection.appendChild(searchContainer);

    body.appendChild(quickActionsSection);
    body.appendChild(researchSection);

    this.chatWindow.appendChild(header);
    this.chatWindow.appendChild(body);

    this.suggestionSection = document.createElement("div");
    this.suggestionSection.classList.add("suggestion-section");
    this.suggestionSection.style.display = "none";

    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.gap = "10px";
    container.style.margin = "16px 0";

    const placeholderText = document.createElement("p");
    placeholderText.style.flex = "1";
    placeholderText.style.fontSize = "14px";
    placeholderText.style.color = "#333";
    placeholderText.textContent = "Placeholder Text";

    const acceptButton = document.createElement("button");
    acceptButton.classList.add("accept-suggestion");
    acceptButton.style.backgroundColor = "#4caf50";
    acceptButton.style.color = "#fff";
    acceptButton.style.border = "none";
    acceptButton.style.padding = "8px 12px";
    acceptButton.style.borderRadius = "6px";
    acceptButton.style.cursor = "pointer";
    acceptButton.textContent = "Accept";

    const retryButton = document.createElement("button");
    retryButton.classList.add("retry-suggestion");
    retryButton.style.backgroundColor = "#0177FC";
    retryButton.style.color = "#fff";
    retryButton.style.border = "none";
    retryButton.style.padding = "8px 12px";
    retryButton.style.borderRadius = "6px";
    retryButton.style.cursor = "pointer";
    retryButton.textContent = "Retry";

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-suggestion");
    deleteButton.style.backgroundColor = "#f44336";
    deleteButton.style.color = "#fff";
    deleteButton.style.border = "none";
    deleteButton.style.padding = "8px 12px";
    deleteButton.style.borderRadius = "6px";
    deleteButton.style.cursor = "pointer";
    deleteButton.textContent = "Delete";

    container.appendChild(placeholderText);
    container.appendChild(acceptButton);
    container.appendChild(retryButton);
    container.appendChild(deleteButton);
    this.suggestionSection.appendChild(container);
    this.chatWindow.appendChild(this.suggestionSection);

    const highlightOverlay = document.createElement("div");
    highlightOverlay.classList.add("highlight-overlay");
    document.body.appendChild(highlightOverlay);
    this.highlightOverlay = highlightOverlay;

    document.body.appendChild(this.chatWindow);
    this.caretElement = this.createCaret();
    this.highlightDivs = [];
    this.rafPending = false;
    this.isVisible = false;
    this.highlightActive = false;
    this.makeDraggable();
    this.initButtonEvents();
    this.addEventListeners();
  }

  addEventListeners() {
    document.addEventListener('selectionchange', this.handleSelectionChange.bind(this));
    document.addEventListener('focusin', this.handleFocusIn.bind(this));
    document.addEventListener('focusout', this.handleFocusOut.bind(this));
  }

  handleSelectionChange() {
    const hasSelection = window.getSelection().toString().trim().length > 0;
    const hasHighlights = this.highlightDivs.length > 0;
    document.querySelectorAll('.quick-action-button, .translate-button').forEach(btn => {
      btn.classList.toggle('enabled', hasHighlights);
      btn.disabled = !hasHighlights;
    });
  
    if (hasSelection) {
      this.storeSelectionData();
      this.toggleHighlight();
    }
  }

  storeSelectionData() {
    const selection = window.getSelection();
    const activeElement = document.activeElement;
    
    if (!activeElement) return;
    
    if (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT') {
      this.lastFocusedElement = activeElement;
      this.selectionStart = activeElement.selectionStart;
      this.selectionEnd = activeElement.selectionEnd;
    } else if (activeElement.isContentEditable || activeElement.closest('[contenteditable="true"]')) {
      const editableElement = activeElement.isContentEditable ? 
        activeElement : 
        activeElement.closest('[contenteditable="true"]');
      
      this.lastFocusedElement = editableElement;
      
      if (selection.rangeCount > 0) {
        this.cachedRange = selection.getRangeAt(0).cloneRange();
      }
    }
  }

  handleFocusIn(event) {
    const el = event.target;
    if (el !== this.lastFocusedElement) {
      return;
    }
    
    if (el && (el.tagName === 'TEXTAREA' || el.contentEditable === 'true')) {
      if (this.selectionStart !== null && this.selectionEnd !== null) {
        // Only restore if the content length hasn't changed
        if (el.value.length === this.lastContentLength) {
          setTimeout(() => {
            el.selectionStart = this.selectionStart;
            el.selectionEnd = this.selectionEnd;
          }, 0);
        }
      }
    }
  }

  handleFocusOut(event) {
    const el = event.target;
    if (el && (el.tagName === 'TEXTAREA' || el.contentEditable === 'true')) {
      this.storeSelectionData();
      // Store the content length at the time of focus out
      this.lastContentLength = el.value.length;
    }
  }

  toggleHighlight() {
    this.clearHighlightDivs();
    const el = document.activeElement;
    const selection = window.getSelection();
    if (el?.tagName === "TEXTAREA") {
      this.highlightTextareaSelection(el);
    } else if (selection?.rangeCount > 0 && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      const commonAncestor = range.commonAncestorContainer;
      const isInContentEditable = commonAncestor.nodeType === Node.ELEMENT_NODE ? 
        commonAncestor.isContentEditable || commonAncestor.closest('[contenteditable="true"]') :
        commonAncestor.parentElement?.isContentEditable || commonAncestor.parentElement?.closest('[contenteditable="true"]');
      if (isInContentEditable) {
        this.highlightContentEditableSelection(range);
      } else {
        this.highlightStandardDOMSelection(range);
      }
    }
  }

  clearHighlightDivs() {
    this.highlightDivs.forEach(d => d.remove());
    this.highlightDivs = [];
    document.querySelectorAll(".highlight-container").forEach(c => c.remove());
  }

  createHighlightRect(rect) {
    const { left, top, width, height } = rect;
    if (width <= 0 || height <= 0) return;
    const div = document.createElement("div");
    div.classList.add("highlight-rect");
    div.style.position = "absolute";
    div.style.left = `${left}px`;
    div.style.top = `${top}px`;
    div.style.width = `${width}px`;
    div.style.height = `${height}px`;
    div.style.zIndex = "999998";
    this.highlightOverlay.appendChild(div);
    this.highlightDivs.push(div);
  }

  highlightTextareaSelection(el) {
    const computedStyle = window.getComputedStyle(el);
    const lineHeight = parseFloat(computedStyle.lineHeight) || parseFloat(computedStyle.fontSize) * 1.2;
    const { selectionStart, selectionEnd } = el;
    if (selectionStart === selectionEnd) return;
    const text = el.value.substring(0, selectionEnd);
    const lines = text.split('\n');
    const selectedText = el.value.substring(selectionStart, selectionEnd);
    const selectedLines = selectedText.split('\n');
    let startLine = text.substr(0, selectionStart).split('\n').length - 1;
    let endLine = startLine + selectedLines.length - 1;

    for (let i = startLine; i <= endLine; i++) {
      const lineStart = i === startLine ? getCaretCoordinates(el, selectionStart) : { left: 0, top: i * lineHeight };
      const lineEnd = i === endLine ? getCaretCoordinates(el, selectionEnd) : { left: el.clientWidth - parseFloat(computedStyle.paddingLeft) - parseFloat(computedStyle.paddingRight) };
      this.createHighlightRect(this.buildRectFromCoords(el, lineStart, lineEnd));
    }
  }

  highlightContentEditableSelection(range) {
    const rects = range.getClientRects();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    Array.from(rects).forEach(rect => {
      if (rect.width >= 1 && rect.height >= 1) {
        this.createHighlightRect({
          left: rect.left + scrollX,
          top: rect.top + scrollY,
          width: rect.width,
          height: rect.height
        });
      }
    });
  }

  highlightStandardDOMSelection(range) {
    const rects = range.getClientRects();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    Array.from(rects).forEach(rect => {
      if (rect.width >= 1 && rect.height >= 1) {
        this.createHighlightRect({
          left: rect.left + scrollX,
          top: rect.top + scrollY,
          width: rect.width,
          height: rect.height
        });
      }
    });
  }

  buildRectFromCoords(textarea, startCoords, endCoords) {
    const s = window.getComputedStyle(textarea);
    const r = textarea.getBoundingClientRect();
    const borderLeft = parseFloat(s.borderLeftWidth) || 0;
    const borderTop = parseFloat(s.borderTopWidth) || 0;
    const paddingLeft = parseFloat(s.paddingLeft) || 0;
    const paddingTop = parseFloat(s.paddingTop) || 0;
    const leftOffset = r.left + window.scrollX + borderLeft + paddingLeft - textarea.scrollLeft;
    const topOffset = r.top + window.scrollY + borderTop + paddingTop - textarea.scrollTop;
    return {
      left: leftOffset + Math.min(startCoords.left, endCoords.left),
      top: topOffset + Math.min(startCoords.top, endCoords.top),
      width: Math.abs(endCoords.left - startCoords.left),
      height: Math.max(startCoords.height, endCoords.height)
    };
  }

  makeDraggable() {
    let offsetX, offsetY, isDragging = false;
    const header = this.chatWindow.querySelector(".chat-header");
    const updatePosition = (x, y) => {
      this.chatWindow.style.left = `${x - offsetX}px`;
      this.chatWindow.style.top = `${y - offsetY}px`;
    };
    header.addEventListener("mousedown", e => {
      if (e.button !== 0) return;
      isDragging = true;
      offsetX = e.clientX - this.chatWindow.offsetLeft;
      offsetY = e.clientY - this.chatWindow.offsetTop;
      header.style.cursor = "grabbing";
      e.preventDefault();
    });
    document.addEventListener("mousemove", e => {
      if (!isDragging) return;
      updatePosition(e.clientX, e.clientY);
      this.scheduleUpdate();
    });
    document.addEventListener("mouseup", () => {
      isDragging = false;
      header.style.cursor = "grab";
    });
    ["input", "scroll", "resize", "keydown", "mouseup"].forEach(evt => {
      window.addEventListener(evt, this.scheduleUpdate.bind(this), true);
    });
    document.addEventListener("selectionchange", () => {
      this.scheduleUpdate();
      this.handleSelectionChange();
    });
  }

  initButtonEvents() {
    const buttons = [this.paraphraseButton, this.summarizeButton, this.translateButton];
    buttons.forEach(button => {
      button.addEventListener("click", () => {
        this.showSuggestionSection("Suggestion text generated");
      });
    });
    this.suggestionSection.querySelector(".accept-suggestion").addEventListener("click", () => this.acceptSuggestion());
    this.suggestionSection.querySelector(".retry-suggestion").addEventListener("click", () => this.retrySuggestion());
    this.suggestionSection.querySelector(".delete-suggestion").addEventListener("click", () => this.deleteSuggestion());
  }  

  replaceHighlightedText(replacementText) {
    const el = this.lastFocusedElement;
    console.log('last focused element: ', el);
    if (!el) return;
  
    if (el.tagName === "TEXTAREA" || el.tagName === "INPUT") {
      const start = this.selectionStart;
      const end = this.selectionEnd;
      if (start !== null && end !== null && start !== end) {
        const text = el.value;
        // Update the element's value
        el.value = text.slice(0, start) + replacementText + text.slice(end);
        
        // Update our stored selection positions to reflect the new content
        const newPosition = start + replacementText.length;
        this.selectionStart = newPosition;
        this.selectionEnd = newPosition;
        
        // Update the actual element's selection
        el.selectionStart = newPosition;
        el.selectionEnd = newPosition;
        
        // Trigger an input event to ensure the change is registered
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    } else if (el.contentEditable === 'true' && this.cachedRange) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      const range = this.cachedRange.cloneRange();
      range.deleteContents();
      const textNode = document.createTextNode(replacementText);
      range.insertNode(textNode);
      
      // Update the cached range to reflect the new content
      this.cachedRange = document.createRange();
      this.cachedRange.selectNodeContents(textNode);
      this.cachedRange.collapse(false);
      
      // Update the selection
      sel.removeAllRanges();
      sel.addRange(this.cachedRange);
    }
  }

  showSuggestionSection(suggestionText) {
    const suggestionTextElement = this.suggestionSection.querySelector("p");
    suggestionTextElement.textContent = suggestionText;
    this.suggestionSection.style.display = "flex";
  }

  acceptSuggestion() {
    const suggestionText = this.suggestionSection.querySelector("p").textContent;
    this.replaceHighlightedText(suggestionText);
    this.deleteSuggestion();
  }

  retrySuggestion() {
    this.showSuggestionSection("Updated suggestion text");
  }

  deleteSuggestion() {
    this.suggestionSection.style.display = "none";
  }

  scheduleUpdate() {
    if (!this.rafPending) {
      this.rafPending = true;
      requestAnimationFrame(() => {
        this.updateCaretPosition();
        this.rafPending = false;
      });
    }
  }

  updateCaretPosition() {
    const el = document.activeElement;
    let caretRect = null;
    if (el && el.tagName === "TEXTAREA") {
      const s = window.getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const borderLeft = parseFloat(s.borderLeftWidth) || 0;
      const borderTop = parseFloat(s.borderTopWidth) || 0;
      const paddingLeft = parseFloat(s.paddingLeft) || 0;
      const paddingTop = parseFloat(s.paddingTop) || 0;
      const pos = el.selectionStart;
      const coords = getCaretCoordinates(el, pos);
      const leftOffset = r.left + window.scrollX + borderLeft + paddingLeft - el.scrollLeft;
      const topOffset = r.top + window.scrollY + borderTop + paddingTop - el.scrollTop;
      caretRect = {
        left: leftOffset + coords.left,
        top: topOffset + coords.top,
        height: coords.height
      };
    } else if (el && el.isContentEditable) {
      const sel = window.getSelection();
      if (sel.rangeCount > 0) {
        const range = sel.getRangeAt(0).cloneRange();
        range.collapse(true);
        const c = range.getBoundingClientRect();
        caretRect = {
          left: c.left + window.scrollX,
          top: c.top + window.scrollY,
          height: c.height
        };
      }
    }
    if (caretRect && caretRect.height > 0) {
      this.caretElement.style.display = "block";
      this.caretElement.style.left = `${caretRect.left - 4}px`;
      this.caretElement.style.top = `${caretRect.top - 4}px`;
    } else {
      this.caretElement.style.display = "none";
    }
  }

  showAtElement() {
    this.chatWindow.style.left = "100px";
    this.chatWindow.style.top = "100px";
    this.chatWindow.style.display = "block";
    this.isVisible = true;
    this.scheduleUpdate();
  }

  hide() {
    this.chatWindow.style.display = "none";
    this.isVisible = false;
    this.caretElement.style.display = "none";
    this.clearHighlightDivs();
    this.highlightActive = false;
  }

  createCaret() {
    const div = document.createElement("div");
    div.className = "grammarly-caret";
    div.innerHTML = ``;
    document.body.appendChild(div);
    return div;
  }

  findLineEnd(textarea, start, selectionEnd) {
    const value = textarea.value;
    let i = start;
    while (i < selectionEnd) {
      if (value[i] === "\n") return i;
      i++;
    }
    return selectionEnd;
  }
}
