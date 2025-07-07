// Content script for Auto Gap Detector
class GapDetector {
  constructor() {
    this.goldStandardTemplates = {
      university: {
        requiredSections: [
          'History', 'Academic programs', 'Notable alumni', 'Research', 
          'Campus', 'Administration', 'Student life', 'References'
        ],
        requiredEntities: ['founded', 'location', 'type', 'students'],
        minCitations: 10
      },
      municipalCouncil: {
        requiredSections: [
          'History', 'Geography', 'Demographics', 'Economy', 
          'Administration', 'Education', 'Healthcare', 'References'
        ],
        requiredEntities: ['population', 'area', 'established', 'mayor'],
        minCitations: 8
      }
    };
    
    this.zambianKeywords = [
      'zambia', 'zambian', 'lusaka', 'copperbelt', 'ndola', 'kitwe',
      'livingstone', 'chipata', 'kasama', 'mongu', 'solwezi', 'kabwe'
    ];
    
    this.init();
  }

  init() {
    if (this.isWikipediaPage()) {
      this.setupUI();
      this.analyzeCurrentPage();
    }
  }

  isWikipediaPage() {
    return window.location.hostname.includes('wikipedia.org');
  }

  setupUI() {
    this.createAnalysisPanel();
    this.createTooltipContainer();
  }

