// Main module - orchestrates all other modules
import { StorageManager } from ‘storage.js’;
import { TrackingManager } from ‘tracking.js’;
import { ActivityMonitor } from ‘activity.js’;
import { HistoryManager } from ‘history.js’;
import { InsightsManager } from ‘insights.js’;
import { UIManager } from ‘ui.js’;
import { DebugManager } from ‘debug.js’;

class MoodTrackerApp {
constructor() {
try {
console.log(‘🚀 Starting MoodTracker initialization…’);

```
        // Initialize debug manager first if not already initialized
        if (!window.debugManager) {
            window.debugManager = new DebugManager();
        }
        
        // Initialize all modules with error handling
        console.log('📦 Initializing StorageManager...');
        this.storage = new StorageManager();
        
        console.log('📦 Initializing TrackingManager...');
        this.tracking = new TrackingManager(this.storage);
        
        console.log('📦 Initializing ActivityMonitor...');
        this.activity = new ActivityMonitor(this.storage);
        
        console.log('📦 Initializing HistoryManager...');
        this.history = new HistoryManager(this.storage);
        
        console.log('📦 Initializing InsightsManager...');
        this.insights = new InsightsManager(this.storage, this.activity);
        
        console.log('📦 Initializing UIManager...');
        this.ui = new UIManager();
        
        console.log('✅ All modules loaded successfully');
        
        this.initialize();
    } catch (error) {
        console.error('❌ Failed to initialize MoodTracker:', error);
        console.error('Stack trace:', error.stack);
    }
}

initialize() {
    try {
        console.log('⚙️ Setting up application...');
        
        // Set up event listeners
        console.log('🎯 Setting up event listeners...');
        this.setupEventListeners();
        
        // Load existing tracking items
        console.log('📝 Loading tracking items...');
        this.loadTrackingItems();
        
        // Start activity monitoring
        console.log('👁️ Starting activity monitoring...');
        this.activity.startMonitoring();
        
        // Load and display history
        console.log('📜 Loading history...');
        this.history.displayRecentEntries();
        
        // Update insights
        console.log('📊 Updating insights...');
        this.insights.updateAll();
        
        // Update UI with last active time
        console.log('🕐 Updating last active time...');
        this.ui.updateLastActiveTime(this.activity.getLastActiveTime());
        
        console.log('🎉 Mood Tracker App initialized successfully!');
        
        // Run diagnostic check
        if (window.debugManager) {
            window.debugManager.checkForIssues();
        }
    } catch (error) {
        console.error('❌ Error during initialization:', error);
        console.error('Stack trace:', error.stack);
    }
}

setupEventListeners() {
    try {
        // Add new tracking item
        const addBtn = document.getElementById('add-item-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                try {
                    this.addNewTrackingItem();
                } catch (error) {
                    console.error('Error adding tracking item:', error);
                }
            });
            console.log('✅ Add button listener attached');
        } else {
            console.error('❌ Add button not found in DOM');
        }
        
        // Enter key support for adding items
        const nameInput = document.getElementById('new-item-name');
        if (nameInput) {
            nameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    try {
                        this.addNewTrackingItem();
                    } catch (error) {
                        console.error('Error adding tracking item:', error);
                    }
                }
            });
            console.log('✅ Name input listener attached');
        } else {
            console.error('❌ Name input not found in DOM');
        }
        
        // Save entry
        const saveBtn = document.getElementById('save-entry-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                try {
                    this.saveCurrentEntry();
                } catch (error) {
                    console.error('Error saving entry:', error);
                }
            });
            console.log('✅ Save button listener attached');
        } else {
            console.error('❌ Save button not found in DOM');
        }
        
        // Activity monitoring events
        if (this.activity) {
            this.activity.on('activityUpdate', (data) => {
                try {
                    this.insights.updateActivityInsights(data);
                } catch (error) {
                    console.error('Error updating activity insights:', error);
                }
            });
            
            this.activity.on('moodIndicatorUpdate', (indicator) => {
                try {
                    this.ui.updateMoodIndicator(indicator);
                } catch (error) {
                    console.error('Error updating mood indicator:', error);
                }
            });
            console.log('✅ Activity event listeners attached');
        } else {
            console.error('❌ Activity monitor not initialized');
        }
    } catch (error) {
        console.error('❌ Error setting up event listeners:', error);
    }
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
console.log(‘📄 DOM Content Loaded’);
try {
window.moodTracker = new MoodTrackerApp();
console.log(‘✅ MoodTracker app instance created and assigned to window.moodTracker’);
} catch (error) {
console.error(‘❌ Failed to create MoodTracker app:’, error);
console.error(‘Stack trace:’, error.stack);

```
    // Try to show error in UI if possible
    const container = document.querySelector('.container');
    if (container) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'background: #ff5252; color: white; padding: 20px; margin: 20px; border-radius: 8px;';
        errorDiv.innerHTML = `
            <h3>⚠️ Error Loading App</h3>
            <p>${error.message}</p>
            <p style="font-size: 12px; opacity: 0.8;">Check the debug console for details (click the Debug button at bottom right)</p>
        `;
        container.insertBefore(errorDiv, container.firstChild);
    }
}
```

});