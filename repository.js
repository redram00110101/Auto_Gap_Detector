// Repository script for Auto Gap Detector
class RepositoryController {
  constructor() {
    this.detectedGaps = [];
    this.analysisHistory = [];
    this.filteredGaps = [];
    this.init();
  }

  async init() {
    await this.loadData();
    this.setupEventListeners();
    this.updateDashboard();
    this.updateTable();
  }

  async loadData() {
    try {
      const data = await chrome.storage.local.get(['detectedGaps', 'analysisHistory']);
      this.detectedGaps = data.detectedGaps || [];
      this.analysisHistory = data.analysisHistory || [];
      this.filteredGaps = this.detectedGaps;
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  setupEventListeners() {
    document.getElementById('filter-type').addEventListener('change', this.applyFilters.bind(this));
    document.getElementById('filter-severity').addEventListener('change', this.applyFilters.bind(this));
    document.getElementById('export-data').addEventListener('click', this.exportData.bind(this));
  }

  updateDashboard() {
    const totalGaps = this.detectedGaps.reduce((sum, item) => sum + item.gaps.length, 0);
    const pagesAnalyzed = this.analysisHistory.length;
    const avgScore = this.analysisHistory.length > 0 ? 
      Math.round(this.analysisHistory.reduce((sum, item) => sum + item.score, 0) / this.analysisHistory.length) : 0;
    const highPriority = this.detectedGaps.filter(item => 
      item.gaps.some(gap => gap.severity === 'high')
    ).length;

    document.getElementById('total-gaps').textContent = totalGaps;
    document.getElementById('pages-analyzed').textContent = pagesAnalyzed;
    document.getElementById('avg-score').textContent = avgScore + '%';
    document.getElementById('high-priority').textContent = highPriority;
  }

  updateTable() {
    const tbody = document.getElementById('gaps-tbody');
    tbody.innerHTML = '';

    if (this.filteredGaps.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="no-data">No gaps found matching current filters.</td></tr>';
      return;
    }

    this.filteredGaps.forEach((item, index) => {
      const row = document.createElement('tr');
      row.className = item.score < 60 ? 'low-score' : item.score < 80 ? 'medium-score' : 'high-score';
      
      const date = new Date(item.timestamp).toLocaleDateString();
      const highPriorityGaps = item.gaps.filter(gap => gap.severity === 'high').length;
      
      row.innerHTML = \`
        <td class="page-title">
          <a href="\${item.url}" target="_blank">\${item.page}</a>
        </td>
        <td class="score">\${item.score}%</td>
        <td class="gaps-count">
          \${item.gaps.length} total
          \${highPriorityGaps > 0 ? \`(\${highPriorityGaps} high priority)\` : ''}
        </td>
        <td class="date">\${date}</td>
        <td class="actions">
          <button class="view-details-btn" data-index="\${index}">View Details</button>
        </td>
      \`;
      
      tbody.appendChild(row);
    });

    // Add event listeners for view details buttons
    document.querySelectorAll('.view-details-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        this.showGapDetails(this.filteredGaps[index]);
      });
    });
  }

  applyFilters() {
    const typeFilter = document.getElementById('filter-type').value;
    const severityFilter = document.getElementById('filter-severity').value;

    this.filteredGaps = this.detectedGaps.filter(item => {
      let typeMatch = true;
      let severityMatch = true;

      if (typeFilter !== 'all') {
        // Simple type detection based on page title
        const title = item.page.toLowerCase();
        if (typeFilter === 'university') {
          typeMatch = title.includes('university') || title.includes('college');
        } else if (typeFilter === 'municipalCouncil') {
          typeMatch = title.includes('council') || title.includes('municipality');
        }
      }

      if (severityFilter !== 'all') {
        severityMatch = item.gaps.some(gap => gap.severity === severityFilter);
      }

      return typeMatch && severityMatch;
    });

    this.updateTable();
  }

  showGapDetails(item) {
    const detailsDiv = document.getElementById('gap-details');
    const contentDiv = document.getElementById('gap-details-content');
    
    let detailsHTML = `
      <h4>${item.page}</h4>
      <div class="gap-summary">
        <span class="score-badge score-${item.score < 60 ? 'low' : item.score < 80 ? 'medium' : 'high'}">
          ${item.score}% Complete
        </span>
        <span class="date-badge">Analyzed: ${new Date(item.timestamp).toLocaleDateString()}</span>
      </div>
      <div class="gaps-breakdown">
        <h5>Detected Gaps:</h5>
        <ul>
    `;
    
    item.gaps.forEach(gap => {
      detailsHTML += `
        <li class="gap-detail-item ${gap.severity}">
          <span class="gap-type">${gap.type.replace('_', ' ').toUpperCase()}</span>
          <span class="gap-content">${gap.content}</span>
          <span class="gap-severity severity-${gap.severity}">${gap.severity}</span>
        </li>
      `;
    });
    
    detailsHTML += `
        </ul>
      </div>
      <div class="gap-actions">
        <button onclick="window.open('${item.url}', '_blank')" class="action-btn">View Article</button>
        <button onclick="window.open('${item.url}?action=edit', '_blank')" class="action-btn">Edit Article</button>
      </div>
    `;
    
    contentDiv.innerHTML = detailsHTML;
    detailsDiv.style.display = 'block';
    detailsDiv.scrollIntoView({ behavior: 'smooth' });
  }

  exportData() {
    const exportData = {
      summary: {
        totalGaps: this.detectedGaps.reduce((sum, item) => sum + item.gaps.length, 0),
        pagesAnalyzed: this.analysisHistory.length,
        averageScore: this.analysisHistory.length > 0 ? 
          Math.round(this.analysisHistory.reduce((sum, item) => sum + item.score, 0) / this.analysisHistory.length) : 0,
        exportDate: new Date().toISOString()
      },
      detectedGaps: this.detectedGaps,
      analysisHistory: this.analysisHistory
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gap-detection-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Initialize repository
document.addEventListener('DOMContentLoaded', () => {
  new RepositoryController();
});