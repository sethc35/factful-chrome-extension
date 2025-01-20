/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

export class SlashCommand {
  constructor() {
      this.slashCommands = {
          '/synonym': {
              description: 'Get synonyms for a word',
              parameters: [
                  { name: 'word', type: 'text' }
              ]
          },
          '/antonym': {
              description: 'Get antonyms for a word',
              parameters: [
                  { name: 'word', type: 'text' }
              ]
          },
          '/search': {
              description: 'Search for information',
              parameters: [
                  { name: 'word', type: 'text' }
              ]
          }
      };
      this.isActive = false;
      this.currentInput = '';
      this.selectedIndex = 0;
      this.slashCommandUI = null;
      this.parameterUI = null;
      this.addStyles();
      this.createSlashCommandUI();
      this.createParameterUI();
      this.initKeyboardListeners();
  }

  addStyles() {
      const style = document.createElement('style');
      style.textContent = `
          .slash-command-ui {
              position: fixed;
              background-color: #ffffff;
              border: 1px solid #e0e0e0;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              padding: 8px 0;
              z-index: 2147483647;
              display: none;
              max-height: 200px;
              overflow-y: auto;
              min-width: 200px;
              pointer-events: auto;
          }
          .slash-command-option {
              padding: 8px 16px;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 8px;
          }
          .slash-command-option span {
              display: inline-block;
              font-size: 13px;
              color: #374151;
          }
          .slash-command-option span:first-child {
              font-weight: 600;
              color: #2196F3;
          }
          .slash-command-option:hover {
              background-color: #f3f4f6;
          }
          .parameter-ui {
              position: fixed;
              background-color: #ffffff;
              border: 1px solid #e0e0e0;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              padding: 12px;
              z-index: 2147483647;
              display: none;
              flex-direction: column;
              gap: 8px;
          }
          .parameter-field {
              display: flex;
              flex-direction: column;
              gap: 4px;
              margin-bottom: 8px;
          }
          .parameter-field label {
              color: #666666;
              font-size: 12px;
          }
          .parameter-field input {
              width: 100%;
              padding: 8px;
              border: 1px solid #e0e0e0;
              border-radius: 4px;
              outline: none;
          }
          .parameter-actions {
              display: flex;
              justify-content: flex-end;
              gap: 8px;
              margin-top: 8px;
          }
          .parameter-actions button {
              padding: 6px 12px;
              border-radius: 4px;
              cursor: pointer;
              border: none;
          }
          .parameter-actions button.cancel-btn {
              background-color: white;
              color: #374151;
              border: 1px solid #e0e0e0;
          }
          .parameter-actions button.execute-btn {
              background-color: #2563eb;
              color: white;
          }
          .command-badge-overlay {
              position: absolute;
              z-index: 2147483647;
              pointer-events: auto;
              display: inline-flex;
              align-items: center;
              gap: 4px;
              transition: opacity 0.2s ease-out;
              background-color: #f1f3f4;
              border: 1px solid transparent;
              border-radius: 3px;
              padding: 0 4px;
              margin: 0 1px;
              height: 20px;
              font-family: 'Google Sans', Roboto, Arial, sans-serif;
              font-size: 14px;
              line-height: 20px;
              white-space: nowrap;
              cursor: text;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          .command-badge-overlay span.command-text {
              color: #188038;
              font-weight: 500;
              margin-right: 4px;
              user-select: none;
              pointer-events: none;
          }
          .command-badge-overlay span.command-param {
              color: #444746;
              min-width: 1px;
              outline: none;
              white-space: pre;
              position: relative;
              z-index: 10000000;
          }
          [data-placeholder]:empty:before {
              content: attr(data-placeholder);
              color: #5f6368;
              font-style: italic;
              pointer-events: none;
          }
          .inline-spinner {
              margin-left: 6px;
              display: inline-flex;
              align-items: center;
          }
          .inline-checkmark {
              margin-left: 6px;
              display: inline-flex;
              align-items: center;
          }
          @keyframes cursorBlink {
              0%, 100% { opacity: 1; }
              50% { opacity: 0; }
          }
      `;
      document.head.appendChild(style);
  }

