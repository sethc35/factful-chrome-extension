/* eslint-disable */

import { SlashCommand } from "../classes/SlashCommand.js";
import { Tooltip } from "../classes/Tooltip.js";
import { Underline } from "../classes/Underline.js";
import { ApiService } from "../utils/Api.js";

(async function gdocsMain() {
//   const runState = localStorage.getItem("factful-extension-can-run")
//   if (runState === "false") {
//     console.log("[Enhanced Text Tracker] Extension is disabled, exiting.")
//     return
//   }

  const underline = new Underline()
  const tooltip = new Tooltip()
  const slashCommand = new SlashCommand()

  await new Promise(resolve => {
    if (document.readyState === "complete" || document.readyState === "interactive") {
      resolve()
    } else {
      document.addEventListener("DOMContentLoaded", resolve, false)
    }
  })

  const docText = await ApiService.collectTextFromRects()
  const apiData = await ApiService.fetchDataFromApi()
  const corrections = ApiService.findCorrectionsInDocument(apiData, docText)

  // 5) Apply underlines to the doc
  underline.buildRectCharIndexMapping()
  underline.applyUnderlines(corrections, true)

  setupSlashListeners()
  observeDocChanges()

  console.log("[Enhanced Text Tracker] gdocs-main.js init complete.")

  function setupSlashListeners() {
    attachListeners(document)

    const editingIframe = document.querySelector(".docs-texteventtarget-iframe")
    if (editingIframe && editingIframe.contentDocument) {
      attachListeners(editingIframe.contentDocument)
    } else if (editingIframe) {
      editingIframe.addEventListener("load", () => {
        attachListeners(editingIframe.contentDocument)
      })
    }
  }

  function attachListeners(doc) {
    doc.addEventListener("keydown", e => {
      if (e.key === "/" || e.keyCode === 191) {
        console.log("[SlashCommand] Detected slash key")
        const cursor = document.querySelector(".kix-cursor") ||
                       document.querySelector(".docs-text-ui-cursor-blink")
        if (!cursor) return
        const rect = cursor.getBoundingClientRect()
        slashCommand.isActive = true
        slashCommand.currentInput = "/"
        slashCommand.showSlashCommands(rect, "/")
      }
    }, true)

    doc.addEventListener("input", e => {
      if (!slashCommand.isActive) return
      const selection = doc.getSelection()
      if (!selection || !selection.rangeCount) return
      const range = selection.getRangeAt(0)
      const node = range.startContainer
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent
        const position = range.startOffset
        const slashIndex = text.lastIndexOf("/", position)
        if (slashIndex >= 0) {
          const commandText = text.substring(slashIndex, position)
          slashCommand.currentInput = commandText
          const cursor = document.querySelector(".kix-cursor") ||
                         document.querySelector(".docs-text-ui-cursor-blink")
          if (cursor) {
            const rect = cursor.getBoundingClientRect()
            slashCommand.showSlashCommands(rect, commandText)
          }
        } else {
          slashCommand.hideSlashCommandUI()
        }
      }
    }, true)
  }

  function observeDocChanges() {
    const editor = document.querySelector(".kix-appview-editor")
    if (!editor) return

    // const observer = new MutationObserver(mutations => {
    //   let docChanged = false
    //   for (const mut of mutations) {
    //     if (mut.type === "childList" || mut.type === "attributes") {
    //       docChanged = true
    //       break
    //     }
    //   }
    //   if (docChanged) {
    //     console.log("[Enhanced Text Tracker] Document changed, could re-check if needed.")
    //   }
    // })
    // observer.observe(editor, { subtree: true, childList: true, attributes: true })
  }
  
})();
