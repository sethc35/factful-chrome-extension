/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

import getCaretCoordinates from "textarea-caret";

export class ChatWindow {
  constructor() {
    const styleTag = document.createElement("style");
    styleTag.textContent = `
      .chat-window {
        position: fixed;
        display: none;
        z-index: 10000;
        width: 540px;
        background-color: #fff;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        overflow: hidden;
        font-family: "Arial", sans-serif;
      }
      .chat-header {
        background-color: #f8f8f8;
        padding: 14px 16px;
        border-bottom: 1px solid #e0e0e0;
        cursor: move;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .chat-header svg {
        flex-shrink: 0;
      }
      .chat-header h3 {
        font-size: 16px;
        color: #05003C;
        margin: 0;
        font-weight: 600;
        user-select: none;
      }
      .chat-body {
        padding: 16px;
        overflow-y: auto;
      }
      .enhancements-section {
        margin-bottom: 2rem;
      }
      .enhancements-section h4 {
        display: flex;
        align-items: center;
        font-size: 1rem;
        font-weight: 600;
        margin: 0 0 4px;
        color: #05003C;
        gap: 8px;
      }
      .enhancements-section p {
        font-size: 12px;
        color: #71717a;
        margin: 0 0 12px;
      }
      .quick-actions-container {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .quick-actions-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      .quick-action-button,
      .translate-button {
        flex: 1;
        min-width: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        width: 100%;
        padding: 8px 12px;
        font-size: 12px;
        font-weight: 500;
        color: #9ca3af;
        background-color: #f3f4f6;
        border: none;
        border-radius: 8px;
        transition: background-color 0.3s, color 0.3s, opacity 0.3s;
        cursor: not-allowed;
        opacity: 0.5;
      }
      .quick-action-button.enabled,
      .translate-button.enabled {
        color: #0177FC;
        background-color: #D2E7FE;
        cursor: pointer;
        opacity: 1;
      }
      .quick-action-button.enabled:hover,
      .translate-button.enabled:hover {
        background-color: rgba(173, 216, 250, 0.5);
      }
      .translate-row {
        margin-top: 4px;
        display: flex;
        gap: 8px;
        align-items: flex-start;
      }
      .translate-row select {
        flex: 1;
        min-width: 0;
        padding: 8px;
        font-size: 12px;
        border-radius: 8px;
        border: 1px solid #ccc;
      }
      .research-section {
        margin-top: 32px;
      }
      .research-section h4 {
        display: flex;
        align-items: center;
        font-size: 1rem;
        font-weight: 600;
        margin: 0 0 4px;
        color: #05003C;
        gap: 8px;
      }
      .research-section p {
        font-size: 12px;
        color: #71717a;
        margin: 0 0 12px;
      }
      .research-input-wrapper {
        color: #000 !important;
        background-color: #fff;
        position: relative;
      }
      .research-input-wrapper input {
        width: 92.5%;
        padding: 8px 20px 8px 20px;
        font-size: 12px;
        color: #4b5563;
        border: 1px solid rgba(0, 0, 0, 0.2);
        border-radius: 8px;
        outline: none;
        transition: box-shadow 0.2s, border-color 0.2s;
      }
      .research-input-wrapper input:focus {
        border-color: #0177FC;
        box-shadow: 0 0 0 2px rgba(1, 119, 252, 0.2);
      }
      .research-input-wrapper .search-icon {
        position: absolute;
        top: 50%;
        left: 8px;
        transform: translateY(-50%);
        width: 16px;
        height: 16px;
        color: #0177FC;
      }
      .icon-star {
        width: 20px;
        height: 20px;
        stroke: #05003C;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
        fill: none;
      }
      .icon-search {
        width: 20px;
        height: 20px;
        stroke: currentColor;
        fill: none;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
      .factful-caret {
        position: absolute;
        width: 8px;
        height: 8px;
        pointer-events: none;
        z-index: 999999;
        display: none;
      }
      .custom-selection-highlight {
        position: absolute;
        background: rgba(1, 119, 252, 0.15);
        pointer-events: none;
        border-radius: 2px;
        z-index: 999998;
      }
      .highlight-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 999900;
      }
      .highlight-rect {
        position: absolute;
        background: rgba(1, 119, 252, 0.15);
        pointer-events: none;
        border-radius: 2px;
      }
      .close-button {
        position: absolute;
        right: 16px;
        top: 5%;
        transform: translateY(-50%);
        width: 20px;
        height: 20px;
        border: none;
        background: none;
        cursor: pointer;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #666;
    }

    .close-button:hover {
        color: #000;
    }
    .search-button {
        min-width: 36px;
        height: 36px;
        padding: 8px;
        border: none;
        border-radius: 8px;
        background-color: #0177FC;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s;
    }

    .search-button:hover {
        background-color: #0156b3;
    }

    .search-results {
        margin-top: 16px;
        border-top: 1px solid #e0e0e0;
    }
    .search-button.disabled {
        background-color: #e0e0e0;
        cursor: not-allowed;
        opacity: 0.7;
    }

    .search-button.disabled svg {
        stroke: #999;
    }
    .tab-container {
      display: flex;
      border-bottom: 1px solid #e0e0e0;
      background-color: #f8f8f8;
    }

    .tab {
      padding: 12px 24px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      color: #71717a;
      border-bottom: 2px solid transparent;
      transition: all 0.2s ease;
    }

    .tab.active {
      color: #0177FC;
      border-bottom-color: #0177FC;
    }

    .tab-content {
      display: none;
    }

    .tab-content.active {
      display: block;
    }

    .compose-section {
      padding: 16px;
      width: 100%;
      box-sizing: border-box;
    }

    .compose-textarea {
      width: 100%;
      height: 150px;
      padding: 12px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      resize: vertical;
      font-family: inherit;
      font-size: 14px;
      line-height: 1.5;
      margin-bottom: 12px;
      box-sizing: border-box;
    }

    .suggestion-container {
      display: flex;
      flex-direction: column;
      height: 200px; /* Fixed height */
      margin: 16px 0;
    }

    .suggestion-text {
      flex: 1;
      overflow-y: auto;
      padding-bottom: 16px;
      font-size: 14px;
      color: #333;
    }

    .suggestion-buttons {
      display: flex;
      gap: 10px;
      padding-top: 10px;
      background: white;
      border-top: 1px solid #e0e0e0;
    }

    .compose-button {
      background-color: #0177FC;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 8px 16px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .compose-button:hover {
      background-color: #0156b3;
    }
    `;
    document.head.appendChild(styleTag);

    this.chatWindow = document.createElement("div");
    this.chatWindow.classList.add("chat-window");

    const header = document.createElement("div");
    header.classList.add("chat-header");
    const starIcon = document.createElement("svg");
    starIcon.setAttribute("viewBox", "0 0 24 24");
    starIcon.classList.add("icon-star");
    const starPolygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    starPolygon.setAttribute("points", "12 .587 15.09 7.829 23 9.339 17.55 14.454 19.18 22.413 12 18.769 4.82 22.413 6.45 14.454 1 9.339 8.91 7.829 12 .587");
    starIcon.appendChild(starPolygon);
    header.appendChild(starIcon);
    const title = document.createElement("h3");
    title.textContent = "Factful AI Actions";
    header.appendChild(title);

    const closeButton = document.createElement("button");
    closeButton.classList.add("close-button");
    closeButton.innerHTML = "✕";
    closeButton.addEventListener("click", () => this.hide());
    header.appendChild(closeButton);

    const body = document.createElement("div");
    body.classList.add("chat-body");

    const quickActionsSection = document.createElement("div");
    quickActionsSection.classList.add("enhancements-section");
    const qaTitle = document.createElement("h4");
    qaTitle.textContent = "Quick Actions";
    quickActionsSection.appendChild(qaTitle);
    const qaSubtitle = document.createElement("p");
    qaSubtitle.textContent = "Select text to apply changes.";
    quickActionsSection.appendChild(qaSubtitle);
    body.appendChild(quickActionsSection);

    const quickActionsContainer = document.createElement("div");
    quickActionsContainer.classList.add("quick-actions-container");

    const quickActionsRow = document.createElement("div");
    quickActionsRow.classList.add("quick-actions-row");
    this.paraphraseButton = document.createElement("button");
    this.paraphraseButton.classList.add("quick-action-button");
    this.paraphraseButton.textContent = "Paraphrase";
    this.summarizeButton = document.createElement("button");
    this.summarizeButton.classList.add("quick-action-button");
    this.summarizeButton.textContent = "Summarize";
    quickActionsRow.appendChild(this.paraphraseButton);
    quickActionsRow.appendChild(this.summarizeButton);
    quickActionsContainer.appendChild(quickActionsRow);

    const translateRow = document.createElement("div");
    translateRow.classList.add("translate-row");
    this.translateButton = document.createElement("button");
    this.translateButton.classList.add("translate-button");
    this.translateButton.textContent = "Translate";

    const languages = [
      { code: 'af', name: 'Afrikaans' },
      { code: 'sq', name: 'Albanian' },
      { code: 'am', name: 'Amharic' },
      { code: 'ar', name: 'Arabic' },
      { code: 'hy', name: 'Armenian' },
      { code: 'as', name: 'Assamese' },
      { code: 'az', name: 'Azerbaijani (Latin)' },
      { code: 'bn', name: 'Bangla' },
      { code: 'ba', name: 'Bashkir' },
      { code: 'eu', name: 'Basque' },
      { code: 'bho', name: 'Bhojpuri' },
      { code: 'brx', name: 'Bodo' },
      { code: 'bs', name: 'Bosnian (Latin)' },
      { code: 'bg', name: 'Bulgarian' },
      { code: 'yue', name: 'Cantonese (Traditional)' },
      { code: 'ca', name: 'Catalan' },
      { code: 'lzh', name: 'Chinese (Literary)' },
      { code: 'zh-Hans', name: 'Chinese Simplified' },
      { code: 'zh-Hant', name: 'Chinese Traditional' },
      { code: 'sn', name: 'chiShona' },
      { code: 'hr', name: 'Croatian' },
      { code: 'cs', name: 'Czech' },
      { code: 'da', name: 'Danish' },
      { code: 'prs', name: 'Dari' },
      { code: 'dv', name: 'Divehi' },
      { code: 'doi', name: 'Dogri' },
      { code: 'nl', name: 'Dutch' },
      { code: 'en', name: 'English' },
      { code: 'et', name: 'Estonian' },
      { code: 'fo', name: 'Faroese' },
      { code: 'fj', name: 'Fijian' },
      { code: 'fil', name: 'Filipino' },
      { code: 'fi', name: 'Finnish' },
      { code: 'fr', name: 'French' },
      { code: 'fr-ca', name: 'French (Canada)' },
      { code: 'gl', name: 'Galician' },
      { code: 'ka', name: 'Georgian' },
      { code: 'de', name: 'German' },
      { code: 'el', name: 'Greek' },
      { code: 'gu', name: 'Gujarati' },
      { code: 'ht', name: 'Haitian Creole' },
      { code: 'ha', name: 'Hausa' },
      { code: 'he', name: 'Hebrew' },
      { code: 'hi', name: 'Hindi' },
      { code: 'mww', name: 'Hmong Daw (Latin)' },
      { code: 'hu', name: 'Hungarian' },
      { code: 'is', name: 'Icelandic' },
      { code: 'ig', name: 'Igbo' },
      { code: 'id', name: 'Indonesian' },
      { code: 'ikt', name: 'Inuinnaqtun' },
      { code: 'iu', name: 'Inuktitut' },
      { code: 'iu-Latn', name: 'Inuktitut (Latin)' },
      { code: 'ga', name: 'Irish' },
      { code: 'it', name: 'Italian' },
      { code: 'ja', name: 'Japanese' },
      { code: 'kn', name: 'Kannada' },
      { code: 'ks', name: 'Kashmiri' },
      { code: 'kk', name: 'Kazakh' },
      { code: 'km', name: 'Khmer' },
      { code: 'rw', name: 'Kinyarwanda' },
      { code: 'tlh-Latn', name: 'Klingon' },
      { code: 'tlh-Piqd', name: 'Klingon (plqaD)' },
      { code: 'gom', name: 'Konkani' },
      { code: 'ko', name: 'Korean' },
      { code: 'ku', name: 'Kurdish (Central)' },
      { code: 'kmr', name: 'Kurdish (Northern)' },
      { code: 'ky', name: 'Kyrgyz (Cyrillic)' },
      { code: 'lo', name: 'Lao' },
      { code: 'lv', name: 'Latvian' },
      { code: 'lt', name: 'Lithuanian' },
      { code: 'ln', name: 'Lingala' },
      { code: 'dsb', name: 'Lower Sorbian' },
      { code: 'lug', name: 'Luganda' },
      { code: 'mk', name: 'Macedonian' },
      { code: 'mai', name: 'Maithili' },
      { code: 'mg', name: 'Malagasy' },
      { code: 'ms', name: 'Malay (Latin)' },
      { code: 'ml', name: 'Malayalam' },
      { code: 'mt', name: 'Maltese' },
      { code: 'mi', name: 'Maori' },
      { code: 'mr', name: 'Marathi' },
      { code: 'mn-Cyrl', name: 'Mongolian (Cyrillic)' },
      { code: 'mn-Mong', name: 'Mongolian (Traditional)' },
      { code: 'my', name: 'Myanmar' },
      { code: 'ne', name: 'Nepali' },
      { code: 'nb', name: 'Norwegian Bokmål' },
      { code: 'nya', name: 'Nyanja' },
      { code: 'or', name: 'Odia' },
      { code: 'ps', name: 'Pashto' },
      { code: 'fa', name: 'Persian' },
      { code: 'pl', name: 'Polish' },
      { code: 'pt', name: 'Portuguese (Brazil)' },
      { code: 'pt-pt', name: 'Portuguese (Portugal)' },
      { code: 'pa', name: 'Punjabi' },
      { code: 'otq', name: 'Queretaro Otomi' },
      { code: 'ro', name: 'Romanian' },
      { code: 'run', name: 'Rundi' },
      { code: 'ru', name: 'Russian' },
      { code: 'sm', name: 'Samoan (Latin)' },
      { code: 'sr-Cyrl', name: 'Serbian (Cyrillic)' },
      { code: 'sr-Latn', name: 'Serbian (Latin)' },
      { code: 'st', name: 'Sesotho' },
      { code: 'nso', name: 'Sesotho sa Leboa' },
      { code: 'tn', name: 'Setswana' },
      { code: 'sd', name: 'Sindhi' },
      { code: 'si', name: 'Sinhala' },
      { code: 'sk', name: 'Slovak' },
      { code: 'sl', name: 'Slovenian' },
      { code: 'so', name: 'Somali (Arabic)' },
      { code: 'es', name: 'Spanish' },
      { code: 'sw', name: 'Swahili (Latin)' },
      { code: 'sv', name: 'Swedish' },
      { code: 'ty', name: 'Tahitian' },
      { code: 'ta', name: 'Tamil' },
      { code: 'tt', name: 'Tatar (Latin)' },
      { code: 'te', name: 'Telugu' },
      { code: 'th', name: 'Thai' },
      { code: 'bo', name: 'Tibetan' },
      { code: 'ti', name: 'Tigrinya' },
      { code: 'to', name: 'Tongan' },
      { code: 'tr', name: 'Turkish' },
      { code: 'tk', name: 'Turkmen (Latin)' },
      { code: 'uk', name: 'Ukrainian' },
      { code: 'hsb', name: 'Upper Sorbian' },
      { code: 'ur', name: 'Urdu' },
      { code: 'ug', name: 'Uyghur (Arabic)' },
      { code: 'uz', name: 'Uzbek (Latin)' },
      { code: 'vi', name: 'Vietnamese' },
      { code: 'cy', name: 'Welsh' },
      { code: 'xh', name: 'Xhosa' },
      { code: 'yo', name: 'Yoruba' },
      { code: 'yua', name: 'Yucatec Maya' },
      { code: 'zu', name: 'Zulu' }
    ];

    const languageSelect = document.createElement("select");
    languageSelect.classList.add('translate-row-select');
    languageSelect.style.color = "#000";
    languageSelect.style.backgroundColor = "#fff";
    languageSelect.style.border = "1px solid #ccc";
    languageSelect.size = 5;

    languages.forEach(lang => {
      const opt = document.createElement("option");
      opt.value = lang.code;
      opt.textContent = lang.name;
      opt.style.color = "#000";
      opt.style.backgroundColor = "#fff";
      languageSelect.appendChild(opt);
    });    

    translateRow.appendChild(this.translateButton);
    translateRow.appendChild(languageSelect);
    quickActionsContainer.appendChild(translateRow);

    quickActionsSection.appendChild(quickActionsContainer);

    const searchContainer = document.createElement("div");
    searchContainer.classList.add("research-input-wrapper");
    searchContainer.style.display = "flex";
    searchContainer.style.alignItems = "center";
    searchContainer.style.gap = "8px";

    const inputWrapper = document.createElement("div");
    inputWrapper.style.position = "relative";
    inputWrapper.style.flex = "1";

    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = "How long was the Queen's rule?";
    this.searchInput = searchInput;

    const searchButton = document.createElement("button");
    searchButton.classList.add("search-button");
    searchButton.style.width = "36px";
    searchButton.style.height = "36px";
    searchButton.style.padding = "8px";
    searchButton.style.border = "none";
    searchButton.style.borderRadius = "8px";
    searchButton.style.backgroundColor = "#0177FC";
    searchButton.style.cursor = "pointer";
    searchButton.style.display = "flex";
    searchButton.style.alignItems = "center";
    searchButton.style.justifyContent = "center";
    this.searchButton = searchButton;

    const arrowSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    arrowSvg.setAttribute("viewBox", "0 0 24 24");
    arrowSvg.setAttribute("width", "20");
    arrowSvg.setAttribute("height", "20");
    arrowSvg.style.fill = "none";
    arrowSvg.style.stroke = "#ffffff";
    arrowSvg.style.strokeWidth = "2";
    arrowSvg.style.strokeLinecap = "round";
    arrowSvg.style.strokeLinejoin = "round";

    const arrowPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    arrowPath.setAttribute("d", "M5 12h14M12 5l7 7-7 7");
    arrowSvg.appendChild(arrowPath);
    searchButton.appendChild(arrowSvg);

    inputWrapper.appendChild(searchInput);
    searchContainer.appendChild(inputWrapper);
    searchContainer.appendChild(searchButton);

    const tabContainer = document.createElement("div");
    tabContainer.classList.add("tab-container");

    const enhancementsTab = document.createElement("div");
    enhancementsTab.classList.add("tab", "active");
    enhancementsTab.textContent = "Enhancements";
    enhancementsTab.dataset.tab = "enhancements";

    const composeTab = document.createElement("div");
    composeTab.classList.add("tab");
    composeTab.textContent = "Compose";
    composeTab.dataset.tab = "compose";

    tabContainer.appendChild(enhancementsTab);
    tabContainer.appendChild(composeTab);

    const enhancementsContent = document.createElement("div");
    enhancementsContent.classList.add("tab-content", "active");
    enhancementsContent.id = "enhancements-content";
    enhancementsContent.appendChild(body);

    this.suggestionSection = document.createElement("div");
    this.suggestionSection.classList.add("suggestion-section");
    this.suggestionSection.style.display = "none";

    const container = document.createElement("div");
    container.classList.add("suggestion-container");

    const textContainer = document.createElement("div");
    textContainer.classList.add("suggestion-text");
    const placeholderText = document.createElement("p");
    placeholderText.textContent = "Placeholder Text";
    textContainer.appendChild(placeholderText);

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("suggestion-buttons");

    const acceptButton = document.createElement("button");
    acceptButton.classList.add("accept-suggestion");
    acceptButton.style.backgroundColor = "#4caf50";
    acceptButton.style.color = "#fff";
    acceptButton.style.border = "none";
    acceptButton.style.padding = "8px 12px";
    acceptButton.style.borderRadius = "6px";
    acceptButton.style.cursor = "pointer";
    acceptButton.textContent = "Accept";

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-suggestion");
    deleteButton.style.backgroundColor = "#f44336";
    deleteButton.style.color = "#fff";
    deleteButton.style.border = "none";
    deleteButton.style.padding = "8px 12px";
    deleteButton.style.borderRadius = "6px";
    deleteButton.style.cursor = "pointer";
    deleteButton.textContent = "Delete";

    buttonContainer.appendChild(acceptButton);
    buttonContainer.appendChild(deleteButton);

    container.appendChild(textContainer);
    container.appendChild(buttonContainer);
    this.suggestionSection.appendChild(container);
    enhancementsContent.appendChild(this.suggestionSection);

    const composeContent = document.createElement("div");
    composeContent.classList.add("tab-content");
    composeContent.id = "compose-content";

    const composeSection = document.createElement("div");
    composeSection.classList.add("compose-section");

    const composeTextarea = document.createElement("textarea");
    composeTextarea.classList.add("compose-textarea");
    composeTextarea.placeholder = "Enter your prompt here...";

    const composeButton = document.createElement("button");
    composeButton.classList.add("compose-button");
    composeButton.textContent = "Generate";

    composeSection.appendChild(composeTextarea);
    composeSection.appendChild(composeButton);
    composeContent.appendChild(composeSection);

    this.chatWindow.appendChild(header);
    this.chatWindow.appendChild(tabContainer);
    this.chatWindow.appendChild(enhancementsContent);
    this.chatWindow.appendChild(composeContent);

    this.initializeTabs();
    this.initializeCompose();

    const researchSection = document.createElement("div");
    researchSection.classList.add("research-section");
    const researchTitle = document.createElement("h4");
    researchTitle.textContent = "Research";
    researchSection.appendChild(researchTitle);
    const researchDescription = document.createElement("p");
    researchDescription.textContent = "Search for information about any topic.";
    researchSection.appendChild(researchDescription);
    researchSection.appendChild(searchContainer);
    body.appendChild(researchSection);

    const highlightOverlay = document.createElement("div");
    highlightOverlay.classList.add("highlight-overlay");
    document.body.appendChild(highlightOverlay);
    this.highlightOverlay = highlightOverlay;

    document.body.appendChild(this.chatWindow);
    this.caretElement = this.createCaret();
    this.highlightDivs = [];
    this.rafPending = false;
    this.isVisible = false;
    this.highlightActive = false;
    this.lastCommand = null;
    this.lastInput = null;
    this.lastLanguage = null;
    this.highlightingEnabled = false;
    this.onVisibilityChange = null; 
    this.makeDraggable();
    this.initButtonEvents();
    this.addEventListeners();
  }

