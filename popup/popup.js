document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get("selectedImage", (data) => {
    if (data.selectedImage) {
      document.getElementById("preview").src = data.selectedImage;
    }
  });

  document.getElementById("openEditor").addEventListener("click", () => {
    chrome.storage.local.get("selectedImage", (data) => {
      if (data.selectedImage) {
        const stableDiffusionURL = `https://stablediffusionweb.com/edit?image=${encodeURIComponent(
          data.selectedImage
        )}`;
        window.open(stableDiffusionURL, "_blank");
      }
    });
  });
});
