export function initializeGDocsTracker() {
  window._docs_annotate_canvas_by_ext = "kbfnbcaeplbcioakkpcpgfkobkghlhen";

  function createAuthForm() {
    const formContainer = document.createElement('div');
    formContainer.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      z-index: 10000;
    `;

    const trustedHTML = new TrustedHTML(`
      <h2 style="margin-bottom: 20px;">Sign In</h2>
      <form id="auth-form">
        <div style="margin-bottom: 15px;">
          <input type="email" id="email" placeholder="Email" style="
            width: 100%;
            padding: 8px;
            margin-bottom: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
          ">
        </div>
        <div style="margin-bottom: 15px;">
          <input type="password" id="password" placeholder="Password" style="
            width: 100%;
            padding: 8px;
            margin-bottom: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
          ">
        </div>
        <button type="submit" style="
          width: 100%;
          padding: 10px;
          background: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        ">Sign In</button>
        <button type="button" id="google-signin" style="
          width: 100%;
          padding: 10px;
          margin-top: 10px;
          background: #fff;
          color: #757575;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
        ">Sign in with Google</button>
      </form>
    `);

    formContainer.setHTML(trustedHTML);
    return formContainer;
  }

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
    let accessToken = null;
    let apiData = await ApiService.fetchDataFromApi(accessToken);
    let corrections = [];
    {
      const docText = await ApiService.collectTextFromRects();
      corrections = ApiService.findCorrectionsInDocument(apiData, docText);
      underline.buildRectCharIndexMapping();
      underline.applyUnderlines(corrections, true);
    }

    function authenticateUser() {
      console.log("[Authenticator] Retrieving access token...");

      window.postMessage({ action: 'getFactfulAccessToken' }, '*');
    };

    window.addEventListener('message', function(event) {
      if (event.data.type && event.data.type === 'factfulAccessToken') {
        console.log("[Authenticator] Validation response recieved...", event.data.payload);

        if (event.data.payload.error) {
          accessToken = null;
          
          console.log("[Authenticator] Access token is invalid/expired.");
        } else {
          accessToken = event.data.payload.accessToken;

          console.log("[Authenticator] User is signed in.");
        }
      }
    });

    const singlePill = new Pill(corrections.length, corrections, {
      findTextDifferences: Underline.findTextDifferences,
      getUnderlineElements: () => underline.underlineElements,
      handleCorrection: async (correction) => {
        try {
          const textEventIframe = document.querySelector('.docs-texteventtarget-iframe');
          const contentDiv = textEventIframe.contentDocument.querySelector('div[aria-label="Document content"]');

          const matchingUnderline = underline.underlineElements.find(el => 
            el.originalText === correction.originalText && 
            el.error_type === correction.error_type
          );

          if (!matchingUnderline) {
            console.error('No matching underline found for correction');
            return;
          }

          const line = matchingUnderline.groupElement.querySelector('line');
          const svgRect = matchingUnderline.boundingRect.svgElement.getBoundingClientRect();
          const x1 = svgRect.left + parseFloat(line.getAttribute('x1'));
          const x2 = svgRect.left + parseFloat(line.getAttribute('x2'));
          const y = svgRect.top + parseFloat(line.getAttribute('y1'));

          const tileManager = document.querySelector('.kix-rotatingtilemanager-content');
          tileManager.dispatchEvent(new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
            clientX: x1,
            clientY: y
          }));
          tileManager.dispatchEvent(new MouseEvent('mousemove', {
            bubbles: true,
            cancelable: true,
            clientX: x2,
            clientY: y
          }));
          tileManager.dispatchEvent(new MouseEvent('mouseup', {
            bubbles: true,
            cancelable: true,
            clientX: x2,
            clientY: y
          }));

          await new Promise(r => setTimeout(r, 50));
          document.execCommand('delete');
          await new Promise(r => setTimeout(r, 50));

          const differences = Underline.findTextDifferences(
            correction.originalText,
            correction.corrected_text
          );

          const clipboardData = new DataTransfer();
          clipboardData.setData('text/plain', differences.newDiff);
          contentDiv.dispatchEvent(new ClipboardEvent('paste', {
            bubbles: true,
            cancelable: true,
            clipboardData
          }));

        } catch (error) {
          console.error('Error in handleCorrection:', error);
          throw error;
        }
      },
      handleHighlight: (correction, isHovering) => {
        const matchingUnderlines = underline.underlineElements.filter(el => 
          el.originalText === correction.originalText && 
          el.error_type === correction.error_type
        );

        matchingUnderlines.forEach(el => {
          const groupElement = el.groupElement;
          const highlightRect = groupElement.querySelector('rect');
          const line = groupElement.querySelector('line');

          if (isHovering) {
            const hoverColor = el.error_type === 'Grammar' 
              ? 'rgba(255, 99, 71, 0.7)' 
              : 'rgba(173, 216, 230, 0.7)';

            highlightRect.setAttribute('fill', hoverColor);
            line.setAttribute('stroke-width', '3');
            line.setAttribute('stroke-opacity', '1');
            line.setAttribute('stroke', el.error_type === 'Grammar' 
              ? '#B01030' 
              : '#003C6B'
            );

            el.isHovered = true;
          } else {
            highlightRect.setAttribute('fill', el.defaultColor);
            
            line.setAttribute('stroke-width', '2');
            line.setAttribute('stroke-opacity', '0.8');
            line.setAttribute('stroke', el.error_type === 'Grammar' 
              ? '#FF6347' 
              : '#4682B4'
            );

            el.isHovered = false;
          }
        });
      }
    });

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
        if (!accessToken) {
          console.log("[Enhanced Text Tracker] User is not signed in.");

          authenticateUser();

          return;
        }

        const freshText = await ApiService.collectTextFromRects();
        const newApiData = await ApiService.fetchDataFromApi(accessToken);

        if (newApiData.error === "Unauthorized") {
          console.log("[Enhanced Text Tracker] Access token is invalid/expired.");

          accessToken = null;
          authenticateUser();

          return;
        }

        apiData = newApiData;
        const newCorrections = ApiService.findCorrectionsInDocument(apiData, freshText);
        underline.buildRectCharIndexMapping();
        underline.applyUnderlines(newCorrections, true);
        corrections = newCorrections;
        singlePill.updateCorrections(corrections.length, corrections);
      }, 1000);

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