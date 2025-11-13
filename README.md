# elainedonegan.github.io

# Mood Tracker with Pattern Detection

A comprehensive mood tracking application with advanced pattern detection and behavioral analytics.

## Features

### 📊 Flexible Tracking Metrics

- **6 Scale Types**: Scale (1-10), Number, Yes/No, Emoji Scale, Text Note, Multiple Choice
- **Fully Customizable**: Add or remove any metrics you want to track
- **Average Calculations**: Automatic averages for numeric metrics

### 🧠 Advanced Pattern Detection

- **Time-of-Day Analysis**: Identifies activity patterns across different times
- **Rapid Logging Detection**: Flags potential compulsive checking or racing thoughts
- **Completion Rate Analysis**: Shows which metrics you’re consistently tracking
- **Avoidance Pattern Detection**: Identifies extended gaps between entries

### 🎯 Automatic Mood Inference

- Tracks app usage patterns to infer mood states
- Quick check-ins suggest elevated mood
- Extended engagement suggests elevated mood
- Long absences suggest low mood

## File Structure

```
mood-tracker/
├── index.html           # Main HTML file
├── patternDetection.js  # Pattern detection module
├── app.js              # React application code
└── README.md           # This file
```

## Deployment to GitHub Pages

### Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
1. Name it something like `mood-tracker` (or whatever you prefer)
1. Make it public or private (your choice)

### Step 2: Upload Files

1. Upload these three files to your repository:
- `index.html`
- `patternDetection.js`
- `app.js`
- `README.md` (optional)

### Step 3: Enable GitHub Pages

1. Go to your repository Settings
1. Scroll down to “Pages” in the left sidebar
1. Under “Source”, select “Deploy from a branch”
1. Choose the `main` branch and `/ (root)` folder
1. Click “Save”

### Step 4: Access Your App

After a few minutes, your app will be live at:

```
https://[your-username].github.io/[repository-name]/
```

## Local Development

To run locally, simply open `index.html` in a web browser. All dependencies are loaded from CDNs.

## Technologies Used

- **React 18**: UI framework
- **Tailwind CSS**: Styling
- **Lucide Icons**: Icon library
- **Vanilla JavaScript**: Pattern detection algorithms

## Browser Compatibility

Works in all modern browsers that support:

- ES6 JavaScript
- React 18
- CSS Grid/Flexbox

## Privacy

All data is stored locally in your browser’s memory during your session. No data is sent to any servers or stored persistently unless you implement your own storage solution.

## Future Enhancements

Potential features to add:

- LocalStorage for data persistence
- Data export/import (JSON/CSV)
- Visualization charts and graphs
- Metric correlation analysis
- Customizable thresholds for pattern alerts
- Dark mode

## License

MIT License - Feel free to use and modify as needed.

## Support

For issues or questions, please open an issue on the GitHub repository.