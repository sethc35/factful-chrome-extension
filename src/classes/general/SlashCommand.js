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
            '/generate': {
                description: 'Generate anything',
                parameters: [
                    { name: 'word', type: 'text' }
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
        const style = document.createElement('style')
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
            .command-badge-overlay {
                position: absolute;
                z-index: 2147483647;
                pointer-events: auto;
                display: inline-flex;
                align-items: center;
                gap: 4px;
                background-color: #f1f3f4;
                border-radius: 3px;
                padding: 0 4px;
                margin: 0 1px;
                height: 20px;
                font-family: 'Google Sans', Roboto, Arial, sans-serif;
                font-size: 14px;
                line-height: 20px;
                white-space: nowrap;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            [data-placeholder]:empty:before {
                content: attr(data-placeholder);
                color: #5f6368;
                font-style: italic;
                pointer-events: none;
            }
        `
        document.head.appendChild(style)
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
        document.addEventListener('keydown', (event) => {
            if (event.altKey && event.key === '/') {
                if (!this.lastFocusedElement) return
                const cursorRect = this.getCursorRect(
                    this.lastFocusedElement,
                    this.getCaretPosition(this.lastFocusedElement)
                )
                if (cursorRect) {
                    this.isActive = true
                    this.showSlashCommands(cursorRect)
                }
                event.preventDefault()
            }
            if (this.isActive) {
                if (event.key === 'ArrowUp') {
                    this.updateSelectedIndex(-1)
                    event.preventDefault()
                } else if (event.key === 'ArrowDown') {
                    this.updateSelectedIndex(1)
                    event.preventDefault()
                } else if (event.key === 'Enter') {
                    const selectedOption = this.slashCommandUI.children[this.selectedIndex]
                    if (selectedOption) {
                        const command = selectedOption.querySelector('span').textContent
                        this.selectCommand(command)
                    }
                    event.preventDefault()
                } else if (event.key === 'Escape') {
                    this.hideSlashCommandUI()
                    event.preventDefault()
                }
            }
        })
    }

    showSlashCommands(cursorRect, filterText = '') {
        if (!cursorRect) return
        while (this.slashCommandUI.firstChild) {
            this.slashCommandUI.removeChild(this.slashCommandUI.firstChild)
        }
        const filteredCommands = Object.entries(this.slashCommands).filter(([cmd]) =>
            cmd.toLowerCase().includes(filterText.toLowerCase())
        )

        filteredCommands.forEach(([cmd, details]) => {
            const option = this.createSlashCommandOption(cmd, details.description)
            this.slashCommandUI.appendChild(option)
        })
        if (filteredCommands.length > 0) {
            const viewportWidth = window.innerWidth
            const viewportHeight = window.innerHeight
            const uiRect = this.slashCommandUI.getBoundingClientRect()
            let left = cursorRect.left
            let top = cursorRect.bottom + 5
            if (left + uiRect.width > viewportWidth) {
                left = viewportWidth - uiRect.width - 10
            }
            if (top + uiRect.height > viewportHeight) {
                top = cursorRect.top - uiRect.height - 5
            }
            this.slashCommandUI.style.left = Math.max(10, left) + 'px'
            this.slashCommandUI.style.top = Math.max(10, top) + 'px'
            this.slashCommandUI.style.display = 'block'
            this.isActive = true
        } else {
            this.slashCommandUI.style.display = 'none'
        }
        this.selectedIndex = 0
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

    selectCommand(command) {
        const popdownRect = this.slashCommandUI.getBoundingClientRect();
        this.lastPopdownPosition = {
            left: popdownRect.left,
            top: popdownRect.top,
            width: popdownRect.width
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
    
        this.insertCommandBadge(command);
        this.hideSlashCommandUI();
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
        badge.style.backgroundColor = '#f1f3f4'
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
        commandPart.style.color = '#188038'
        commandPart.style.fontWeight = '500'
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
            const verticalOffset = -badgeHeight - 2;
            
            badge.style.left = `${this.lastPopdownPosition.left}px`;
            badge.style.top = `${this.lastPopdownPosition.top + verticalOffset}px`;
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
            const response = await chrome.runtime.sendMessage({
                action: 'sendCommand',
                command: command,
                parameter: parameter
            })
            if (!response || response.error) {
                return null
            }
            if (command === '/synonym' && response.synonyms?.length) {
                return this.createPopdown(response.synonyms, targetElement)
            }
            if (command === '/antonym' && response.antonyms?.length) {
                return this.createPopdown(response.antonyms, targetElement)
            }
            if (command === '/search' && response.search_results?.length) {
                return this.createPopdown(response.search_results, targetElement)
            }
            return null
        } catch {
            return null
        }
    }

    async createPopdown(items, targetElement) {
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
    
        items.forEach(item => {
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
                        console.error('Insertion error:', error);
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