/* eslint-disable */

export class SlashCommand {
    constructor() {
      this.isActive = false
      this.currentInput = ""
      this.selectedIndex = 0
      this.slashCommands = {
        "/synonym": {
          description: "Get synonyms for a word",
          parameters: [
            {
              name: "word",
              type: "text",
              description: "Word to find synonyms for"
            }
          ]
        },
        "/antonym": {
          description: "Get antonyms for a word",
          parameters: [
            {
              name: "word",
              type: "text",
              description: "Word to find antonyms for"
            }
          ]
        },
        "/search": {
          description: "Get a search for a question",
          parameters: [
            { name: "word", type: "text", description: "Query to search" }
          ]
        }
      }
      this.slashCommandUI = document.createElement("div")
      this.slashCommandUI.style.position = "fixed"
      this.slashCommandUI.style.backgroundColor = "#ffffff"
      this.slashCommandUI.style.border = "1px solid #e0e0e0"
      this.slashCommandUI.style.borderRadius = "8px"
      this.slashCommandUI.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)"
      this.slashCommandUI.style.padding = "8px 0"
      this.slashCommandUI.style.zIndex = "999999"
      this.slashCommandUI.style.display = "none"
      this.slashCommandUI.style.maxHeight = "200px"
      this.slashCommandUI.style.overflowY = "auto"
      this.slashCommandUI.style.minWidth = "200px"
      this.slashCommandUI.style.pointerEvents = "auto"
      this.slashCommandUI.style.fontFamily = "'Google Sans', Roboto, Arial, sans-serif";
      this.slashCommandUI.style.fontSize = "14px";
      this.slashCommandUI.style.minWidth = "240px";
      this.slashCommandUI.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
      
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
          document.body.appendChild(this.slashCommandUI)
        });
      } else {
        document.body.appendChild(this.slashCommandUI)
      }

      this.parameterUI = document.createElement("div")
      this.parameterUI.style.position = "absolute"
      this.parameterUI.style.backgroundColor = "#ffffff"
      this.parameterUI.style.border = "1px solid #e0e0e0"
      this.parameterUI.style.borderRadius = "8px"
      this.parameterUI.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)"
      this.parameterUI.style.padding = "12px"
      this.parameterUI.style.zIndex = "9999999"
      this.parameterUI.style.display = "none"

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
          document.body.appendChild(this.parameterUI)
        });
      } else {
        document.body.appendChild(this.parameterUI)
      }

      document.addEventListener("keydown", event => {
        if (this.isActive) {
          let handled = false;
          const cursor = document.querySelector(".kix-cursor");
          const rect = cursor?.getBoundingClientRect();
  
          switch (event.key) {
            case "ArrowUp":
              this.updateSelectedIndex(-1);
              handled = true;
              break;
            case "ArrowDown":
              this.updateSelectedIndex(1);
              handled = true;
              break;
            case "Enter":
              if (this.slashCommandUI.children.length > 0) {
                const cmd = this.slashCommandUI.children[this.selectedIndex]
                  .querySelector("span:first-child").textContent;
                this.selectCommand(cmd);
                handled = true;
              }
              break;
            case "Backspace":
              if (this.currentInput.length > 1) {
                this.currentInput = this.currentInput.slice(0, -1);
                this.showSlashCommands(rect, this.currentInput);
                handled = true;
              }
              break;
            default:
              if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
                this.currentInput += event.key;
                this.showSlashCommands(rect, this.currentInput);
                handled = true;
              }
          }
  
          if (handled) {
            event.preventDefault();
            event.stopPropagation();
          }
        }
      });
    }

    waitForLoad(element) {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
          document.body.appendChild(element)
        });
      } else {
        document.body.appendChild(element)
      }
    }
  
    updateSelectedIndex(delta) {
      const options = this.slashCommandUI.children
      this.selectedIndex =
        (this.selectedIndex + delta + options.length) % options.length
      Array.from(options).forEach((option, index) => {
        option.style.backgroundColor =
          index === this.selectedIndex ? "#f3f4f6" : "transparent"
      })
    }
  
    selectCommand(command) {
      this.insertCommandBadge(command)
      this.hideSlashCommandUI()
    }
  
    hideSlashCommandUI() {
      this.isActive = false
      this.currentInput = ""
      this.selectedIndex = 0
      this.slashCommandUI.style.display = "none"
      this.parameterUI.style.display = "none"
    }
  
    createSlashCommandOption(cmd, description) {
      const option = document.createElement("div")
      option.style.padding = "8px 16px"
      option.style.cursor = "pointer"
      option.style.display = "flex"
      option.style.alignItems = "center"
      option.style.gap = "8px"
      const commandText = document.createElement("span")
      commandText.style.fontWeight = "600"
      commandText.style.color = "#2196F3"
      commandText.textContent = cmd
      const descText = document.createElement("span")
      descText.style.color = "#666666"
      descText.style.fontSize = "12px"
      descText.textContent = description
      option.appendChild(commandText)
      option.appendChild(descText)
      option.addEventListener("mouseover", () => {
        option.style.backgroundColor = "#f5f5f5"
      })
      option.addEventListener("mouseout", () => {
        option.style.backgroundColor = "transparent"
      })
      option.addEventListener("click", () => this.selectCommand(cmd))
      return option
    }
  
    showSlashCommands(rect, filterText = "") {
      while (this.slashCommandUI.firstChild) {
        this.slashCommandUI.removeChild(this.slashCommandUI.firstChild);
      }

      const filteredCommands = Object.entries(this.slashCommands)
        .filter(([cmd]) => cmd.toLowerCase().startsWith(filterText.toLowerCase()))
        .sort((a, b) => a[0].localeCompare(b[0]));

      filteredCommands.forEach(([cmd, details]) => {
        const option = this.createSlashCommandOption(cmd, details.description);
        this.slashCommandUI.appendChild(option);
      });
  
      // Update UI visibility and position
      if (filteredCommands.length > 0 && rect) {
        this.selectedIndex = 0;
        this.slashCommandUI.style.display = "block";
        this.slashCommandUI.style.left = `${rect.left}px`;
        this.slashCommandUI.style.top = `${rect.bottom + 5}px`;
        Array.from(this.slashCommandUI.children).forEach((option, index) => {
          option.style.backgroundColor = index === this.selectedIndex ? "#f3f4f6" : "transparent";
        });
      } else {
        this.slashCommandUI.style.display = "none";
      }
    }
  
    createSpinner() {
      const spinner = document.createElement("span")
      spinner.className = "inline-spinner"
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
      svg.setAttribute("width", "14")
      svg.setAttribute("height", "14")
      svg.setAttribute("viewBox", "0 0 24 24")
      svg.setAttribute("fill", "none")
      svg.style.verticalAlign = "middle"
      const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      )
      circle.setAttribute("cx", "12")
      circle.setAttribute("cy", "12")
      circle.setAttribute("r", "10")
      circle.setAttribute("stroke", "#999")
      circle.setAttribute("stroke-width", "4")
      circle.setAttribute("stroke-dasharray", "31.4")
      circle.setAttribute("stroke-dashoffset", "0")
      const animate = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "animateTransform"
      )
      animate.setAttribute("attributeName", "transform")
      animate.setAttribute("attributeType", "XML")
      animate.setAttribute("type", "rotate")
      animate.setAttribute("from", "0 12 12")
      animate.setAttribute("to", "360 12 12")
      animate.setAttribute("dur", "1s")
      animate.setAttribute("repeatCount", "indefinite")
      circle.appendChild(animate)
      svg.appendChild(circle)
      spinner.appendChild(svg)
      return spinner
    }
  
    createCheckmark() {
      const checkmark = document.createElement("span")
      checkmark.className = "inline-checkmark"
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
      svg.setAttribute("width", "14")
      svg.setAttribute("height", "14")
      svg.setAttribute("viewBox", "0 0 24 24")
      svg.setAttribute("fill", "none")
      svg.style.verticalAlign = "middle"
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
      path.setAttribute(
        "d",
        "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
      )
      path.setAttribute("fill", "#34A853")
      svg.appendChild(path)
      checkmark.appendChild(svg)
      return checkmark
    }
  
    createCommandBadge(command) {
      const badge = document.createElement("div")
      badge.className = "command-badge-overlay"
      badge.setAttribute("data-command", command)
      const trackerRect = document.createElement("div")
      trackerRect.className = "command-tracker-rect"
      Object.assign(trackerRect.style, {
        position: "absolute",
        left: "0",
        top: "0",
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        opacity: "0",
        zIndex: "-1"
      })
      badge.appendChild(trackerRect)
      const resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          const rect = entry.target.getBoundingClientRect()
        }
      })
      resizeObserver.observe(badge)
      return badge
    }
  
    insertCommandBadge(command) {
      try {
        const cursor = document.querySelector(".kix-cursor")
        if (!cursor) return
        const cursorStyle = window.getComputedStyle(cursor)
        const transform = cursorStyle.transform
        const matrix = new DOMMatrixReadOnly(transform)
        const cursorX = matrix.m41
        const cursorY = matrix.m42
        let lastCaretPosition = 0
        let lastText = ""
        let lastMouseX = null
        let lastMouseY = null
        let isMouseDownOutside = false
        const badge = document.createElement("div")
        badge.className = "command-badge-overlay"
        Object.assign(badge.style, {
          position: "absolute",
          left: `${cursorX}px`,
          top: `${cursorY}px`,
          zIndex: "9999999",
          display: "inline-flex",
          alignItems: "center",
          backgroundColor: "#f1f3f4",
          borderRadius: "3px",
          padding: "0 4px",
          margin: "0 1px",
          height: "20px",
          fontFamily: "'Google Sans', Roboto, Arial, sans-serif",
          fontSize: "14px",
          lineHeight: "20px",
          whiteSpace: "nowrap",
          pointerEvents: "all",
          cursor: "text",
          border: "1px solid transparent",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
        })
        badge.setAttribute("data-command", command)
        const commandPart = document.createElement("span")
        Object.assign(commandPart.style, {
          color: "#188038",
          fontWeight: "500",
          marginRight: "4px",
          userSelect: "none",
          pointerEvents: "none"
        })
        commandPart.textContent = command
        const parameterPart = document.createElement("span")
        Object.assign(parameterPart.style, {
          color: "#444746",
          minWidth: "1px",
          outline: "none",
          whiteSpace: "pre",
          padding: "0 2px",
          position: "relative",
          zIndex: "10000000"
        })
        parameterPart.contentEditable = "true"
        parameterPart.dataset.placeholder = "Parameter"
        const handleParameterFocus = () => {
          requestAnimationFrame(() => {
            const range = document.createRange()
            const sel = window.getSelection()
            if (parameterPart.childNodes.length > 0) {
              const textNode =
                Array.from(parameterPart.childNodes).find(
                  node => node.nodeType === Node.TEXT_NODE
                ) || parameterPart.childNodes[0]
              if (lastMouseX !== null && lastMouseY !== null) {
                const textRect = parameterPart.getBoundingClientRect()
                const clickX = lastMouseX - textRect.left
                const temp = document.createElement("span")
                temp.style.font = window.getComputedStyle(parameterPart).font
                temp.style.visibility = "hidden"
                temp.style.position = "absolute"
                this.waitForLoad(temp)
                let bestPosition = 0
                let bestDistance = Infinity
                for (let i = 0; i <= textNode.textContent.length; i++) {
                  temp.textContent = textNode.textContent.substring(0, i)
                  const width = temp.getBoundingClientRect().width
                  const distance = Math.abs(width - clickX)
                  if (distance < bestDistance) {
                    bestDistance = distance
                    bestPosition = i
                  }
                }
                document.body.removeChild(temp)
                lastCaretPosition = bestPosition
              }
              try {
                range.setStart(
                  textNode,
                  Math.min(lastCaretPosition, textNode.length)
                )
                range.setEnd(
                  textNode,
                  Math.min(lastCaretPosition, textNode.length)
                )
              } catch (e) {
                range.selectNodeContents(parameterPart)
                range.collapse(false)
              }
            } else {
              range.selectNodeContents(parameterPart)
              range.collapse(false)
            }
            sel.removeAllRanges()
            sel.addRange(range)
          })
        }
        parameterPart.addEventListener("input", () => {
          lastText = parameterPart.textContent
          const selection = window.getSelection()
          if (selection.rangeCount > 0) {
            lastCaretPosition = selection.getRangeAt(0).startOffset
          }
        })
        parameterPart.addEventListener("focus", () => {
          if (!isMouseDownOutside) {
            badge.style.borderColor = "#2563eb"
            badge.style.boxShadow = "0 0 0 2px rgba(37, 99, 235, 0.2)"
            handleParameterFocus()
          }
        })
        parameterPart.addEventListener("blur", e => {
          if (!isMouseDownOutside) {
            e.preventDefault()
            requestAnimationFrame(() => {
              parameterPart.focus()
            })
          } else {
            const selection = window.getSelection()
            if (selection.rangeCount > 0) {
              lastCaretPosition = selection.getRangeAt(0).startOffset
            }
            badge.style.borderColor = "transparent"
            badge.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)"
          }
        })
        parameterPart.addEventListener("keydown", async e => {
          if (e.key === "Escape") {
            e.preventDefault();
            badge.remove();
            const contentDiv = document.querySelector('.docs-texteventtarget-iframe')
                ?.contentDocument?.querySelector('div[aria-label="Document content"]');
            if (contentDiv) {
                contentDiv.focus();
            }
            return;
          }
          
          if (e.key === "Backspace" && parameterPart.textContent.trim() === "") {
              e.preventDefault();
              badge.remove();
              const contentDiv = document.querySelector('.docs-texteventtarget-iframe')
                  ?.contentDocument?.querySelector('div[aria-label="Document content"]');
              if (contentDiv) {
                  contentDiv.focus();
              }
              return;
          }
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            const parameter = parameterPart.textContent.trim()
            const badgeRect = badge.getBoundingClientRect()
            const computedStyle = window.getComputedStyle(badge)
            const totalBadgeWidth =
              badgeRect.width +
              parseFloat(computedStyle.paddingLeft) +
              parseFloat(computedStyle.paddingRight) +
              parseFloat(computedStyle.borderLeftWidth) +
              parseFloat(computedStyle.borderRightWidth)
            const cursorCaret = document.querySelector(".kix-cursor-caret")
            const cursorHeight = parseFloat(
              window.getComputedStyle(cursorCaret).height
            )
            const fontSize = Math.floor(
              29.98 * Math.sqrt(0.0586 * cursorHeight + 1) - 31.19
            )
            const blankCharWidth = 22.26 * Math.exp(0.03 * fontSize) - 21.45
            const numBlankChars = Math.ceil(totalBadgeWidth / blankCharWidth) + 1 // maybe + 1 not needed - we will see
            const brailleChars = "⠀".repeat(numBlankChars)
            badge.style.opacity = "0.5"
            badge.style.pointerEvents = "none"
            parameterPart.contentEditable = "false"
            parameterPart.style.userSelect = "none"
            const spinner = this.createSpinner()
            badge.appendChild(spinner)
            await new Promise(resolve => requestAnimationFrame(resolve))
            const oldCursorPosition = {
              x: badgeRect.right,
              y: badgeRect.top
            }
            const finalPosition = { ...oldCursorPosition }
            const textEventIframe = document.querySelector(
              ".docs-texteventtarget-iframe"
            )
            const contentDiv = textEventIframe.contentDocument.querySelector(
              'div[aria-label="Document content"]'
            )
            const oldFocusHandler = parameterPart.onfocus
            const oldBlurHandler = parameterPart.onblur
            parameterPart.onfocus = null
            parameterPart.onblur = null
            contentDiv.focus()
            parameterPart.addEventListener(
              "focus",
              e => {
                e.preventDefault()
                contentDiv.focus()
              },
              { once: true }
            )
            try {
              const brailleData = new DataTransfer()
              brailleData.setData("text/plain", brailleChars)
              contentDiv.dispatchEvent(
                new KeyboardEvent("keydown", {
                  key: " ",
                  code: "Space",
                  keyCode: 32,
                  which: 32,
                  bubbles: true,
                  cancelable: true
                })
              )
              contentDiv.dispatchEvent(
                new KeyboardEvent("keypress", {
                  key: " ",
                  code: "Space",
                  keyCode: 32,
                  which: 32,
                  bubbles: true,
                  cancelable: true,
                  charCode: 32
                })
              )
              contentDiv.dispatchEvent(
                new InputEvent("beforeinput", {
                  inputType: "insertText",
                  data: " ",
                  bubbles: true,
                  cancelable: true
                })
              )
              contentDiv.dispatchEvent(
                new KeyboardEvent("keyup", {
                  key: " ",
                  code: "Space",
                  keyCode: 32,
                  which: 32,
                  bubbles: true,
                  cancelable: true
                })
              )
              contentDiv.dispatchEvent(
                new ClipboardEvent("paste", {
                  bubbles: true,
                  cancelable: true,
                  clipboardData: brailleData
                })
              )
              const result = await this.processCommand(command, parameter)
              badge.remove()
              requestAnimationFrame(async () => {
                const tileManager = document.querySelector(
                  ".kix-rotatingtilemanager-content"
                )
                tileManager.dispatchEvent(
                  new MouseEvent("mousedown", {
                    bubbles: true,
                    cancelable: true,
                    clientX: finalPosition.x,
                    clientY: finalPosition.y
                  })
                )
                tileManager.dispatchEvent(
                  new MouseEvent("mouseup", {
                    bubbles: true,
                    cancelable: true,
                    clientX: finalPosition.x,
                    clientY: finalPosition.y
                  })
                )
                contentDiv.dispatchEvent(
                  new KeyboardEvent("keydown", {
                    key: "ArrowRight",
                    code: "ArrowRight",
                    keyCode: 39,
                    which: 39,
                    shiftKey: true,
                    bubbles: true,
                    cancelable: true
                  })
                )
                contentDiv.dispatchEvent(
                  new KeyboardEvent("keyup", {
                    key: "ArrowRight",
                    code: "ArrowRight",
                    keyCode: 39,
                    which: 39,
                    shiftKey: true,
                    bubbles: true,
                    cancelable: true
                  })
                )
                const clipboardData = new DataTransfer()
                contentDiv.dispatchEvent(
                  new ClipboardEvent("copy", {
                    bubbles: true,
                    cancelable: true,
                    clipboardData
                  })
                )
                const selectedText = clipboardData.getData("text/plain")
                if (selectedText === "⠀") {
                  contentDiv.dispatchEvent(
                    new KeyboardEvent("keydown", {
                      key: "Backspace",
                      code: "Backspace",
                      keyCode: 8,
                      which: 8,
                      bubbles: true,
                      cancelable: true
                    })
                  )
                  contentDiv.dispatchEvent(
                    new KeyboardEvent("keyup", {
                      key: "Backspace",
                      code: "Backspace",
                      keyCode: 8,
                      which: 8,
                      bubbles: true,
                      cancelable: true
                    })
                  )
                }
                contentDiv.dispatchEvent(
                  new KeyboardEvent("keydown", {
                    key: "ArrowLeft",
                    code: "ArrowLeft",
                    keyCode: 37,
                    which: 37,
                    ctrlKey: true,
                    shiftKey: true,
                    bubbles: true,
                    cancelable: true
                  })
                )
                contentDiv.dispatchEvent(
                  new KeyboardEvent("keyup", {
                    key: "ArrowLeft",
                    code: "ArrowLeft",
                    keyCode: 37,
                    which: 37,
                    ctrlKey: true,
                    shiftKey: true,
                    bubbles: true,
                    cancelable: true
                  })
                )
                contentDiv.dispatchEvent(
                  new KeyboardEvent("keydown", {
                    key: "ArrowLeft",
                    code: "ArrowLeft",
                    keyCode: 37,
                    which: 37,
                    shiftKey: true,
                    bubbles: true,
                    cancelable: true
                  })
                )
                contentDiv.dispatchEvent(
                  new KeyboardEvent("keyup", {
                    key: "ArrowLeft",
                    code: "ArrowLeft",
                    keyCode: 37,
                    which: 37,
                    shiftKey: true,
                    bubbles: true,
                    cancelable: true
                  })
                )
                if (result) {
                  const pasteData = new DataTransfer()
                  pasteData.setData("text/plain", result)
                  const pasteTracker = new Promise(resolve => {
                    let attempts = 0
                    const maxAttempts = 10
                    function findPastedRects() {
                      const foundRects = []
                      const svgElements = document.querySelectorAll(
                        "div.kix-canvas-tile-content > svg"
                      )
                      svgElements.forEach(svg => {
                        const rects = svg.querySelectorAll(
                          "g[role='paragraph'] rect, g[data-section-type='body'] rect"
                        )
                        rects.forEach(rect => {
                          const text = rect.getAttribute("aria-label")
                          if (
                            text &&
                            (text === result || text.includes(result))
                          ) {
                            const rx = parseFloat(rect.getAttribute("x"))
                            const ry = parseFloat(rect.getAttribute("y"))
                            const rh = parseFloat(rect.getAttribute("height"))
                            const tr = rect.getAttribute("transform")
                            let tx = 0
                            let ty = 0
                            if (tr) {
                              const m = tr.match(
                                /matrix\(.*?,.*?,.*?,.*?,(.*?),(.*?)\)/
                              )
                              if (m) {
                                tx = parseFloat(m[1]) || 0
                                ty = parseFloat(m[2]) || 0
                              }
                            }
                            const startX = rx + tx
                            const startY = ry + ty
                            const canvas = document.createElement("canvas")
                            const ctx = canvas.getContext("2d")
                            const f =
                              window.getComputedStyle(rect).font || "14px Arial"
                            ctx.font = f
                            const textBeforeTarget = text.substring(
                              0,
                              text.indexOf(result)
                            )
                            const widthBeforeTarget = ctx.measureText(
                              textBeforeTarget
                            ).width
                            const targetWidth = ctx.measureText(result).width
                            const x1 = startX + widthBeforeTarget
                            const x2 = x1 + targetWidth
                            const y1 = startY + rh - 2
                            foundRects.push({
                              rect,
                              svg,
                              text,
                              positions: {
                                x1,
                                x2,
                                y1,
                                startY,
                                height: rh
                              }
                            })
                          }
                        })
                      })
                      return foundRects
                    }
                    function attemptFind() {
                      attempts++
                      const foundRects = findPastedRects()
                      if (foundRects.length > 0) {
                        resolve(foundRects)
                        return
                      }
                      if (attempts < maxAttempts) {
                        setTimeout(
                          attemptFind,
                          Math.min(100 * Math.pow(2, attempts), 1000)
                        )
                      } else {
                        resolve(null)
                      }
                    }
                    contentDiv.dispatchEvent(
                      new ClipboardEvent("paste", {
                        bubbles: true,
                        cancelable: true,
                        clipboardData: pasteData
                      })
                    )
                    setTimeout(attemptFind, 50)
                  })
                  pasteTracker.then(matchingRects => {
                    if (matchingRects && matchingRects.length > 0) {
                      const svgElement = matchingRects[0].svg
                      const highlightGroup = svgElement.querySelector(
                        'g[data-enhanced-text-tracker="underline-group"]'
                      )
                      const pulseGroup = document.createElementNS(
                        "http://www.w3.org/2000/svg",
                        "g"
                      )
                      pulseGroup.setAttribute(
                        "data-enhanced-text-tracker",
                        "pulse-group"
                      )
                      matchingRects.forEach(({ positions }) => {
                        const pulseRect = document.createElementNS(
                          "http://www.w3.org/2000/svg",
                          "rect"
                        )
                        pulseRect.setAttribute("x", positions.x1.toString())
                        pulseRect.setAttribute("y", positions.startY.toString())
                        pulseRect.setAttribute(
                          "width",
                          (positions.x2 - positions.x1).toString()
                        )
                        pulseRect.setAttribute(
                          "height",
                          positions.height.toString()
                        )
                        pulseRect.setAttribute("class", "pulse-animation")
                        pulseRect.style.pointerEvents = "none"
                        pulseGroup.appendChild(pulseRect)
                      })
                      if (!document.getElementById("pulse-animation-style")) {
                        const style = document.createElement("style")
                        style.id = "pulse-animation-style"
                        style.textContent = `
                          @keyframes textPulse {
                            0% { fill: rgba(33, 150, 243, 0.4); }
                            100% { fill: rgba(33, 150, 243, 0); }
                          }
                          .pulse-animation {
                            animation: textPulse 1s ease-out;
                            pointer-events: none;
                          }
                        `
                        document.head.appendChild(style)
                      }
                      svgElement.insertBefore(pulseGroup, highlightGroup)
                      setTimeout(() => {
                        pulseGroup.remove()
                      }, 1000)
                    }
                  })
                }
                contentDiv.focus()
              })
            } catch (error) {
              badge.remove()
              requestAnimationFrame(async () => {
                contentDiv.focus()
              })
            }
          }
        })
        badge.addEventListener("mousedown", e => {
          e.stopPropagation()
          lastMouseX = e.clientX
          lastMouseY = e.clientY
          if (e.target === parameterPart || e.target === badge) {
            parameterPart.focus()
          }
        })
        badge.addEventListener("mouseleave", () => {
          lastMouseX = null
          lastMouseY = null
        })
        document.addEventListener("mousedown", e => {
          if (!badge.contains(e.target)) {
            isMouseDownOutside = true
          }
        })
        document.addEventListener("mouseup", e => {
          if (isMouseDownOutside && !badge.contains(e.target)) {
            parameterPart.blur()
          }
          isMouseDownOutside = false
        })
        const placeholderStyle = document.createElement("style")
        placeholderStyle.textContent = `
          [data-placeholder]:empty:before {
            content: attr(data-placeholder);
            color: #5f6368;
            font-style: italic;
            pointer-events: none;
          }
        `
        document.head.appendChild(placeholderStyle)
        badge.appendChild(commandPart)
        badge.appendChild(parameterPart)
        const editorContainer = document.querySelector(".kix-appview-editor")
        if (!editorContainer) return
        let overlayContainer = document.querySelector(
          ".command-overlay-container"
        )
        if (!overlayContainer) {
          overlayContainer = document.createElement("div")
          overlayContainer.className = "command-overlay-container"
          Object.assign(overlayContainer.style, {
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            bottom: "0",
            zIndex: "9999997",
            pointerEvents: "none"
          })
          editorContainer.appendChild(overlayContainer)
        }
        overlayContainer.appendChild(badge)
        requestAnimationFrame(() => {
          parameterPart.focus()
        })
        document.execCommand("delete", false)
      } catch (error) {}
    }
  
    async processCommand(command, parameter) {
      try {
        const cursor = document.querySelector(".kix-cursor")
        if (!cursor) return null
        if (command === "/synonym") {
          try {
            const response = await fetch(
              `https://backend.factful.io/get-syn?word=${encodeURIComponent(
                parameter
              )}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json"
                }
              }
            )
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`)
            }
            const data = await response.json()
            if (data.synonyms && data.synonyms.length > 0) {
              const badge = document.querySelector(".command-badge-overlay")
              const popdown = document.createElement("div")
              Object.assign(popdown.style, {
                position: "absolute",
                left: `${badge.getBoundingClientRect().right}px`,
                top: `${badge.getBoundingClientRect().bottom + 5}px`,
                backgroundColor: "#ffffff",
                borderRadius: "8px",
                boxShadow:
                  "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
                padding: "8px",
                zIndex: "1000000",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                border: "1px solid #e0e0e0"
              })
              return new Promise(resolve => {
                data.synonyms.forEach(synonym => {
                  const button = document.createElement("button")
                  Object.assign(button.style, {
                    padding: "8px 12px",
                    border: "none",
                    borderRadius: "4px",
                    backgroundColor: "#f3f4f6",
                    cursor: "pointer",
                    textAlign: "left",
                    width: "100%",
                    color: "#374151",
                    fontFamily: "'Google Sans', Roboto, Arial, sans-serif",
                    fontSize: "14px",
                    transition: "background-color 0.2s"
                  })
                  button.textContent = synonym
                  button.addEventListener("mouseover", () => {
                    button.style.backgroundColor = "#e5e7eb"
                  })
                  button.addEventListener("mouseout", () => {
                    button.style.backgroundColor = "#f3f4f6"
                  })
                  button.addEventListener("click", () => {
                    popdown.remove()
                    resolve(synonym)
                  })
                  popdown.appendChild(button)
                })
                this.waitForLoad(popdown)
                const handleClickOutside = e => {
                  if (!popdown.contains(e.target)) {
                    popdown.remove()
                    document.removeEventListener("mousedown", handleClickOutside)
                    resolve(null)
                  }
                }
                document.addEventListener("mousedown", handleClickOutside)
              })
            }
          } catch (error) {
            return null
          }
        } else if (command === "/antonym") {
          try {
            const response = await fetch(
              `https://backend.factful.io/get-ant?word=${encodeURIComponent(
                parameter
              )}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json"
                }
              }
            )
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`)
            }
            const data = await response.json()
            if (data.antonyms && data.antonyms.length > 0) {
              const badge = document.querySelector(".command-badge-overlay")
              const popdown = document.createElement("div")
              Object.assign(popdown.style, {
                position: "absolute",
                left: `${badge.getBoundingClientRect().right}px`,
                top: `${badge.getBoundingClientRect().bottom + 5}px`,
                backgroundColor: "#ffffff",
                borderRadius: "8px",
                boxShadow:
                  "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
                padding: "8px",
                zIndex: "1000000",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                border: "1px solid #e0e0e0"
              })
              return new Promise(resolve => {
                data.antonyms.forEach(antonym => {
                  const button = document.createElement("button")
                  Object.assign(button.style, {
                    padding: "8px 12px",
                    border: "none",
                    borderRadius: "4px",
                    backgroundColor: "#f3f4f6",
                    cursor: "pointer",
                    textAlign: "left",
                    width: "100%",
                    color: "#374151",
                    fontFamily: "'Google Sans', Roboto, Arial, sans-serif",
                    fontSize: "14px",
                    transition: "background-color 0.2s"
                  })
                  button.textContent = antonym
                  button.addEventListener("mouseover", () => {
                    button.style.backgroundColor = "#e5e7eb"
                  })
                  button.addEventListener("mouseout", () => {
                    button.style.backgroundColor = "#f3f4f6"
                  })
                  button.addEventListener("click", () => {
                    popdown.remove()
                    resolve(antonym)
                  })
                  popdown.appendChild(button)
                })
                this.waitForLoad(popdown)
                const handleClickOutside = e => {
                  if (!popdown.contains(e.target)) {
                    popdown.remove()
                    document.removeEventListener("mousedown", handleClickOutside)
                    resolve(null)
                  }
                }
                document.addEventListener("mousedown", handleClickOutside)
              })
            }
          } catch (error) {
            return null
          }
        } else if (command === "/search") {
          console.log('search fired');
          try {
            let response;
            window.postMessage({ 
                action: 'smartSearch',
                command: '/search',
                parameter: parameter,
                context: context
            }, '*');

            const responsePromise = new Promise((resolve) => {
                function handleMessage(event) {
                    if (event.data.action === 'searchResponse') {
                        window.removeEventListener('message', handleMessage);
                        resolve(event.data.result);
                    }
                }
                window.addEventListener('message', handleMessage);
            });
            console.log('response promise: ', responsePromise);
            response = await responsePromise;

            console.log('response from search: ', response);
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`)
            }
            const data = await response.json()
            if (data.output) {
              const badge = document.querySelector(".command-badge-overlay")
              const popdown = document.createElement("div")
              Object.assign(popdown.style, {
                position: "absolute",
                left: `${badge.getBoundingClientRect().right}px`,
                top: `${badge.getBoundingClientRect().bottom + 5}px`,
                backgroundColor: "#ffffff",
                borderRadius: "8px",
                boxShadow:
                  "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
                padding: "8px",
                zIndex: "1000000",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                border: "1px solid #e0e0e0",
                maxWidth: "400px"
              })
              return new Promise(resolve => {
                const button = document.createElement("button")
                Object.assign(button.style, {
                  padding: "8px 12px",
                  border: "none",
                  borderRadius: "4px",
                  backgroundColor: "#f3f4f6",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                  color: "#374151",
                  fontFamily: "'Google Sans', Roboto, Arial, sans-serif",
                  fontSize: "14px",
                  transition: "background-color 0.2s",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  lineHeight: "1.5"
                })
                button.textContent = data.output
                button.addEventListener("mouseover", () => {
                  button.style.backgroundColor = "#e5e7eb"
                })
                button.addEventListener("mouseout", () => {
                  button.style.backgroundColor = "#f3f4f6"
                })
                button.addEventListener("click", () => {
                  popdown.remove()
                  resolve(data.output)
                })
                popdown.appendChild(button)
                this.waitForLoad(popdown)
                const handleClickOutside = e => {
                  if (!popdown.contains(e.target)) {
                    popdown.remove()
                    document.removeEventListener("mousedown", handleClickOutside)
                    resolve(null)
                  }
                }
                document.addEventListener("mousedown", handleClickOutside)
              })
            }
          } catch (error) {
            console.log('error searching: ', error);
            return null
          }
        }
        return null
      } catch (error) {
        console.log('error: ', error);
        return null
      }
    }
  }
  