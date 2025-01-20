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
    let lastWindowWidth = window.innerWidth
    let lastWindowHeight = window.innerHeight

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
            console.log('sus api update');
            const apiData = await fetchDataFromBackend(activeElement)
            if (apiData && apiData.corrections) {
                underline.updateUnderlines(activeElement, apiData.corrections, true)
            }
        }
    }, 1000)

    const debouncedHandleResize = debounce(() => {
        if (activeElement) {
            const currentWidth = window.innerWidth
            const currentHeight = window.innerHeight
            lastWindowWidth = currentWidth
            lastWindowHeight = currentHeight
            fetchDataFromBackend(activeElement).then(apiData => {
                if (apiData && apiData.corrections) {
                    underline.clearUnderlines(activeElement)
                    apiData.corrections.forEach(correction => {
                        underline.underlineCorrection(activeElement, correction)
                    })
                }
            })
        }
    }, 100)

    function isEditableElement(element) {
        return element && element.matches('input[type="text"], textarea, [contenteditable="true"]')
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
                slashCommand.showSlashCommands({ left: rect.left, top: 0, bottom: rect.bottom, right: rect.left }, typedCommand)
            } else {
                slashCommand.hideSlashCommandUI()
            }
        } else {
            slashCommand.hideSlashCommandUI()
        }
    }

    document.addEventListener('input', e => {
        if (!isEditableElement(e.target)) return
        if (activeElement !== e.target) {
            underline.clearUnderlines(activeElement)
            activeElement = e.target
        }
        if (underline.underlines.has(e.target)) {
            underline.updateUnderlinePositions(e.target)
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
    })

    document.addEventListener('keydown', e => {
        if (e.altKey && e.key === '/') {
            console.log('slkash');
            if (!activeElement) return
            console.log('elemento activo');
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

    const handleMouseMove = (e) => {
        clearTimeout(tooltipHideTimeout)
        if (!activeElement) return
        const elementsFromPoint = document.elementsFromPoint(e.clientX, e.clientY)
        const foundUnderline = Array.from(
            underline.overlay.getElementsByClassName('precise-underline')
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
        if ((foundUnderline || isOverTooltip) && activeElement) {
            let element
            if (foundUnderline) {
                const correctionId = foundUnderline.dataset.correctionId
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
                if (foundUnderline && (!hoveredUnderline || hoveredUnderline.dataset.correctionId !== foundUnderline.dataset.correctionId)) {
                    if (hoveredUnderline) {
                        underline.removeHoverEffect(activeElement, hoveredUnderline)
                    }
                    underline.addHoverEffect(activeElement, foundUnderline)
                    hoveredUnderline = foundUnderline
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

    const handleMouseLeave = (e) => {
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

    tooltip.getElement().addEventListener('click', async (e) => {
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
                        const inputEvent = new InputEvent('input', {
                            bubbles: true,
                            cancelable: true,
                            inputType: 'insertText',
                            data: differences.newDiff
                        })
                        activeElement.value = beforeText + differences.newDiff + afterText
                        activeElement.dispatchEvent(inputEvent)
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
                        const walker = document.createTreeWalker(
                            activeElement,
                            NodeFilter.SHOW_TEXT,
                            null,
                            false
                        )
                        let currentNode = walker.nextNode()
                        let currentPosition = 0
                        while (currentNode) {
                            const nodeLength = currentNode.length
                            if (currentPosition + nodeLength >= diffStartIndex) {
                                const localStart = diffStartIndex - currentPosition
                                const localEnd = Math.min(diffEndIndex - currentPosition, nodeLength)
                                range.setStart(currentNode, localStart)
                                range.setEnd(currentNode, localEnd)
                                const inputEvent = new InputEvent('input', {
                                    bubbles: true,
                                    cancelable: true,
                                    inputType: 'insertText',
                                    data: differences.newDiff
                                })
                                range.deleteContents()
                                const textNode = document.createTextNode(differences.newDiff)
                                range.insertNode(textNode)
                                activeElement.dispatchEvent(inputEvent)
                                if (hadFocus) {
                                    const newRange = document.createRange()
                                    newRange.setStartAfter(textNode)
                                    newRange.collapse(true)
                                    selection.removeAllRanges()
                                    selection.addRange(newRange)
                                }
                                break
                            }
                            currentPosition += nodeLength
                            currentNode = walker.nextNode()
                        }
                    }
                    correctionGroup.underlines.forEach(underlineEl => {
                        if (underlineEl && underlineEl.parentNode) {
                            underlineEl.style.transform = 'scaleX(0)'
                            underlineEl.style.transformOrigin = 'right'
                            underlineEl.style.transition = 'transform 0.3s ease-in'
                            setTimeout(() => {
                                if (underlineEl.parentNode) {
                                    underlineEl.remove()
                                }
                            }, 300)
                        }
                    })
                    correctionGroup.highlights.forEach(highlight => {
                        if (highlight && highlight.parentNode) {
                            highlight.style.opacity = '0'
                            setTimeout(() => {
                                if (highlight.parentNode) {
                                    highlight.remove()
                                }
                            }, 300)
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
                    setTimeout(() => {
                        debouncedApiUpdate()
                    }, 500)
                }
            } catch (error) {
              console.log('error in tooltip click: ', error);
            }
        }
    })

    let resizeTicking = false
    let scrollTicking = false

    window.addEventListener('resize', () => {
        if (!resizeTicking) {
            requestAnimationFrame(() => {
                debouncedHandleResize()
                resizeTicking = false
            })
            resizeTicking = true
        }
    }, { passive: true })

    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            requestAnimationFrame(() => {
                try {
                    if (activeElement) {
                        underline.updateUnderlinePositions(activeElement)
                    }
                } catch (error) {
                  console.log('error in highlighting underline positions: ', error)
                }
                scrollTicking = false
            })
            scrollTicking = true
        }
    }, { passive: true })

    const observer = new MutationObserver((mutations) => {
        if (!activeElement) return
        let mutationTimeout = null
        clearTimeout(mutationTimeout)
        mutationTimeout = setTimeout(() => {
            let shouldUpdate = false
            let positionChanged = false
            for (const mutation of mutations) {
                const targetElement =
                    mutation.target.nodeType === Node.ELEMENT_NODE
                        ? mutation.target
                        : mutation.target.parentElement
                if (!targetElement) continue
                if (
                    targetElement.closest &&
                    (targetElement.closest('.precise-underline-overlay') ||
                     targetElement.classList?.contains('precise-underline') ||
                     targetElement.classList?.contains('word-highlight'))
                ) {
                    continue
                }
                if (
                    !targetElement.contains(activeElement) &&
                    !activeElement.contains(targetElement)
                ) {
                    continue
                }
                if (
                    mutation.type === 'attributes' &&
                    ['style', 'class', 'width', 'height'].includes(mutation.attributeName)
                ) {
                    positionChanged = true
                }
                if (
                    mutation.type === 'characterData' ||
                    (mutation.type === 'childList' && (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0))
                ) {
                    shouldUpdate = true
                }
            }
            requestAnimationFrame(() => {
                if (positionChanged) {
                    underline.updateUnderlinePositions(activeElement)
                }
                if (shouldUpdate) {
                    debouncedApiUpdate()
                }
            })
        }, 100)
    })

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['style', 'class', 'width', 'height']
    })

    window.addEventListener('beforeunload', () => {
        observer.disconnect()
        underline.clearUnderlines(activeElement)
    })
}

document.addEventListener('DOMContentLoaded', initializeExtension);