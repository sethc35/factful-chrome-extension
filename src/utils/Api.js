/* eslint-disable */

export class ApiService {
  static async collectTextFromRects() {
    const svgElements = document.querySelectorAll(
      "div.kix-canvas-tile-content > svg"
    )
    let fullText = ""
    let isFirstLine = true
    svgElements.forEach(svgElement => {
      const lines = svgElement.querySelectorAll("g[role='paragraph']")
      lines.forEach(line => {
        const rects = line.querySelectorAll("rect")
        if (rects.length === 0) return
        if (!isFirstLine) {
          fullText += "\n"
        }
        isFirstLine = false
        let lineText = ""
        rects.forEach((rect, rectIndex) => {
          const text = rect.getAttribute("aria-label") || ""
          if (rectIndex > 0) {
            const prevRect = rects[rectIndex - 1]
            if (!ApiService.areRectsTouching(prevRect, rect)) {
              lineText += " "
            }
          }
          lineText += text
        })
        fullText += lineText
      })
    })
    console.log('full text: ', fullText);
    return fullText.trim()
  }

  static areRectsTouching(rect1, rect2) {
    const rect1End =
      parseFloat(rect1.getAttribute("x")) +
      parseFloat(rect1.getAttribute("width"))
    const rect2Start = parseFloat(rect2.getAttribute("x"))
    const rect2End = rect2Start + parseFloat(rect2.getAttribute("width"))
    const rect1Start = parseFloat(rect1.getAttribute("x"))
    return (
      Math.abs(rect1End - rect2Start) < 0.01 ||
      Math.abs(rect2End - rect1Start) < 0.01
    )
  }

  static async validateAccessToken(accessToken) {
    const response = await fetch(`https://backend.factful.io/verify_access_token`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      console.log('[Authenticator] Invalid/expired access token.')
      return false
    }

    const data = await response.json()

    return data.data
  }

  static async fetchDataFromApi() {
    try {
      const textContent = await ApiService.collectTextFromRects()
      console.log('fetching data now!')
      const query = encodeURIComponent(textContent)
      const response = await fetch(
        `https://backend.factful.io/process_text?input=${query}`,
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
      console.log('get back: ', data);
      return data || {}
    } catch (error) {
      return { error: error.message }
    }
  }

  static findCorrectionsInDocument(apiData, documentText) {
    const corrections = []
    if (!apiData?.corrections?.length) {
      return corrections
    }
    function getAbsolutePosition(rect) {
      const x = parseFloat(rect.getAttribute("x")) || 0
      const y = parseFloat(rect.getAttribute("y")) || 0
      const transform = rect.getAttribute("transform")
      let transformX = 0
      let transformY = 0
      if (transform) {
        const match = transform.match(/matrix\(.*?,.*?,.*?,.*?,(.*?),(.*?)\)/)
        if (match) {
          transformX = parseFloat(match[1]) || 0
          transformY = parseFloat(match[2]) || 0
        }
      }
      return {
        x: x + transformX,
        y: y + transformY,
        width: parseFloat(rect.getAttribute("width")) || 0,
        height: parseFloat(rect.getAttribute("height")) || 0
      }
    }
    function findOverlappingRects(startIndex, endIndex) {
      const overlappingRects = []
      let globalPosition = 0
      const svgElements = document.querySelectorAll(
        "div.kix-canvas-tile-content > svg"
      )
      svgElements.forEach(svg => {
        const paragraphs = svg.querySelectorAll(
          "g[role='paragraph'], g[data-section-type='body']"
        )
        paragraphs.forEach(paragraph => {
          const rects = paragraph.querySelectorAll("rect")
          rects.forEach(rect => {
            const text = rect.getAttribute("aria-label") || ""
            if (!text) return
            const rectEnd = globalPosition + text.length
            if (globalPosition < endIndex && rectEnd > startIndex) {
              const absolutePos = getAbsolutePosition(rect)
              overlappingRects.push({
                rectElement: rect,
                text: text,
                startCharIndex: globalPosition,
                endCharIndex: rectEnd,
                svgElement: svg,
                paragraph: paragraph,
                position: absolutePos
              })
            }
            globalPosition += text.length
          })
        })
      })
      return overlappingRects.sort((a, b) => {
        if (Math.abs(a.position.y - b.position.y) < 1) {
          return a.position.x - b.position.x
        }
        return a.position.y - b.position.y
      })
    }
    for (const correction of apiData.corrections) {
      const original_text = correction.original_text
      const corrected_text = correction.corrected_text
      const error_type = correction.error_type
      const citations = correction.citations
      let index = documentText.indexOf(original_text)
      let startIndex, endIndex
      if (index !== -1) {
        startIndex = index
        endIndex = index + original_text.length
      } else {
        const lowerText = documentText.toLowerCase()
        const lowerOriginal = original_text.toLowerCase()
        const lowerIndex = lowerText.indexOf(lowerOriginal)
        if (lowerIndex !== -1) {
          startIndex = lowerIndex
          endIndex = lowerIndex + original_text.length
        } else {
          continue
        }
      }
      const overlappingRects = findOverlappingRects(startIndex, endIndex)
      if (overlappingRects.length > 0) {
        const correctionObject = {
          start: startIndex,
          end: endIndex,
          corrected_text,
          error_type,
          matchingRects: overlappingRects,
          originalText: original_text
        }
        if (
          error_type === "Factuality" &&
          citations &&
          Array.isArray(citations)
        ) {
          correctionObject.citations = citations
        } else {
          correctionObject.citations = []
        }
        corrections.push(correctionObject)
      }
    }
    return corrections
  }

  static async processCommand(command, parameter) {
    return null
  }
}
