/* eslint-disable */

import { SlashCommand } from "./SlashCommand.js";
import { Tooltip } from "./Tooltip.js";
import { Underline } from "./Underline.js";

(() => {
  function initializeExtension() {
    const slashCommand = new SlashCommand();
    const tooltip = new Tooltip();
    const underline = new Underline(tooltip);
    document.addEventListener("DOMContentLoaded", () => {
      const observer = new MutationObserver(() => {
        if (!underline.activeElement) return;
        underline.updateUnderlinePositions();
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true
      });
      document.addEventListener("input", e => {
        if (e.target.matches('input[type="text"], textarea, [contenteditable="true"]')) {
          if (underline.activeElement !== e.target) {
            underline.clearUnderlines(underline.activeElement);
            underline.activeElement = e.target;
          }
        }
      });
      document.addEventListener("mousemove", e => {
        const elements = document.elementsFromPoint(e.clientX, e.clientY);
        const underlineElement = elements.find(el => el.classList && el.classList.contains("precise-underline"));
        if (underlineElement && underline.activeElement) {
          const correctionId = underlineElement.dataset.correctionId;
          if (!underline.hoveredUnderline || underline.hoveredUnderline.dataset.correctionId !== correctionId) {
            if (underline.hoveredUnderline) {
              underline.removeHoverEffect(underline.hoveredUnderline);
            }
            underline.hoveredUnderline = underlineElement;
            underline.addHoverEffect(underlineElement);
            const group = underline.underlines.get(underline.activeElement)?.find(g => g.correctionId === correctionId);
            if (group) {
              tooltip.showTooltip(
                {
                  errorType: group.errorType,
                  correctedText: group.correctedText,
                  citations: group.citations,
                  correctionId: group.correctionId
                },
                group.boundingRect
              );
            }
          }
        } else {
          const b = tooltip.tooltip.getBoundingClientRect();
          if (
            e.clientX < b.left - 5 ||
            e.clientX > b.right + 5 ||
            e.clientY < b.top - 5 ||
            e.clientY > b.bottom + 5
          ) {
            if (underline.hoveredUnderline) {
              underline.removeHoverEffect(underline.hoveredUnderline);
              underline.hoveredUnderline = null;
            }
            tooltip.hideTooltip();
          }
        }
      });
      document.addEventListener("keydown", e => {
        if (e.key === "/" || e.keyCode === 191) {
          const cursor = document.querySelector(".kix-cursor") || document.querySelector(".docs-text-ui-cursor-blink");
          if (!cursor) return;
          const rect = cursor.getBoundingClientRect();
          slashCommand.isActive = true;
          slashCommand.currentInput = "/";
          slashCommand.showSlashCommands({ left: rect.left, top: rect.top, bottom: rect.bottom, right: rect.right }, "/");
        }
      });
      document.addEventListener("input", e => {
        if (!slashCommand.isActive) return;
        const selection = document.getSelection();
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
              slashCommand.showSlashCommands({ left: rect.left, top: rect.top, bottom: rect.bottom, right: rect.right }, cmdText);
            }
          } else {
            slashCommand.hideSlashCommandUI();
          }
        }
      });
    });
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    initializeExtension();
  } else {
    document.addEventListener("DOMContentLoaded", initializeExtension);
  }
})();
