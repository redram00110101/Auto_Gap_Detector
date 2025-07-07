# Auto Gap Detector - Chrome Extension

A Chrome extension that automatically detects content gaps in Wikipedia articles about Zambian universities and municipal councils.

## Features

- **Real-time Gap Detection**: Automatically analyzes Wikipedia articles as you browse
- **Intelligent Analysis**: Uses NLP techniques to identify missing sections and content
- **Completeness Scoring**: Provides objective scores based on global standards
- **Actionable Suggestions**: Offers specific recommendations for article improvements
- **Central Repository**: Tracks all detected gaps in a comprehensive dashboard
- **User-Friendly Interface**: Clean, intuitive design for all skill levels

## Installation

1. Download the extension folder
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension will appear in your browser toolbar

## Usage

### Automatic Analysis
- Simply visit any Wikipedia page
- The extension will automatically analyze articles related to Zambian institutions
- View results in the floating panel on the right side of the page

### Manual Analysis
- Click the extension icon in the toolbar
- Click "Analyze Current Page" to run analysis on demand
- View detailed results in the popup or repository

### Repository Dashboard
- Click "View Repository" to see all detected gaps
- Filter by article type or gap severity
- Export data for further analysis
- Get detailed breakdowns of each article's gaps

## Technical Details

### Analysis Criteria

**Universities:**
- Required sections: History, Academic programs, Notable alumni, Research, Campus, Administration, Student life, References
- Required entities: Founded date, location, type, student count
- Minimum citations: 10

**Municipal Councils:**
- Required sections: History, Geography, Demographics, Economy, Administration, Education, Healthcare, References
- Required entities: Population, area, establishment date, mayor
- Minimum citations: 8

### Scoring System
- Completeness scores range from 0-100%
- Based on presence of required sections, entities, and citations
- Color-coded: Green (80%+), Yellow (60-79%), Red (<60%)

## Files Structure

\`\`\`
Auto Gap Detector/
├── manifest.json          # Extension configuration
├── background.js          # Background service worker
├── content.js            # Main content script
├── popup.html            # Extension popup interface
├── popup.js              # Popup functionality
├── popup.css             # Popup styles
├── repository.html       # Repository dashboard
├── repository.js         # Repository functionality
├── repository.css        # Repository styles
├── styles.css            # Content script styles
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md             # This file
\`\`\`

## Privacy & Data

- All data is stored locally in your browser
- No personal information is collected
- Analysis results are not sent to external servers
- Data can be exported for your own use

## Contributing

To contribute to this extension:

1. Fork the repository
2. Make your changes
3. Test thoroughly on various Wikipedia articles
4. Submit a pull request with detailed description

## License

This project is open source and available under the MIT License.

## Support

For issues or feature requests, please create an issue in the project repository.
`,

  "icon_creation_guide.txt": `# Icon Creation Guide

Since I cannot create actual image files, you'll need to create the following icons:

## Required Icons:

1. **icon16.png** (16x16 pixels)
2. **icon48.png** (48x48 pixels) 
3. **icon128.png** (128x128 pixels)

## Design Specifications:

### Icon Design:
- Main symbol: Magnifying glass (🔍) with a gap or missing piece
- Colors: Blue (#2c5aa0) and white
- Style: Modern, clean, minimal
- Background: Can be transparent or white

### Specific Requirements:
- **16x16**: Very simple - just magnifying glass with small gap
- **48x48**: Add subtle details, maybe small "Z" for Zambia
- **128x128**: Full detail with magnifying glass, gap symbol, and "Z"

## Tools You Can Use:
- Adobe Photoshop/Illustrator
- GIMP (free)
- Canva
- Figma
- Even MS Paint for simple versions

## Quick Creation Steps:
1. Create new document with required dimensions
2. Use blue background or transparent
3. Add white magnifying glass icon
4. Add small gap or missing piece in the glass
5. Save as PNG with transparency
6. Place in `/icons/` folder

## Alternative:
You can also use any magnifying glass icon from free icon sites like:
- Flaticon
- Icons8
- Feather Icons
- Font Awesome

Just make sure to follow the size requirements and save as PNG format.
`
}
