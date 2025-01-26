chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "editImage",
    title: "Edit with Stable Diffusion",
    contexts: ["image"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "editImage") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: openImageEditor,
      args: [info.srcUrl],
    });
  }
});

function openImageEditor(imageUrl) {
  chrome.storage.local.set({ selectedImage: imageUrl }, () => {
    chrome.runtime.openOptionsPage();
  });
}
