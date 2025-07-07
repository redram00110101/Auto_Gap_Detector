// Popup script for Auto Gap Detector
class PopupController {
  constructor() {
    this.init();
  }

  async init() {
    await this.loadData();
    this.setupEventListeners();
    this.updateUI();
  }

  async loadData() {
    try {
      const data = await chrome.storage.local.get(['detectedGaps', 'analysisHistory', 'settings']);
      this.detectedGaps = data.detectedGaps || [];
      this.analysisHistory = data.analysisHistory || [];
      this.settings = data.settings || { autoAnalyze: true, showTooltips: true, focusOnZambia: true };
    } catch (error) {
      console.error('Error loading data:', error);
      this.detectedGaps = [];
      this.analysisHistory = [];
      this.settings = { autoAnalyze: true, showTooltips: true, focusOnZambia: true };
    }
  }

  setupEventListeners() {
    document.getElementById('analyze-current').addEventListener('click', this.analyzeCurrentPage.bind(this));
    document.getElementById('view-repository').addEventListener('click', this.openRepository.bind(this));
    
    // Settings
    document.getElementById('auto-analyze').addEventListener('change', this.updateSettings.bind(this));
    document.getElementById('show-tooltips').addEventListener('change', this.updateSettings.bind(this));
    document.getElementById('focus-zambia').addEventListener('change', this.updateSettings.bind(this));
  }

  updateUI() {
    // Update stats
    document.getElementById('total-gaps').textContent = this.detectedGaps.length;
    document.getElementById('pages-analyzed').textContent = this.analysisHistory.length;
    
    // Update recent gaps
    const recentGapsList = document.getElementById('recent-gaps-list');
    recentGapsList.innerHTML = '';
    
    if (this.detectedGaps.length === 0) {
      recentGapsList.innerHTML = '<li class="no-gaps">No gaps detected yet. Visit Wikipedia pages to start analyzing!</li>';
    } else {
      const recentGaps = this.detectedGaps.slice(-5).reverse();
      recentGaps.forEach(gap => {
        const li = document.createElement('li');
        li.className = 'gap-item';
        li.innerHTML = \`
          <div class="gap-title">\${gap.page}</div>
          <div class="gap-score">Score: \${gap.score}%</div>
          <div class="gap-count">\${gap.gaps.length} gaps found</div>
        \`;
        li.addEventListener('click', () => {
          chrome.tabs.create({ url: gap.url });
        });
        recentGapsList.appendChild(li);
      });
    }
    
    // Update settings
    document.getElementById('auto-analyze').checked = this.settings.autoAnalyze;
    document.getElementById('show-tooltips').checked = this.settings.showTooltips;
    document.getElementById('focus-zambia').checked = this.settings.focusOnZambia;
  }

  async analyzeCurrentPage() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.url.includes('wikipedia.org')) {
        this.showMessage('Please navigate to a Wikipedia page first.');
        return;
      }

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
          if (window.gapDetector) {
            window.gapDetector.analyzeCurrentPage();
          }
        }
      });

      this.showMessage('Analysis started! Check the page for results.');
      setTimeout(() => {
        this.loadData().then(() => this.updateUI());
      }, 2000);

    } catch (error) {
      console.error('Error analyzing current page:', error);
      this.showMessage('Error analyzing page. Please try again.');
    }
  }

  openRepository() {
    chrome.tabs.create({ url: chrome.runtime.getURL('repository.html') });
  }

  async updateSettings() {
    this.settings = {
      autoAnalyze: document.getElementById('auto-analyze').checked,
      showTooltips: document.getElementById('show-tooltips').checked,
      focusOnZambia: document.getElementById('focus-zambia').checked
    };

    try {
      await chrome.storage.local.set({ settings: this.settings });
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  showMessage(message) {
    const messageEl = document.createElement('div');
    messageEl.className = 'message';
    messageEl.textContent = message;
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
      messageEl.remove();
    }, 3000);
  }
}

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});
`,
