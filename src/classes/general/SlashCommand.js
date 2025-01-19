/* eslint-disable */

export class SlashCommand {
  constructor() {
    this.slashCommands = {
      "/synonym": {
        description: "Get synonyms for a word",
        parameters: [{ name: "word", type: "text" }]
      },
      "/antonym": {
        description: "Get antonyms for a word",
        parameters: [{ name: "word", type: "text" }]
      },
      "/search": {
        description: "Search for information",
        parameters: [{ name: "word", type: "text" }]
      }
    };
    this.isActive = false;
    this.currentInput = "";
    this.selectedIndex = 0;
    this.slashCommandUI = null;
    this.parameterUI = null;
    this.initUI();
    this.initListeners();
  }

  initUI() {
    this.slashCommandUI = document.createElement("div");
    this.slashCommandUI.className = "slash-command-ui";
    this.slashCommandUI.style.display = "none";
    document.body.appendChild(this.slashCommandUI);
    this.parameterUI = document.createElement("div");
    this.parameterUI.className = "parameter-ui";
    this.parameterUI.style.display = "none";
    document.body.appendChild(this.parameterUI);
  }

  initListeners() {
    document.addEventListener("keydown", e => {
      if (this.isActive) {
        if (e.key === "ArrowUp") {
          this.updateSelectedIndex(-1);
          e.preventDefault();
        } else if (e.key === "ArrowDown") {
          this.updateSelectedIndex(1);
          e.preventDefault();
        } else if (e.key === "Enter") {
          const selectedOption = this.slashCommandUI.children[this.selectedIndex];
          if (selectedOption) {
            const command = selectedOption.querySelector("span").textContent;
            this.selectCommand(command);
          }
          e.preventDefault();
        } else if (e.key === "Escape") {
          this.hideSlashCommandUI();
          e.preventDefault();
        }
      }
    });
  }

  updateSelectedIndex(delta) {
    const options = this.slashCommandUI.children;
    this.selectedIndex = (this.selectedIndex + delta + options.length) % options.length;
    Array.from(options).forEach((option, index) => {
      option.style.backgroundColor = index === this.selectedIndex ? "#f3f4f6" : "transparent";
    });
  }

  selectCommand(command) {
    this.insertCommandBadge(command);
    this.hideSlashCommandUI();
  }

  hideSlashCommandUI() {
    this.isActive = false;
    this.currentInput = "";
    this.selectedIndex = 0;
    this.slashCommandUI.style.display = "none";
    if (this.parameterUI) {
      this.parameterUI.style.display = "none";
    }
  }

  createSlashCommandOption(command, description) {
    const option = document.createElement("div");
    option.className = "slash-command-option";
    const cmdSpan = document.createElement("span");
    cmdSpan.textContent = command;
    const descSpan = document.createElement("span");
    descSpan.textContent = description;
    option.appendChild(cmdSpan);
    option.appendChild(descSpan);
    option.addEventListener("click", () => this.selectCommand(command));
    return option;
  }

  showSlashCommands(rect, filterText = "") {
    while (this.slashCommandUI.firstChild) {
      this.slashCommandUI.removeChild(this.slashCommandUI.firstChild);
    }
    const filteredCommands = Object.entries(this.slashCommands).filter(([cmd]) =>
      cmd.toLowerCase().includes(filterText.toLowerCase())
    );
    filteredCommands.forEach(([cmd, details]) => {
      const option = this.createSlashCommandOption(cmd, details.description);
      this.slashCommandUI.appendChild(option);
    });
    if (filteredCommands.length > 0) {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const uiRect = this.slashCommandUI.getBoundingClientRect();
      let left = rect.left;
      let top = rect.bottom + 5;
      if (left + uiRect.width > viewportWidth) {
        left = viewportWidth - uiRect.width - 10;
      }
      if (top + uiRect.height > viewportHeight) {
        top = rect.top - uiRect.height - 5;
      }
      this.slashCommandUI.style.left = `${Math.max(10, left)}px`;
      this.slashCommandUI.style.top = `${Math.max(10, top)}px`;
      this.slashCommandUI.style.display = "block";
      this.isActive = true;
    } else {
      this.slashCommandUI.style.display = "none";
    }
    this.selectedIndex = 0;
  }

