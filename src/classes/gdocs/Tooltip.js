export class Tooltip {
  constructor(findTextDifferencesCallback) {
    this.findTextDifferencesCallback = findTextDifferencesCallback
    this.tooltip = document.createElement("div")
    this.tooltip.style.position = "absolute"
    this.tooltip.style.padding = "12px 16px"
    this.tooltip.style.backgroundColor = "#ffffff"
    this.tooltip.style.border = "1px solid #e0e0e0"
    this.tooltip.style.borderRadius = "8px"
    this.tooltip.style.boxShadow =
      "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)"
    this.tooltip.style.fontSize = "14px"
    this.tooltip.style.fontFamily =
      "'Segoe UI', system-ui, -apple-system, sans-serif"
    this.tooltip.style.color = "#333333"
    this.tooltip.style.zIndex = "1000"
    this.tooltip.style.display = "none"
    this.tooltip.style.transition = "opacity 0.5s ease"
    this.tooltip.style.opacity = "0"
    this.tooltip.style.maxWidth = "300px"
    this.tooltip.style.cursor = "pointer"

    const tooltipContent = document.createElement("div")
    tooltipContent.style.display = "flex"
    tooltipContent.style.flexDirection = "column"
    tooltipContent.style.gap = "8px"

    this.errorTypeLabel = document.createElement("div")
    this.errorTypeLabel.style.fontWeight = "600"
    this.errorTypeLabel.style.color = "#666666"
    this.errorTypeLabel.style.fontSize = "12px"
    this.errorTypeLabel.style.textTransform = "uppercase"
    this.errorTypeLabel.style.letterSpacing = "0.5px"

    this.suggestionText = document.createElement("div")
    this.suggestionText.style.color = "#2196F3"
    this.suggestionText.style.fontWeight = "500"

    this.citationsContainer = document.createElement("div")
    this.citationsContainer.style.marginTop = "8px"
    this.citationsContainer.style.display = "none"

    this.citationsList = document.createElement("ul")
    this.citationsList.style.margin = "4px 0"
    this.citationsList.style.paddingLeft = "20px"
    this.citationsList.style.fontSize = "12px"
    this.citationsList.style.color = "#666666"
    this.citationsList.style.listStyleType = "disc"

    this.citationsContainer.appendChild(this.citationsList)

    this.clickPrompt = document.createElement("div")
    this.clickPrompt.style.fontSize = "11px"
    this.clickPrompt.style.color = "#999999"
    this.clickPrompt.style.marginTop = "4px"
    this.clickPrompt.textContent = "Click to apply suggestion"

    tooltipContent.appendChild(this.errorTypeLabel)
    tooltipContent.appendChild(this.suggestionText)
    tooltipContent.appendChild(this.citationsContainer)
    tooltipContent.appendChild(this.clickPrompt)

    this.tooltip.appendChild(tooltipContent)

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        document.body.appendChild(this.tooltip);
      });
    } else {
      document.body.appendChild(this.tooltip);
    }

    this.currentHoveredElement = null
    this.tooltip.addEventListener("click", async () => {
      if (!this.currentHoveredElement) return
      try {
        const textEventIframe = document.querySelector(
          ".docs-texteventtarget-iframe"
        )
        const contentDiv = textEventIframe.contentDocument.querySelector(
          'div[aria-label="Document content"]'
        )
        const firstElement = this.currentHoveredElement.elements[0]
        const line = firstElement.groupElement.querySelector("line")
        const svgRect = firstElement.boundingRect.svgElement.getBoundingClientRect()
        const x1 = svgRect.left + parseFloat(line.getAttribute("x1"))
        const x2 = svgRect.left + parseFloat(line.getAttribute("x2"))
        const y = svgRect.top + parseFloat(line.getAttribute("y1"))
        const tileManager = document.querySelector(
          ".kix-rotatingtilemanager-content"
        )
        tileManager.dispatchEvent(
          new MouseEvent("mousedown", {
            bubbles: true,
            cancelable: true,
            clientX: x1,
            clientY: y
          })
        )
        tileManager.dispatchEvent(
          new MouseEvent("mousemove", {
            bubbles: true,
            cancelable: true,
            clientX: x2,
            clientY: y
          })
        )
        tileManager.dispatchEvent(
          new MouseEvent("mouseup", {
            bubbles: true,
            cancelable: true,
            clientX: x2,
            clientY: y
          })
        )
        await new Promise(r => setTimeout(r, 50))
        document.execCommand("delete")
        await new Promise(r => setTimeout(r, 50))
        const differences = this.findTextDifferencesCallback(
          this.currentHoveredElement.originalText,
          this.currentHoveredElement.corrected_text
        )
        const clipboardData = new DataTransfer()
        clipboardData.setData("text/plain", differences.newDiff)
        contentDiv.dispatchEvent(
          new ClipboardEvent("paste", {
            bubbles: true,
            cancelable: true,
            clipboardData
          })
        )
        this.tooltip.style.opacity = "0"
        setTimeout(() => {
          this.tooltip.style.display = "none"
          this.currentHoveredElement = null
        }, 500)
      } catch (error) {
        console.error("Error during tooltip click handler:", error)
      }
    })
  }

  showTooltip(groupId, firstElement, activeElements, tooltipX, tooltipY) {
    this.currentHoveredElement = {
      ...firstElement,
      elements: activeElements,
      groupId: groupId,
      error_type: firstElement.error_type,
      corrected_text: firstElement.corrected_text,
      originalText: firstElement.originalText,
      citations: firstElement.citations
    }
    this.errorTypeLabel.textContent = `${firstElement.error_type} Error`
    this.suggestionText.textContent = firstElement.corrected_text
    if (
      firstElement.error_type === "Factuality" &&
      firstElement.citations?.length > 0
    ) {
      while (this.citationsList.firstChild) {
        this.citationsList.removeChild(this.citationsList.firstChild)
      }
      firstElement.citations.forEach(citation => {
        const li = document.createElement("li")
        const link = document.createElement("a")
        link.href = citation
        link.textContent = citation
        link.style.color = "#2196F3"
        link.style.textDecoration = "none"
        link.target = "_blank"
        link.addEventListener("mouseover", () => {
          link.style.textDecoration = "underline"
        })
        link.addEventListener("mouseout", () => {
          link.style.textDecoration = "none"
        })
        li.appendChild(link)
        this.citationsList.appendChild(li)
      })
      this.citationsContainer.style.display = "block"
    } else {
      this.citationsContainer.style.display = "none"
    }
    if (this.tooltip.style.display === "none") {
      this.tooltip.style.display = "block"
      this.tooltip.offsetHeight
    }
    this.tooltip.style.opacity = "1"
    this.tooltip.style.left = `${tooltipX - this.tooltip.offsetWidth / 2}px`
    this.tooltip.style.top = `${tooltipY}px`
  }

  hideTooltip() {
    this.tooltip.style.opacity = "0"
    setTimeout(() => {
      if (!this.currentHoveredElement) {
        this.tooltip.style.display = "none"
      }
    }, 500)
  }
}
