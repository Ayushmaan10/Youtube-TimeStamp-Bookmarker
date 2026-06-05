# Youtube-TimeStamp-Bookmarker

A Chrome Extension that allows users to bookmark important timestamps while watching YouTube videos and quickly revisit them later. The extension integrates directly into the YouTube player, making it easy to save, manage, and navigate through key moments in any video.

## Overview

When watching long tutorials, lectures, podcasts, or educational videos, finding important sections again can be frustrating. YouTube Timestamp Bookmarker solves this problem by letting users create bookmarks at any point in a video and instantly jump back to those saved timestamps whenever needed.

The extension stores bookmarks locally in the browser and organizes them by video for quick access.

---

## Features

### 1. One-Click Timestamp Bookmarking

* Adds a bookmark button directly to the YouTube video player.
* Save the current playback position with a single click.
* No need to manually copy timestamps.

### 2. Instant Timestamp Navigation

* Click any saved bookmark to jump directly to that point in the video.
* Makes revisiting important sections fast and effortless.

### 3. Video-Specific Bookmark Management

* Bookmarks are stored separately for each YouTube video.
* Keeps saved timestamps organized and easy to find.

### 4. Bookmark Notes

* Add custom notes to bookmarks.
* Useful for:

  * Tutorial checkpoints
  * Important explanations
  * Interview highlights
  * Lecture summaries
  * Revision points

### 5. Popup Dashboard

The extension popup provides:

* View all saved bookmarks
* Filter bookmarks by current video
* Quick timestamp access
* Bookmark deletion

### 6. Persistent Local Storage

* Uses Chrome Storage API.
* Bookmarks remain available even after:

  * Closing the browser
  * Restarting the computer
  * Opening YouTube later

### 7. YouTube SPA Support

YouTube uses a Single Page Application (SPA) architecture where pages change without full reloads.

This extension:

* Detects video changes automatically
* Updates bookmarks dynamically
* Continues working without requiring a page refresh

### 8. Real-Time Synchronization

* Automatically updates bookmark data when changes occur.
* Keeps the interface synchronized across active tabs.

### 9. Visual Feedback System

* Highlights selected timestamps.
* Provides visual confirmation when navigating to a bookmark.
* Smooth animations improve user experience.

### 10. Dark Mode Compatibility

* Automatically adapts to the browser's preferred color scheme.
* Supports both light and dark themes.

---

## How It Works

### Saving a Bookmark

1. Open any YouTube video.
2. Navigate to the desired timestamp.
3. Click the bookmark button in the player controls.
4. The timestamp is saved instantly.

### Accessing Bookmarks

1. Click the extension icon.
2. Open the bookmark dashboard.
3. View:

   * All Bookmarks
   * Current Video Bookmarks
4. Select a timestamp to jump directly to that section.

### Deleting Bookmarks

* Click the delete button next to any bookmark.
* The bookmark is removed immediately from storage.

---

## Tech Stack

### Frontend

* HTML5
* CSS3
* Vanilla JavaScript

### Browser APIs

* Chrome Extension API
* Chrome Storage API
* Chrome Runtime Messaging API
* Chrome Tabs API

### Extension Architecture

* Manifest V3
* Content Scripts
* Popup Interface
* Local Storage Management

---

## Project Structure

```text
ytBookmarking/
│
├── manifest.json          # Extension configuration
├── contentScript.js       # Injects bookmark functionality into YouTube
├── popup.html             # Extension popup UI
├── popup.js               # Popup logic and bookmark management
├── styles.css             # Custom styling
│
└── icons/
    ├── bookmark16.png
    ├── bookmark48.png
    └── bookmark128.png
```

---

## Technical Highlights

### Mutation Observer

Uses JavaScript MutationObserver to detect YouTube page changes and maintain functionality across navigation events.

### Storage-Based Data Persistence

Bookmarks are stored using Chrome's local storage system and organized by YouTube video ID.

### Runtime Messaging

Uses message passing between:

* Popup Script
* Content Script

This enables instant navigation to bookmarked timestamps.

### Dynamic UI Injection

The extension dynamically injects controls into the YouTube player without modifying YouTube's source code.

---

## Use Cases

* Learning from coding tutorials
* Watching online courses
* Revising lecture recordings
* Saving podcast highlights
* Tracking important meeting recordings
* Marking favorite moments in videos

---

## Future Improvements

* Export and import bookmarks
* Search bookmarks
* Bookmark categories/tags
* Cloud synchronization
* Bookmark sharing
* Keyboard shortcuts
* Video progress tracking
* Bookmark analytics

---

## Installation

1. Clone this repository.

```bash
git clone https://github.com/your-username/youtube-timestamp-bookmarker.git
```

2. Open Chrome and navigate to:

```text
chrome://extensions
```

3. Enable **Developer Mode**.

4. Click **Load Unpacked**.

5. Select the project folder.

6. Open YouTube and start bookmarking timestamps.

---

## License

This project is open-source and available under the MIT License.

