/* eslint-disable no-unused-vars */

export class Underline {
  constructor() {
      this.underlines = new Map()
      this.previousCorrections = new Set()
      this.isProcessing = false
      this.overlay = null
      this.addStyles()
      this.createOverlay()
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
              transition: all 0.2s ease-out;
              transform-origin: left;
              will-change: transform, background-color, height;
              z-index: 1;
          }
          .precise-underline::after {
              content: '';
              position: absolute;
              top: -4px;
              left: 0;
              right: 0;
              bottom: -4px;
              background: transparent;
              pointer-events: none;
              z-index: 2;
          }
          .precise-underline.hovered {
              background-color: #B01030;
              height: 3px;
          }
          .precise-underline.animate {
              animation: underlineDraw 2s ease-out forwards;
              animation-iteration-count: 1;
              animation-fill-mode: forwards;
          }
          .word-highlight {
              position: absolute;
              pointer-events: none;
              transition: all 0.2s ease-out;
              transform: translateZ(0);
              will-change: transform, opacity;
              opacity: 0;
              z-index: -1;
              background-color: rgba(255, 99, 71, 0.1);
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
          newDiff: newText.slice(start, newText.length - end),
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
          'writing-mode'
      ]
      relevantStyles.forEach(style => {
          mirror.style[style] = styles[style]
      })
      mirror.style.position = 'absolute'
      mirror.style.top = '-9999px'
      mirror.style.left = '-9999px'
      mirror.style.width = element.offsetWidth + 'px'
      mirror.style.height = 'auto'
      mirror.style.whiteSpace = 'pre-wrap'
      mirror.style.visibility = 'hidden'
      mirror.style.overflow = 'hidden'
      return mirror
  }

  underlineCorrection(element, correction) {
      const original_text = correction.original_text
      const corrected_text = correction.corrected_text
      const error_type = correction.error_type
      const citations = correction.citations || []
      const startIndex = this.findTextPosition(element, original_text)
      if (startIndex === -1) return
      const differences = this.findTextDifferences(original_text, corrected_text)
      requestAnimationFrame(() => {
          const range = document.createRange()
          const correctionId = 'correction-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
          const underlineGroup = {
              underlines: [],
              highlights: [],
              originalText: original_text,
              correctedText: corrected_text,
              errorType: error_type,
              citations: citations,
              correctionId: correctionId,
              boundingRect: null,
              diffInfo: differences
          }
          if (element instanceof HTMLTextAreaElement) {
              const mirror = this.createMirrorElement(element)
              const textNode = document.createTextNode(element.value)
              mirror.appendChild(textNode)
              document.body.appendChild(mirror)
              const diffStartIndex = startIndex + differences.oldStart
              const diffEndIndex = startIndex + differences.oldEnd
              range.setStart(textNode, diffStartIndex)
              range.setEnd(textNode, diffEndIndex)
              const rects = range.getClientRects()
              const elementRect = element.getBoundingClientRect()
              Array.from(rects).forEach((rect, index) => {
                  const adjustedLeft = rect.left + (elementRect.left - mirror.getBoundingClientRect().left)
                  const adjustedTop = rect.top + (elementRect.top - mirror.getBoundingClientRect().top)
                  const highlight = document.createElement('div')
                  highlight.className = 'word-highlight'
                  highlight.style.left = adjustedLeft + 'px'
                  highlight.style.top = adjustedTop + 'px'
                  highlight.style.width = rect.width + 'px'
                  highlight.style.height = rect.height + 'px'
                  highlight.dataset.correctionId = correctionId
                  this.overlay.appendChild(highlight)
                  underlineGroup.highlights.push(highlight)
                  const underline = document.createElement('div')
                  underline.className = 'precise-underline'
                  underline.style.left = adjustedLeft + 'px'
                  underline.style.top = adjustedTop + rect.height - 2 + 'px'
                  underline.style.width = rect.width + 'px'
                  setTimeout(() => {
                      underline.classList.add('animate')
                  }, index * 100)
                  underline.dataset.word = original_text
                  underline.dataset.correction = corrected_text
                  underline.dataset.errorType = error_type
                  underline.dataset.correctionId = correctionId
                  if (citations.length > 0) {
                      underline.dataset.citations = JSON.stringify(citations)
                  }
                  this.overlay.appendChild(underline)
                  underlineGroup.underlines.push(underline)
              })
              document.body.removeChild(mirror)
          } else if (element.isContentEditable) {
              const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
              let currentNode = walker.nextNode()
              let currentPosition = 0
              while (currentNode) {
                  const nodeText = currentNode.textContent
                  const diffStartIndex = startIndex + differences.oldStart
                  const diffEndIndex = startIndex + differences.oldEnd
                  if (currentPosition + nodeText.length >= diffStartIndex) {
                      range.setStart(currentNode, diffStartIndex - currentPosition)
                      range.setEnd(currentNode, diffEndIndex - currentPosition)
                      const rects = range.getClientRects()
                      Array.from(rects).forEach((rect, index) => {
                          const highlight = document.createElement('div')
                          highlight.className = 'word-highlight'
                          highlight.style.left = rect.left + 'px'
                          highlight.style.top = rect.top + 'px'
                          highlight.style.width = rect.width + 'px'
                          highlight.style.height = rect.height + 'px'
                          highlight.dataset.correctionId = correctionId
                          this.overlay.appendChild(highlight)
                          underlineGroup.highlights.push(highlight)
                          const underline = document.createElement('div')
                          underline.className = 'precise-underline'
                          underline.style.left = rect.left + 'px'
                          underline.style.top = rect.bottom - 2 + 'px'
                          underline.style.width = rect.width + 'px'
                          setTimeout(() => {
                              underline.classList.add('animate')
                          }, index * 100)
                          underline.dataset.word = original_text
                          underline.dataset.correction = corrected_text
                          underline.dataset.errorType = error_type
                          underline.dataset.correctionId = correctionId
                          if (citations.length > 0) {
                              underline.dataset.citations = JSON.stringify(citations)
                          }
                          this.overlay.appendChild(underline)
                          underlineGroup.underlines.push(underline)
                      })
                      break
                  }
                  currentPosition += nodeText.length
                  currentNode = walker.nextNode()
              }
          }
          const allUnderlines = underlineGroup.underlines
          if (allUnderlines.length > 0) {
              const lefts = allUnderlines.map(u => parseFloat(u.style.left))
              const rights = allUnderlines.map(u => parseFloat(u.style.left) + parseFloat(u.style.width))
              const tops = allUnderlines.map(u => parseFloat(u.style.top))
              const bottoms = allUnderlines.map(u => parseFloat(u.style.top) + parseFloat(getComputedStyle(u).height))
              underlineGroup.boundingRect = {
                  left: Math.min(...lefts),
                  right: Math.max(...rights),
                  top: Math.min(...tops),
                  bottom: Math.max(...bottoms)
              }
          }
          const existingGroups = this.underlines.get(element) || []
          existingGroups.push(underlineGroup)
          this.underlines.set(element, existingGroups)
      })
  }

  updateUnderlinePositions(element) {
      if (!this.underlines.has(element)) return
      requestAnimationFrame(() => {
          const elementRect = element.getBoundingClientRect()
          this.underlines.get(element).forEach(group => {
              const mirror = this.createMirrorElement(element)
              const textNode = document.createTextNode(element.value || element.textContent)
              mirror.appendChild(textNode)
              document.body.appendChild(mirror)
              const startIndex = this.findTextPosition(element, group.originalText)
              if (startIndex === -1) {
                  document.body.removeChild(mirror)
                  return
              }
              const range = document.createRange()
              range.setStart(textNode, startIndex)
              range.setEnd(textNode, startIndex + group.originalText.length)
              const rects = Array.from(range.getClientRects())
              rects.forEach((rect, index) => {
                  if (group.underlines[index] && group.highlights[index]) {
                      const adjustedLeft = rect.left + (elementRect.left - mirror.getBoundingClientRect().left)
                      const adjustedTop = rect.top + (elementRect.top - mirror.getBoundingClientRect().top)
                      group.highlights[index].style.left = adjustedLeft + 'px'
                      group.highlights[index].style.top = adjustedTop + 'px'
                      group.highlights[index].style.width = rect.width + 'px'
                      group.highlights[index].style.height = rect.height + 'px'
                      group.underlines[index].style.left = adjustedLeft + 'px'
                      group.underlines[index].style.top = adjustedTop + rect.height - 2 + 'px'
                      group.underlines[index].style.width = rect.width + 'px'
                  }
              })
              if (group.underlines.length > 0) {
                  const lefts = group.underlines.map(u => parseFloat(u.style.left))
                  const rights = group.underlines.map(u => parseFloat(u.style.left) + parseFloat(u.style.width))
                  const tops = group.underlines.map(u => parseFloat(u.style.top))
                  const bottoms = group.underlines.map(u => parseFloat(u.style.top) + parseFloat(getComputedStyle(u).height))
                  group.boundingRect = {
                      left: Math.min(...lefts),
                      right: Math.max(...rights),
                      top: Math.min(...tops),
                      bottom: Math.max(...bottoms)
                  }
              }
              document.body.removeChild(mirror)
          })
      })
  }

  addHoverEffect(element, underline) {
      const correctionId = underline.dataset.correctionId
      const correctionGroup = this.underlines.get(element)?.find(
          group => group.correctionId === correctionId
      )
      if (correctionGroup) {
          correctionGroup.underlines.forEach(u => {
              u.classList.add('hovered')
          })
          correctionGroup.highlights.forEach(h => {
              h.style.opacity = '0.7'
              h.style.backgroundColor = 'rgba(255, 99, 71, 0.7)'
          })
      }
  }

  removeHoverEffect(element, underline) {
      const correctionId = underline.dataset.correctionId
      const correctionGroup = this.underlines.get(element)?.find(
          group => group.correctionId === correctionId
      )
      if (correctionGroup) {
          correctionGroup.underlines.forEach(u => {
              u.classList.remove('hovered')
          })
          correctionGroup.highlights.forEach(h => {
              h.style.opacity = '0'
              h.style.backgroundColor = 'rgba(255, 0, 0, 0.05)'
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
                  console.log('Removing underline for', correctionKey);
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
