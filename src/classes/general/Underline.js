/* eslint-disable */

export class Underline {
  constructor(tooltip) {
    this.tooltip = tooltip;
    this.overlay = null;
    this.underlines = new Map();
    this.activeElement = null;
    this.hoveredUnderline = null;
    this.isProcessing = false;
    this.previousCorrections = new Set();
    this.apiData = null;
    this.setupOverlay();
    this.setupStyles();
    this.bindTooltipClick();
  }

  bindTooltipClick() {
    if (this.tooltip) {
      this.tooltip.onTooltipClick = correctionId => {
        this.applyCorrection(correctionId);
      };
    }
  }

  setupOverlay() {
    this.overlay = document.createElement("div");
    this.overlay.className = "precise-underline-overlay";
    this.overlay.style.position = "fixed";
    this.overlay.style.top = "0";
    this.overlay.style.left = "0";
    this.overlay.style.right = "0";
    this.overlay.style.bottom = "0";
    this.overlay.style.pointerEvents = "none";
    this.overlay.style.zIndex = "2147483646";
    document.body.appendChild(this.overlay);
  }

  setupStyles() {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes underlineDraw {
        from { transform: scaleX(0); transform-origin: left; }
        to { transform: scaleX(1); transform-origin: left; }
      }
      .precise-underline-overlay {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        pointer-events: none; z-index: 2147483646;
      }
      .precise-underline {
        position: absolute; height: 2px; background-color: rgba(255, 0, 0, 0.6);
        pointer-events: none; cursor: text; transition: all 0.2s ease-out;
        transform-origin: left; will-change: transform, background-color, height; z-index: 1;
      }
      .precise-underline::after {
        content: ''; position: absolute; top: -4px; left: 0; right: 0; bottom: -4px;
        background: transparent; pointer-events: none; z-index: 2;
      }
      .precise-underline.hovered {
        background-color: #B01030; height: 3px;
      }
      .precise-underline.animate {
        animation: underlineDraw 2s ease-out forwards;
        animation-iteration-count: 1; animation-fill-mode: forwards;
      }
      .word-highlight {
        position: absolute; pointer-events: none; transition: all 0.2s ease-out;
        transform: translateZ(0); will-change: transform, opacity; opacity: 0; z-index: -1;
        background-color: rgba(255, 99, 71, 0.1);
      }
      .precise-underline.hovered ~ .word-highlight {
        opacity: 0.7; background-color: rgba(255, 99, 71, 0.7);
      }
    `;
    document.head.appendChild(style);
  }

  debounce(func, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func.apply(this, args);
      }, wait);
    };
  }

  findTextDifferences(oldText, newText) {
    let start = 0;
    let end = 0;
    while (start < oldText.length && start < newText.length && oldText[start] === newText[start]) {
      start++;
    }
    while (
      end < oldText.length - start &&
      end < newText.length - start &&
      oldText[oldText.length - 1 - end] === newText[newText.length - 1 - end]
    ) {
      end++;
    }
    return {
      oldStart: start,
      oldEnd: oldText.length - end,
      newStart: start,
      newEnd: newText.length - end,
      oldDiff: oldText.slice(start, oldText.length - end),
      newDiff: newText.slice(start, newText.length - end)
    };
  }

  saveSelection(element) {
    if (element instanceof HTMLTextAreaElement) {
      return {
        start: element.selectionStart,
        end: element.selectionEnd
      };
    } else if (element.isContentEditable) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        return selection.getRangeAt(0).cloneRange();
      }
    }
    return null;
  }

  findTextPosition(element, searchText) {
    const text = element.value || element.textContent || "";
    const index = text.indexOf(searchText);
    if (index === -1) {
      const lowerText = text.toLowerCase();
      const lowerSearchText = searchText.toLowerCase();
      return lowerText.indexOf(lowerSearchText);
    }
    return index;
  }

  replaceText(element, originalText, newText) {
    if (element instanceof HTMLTextAreaElement) {
      const startIndex = this.findTextPosition(element, originalText);
      if (startIndex !== -1) {
        const currentValue = element.value;
        element.value =
          currentValue.substring(0, startIndex) +
          newText +
          currentValue.substring(startIndex + originalText.length);
        element.dispatchEvent(new Event("input", { bubbles: true }));
      }
    } else if (element.isContentEditable) {
      const selection = window.getSelection();
      const range = document.createRange();
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      let node;
      let startNode = null;
      let startOffset = 0;
      let currentPosition = 0;
      while ((node = walker.nextNode())) {
        const nodeText = node.textContent;
        const index = nodeText.indexOf(originalText);
        if (index !== -1) {
          startNode = node;
          startOffset = index;
          break;
        }
        currentPosition += nodeText.length;
      }
      if (startNode) {
        range.setStart(startNode, startOffset);
        range.setEnd(startNode, startOffset + originalText.length);
        range.deleteContents();
        range.insertNode(document.createTextNode(newText));
        element.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }
  }

  applyCorrection(correctionId) {
    if (!this.activeElement || !correctionId) return;
    const correctionGroup = this.underlines.get(this.activeElement)?.find(
      group => group.correctionId === correctionId
    );
    if (!correctionGroup) return;
    try {
      const differences = this.findTextDifferences(
        correctionGroup.originalText,
        correctionGroup.correctedText
      );
      const startIndex = this.findTextPosition(this.activeElement, correctionGroup.originalText);
      if (startIndex !== -1) {
        const diffStartIndex = startIndex + differences.oldStart;
        const diffEndIndex = startIndex + differences.oldEnd;
        const hadFocus = document.activeElement === this.activeElement;
        const savedSelection = hadFocus ? this.saveSelection(this.activeElement) : null;
        if (this.activeElement instanceof HTMLTextAreaElement) {
          const currentText = this.activeElement.value;
          const beforeText = currentText.substring(0, diffStartIndex);
          const afterText = currentText.substring(diffEndIndex);
          const inputEvent = new InputEvent("input", {
            bubbles: true,
            cancelable: true,
            inputType: "insertText",
            data: differences.newDiff
          });
          this.activeElement.value = beforeText + differences.newDiff + afterText;
          this.activeElement.dispatchEvent(inputEvent);
          if (hadFocus) {
            this.activeElement.focus();
            this.activeElement.setSelectionRange(
              diffStartIndex + differences.newDiff.length,
              diffStartIndex + differences.newDiff.length
            );
          }
        } else if (this.activeElement.isContentEditable) {
          const selection = window.getSelection();
          const range = document.createRange();
          const walker = document.createTreeWalker(
            this.activeElement,
            NodeFilter.SHOW_TEXT,
            null,
            false
          );
          let currentNode = walker.nextNode();
          let currentPosition = 0;
          while (currentNode) {
            const nodeLength = currentNode.length;
            if (currentPosition + nodeLength >= diffStartIndex) {
              const localStart = diffStartIndex - currentPosition;
              const localEnd = Math.min(diffEndIndex - currentPosition, nodeLength);
              range.setStart(currentNode, localStart);
              range.setEnd(currentNode, localEnd);
              const inputEvent = new InputEvent("input", {
                bubbles: true,
                cancelable: true,
                inputType: "insertText",
                data: differences.newDiff
              });
              range.deleteContents();
              const textNode = document.createTextNode(differences.newDiff);
              range.insertNode(textNode);
              this.activeElement.dispatchEvent(inputEvent);
              if (hadFocus) {
                const newRange = document.createRange();
                newRange.setStartAfter(textNode);
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
              }
              break;
            }
            currentPosition += nodeLength;
            currentNode = walker.nextNode();
          }
        }
        correctionGroup.underlines.forEach(underline => {
          if (underline && underline.parentNode) {
            underline.style.transform = "scaleX(0)";
            underline.style.transformOrigin = "right";
            underline.style.transition = "transform 0.3s ease-in";
            setTimeout(() => {
              if (underline.parentNode) {
                underline.remove();
              }
            }, 300);
          }
        });
        correctionGroup.highlights.forEach(highlight => {
          if (highlight && highlight.parentNode) {
            highlight.style.opacity = "0";
            setTimeout(() => {
              if (highlight.parentNode) {
                highlight.remove();
              }
            }, 300);
          }
        });
        const existingGroups = this.underlines.get(this.activeElement);
        if (existingGroups) {
          const updatedGroups = existingGroups.filter(
            group => group.correctionId !== correctionId
          );
          if (updatedGroups.length > 0) {
            this.underlines.set(this.activeElement, updatedGroups);
          } else {
            this.underlines.delete(this.activeElement);
          }
        }
        this.tooltip.hideTooltip();
        this.removeHoverEffect(this.hoveredUnderline);
        this.hoveredUnderline = null;
      }
    } catch (error) {
    }
  }

  buildRectCharIndexMapping() {
  }

  applyUnderlines(corrections, animate = false) {
    if (!this.activeElement) return;
    const currentCorrections = new Set(
      corrections.map(c => `${c.original_text}-${c.error_type}`)
    );
    const existingUnderlines = this.underlines.get(this.activeElement) || [];
    const existingCorrections = new Set(
      existingUnderlines.map(g => `${g.originalText}-${g.errorType}`)
    );
    if (existingUnderlines.length > 0) {
      existingUnderlines.forEach(group => {
        const correctionKey = `${group.originalText}-${group.errorType}`;
        if (!currentCorrections.has(correctionKey)) {
          group.underlines.forEach(underline => {
            if (underline && underline.parentNode) {
              underline.style.transform = "scaleX(0)";
              underline.style.transformOrigin = "right";
              underline.style.transition = "transform 0.3s ease-in";
              setTimeout(() => {
                if (underline.parentNode) {
                  underline.remove();
                }
              }, 300);
            }
          });
          group.highlights.forEach(highlight => {
            if (highlight && highlight.parentNode) {
              highlight.style.opacity = "0";
              setTimeout(() => {
                if (highlight.parentNode) {
                  highlight.remove();
                }
              }, 300);
            }
          });
        }
      });
    }
    corrections.forEach(correction => {
      const correctionKey = `${correction.original_text}-${correction.error_type}`;
      if (!existingCorrections.has(correctionKey)) {
        this.underlineCorrection(this.activeElement, correction, animate);
      }
    });
    this.previousCorrections = currentCorrections;
  }

  underlineCorrection(element, correction, animate) {
    const { original_text, corrected_text, error_type, citations } = correction;
    const startIndex = this.findTextPosition(element, original_text);
    if (startIndex === -1) return;
    const diff = this.findTextDifferences(original_text, corrected_text);
    requestAnimationFrame(() => {
      const range = document.createRange();
      let correctionId = `correction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const underlineGroup = {
        underlines: [],
        highlights: [],
        originalText: original_text,
        correctedText: corrected_text,
        errorType: error_type,
        citations: citations || [],
        correctionId: correctionId,
        boundingRect: null,
        diffInfo: diff
      };
      if (element instanceof HTMLTextAreaElement) {
        const mirror = this.createMirrorElement(element);
        let textNode = document.createTextNode(element.value);
        mirror.appendChild(textNode);
        document.body.appendChild(mirror);
        const diffStartIndex = startIndex + diff.oldStart;
        const diffEndIndex = startIndex + diff.oldEnd;
        range.setStart(textNode, diffStartIndex);
        range.setEnd(textNode, diffEndIndex);
        const rects = range.getClientRects();
        const elementRect = element.getBoundingClientRect();
        Array.from(rects).forEach((rect, index) => {
          const adjustedLeft = rect.left + (elementRect.left - mirror.getBoundingClientRect().left);
          const adjustedTop = rect.top + (elementRect.top - mirror.getBoundingClientRect().top);
          const highlight = document.createElement("div");
          highlight.className = "word-highlight";
          highlight.style.left = `${adjustedLeft}px`;
          highlight.style.top = `${adjustedTop}px`;
          highlight.style.width = `${rect.width}px`;
          highlight.style.height = `${rect.height}px`;
          highlight.dataset.correctionId = correctionId;
          this.overlay.appendChild(highlight);
          underlineGroup.highlights.push(highlight);
          const underline = document.createElement("div");
          underline.className = "precise-underline";
          underline.style.left = `${adjustedLeft}px`;
          underline.style.top = `${adjustedTop + rect.height - 2}px`;
          underline.style.width = `${rect.width}px`;
          underline.dataset.word = original_text;
          underline.dataset.correction = corrected_text;
          underline.dataset.errorType = error_type;
          underline.dataset.correctionId = correctionId;
          if (citations && citations.length > 0) {
            underline.dataset.citations = JSON.stringify(citations);
          }
          if (animate) {
            setTimeout(() => {
              underline.classList.add("animate");
            }, index * 100);
          }
          this.overlay.appendChild(underline);
          underlineGroup.underlines.push(underline);
        });
        document.body.removeChild(mirror);
      } else if (element.isContentEditable) {
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        let currentNode = walker.nextNode();
        let currentPosition = 0;
        const diffStartIndex = startIndex + diff.oldStart;
        const diffEndIndex = startIndex + diff.oldEnd;
        while (currentNode) {
          const nodeText = currentNode.textContent;
          const nodeLength = nodeText.length;
          if (currentPosition + nodeLength >= diffStartIndex) {
            range.setStart(currentNode, diffStartIndex - currentPosition);
            range.setEnd(currentNode, diffEndIndex - currentPosition);
            const rects = range.getClientRects();
            Array.from(rects).forEach((rect, index) => {
              const highlight = document.createElement("div");
              highlight.className = "word-highlight";
              highlight.style.left = `${rect.left}px`;
              highlight.style.top = `${rect.top}px`;
              highlight.style.width = `${rect.width}px`;
              highlight.style.height = `${rect.height}px`;
              highlight.dataset.correctionId = correctionId;
              this.overlay.appendChild(highlight);
              underlineGroup.highlights.push(highlight);
              const underline = document.createElement("div");
              underline.className = "precise-underline";
              underline.style.left = `${rect.left}px`;
              underline.style.top = `${rect.bottom - 2}px`;
              underline.style.width = `${rect.width}px`;
              underline.dataset.word = original_text;
              underline.dataset.correction = corrected_text;
              underline.dataset.errorType = error_type;
              underline.dataset.correctionId = correctionId;
              if (citations && citations.length > 0) {
                underline.dataset.citations = JSON.stringify(citations);
              }
              if (animate) {
                setTimeout(() => {
                  underline.classList.add("animate");
                }, index * 100);
              }
              this.overlay.appendChild(underline);
              underlineGroup.underlines.push(underline);
            });
            break;
          }
          currentPosition += nodeLength;
          currentNode = walker.nextNode();
        }
      }
      if (underlineGroup.underlines.length > 0) {
        const lefts = underlineGroup.underlines.map(u => parseFloat(u.style.left));
        const rights = underlineGroup.underlines.map(
          u => parseFloat(u.style.left) + parseFloat(u.style.width)
        );
        const tops = underlineGroup.underlines.map(u => parseFloat(u.style.top));
        const bottoms = underlineGroup.underlines.map(
          u => parseFloat(u.style.top) + parseFloat(getComputedStyle(u).height)
        );
        underlineGroup.boundingRect = {
          left: Math.min(...lefts),
          right: Math.max(...rights),
          top: Math.min(...tops),
          bottom: Math.max(...bottoms)
        };
      }
      const existingGroups = this.underlines.get(element) || [];
      existingGroups.push(underlineGroup);
      this.underlines.set(element, existingGroups);
    });
  }

  addHoverEffect(underline) {
    if (!underline) return;
    const correctionId = underline.dataset.correctionId;
    const correctionGroup = this.underlines.get(this.activeElement)?.find(
      group => group.correctionId === correctionId
    );
    if (correctionGroup) {
      correctionGroup.underlines.forEach(u => {
        u.classList.add("hovered");
      });
      correctionGroup.highlights.forEach(h => {
        h.style.opacity = "0.7";
        h.style.backgroundColor = "rgba(255, 99, 71, 0.7)";
      });
    }
  }

  removeHoverEffect(underline) {
    if (!underline) return;
    const correctionId = underline.dataset.correctionId;
    const correctionGroup = this.underlines.get(this.activeElement)?.find(
      group => group.correctionId === correctionId
    );
    if (correctionGroup) {
      correctionGroup.underlines.forEach(u => {
        u.classList.remove("hovered");
      });
      correctionGroup.highlights.forEach(h => {
        h.style.opacity = "0";
        h.style.backgroundColor = "rgba(255, 0, 0, 0.05)";
      });
    }
  }

  updateUnderlinePositions() {
    if (!this.activeElement) return;
    const groups = this.underlines.get(this.activeElement);
    if (!groups) return;
    groups.forEach(group => {
      group.underlines.forEach(u => {
        u.style.transform = "translateZ(0)";
      });
    });
  }

  clearUnderlines(element) {
    if (element && this.underlines.has(element)) {
      const underlineGroups = this.underlines.get(element);
      underlineGroups.forEach(group => {
        group.underlines.forEach(underline => {
          if (underline && underline.parentNode) {
            underline.style.transform = "scaleX(0)";
            underline.style.transformOrigin = "right";
            underline.style.transition = "transform 0.3s ease-in";
            setTimeout(() => {
              if (underline.parentNode) {
                underline.remove();
              }
            }, 300);
          }
        });
        group.highlights.forEach(highlight => {
          if (highlight && highlight.parentNode) {
            highlight.style.opacity = "0";
            setTimeout(() => {
              if (highlight.parentNode) {
                highlight.remove();
              }
            }, 300);
          }
        });
      });
      this.underlines.delete(element);
    }
  }

  createMirrorElement(element) {
    const mirror = document.createElement("div");
    const styles = window.getComputedStyle(element);
    const relevantStyles = [
      "font-family",
      "font-size",
      "font-weight",
      "font-style",
      "letter-spacing",
      "text-transform",
      "word-spacing",
      "padding",
      "border",
      "box-sizing",
      "line-height",
      "white-space",
      "text-decoration",
      "text-align",
      "direction",
      "writing-mode"
    ];
    relevantStyles.forEach(style => {
      mirror.style[style] = styles[style];
    });
    mirror.style.position = "absolute";
    mirror.style.top = "-9999px";
    mirror.style.left = "-9999px";
    mirror.style.width = `${element.offsetWidth}px`;
    mirror.style.height = "auto";
    mirror.style.whiteSpace = "pre-wrap";
    mirror.style.visibility = "hidden";
    mirror.style.overflow = "hidden";
    return mirror;
  }
}
