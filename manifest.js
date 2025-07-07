{
    "manifest_version": 3,
    "name": "Auto Gap Detector",
    "version": "1.0.0",
    "description": "Automatically detects content gaps in Wikipedia articles about Zambian universities and municipal councils",
    "permissions": [
      "activeTab",
      "storage",
      "scripting"
    ],
    "host_permissions": [
      "https://*.wikipedia.org/*"
    ],
    "content_scripts": [
      {
        "matches": ["https://*.wikipedia.org/*"],
        "js": ["content.js"],
        "css": ["styles.css"]
      }
    ],
    "background": {
      "service_worker": "background.js"
    },
    "action": {
      "default_popup": "popup.html",
      "default_title": "Auto Gap Detector"
    },
    "icons": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }