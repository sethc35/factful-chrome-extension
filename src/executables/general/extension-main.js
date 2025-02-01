/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

import { Pill } from '../../classes/general/Pill.js'
import { SlashCommand } from '../../classes/general/SlashCommand.js'
import { Tooltip } from '../../classes/general/Tooltip.js'
import { Underline } from '../../classes/general/Underline.js'

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
  let tooltipVisible = false
  let lastTooltipId = null
  let accessToken = null

  const pill = new Pill("../assets/factful-icon-transparent.png"); // change to base64 prob

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'setAccessToken') {
      if (request.error) {
        accessToken = null

        console.log('[Authenticator] Error setting access token:', request.error)
      } else {
        accessToken = request.accessToken

        console.log('[Authenticator] Successfully received the access token', request)
      }

      sendResponse({ success: true });
    }
    return true;
  });

  function debounce(func, wait) {
    let timeout
    return (...args) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        func.apply(this, args)
      }, wait)
    }
  }

  function initiateAuthentication() {
    console.log("[Authenticator] Initiating user authentication...");

    chrome.runtime.sendMessage({ action: 'initiateAuthentication' }, '*');
  };

  async function fetchDataFromBackend(element) {
    const text = element.value || element.textContent || ''

    return chrome.runtime.sendMessage({
      action: 'fetchData',
      textInput: text
    }).then(response => {
      if (response.error) {
        console.log('[APIService] Error fetching data:', response.error);

        return;
      }

      console.log('[APIService] API response: ', response);

      return response
    }).catch(() => null)
  }

  const debouncedApiUpdate = debounce(async () => {
    if (!isTyping && activeElement) {
      const apiData = await fetchDataFromBackend(activeElement)
      if (apiData && apiData.corrections) {
        underline.updateUnderlines(activeElement, apiData.corrections, true)
      }
    }
  }, 1000)

  function isEditableElement(element) {
    return element && (element instanceof HTMLTextAreaElement || element.isContentEditable)
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

  function getCursorRect(element, position) {
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
      const textBeforeSlash = element.value.substring(0, position + 1)
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
        top: elementRect.top + (spanRect.top - mirrorRect.top) + spanRect.height,
        bottom: elementRect.top + (spanRect.top - mirrorRect.top) + spanRect.height
      }
      document.body.removeChild(mirror)
      return coords
    } else if (element.isContentEditable) {
      const sel = window.getSelection()
      if (!sel.rangeCount) return null
      const range = sel.getRangeAt(0).cloneRange()
      range.collapse(true)
      const span = document.createElement('span')
      span.textContent = '\u200b'
      span.style.position = 'absolute'
      span.style.opacity = '0'
      range.insertNode(span)
      const rect = span.getBoundingClientRect()
      const elementStyles = window.getComputedStyle(element)
      const paddingLeft = parseFloat(elementStyles.paddingLeft) || 0
      span.remove()
      return {
        left: rect.left - paddingLeft,
        top: rect.top,
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
        slashCommand.showSlashCommands({ left: rect.left, top: rect.top, bottom: rect.bottom }, typedCommand)
      } else {
        slashCommand.hideSlashCommandUI()
      }
    } else {
      slashCommand.hideSlashCommandUI()
    }
  }

  function handleInput(e) {
    if (!isEditableElement(e.target)) return
    if (activeElement !== e.target) {
      underline.clearUnderlines(activeElement)
      activeElement = e.target
      if (observer) {
        observer.disconnect()
      }
      observer = new MutationObserver(() => {
        if (!activeElement) return
        let mutationTimeout = null
        clearTimeout(mutationTimeout)
        mutationTimeout = setTimeout(() => {
          debouncedApiUpdate()
        }, 100)
      })
      const observerConfig = {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['style', 'class', 'width', 'height']
      }
      if (activeElement instanceof HTMLTextAreaElement) {
        observer.observe(activeElement, { attributes: true })
      } else if (activeElement.isContentEditable) {
        observer.observe(activeElement, observerConfig)
      }
    }
    isTyping = true
    clearTimeout(typeTimeout)
    typeTimeout = setTimeout(() => {
      if (activeElement === e.target) {
        isTyping = false
        debouncedApiUpdate()
      }
    }, 2000)
    detectSlashCommand(e)
  }

  document.addEventListener('input', handleInput)

  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key === '/') {
      if (!activeElement) return
      const cursorRect = getCursorRect(activeElement, getCaretPosition(activeElement))
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
        const selectedOption = slashCommand.slashCommandUI.children[slashCommand.selectedIndex]
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
    clearTimeout(tooltipHideTimeout);
    if (!activeElement) return;
    const elementsFromPoint = document.elementsFromPoint(e.clientX, e.clientY);
    const foundHighlight = Array.from(
      underline.overlay.getElementsByClassName('word-highlight')
    ).find(el => {
      const rect = el.getBoundingClientRect();
      const buffer = 4;
      return (
        e.clientX >= rect.left - buffer &&
        e.clientX <= rect.right + buffer &&
        e.clientY >= rect.top - buffer &&
        e.clientY <= rect.bottom + buffer
      );
    });
    const isOverTooltip = elementsFromPoint.some(el => el.closest('.precise-tooltip'));
    if ((foundHighlight || isOverTooltip) && activeElement) {
      if (foundHighlight) {
        const correctionId = foundHighlight.dataset.correctionId;
        const correctionGroups = underline.underlines.get(activeElement);
        const correctionGroup = correctionGroups?.find(group => group.correctionId === correctionId);
        if (correctionGroup) {
          currentHoverElement = correctionGroup;
          if (!hoveredUnderline || hoveredUnderline.dataset.correctionId !== correctionId) {
            if (hoveredUnderline) {
              underline.removeHoverEffect(activeElement, hoveredUnderline);
            }
            underline.addHoverEffect(activeElement, foundHighlight);
            hoveredUnderline = foundHighlight;
          }
          if (!tooltipVisible || lastTooltipId !== correctionId) {
            lastTooltipId = correctionId;
            tooltipVisible = true;
            const boundingRect = underline.getBoundingRectForCorrection(correctionId);
            if (boundingRect) {
              tooltip.showTooltip(
                boundingRect,
                correctionGroup.errorType,
                correctionGroup.correctedText,
                correctionGroup.citations
              );
            }
          }
        }
      }
    } else {
      const tooltipBounds = tooltip.getElement().getBoundingClientRect();
      const isMouseNearTooltip =
        e.clientX >= tooltipBounds.left - 5 &&
        e.clientX <= tooltipBounds.right + 5 &&
        e.clientY >= tooltipBounds.top - 5 &&
        e.clientY <= tooltipBounds.bottom + 5;
      if (!isMouseNearTooltip) {
        tooltipHideTimeout = setTimeout(() => {
          if (hoveredUnderline) {
            underline.removeHoverEffect(activeElement, hoveredUnderline);
            hoveredUnderline = null;
          }
          currentHoverElement = null;
          lastTooltipId = null;
          tooltipVisible = false;
          tooltip.hideTooltip();
        }, 100);
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
        lastTooltipId = null
        tooltipVisible = false
        tooltip.hideTooltip()
      }, 100)
    }
  }

  document.addEventListener('mousemove', handleMouseMove, { capture: true })
  underline.overlay.addEventListener('mouseleave', handleMouseLeave)
  tooltip.getElement().addEventListener('mouseleave', handleMouseLeave)

  tooltip.getElement().addEventListener('click', async e => {
    if (!activeElement || !hoveredUnderline) return
    const correctionId = hoveredUnderline.dataset.correctionId
    const correctionGroup = underline.underlines.get(activeElement)?.find(
      group => group.correctionId === correctionId
    )
    if (correctionGroup) {
      try {
        const differences = underline.findTextDifferences(
          correctionGroup.originalText,
          correctionGroup.correctedText
        )
        const startIndex = underline.findTextPosition(activeElement, correctionGroup.originalText)
        if (startIndex !== -1) {
          const diffStartIndex = startIndex + differences.oldStart
          const diffEndIndex = startIndex + differences.oldEnd
          const hadFocus = document.activeElement === activeElement
          if (activeElement instanceof HTMLTextAreaElement) {
            const currentText = activeElement.value
            const beforeText = currentText.substring(0, diffStartIndex)
            const afterText = currentText.substring(diffEndIndex)
            activeElement.value = beforeText + differences.newDiff + afterText
            if (hadFocus) {
              activeElement.focus()
              activeElement.setSelectionRange(
                diffStartIndex + differences.newDiff.length,
                diffStartIndex + differences.newDiff.length
              )
            }
          } else if (activeElement.isContentEditable) {
            const selection = window.getSelection()
            const range = document.createRange()
            let textNode = null
            const walker = document.createTreeWalker(
              activeElement,
              NodeFilter.SHOW_TEXT,
              null,
              false
            )
            let currentPos = 0
            while ((textNode = walker.nextNode()) !== null) {
              const nodeLength = textNode.length
              if (currentPos <= diffStartIndex && diffStartIndex < currentPos + nodeLength) {
                const localStart = diffStartIndex - currentPos
                const localEnd = Math.min(diffEndIndex - currentPos, nodeLength)
                range.setStart(textNode, localStart)
                range.setEnd(textNode, localEnd)
                break
              }
              currentPos += nodeLength
            }
            if (textNode) {
              range.deleteContents()
              const newTextNode = document.createTextNode(differences.newDiff)
              range.insertNode(newTextNode)
              if (hadFocus) {
                const newRange = document.createRange()
                newRange.setStartAfter(newTextNode)
                newRange.collapse(true)
                selection.removeAllRanges()
                selection.addRange(newRange)
              }
            }
          }
          correctionGroup.underlines.forEach(underlineEl => {
            if (underlineEl?.parentNode) {
              underlineEl.style.transform = 'scaleX(0)'
              setTimeout(() => underlineEl.remove(), 300)
            }
          })
          correctionGroup.highlights.forEach(highlight => {
            if (highlight?.parentNode) {
              highlight.style.opacity = '0'
              setTimeout(() => highlight.remove(), 300)
            }
          })
          const existingGroups = underline.underlines.get(activeElement)
          if (existingGroups) {
            const updatedGroups = existingGroups.filter(
              group => group.correctionId !== correctionId
            )
            if (updatedGroups.length > 0) {
              underline.underlines.set(activeElement, updatedGroups)
            } else {
              underline.underlines.delete(activeElement)
            }
          }
          tooltip.hideTooltip()
          underline.removeHoverEffect(activeElement, hoveredUnderline)
          hoveredUnderline = null
          const inputEvent = new InputEvent('input', {
            bubbles: true,
            cancelable: true,
            inputType: 'insertText',
            data: differences.newDiff
          })
          activeElement.dispatchEvent(inputEvent)
          setTimeout(() => {
            debouncedApiUpdate()
          }, 500)
        }
      } catch (error) {
        console.log('error clicking tooltip: ', error)
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

document.addEventListener('DOMContentLoaded', initializeExtension)
