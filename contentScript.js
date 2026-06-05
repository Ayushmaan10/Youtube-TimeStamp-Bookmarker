// Global variables
let currentVideoId = '';
let bookmarks = [];

// Initialize extension
(function init() {
  console.log("YouTube Bookmarker: Initializing...");
  
  // Only run on video pages
  const urlParams = new URLSearchParams(window.location.search);
  currentVideoId = urlParams.get('v');
  
  if (!currentVideoId) {
    console.log("YouTube Bookmarker: Not a video page, skipping initialization");
    return;
  }

  console.log("YouTube Bookmarker: Found video ID:", currentVideoId);

  // Listen for storage changes from other tabs
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes[currentVideoId]) {
      console.log("YouTube Bookmarker: Storage changed, fetching bookmarks");
      fetchBookmarks();
    }
  });

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'seekTo') {
      console.log("YouTube Bookmarker: Received seekTo message");
      const player = document.querySelector('video');
      if (player) {
        player.currentTime = message.time;
        
        // Highlight the timestamp in the bookmarks list
        const timestampElements = document.querySelectorAll('.yt-bookmark-timestamp');
        timestampElements.forEach(el => {
          if (parseFloat(el.getAttribute('data-time')) === message.time) {
            el.classList.add('yt-bookmark-timestamp-active');
            setTimeout(() => {
              el.classList.remove('yt-bookmark-timestamp-active');
            }, 1000);
          }
        });
      }
    }
  });

  // Check if we're on a new page or if the video has changed
  chrome.storage.local.get(['activeVideoId'], (result) => {
    if (result.activeVideoId !== currentVideoId) {
      console.log("YouTube Bookmarker: New video detected");
      chrome.storage.local.set({ activeVideoId: currentVideoId });
      fetchBookmarks();
    }
  });
  
  // Set up mutation observer to handle YouTube's SPA behavior
  const observer = new MutationObserver(() => {
    const newVideoId = new URLSearchParams(window.location.search).get('v');
    if (newVideoId && newVideoId !== currentVideoId) {
      console.log("YouTube Bookmarker: Video changed, updating");
      currentVideoId = newVideoId;
      chrome.storage.local.set({ activeVideoId: currentVideoId });
      fetchBookmarks();
      setupControls();
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Initial setup
  console.log("YouTube Bookmarker: Running initial setup");
  setupControls();
  fetchBookmarks();
})();

// Create a floating container for bookmarks as a last resort
function createFloatingBookmarksContainer() {
  console.log("YouTube Bookmarker: Creating floating container");
  const bookmarksContainer = document.createElement('div');
  bookmarksContainer.className = 'yt-bookmarks-container';
  bookmarksContainer.style.position = 'fixed';
  bookmarksContainer.style.top = '80px';
  bookmarksContainer.style.right = '20px';
  bookmarksContainer.style.zIndex = '2000';
  bookmarksContainer.style.maxWidth = '300px';
  bookmarksContainer.style.maxHeight = '80vh';
  bookmarksContainer.style.overflowY = 'auto';
  document.body.appendChild(bookmarksContainer);
  console.log("YouTube Bookmarker: Created floating container");
  renderBookmarks();
}

// Fetch bookmarks for current video
function fetchBookmarks() {
  chrome.storage.local.get([currentVideoId], (result) => {
    bookmarks = result[currentVideoId] ? JSON.parse(result[currentVideoId]) : [];
    renderBookmarks();
  });
}

// Add bookmark button to YouTube player
function setupControls() {
  const rightControls = document.querySelector('.ytp-right-controls');
  if (!rightControls) {
    console.log("YouTube Bookmarker: Right controls not found");
    return;
  }
  
  // Don't add button if it already exists
  if (document.querySelector('.ytp-bookmark-button')) {
    return;
  }
  
  console.log("YouTube Bookmarker: Adding bookmark button");
  
  // Create bookmark button
  const bookmarkButton = document.createElement('button');
  bookmarkButton.className = 'ytp-button ytp-bookmark-button';
  bookmarkButton.title = 'Bookmark current timestamp';
  bookmarkButton.innerHTML = `
    <svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%" style="fill: #fff;">
      <path d="M18 2C9.163 2 2 9.163 2 18s7.163 16 16 16 16-7.163 16-16S26.837 2 18 2zm0 24c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm1-13h-2v6h2v-6zm0 8h-2v2h2v-2z"/>
    </svg>
  `;
  
  // Add click event
  bookmarkButton.addEventListener('click', addBookmark);
  
  // Insert button at the beginning of right controls
  rightControls.insertBefore(bookmarkButton, rightControls.firstChild);
  
  // Create bookmarks container
  createBookmarksContainer();
  
  // Render any existing bookmarks
  renderBookmarks();
}

// Create bookmarks container
function createBookmarksContainer() {
  console.log("YouTube Bookmarker: Creating container");
  
  // Remove existing container if it exists
  const existingContainer = document.querySelector('.yt-bookmarks-container');
  if (existingContainer) {
    existingContainer.remove();
  }
  
  // Create new container
  const bookmarksContainer = document.createElement('div');
  bookmarksContainer.className = 'yt-bookmarks-container';
  
  // Add header to container
  const header = document.createElement('div');
  header.className = 'yt-bookmarks-header';
  
  const title = document.createElement('h2');
  title.className = 'yt-bookmarks-title';
  title.textContent = 'Bookmarks';
  
  const closeButton = document.createElement('button');
  closeButton.className = 'yt-bookmarks-close';
  closeButton.innerHTML = '×';
  closeButton.addEventListener('click', () => {
    bookmarksContainer.classList.remove('visible');
  });
  
  header.appendChild(title);
  header.appendChild(closeButton);
  bookmarksContainer.appendChild(header);
  
  // Create a wrapper for positioning
  const wrapper = document.createElement('div');
  wrapper.className = 'yt-bookmarks-wrapper';
  wrapper.appendChild(bookmarksContainer);
  
  // Add to page
  document.body.appendChild(wrapper);
  
  // Make it visible
  bookmarksContainer.classList.add('visible');
  
  console.log("YouTube Bookmarker: Container created and added to page");
  return true;
}

// Add a new bookmark
function addBookmark() {
  console.log("YouTube Bookmarker: Adding bookmark");
  
  // Find the video element - try multiple selectors
  const player = document.querySelector('video');
  if (!player) {
    console.error("YouTube Bookmarker: Video player not found");
    return;
  }
  
  const currentTime = player.currentTime;
  const timestamp = formatTime(currentTime);
  
  // Get video title (try multiple selectors)
  const titleElement = document.querySelector('.ytd-video-primary-info-renderer .title') || 
                       document.querySelector('#title h1') ||
                       document.querySelector('#title');
  const videoTitle = titleElement ? titleElement.textContent.trim() : "Untitled Video";
  
  // Create bookmark object
  const bookmark = {
    time: currentTime,
    timestamp: timestamp,
    title: `Bookmark at ${timestamp}`,
    date: Date.now(),
    note: '' // Add note field
  };
  
  // Add to bookmarks array
  bookmarks.push(bookmark);
  
  // Sort bookmarks by time
  bookmarks.sort((a, b) => a.time - b.time);
  
  // Save to chrome storage
  const dataToSave = {};
  dataToSave[currentVideoId] = JSON.stringify(bookmarks);
  chrome.storage.local.set(dataToSave);
  
  // Update UI
  renderBookmarks();
  
  // Show success message
  showNotification('Bookmark added!');
}

// Format seconds to MM:SS or HH:MM:SS
function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  } else {
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}