  insertCommandBadge(command) {
    const badge = document.createElement("div");
    badge.className = "command-badge-overlay";
    badge.style.position = "absolute";
    badge.style.zIndex = "9999999";
    badge.style.display = "inline-flex";
    badge.style.alignItems = "center";
    badge.style.backgroundColor = "#f1f3f4";
    badge.style.borderRadius = "3px";
    badge.style.padding = "0 4px";
    badge.style.margin = "0 1px";
    badge.style.height = "20px";
    badge.style.fontFamily = "'Google Sans', Roboto, Arial, sans-serif";
    badge.style.fontSize = "14px";
    badge.style.lineHeight = "20px";
    badge.style.whiteSpace = "nowrap";
    badge.style.pointerEvents = "all";
    badge.style.cursor = "text";
    badge.style.border = "1px solid transparent";
    badge.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
    badge.setAttribute("data-command", command);
    const commandPart = document.createElement("span");
    commandPart.style.color = "#188038";
    commandPart.style.fontWeight = "500";
    commandPart.style.marginRight = "4px";
    commandPart.style.userSelect = "none";
    commandPart.style.pointerEvents = "none";
    commandPart.textContent = command;
    const parameterPart = document.createElement("span");
    parameterPart.style.color = "#444746";
    parameterPart.style.minWidth = "1px";
    parameterPart.style.outline = "none";
    parameterPart.style.whiteSpace = "pre";
    parameterPart.style.padding = "0 2px";
    parameterPart.style.position = "relative";
    parameterPart.style.zIndex = "10000000";
    parameterPart.contentEditable = "true";
    parameterPart.dataset.placeholder = "Parameter";
    const placeholderStyle = document.createElement("style");
    placeholderStyle.textContent = `[data-placeholder]:empty:before{content:attr(data-placeholder);color:#5f6368;font-style:italic;pointer-events:none}`;
    document.head.appendChild(placeholderStyle);
    let lastCaretPosition = 0;
    parameterPart.addEventListener("focus", () => {
      badge.style.borderColor = "#2563eb";
      badge.style.boxShadow = "0 0 0 2px rgba(37,99,235,0.2)";
    });
    parameterPart.addEventListener("blur", e => {
      e.preventDefault();
      parameterPart.focus();
    });
    parameterPart.addEventListener("input", () => {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        lastCaretPosition = selection.getRangeAt(0).startOffset;
      }
    });
    parameterPart.addEventListener("keydown", async e => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const parameter = parameterPart.textContent.trim();
        badge.style.opacity = "0.5";
        badge.style.pointerEvents = "none";
        parameterPart.contentEditable = "false";
        parameterPart.style.userSelect = "none";
        const spinner = this.createSpinner();
        badge.appendChild(spinner);
        try {
          const cmd = badge.getAttribute("data-command");
          if (!cmd) throw new Error("No command found on badge");
          await this.processCommand(cmd, parameter);
        } catch (error) {
        } finally {
          badge.remove();
          document.activeElement.blur();
        }
      }
    });
    badge.addEventListener("mousedown", e => {
      e.stopPropagation();
      if (e.target === parameterPart || e.target === badge) {
        parameterPart.focus();
      }
    });
    badge.appendChild(commandPart);
    badge.appendChild(parameterPart);
    let overlayContainer = document.querySelector(".command-overlay-container");
    if (!overlayContainer) {
      overlayContainer = document.createElement("div");
      overlayContainer.className = "command-overlay-container";
      overlayContainer.style.position = "fixed";
      overlayContainer.style.top = "0";
      overlayContainer.style.left = "0";
      overlayContainer.style.right = "0";
      overlayContainer.style.bottom = "0";
      overlayContainer.style.zIndex = "9999997";
      overlayContainer.style.pointerEvents = "none";
      document.body.appendChild(overlayContainer);
    }
    overlayContainer.appendChild(badge);
    const cursorPos = this.getCursorPosition(document.activeElement);
    if (cursorPos) {
      const coords = this.getCursorCoordinates(document.activeElement, cursorPos.position);
      if (coords) {
        badge.style.left = `${coords.left}px`;
        badge.style.top = `${coords.top}px`;
      }
    }
    requestAnimationFrame(() => {
      parameterPart.focus();
    });
    return badge;
  }

  createSpinner() {
    const spinner = document.createElement("span");
    spinner.className = "inline-spinner";
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "14");
    svg.setAttribute("height", "14");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.style.verticalAlign = "middle";
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", "12");
    circle.setAttribute("cy", "12");
    circle.setAttribute("r", "10");
    circle.setAttribute("stroke", "#999");
    circle.setAttribute("stroke-width", "4");
    circle.setAttribute("stroke-dasharray", "31.4");
    circle.setAttribute("stroke-dashoffset", "0");
    const animate = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
    animate.setAttribute("attributeName", "transform");
    animate.setAttribute("attributeType", "XML");
    animate.setAttribute("type", "rotate");
    animate.setAttribute("from", "0 12 12");
    animate.setAttribute("to", "360 12 12");
    animate.setAttribute("dur", "1s");
    animate.setAttribute("repeatCount", "indefinite");
    circle.appendChild(animate);
    svg.appendChild(circle);
    spinner.appendChild(svg);
    return spinner;
  }

  async processCommand(command, parameter) {
    try {
      await chrome.runtime.sendMessage({
        action: "sendCommand",
        command: command,
        parameter: parameter
      });
    } catch (error) {
    }
  }

  getCursorPosition(element) {
    if (!element) return null;
    if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
      return {
        start: element.selectionStart,
        end: element.selectionEnd,
        position: element.selectionStart,
        element: element
      };
    } else if (element.isContentEditable) {
      const selection = window.getSelection();
      if (!selection.rangeCount) return null;
      const range = selection.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(element);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      return {
        start: preCaretRange.toString().length,
        end: preCaretRange.toString().length,
        position: preCaretRange.toString().length,
        element: element,
        range: range
      };
    }
    return null;
  }

  getCursorCoordinates(element, position) {
    if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
      const mirror = document.createElement("div");
      const computedStyle = window.getComputedStyle(element);
      for (const key of computedStyle) {
        mirror.style[key] = computedStyle[key];
      }
      mirror.style.position = "absolute";
      mirror.style.visibility = "hidden";
      mirror.style.whiteSpace = "pre-wrap";
      mirror.style.wordWrap = "break-word";
      mirror.style.overflow = "hidden";
      mirror.style.width = `${element.offsetWidth}px`;
      const text = element.value.substring(0, position);
      mirror.textContent = text;
      const marker = document.createElement("span");
      marker.textContent = "|";
      mirror.appendChild(marker);
      document.body.appendChild(mirror);
      const markerRect = marker.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const coordinates = {
        left: elementRect.left + markerRect.left - mirror.getBoundingClientRect().left,
        top: elementRect.top + markerRect.top - mirror.getBoundingClientRect().top
      };
      document.body.removeChild(mirror);
      return coordinates;
    }
    return null;
  }
}
