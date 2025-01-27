/* eslint-disable no-unused-vars */

export class Underline {
  constructor() {
    this.underlines = new Map()
    this.previousCorrections = new Set()
    this.isProcessing = false
    this.overlay = null
    this.fieldContainers = new Map()
    this.intersectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.updateUnderlinePositions(entry.target)
        }
      })
    })
    this.resizeObserver = new ResizeObserver(entries => {
      entries.forEach(entry => {
        this.updateUnderlinePositions(entry.target)
      })
    })
    this.handleScroll = this.handleScroll.bind(this)
    this.handleScrollGlobal = this.handleScrollGlobal.bind(this);
    this.addStyles()
    this.createOverlay()
    window.addEventListener('scroll', this.handleScrollGlobal, { passive: true });
  }

  handleScrollGlobal() {
    this.underlines.forEach((_, element) => {
      this.updateUnderlinePositions(element);
    });
  }


  handleScroll(event) {
    this.updateUnderlinePositions(event.target)
  }

  addStyles() {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes underlineDraw {
        from { transform: scaleX(0); transform-origin: left; }
        to { transform: scaleX(1); transform-origin: left; }
      }
      .precise-underline {
        position: absolute;
        height: 2px;
        background-color: rgba(255, 0, 0, 0.6);
        pointer-events: none;
        cursor: text;
        transform-origin: left;
        will-change: transform;
        z-index: 1;
        transition: background-color 0.2s ease-out, height 0.2s ease-out;
      }
      .precise-underline-overlay {
        pointer-events: none !important;
        will-change: transform;
      }
      .precise-underline.hovered {
        background-color: #B01030;
        height: 3px;
      }
      .precise-underline.animate {
        animation: underlineDraw 0.5s ease-out forwards;
        animation-iteration-count: 1;
        animation-fill-mode: forwards;
      }
      .word-highlight {
        position: absolute;
        pointer-events: auto;
        transition: opacity 0.2s ease-out, background-color 0.2s ease-out;
        will-change: transform, opacity;
        opacity: 0;
        z-index: 0;
        background-color: rgba(255, 99, 71, 0.1);
      }
      .scroll-container {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        overflow: hidden;
        will-change: transform;
      }
      .scroll-content {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        will-change: transform;
      }
      .precise-underline.hovered ~ .word-highlight {
        opacity: 0.7;
        background-color: rgba(255, 99, 71, 0.7);
      }
    `
    document.head.appendChild(style)
  }

  createOverlay() {
    this.overlay = document.createElement('div')
    this.overlay.className = 'precise-underline-overlay'
    this.overlay.style.position = 'fixed'
    this.overlay.style.top = '0'
    this.overlay.style.left = '0'
    this.overlay.style.right = '0'
    this.overlay.style.bottom = '0'
    this.overlay.style.pointerEvents = 'none'
    this.overlay.style.zIndex = '2147483646'
    document.body.appendChild(this.overlay)
  }

  createFieldContainer(element) {
    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.pointerEvents = 'none'
    container.style.zIndex = '2147483645'
    this.overlay.appendChild(container)
    this.fieldContainers.set(element, container)
    return container
  }

  getFieldContainer(element) {
    if (!this.fieldContainers.has(element)) {
      this.createFieldContainer(element)
    }
    return this.fieldContainers.get(element)
  }

  findTextDifferences(oldText, newText) {
    let start = 0
    let end = 0
    while (start < oldText.length && start < newText.length && oldText[start] === newText[start]) {
      start++
    }
    while (
      end < oldText.length - start &&
      end < newText.length - start &&
      oldText[oldText.length - 1 - end] === newText[newText.length - 1 - end]
    ) {
      end++
    }
    return {
      oldStart: start,
      oldEnd: oldText.length - end,
      newStart: start,
      newEnd: newText.length - end,
      oldDiff: oldText.slice(start, oldText.length - end),
      newDiff: newText.slice(start, newText.length - end)
    }
  }

  findTextPosition(element, searchText) {
    const text = element.value || element.textContent || ''
    const index = text.indexOf(searchText)
    if (index === -1) {
      const lowerText = text.toLowerCase()
      const lowerSearchText = searchText.toLowerCase()
      return lowerText.indexOf(lowerSearchText)
    }
    return index
  }

  createMirrorElement(element) {
    const mirror = document.createElement('div')
    const styles = window.getComputedStyle(element)
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
      'writing-mode',
      'padding-top',
      'padding-right',
      'padding-bottom',
      'padding-left'
    ]
    relevantStyles.forEach(style => {
      mirror.style[style] = styles[style]
    })

    mirror.style.position = 'absolute'
    mirror.style.top = '0'
    mirror.style.left = '0'
    mirror.style.width = `${element.clientWidth}px`
    mirror.style.height = `${element.clientHeight}px`
    mirror.style.whiteSpace = 'pre-wrap'
    mirror.style.visibility = 'hidden'
    mirror.style.overflow = 'auto'
    mirror.style.wordWrap = 'break-word'
    
    return mirror
  }

  observeElement(element) {
    this.intersectionObserver.observe(element)
    this.resizeObserver.observe(element)
    element.addEventListener('scroll', this.handleScroll, { passive: true })
    element.addEventListener('input', this.handleScroll)
  }

  isInViewport(element) {
    const rect = element.getBoundingClientRect()
    return (
      rect.top < window.innerHeight &&
      rect.bottom > 0 &&
      rect.left < window.innerWidth &&
      rect.right > 0
    )
  }

  underlineCorrection(element, correction) {
    const original_text = correction.original_text;
    const corrected_text = correction.corrected_text;
    const error_type = correction.error_type;
    const citations = correction.citations || [];
    const startIndex = this.findTextPosition(element, original_text);
    if (startIndex === -1) return;

    const differences = this.findTextDifferences(original_text, corrected_text);
    requestAnimationFrame(() => {
      const correctionId = `correction-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const underlineGroup = {
        underlines: [],
        highlights: [],
        originalText: original_text,
        correctedText: corrected_text,
        errorType: error_type,
        citations: citations,
        correctionId: correctionId,
        diffInfo: differences,
        boundingRect: null
      };

      const container = this.getFieldContainer(element);
      const elementRect = element.getBoundingClientRect();

      container.style.transform = `translate3d(${elementRect.left}px, ${elementRect.top}px, 0)`;
      container.style.width = `${element.offsetWidth}px`;
      container.style.height = `${element.offsetHeight}px`;

      if (element instanceof HTMLTextAreaElement) {
        const mirror = this.createMirrorElement(element);
        mirror.style.overflow = window.getComputedStyle(element).overflow;
        mirror.style.height = `${element.offsetHeight}px`;
        mirror.scrollTop = element.scrollTop;
        mirror.scrollLeft = element.scrollLeft;
        mirror.offsetHeight; // force reflow

        const textNode = document.createTextNode(element.value);
        mirror.replaceChildren(textNode);
        document.body.appendChild(mirror);

        const mirrorRect = mirror.getBoundingClientRect();
        const diffStartIndex = startIndex + differences.oldStart;
        const diffEndIndex = startIndex + differences.oldEnd;

        const range = document.createRange();
        range.setStart(textNode, diffStartIndex);
        range.setEnd(textNode, diffEndIndex);

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        Array.from(range.getClientRects()).forEach((rect, index) => {
          const offsetLeft = rect.left - mirrorRect.left;
          const offsetTop = rect.top - mirrorRect.top;

          const highlight = document.createElement('div');
          highlight.className = 'word-highlight';
          highlight.style.cssText = `
            left: ${offsetLeft}px;
            top: ${offsetTop}px;
            width: ${rect.width}px;
            height: ${rect.height}px;
          `;
          highlight.dataset.correctionId = correctionId;
          container.appendChild(highlight);
          underlineGroup.highlights.push(highlight);

          highlight.addEventListener('mouseenter', () => this.addHoverEffect(element, highlight));
          highlight.addEventListener('mouseleave', () => this.removeHoverEffect(element, highlight));

          const underline = document.createElement('div');
          underline.className = 'precise-underline';
          underline.style.cssText = `
            left: ${offsetLeft}px;
            top: ${offsetTop + rect.height - 2}px;
            width: ${rect.width}px;
          `;
          underline.dataset.correctionId = correctionId;

          setTimeout(() => underline.classList.add('animate'), index * 50);
          container.appendChild(underline);
          underlineGroup.underlines.push(underline);

          const absoluteLeft = elementRect.left + (rect.left - mirrorRect.left);
          const absoluteTop = elementRect.top + (rect.top - mirrorRect.top);
          const absoluteRight = elementRect.left + (rect.right - mirrorRect.left);
          const absoluteBottom = elementRect.top + (rect.bottom - mirrorRect.top);

          if (absoluteLeft < minX) minX = absoluteLeft;
          if (absoluteTop < minY) minY = absoluteTop;
          if (absoluteRight > maxX) maxX = absoluteRight;
          if (absoluteBottom > maxY) maxY = absoluteBottom;
        });

        if (minX < maxX && minY < maxY) {
          underlineGroup.boundingRect = {
            top: minY,
            left: minX,
            right: maxX,
            bottom: maxY,
            width: maxX - minX,
            height: maxY - minY
          };
        }

        document.body.removeChild(mirror);
      }

      const existingGroups = this.underlines.get(element) || [];
      existingGroups.push(underlineGroup);
      this.underlines.set(element, existingGroups);
      this.observeElement(element);
    });
  }

  updateUnderlinePositions(element) {
    if (!this.underlines.has(element)) return;
    const groups = this.underlines.get(element);
    if (!groups.length) return;
  
    requestAnimationFrame(() => {
      const elementRect = element.getBoundingClientRect();
      const container = this.getFieldContainer(element);
      const toRemove = new Set();
  
      container.style.transform = `translate3d(${elementRect.left}px, ${elementRect.top}px, 0)`;
      container.style.width = `${element.offsetWidth}px`;
      container.style.height = `${element.offsetHeight}px`;
  
      if (element instanceof HTMLTextAreaElement) {
        const mirror = this.createMirrorElement(element);
        const textNode = document.createTextNode(element.value);
        mirror.appendChild(textNode);
        document.body.appendChild(mirror);
  
        groups.forEach((group, groupIndex) => {
          const startIndex = this.findTextPosition(element, group.originalText);
          if (startIndex === -1) {
            toRemove.add(groupIndex);
            return;
          }
  
          const diffStartIndex = startIndex + group.diffInfo.oldStart;
          const diffEndIndex = startIndex + group.diffInfo.oldEnd;
  
          try {
            const range = document.createRange();
            range.setStart(textNode, diffStartIndex);
            range.setEnd(textNode, diffEndIndex);
  
            group.underlines.forEach(u => u.remove());
            group.highlights.forEach(h => h.remove());
            group.underlines = [];
            group.highlights = [];
  
            const scrollContainer = document.createElement('div');
            scrollContainer.className = 'scroll-container';
            container.appendChild(scrollContainer);
  
            const scrollContent = document.createElement('div');
            scrollContent.className = 'scroll-content';
            scrollContent.style.transform = `translate3d(0, ${-element.scrollTop}px, 0)`;
            scrollContainer.appendChild(scrollContent);
  
            Array.from(range.getClientRects()).forEach((rect, index) => {
              const offsetLeft = rect.left - mirror.getBoundingClientRect().left;
              const offsetTop = rect.top - mirror.getBoundingClientRect().top;
  
              const highlight = document.createElement('div');
              highlight.className = 'word-highlight';
              highlight.style.left = `${offsetLeft}px`;
              highlight.style.top = `${offsetTop}px`;
              highlight.style.width = `${rect.width}px`;
              highlight.style.height = `${rect.height}px`;
              highlight.dataset.correctionId = group.correctionId;
              scrollContent.appendChild(highlight);
              group.highlights.push(highlight);
  
              const underline = document.createElement('div');
              underline.className = 'precise-underline';
              underline.style.left = `${offsetLeft}px`;
              underline.style.top = `${offsetTop + rect.height - 2}px`;
              underline.style.width = `${rect.width}px`;
              underline.dataset.correctionId = group.correctionId;
              scrollContent.appendChild(underline);
              group.underlines.push(underline);
            });
          } catch (e) {
            toRemove.add(groupIndex);
          }
        });
  
        document.body.removeChild(mirror);
      } else if (element.isContentEditable) {
        groups.forEach((group, groupIndex) => {
          const treeWalker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
          let text = '';
          const textNodes = [];
          let currentNode;
  
          while ((currentNode = treeWalker.nextNode())) {
            textNodes.push(currentNode);
            text += currentNode.textContent;
          }
  
          const startIndex = text.indexOf(group.originalText);
          if (startIndex === -1) {
            toRemove.add(groupIndex);
            return;
          }
  
          let currentLength = 0;
          let startNode, endNode, startOffset, endOffset;
  
          for (let i = 0; i < textNodes.length; i++) {
            const nodeLength = textNodes[i].textContent.length;
            if (!startNode && startIndex >= currentLength && startIndex < currentLength + nodeLength) {
              startNode = textNodes[i];
              startOffset = startIndex - currentLength;
            }
            if (!endNode && startIndex + group.originalText.length <= currentLength + nodeLength) {
              endNode = textNodes[i];
              endOffset = startIndex + group.originalText.length - currentLength;
            }
            currentLength += nodeLength;
          }
  
          if (!startNode || !endNode) {
            toRemove.add(groupIndex);
            return;
          }
  
          try {
            const range = document.createRange();
            range.setStart(startNode, startOffset);
            range.setEnd(endNode, endOffset);
  
            group.underlines.forEach(u => u.remove());
            group.highlights.forEach(h => h.remove());
            group.underlines = [];
            group.highlights = [];
  
            Array.from(range.getClientRects()).forEach(rect => {
              const offsetLeft = rect.left - elementRect.left;
              const offsetTop = rect.top - elementRect.top;
  
              const highlight = document.createElement('div');
              highlight.className = 'word-highlight';
              highlight.style.left = `${offsetLeft}px`;
              highlight.style.top = `${offsetTop}px`;
              highlight.style.width = `${rect.width}px`;
              highlight.style.height = `${rect.height}px`;
              highlight.dataset.correctionId = group.correctionId;
              container.appendChild(highlight);
              group.highlights.push(highlight);
  
              const underline = document.createElement('div');
              underline.className = 'precise-underline';
              underline.style.left = `${offsetLeft}px`;
              underline.style.top = `${offsetTop + rect.height - 2}px`;
              underline.style.width = `${rect.width}px`;
              underline.dataset.correctionId = group.correctionId;
              container.appendChild(underline);
              group.underlines.push(underline);
  
              highlight.addEventListener('mouseenter', () => this.addHoverEffect(element, highlight));
              highlight.addEventListener('mouseleave', () => this.removeHoverEffect(element, highlight));
            });
          } catch (e) {
            toRemove.add(groupIndex);
          }
        });
      }
  
      Array.from(toRemove).reverse().forEach(index => {
        const group = groups[index];
        group.underlines.forEach(underline => underline.remove());
        group.highlights.forEach(highlight => highlight.remove());
        groups.splice(index, 1);
      });
    });
  }

  addHoverEffect(element, highlight) {
    const correctionId = highlight.dataset.correctionId
    const correctionGroup = this.underlines.get(element)?.find(
      group => group.correctionId === correctionId
    )
    if (correctionGroup) {
      correctionGroup.underlines.forEach(u => u.classList.add('hovered'))
      correctionGroup.highlights.forEach(h => {
        h.style.opacity = '0.7'
        h.style.backgroundColor = 'rgba(255, 99, 71, 0.7)'
      })
    }
  }
  
  removeHoverEffect(element, highlight) {
    const correctionId = highlight.dataset.correctionId
    const correctionGroup = this.underlines.get(element)?.find(
      group => group.correctionId === correctionId
    )
    if (correctionGroup) {
      correctionGroup.underlines.forEach(u => u.classList.remove('hovered'))
      correctionGroup.highlights.forEach(h => {
        h.style.opacity = '0'
        h.style.backgroundColor = 'rgba(255, 99, 71, 0.1)'
      })
    }
  }

  clearUnderlines(element) {
    if (!element || !this.underlines.has(element)) return
    const underlineGroups = this.underlines.get(element)
    underlineGroups.forEach(group => {
      group.underlines.forEach(underline => {
        if (underline && underline.parentNode) {
          underline.style.transform = 'scaleX(0)'
          underline.style.transformOrigin = 'right'
          underline.style.transition = 'transform 0.3s ease-in'
          setTimeout(() => {
            if (underline.parentNode) {
              underline.remove()
            }
          }, 300)
        }
      })
      group.highlights.forEach(highlight => {
        if (highlight && highlight.parentNode) {
          highlight.style.opacity = '0'
          setTimeout(() => {
            if (highlight.parentNode) {
              highlight.remove()
            }
          }, 300)
        }
      })
    })
    this.underlines.delete(element)
    if (this.fieldContainers.has(element)) {
      const container = this.fieldContainers.get(element)
      if (container && container.parentNode) {
        container.remove()
      }
      this.fieldContainers.delete(element)
    }
    this.intersectionObserver.unobserve(element)
    this.resizeObserver.unobserve(element)
    element.removeEventListener('scroll', this.handleScroll)
    element.removeEventListener('input', this.handleScroll)
  }

  updateUnderlines(element, corrections, shouldAnimate = false) {
    if (!element || !corrections) return
    const currentCorrections = new Set(
      corrections.map(c => c.original_text + '-' + c.error_type)
    )
    const shouldAnimateThis =
      shouldAnimate ||
      corrections.some(c => !this.previousCorrections.has(c.original_text + '-' + c.error_type))
    const existingUnderlines = this.underlines.get(element) || []
    const existingCorrections = new Set(
      existingUnderlines.map(group => group.originalText + '-' + group.errorType)
    )
    if (existingUnderlines.length > 0) {
      existingUnderlines.forEach(group => {
        const correctionKey = group.originalText + '-' + group.errorType
        if (!currentCorrections.has(correctionKey)) {
          group.underlines.forEach(underline => {
            if (underline && underline.parentNode) {
              underline.style.transform = 'scaleX(0)'
              underline.style.transformOrigin = 'right'
              underline.style.transition = 'transform 0.3s ease-in'
              setTimeout(() => {
                if (underline.parentNode) {
                  underline.remove()
                }
              }, 300)
            }
          })
          group.highlights.forEach(highlight => {
            if (highlight && highlight.parentNode) {
              highlight.style.opacity = '0'
              setTimeout(() => {
                if (highlight.parentNode) {
                  highlight.remove()
                }
              }, 300)
            }
          })
        }
      })
    }
    corrections.forEach(correction => {
      const correctionKey = correction.original_text + '-' + correction.error_type
      if (!existingCorrections.has(correctionKey)) {
        this.underlineCorrection(element, correction)
      }
    })
    this.previousCorrections = currentCorrections
  }
}