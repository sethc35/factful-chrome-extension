import { Tooltip } from "./Tooltip"

export class Underline {
  constructor() {
    this.underlineElements = []
    this.rectCharIndexMapping = []
    this.tooltip = new Tooltip((oldText, newText) => {
      return Underline.findTextDifferences(oldText, newText)
    })
  }

  buildRectCharIndexMapping() {
    let totalCharCount = 0
    let isFirstLine = true
    this.rectCharIndexMapping = []
    const svgElements = document.querySelectorAll(
      "div.kix-canvas-tile-content > svg"
    )
    svgElements.forEach(svgElement => {
      const paragraphs = svgElement.querySelectorAll("g[role='paragraph']")
      paragraphs.forEach(paragraph => {
        const rects = paragraph.querySelectorAll("rect")
        if (rects.length === 0) return
        if (!isFirstLine) {
          totalCharCount += 1
        }
        isFirstLine = false
        rects.forEach((rect, index) => {
          const text = rect.getAttribute("aria-label")
          if (!text) return
          if (index > 0) {
            const prevRect = rects[index - 1]
            if (prevRect) {
              const rect1End =
                parseFloat(prevRect.getAttribute("x")) +
                parseFloat(prevRect.getAttribute("width"))
              const rect2Start = parseFloat(rect.getAttribute("x"))
              const distance = Math.abs(rect1End - rect2Start)
              if (distance >= 0.01) {
                totalCharCount += 1
              }
            }
          }
          this.rectCharIndexMapping.push({
            rectElement: rect,
            text: text,
            startCharIndex: totalCharCount,
            endCharIndex: totalCharCount + text.length,
            svgElement: svgElement,
            paragraph: paragraph
          })
          totalCharCount += text.length
        })
      })
    })
  }