  createSlashCommandUI() {
      this.slashCommandUI = document.createElement('div');
      this.slashCommandUI.className = 'slash-command-ui';
      document.body.appendChild(this.slashCommandUI);
  }

  createParameterUI() {
      this.parameterUI = document.createElement('div');
      this.parameterUI.className = 'parameter-ui';
      document.body.appendChild(this.parameterUI);
  }

  initKeyboardListeners() {
      document.addEventListener('keydown', (event) => {
          if (event.altKey && event.key === '/') {
              const element = document.activeElement;
              if (!element) return;
              const cursorPos = this.getCaretPosition(element);
              const rect = this.getCursorRect(element, cursorPos !== null ? cursorPos : 0);
              if (rect) {
                  this.isActive = true;
                  this.showSlashCommands(rect);
              }
              event.preventDefault();
          }
          if (this.isActive) {
              if (event.key === 'ArrowUp') {
                  this.updateSelectedIndex(-1);
                  event.preventDefault();
              } else if (event.key === 'ArrowDown') {
                  this.updateSelectedIndex(1);
                  event.preventDefault();
              } else if (event.key === 'Enter') {
                  const selectedOption = this.slashCommandUI.children[this.selectedIndex];
                  if (selectedOption) {
                      const command = selectedOption.querySelector('span').textContent;
                      this.selectCommand(command);
                  }
                  event.preventDefault();
              } else if (event.key === 'Escape') {
                  this.hideSlashCommandUI();
                  event.preventDefault();
              }
          }
      });
      document.addEventListener('input', (e) => {
          if (!this.isActive) return;
          if (!e.target) return;
          const element = e.target;
          if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element.isContentEditable) {
              const text = element.value || element.textContent || '';
              const cursorPos = this.getCaretPosition(element);
              if (cursorPos === null) return;
              const slashIndex = text.lastIndexOf('/', cursorPos - 1);
              if (slashIndex !== -1) {
                  const typedCommand = text.substring(slashIndex, cursorPos);
                  if (typedCommand.length <= 30) {
                      const rect = this.getCursorRect(element, slashIndex);
                      this.currentInput = typedCommand;
                      this.showSlashCommands(rect, typedCommand);
                  } else {
                      this.hideSlashCommandUI();
                  }
              } else {
                  this.hideSlashCommandUI();
              }
          }
      });
  }

  showSlashCommands(cursorRect, filterText = '') {
      if (!cursorRect) return;
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
          let left = cursorRect.left;
          let top = cursorRect.bottom + 5;
          if (left + uiRect.width > viewportWidth) {
              left = viewportWidth - uiRect.width - 10;
          }
          if (top + uiRect.height > viewportHeight) {
              top = cursorRect.top - uiRect.height - 5;
          }
          this.slashCommandUI.style.left = Math.max(10, left) + 'px';
          this.slashCommandUI.style.top = Math.max(10, top) + 'px';
          this.slashCommandUI.style.display = 'block';
          this.isActive = true;
      } else {
          this.slashCommandUI.style.display = 'none';
      }
      this.selectedIndex = 0;
  }

  hideSlashCommandUI() {
      this.isActive = false;
      this.currentInput = '';
      this.selectedIndex = 0;
      this.slashCommandUI.style.display = 'none';
      this.parameterUI.style.display = 'none';
  }

  updateSelectedIndex(delta) {
      const options = this.slashCommandUI.children;
      this.selectedIndex = (this.selectedIndex + delta + options.length) % options.length;
      Array.from(options).forEach((option, index) => {
          option.style.backgroundColor = index === this.selectedIndex ? '#f3f4f6' : 'transparent';
      });
  }

  selectCommand(command) {
      this.insertCommandBadge(command);
      this.hideSlashCommandUI();
  }

  createSlashCommandOption(command, description) {
      const option = document.createElement('div');
      option.className = 'slash-command-option';
      const cmdSpan = document.createElement('span');
      cmdSpan.textContent = command;
      const descSpan = document.createElement('span');
      descSpan.textContent = description;
      option.appendChild(cmdSpan);
      option.appendChild(descSpan);
      option.addEventListener('click', () => this.selectCommand(command));
      return option;
  }

  insertCommandBadge(command) {
      const element = document.activeElement;
      if (!element) return;
      const badge = document.createElement('div');
      badge.className = 'command-badge-overlay';
      badge.dataset.command = command;
      const commandPart = document.createElement('span');
      commandPart.className = 'command-text';
      commandPart.textContent = command;
      const parameterPart = document.createElement('span');
      parameterPart.className = 'command-param';
      parameterPart.contentEditable = 'true';
      parameterPart.dataset.placeholder = 'Parameter';
      badge.appendChild(commandPart);
      badge.appendChild(parameterPart);
      const overlayContainer = document.createElement('div');
      overlayContainer.style.position = 'fixed';
      overlayContainer.style.zIndex = '9999997';
      overlayContainer.style.pointerEvents = 'none';
      overlayContainer.appendChild(badge);
      document.body.appendChild(overlayContainer);
      const cursorPos = this.getCursorPosition(element);
      if (cursorPos) {
          const coords = this.getCursorCoordinates(element, cursorPos.position);
          if (coords) {
              overlayContainer.style.left = coords.left + 'px';
              overlayContainer.style.top = coords.top + 'px';
          }
      }
      requestAnimationFrame(() => {
          parameterPart.focus();
      });
      parameterPart.addEventListener('keydown', async (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              const parameter = parameterPart.textContent.trim();
              badge.style.opacity = '0.5';
              badge.style.pointerEvents = 'none';
              parameterPart.contentEditable = 'false';
              parameterPart.style.userSelect = 'none';
              const spinner = this.createSpinner();
              badge.appendChild(spinner);
              try {
                  const cmd = badge.getAttribute('data-command');
                  await this.processCommand(cmd, parameter, element);
              } finally {
                  overlayContainer.remove();
                  element.focus();
              }
          }
      });
      badge.addEventListener('mousedown', (e) => {
          e.stopPropagation();
          if (e.target === parameterPart || e.target === badge) {
              parameterPart.focus();
          }
      });
  }

  async processCommand(command, parameter, lastFocusedElement) {
      try {
          const response = await chrome.runtime.sendMessage({
              action: 'sendCommand',
              command: command,
              parameter: parameter
          });
          if (!response || response.error) {
              return null;
          }
          if (command === '/synonym' && response.synonyms?.length > 0) {
              return await this.createPopdown(response.synonyms, lastFocusedElement);
          }
          if (command === '/antonym' && response.antonyms?.length > 0) {
              return await this.createPopdown(response.antonyms, lastFocusedElement);
          }
          if (command === '/search' && response.search_results?.length > 0) {
              return await this.createPopdown(response.search_results, lastFocusedElement);
          }
          return null;
      } catch (error) {
          return null;
      }
  }

  async createPopdown(items, lastFocusedElement) {
      const popdown = document.createElement('div');
      popdown.style.position = 'fixed';
      popdown.style.backgroundColor = '#ffffff';
      popdown.style.border = '1px solid #e0e0e0';
      popdown.style.borderRadius = '8px';
      popdown.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
      popdown.style.padding = '8px';
      popdown.style.zIndex = '9999999';
      popdown.style.display = 'flex';
      popdown.style.flexDirection = 'column';
      popdown.style.gap = '4px';
      const caretPos = this.getCursorPosition(lastFocusedElement);
      const coords = caretPos && this.getCursorCoordinates(lastFocusedElement, caretPos.position);
      popdown.style.left = coords ? coords.left + 'px' : '100px';
      popdown.style.top = coords ? coords.top + 20 + 'px' : '120px';
      let isProcessing = false;
      items.forEach((item) => {
          const button = document.createElement('button');
          button.textContent = item;
          button.style.padding = '8px 12px';
          button.style.border = 'none';
          button.style.borderRadius = '4px';
          button.style.backgroundColor = '#f3f4f6';
          button.style.cursor = 'pointer';
          button.style.textAlign = 'left';
          button.style.width = '100%';
          button.style.color = '#374151';
          button.style.fontFamily = "'Google Sans', Roboto, Arial, sans-serif";
          button.style.fontSize = '14px';
          button.addEventListener('mouseover', () => {
              button.style.backgroundColor = '#e5e7eb';
          });
          button.addEventListener('mouseout', () => {
              button.style.backgroundColor = '#f3f4f6';
          });
          button.addEventListener('mousedown', (e) => {
              e.preventDefault();
          });
          const clickHandler = async (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (isProcessing) return;
              isProcessing = true;
              button.removeEventListener('click', clickHandler);
              try {
                  if (popdown.parentNode) {
                      popdown.remove();
                  }
                  if (lastFocusedElement) {
                      lastFocusedElement.focus();
                      if (lastFocusedElement instanceof HTMLTextAreaElement || lastFocusedElement instanceof HTMLInputElement) {
                          const selectionStart = lastFocusedElement.selectionStart;
                          const selectionEnd = lastFocusedElement.selectionEnd;
                          if (selectionStart !== null && selectionEnd !== null) {
                              const currentText = lastFocusedElement.value;
                              lastFocusedElement.value = currentText.slice(0, selectionStart) + item + currentText.slice(selectionEnd);
                              lastFocusedElement.setSelectionRange(selectionStart + item.length, selectionStart + item.length);
                          }
                      } else if (lastFocusedElement.isContentEditable) {
                          const selection = window.getSelection();
                          if (selection.rangeCount > 0) {
                              const range = selection.getRangeAt(0);
                              const textNode = document.createTextNode(item);
                              range.deleteContents();
                              range.insertNode(textNode);
                              range.setStartAfter(textNode);
                              range.setEndAfter(textNode);
                              selection.removeAllRanges();
                              selection.addRange(range);
                          }
                      }
                      lastFocusedElement.dispatchEvent(new Event('input', { bubbles: true }));
                  }
              } catch (error) {
                console.log('error with clicking popdown: ', error)
;              } finally {
                  isProcessing = false;
              }
          };
          button.addEventListener('click', clickHandler);
          popdown.appendChild(button);
      });
      document.body.appendChild(popdown);
      const handleClickOutside = (e) => {
          if (!popdown.contains(e.target)) {
              if (popdown.parentNode) {
                  popdown.remove();
              }
              document.removeEventListener('mousedown', handleClickOutside);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
  }

  createSpinner() {
      const spinner = document.createElement('span');
      spinner.className = 'inline-spinner';
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '14');
      svg.setAttribute('height', '14');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('fill', 'none');
      svg.style.verticalAlign = 'middle';
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', '12');
      circle.setAttribute('cy', '12');
      circle.setAttribute('r', '10');
      circle.setAttribute('stroke', '#999');
      circle.setAttribute('stroke-width', '4');
      circle.setAttribute('stroke-dasharray', '31.4');
      circle.setAttribute('stroke-dashoffset', '0');
      const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animateTransform');
      animate.setAttribute('attributeName', 'transform');
      animate.setAttribute('attributeType', 'XML');
      animate.setAttribute('type', 'rotate');
      animate.setAttribute('from', '0 12 12');
      animate.setAttribute('to', '360 12 12');
      animate.setAttribute('dur', '1s');
      animate.setAttribute('repeatCount', 'indefinite');
      circle.appendChild(animate);
      svg.appendChild(circle);
      spinner.appendChild(svg);
      return spinner;
  }

  getCaretPosition(element) {
      if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
          return element.selectionStart;
      }
      if (element.isContentEditable) {
          const sel = window.getSelection();
          if (!sel.rangeCount) return null;
          const range = sel.getRangeAt(0);
          const preCaretRange = range.cloneRange();
          preCaretRange.selectNodeContents(element);
          preCaretRange.setEnd(range.endContainer, range.endOffset);
          return preCaretRange.toString().length;
      }
      return null;
  }

  getCursorRect(element, slashIndex) {
      if (element instanceof HTMLTextAreaElement) {
          const mirror = this.createMirrorElement(element);
          const textBeforeSlash = element.value.substring(0, slashIndex + 1);
          const measureSpan = document.createElement('span');
          measureSpan.textContent = textBeforeSlash;
          mirror.appendChild(measureSpan);
          document.body.appendChild(mirror);
          const elementRect = element.getBoundingClientRect();
          const spanRect = measureSpan.getBoundingClientRect();
          const mirrorRect = mirror.getBoundingClientRect();
          const coords = {
              left: elementRect.left + (spanRect.left - mirrorRect.left),
              bottom: elementRect.top + (spanRect.top - mirrorRect.top) + spanRect.height,
              top: elementRect.top + (spanRect.top - mirrorRect.top),
          };
          document.body.removeChild(mirror);
          return coords;
      } else if (element.isContentEditable) {
          const selection = window.getSelection();
          if (!selection.rangeCount) return null;
          const range = document.createRange();
          let node = element;
          let charCount = 0;
          const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
          while ((node = walker.nextNode())) {
              const nodeLength = node.textContent.length;
              if (charCount + nodeLength >= slashIndex) {
                  const offset = slashIndex - charCount;
                  range.setStart(node, offset);
                  range.setEnd(node, offset + 1);
                  break;
              }
              charCount += nodeLength;
          }
          const rect = range.getBoundingClientRect();
          return {
              left: rect.left,
              bottom: rect.bottom,
              top: rect.top
          };
      }
      return null;
  }

  getCursorCoordinates(element, position) {
      if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
          const mirror = document.createElement('div');
          const computedStyle = window.getComputedStyle(element);
          for (const key of computedStyle) {
              mirror.style[key] = computedStyle[key];
          }
          mirror.style.position = 'absolute';
          mirror.style.visibility = 'hidden';
          mirror.style.whiteSpace = 'pre-wrap';
          mirror.style.wordWrap = 'break-word';
          mirror.style.overflow = 'hidden';
          mirror.style.width = element.offsetWidth + 'px';
          const text = element.value.substring(0, position);
          mirror.textContent = text;
          const marker = document.createElement('span');
          marker.textContent = '|';
          mirror.appendChild(marker);
          document.body.appendChild(mirror);
          const markerRect = marker.getBoundingClientRect();
          const elementRect = element.getBoundingClientRect();
          const coords = {
              left: elementRect.left + (markerRect.left - mirror.getBoundingClientRect().left),
              top: elementRect.top + (markerRect.top - mirror.getBoundingClientRect().top)
          };
          document.body.removeChild(mirror);
          return coords;
      }
      if (element.isContentEditable) {
          const selection = window.getSelection();
          if (selection.rangeCount === 0) return null;
          const range = selection.getRangeAt(0).cloneRange();
          range.collapse(true);
          const rect = range.getBoundingClientRect();
          return {
              left: rect.left,
              top: rect.top
          };
      }
      return null;
  }

  createMirrorElement(element) {
      const mirror = document.createElement('div');
      const styles = window.getComputedStyle(element);
      const relevantStyles = [
          'font-family',
          'font-size',
          'font-weight',
          'font-style',
          'letter-spacing',
          'text-transform',
          'word-spacing',
          'padding',
          'border',
          'box-sizing',
          'line-height',
          'white-space',
          'text-decoration',
          'text-align',
          'direction',
          'writing-mode'
      ];
      relevantStyles.forEach(style => {
          mirror.style[style] = styles[style];
      });
      mirror.style.position = 'absolute';
      mirror.style.top = '-9999px';
      mirror.style.left = '-9999px';
      mirror.style.width = element.offsetWidth + 'px';
      mirror.style.height = 'auto';
      mirror.style.whiteSpace = 'pre-wrap';
      mirror.style.visibility = 'hidden';
      mirror.style.overflow = 'hidden';
      return mirror;
  }
}
