document.addEventListener("mousedown", (event) => {
  if (event.button === 2) {
    // Right-click
    const img = event.target.closest("img");
    if (img) {
      chrome.storage.local.set({ selectedImage: img.src });
    }
  }
});
