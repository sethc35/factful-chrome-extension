export class Pill {
    constructor(numCorrections) {
      this.numCorrections = numCorrections;
      this.pillElement = null;
      this.createPillElement();
      this.applyInitialStyles();
      this.attachEventListeners();
    }
  
    createPillElement() {
      this.pillElement = document.createElement("div");
      this.pillElement.className = "enhanced-corrections-pill";
      Object.assign(this.pillElement.style, {
        position: "fixed",
        width: "36px",
        height: "60px",
        borderRadius: "18px",
        backgroundColor: "#4285f4",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        cursor: "pointer",
        zIndex: "9999999",
        transition: "all 0.3s ease",
        overflow: "hidden",
        left: "20px",
        top: "100px"
      });
  
      const innerSection = document.createElement("div");
      innerSection.className = "inner-section";
      Object.assign(innerSection.style, {
        width: "28px",
        height: "48px",
        borderRadius: "14px",
        backgroundColor: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)"
      });
  
      const logoImg = document.createElement("img");
      logoImg.src = "pseudo-url";
      logoImg.alt = "Logo";
      Object.assign(logoImg.style, {
        width: "16px",
        height: "16px"
      });
      innerSection.appendChild(logoImg);
      this.pillElement.appendChild(innerSection);
  
      const pillNumber = document.createElement("div");
      pillNumber.className = "enhanced-corrections-pill-number";
      Object.assign(pillNumber.style, {
        position: "absolute",
        top: "8px",
        color: "#fff",
        fontSize: "14px",
        fontWeight: "bold",
        textAlign: "center",
        width: "100%",
        zIndex: "1",
        pointerEvents: "none",
        display: "none"
      });
      this.pillElement.appendChild(pillNumber);
  
      const starContainer = document.createElement("div");
      starContainer.className = "enhanced-corrections-pill-star-container";
      Object.assign(starContainer.style, {
        width: "28px",
        height: "40px",
        borderRadius: "12px",
        backgroundColor: "#fff",
        display: "none",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "8px"
      });
  
      const starSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      starSvg.setAttribute("width", "16");
      starSvg.setAttribute("height", "16");
      starSvg.setAttribute("viewBox", "0 0 20 20");
      starSvg.setAttribute("fill", "none");
      const starPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
      starPath.setAttribute("d", "M10 0C10.3395 5.37596 14.624 9.66052 20 10C14.624 10.3395 10.3395 14.624 10 20C9.66052 14.624 5.37596 10.3395 0 10C5.37596 9.66052 9.66052 5.37596 10 0Z");
      starPath.setAttribute("fill", "#0177FC");
      starSvg.appendChild(starPath);
      starContainer.appendChild(starSvg);
      this.pillElement.appendChild(starContainer);
  
      const powerBtn = document.createElement("div");
      Object.assign(powerBtn.style, {
        width: "24px",
        height: "24px",
        borderRadius: "50%",
        backgroundColor: "#fff",
        display: "none",
        alignItems: "center",
        justifyContent: "center"
      });
  
      const powerSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      powerSvg.setAttribute("width", "18");
      powerSvg.setAttribute("height", "18");
      powerSvg.setAttribute("viewBox", "0 0 512 512");
      powerSvg.setAttribute("fill", "#64C37D");
      const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path1.setAttribute("d", "M256,512C128.502,512,24.774,408.272,24.774,280.774c0-84.49,46.065-162.23,120.216-202.879c12.006-6.577,27.057-2.18,33.633,9.816c6.577,11.997,2.182,27.055-9.814,33.633c-58.282,31.949-94.487,93.039-94.487,159.43c0,100.177,81.5,181.677,181.677,181.677s181.677-81.5,181.677-181.677c0-66.682-36.44-127.899-95.097-159.764c-12.022-6.532-16.475-21.573-9.943-33.595s21.572-16.475,33.595-9.944c74.631,40.542,120.992,118.444,120.992,203.304C487.226,408.272,383.498,512,256,512z");
      const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path2.setAttribute("d", "M256,214.71c-13.682,0-24.774-11.092-24.774-24.774V24.774C231.226,11.092,242.318,0,256,0c13.682,0,24.774,11.092,24.774,24.774v165.161C280.774,203.617,269.682,214.71,256,214.71z");
      powerSvg.appendChild(path1);
      powerSvg.appendChild(path2);
      powerBtn.appendChild(powerSvg);
  
      powerBtn.addEventListener("click", () => {
        const currentState = JSON.parse(localStorage.getItem("factful-extension-can-run"));
        if (currentState === false) {
          localStorage.setItem("factful-extension-can-run", JSON.stringify(true));
        } else {
          localStorage.setItem("factful-extension-can-run", JSON.stringify(false));
        }
        window.location.reload();
      });
      this.pillElement.appendChild(powerBtn);
      document.body.appendChild(this.pillElement);
    }
  
    applyInitialStyles() {
      if (this.numCorrections > 0) {
        this.pillElement.style.backgroundColor = "#f44336";
        this.pillElement.style.height = "110px";
        const pillNumber = this.pillElement.querySelector(".enhanced-corrections-pill-number");
        pillNumber.textContent = String(this.numCorrections);
        pillNumber.style.display = "block";
      } else {
        this.pillElement.style.backgroundColor = "#4285f4";
        this.pillElement.style.height = "60px";
        const pillNumber = this.pillElement.querySelector(".enhanced-corrections-pill-number");
        pillNumber.textContent = "";
        pillNumber.style.display = "none";
      }
    }
  
    attachEventListeners() {
      const innerSection = this.pillElement.querySelector(".inner-section");
      const starContainer = this.pillElement.querySelector(".enhanced-corrections-pill-star-container");
      const powerBtn = this.pillElement.querySelector("div > div");
      this.pillElement.addEventListener("mouseenter", () => {
        const currentHeight = this.pillElement.style.backgroundColor === "rgb(244, 67, 54)" ? "130px" : "90px";
        this.pillElement.style.height = currentHeight;
        innerSection.style.display = "none";
        starContainer.style.display = "flex";
        powerBtn.style.display = "flex";
      });
      this.pillElement.addEventListener("mouseleave", () => {
        const defaultHeight = this.pillElement.style.backgroundColor === "rgb(244, 67, 54)" ? "110px" : "60px";
        this.pillElement.style.height = defaultHeight;
        innerSection.style.display = "flex";
        starContainer.style.display = "none";
        powerBtn.style.display = "none";
      });
    }
  
    updateCorrections(numCorrections) {
      this.numCorrections = numCorrections;
      this.applyInitialStyles();
    }
  }
  