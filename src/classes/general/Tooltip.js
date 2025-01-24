export class Tooltip {
  constructor() {
      this.tooltipElement = null
      this.errorTypeLabel = null
      this.suggestionText = null
      this.citationsContainer = null
      this.citationsList = null
      this.clickPrompt = null
      this.addStyles()
      this.createTooltip()
  }

  addStyles() {
      const style = document.createElement('style')
      style.textContent = `
          .precise-tooltip {
              position: fixed;
              padding: 12px 16px;
              background-color: #ffffff;
              border: 1px solid #e0e0e0;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
              font-size: 14px;
              font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
              color: #333333;
              z-index: 2147483647;
              display: none;
              transition: opacity 0.5s ease;
              opacity: 0;
              max-width: 300px;
              cursor: pointer;
              pointer-events: auto;
          }
          .precise-tooltip-content {
              display: flex;
              flex-direction: column;
              gap: 8px;
          }
          .precise-tooltip-type {
              font-weight: 600;
              color: #666666;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
          }
          .precise-tooltip-suggestion {
              color: #2196F3;
              font-weight: 500;
              line-height: 1.4;
              word-break: break-word;
          }
          .precise-tooltip-citations {
              margin-top: 8px;
              display: none;
              border-top: 1px solid #e0e0e0;
              padding-top: 8px;
          }
          .precise-tooltip-citations ul {
              margin: 4px 0;
              padding-left: 20px;
              font-size: 12px;
              color: #666666;
              list-style-type: disc;
          }
          .precise-tooltip-citations ul li {
              margin: 4px 0;
              line-height: 1.4;
          }
          .precise-tooltip-citations ul li a {
              color: #2196F3;
              text-decoration: none;
              transition: text-decoration 0.2s ease;
              word-break: break-all;
          }
          .precise-tooltip-citations ul li a:hover {
              text-decoration: underline;
          }
          .precise-tooltip-prompt {
              font-size: 11px;
              color: #999999;
              margin-top: 4px;
              border-top: 1px solid #e0e0e0;
              padding-top: 8px;
          }
          .precise-tooltip::before {
              content: '';
              position: absolute;
              width: 8px;
              height: 8px;
              background: #ffffff;
              border: 1px solid #e0e0e0;
              transform: rotate(45deg);
              z-index: -1;
          }
          .precise-tooltip.tooltip-top::before {
              bottom: -5px;
              left: 50%;
              margin-left: -4px;
              border-top: none;
              border-left: none;
          }
          .precise-tooltip.tooltip-bottom::before {
              top: -5px;
              left: 50%;
              margin-left: -4px;
              border-bottom: none;
              border-right: none;
          }
          @keyframes tooltipFadeIn {
              from { opacity: 0; transform: translateY(5px); }
              to { opacity: 1; transform: translateY(0); }
          }
          .precise-tooltip.animate-in {
              animation: tooltipFadeIn 0.2s ease-out forwards;
          }
      `
      document.head.appendChild(style)
  }

  createTooltip() {
      this.tooltipElement = document.createElement('div')
      this.tooltipElement.className = 'precise-tooltip'
      this.tooltipElement.style.position = 'fixed'
      this.tooltipElement.style.zIndex = '2147483647'

      const content = document.createElement('div')
      content.className = 'precise-tooltip-content'

      this.errorTypeLabel = document.createElement('div')
      this.errorTypeLabel.className = 'precise-tooltip-type'

      this.suggestionText = document.createElement('div')
      this.suggestionText.className = 'precise-tooltip-suggestion'

      this.citationsContainer = document.createElement('div')
      this.citationsContainer.className = 'precise-tooltip-citations'

      this.citationsList = document.createElement('ul')

      this.clickPrompt = document.createElement('div')
      this.clickPrompt.className = 'precise-tooltip-prompt'
      this.clickPrompt.textContent = 'Click to apply suggestion'

      this.citationsContainer.appendChild(this.citationsList)
      content.appendChild(this.errorTypeLabel)
      content.appendChild(this.suggestionText)
      content.appendChild(this.citationsContainer)
      content.appendChild(this.clickPrompt)
      this.tooltipElement.appendChild(content)
      document.body.appendChild(this.tooltipElement)
  }

  getElement() {
      return this.tooltipElement
  }

  showTooltip(boundingRect, errorType, correctedText, citations) {
      this.tooltipElement.style.display = 'block'
      const viewportHeight = window.innerHeight
      const viewportWidth = window.innerWidth
      const scrollY = window.scrollY
      const tooltipHeight = this.tooltipElement.offsetHeight
      const tooltipWidth = this.tooltipElement.offsetWidth
      let tooltipX = boundingRect.left + (boundingRect.right - boundingRect.left) / 2
      let tooltipY
      tooltipX = Math.min(Math.max(tooltipWidth / 2 + 10, tooltipX), viewportWidth - (tooltipWidth / 2 + 10))
      const spaceBelow = viewportHeight - (boundingRect.bottom - scrollY)
      const spaceAbove = boundingRect.top - scrollY
      if (spaceBelow >= tooltipHeight + 10) {
          tooltipY = boundingRect.bottom + 8
          this.tooltipElement.classList.remove('tooltip-top')
          this.tooltipElement.classList.add('tooltip-bottom')
      } else if (spaceAbove >= tooltipHeight + 10) {
          tooltipY = boundingRect.top - tooltipHeight - 8
          this.tooltipElement.classList.remove('tooltip-bottom')
          this.tooltipElement.classList.add('tooltip-top')
      } else {
          if (spaceBelow >= spaceAbove) {
              tooltipY = viewportHeight - tooltipHeight - 10
              this.tooltipElement.classList.remove('tooltip-top')
              this.tooltipElement.classList.add('tooltip-bottom')
          } else {
              tooltipY = 10
              this.tooltipElement.classList.remove('tooltip-bottom')
              this.tooltipElement.classList.add('tooltip-top')
          }
      }
      this.errorTypeLabel.textContent = (errorType || 'Unknown') + ' Error'
      this.suggestionText.textContent = correctedText || ''
      if (errorType === 'Factuality' && citations && citations.length > 0) {
          this.citationsList.innerHTML = ''
          citations.forEach(citation => {
              const li = document.createElement('li')
              const link = document.createElement('a')
              link.href = citation
              link.textContent = citation
              link.target = '_blank'
              li.appendChild(link)
              this.citationsList.appendChild(li)
          })
          this.citationsContainer.style.display = 'block'
      } else {
          this.citationsContainer.style.display = 'none'
      }
      this.tooltipElement.style.opacity = '0'
      this.tooltipElement.style.left = tooltipX - tooltipWidth / 2 + 'px'
      this.tooltipElement.style.top = tooltipY + 'px'
      this.tooltipElement.offsetHeight
      this.tooltipElement.classList.add('animate-in')
      this.tooltipElement.style.opacity = '1'
  }

  hideTooltip() {
      this.tooltipElement.style.opacity = '0'
      setTimeout(() => {
          if (this.tooltipElement.style.opacity === '0') {
              this.tooltipElement.style.display = 'none'
          }
      }, 250)
  }
}
