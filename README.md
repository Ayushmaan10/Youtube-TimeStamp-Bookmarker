# YouTube Timestamp Bookmarker

A Chrome extension that allows you to bookmark specific timestamps while watching YouTube videos, add notes to them, and easily navigate between your saved points.

## Features

- **Bookmark Creation**: Add bookmarks at specific timestamps in YouTube videos with a single click
- **Timestamp Navigation**: Quickly jump to any bookmarked timestamp
- **Notes**: Add custom notes to each bookmark for context or reminders
- **Filtering**: View all bookmarks or filter by current video
- **Dark Mode Support**: Automatically adapts to your browser's theme preference
- **Persistent Storage**: Bookmarks are saved across browser sessions
- **SPA Support**: Works seamlessly with YouTube's Single Page Application behavior

## Installation

### From Source

1. Clone this repository or download the ZIP file
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the extension directory
5. The extension is now installed and ready to use

## Usage

### Adding Bookmarks

1. Navigate to any YouTube video
2. Play the video and pause at the timestamp you want to bookmark
3. Click the bookmark button added to YouTube's video player controls
4. A notification will confirm that the bookmark has been added

### Viewing Bookmarks

- Click the extension icon in your browser toolbar to open the popup
- Switch between "All Bookmarks" and "Current Video" tabs to filter your bookmarks
- Click on any timestamp to jump to that point in the video

### Managing Bookmarks

- **Adding Notes**: Click the edit button next to any bookmark to add or modify notes
- **Deleting**: Click the × button to remove a bookmark

## Project Structure

- `manifest.json`: Extension configuration and metadata
- `contentScript.js`: Injects UI elements into YouTube and handles bookmark functionality
- `popup.html`: User interface for the extension popup
- `popup.js`: Handles popup functionality and bookmark management
- `styles.css`: Styling for the extension UI elements
- `icons/`: Extension icons in various sizes

## Technical Details

- Built with vanilla JavaScript, HTML, and CSS
- Uses Chrome Extension Manifest V3
- Utilizes Chrome Storage API for persistent data storage
- Implements YouTube's oEmbed API to fetch video information
- Uses MutationObserver to handle YouTube's SPA behavior
