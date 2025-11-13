// Storage Manager - handles all data persistence
export class StorageManager {
constructor() {
this.STORAGE_KEYS = {
TRACKING_ITEMS: ‘moodTracker_items’,
ENTRIES: ‘moodTracker_entries’,
LAST_ACTIVE: ‘moodTracker_lastActive’,
SESSION_DATA: ‘moodTracker_sessionData’
};

```
    this.initializeStorage();
}

initializeStorage() {
    // Initialize storage with default values if empty
    if (!this.getTrackingItems()) {
        this.saveTrackingItems([]);
    }
    
    if (!this.getEntries()) {
        this.saveEntries([]);
    }
}

// Tracking Items Methods
getTrackingItems() {
    try {
        const items = localStorage.getItem(this.STORAGE_KEYS.TRACKING_ITEMS);
        return items ? JSON.parse(items) : null;
    } catch (error) {
        console.error('Error getting tracking items:', error);
        return [];
    }
}

saveTrackingItems(items) {
    try {
        localStorage.setItem(this.STORAGE_KEYS.TRACKING_ITEMS, JSON.stringify(items));
        return true;
    } catch (error) {
        console.error('Error saving tracking items:', error);
        return false;
    }
}

// Entry Methods
getEntries() {
    try {
        const entries = localStorage.getItem(this.STORAGE_KEYS.ENTRIES);
        return entries ? JSON.parse(entries) : null;
    } catch (error) {
        console.error('Error getting entries:', error);
        return [];
    }
}

saveEntries(entries) {
    try {
        localStorage.setItem(this.STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
        return true;
    } catch (error) {
        console.error('Error saving entries:', error);
        return false;
    }
}

saveEntry(entry) {
    const entries = this.getEntries() || [];
    entries.unshift(entry); // Add to beginning
    
    // Keep only last 100 entries to prevent storage overflow
    if (entries.length > 100) {
        entries.pop();
    }
    
    return this.saveEntries(entries);
}

// Activity Tracking Methods
getLastActiveTime() {
    try {
        const lastActive = localStorage.getItem(this.STORAGE_KEYS.LAST_ACTIVE);
        return lastActive ? new Date(lastActive) : null;
    } catch (error) {
        console.error('Error getting last active time:', error);
        return null;
    }
}

updateLastActiveTime() {
    try {
        localStorage.setItem(this.STORAGE_KEYS.LAST_ACTIVE, new Date().toISOString());
        return true;
    } catch (error) {
        console.error('Error updating last active time:', error);
        return false;
    }
}

// Session Data Methods
getSessionData() {
    try {
        const data = localStorage.getItem(this.STORAGE_KEYS.SESSION_DATA);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error getting session data:', error);
        return null;
    }
}

saveSessionData(data) {
    try {
        localStorage.setItem(this.STORAGE_KEYS.SESSION_DATA, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving session data:', error);
        return false;
    }
}

// Analytics Methods
getEntriesInRange(startDate, endDate) {
    const entries = this.getEntries() || [];
    return entries.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= startDate && entryDate <= endDate;
    });
}

getTotalDaysTracked() {
    const entries = this.getEntries() || [];
    const uniqueDays = new Set();
    
    entries.forEach(entry => {
        const date = new Date(entry.timestamp);
        const dayString = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        uniqueDays.add(dayString);
    });
    
    return uniqueDays.size;
}

// Clear all data (for debugging/reset)
clearAllData() {
    Object.values(this.STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
    });
    this.initializeStorage();
}
```

}