  applyUnderlines(corrections, shouldAnimate, updateAllPills) {
    const tooltip = this.tooltip

    if (!document.querySelector("#enhanced-text-tracker-styles")) {
      const styleSheet = document.createElement("style")
      styleSheet.id = "enhanced-text-tracker-styles"
      styleSheet.textContent = `
        @keyframes underlineDraw {
          from { stroke-dashoffset: 100%; }
          to   { stroke-dashoffset: 0; }
        }
        [data-enhanced-text-tracker="underline-element"].animate line:not(.animated) {
          stroke-dasharray: 100%;
          animation: underlineDraw 2s ease-out forwards;
        }
        [data-enhanced-text-tracker="underline-element"] rect {
          transition: fill 0.3s ease;
        }
        [data-enhanced-text-tracker="underline-element"] line {
          transition: stroke-width 0.3s ease, stroke-opacity 0.3s ease;
        }
      `
      document.head.appendChild(styleSheet)
    }

    const existingUnderlines = new Set()
    this.underlineElements.forEach(el => {
      existingUnderlines.add(`${el.originalText}-${el.error_type}`)
    })

    this.underlineElements = []
    const underlineGroups = new Map()

    const svgElements = document.querySelectorAll("div.kix-canvas-tile-content > svg")
    svgElements.forEach(svgEl => {
      let underlineGroup = svgEl.querySelector('g[data-enhanced-text-tracker="underline-group"]')
      if (!underlineGroup) {
        underlineGroup = document.createElementNS("http://www.w3.org/2000/svg", "g")
        underlineGroup.setAttribute("data-enhanced-text-tracker", "underline-group")
        svgEl.appendChild(underlineGroup)
      }
      while (underlineGroup.firstChild) {
        underlineGroup.removeChild(underlineGroup.firstChild)
      }
    })

    // Rebuild all underlines
    corrections.forEach(correction => {
      const { start, end, corrected_text, error_type, originalText } = correction
      const groupId = `${start}-${end}-${error_type}`
      underlineGroups.set(groupId, { correction, elements: [] })

      const overlappingRects = this.rectCharIndexMapping.filter(
        info => info.startCharIndex < end && info.endCharIndex > start
      )

      overlappingRects.forEach(rectInfo => {
        const rect = rectInfo.rectElement
        const svgElement = rectInfo.svgElement
        const rectX = parseFloat(rect.getAttribute("x"))
        const rectY = parseFloat(rect.getAttribute("y"))
        const rectHeight = parseFloat(rect.getAttribute("height"))
        let transformX = 0
        let transformY = 0
        const transform = rect.getAttribute("transform")
        if (transform) {
          const match = transform.match(/matrix\(.*?,.*?,.*?,.*?,(.*?),(.*?)\)/)
          if (match) {
            transformX = parseFloat(match[1]) || 0
            transformY = parseFloat(match[2]) || 0
          }
        }
        const startX = rectX + transformX
        const startY = rectY + transformY

        const canvas = document.createElement("canvas")
        const context = canvas.getContext("2d")
        const font = window.getComputedStyle(rect).font || "14px Arial"
        context.font = font

        const text = rectInfo.text
        const diffs = Underline.findTextDifferences(originalText, corrected_text)

        const rectStartInOriginal = rectInfo.startCharIndex - start
        const rectEndInOriginal = rectStartInOriginal + text.length

        if (
          rectStartInOriginal <= diffs.oldEnd &&
          rectEndInOriginal >= diffs.oldStart
        ) {
          const diffStartInRect = Math.max(0, diffs.oldStart - rectStartInOriginal)
          const diffEndInRect = Math.min(text.length, diffs.oldEnd - rectStartInOriginal)
          if (diffStartInRect < diffEndInRect) {
            const textBeforeDiff = text.slice(0, diffStartInRect)
            const textDiff = text.slice(diffStartInRect, diffEndInRect)
            const widthBeforeDiff = context.measureText(textBeforeDiff).width
            const widthDiff = context.measureText(textDiff).width
            const x1 = startX + widthBeforeDiff
            const x2 = x1 + widthDiff
            const y1 = startY + rectHeight - 2

            let underlineGroup = svgElement.querySelector(
              'g[data-enhanced-text-tracker="underline-group"]'
            )
            if (!underlineGroup) {
              underlineGroup = document.createElementNS("http://www.w3.org/2000/svg", "g")
              underlineGroup.setAttribute("data-enhanced-text-tracker", "underline-group")
              svgElement.appendChild(underlineGroup)
            }

            const groupElement = document.createElementNS("http://www.w3.org/2000/svg", "g")
            groupElement.setAttribute("data-enhanced-text-tracker", "underline-element")
            if (shouldAnimate) {
              groupElement.classList.add("animate")
            }

            const highlightRect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
            highlightRect.setAttribute("x", x1)
            highlightRect.setAttribute("y", startY)
            highlightRect.setAttribute("width", (x2 - x1).toString())
            highlightRect.setAttribute("height", (rectHeight + 2).toString())
            highlightRect.setAttribute("fill", "rgba(0,0,0,0)")
            highlightRect.setAttribute("pointer-events", "all")

            const line = document.createElementNS("http://www.w3.org/2000/svg", "line")
            line.setAttribute("x1", x1.toString())
            line.setAttribute("y1", y1.toString())
            line.setAttribute("x2", x2.toString())
            line.setAttribute("y2", y1.toString())
            line.setAttribute("stroke", error_type === "Grammar" ? "#FF6347" : "#4682B4")
            line.setAttribute("stroke-width", "2")
            line.setAttribute("stroke-opacity", "0.6")
            line.setAttribute("pointer-events", "none")

            const underlineKey = `${originalText}-${error_type}`
            if (existingUnderlines.has(underlineKey)) {
              line.classList.add("animated")
            }

            groupElement.appendChild(highlightRect)
            groupElement.appendChild(line)
            underlineGroup.appendChild(groupElement)

            const svgRect = svgElement.getBoundingClientRect()
            const boundingRect = {
              left: svgRect.left + x1,
              top: svgRect.top + startY,
              right: svgRect.left + x2,
              bottom: svgRect.top + startY + rectHeight + 2,
              svgElement
            }

            const newEl = {
              rectElement: rect,
              boundingRect,
              highlightRect,
              corrected_text,
              originalText,
              error_type,
              citations: correction.citations,
              defaultColor: "rgba(0, 0, 0, 0)",
              hoverColor:
                error_type === "Grammar"
                  ? "rgba(255, 99, 71, 0.7)"
                  : "rgba(173, 216, 230, 0.7)",
              groupElement,
              groupId,
              diffInfo: {
                start: diffStartInRect,
                end: diffEndInRect,
                originalText: textDiff,
                newText: diffs.newDiff
              }
            }
            this.underlineElements.push(newEl)
            underlineGroups.get(groupId).elements.push(newEl)
          }
        }
      })
    })

    // Attach mousemove logic using this.tooltip
    document.addEventListener("mousemove", e => {
      const mouseX = e.clientX + window.scrollX
      const mouseY = e.clientY + window.scrollY

      let hoveredGroup = null
      let activeElements = []

      const tooltipRect = tooltip.tooltip.getBoundingClientRect()
      const isOverTooltip =
        mouseX >= tooltipRect.left + window.scrollX &&
        mouseX <= tooltipRect.right + window.scrollX &&
        mouseY >= tooltipRect.top + window.scrollY &&
        mouseY <= tooltipRect.bottom + window.scrollY

      if (isOverTooltip && tooltip.currentHoveredElement) {
        hoveredGroup = tooltip.currentHoveredElement.groupId
        activeElements = this.underlineElements.filter(
          el => el.groupId === hoveredGroup
        )
      } else {
        for (const elem of this.underlineElements) {
          const line = elem.groupElement.querySelector("line")
          const svgRect = elem.boundingRect.svgElement.getBoundingClientRect()
          const x1 = svgRect.left + parseFloat(line.getAttribute("x1"))
          const x2 = svgRect.left + parseFloat(line.getAttribute("x2"))
          const y = svgRect.top + parseFloat(line.getAttribute("y1"))
          const height = parseFloat(elem.highlightRect.getAttribute("height"))

          if (
            mouseX >= x1 &&
            mouseX <= x2 &&
            mouseY >= y - height &&
            mouseY <= y + height
          ) {
            hoveredGroup = elem.groupId
            // store these coords if needed
            elem.underlineCoords = {
              x1: parseFloat(line.getAttribute("x1")),
              x2: parseFloat(line.getAttribute("x2")),
              y1: parseFloat(line.getAttribute("y1")),
              y2: parseFloat(line.getAttribute("y2")),
              height: height
            }
            break
          }
        }
        if (hoveredGroup) {
          activeElements = this.underlineElements.filter(
            el => el.groupId === hoveredGroup
          )
        }
      }

      // highlight hovered group
      this.underlineElements.forEach(el => {
        const line = el.groupElement.querySelector("line")
        if (el.groupId === hoveredGroup) {
          el.highlightRect.setAttribute("fill", el.hoverColor)
          line.setAttribute("stroke-width", "3")
          line.setAttribute("stroke-opacity", "1")
          line.setAttribute(
            "stroke",
            el.error_type === "Grammar" ? "#B01030" : "#003C6B"
          )
        } else {
          el.highlightRect.setAttribute("fill", el.defaultColor)
          line.setAttribute("stroke-width", "2")
          line.setAttribute("stroke-opacity", "0.8")
          line.setAttribute(
            "stroke",
            el.error_type === "Grammar" ? "#FF6347" : "#4682B4"
          )
        }
      })

      if (activeElements.length > 0) {
        const firstEl = activeElements[0]
        const r = firstEl.boundingRect
        const viewportHeight = window.innerHeight
        const spaceBelow = viewportHeight - (r.bottom - window.scrollY)
        const tooltipX = (r.left + r.right) / 2
        const tooltipY = spaceBelow > 150
          ? r.bottom
          : r.top - tooltip.tooltip.offsetHeight

        tooltip.showTooltip(hoveredGroup, firstEl, activeElements, tooltipX, tooltipY)
      } else if (!isOverTooltip) {
        tooltip.hideTooltip()
      }
    })

    if (typeof updateAllPills === "function") {
      updateAllPills(corrections.length)
    }
    console.log("[Enhanced Text Tracker] Underlines and event listeners updated.")
  }

