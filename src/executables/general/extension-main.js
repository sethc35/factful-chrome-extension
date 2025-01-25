/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

import { SlashCommand } from '../../classes/general/SlashCommand.js';
import { Tooltip } from '../../classes/general/Tooltip.js';
import { Underline } from '../../classes/general/Underline.js';

function initializeExtension() {
  let activeElement = null
  let hoveredUnderline = null
  let currentHoverElement = null
  let tooltipHideTimeout = null
  let isTyping = false
  let typeTimeout = null
  const underline = new Underline()
  const tooltip = new Tooltip()
  const slashCommand = new SlashCommand()
  let observer = null

  function debounce(func, wait) {
    let timeout
    return (...args) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        func.apply(this, args)
      }, wait)
    }
  }

  async function fetchDataFromBackend(element) {
    const text = element.value || element.textContent || ''
    return chrome.runtime.sendMessage({
      action: 'fetchData',
      textInput: text
    }).then(response => {
      if (response.error) {
        return null
      }
      return response
    }).catch(() => null)
  }

  const debouncedApiUpdate = debounce(async () => {
    if (!isTyping && activeElement) {
      const apiData = await fetchDataFromBackend(activeElement)
      console.log('api data fetched from backend: ', apiData);
      if (apiData && apiData.corrections) {
        underline.updateUnderlines(activeElement, apiData.corrections, true)
      }
    }
  }, 1000)

  function isEditableElement(element) {
    return element && (element instanceof HTMLTextAreaElement || element.isContentEditable);
  }

  function getElementText(element) {
    return element instanceof HTMLTextAreaElement ? element.value : element.textContent;
  }

  function getCaretPosition(element) {
    if (element instanceof HTMLTextAreaElement) {
      return element.selectionStart
    }
    if (element.isContentEditable) {
      const sel = window.getSelection()
      if (!sel.rangeCount) return null
      const range = sel.getRangeAt(0)
      const preCaretRange = range.cloneRange()
      preCaretRange.selectNodeContents(element)
      preCaretRange.setEnd(range.endContainer, range.endOffset)
      return preCaretRange.toString().length
    }
    return null
  }

  function getCursorRect(element, slashIndex) {
    if (element instanceof HTMLTextAreaElement) {
      const mirror = document.createElement('div')
      const computedStyle = window.getComputedStyle(element)
      for (const key of computedStyle) {
        mirror.style[key] = computedStyle[key]
      }
      mirror.style.position = 'absolute'
      mirror.style.visibility = 'hidden'
      mirror.style.whiteSpace = 'pre-wrap'
      mirror.style.wordWrap = 'break-word'
      mirror.style.overflow = 'hidden'
      mirror.style.width = element.offsetWidth + 'px'
      const textBeforeSlash = element.value.substring(0, slashIndex + 1)
      mirror.textContent = textBeforeSlash
      const measureSpan = document.createElement('span')
      measureSpan.textContent = '|'
      mirror.appendChild(measureSpan)
      document.body.appendChild(mirror)
      const elementRect = element.getBoundingClientRect()
      const spanRect = measureSpan.getBoundingClientRect()
      const mirrorRect = mirror.getBoundingClientRect()
      const coords = {
        left: elementRect.left + (spanRect.left - mirrorRect.left),
        bottom: elementRect.top + (spanRect.top - mirrorRect.top) + spanRect.height
      }
      document.body.removeChild(mirror)
      return coords
    } else if (element.isContentEditable) {
      const selection = window.getSelection()
      if (!selection.rangeCount) return null
      const range = document.createRange()
      let node = element
      let charCount = 0
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
      while (node == walker.nextNode()) {
        const nodeLength = node.textContent.length
        if (charCount + nodeLength >= slashIndex) {
          const offset = slashIndex - charCount
          range.setStart(node, offset)
          range.setEnd(node, offset + 1)
          break
        }
        charCount += nodeLength
      }
      const rect = range.getBoundingClientRect()
      return {
        left: rect.left,
        bottom: rect.bottom
      }
    }
    return null
  }

  function detectSlashCommand(e) {
    if (!activeElement) return
    const text = activeElement.value || activeElement.textContent || ''
    const cursorPos = getCaretPosition(activeElement)
    if (cursorPos === null) return
    const slashIndex = text.lastIndexOf('/', cursorPos - 1)
    if (slashIndex !== -1) {
      const typedCommand = text.substring(slashIndex, cursorPos)
      if (typedCommand.length <= 30) {
        const rect = getCursorRect(activeElement, slashIndex)
        slashCommand.currentInput = typedCommand
        slashCommand.showSlashCommands(
          { left: rect.left, top: 0, bottom: rect.bottom, right: rect.left },
          typedCommand
        )
      } else {
        slashCommand.hideSlashCommandUI()
      }
    } else {
      slashCommand.hideSlashCommandUI()
    }
  }

  function handleInput(e) {
    if (!isEditableElement(e.target)) return;
    if (activeElement !== e.target) {
      underline.clearUnderlines(activeElement);
      activeElement = e.target;
      if (observer) {
        observer.disconnect();
      }
      observer = new MutationObserver(() => {
        if (!activeElement) return;
        let mutationTimeout = null;
        clearTimeout(mutationTimeout);
        mutationTimeout = setTimeout(() => {
          debouncedApiUpdate();
        }, 100);
      });
      
      const observerConfig = {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['style', 'class', 'width', 'height']
      };
      
      if (activeElement instanceof HTMLTextAreaElement) {
        observer.observe(activeElement, { attributes: true });
      } else if (activeElement.isContentEditable) {
        observer.observe(activeElement, observerConfig);
      }
    }
    
    isTyping = true;
    clearTimeout(typeTimeout);
    typeTimeout = setTimeout(() => {
      if (activeElement === e.target) {
        isTyping = false;
        debouncedApiUpdate();
      }
    }, 2000);
    detectSlashCommand(e);
  }

  document.addEventListener('input', handleInput)

  document.addEventListener('keydown', e => {
    if (e.altKey && e.key === '/') {
      if (!activeElement) return
      const cursorRect = getCursorRect(
        activeElement,
        getCaretPosition(activeElement)
      )
      if (cursorRect) {
        slashCommand.isActive = true
        slashCommand.showSlashCommands(cursorRect)
      }
      e.preventDefault()
    }
    if (slashCommand.isActive) {
      if (e.key === 'ArrowUp') {
        slashCommand.updateSelectedIndex(-1)
        e.preventDefault()
      } else if (e.key === 'ArrowDown') {
        slashCommand.updateSelectedIndex(1)
        e.preventDefault()
      } else if (e.key === 'Enter') {
        const selectedOption = slashCommand.getSlashCommandUI().children[
          slashCommand.selectedIndex
        ]
        if (selectedOption) {
          const command = selectedOption.querySelector('span').textContent
          slashCommand.selectCommand(command)
        }
        e.preventDefault()
      } else if (e.key === 'Escape') {
        slashCommand.hideSlashCommandUI()
        e.preventDefault()
      }
    }
  })

  function handleMouseMove(e) {
    clearTimeout(tooltipHideTimeout)
    if (!activeElement) return
    const elementsFromPoint = document.elementsFromPoint(e.clientX, e.clientY)
    const foundHighlight = Array.from(
      underline.overlay.getElementsByClassName('word-highlight')
    ).find(el => {
      const rect = el.getBoundingClientRect()
      return (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top - 4 &&
        e.clientY <= rect.bottom + 4
      )
    })
    const isOverTooltip = elementsFromPoint.some(el => el.closest('.precise-tooltip'))
    if ((foundHighlight || isOverTooltip) && activeElement) {
      let element
      if (foundHighlight) {
        const correctionId = foundHighlight.dataset.correctionId
        const correctionGroup = underline.underlines.get(activeElement)?.filter(
          group => group.correctionId === correctionId
        )
        element = correctionGroup ? correctionGroup[0] : null
        if (element) {
          currentHoverElement = element
        }
      } else if (isOverTooltip && currentHoverElement) {
        element = currentHoverElement
      }
      if (element) {
        if (
          foundHighlight &&
          (!hoveredUnderline || hoveredUnderline.dataset.correctionId !== foundHighlight.dataset.correctionId)
        ) {
          if (hoveredUnderline) {
            underline.removeHoverEffect(activeElement, hoveredUnderline)
          }
          underline.addHoverEffect(activeElement, foundHighlight)
          hoveredUnderline = foundHighlight
        }
        if (element.boundingRect) {
          tooltip.showTooltip(element.boundingRect, element.errorType, element.correctedText, element.citations)
        }
      }
    } else {
      const tooltipBounds = tooltip.getElement().getBoundingClientRect()
      const isMouseNearTooltip =
        e.clientX >= tooltipBounds.left - 5 &&
        e.clientX <= tooltipBounds.right + 5 &&
        e.clientY >= tooltipBounds.top - 5 &&
        e.clientY <= tooltipBounds.bottom + 5
      if (!isMouseNearTooltip) {
        tooltipHideTimeout = setTimeout(() => {
          if (hoveredUnderline) {
            underline.removeHoverEffect(activeElement, hoveredUnderline)
            hoveredUnderline = null
          }
          currentHoverElement = null
          tooltip.hideTooltip()
        }, 100)
      }
    }
  }

  function handleMouseLeave(e) {
    const relatedTarget = e.relatedTarget
    const isLeavingForTooltip = relatedTarget && relatedTarget.closest('.precise-tooltip')
    const isLeavingForUnderline = relatedTarget && relatedTarget.closest('.precise-underline')
    if (!isLeavingForTooltip && !isLeavingForUnderline) {
      tooltipHideTimeout = setTimeout(() => {
        if (hoveredUnderline) {
          underline.removeHoverEffect(activeElement, hoveredUnderline)
          hoveredUnderline = null
        }
        currentHoverElement = null
        tooltip.hideTooltip()
      }, 100)
    }
  }

  document.addEventListener('mousemove', handleMouseMove, { capture: true })
  underline.overlay.addEventListener('mouseleave', handleMouseLeave)
  tooltip.getElement().addEventListener('mouseleave', handleMouseLeave)

  tooltip.getElement().addEventListener('click', async e => {
    if (!activeElement || !hoveredUnderline) return;
    const correctionId = hoveredUnderline.dataset.correctionId;
    const correctionGroup = underline.underlines.get(activeElement)?.find(
      group => group.correctionId === correctionId
    );
    
    if (correctionGroup) {
      try {
        const differences = underline.findTextDifferences(
          correctionGroup.originalText,
          correctionGroup.correctedText
        );
        const startIndex = underline.findTextPosition(activeElement, correctionGroup.originalText);
        
        if (startIndex !== -1) {
          const diffStartIndex = startIndex + differences.oldStart;
          const diffEndIndex = startIndex + differences.oldEnd;
          const hadFocus = document.activeElement === activeElement;
          
          if (activeElement instanceof HTMLTextAreaElement) {
            const currentText = activeElement.value;
            const beforeText = currentText.substring(0, diffStartIndex);
            const afterText = currentText.substring(diffEndIndex);
            activeElement.value = beforeText + differences.newDiff + afterText;
            
            if (hadFocus) {
              activeElement.focus();
              activeElement.setSelectionRange(
                diffStartIndex + differences.newDiff.length,
                diffStartIndex + differences.newDiff.length
              );
            }
          } else if (activeElement.isContentEditable) {
            const selection = window.getSelection();
            const range = document.createRange();
            let textNode = null;
            
            const walker = document.createTreeWalker(
              activeElement,
              NodeFilter.SHOW_TEXT,
              null,
              false
            );
            
            let currentPos = 0;
            while ((textNode = walker.nextNode()) !== null) {
              const nodeLength = textNode.length;
              if (currentPos <= diffStartIndex && diffStartIndex < currentPos + nodeLength) {
                const localStart = diffStartIndex - currentPos;
                const localEnd = Math.min(diffEndIndex - currentPos, nodeLength);
                range.setStart(textNode, localStart);
                range.setEnd(textNode, localEnd);
                break;
              }
              currentPos += nodeLength;
            }
            
            if (textNode) {
              range.deleteContents();
              const newTextNode = document.createTextNode(differences.newDiff);
              range.insertNode(newTextNode);
              
              if (hadFocus) {
                const newRange = document.createRange();
                newRange.setStartAfter(newTextNode);
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
              }
            }
          }

          correctionGroup.underlines.forEach(underlineEl => {
            if (underlineEl?.parentNode) {
              underlineEl.style.transform = 'scaleX(0)';
              setTimeout(() => underlineEl.remove(), 300);
            }
          });
          
          correctionGroup.highlights.forEach(highlight => {
            if (highlight?.parentNode) {
              highlight.style.opacity = '0';
              setTimeout(() => highlight.remove(), 300);
            }
          });
          
          const existingGroups = underline.underlines.get(activeElement);
          if (existingGroups) {
            const updatedGroups = existingGroups.filter(
              group => group.correctionId !== correctionId
            );
            if (updatedGroups.length > 0) {
              underline.underlines.set(activeElement, updatedGroups);
            } else {
              underline.underlines.delete(activeElement);
            }
          }
          
          tooltip.hideTooltip();
          underline.removeHoverEffect(activeElement, hoveredUnderline);
          hoveredUnderline = null;

          const inputEvent = new InputEvent('input', {
            bubbles: true,
            cancelable: true,
            inputType: 'insertText',
            data: differences.newDiff
          });
          activeElement.dispatchEvent(inputEvent);
          
          setTimeout(() => {
            debouncedApiUpdate();
          }, 500);
        }
      } catch (error) {
        console.error('Error applying correction:', error);
      }
    }
  })

  window.addEventListener('beforeunload', () => {
    if (observer) {
      observer.disconnect()
    }
    underline.clearUnderlines(activeElement)
  })
}

document.addEventListener('DOMContentLoaded', initializeExtension);