  createAnalysisPanel() {
    const panel = document.createElement('div');
    panel.id = 'gap-detector-panel';
    panel.innerHTML = \`
      <div class="gap-detector-header">
        <h3>🔍 Auto Gap Detector</h3>
        <button id="toggle-panel">−</button>
      </div>
      <div class="gap-detector-content">
        <div class="completeness-score">
          <div class="score-circle">
            <span id="score-value">--</span>
          </div>
          <span class="score-label">Completeness Score</span>
        </div>
        <div class="detected-gaps">
          <h4>Detected Gaps</h4>
          <ul id="gaps-list"></ul>
        </div>
        <div class="suggestions">
          <h4>Suggestions</h4>
          <ul id="suggestions-list"></ul>
        </div>
        <button id="analyze-btn">Re-analyze</button>
      </div>
    \`;
    
    document.body.appendChild(panel);
    
    // Event listeners
    document.getElementById('toggle-panel').addEventListener('click', this.togglePanel.bind(this));
    document.getElementById('analyze-btn').addEventListener('click', this.analyzeCurrentPage.bind(this));
  }

  createTooltipContainer() {
    const container = document.createElement('div');
    container.id = 'gap-detector-tooltip';
    container.className = 'gap-tooltip hidden';
    document.body.appendChild(container);
  }

  togglePanel() {
    const panel = document.getElementById('gap-detector-panel');
    const content = panel.querySelector('.gap-detector-content');
    const toggle = document.getElementById('toggle-panel');
    
    if (content.style.display === 'none') {
      content.style.display = 'block';
      toggle.textContent = '−';
    } else {
      content.style.display = 'none';
      toggle.textContent = '+';
    }
  }

  async analyzeCurrentPage() {
    const pageTitle = document.title.replace(' - Wikipedia', '');
    const pageContent = this.extractPageContent();
    
    if (!this.isRelevantToZambia(pageContent)) {
      this.updatePanel({ score: 'N/A', gaps: [], suggestions: ['This page is not related to Zambian institutions'] });
      return;
    }

    const articleType = this.detectArticleType(pageContent);
    const analysis = this.performAnalysis(pageContent, articleType);
    
    this.updatePanel(analysis);
    this.highlightGaps(analysis.gaps);
    this.saveAnalysis(pageTitle, analysis);
  }

  extractPageContent() {
    const content = {
      title: document.title,
      sections: [],
      text: '',
      citations: 0,
      infobox: {}
    };

    // Extract sections
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach(heading => {
      content.sections.push(heading.textContent.trim());
    });

    // Extract main text
    const bodyContent = document.getElementById('mw-content-text');
    if (bodyContent) {
      content.text = bodyContent.textContent.toLowerCase();
    }

    // Count citations
    const citations = document.querySelectorAll('.reference, .cite');
    content.citations = citations.length;

    // Extract infobox data
    const infobox = document.querySelector('.infobox');
    if (infobox) {
      const rows = infobox.querySelectorAll('tr');
      rows.forEach(row => {
        const cells = row.querySelectorAll('td, th');
        if (cells.length >= 2) {
          const key = cells[0].textContent.trim().toLowerCase();
          const value = cells[1].textContent.trim();
          content.infobox[key] = value;
        }
      });
    }

    return content;
  }

  isRelevantToZambia(content) {
    const text = content.text.toLowerCase();
    return this.zambianKeywords.some(keyword => text.includes(keyword));
  }

  detectArticleType(content) {
    const text = content.text.toLowerCase();
    const title = content.title.toLowerCase();
    
    const universityKeywords = ['university', 'college', 'institute', 'school', 'academy'];
    const municipalKeywords = ['council', 'municipality', 'district', 'city', 'town'];
    
    if (universityKeywords.some(kw => title.includes(kw) || text.includes(kw))) {
      return 'university';
    }
    
    if (municipalKeywords.some(kw => title.includes(kw) || text.includes(kw))) {
      return 'municipalCouncil';
    }
    
    return 'general';
  }

  performAnalysis(content, articleType) {
    const template = this.goldStandardTemplates[articleType];
    if (!template) {
      return { score: 50, gaps: [], suggestions: ['Article type not recognized for detailed analysis'] };
    }

    const analysis = {
      score: 0,
      gaps: [],
      suggestions: []
    };

    // Check required sections
    const missingSections = template.requiredSections.filter(section => 
      !content.sections.some(s => s.toLowerCase().includes(section.toLowerCase()))
    );

    analysis.gaps.push(...missingSections.map(section => ({
      type: 'missing_section',
      content: section,
      severity: 'high'
    })));

    // Check required entities in infobox
    const missingEntities = template.requiredEntities.filter(entity => 
      !Object.keys(content.infobox).some(key => key.includes(entity))
    );

    analysis.gaps.push(...missingEntities.map(entity => ({
      type: 'missing_entity',
      content: entity,
      severity: 'medium'
    })));

    // Check citations
    if (content.citations < template.minCitations) {
      analysis.gaps.push({
        type: 'insufficient_citations',
        content: \`Only \${content.citations} citations found, minimum \${template.minCitations} recommended\`,
        severity: 'high'
      });
    }

    // Calculate completeness score
    const totalChecks = template.requiredSections.length + template.requiredEntities.length + 1; // +1 for citations
    const passedChecks = totalChecks - analysis.gaps.length;
    analysis.score = Math.round((passedChecks / totalChecks) * 100);

    // Generate suggestions
    analysis.suggestions = this.generateSuggestions(analysis.gaps, articleType);

    return analysis;
  }

  generateSuggestions(gaps, articleType) {
    const suggestions = [];
    
    gaps.forEach(gap => {
      switch (gap.type) {
        case 'missing_section':
          suggestions.push(\`Add a '\${gap.content}' section to improve article completeness\`);
          break;
        case 'missing_entity':
          suggestions.push(\`Include '\${gap.content}' information in the infobox\`);
          break;
        case 'insufficient_citations':
          suggestions.push('Add more reliable sources and citations');
          break;
      }
    });

    // Add general suggestions based on article type
    if (articleType === 'university') {
      suggestions.push('Consider adding information about academic partnerships');
      suggestions.push('Include notable faculty members if available');
    } else if (articleType === 'municipalCouncil') {
      suggestions.push('Add information about local government structure');
      suggestions.push('Include economic development initiatives');
    }

    return suggestions;
  }

  updatePanel(analysis) {
    document.getElementById('score-value').textContent = analysis.score;
    
    const scoreElement = document.getElementById('score-value');
    scoreElement.className = analysis.score >= 80 ? 'high-score' : 
                            analysis.score >= 60 ? 'medium-score' : 'low-score';

    const gapsList = document.getElementById('gaps-list');
    gapsList.innerHTML = '';
    analysis.gaps.forEach(gap => {
      const li = document.createElement('li');
      li.className = \`gap-item \${gap.severity}\`;
      li.textContent = gap.content;
      gapsList.appendChild(li);
    });

    const suggestionsList = document.getElementById('suggestions-list');
    suggestionsList.innerHTML = '';
    analysis.suggestions.forEach(suggestion => {
      const li = document.createElement('li');
      li.className = 'suggestion-item';
      li.textContent = suggestion;
      suggestionsList.appendChild(li);
    });
  }

  highlightGaps(gaps) {
    // Remove previous highlights
    document.querySelectorAll('.gap-highlight').forEach(el => {
      el.classList.remove('gap-highlight');
    });

    // Highlight missing sections
    gaps.forEach(gap => {
      if (gap.type === 'missing_section') {
        this.addMissingSectionIndicator(gap.content);
      }
    });
  }

  addMissingSectionIndicator(sectionName) {
    const tocList = document.getElementById('toc');
    if (tocList) {
      const indicator = document.createElement('li');
      indicator.className = 'missing-section-indicator';
      indicator.innerHTML = \`
        <span class="missing-section-text">📝 Missing: \${sectionName}</span>
        <span class="missing-section-tooltip">Consider adding this section</span>
      \`;
      tocList.appendChild(indicator);
    }
  }

  async saveAnalysis(pageTitle, analysis) {
    try {
      const data = await chrome.storage.local.get(['detectedGaps', 'analysisHistory']);
      
      const gapEntry = {
        page: pageTitle,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        gaps: analysis.gaps,
        score: analysis.score
      };

      const detectedGaps = data.detectedGaps || [];
      const analysisHistory = data.analysisHistory || [];

      // Add to gaps if significant gaps found
      if (analysis.gaps.length > 0) {
        detectedGaps.push(gapEntry);
      }

      // Add to history
      analysisHistory.push(gapEntry);

      // Keep only last 100 entries
      if (analysisHistory.length > 100) {
        analysisHistory.splice(0, analysisHistory.length - 100);
      }

      await chrome.storage.local.set({
        detectedGaps: detectedGaps.slice(-50), // Keep last 50 gap entries
        analysisHistory: analysisHistory
      });

    } catch (error) {
      console.error('Error saving analysis:', error);
    }
  }
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.gapDetector = new GapDetector();
  });
} else {
  window.gapDetector = new GapDetector();
}
`,