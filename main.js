// Main module - orchestrates all other modules
import { StorageManager } from ‘./modules/storage.js’;
import { TrackingManager } from ‘./modules/tracking.js’;
import { ActivityMonitor } from ‘./modules/activity.js’;
import { HistoryManager } from ‘./modules/history.js’;
import { InsightsManager } from ‘./modules/insights.js’;
import { UIManager } from ‘./modules/ui.js’;

class MoodTrackerApp {
constructor() {
// Initialize all modules
this.storage = new StorageManager();
this.tracking = new TrackingManager(this.storage);
this.activity = new ActivityMonitor(this.storage);
this.history = new HistoryManager(this.storage);
this.insights = new InsightsManager(this.storage, this.activity);
this.ui = new UIManager();

```
    this.initialize();
}

initialize() {
    console.log('Initializing Mood Tracker App...');
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Load existing tracking items
    this.loadTrackingItems();
    
    // Start activity monitoring
    this.activity.startMonitoring();
    
    // Load and display history
    this.history.displayRecentEntries();
    
    // Update insights
    this.insights.updateAll();
    
    // Update UI with last active time
    this.ui.updateLastActiveTime(this.activity.getLastActiveTime());
    
    console.log('Mood Tracker App initialized successfully');
}

setupEventListeners() {
    // Add new tracking item
    document.getElementById('add-item-btn').addEventListener('click', () => {
        this.addNewTrackingItem();
    });
    
    // Enter key support for adding items
    document.getElementById('new-item-name').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            this.addNewTrackingItem();
        }
    });
    
    // Save entry
    document.getElementById('save-entry-btn').addEventListener('click', () => {
        this.saveCurrentEntry();
    });
    
    // Activity monitoring events
    this.activity.on('activityUpdate', (data) => {
        this.insights.updateActivityInsights(data);
    });
    
    this.activity.on('moodIndicatorUpdate', (indicator) => {
        this.ui.updateMoodIndicator(indicator);
    });
}

addNewTrackingItem() {
    const nameInput = document.getElementById('new-item-name');
    const typeSelect = document.getElementById('new-item-type');
    
    const name = nameInput.value.trim();
    const type = typeSelect.value;
    
    if (!name) {
        this.ui.showNotification('Please enter a name for the tracking item', 'error');
        return;
    }
    
    // Check if item already exists
    if (this.tracking.itemExists(name)) {
        this.ui.showNotification('This tracking item already exists', 'error');
        return;
    }
    
    // Add the item
    const item = this.tracking.addItem(name, type);
    
    // Add to UI
    this.ui.addTrackingItemToDOM(item, (itemName) => {
        this.removeTrackingItem(itemName);
    });
    
    // Clear inputs
    nameInput.value = '';
    typeSelect.value = 'scale';
    
    this.ui.showNotification(`Added tracking item: ${name}`, 'success');
}

removeTrackingItem(itemName) {
    this.tracking.removeItem(itemName);
    this.ui.removeTrackingItemFromDOM(itemName);
    this.ui.showNotification(`Removed tracking item: ${itemName}`, 'info');
}

loadTrackingItems() {
    const items = this.tracking.getItems();
    items.forEach(item => {
        this.ui.addTrackingItemToDOM(item, (itemName) => {
            this.removeTrackingItem(itemName);
        });
    });
}

saveCurrentEntry() {
    const values = this.ui.getTrackingValues();
    
    if (Object.keys(values).length === 0) {
        this.ui.showNotification('Please add some tracking items first', 'error');
        return;
    }
    
    // Check if any values are empty
    const emptyFields = Object.entries(values).filter(([_, value]) => value === '');
    if (emptyFields.length > 0) {
        this.ui.showNotification('Please fill in all tracking fields', 'error');
        return;
    }
    
    // Save the entry
    const entry = {
        timestamp: new Date().toISOString(),
        values: values,
        sessionDuration: this.activity.getSessionDuration(),
        moodIndicator: this.activity.getMoodIndicator()
    };
    
    this.storage.saveEntry(entry);
    
    // Update history display
    this.history.displayRecentEntries();
    
    // Update insights
    this.insights.updateAll();
    
    // Clear form
    this.ui.clearTrackingValues();
    
    this.ui.showNotification('Entry saved successfully!', 'success');
}
```

}

// Initialize the app when DOM is ready
document.addEventListener(‘DOMContentLoaded’, () => {
window.moodTracker = new MoodTrackerApp();
});