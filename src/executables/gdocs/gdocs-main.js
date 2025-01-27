/* eslint-disable no-unused-vars */ 

export function initializeGDocsTracker() {
  window._docs_annotate_canvas_by_ext = "kbfnbcaeplbcioakkpcpgfkobkghlhen";

  function waitForEditorReady(callback) {
    const observer = new MutationObserver(() => {
      const editor = document.querySelector(".kix-appview-editor");
      if (editor) {
        observer.disconnect();
        callback();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function deferExecution() {
    if (document.readyState === "complete" || document.readyState === "interactive") {
      waitForEditorReady(runMainScript);
    } else {
      document.addEventListener("DOMContentLoaded", () => {
        waitForEditorReady(runMainScript);
      });
    }
  }

  async function runMainScript() {
    console.log("[Enhanced Text Tracker] Initializing...");

    const [
      { SlashCommand },
      { Underline },
      { ApiService },
      { debounce },
      { Pill }
    ] = await Promise.all([
      import("../../classes/gdocs/SlashCommand.js"),
      import("../../classes/gdocs/Underline.js"),
      import("../../utils/Api.js"),
      import("../../utils/debounce.js"),
      import("../../classes/gdocs/Pill.js")
    ]);

    const underline = new Underline();
    const slashCommand = new SlashCommand();
    let apiData = await ApiService.fetchDataFromApi();
    let corrections = [];
    {
      const docText = await ApiService.collectTextFromRects();
      corrections = ApiService.findCorrectionsInDocument(apiData, docText);
      underline.buildRectCharIndexMapping();
      underline.applyUnderlines(corrections, true);
    }
    const singlePill = new Pill(corrections.length, corrections);

    setupSlashListeners();
    observeDocChanges();

    console.log("[Enhanced Text Tracker] gdocs-main.js init complete.");

    function setupSlashListeners() {
      attachListeners(document);
      const editingIframe = document.querySelector(".docs-texteventtarget-iframe");
      if (editingIframe) {
        if (editingIframe.contentDocument) {
          attachListeners(editingIframe.contentDocument);
        } else {
          editingIframe.addEventListener("load", () => {
            attachListeners(editingIframe.contentDocument);
          });
        }
      }
    }

    function attachListeners(doc) {
      doc.addEventListener("keydown", e => {
        if (e.key === "/" || e.keyCode === 191) {
          const cursor = document.querySelector(".kix-cursor") || document.querySelector(".docs-text-ui-cursor-blink");
          if (!cursor) return;
          const rect = cursor.getBoundingClientRect();
          slashCommand.isActive = true;
          slashCommand.currentInput = "/";
          slashCommand.showSlashCommands(rect, "/");
        }
      }, true);

      doc.addEventListener("input", e => {
        if (!slashCommand.isActive) return;
        const selection = doc.getSelection();
        if (!selection || !selection.rangeCount) return;
        const range = selection.getRangeAt(0);
        const node = range.startContainer;
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent;
          const slashIndex = text.lastIndexOf("/", range.startOffset);
          if (slashIndex >= 0) {
            const cmdText = text.substring(slashIndex, range.startOffset);
            slashCommand.currentInput = cmdText;
            const cursor = document.querySelector(".kix-cursor") || document.querySelector(".docs-text-ui-cursor-blink");
            if (cursor) {
              const rect = cursor.getBoundingClientRect();
              slashCommand.showSlashCommands(rect, cmdText);
            }
          } else {
            slashCommand.hideSlashCommandUI();
          }
        }
      }, true);
    }

    function observeDocChanges() {
      const editor = document.querySelector(".kix-appview-editor");
      if (!editor) {
        return;
      }
      let previousCorrections = new Set();
      const debouncedApiUpdate = debounce(async () => {
        const freshText = await ApiService.collectTextFromRects();
        const newApiData = await ApiService.fetchDataFromApi();
        apiData = newApiData;
        const newCorrections = ApiService.findCorrectionsInDocument(apiData, freshText);
        underline.buildRectCharIndexMapping();
        underline.applyUnderlines(newCorrections, true);
        corrections = newCorrections;
        singlePill.updateCorrections(corrections.length, corrections);
      }, 2000);

      async function reapplyUnderlines(animate = false) {
        const docText = await ApiService.collectTextFromRects();
        const newCorrections = ApiService.findCorrectionsInDocument(apiData, docText);
        const keysNow = new Set(newCorrections.map(c => `${c.originalText}-${c.error_type}`));
        const shouldAnimate = animate || newCorrections.some(c => !previousCorrections.has(`${c.originalText}-${c.error_type}`));
        previousCorrections = keysNow;
        corrections = newCorrections;
        underline.buildRectCharIndexMapping();
        underline.applyUnderlines(corrections, shouldAnimate);
        singlePill.updateCorrections(corrections.length, corrections);
      }

      const observer = new MutationObserver(mutations => {
        let docChanged = false;
        let positionChanged = false;
        let textChanged = false;
        let lastAddedText = "";
        let iframeAdded = false;
        for (const mutation of mutations) {
          if (mutation.target instanceof Element && mutation.target.closest("[data-enhanced-text-tracker]")) {
            continue;
          }
          if (mutation.type === "attributes" && ["x", "y", "transform"].includes(mutation.attributeName) && mutation.target.tagName.toLowerCase() === "rect") {
            positionChanged = true;
          }
          if (mutation.type === "characterData") {
            textChanged = true;
            lastAddedText = mutation.target.textContent;
          }
          if (mutation.type === "childList" && (mutation.addedNodes.length || mutation.removedNodes.length)) {
            docChanged = true;
            mutation.addedNodes.forEach(node => {
              if (node.nodeType === Node.TEXT_NODE) {
                textChanged = true;
                lastAddedText = node.textContent;
              }
              if (node instanceof Element && node.classList && node.classList.contains("docs-texteventtarget-iframe")) {
                iframeAdded = true;
              }
            });
          }
        }
        if (iframeAdded) {
          const editingIframe = document.querySelector(".docs-texteventtarget-iframe");
          if (editingIframe) {
            if (editingIframe.contentDocument) {
              attachListeners(editingIframe.contentDocument);
            } else {
              editingIframe.addEventListener("load", () => {
                attachListeners(editingIframe.contentDocument);
              });
            }
          }
        }
        if (textChanged && lastAddedText.includes("/")) {
          const cursor = document.querySelector(".kix-cursor") || document.querySelector(".docs-text-ui-cursor-blink");
          if (cursor) {
            const rect = cursor.getBoundingClientRect();
            slashCommand.isActive = true;
            slashCommand.currentInput = "/";
            slashCommand.showSlashCommands(rect, "/");
          }
        }
        if (textChanged && slashCommand.isActive) {
          const cursor = document.querySelector(".kix-cursor") || document.querySelector(".docs-text-ui-cursor-blink");
          if (cursor) {
            const rect = cursor.getBoundingClientRect();
            const slashPos = lastAddedText.lastIndexOf("/");
            if (slashPos >= 0) {
              const partialCmd = lastAddedText.substring(slashPos);
              slashCommand.currentInput = partialCmd;
              slashCommand.showSlashCommands(rect, partialCmd);
            }
          }
        }
        if (positionChanged) {
          requestAnimationFrame(() => {
            underline.updateUnderlinePositions();
            if (slashCommand.isActive) {
              const cursor = document.querySelector(".kix-cursor") || document.querySelector(".docs-text-ui-cursor-blink");
              if (cursor) {
                const rect = cursor.getBoundingClientRect();
                slashCommand.slashCommandUI.style.left = `${rect.left}px`;
                slashCommand.slashCommandUI.style.top = `${rect.bottom + 5}px`;
              }
            }
          });
        }
        if (docChanged) {
          requestAnimationFrame(async () => {
            await reapplyUnderlines(false);
            debouncedApiUpdate();
          });
        }
      });
      observer.observe(editor, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
        characterDataOldValue: true,
        attributeFilter: ["x", "y", "transform", "aria-label"]
      });
    }
  }

  deferExecution();
}
