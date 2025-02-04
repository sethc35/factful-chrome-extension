/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

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
                description: 'Generate anything',
                parameters: [
                    { name: 'word', type: 'text' }
                ]
            },
            "/generate": {
                description: "Generate text",
                parameters: [
                    { name: "word", type: "text" }
                ]
            }
        }
        this.isActive = false
        this.currentInput = ''
        this.selectedIndex = 0
        this.slashCommandUI = null
        this.parameterUI = null
        this.lastFocusedElement = null
        this.originalRange = null;
        this.originalRange = null;
        this.lastKeyPresses = [];
        this.keyPressTimeout = null;
        this.addStyles()
        this.createSlashCommandUI()
        this.createParameterUI()
        this.cacheFocusedElement()
        this.initKeyboardListeners()
    }

    cacheFocusedElement() {
        document.addEventListener('focus', (e) => {
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement ||
                (e.target.isContentEditable && e.target.contentEditable === 'true')
            ) {
                this.lastFocusedElement = e.target
            }
        }, true)
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .slash-command-ui {
                position: absolute;
                background-color: #fff;
                border: 1px solid #ddd;
                border-radius: 6px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                padding: 0;
                z-index: 9999999;
                display: none;
                max-height: 250px;
                overflow-y: auto;
                min-width: 200px;
                pointer-events: auto;
                font-family: Arial, sans-serif;
            }
            .slash-command-option {
                padding: 10px 12px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 10px;
                transition: background-color 0.2s ease, color 0.2s ease;
            }
            .slash-command-option span {
                display: inline-block;
                font-size: 14px;
                line-height: 1.5;
            }
            .slash-command-option span:first-child {
                font-weight: bold;
                color: #007BFF; /* Adjust for blue tone */
            }
            .slash-command-option span:last-child {
                color: #555; /* Subtle gray tone */
            }
            .slash-command-option:hover,
            .slash-command-option.selected {
                background-color: #f0f8ff; /* Soft blue for hover effect */
                color: #333;
            }
            .parameter-ui {
                position: fixed;
                background-color: #ffffff;
                border: 1px solid #ddd;
                border-radius: 6px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                padding: 16px;
                z-index: 2147483647;
                display: none;
                flex-direction: column;
                gap: 10px;
            }
            .command-badge-overlay {
                position: absolute;
                z-index: 2147483647;
                pointer-events: auto;
                display: inline-flex;
                align-items: center;
                gap: 4px;
                background-color: #f9f9f9;
                border-radius: 4px;
                padding: 4px 8px;
                font-size: 14px;
                color: #444;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            [data-placeholder]:empty:before {
                content: attr(data-placeholder);
                color: #aaa;
                font-style: italic;
                pointer-events: none;
            }
        `;
        document.head.appendChild(style);
    }    

    createSlashCommandUI() {
        this.slashCommandUI = document.createElement('div')
        this.slashCommandUI.className = 'slash-command-ui'
        document.body.appendChild(this.slashCommandUI)
    }

    createParameterUI() {
        this.parameterUI = document.createElement('div')
        this.parameterUI.className = 'parameter-ui'
        document.body.appendChild(this.parameterUI)
    }

    getCursorCoordinates(element, position) {
        if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
            const mirror = document.createElement('div');
            const computedStyle = window.getComputedStyle(element);
            
            mirror.style.cssText = `
                position: absolute;
                visibility: hidden;
                white-space: pre-wrap;
                word-wrap: break-word;
                overflow: hidden;
                width: ${element.offsetWidth}px;
                height: ${element.offsetHeight}px;
                font: ${computedStyle.font};
                padding: ${computedStyle.padding};
                border: ${computedStyle.border};
                line-height: ${computedStyle.lineHeight};
            `;
    
            const text = element.value.substring(0, position);
            mirror.textContent = text.replace(/\n$/, '\n\u200b');
    
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
        else if (element.isContentEditable) {
            const selection = window.getSelection();
            if (!selection.rangeCount) return null;

            const marker = document.createElement('span');
            marker.innerHTML = '&#feff;';  // Zero-width space
            const range = selection.getRangeAt(0).cloneRange();
            range.collapse(true);
            range.insertNode(marker);

            const rect = marker.getBoundingClientRect();
            const computed = window.getComputedStyle(element);

            const scrollX = window.scrollX || window.pageXOffset;
            const scrollY = window.scrollY || window.pageYOffset;

            const containerRect = element.getBoundingClientRect();
            const left = rect.left + scrollX - containerRect.left;
            const top = rect.top + scrollY - containerRect.top;

            marker.parentNode?.removeChild(marker);
    
            return { 
                left: left + parseInt(computed.paddingLeft),
                top: top + parseInt(computed.paddingTop)
            };
        }
        return null;
    }

    getCaretPosition(element) {
        if (element instanceof HTMLTextAreaElement) {
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

    initKeyboardListeners() {
        let shortcutBuffer = [];
        let shortcutTimeout;
    
        document.addEventListener('keydown', (event) => {
            if (shortcutTimeout) {
                clearTimeout(shortcutTimeout);
            }
    
            shortcutBuffer.push({
                key: event.key,
                ctrl: event.ctrlKey || event.metaKey,
                shift: event.shiftKey,
                alt: event.altKey
            });
    
            if (shortcutBuffer.length > 3) {
                shortcutBuffer.shift();
            }
    
            shortcutTimeout = setTimeout(() => {
                shortcutBuffer = [];
            }, 500);
    
            const lastTwoSlashes = shortcutBuffer
                .slice(-2)
                .every(press => press.key === '/' && press.ctrl);
    
            if (lastTwoSlashes) {
                event.preventDefault();
                event.stopPropagation();
    
                if (!this.lastFocusedElement) return;
    
                this.currentInput = '';
                this.removeLastTextNode(this.lastFocusedElement);
    
                const cursorRect = this.getCursorPosition(
                    this.lastFocusedElement,
                    this.getCaretPosition(this.lastFocusedElement)
                );
    
                if (cursorRect) {
                    this.showSlashCommands(cursorRect, this.currentInput);
                }
    
                shortcutBuffer = [];
                return;
            }
    
            if (event.key === 'Enter' && this.isActive) {
                const selectedOption = this.slashCommandUI.children[this.selectedIndex];
                if (selectedOption) {
                    const command = selectedOption.querySelector('span').textContent;
                    this.selectCommand(command);
                }
                event.preventDefault();
            } else if (event.key === 'Escape') {
                this.resetTracking();
                event.preventDefault();
            } else if (event.key === 'ArrowUp' && this.isActive) {
                this.updateSelectedIndex(-1);
                event.preventDefault();
            } else if (event.key === 'ArrowDown' && this.isActive) {
                this.updateSelectedIndex(1);
                event.preventDefault();
            } else if (
                this.isActive &&
                event.key.length === 1 &&
                !event.ctrlKey &&
                !event.metaKey &&
                !event.altKey
            ) {
                this.currentInput += event.key;
                const cursorRect = this.getCursorPosition(
                    this.lastFocusedElement,
                    this.getCaretPosition(this.lastFocusedElement)
                );
                if (cursorRect) {
                    this.showSlashCommands(cursorRect, this.currentInput);
                }
            } else if (this.isActive && event.key === 'Backspace') {
                this.currentInput = this.currentInput.slice(0, -1);
                const cursorRect = this.getCursorPosition(
                    this.lastFocusedElement,
                    this.getCaretPosition(this.lastFocusedElement)
                );
                if (cursorRect) {
                    this.showSlashCommands(cursorRect, this.currentInput);
                }
            }
        });
    
        document.addEventListener('blur', () => {
            shortcutBuffer = [];
        }, true);
    
        document.addEventListener('click', (event) => {
            if (!this.slashCommandUI.contains(event.target)) {
                this.resetTracking();
            }
        });
    }

    removeLastTextNode(element) {
        if (element.isContentEditable) {
            const selection = window.getSelection();
            if (!selection.rangeCount) return;

            const range = selection.getRangeAt(0);
            const startContainer = range.startContainer;
            
            if (startContainer.nodeType === Node.TEXT_NODE) {
                const text = startContainer.textContent;
                const currentPos = range.startOffset;
                
                let wordStart = currentPos;
                while (wordStart > 0 && !/\s/.test(text[wordStart - 1])) {
                    wordStart--;
                }

                const newText = text.substring(0, wordStart) + 
                              (wordStart > 0 ? ' ' : '') + 
                              text.substring(currentPos);
                
                startContainer.textContent = newText;
                
                range.setStart(startContainer, wordStart);
                range.setEnd(startContainer, wordStart);
                selection.removeAllRanges();
                selection.addRange(range);
                
                const inputEvent = new InputEvent('input', {
                    bubbles: true,
                    cancelable: true,
                });
                element.dispatchEvent(inputEvent);
            }
        } else if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
            const cursorPos = element.selectionStart;
            const text = element.value;
            
            let wordStart = cursorPos;
            while (wordStart > 0 && !/\s/.test(text[wordStart - 1])) {
                wordStart--;
            }

            const newText = text.substring(0, wordStart) + 
                          (wordStart > 0 ? ' ' : '') + 
                          text.substring(cursorPos);
            
            element.value = newText;
            element.selectionStart = wordStart;
            element.selectionEnd = wordStart;
            
            const inputEvent = new InputEvent('input', {
                bubbles: true,
                cancelable: true,
            });
            element.dispatchEvent(inputEvent);
        }
    }

    selectCommand(command) {
        const popdownRect = this.slashCommandUI.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const isAboveCursor = popdownRect.top > viewportHeight / 2;
    
        this.lastPopdownPosition = {
            left: popdownRect.left,
            top: popdownRect.top,
            bottom: popdownRect.bottom,
            width: popdownRect.width,
            isAboveCursor: isAboveCursor
        };
    
        const element = this.lastFocusedElement || document.activeElement;
        this.originalRange = null;
    
        if (element.isContentEditable) {
            const sel = window.getSelection();
            if (sel.rangeCount > 0) {
                this.originalRange = sel.getRangeAt(0).cloneRange();
            }
        } else if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
            this.originalRange = {
                start: element.selectionStart,
                end: element.selectionEnd
            };
        }
    
        this.removeLastTextNode(element);
        this.insertCommandBadge(command);
        this.resetTracking();
    }
    
    resetTracking() {
        this.isActive = false;
        this.currentInput = '';
        this.selectedIndex = 0;
        this.hideSlashCommandUI();
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
            let isAboveCursor = false;

            const spaceBelow = viewportHeight - cursorRect.bottom;
            const spaceAbove = cursorRect.top;
            
            if (spaceBelow < uiRect.height && spaceAbove > uiRect.height) {
                top = cursorRect.top - uiRect.height - 5;
                isAboveCursor = true;
            }
    
            if (left + uiRect.width > viewportWidth) {
                left = viewportWidth - uiRect.width - 10;
            }
    
            this.slashCommandUI.style.left = Math.max(10, left) + 'px';
            this.slashCommandUI.style.top = Math.max(10, top) + 'px';
            this.slashCommandUI.style.display = 'block';
            this.isActive = true;
            this.lastPopdownPosition = {
                left: left,
                top: top,
                bottom: top + uiRect.height,
                width: uiRect.width,
                isAboveCursor: isAboveCursor
            };
        } else {
            this.slashCommandUI.style.display = 'none';
        }
        this.selectedIndex = 0;
    }

    hideSlashCommandUI() {
        this.isActive = false
        this.currentInput = ''
        this.selectedIndex = 0
        this.slashCommandUI.style.display = 'none'
        this.parameterUI.style.display = 'none'
    }

    updateSelectedIndex(delta) {
        const options = this.slashCommandUI.children
        this.selectedIndex = (this.selectedIndex + delta + options.length) % options.length
        Array.from(options).forEach((option, index) => {
            option.style.backgroundColor = index === this.selectedIndex ? '#f3f4f6' : 'transparent'
        })
    }

    createSlashCommandOption(command, description) {
        const option = document.createElement('div')
        option.className = 'slash-command-option'
        const cmdSpan = document.createElement('span')
        cmdSpan.textContent = command
        const descSpan = document.createElement('span')
        descSpan.textContent = description
        option.appendChild(cmdSpan)
        option.appendChild(descSpan)
        option.addEventListener('click', () => this.selectCommand(command))
        return option
    }

    insertCommandBadge(command) {
        const element = this.lastFocusedElement || document.activeElement
        if (!element) return
    
        const badge = document.createElement('div')
        badge.className = 'command-badge-overlay'
        badge.dataset.command = command
        badge.style.position = 'absolute'
        badge.style.zIndex = '2147483647'
        badge.style.display = 'inline-flex'
        badge.style.alignItems = 'center'
        badge.style.backgroundColor = '#e0f2ff'
        badge.style.borderRadius = '3px'
        badge.style.padding = '0 4px'
        badge.style.margin = '0 1px'
        badge.style.height = '20px'
        badge.style.fontFamily = "'Google Sans', Roboto, Arial, sans-serif"
        badge.style.fontSize = '14px'
        badge.style.lineHeight = '20px'
        badge.style.whiteSpace = 'nowrap'
        badge.style.pointerEvents = 'all'
        badge.style.cursor = 'text'
        badge.style.border = '1px solid transparent'
        badge.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
    
        const commandPart = document.createElement('span')
        commandPart.style.color = '#1d4ed8'
        commandPart.style.fontWeight = '700'
        commandPart.style.marginRight = '4px'
        commandPart.style.userSelect = 'none'
        commandPart.style.pointerEvents = 'none'
        commandPart.textContent = command
    
        const paramSpan = document.createElement('span')
        paramSpan.style.color = '#444746'
        paramSpan.style.minWidth = '1px'
        paramSpan.style.outline = 'none'
        paramSpan.style.whiteSpace = 'pre'
        paramSpan.style.padding = '0 2px'
        paramSpan.contentEditable = 'true'
        paramSpan.dataset.placeholder = 'Parameter'
    
        badge.appendChild(commandPart)
        badge.appendChild(paramSpan)
    
        let overlayContainer = document.querySelector('.command-overlay-container')
        if (!overlayContainer) {
            overlayContainer = document.createElement('div')
            overlayContainer.className = 'command-overlay-container'
            overlayContainer.style.position = 'fixed'
            overlayContainer.style.top = '0'
            overlayContainer.style.left = '0'
            overlayContainer.style.right = '0'
            overlayContainer.style.bottom = '0'
            overlayContainer.style.zIndex = '9999997'
            overlayContainer.style.pointerEvents = 'none'
            document.body.appendChild(overlayContainer)
        }
        overlayContainer.appendChild(badge)

        if (this.lastPopdownPosition) {
            const badgeHeight = 20;
            let verticalOffset;
    
            if (this.lastPopdownPosition.isAboveCursor) {
                verticalOffset = this.lastPopdownPosition.bottom + 5;
                badge.style.top = `${verticalOffset}px`;
            } else {
                verticalOffset = this.lastPopdownPosition.top - badgeHeight - 5;
                badge.style.top = `${verticalOffset}px`;
            }
            
            badge.style.left = `${this.lastPopdownPosition.left}px`;
        }
    
        requestAnimationFrame(() => {
            paramSpan.focus()
        })
    
        paramSpan.addEventListener('keydown', async (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                badge.style.opacity = '0.5'
                badge.style.pointerEvents = 'none'
                paramSpan.contentEditable = 'false'
                paramSpan.style.userSelect = 'none'
                const spinner = this.createSpinner()
                badge.appendChild(spinner)
                try {
                    const paramValue = paramSpan.textContent.trim()
                    const cmd = badge.dataset.command
                    await this.processCommand(cmd, paramValue, element)
                } finally {
                    badge.remove()
                    element.focus()
                }
            } else if (e.key === 'Escape') {
                e.preventDefault()
                badge.remove()
                element.focus()
            } else if (e.key === 'Backspace' && paramSpan.textContent.trim() === '') {
                e.preventDefault()
                badge.remove()
                element.focus()
            }
        })
    
        badge.addEventListener('mousedown', (e) => {
            e.stopPropagation()
            if (e.target === paramSpan || e.target === badge) {
                paramSpan.focus()
            }
        })
    }

    getCursorPosition(element) {
        if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
            return { position: element.selectionStart }
        }
        if (element.isContentEditable) {
            const selection = window.getSelection()
            if (!selection.rangeCount) {
                return null
            }
            const range = selection.getRangeAt(0)
            const preCaretRange = range.cloneRange()
            preCaretRange.selectNodeContents(element)
            preCaretRange.setEnd(range.endContainer, range.endOffset)
            return { position: preCaretRange.toString().length }
        }
        return null
    }

    getPrecedingWords(element, wordCount = 10) {
        let text = '';
        if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
            const cursorPosition = element.selectionStart;
            text = element.value.substring(0, cursorPosition);
        } else if (element.isContentEditable) {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const preCaretRange = range.cloneRange();
                preCaretRange.selectNodeContents(element);
                preCaretRange.setEnd(range.endContainer, range.endOffset);
                text = preCaretRange.toString();
            }
        }

        const words = text.trim().split(/\s+/);
        return words.slice(-wordCount).join(' ');
    }

    createSpinner() {
        const spinner = document.createElement('span')
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        svg.setAttribute('width', '14')
        svg.setAttribute('height', '14')
        svg.setAttribute('viewBox', '0 0 24 24')
        svg.setAttribute('fill', 'none')
        svg.style.verticalAlign = 'middle'
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        circle.setAttribute('cx', '12')
        circle.setAttribute('cy', '12')
        circle.setAttribute('r', '10')
        circle.setAttribute('stroke', '#999')
        circle.setAttribute('stroke-width', '4')
        circle.setAttribute('stroke-dasharray', '31.4')
        circle.setAttribute('stroke-dashoffset', '0')
        const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animateTransform')
        animate.setAttribute('attributeName', 'transform')
        animate.setAttribute('attributeType', 'XML')
        animate.setAttribute('type', 'rotate')
        animate.setAttribute('from', '0 12 12')
        animate.setAttribute('to', '360 12 12')
        animate.setAttribute('dur', '1s')
        animate.setAttribute('repeatCount', 'indefinite')
        circle.appendChild(animate)
        svg.appendChild(circle)
        spinner.appendChild(svg)
        return spinner
    }

    async processCommand(command, parameter, targetElement) {
        try {
            let context = '';
            if (command === '/search') {
                context = this.getPrecedingWords(targetElement);
            }
    
            const response = await chrome.runtime.sendMessage({
                action: 'sendCommand',
                command: command,
                parameter: parameter,
                context: context
            });
    
            if (!response || response.error) {
                return null;
            }
            if (command === '/synonym' && response.synonyms?.length) {
                return this.createPopdown(response.synonyms, targetElement);
            }
            if (command === '/antonym' && response.antonyms?.length) {
                return this.createPopdown(response.antonyms, targetElement);
            }
            if (command === '/search' && response.final_result?.length) {
                
                return this.createPopdown(response.final_result, targetElement);
            }
            if (command === '/generate' && response.generated_text?.length) {
                
                return this.createPopdown(response.generated_text, targetElement);
            }
            return null;
        } catch {
            return null;
        }
    }

    async createPopdown(items, targetElement) {
        const itemsArray = Array.isArray(items) ? items : [items];
        
        const popdown = document.createElement('div');
        popdown.style.position = 'fixed';
        popdown.style.backgroundColor = '#fff';
        popdown.style.border = '1px solid #e0e0e0';
        popdown.style.borderRadius = '8px';
        popdown.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        popdown.style.padding = '8px';
        popdown.style.zIndex = '9999999';
        popdown.style.display = 'flex';
        popdown.style.flexDirection = 'column';
        popdown.style.gap = '4px';
    
        const badgeRect = this.lastPopdownPosition;
        const viewportHeight = window.innerHeight;
        const verticalOffset = 10;
    
        popdown.style.left = `${badgeRect.left}px`;
        popdown.style.top = `${badgeRect.top + verticalOffset}px`;
    
        let isProcessing = false;
    
        itemsArray.forEach(item => {
            const btn = document.createElement('button');
            btn.textContent = item;
            btn.style.padding = '8px 12px';
            btn.style.border = 'none';
            btn.style.borderRadius = '4px';
            btn.style.backgroundColor = '#f3f4f6';
            btn.style.cursor = 'pointer';
            btn.style.width = '100%';
            btn.style.textAlign = 'left';
            btn.style.color = '#374151';
            btn.style.fontFamily = "'Google Sans', Roboto, Arial, sans-serif";
            btn.style.fontSize = '14px';
    
            btn.addEventListener('mouseover', () => {
                btn.style.backgroundColor = '#e5e7eb';
            });
    
            btn.addEventListener('mouseout', () => {
                btn.style.backgroundColor = '#f3f4f6';
            });

            btn.addEventListener('mousedown', (e) => {
                e.preventDefault();
            });
    
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (isProcessing) return;
                isProcessing = true;
            
                popdown.remove();
                document.removeEventListener('mousedown', handleOutside);
            
                const element = this.lastFocusedElement || document.activeElement;
                if (!element) return;
            
                requestAnimationFrame(() => {
                    try {
                        if (element.isContentEditable) {
                            const sel = window.getSelection();
                            let range = null;
            
                            if (sel.rangeCount) {
                                range = sel.getRangeAt(0);
                            } else if (this.originalRange) {
                                range = this.originalRange.cloneRange();
                                sel.addRange(range);
                            } else {
                                range = document.createRange();
                                range.selectNodeContents(element);
                                range.collapse(false);
                                sel.addRange(range);
                            }
            
                            const textNode = document.createTextNode(item + ' ');
                            range.deleteContents();
                            range.insertNode(textNode);
            
                            const newRange = document.createRange();
                            newRange.setStart(textNode, textNode.length);
                            newRange.collapse(true);
                            sel.removeAllRanges();
                            sel.addRange(newRange);
                            
                            this.originalRange = newRange.cloneRange();
                        } else {
                            const start = element.selectionStart;
                            element.setRangeText(item, start, start, 'end');
                            element.selectionEnd = start + item.length;
                        }
            
                        element.dispatchEvent(new InputEvent('input', { bubbles: true }));
                    } catch (error) {
                        
                    }
            
                    setTimeout(() => {
                        isProcessing = false;
                    }, 50);
                });
            });     
    
            popdown.appendChild(btn);
        });
    
        document.body.appendChild(popdown);
    
        const handleOutside = (e) => {
            if (!popdown.contains(e.target)) {
                popdown.remove();
                document.removeEventListener('mousedown', handleOutside);
            }
        };
        document.addEventListener('mousedown', handleOutside);
    }
}