  static findTextDifferences(oldText, newText) {
    let start = 0
    let end = 0
    while (
      start < oldText.length &&
      start < newText.length &&
      oldText[start] === newText[start]
    ) {
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

  updateUnderlinePositions() {
    this.buildRectCharIndexMapping()
    this.underlineElements.forEach(element => {
      const originalText = element.originalText
      const documentText = this.rectCharIndexMapping.map(m => m.text).join("")
      let index = -1
      const indices = []
      while ((index = documentText.indexOf(originalText, index + 1)) !== -1) {
        indices.push(index)
      }
      let bestIndex = indices[0]
      let minDistance = Infinity
      const currentX = parseFloat(element.highlightRect.getAttribute("x"))
      indices.forEach(idx => {
        const overlappingRects = this.rectCharIndexMapping.filter(
          rectInfo =>
            rectInfo.startCharIndex <= idx && rectInfo.endCharIndex > idx
        )
        if (overlappingRects.length > 0) {
          const rect = overlappingRects[0]
          const rectX = parseFloat(rect.rectElement.getAttribute("x"))
          const transform = rect.rectElement.getAttribute("transform")
          let transformX = 0
          if (transform) {
            const match = transform.match(
              /matrix\(.*?,.*?,.*?,.*?,(.*?),(.*?)\)/
            )
            if (match) {
              transformX = parseFloat(match[1]) || 0
            }
          }
          const distance = Math.abs(rectX + transformX - currentX)
          if (distance < minDistance) {
            minDistance = distance
            bestIndex = idx
          }
        }
      })
      const overlappingRects = this.rectCharIndexMapping.filter(
        rectInfo =>
          rectInfo.startCharIndex <= bestIndex &&
          rectInfo.endCharIndex > bestIndex
      )
      if (overlappingRects.length > 0) {
        const firstRect = overlappingRects[0]
        const svgElement = firstRect.svgElement
        const canvas = document.createElement("canvas")
        const context = canvas.getContext("2d")
        const font =
          window.getComputedStyle(firstRect.rectElement).font || "14px Arial"
        context.font = font
        const offsetInFirst = bestIndex - firstRect.startCharIndex
        const textBeforeTarget = firstRect.text.substring(0, offsetInFirst)
        const offsetWidth = context.measureText(textBeforeTarget).width
        const rectX = parseFloat(firstRect.rectElement.getAttribute("x"))
        const rectY = parseFloat(firstRect.rectElement.getAttribute("y"))
        const transform = firstRect.rectElement.getAttribute("transform")
        let transformX = 0
        let transformY = 0
        if (transform) {
          const match = transform.match(/matrix\(.*?,.*?,.*?,.*?,(.*?),(.*?)\)/)
          if (match) {
            transformX = parseFloat(match[1]) || 0
            transformY = parseFloat(match[2]) || 0
          }
        }
        const startX = rectX + transformX + offsetWidth
        const startY = rectY + transformY
        const height = parseFloat(firstRect.rectElement.getAttribute("height"))
        const totalWidth = context.measureText(originalText).width
        element.highlightRect.style.transition = "x 0.2s, y 0.2s"
        element.groupElement.querySelector("line").style.transition =
          "x1 0.2s, x2 0.2s, y1 0.2s, y2 0.2s"
        element.highlightRect.setAttribute("x", startX.toString())
        element.highlightRect.setAttribute("y", startY.toString())
        element.highlightRect.setAttribute("width", totalWidth.toString())
        element.highlightRect.setAttribute("height", height.toString())
        const line = element.groupElement.querySelector("line")
        line.setAttribute("x1", startX.toString())
        line.setAttribute("x2", (startX + totalWidth).toString())
        line.setAttribute("y1", (startY + height - 2).toString())
        line.setAttribute("y2", (startY + height - 2).toString())
        const svgRect = svgElement.getBoundingClientRect()
        element.boundingRect = {
          left: svgRect.left + startX,
          top: svgRect.top + startY,
          right: svgRect.left + startX + totalWidth,
          bottom: svgRect.top + startY + height,
          svgElement: svgElement
        }
      }
    })
  }
}