  addEventListeners() {
    document.addEventListener('selectionchange', this.handleSelectionChange.bind(this));
    document.addEventListener('focusin', this.handleFocusIn.bind(this));
    document.addEventListener('focusout', this.handleFocusOut.bind(this));
  }

  handleSelectionChange() {
    const hasSelection = window.getSelection().toString().trim().length > 0;
    const hasHighlights = this.highlightDivs.length > 0;
    document.querySelectorAll('.quick-action-button, .translate-button').forEach(btn => {
      btn.classList.toggle('enabled', hasHighlights);
      btn.disabled = !hasHighlights;
    });
  
    if (hasSelection) {
      this.storeSelectionData();
      this.toggleHighlight();
    }
  }

  storeSelectionData() {
    const activeElement = document.activeElement;
    
    if (!this.isValidEditableElement(activeElement)) {
      return;
    }
    
    if (activeElement.tagName === 'TEXTAREA') {
      this.lastFocusedElement = activeElement;
      this.selectionStart = activeElement.selectionStart;
      this.selectionEnd = activeElement.selectionEnd;
    } else {
      const editableContainer = activeElement.closest('[contenteditable="true"], td[contenteditable="true"], table[contenteditable="true"]') 
        || activeElement;
      
      this.lastFocusedElement = editableContainer;
      
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        this.cachedRange = selection.getRangeAt(0).cloneRange();
      }
    }
  }

  handleFocusIn(event) {
    const el = event.target;

    if (el !== this.lastFocusedElement) {
        return;
    }

    if (el.tagName === 'TEXTAREA') {
        if (this.selectionStart !== null && 
            this.selectionEnd !== null && 
            el.value.length === this.lastContentLength) {
            
            setTimeout(() => {
                el.selectionStart = this.selectionStart;
                el.selectionEnd = this.selectionEnd;
            }, 0);
        }
    } 
    else if (el.contentEditable === 'true' || el.closest('[contenteditable="true"]')) {
        if (this.cachedRange && 
            el.textContent.length === this.lastContentLength) {
            
            setTimeout(() => {
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(this.cachedRange);
            }, 0);
        }
    }
  }

  handleFocusOut(event) {
    const el = event.target;
    if (!el) return;

    if (el.tagName === 'TEXTAREA') {
        this.storeSelectionData();
        this.lastContentLength = el.value.length;
    } else if (el.contentEditable === 'true' || el.closest('[contenteditable="true"]')) {
        this.storeSelectionData();
        this.lastContentLength = el.textContent.length;
    }
  }

  enableSearchButton(button) {
    button.disabled = false;
    button.style.backgroundColor = '#0177FC';
    button.style.cursor = 'pointer';
    button.style.opacity = '1';
    
    const svg = button.querySelector('svg');
    if (svg) {
        svg.style.stroke = '#ffffff';
    }
  }

  toggleHighlight() {
    if (!this.highlightingEnabled) return;
    this.clearHighlightDivs();
    const el = document.activeElement;
    
    if (!this.isValidEditableElement(el)) {
      return;
    }
  
    const selection = window.getSelection();
    if (el?.tagName === "TEXTAREA") {
      this.highlightTextareaSelection(el);
    } else if (selection?.rangeCount > 0 && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      const commonAncestor = range.commonAncestorContainer;

      const isInContentEditable = (node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.contentEditable === 'true') return true;
          const editableParent = node.closest('[contenteditable="true"], td[contenteditable="true"], table[contenteditable="true"]');
          return !!editableParent;
        }
        return node.parentElement && isInContentEditable(node.parentElement);
      };
  
      if (isInContentEditable(commonAncestor)) {
        this.highlightContentEditableSelection(range);
      }
    }
  }

  clearHighlightDivs() {
    this.highlightDivs.forEach(d => d.remove());
    this.highlightDivs = [];
    document.querySelectorAll(".highlight-container").forEach(c => c.remove());
  }

  createHighlightRect(rect) {
    const { left, top, width, height } = rect;
    if (width <= 0 || height <= 0) return;
    const div = document.createElement("div");
    div.classList.add("highlight-rect");
    div.style.position = "absolute";
    div.style.left = `${left}px`;
    div.style.top = `${top}px`;
    div.style.width = `${width}px`;
    div.style.height = `${height}px`;
    div.style.zIndex = "999998";
    this.highlightOverlay.appendChild(div);
    this.highlightDivs.push(div);
  }

  highlightTextareaSelection(el) {
    const computedStyle = window.getComputedStyle(el);
    const lineHeight = parseFloat(computedStyle.lineHeight) || parseFloat(computedStyle.fontSize) * 1.2;
    const { selectionStart, selectionEnd } = el;
    if (selectionStart === selectionEnd) return;
    const text = el.value.substring(0, selectionEnd);
    const lines = text.split('\n');
    const selectedText = el.value.substring(selectionStart, selectionEnd);
    const selectedLines = selectedText.split('\n');
    let startLine = text.substr(0, selectionStart).split('\n').length - 1;
    let endLine = startLine + selectedLines.length - 1;

    for (let i = startLine; i <= endLine; i++) {
      const lineStart = i === startLine ? getCaretCoordinates(el, selectionStart) : { left: 0, top: i * lineHeight };
      const lineEnd = i === endLine ? getCaretCoordinates(el, selectionEnd) : { left: el.clientWidth - parseFloat(computedStyle.paddingLeft) - parseFloat(computedStyle.paddingRight) };
      this.createHighlightRect(this.buildRectFromCoords(el, lineStart, lineEnd));
    }
  }

  highlightContentEditableSelection(range) {
    const rects = range.getClientRects();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    Array.from(rects).forEach(rect => {
      if (rect.width >= 1 && rect.height >= 1) {
        this.createHighlightRect({
          left: rect.left + scrollX,
          top: rect.top + scrollY,
          width: rect.width,
          height: rect.height
        });
      }
    });
  }

  highlightStandardDOMSelection(range) {
    const rects = range.getClientRects();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    Array.from(rects).forEach(rect => {
      if (rect.width >= 1 && rect.height >= 1) {
        this.createHighlightRect({
          left: rect.left + scrollX,
          top: rect.top + scrollY,
          width: rect.width,
          height: rect.height
        });
      }
    });
  }

  buildRectFromCoords(textarea, startCoords, endCoords) {
    const s = window.getComputedStyle(textarea);
    const r = textarea.getBoundingClientRect();
    const borderLeft = parseFloat(s.borderLeftWidth) || 0;
    const borderTop = parseFloat(s.borderTopWidth) || 0;
    const paddingLeft = parseFloat(s.paddingLeft) || 0;
    const paddingTop = parseFloat(s.paddingTop) || 0;
    const leftOffset = r.left + window.scrollX + borderLeft + paddingLeft - textarea.scrollLeft;
    const topOffset = r.top + window.scrollY + borderTop + paddingTop - textarea.scrollTop;
    return {
      left: leftOffset + Math.min(startCoords.left, endCoords.left),
      top: topOffset + Math.min(startCoords.top, endCoords.top),
      width: Math.abs(endCoords.left - startCoords.left),
      height: Math.max(startCoords.height, endCoords.height)
    };
  }

  makeDraggable() {
    let offsetX, offsetY, isDragging = false;
    const header = this.chatWindow.querySelector(".chat-header");
    const updatePosition = (x, y) => {
      this.chatWindow.style.left = `${x - offsetX}px`;
      this.chatWindow.style.top = `${y - offsetY}px`;
    };
    header.addEventListener("mousedown", e => {
      if (e.button !== 0) return;
      isDragging = true;
      offsetX = e.clientX - this.chatWindow.offsetLeft;
      offsetY = e.clientY - this.chatWindow.offsetTop;
      header.style.cursor = "grabbing";
      e.preventDefault();
    });
    document.addEventListener("mousemove", e => {
      if (!isDragging) return;
      updatePosition(e.clientX, e.clientY);
      this.scheduleUpdate();
    });
    document.addEventListener("mouseup", () => {
      isDragging = false;
      header.style.cursor = "grab";
    });
    ["input", "scroll", "resize", "keydown", "mouseup"].forEach(evt => {
      window.addEventListener(evt, this.scheduleUpdate.bind(this), true);
    });
    document.addEventListener("selectionchange", () => {
      this.scheduleUpdate();
      this.handleSelectionChange();
    });
  }

  insertTextAtCursor(text) {
    const el = this.lastFocusedElement;
    if (!el) {
        
        return;
    }

    if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
        el.focus();

        if (el.selectionStart === el.selectionEnd) {
            el.selectionStart = el.selectionEnd = el.value.length;
        }
        
        const cursorPos = el.selectionStart || el.value.length;
        const textBefore = el.value.substring(0, cursorPos);
        const textAfter = el.value.substring(cursorPos);
        el.value = textBefore + text + textAfter;
        const newPos = cursorPos + text.length;
        el.selectionStart = newPos;
        el.selectionEnd = newPos;
        el.dispatchEvent(new Event('input', { bubbles: true }));
    } else if (el.contentEditable === 'true') {
        el.focus();
        
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            if (range.collapsed) {
                range.selectNodeContents(el);
                range.collapse(false);
            }
            const textNode = document.createTextNode(text);
            range.insertNode(textNode);
            range.setStartAfter(textNode);
            range.setEndAfter(textNode);
            selection.removeAllRanges();
            selection.addRange(range);
        } else {
            const textNode = document.createTextNode(text);
            el.appendChild(textNode);
            const range = document.createRange();
            range.setStartAfter(textNode);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
  }

  initButtonEvents() {
    this.paraphraseButton.addEventListener("click", () => {
      let selectedText = '';
      
      if (this.lastFocusedElement) {
          if (this.lastFocusedElement.tagName === "TEXTAREA") {
              selectedText = this.lastFocusedElement.value.substring(
                  this.selectionStart,
                  this.selectionEnd
              );
          } else if (this.cachedRange) {
              selectedText = this.cachedRange.toString();
          }
      }
  
      
  
      if (!selectedText) {
          
          return;
      }
  
      chrome.runtime.sendMessage({
          action: "sendButton",
          command: "paraphrase",
          parameter: selectedText
      }, response => {
        
          if (response && response['paraphrased-text']) {
              this.showSuggestionSection(response['paraphrased-text']);
          } else {
              this.showSuggestionSection("Error fetching text");
          }
      });
    });

    this.summarizeButton.addEventListener("click", () => {
        let selectedText = '';
        
        if (this.lastFocusedElement) {
            if (this.lastFocusedElement.tagName === 'TEXTAREA') {
                selectedText = this.lastFocusedElement.value.substring(
                    this.selectionStart,
                    this.selectionEnd
                );
            } else if (this.cachedRange) {
                selectedText = this.cachedRange.toString();
            }
        }

        if (!selectedText) {
            
            return;
        }

        this.lastCommand = 'summarize';
        this.lastInput = selectedText;
        this.lastLanguage = null;

        try {
          chrome.runtime.sendMessage({
              action: "sendButton",
              command: "summarize",
              parameter: selectedText
          }, response => {
            
              if (response && response['summarized-text']) {
                  this.showSuggestionSection(response['summarized-text']);
              } else {
                  this.showSuggestionSection("Error fetching text");
              }
          });     
        } catch (error) {
            this.showSuggestionSection("Error fetching text");
        }
      });

      this.translateButton.addEventListener("click", () => {
        let selectedText = '';
        
        if (this.lastFocusedElement) {
            if (this.lastFocusedElement.tagName === "TEXTAREA") {
                selectedText = this.lastFocusedElement.value.substring(
                    this.selectionStart,
                    this.selectionEnd
                );
            } else if (this.cachedRange) {
                selectedText = this.cachedRange.toString();
            }
        }
    
        
    
        if (!selectedText) {
            
            return;
        }

        const languageSelect = this.chatWindow.querySelector('.translate-row select');
        const targetLanguage = languageSelect.value;
        
        
    
        chrome.runtime.sendMessage({
            action: "sendButton",
            command: "translate",
            parameter: selectedText,
            language: targetLanguage
        }, response => {
            
            if (response && response['translated-text']) {
                this.showSuggestionSection(response['translated-text']);
            } else {
                this.showSuggestionSection("Error translating text");
            }
        });
      });

      const searchInput = this.searchInput;
      const searchButton = this.searchButton;
      const handleSearch = async () => {
        const searchQuery = searchInput.value.trim();
        if (!searchQuery) return;

        searchButton.classList.add('disabled');
        searchButton.disabled = true;
        searchButton.style.backgroundColor = '#e0e0e0';
        searchButton.style.cursor = 'not-allowed';
        searchButton.style.opacity = '0.7';

        const svg = searchButton.querySelector('svg');
        if (svg) {
            svg.style.stroke = '#999';
        }

        searchInput.disabled = true;
    
        this.lastCommand = 'search';
        this.lastInput = searchQuery;
        this.lastLanguage = null;
    
        try {
            chrome.runtime.sendMessage({
                action: "sendButton",
                command: "search",
                parameter: searchQuery
            }, response => {
                
                if (response && response.final_result) {
                    const searchResultsContainer = document.createElement('div');
                    searchResultsContainer.style.padding = '16px';
                    searchResultsContainer.style.display = 'flex';
                    searchResultsContainer.style.flexDirection = 'column';
                    searchResultsContainer.style.gap = '16px';

                    const resultText = document.createElement("p");
                    resultText.style.fontSize = "14px";
                    resultText.style.lineHeight = "1.5";
                    resultText.textContent = response.final_result;
                    searchResultsContainer.appendChild(resultText);

                    if (response.sources && response.sources.length > 0) {
                        const sourcesContainer = document.createElement('div');
                        sourcesContainer.style.display = 'flex';
                        sourcesContainer.style.flexDirection = 'column';
                        sourcesContainer.style.gap = '8px';
    
                        const sourcesTitle = document.createElement('p');
                        sourcesTitle.style.fontSize = '14px';
                        sourcesTitle.style.fontWeight = 'bold';
                        sourcesTitle.textContent = 'Sources:';
                        sourcesContainer.appendChild(sourcesTitle);
    
                        response.sources.forEach(source => {
                            const link = document.createElement('a');
                            link.href = source;
                            link.target = '_blank';
                            link.style.color = '#0177FC';
                            link.style.textDecoration = 'none';
                            link.style.fontSize = '12px';
                            link.textContent = source;
                            link.addEventListener('mouseover', () => link.style.textDecoration = 'underline');
                            link.addEventListener('mouseout', () => link.style.textDecoration = 'none');
                            sourcesContainer.appendChild(link);
                        });
    
                        searchResultsContainer.appendChild(sourcesContainer);
                    }

                    const existingResults = this.chatWindow.querySelector('.search-results');
                    if (existingResults) {
                        existingResults.remove();
                    }
                    searchResultsContainer.classList.add('search-results');
                    this.chatWindow.appendChild(searchResultsContainer);
                    setTimeout(() => {
                      this.enableSearchButton(searchButton);
                      searchInput.disabled = false;
                      searchInput.value = '';
                    }, 100);
                } else {
                    const errorContainer = document.createElement('div');
                    errorContainer.innerHTML = '<p style="color: #ff0000;">Error searching</p>';
                    this.chatWindow.appendChild(errorContainer);
                }
            });
        } catch (error) {
            searchButton.classList.remove('disabled');
            searchButton.disabled = false;
            searchInput.disabled = false;
            const errorContainer = document.createElement('div');
            errorContainer.innerHTML = '<p style="color: #ff0000;">Error searching</p>';
            this.chatWindow.appendChild(errorContainer);
        }
    };
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    searchButton.addEventListener('click', () => {
        handleSearch();
    });

    this.suggestionSection.querySelector(".accept-suggestion").addEventListener("click", () => {
        const suggestionText = this.suggestionSection.querySelector("p").textContent;

        if (this.highlightDivs.length > 0) {
            this.replaceHighlightedText(suggestionText);
        } else {
            this.insertTextAtCursor(suggestionText);
        }
        
        this.deleteSuggestion();
        if (searchInput) {
            searchInput.value = '';
        }
    });

    this.suggestionSection.querySelector(".delete-suggestion").addEventListener("click", () => {
        this.deleteSuggestion();
    });
  }

  replaceHighlightedText(replacementText) {
    const el = this.lastFocusedElement;
    
    if (!el) return;
  
    if (el.tagName === "TEXTAREA" || el.tagName === "INPUT") {
      const start = this.selectionStart;
      const end = this.selectionEnd;
      if (start !== null && end !== null && start !== end) {
        const text = el.value;
        el.value = text.slice(0, start) + replacementText + text.slice(end);
        const newPosition = start + replacementText.length;
        this.selectionStart = newPosition;
        this.selectionEnd = newPosition;
        el.selectionStart = newPosition;
        el.selectionEnd = newPosition;
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    } else if (el.contentEditable === 'true' && this.cachedRange) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      const range = this.cachedRange.cloneRange();
      range.deleteContents();
      const textNode = document.createTextNode(replacementText);
      range.insertNode(textNode);
      this.cachedRange = document.createRange();
      this.cachedRange.selectNodeContents(textNode);
      this.cachedRange.collapse(false);
      sel.removeAllRanges();
      sel.addRange(this.cachedRange);
    }
  }

  clearSearchResults = () => {
    const existingResults = this.chatWindow.querySelector('.search-results');
    if (existingResults) {
        existingResults.remove();
    }
    searchButton.classList.remove('disabled');
    searchButton.disabled = false;
  };

  showSuggestionSection(suggestionText) {
    const suggestionTextElement = this.suggestionSection.querySelector(".suggestion-text p");
    suggestionTextElement.textContent = suggestionText;
    this.suggestionSection.style.display = "block";
  }

  acceptSuggestion() {
    const suggestionText = this.suggestionSection.querySelector("p").textContent;
    this.replaceHighlightedText(suggestionText);
    this.deleteSuggestion();
  }

  deleteSuggestion() {
    this.suggestionSection.style.display = "none";
  }

  scheduleUpdate() {
    if (!this.rafPending) {
      this.rafPending = true;
      requestAnimationFrame(() => {
        this.updateCaretPosition();
        this.rafPending = false;
      });
    }
  }

  updateCaretPosition() {
    const el = document.activeElement;
    let caretRect = null;
    if (el && el.tagName === "TEXTAREA") {
      const s = window.getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const borderLeft = parseFloat(s.borderLeftWidth) || 0;
      const borderTop = parseFloat(s.borderTopWidth) || 0;
      const paddingLeft = parseFloat(s.paddingLeft) || 0;
      const paddingTop = parseFloat(s.paddingTop) || 0;
      const pos = el.selectionStart;
      const coords = getCaretCoordinates(el, pos);
      const leftOffset = r.left + window.scrollX + borderLeft + paddingLeft - el.scrollLeft;
      const topOffset = r.top + window.scrollY + borderTop + paddingTop - el.scrollTop;
      caretRect = {
        left: leftOffset + coords.left,
        top: topOffset + coords.top,
        height: coords.height
      };
    } else if (el && el.isContentEditable) {
      const sel = window.getSelection();
      if (sel.rangeCount > 0) {
        const range = sel.getRangeAt(0).cloneRange();
        range.collapse(true);
        const c = range.getBoundingClientRect();
        caretRect = {
          left: c.left + window.scrollX,
          top: c.top + window.scrollY,
          height: c.height
        };
      }
    }
    if (caretRect && caretRect.height > 0) {
      this.caretElement.style.display = "block";
      this.caretElement.style.left = `${caretRect.left - 4}px`;
      this.caretElement.style.top = `${caretRect.top - 4}px`;
    } else {
      this.caretElement.style.display = "none";
    }
  }

  isValidEditableElement(element) {
    if (!element) return false;

    if (element.tagName === 'TEXTAREA' || element.contentEditable === 'true') {
      return true;
    }

    const editableParent = element.closest('[contenteditable="true"], td[contenteditable="true"], div[contenteditable="true"], table[contenteditable="true"]');
    if (editableParent) {
      return true;
    }

    const tableCell = element.closest('td');
    if (tableCell) {
      const table = tableCell.closest('table');
      if (table && (table.contentEditable === 'true' || table.closest('[contenteditable="true"]'))) {
        return true;
      }
    }
  
    return false;
  }

  enableHighlighting() {
    this.highlightingEnabled = true;
  }

  disableHighlighting() {
      this.highlightingEnabled = false;
      this.clearHighlightDivs();
  }

  showAtElement() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const chatWidth = this.chatWindow.offsetWidth;
    const chatHeight = this.chatWindow.offsetHeight;

    let left = (windowWidth - chatWidth) / 2;
    let top = (windowHeight - chatHeight) / 2;

    left = Math.max(0, Math.min(left, windowWidth - chatWidth));
    top = Math.max(0, Math.min(top, windowHeight - chatHeight));

    this.chatWindow.style.left = `${left}px`;
    this.chatWindow.style.top = `${top}px`;
    this.chatWindow.style.display = "block";
    this.isVisible = true;
    if (this.onVisibilityChange) {
        this.onVisibilityChange(true);
    }
    this.scheduleUpdate();
  }
  
  hide() {
    this.chatWindow.style.display = "none";
    this.isVisible = false;
    this.caretElement.style.display = "none";
    this.clearHighlightDivs();
    this.highlightActive = false;
    if (this.onVisibilityChange) {
        this.onVisibilityChange(false);
    }
  }

  createCaret() {
    const div = document.createElement("div");
    div.className = "factful-caret";
    div.innerHTML = ``;
    document.body.appendChild(div);
    return div;
  }

  findLineEnd(textarea, start, selectionEnd) {
    const value = textarea.value;
    let i = start;
    while (i < selectionEnd) {
      if (value[i] === "\n") return i;
      i++;
    }
    return selectionEnd;
  }

  initializeTabs() {
    const tabs = this.chatWindow.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            this.chatWindow.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });

            tab.classList.add('active');
            const contentId = `${tab.dataset.tab}-content`;
            this.chatWindow.querySelector(`#${contentId}`).classList.add('active');
        });
    });
}

initializeCompose() {
    const composeButton = this.chatWindow.querySelector('.compose-button');
    const composeTextarea = this.chatWindow.querySelector('.compose-textarea');

    composeButton.addEventListener('click', async () => {
        const prompt = composeTextarea.value.trim();
        if (!prompt) return;

        composeButton.disabled = true;
        composeButton.textContent = 'Generating...';

        try {
            chrome.runtime.sendMessage({
                action: "sendCommand",
                command: "/generate",
                parameter: prompt
            }, response => {
                if (response && response.generated_text) {
                    this.showSuggestionSection(response.generated_text);
                    this.chatWindow.querySelector('[data-tab="enhancements"]').click();
                } else {
                    alert('Error generating text');
                }
                composeButton.disabled = false;
                composeButton.textContent = 'Generate';
            });
        } catch (error) {
            console.error('Error:', error);
            alert('Error generating text');
            composeButton.disabled = false;
            composeButton.textContent = 'Generate';
        }
    });
  }
}
