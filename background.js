chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "editImage",
    title: "Add to Extension",
    contexts: ["image"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "editImage") {
    chrome.storage.local.set({ selectedImage: info.srcUrl }, () => {
      chrome.windows.create({
        url: chrome.runtime.getURL("popup/popup.html"),
        type: "popup",
        width: 400,
        height: 600,
      });
    });
  }
});
