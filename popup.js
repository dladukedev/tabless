const STORAGE_KEY = "savedLinks";
const linkList = document.getElementById("linkList");
const clearBtn = document.getElementById("clearBtn");
const exportBtn = document.getElementById("exportBtn");

function loadLinks() {
  chrome.storage.local.get([STORAGE_KEY], (result) => {
    const links = result[STORAGE_KEY] || [];
    renderLinks(links);
  });
}

function renderLinks(links) {
  linkList.innerHTML = "";

  // Oldest first (already stored in order added)
  links.forEach((link, index) => {
    const li = document.createElement("li");

    const linkSpan = document.createElement("span");
    linkSpan.textContent = link.title;
    linkSpan.className = "link";
    linkSpan.onclick = () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.update(tabs[0].id, { url: link.url });
      });
    };

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "X";
    removeBtn.onclick = () => removeLink(index);

    li.appendChild(linkSpan);
    li.appendChild(removeBtn);
    linkList.appendChild(li);
  });
}

function removeLink(index) {
  chrome.storage.local.get([STORAGE_KEY], (result) => {
    const links = result[STORAGE_KEY] || [];
    links.splice(index, 1);
    chrome.storage.local.set({ [STORAGE_KEY]: links }, loadLinks);
  });
}

clearBtn.onclick = () => {
  chrome.storage.local.set({ [STORAGE_KEY]: [] }, loadLinks);
};

exportBtn.onclick = () => {
  chrome.storage.local.get([STORAGE_KEY], (result) => {
    const links = result[STORAGE_KEY] || [];

    const exportText = links
      .map(link => `${link.title} - ${link.url}`)
      .join("\n");

    const blob = new Blob([exportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "saved_links.txt";
    a.click();

    URL.revokeObjectURL(url);
  });
};

// Reload when storage changes
chrome.storage.onChanged.addListener(loadLinks);

loadLinks();
