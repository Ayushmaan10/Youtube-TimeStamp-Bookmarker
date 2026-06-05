// Get current tab's video ID
let currentVideoId = '';

// Initialize popup
document.addEventListener('DOMContentLoaded', initPopup);

async function initPopup() {
  // Get current tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // Extract video ID from URL
  const url = new URL(tab.url);
  if (url.hostname === 'www.youtube.com' || url.hostname === 'youtube.com') {
    currentVideoId = url.searchParams.get('v');
  }
  
  // Set up tab switching
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      loadBookmarks(tab.dataset.tab);
    });
  });
  
  // Load initial bookmarks
  loadBookmarks('all');
}

// Load bookmarks based on selected tab
async function loadBookmarks(tab) {
  const bookmarksList = document.getElementById('bookmarksList');
  bookmarksList.innerHTML = '';
  
  // Get all bookmarks from storage
  const data = await chrome.storage.local.get(null);
  const allBookmarks = [];
  
  // Process all bookmarks
  for (const [videoId, bookmarksJson] of Object.entries(data)) {
    if (videoId === 'activeVideoId') continue;
    
    try {
      const bookmarks = JSON.parse(bookmarksJson);
      const videoInfo = await getVideoInfo(videoId);
      
      bookmarks.forEach(bookmark => {
        allBookmarks.push({
          ...bookmark,
          videoId,
          videoTitle: videoInfo.title,
          videoThumbnail: videoInfo.thumbnail
        });
      });
    } catch (error) {
      console.error('Error parsing bookmarks for video:', videoId, error);
    }
  }
  
  // Filter bookmarks based on selected tab
  const filteredBookmarks = tab === 'current' && currentVideoId
    ? allBookmarks.filter(b => b.videoId === currentVideoId)
    : allBookmarks;
  
  // Sort bookmarks by date
  filteredBookmarks.sort((a, b) => b.date - a.date);
  
  if (filteredBookmarks.length === 0) {
    bookmarksList.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24">
          <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"/>
        </svg>
        <p>No bookmarks found</p>
      </div>
    `;
    return;
  }
  
  // Render bookmarks
  filteredBookmarks.forEach(bookmark => {
    const bookmarkElement = document.createElement('div');
    bookmarkElement.className = 'bookmark-item';
    bookmarkElement.innerHTML = `
      <div class="bookmark-info">
        <div class="bookmark-title">${bookmark.videoTitle}</div>
        <div class="bookmark-timestamp" data-video-id="${bookmark.videoId}" data-time="${bookmark.time}">
          ${bookmark.timestamp}
        </div>
      </div>
      <div class="bookmark-actions">
        <button class="bookmark-delete" data-video-id="${bookmark.videoId}" data-time="${bookmark.time}">×</button>
      </div>
    `;
    
    bookmarksList.appendChild(bookmarkElement);
  });
  
  // Add event listeners
  document.querySelectorAll('.bookmark-timestamp').forEach(el => {
    el.addEventListener('click', () => {
      const videoId = el.dataset.videoId;
      const time = el.dataset.time;
      
      // Add visual feedback
      el.classList.add('bookmark-timestamp-active');
      setTimeout(() => {
        el.classList.remove('bookmark-timestamp-active');
      }, 1000);
      
      // Send message to content script to seek to the timestamp
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'seekTo',
          time: parseFloat(time)
        });
      });
    });
  });
  
  document.querySelectorAll('.bookmark-delete').forEach(el => {
    el.addEventListener('click', async () => {
      const videoId = el.dataset.videoId;
      const time = parseFloat(el.dataset.time);
      
      // Get current bookmarks for this video
      const data = await chrome.storage.local.get(videoId);
      const bookmarks = data[videoId] ? JSON.parse(data[videoId]) : [];
      
      // Remove the bookmark
      const updatedBookmarks = bookmarks.filter(b => b.time !== time);
      
      // Update storage
      if (updatedBookmarks.length > 0) {
        chrome.storage.local.set({ [videoId]: JSON.stringify(updatedBookmarks) });
      } else {
        chrome.storage.local.remove(videoId);
      }
      
      // Reload bookmarks
      loadBookmarks(document.querySelector('.tab.active').dataset.tab);
    });
  });
}

// Get video info from YouTube API
async function getVideoInfo(videoId) {
  try {
    const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    const data = await response.json();
    return {
      title: data.title,
      thumbnail: `https://img.youtube.com/vi/${videoId}/default.jpg`
    };
  } catch (error) {
    console.error('Error fetching video info:', error);
    return {
      title: 'Unknown Video',
      thumbnail: ''
    };
  }
}