// Render bookmarks UI
function renderBookmarks() {
  const container = document.querySelector('.yt-bookmarks-container');
  if (!container) {
    console.log("YouTube Bookmarker: Bookmarks container not found");
    createBookmarksContainer();
    return;
  }
  
  // Clear existing bookmarks
  container.innerHTML = '';
  
  if (bookmarks.length === 0) {
    container.innerHTML = '<div class="yt-bookmarks-empty">No bookmarks yet</div>';
    return;
  }
  
  // Create bookmarks list
  const bookmarksList = document.createElement('div');
  bookmarksList.className = 'yt-bookmarks-list';
  
  bookmarks.forEach((bookmark, index) => {
    const bookmarkItem = document.createElement('div');
    bookmarkItem.className = 'yt-bookmark-item';
    
    const bookmarkContent = document.createElement('div');
    bookmarkContent.className = 'yt-bookmark-content';
    
    const timestamp = document.createElement('span');
    timestamp.className = 'yt-bookmark-timestamp';
    timestamp.textContent = bookmark.timestamp;
    timestamp.title = `Jump to ${bookmark.timestamp}`;
    timestamp.setAttribute('data-time', bookmark.time);
    timestamp.addEventListener('click', () => {
      const player = document.querySelector('video');
      if (player) {
        player.currentTime = bookmark.time;
        // Add a visual highlight effect
        timestamp.classList.add('yt-bookmark-timestamp-active');
        setTimeout(() => {
          timestamp.classList.remove('yt-bookmark-timestamp-active');
        }, 1000);
      }
    });
    
    const note = document.createElement('span');
    note.className = 'yt-bookmark-note';
    note.textContent = bookmark.note || '';
    
    const actions = document.createElement('div');
    actions.className = 'yt-bookmark-actions';
    
    const editButton = document.createElement('button');
    editButton.className = 'yt-bookmark-edit';
    editButton.innerHTML = '<svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>';
    editButton.title = 'Edit note';
    editButton.addEventListener('click', () => editBookmarkNote(index));
    
    const deleteButton = document.createElement('button');
    deleteButton.className = 'yt-bookmark-delete';
    deleteButton.innerHTML = '×';
    deleteButton.title = 'Delete bookmark';
    deleteButton.addEventListener('click', () => deleteBookmark(index));
    
    actions.appendChild(editButton);
    actions.appendChild(deleteButton);
    
    bookmarkContent.appendChild(timestamp);
    bookmarkContent.appendChild(note);
    bookmarkItem.appendChild(bookmarkContent);
    bookmarkItem.appendChild(actions);
    bookmarksList.appendChild(bookmarkItem);
  });
  
  container.appendChild(bookmarksList);
}

