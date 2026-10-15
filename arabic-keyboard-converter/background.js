chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'akc-ar',
      title: 'Convert to Arabic (عربي) [Alt+A]',
      contexts: ['selection', 'editable']
    });
  });
});

// Safely send message to active tab
function sendMessageToTab(tabId, action) {
  chrome.tabs.sendMessage(tabId, { action }, (response) => {
    // If content script is not yet in the tab, inject it automatically
    if (chrome.runtime.lastError) {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['converter.js', 'content.js']
      }).then(() => {
        setTimeout(() => {
          chrome.tabs.sendMessage(tabId, { action }, () => {
            // Ignore any remaining error
            void chrome.runtime.lastError;
          });
        }, 100);
      }).catch(() => {
        // Ignored on chrome:// pages where injection is forbidden
      });
    }
  });
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (tab?.id) {
    sendMessageToTab(tab.id, 'convert-to-arabic');
  }
});

chrome.commands.onCommand.addListener((cmd) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      sendMessageToTab(tabs[0].id, cmd);
    }
  });
});