// History Manager - manages and displays past entries
export class HistoryManager {
constructor(storage) {
this.storage = storage;
this.container = document.getElementById(‘history-container’);
}

```
displayRecentEntries(limit = 10) {
    const entries = this.storage.getEntries() || [];
    const recentEntries = entries.slice(0, limit);
    
    if (recentEntries.length === 0) {
        this.container.innerHTML = '<p style="color: #999; text-align: center;">No entries yet. Start tracking to see your history!</p>';
        return;
    }
    
    this.container.innerHTML = '';
    
    recentEntries.forEach(entry => {
        const entryElement = this.createEntryElement(entry);
        this.container.appendChild(entryElement);
    });
}

createEntryElement(entry) {
    const div = document.createElement('div');
    div.className = 'history-entry';
    
    // Format date
    const date = new Date(entry.timestamp);
    const dateString = this.formatDate(date);
    const timeString = this.formatTime(date);
    
    // Create date header
    const dateDiv = document.createElement('div');
    dateDiv.className = 'history-entry-date';
    dateDiv.textContent = `${dateString} at ${timeString}`;
    div.appendChild(dateDiv);
    
    // Add session info if available
    if (entry.sessionDuration || entry.moodIndicator) {
        const sessionDiv = document.createElement('div');
        sessionDiv.style.cssText = 'font-size: 0.9em; color: #666; margin-bottom: 10px;';
        
        const parts = [];
        if (entry.sessionDuration) {
            parts.push(`Session: ${entry.sessionDuration} min`);
        }
        if (entry.moodIndicator) {
            parts.push(`Activity: ${entry.moodIndicator}`);
        }
        
        sessionDiv.textContent = parts.join(' | ');
        div.appendChild(sessionDiv);
    }
    
    // Create items container
    const itemsDiv = document.createElement('div');
    itemsDiv.className = 'history-entry-items';
    
    // Add each tracked value
    Object.entries(entry.values || {}).forEach(([key, value]) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'history-entry-item';
        
        const labelSpan = document.createElement('span');
        labelSpan.className = 'history-entry-item-label';
        labelSpan.textContent = key;
        
        const valueSpan = document.createElement('span');
        valueSpan.className = 'history-entry-item-value';
        valueSpan.textContent = this.formatValue(value);
        
        itemDiv.appendChild(labelSpan);
        itemDiv.appendChild(valueSpan);
        itemsDiv.appendChild(itemDiv);
    });
    
    div.appendChild(itemsDiv);
    
    return div;
}

formatDate(date) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (this.isSameDay(date, today)) {
        return 'Today';
    } else if (this.isSameDay(date, yesterday)) {
        return 'Yesterday';
    } else {
        const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }
}

formatTime(date) {
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    });
}

formatValue(value) {
    if (typeof value === 'number') {
        return value.toString();
    } else if (typeof value === 'string') {
        // Truncate long text values
        return value.length > 50 ? value.substring(0, 47) + '...' : value;
    }
    return String(value);
}

isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

// Get entries for a specific date
getEntriesForDate(date) {
    const entries = this.storage.getEntries() || [];
    return entries.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return this.isSameDay(entryDate, date);
    });
}

// Get entries for a date range
getEntriesForRange(startDate, endDate) {
    return this.storage.getEntriesInRange(startDate, endDate);
}

// Export data as CSV
exportToCSV() {
    const entries = this.storage.getEntries() || [];
    if (entries.length === 0) {
        alert('No data to export');
        return;
    }
    
    // Get all unique keys
    const allKeys = new Set(['timestamp', 'sessionDuration', 'moodIndicator']);
    entries.forEach(entry => {
        Object.keys(entry.values || {}).forEach(key => allKeys.add(key));
    });
    
    // Create CSV header
    const headers = Array.from(allKeys);
    let csv = headers.join(',') + '\n';
    
    // Add data rows
    entries.forEach(entry => {
        const row = headers.map(header => {
            if (header === 'timestamp') {
                return `"${new Date(entry.timestamp).toLocaleString()}"`;
            } else if (header === 'sessionDuration') {
                return entry.sessionDuration || '';
            } else if (header === 'moodIndicator') {
                return `"${entry.moodIndicator || ''}"`;
            } else {
                const value = entry.values[header];
                return value !== undefined ? `"${value}"` : '';
            }
        });
        csv += row.join(',') + '\n';
    });
    
    // Download the CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mood_tracker_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// Clear all history (with confirmation)
clearHistory() {
    if (confirm('Are you sure you want to clear all history? This cannot be undone.')) {
        this.storage.saveEntries([]);
        this.displayRecentEntries();
        return true;
    }
    return false;
}
```

}