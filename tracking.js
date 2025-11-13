// Tracking Manager - manages tracking items and their configurations
export class TrackingManager {
constructor(storage) {
this.storage = storage;
this.items = this.loadItems();
}

```
loadItems() {
    return this.storage.getTrackingItems() || [];
}

saveItems() {
    return this.storage.saveTrackingItems(this.items);
}

getItems() {
    return this.items;
}

addItem(name, type = 'scale') {
    const item = {
        id: this.generateId(),
        name: name,
        type: type,
        createdAt: new Date().toISOString(),
        config: this.getDefaultConfig(type)
    };
    
    this.items.push(item);
    this.saveItems();
    
    return item;
}

removeItem(itemName) {
    const index = this.items.findIndex(item => item.name === itemName);
    if (index !== -1) {
        this.items.splice(index, 1);
        this.saveItems();
        return true;
    }
    return false;
}

itemExists(name) {
    return this.items.some(item => 
        item.name.toLowerCase() === name.toLowerCase()
    );
}

getItem(itemName) {
    return this.items.find(item => item.name === itemName);
}

updateItem(itemName, updates) {
    const item = this.getItem(itemName);
    if (item) {
        Object.assign(item, updates);
        this.saveItems();
        return true;
    }
    return false;
}

generateId() {
    return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

getDefaultConfig(type) {
    const configs = {
        scale: {
            min: 1,
            max: 10,
            step: 1,
            defaultValue: 5
        },
        number: {
            min: 0,
            max: 100,
            step: 0.5,
            defaultValue: 0,
            unit: ''
        },
        text: {
            maxLength: 200,
            placeholder: 'Enter your notes...',
            defaultValue: ''
        }
    };
    
    return configs[type] || configs.scale;
}

// Validate a value for a specific item
validateValue(itemName, value) {
    const item = this.getItem(itemName);
    if (!item) return false;
    
    switch (item.type) {
        case 'scale':
        case 'number':
            const num = parseFloat(value);
            if (isNaN(num)) return false;
            return num >= item.config.min && num <= item.config.max;
            
        case 'text':
            return typeof value === 'string' && value.length <= item.config.maxLength;
            
        default:
            return false;
    }
}

// Get statistics for a specific item across all entries
getItemStatistics(itemName, entries) {
    const values = entries
        .filter(entry => entry.values && entry.values[itemName] !== undefined)
        .map(entry => {
            const value = entry.values[itemName];
            return item.type === 'text' ? value : parseFloat(value);
        });
    
    if (values.length === 0) return null;
    
    const item = this.getItem(itemName);
    
    if (item.type === 'text') {
        // For text items, return most common words or themes
        return {
            totalEntries: values.length,
            type: 'text'
        };
    }
    
    // For numeric items
    const numValues = values.filter(v => !isNaN(v));
    
    if (numValues.length === 0) return null;
    
    const sum = numValues.reduce((a, b) => a + b, 0);
    const avg = sum / numValues.length;
    const sorted = [...numValues].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    
    return {
        average: avg.toFixed(2),
        median: median,
        min: Math.min(...numValues),
        max: Math.max(...numValues),
        totalEntries: numValues.length,
        type: 'numeric'
    };
}
```

}