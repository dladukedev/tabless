const STORAGE_KEY = "savedLinks";

// Create context menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "addLink",
    title: "Add link to List",
    contexts: ["link"]
  });
  updateBadge();
});

// Handle right-click
chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "addLink" && info.linkUrl) {
    addLink(info.linkUrl);
  }
});

async function addLink(url) {
  let title = await fetchPageTitle(url);

  chrome.storage.local.get([STORAGE_KEY], (result) => {
    const links = result[STORAGE_KEY] || [];

    links.push({
      title: title || url,
      url: url,
      addedAt: Date.now()
    });

    chrome.storage.local.set({ [STORAGE_KEY]: links }, updateBadge);
  });
}

async function fetchPageTitle(url) {
  try {
    const response = await fetch(url, { method: "GET" });
    const text = await response.text();

    const match = text.match(/<title[^>]*>([^<]*)<\/title>/i);
    if (match && match[1]) {
      return match[1].trim();
    }
  } catch (err) {
    console.warn("Could not fetch title:", err);
  }

  return null;
}

function updateBadge() {
  chrome.storage.local.get([STORAGE_KEY], (result) => {
    const count = (result[STORAGE_KEY] || []).length;

    chrome.action.setBadgeText({
      text: count > 0 ? count.toString() : ""
    });

    chrome.action.setBadgeBackgroundColor({
      color: "#4688F1"
    });
  });
}

// Keep badge synced
chrome.storage.onChanged.addListener(updateBadge);
