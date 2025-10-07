// enhance.js
const BACKEND = ""; // same host

document.addEventListener("DOMContentLoaded", () => {
  const beforeImg = document.getElementById("beforeImage");
  const afterImg = document.getElementById("afterImage");
  const compareSlider = document.getElementById("compareSlider");
  const container = document.getElementById("compareContainer");
  const loader = document.getElementById("loader");
  const downloadBtn = document.getElementById("downloadBtn");

  const storedImg = sessionStorage.getItem("uploadedImage");
  if (storedImg) beforeImg.src = storedImg;
  else beforeImg.src = "https://via.placeholder.com/600x400?text=No+Image+Uploaded";
  afterImg.src = beforeImg.src;

  let enhancedUrl = null;
  let isDown = false;

  // 🧠 Move compare slider
  function moveSlider(e) {
    if (!isDown) return;
    const rect = container.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    let pos = ((clientX - rect.left) / rect.width) * 100;
    pos = Math.min(Math.max(pos, 0), 100);
    afterImg.style.clipPath = `inset(0 ${100 - pos}% 0 0)`;
    compareSlider.style.left = `${pos}%`;
  }

  compareSlider.addEventListener("mousedown", () => (isDown = true));
  compareSlider.addEventListener("touchstart", () => (isDown = true));
  window.addEventListener("mouseup", () => (isDown = false));
  window.addEventListener("touchend", () => (isDown = false));
  window.addEventListener("mousemove", moveSlider);
  window.addEventListener("touchmove", moveSlider);

  // 🧠 Enhance Handler (connect to backend)
  async function enhance(actionType) {
    const token = localStorage.getItem("umar_token");
    if (!token) return alert("Please login first!");

    const file = await fetch(storedImg).then((r) => r.blob());
    const formData = new FormData();
    formData.append("file", file, "upload.jpg");

    loader.style.display = "flex";
    loader.querySelector("p").textContent = `${actionType} your image with AI...`;

    try {
      const res = await fetch(`${BACKEND}/api/enhance`, {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
        body: formData,
      });

      const data = await res.json();
      loader.style.display = "none";

      if (!res.ok) {
        alert(data.error || "Enhancement failed.");
        return;
      }

      enhancedUrl = data.enhanced.startsWith("http")
        ? data.enhanced
        : `${BACKEND}${data.enhanced}`;
      afterImg.src = enhancedUrl;

      alert("✅ Enhancement complete!");
    } catch (err) {
      console.error(err);
      loader.style.display = "none";
      alert("Server error: " + err.message);
    }
  }
    // 🧩 Zoom & Reset Feature
  const zoomInBtn = document.getElementById("zoomInBtn");
  const zoomOutBtn = document.getElementById("zoomOutBtn");
  const resetBtn = document.getElementById("resetBtn");
  const compareContainer = document.getElementById("compareContainer");

  let zoomLevel = 1;
  let posX = 0;
  let posY = 0;
  let isPanning = false;
  let startX, startY;

  beforeImg.classList.add("zoomable");
  afterImg.classList.add("zoomable");

  // Zoom In
  zoomInBtn.addEventListener("click", () => {
    zoomLevel = Math.min(zoomLevel + 0.2, 2.5);
    updateZoom();
  });

  // Zoom Out
  zoomOutBtn.addEventListener("click", () => {
    zoomLevel = Math.max(zoomLevel - 0.2, 1);
    updateZoom();
  });

  // Mouse Wheel Zoom
  compareContainer.addEventListener("wheel", (e) => {
    e.preventDefault();
    zoomLevel += e.deltaY < 0 ? 0.1 : -0.1;
    zoomLevel = Math.min(Math.max(zoomLevel, 1), 2.5);
    updateZoom();
  });

  // Panning when zoomed
  compareContainer.addEventListener("mousedown", (e) => {
    if (zoomLevel <= 1) return;
    isPanning = true;
    startX = e.clientX - posX;
    startY = e.clientY - posY;
  });
  window.addEventListener("mouseup", () => (isPanning = false));
  window.addEventListener("mousemove", (e) => {
    if (!isPanning) return;
    posX = e.clientX - startX;
    posY = e.clientY - startY;
    updateZoom();
  });

  // Reset
  resetBtn.addEventListener("click", () => {
    zoomLevel = 1;
    posX = 0;
    posY = 0;
    afterImg.style.clipPath = "inset(0 50% 0 0)";
    compareSlider.style.left = "50%";
    updateZoom();
  });

  function updateZoom() {
    [beforeImg, afterImg].forEach((img) => {
      img.style.transform = `scale(${zoomLevel}) translate(${posX / 50}%, ${posY / 50}%)`;
    });
  }


  // Action buttons
  document.getElementById("enhanceBtn").addEventListener("click", () => enhance("Enhancing"));
  document.getElementById("sharpenBtn").addEventListener("click", () => enhance("Sharpening"));
  document.getElementById("colorizeBtn").addEventListener("click", () => enhance("Colorizing"));
  document.getElementById("restoreBtn").addEventListener("click", () => enhance("Restoring"));

  // Download
  downloadBtn.addEventListener("click", () => {
    const link = document.createElement("a");
    link.href = enhancedUrl || afterImg.src;
    link.download = "umar_enhanced.jpg";
    link.click();
  });
});
