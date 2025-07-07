// Background script for Auto Gap Detector
class BackgroundService {
  constructor() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    chrome.runtime.onInstalled.addListener(() => {
      console.log('Auto Gap Detector installed');
      this.initializeStorage();
    });

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url && tab.url.includes('wikipedia.org')) {
        this.handleWikipediaPageLoad(tabId, tab.url);
      }
    });
  }

  async initializeStorage() {
    const defaultData = {
      detectedGaps: [],
      analysisHistory: [],
      settings: {
        autoAnalyze: true,
        showTooltips: true,
        focusOnZambia: true
      }
    };

    try {
      const existing = await chrome.storage.local.get(Object.keys(defaultData));
      const toSet = {};
      
      Object.keys(defaultData).forEach(key => {
        if (!existing[key]) {
          toSet[key] = defaultData[key];
        }
      });

      if (Object.keys(toSet).length > 0) {
        await chrome.storage.local.set(toSet);
      }
    } catch (error) {
      console.error('Error initializing storage:', error);
    }
  }

  async handleWikipediaPageLoad(tabId, url) {
    try {
      const settings = await chrome.storage.local.get('settings');
      if (settings.settings?.autoAnalyze) {
        await chrome.scripting.executeScript({
          target: { tabId },
          function: this.triggerAnalysis
        });
      }
    } catch (error) {
      console.error('Error handling Wikipedia page load:', error);
    }
  }

  triggerAnalysis() {
    if (window.gapDetector) {
      window.gapDetector.analyzeCurrentPage();
    }
  }
}

new BackgroundService();
`,