// Edit bookmark note
function editBookmarkNote(index) {
  const bookmark = bookmarks[index];
  const note = prompt('Add a note for this timestamp:', bookmark.note || '');
  
  if (note !== null) { // User didn't cancel
    bookmark.note = note;
    
    // Save to chrome storage
    const dataToSave = {};
    dataToSave[currentVideoId] = JSON.stringify(bookmarks);
    chrome.storage.local.set(dataToSave);
    
    // Update UI
    renderBookmarks();
    
    // Show success message
    showNotification('Note updated!');
  }
}

// Delete a bookmark
function deleteBookmark(index) {
  bookmarks.splice(index, 1);
  
  // Save to chrome storage
  const dataToSave = {};
  dataToSave[currentVideoId] = JSON.stringify(bookmarks);
  chrome.storage.local.set(dataToSave);
  
  // Update UI
  renderBookmarks();
  
  // Show success message
  showNotification('Bookmark deleted!');
}

// Show notification
function showNotification(message) {
  // Remove any existing notifications
  const existingNotification = document.querySelector('.yt-bookmark-notification');
  if (existingNotification) {
    document.body.removeChild(existingNotification);
  }
  
  const notification = document.createElement('div');
  notification.className = 'yt-bookmark-notification';
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Remove after animation
  setTimeout(() => {
    notification.classList.add('hide');
    setTimeout(() => {
      if (notification.parentNode) {
        document.body.removeChild(notification);
      }
    }, 500);
  }, 2000);
}

// Log that the content script has loaded
console.log("YouTube Bookmarker: Content script loaded");