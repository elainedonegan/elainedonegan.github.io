// UI Manager - handles all user interface interactions and updates
export class UIManager {
constructor() {
this.notificationTimeout = null;
}

```
addTrackingItemToDOM(item, removeCallback) {
    const container = document.getElementById('tracking-items-container');
    
    const div = document.createElement('div');
    div.className = 'tracking-item';
    div.dataset.itemName = item.name;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'tracking-item-content';
    
    const label = document.createElement('label');
    label.textContent = item.name;
    label.htmlFor = `input-${item.id}`;
    
    const input = this.createInputForItem(item);
    
    contentDiv.appendChild(label);
    contentDiv.appendChild(input);
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => {
        if (confirm(`Remove tracking item "${item.name}"?`)) {
            removeCallback(item.name);
        }
    });
    
    div.appendChild(contentDiv);
    div.appendChild(removeBtn);
    
    container.appendChild(div);
}

createInputForItem(item) {
    let input;
    
    switch (item.type) {
        case 'scale':
            input = document.createElement('select');
            input.id = `input-${item.id}`;
            input.dataset.itemName = item.name;
            
            // Add empty option
            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = 'Select...';
            input.appendChild(emptyOption);
            
            // Add scale options
            for (let i = item.config.min; i <= item.config.max; i += item.config.step) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = i;
                input.appendChild(option);
            }
            break;
            
        case 'number':
            input = document.createElement('input');
            input.type = 'number';
            input.id = `input-${item.id}`;
            input.dataset.itemName = item.name;
            input.min = item.config.min;
            input.max = item.config.max;
            input.step = item.config.step;
            input.placeholder = `${item.config.min}-${item.config.max}`;
            break;
            
        case 'text':
            input = document.createElement('input');
            input.type = 'text';
            input.id = `input-${item.id}`;
            input.dataset.itemName = item.name;
            input.maxLength = item.config.maxLength;
            input.placeholder = item.config.placeholder;
            break;
            
        default:
            input = document.createElement('input');
            input.type = 'text';
            input.id = `input-${item.id}`;
            input.dataset.itemName = item.name;
    }
    
    return input;
}

removeTrackingItemFromDOM(itemName) {
    const element = document.querySelector(`[data-item-name="${itemName}"]`);
    if (element) {
        element.remove();
    }
}

getTrackingValues() {
    const values = {};
    const inputs = document.querySelectorAll('#tracking-items-container input, #tracking-items-container select');
    
    inputs.forEach(input => {
        const itemName = input.dataset.itemName;
        if (itemName) {
            values[itemName] = input.value;
        }
    });
    
    return values;
}

clearTrackingValues() {
    const inputs = document.querySelectorAll('#tracking-items-container input, #tracking-items-container select');
    
    inputs.forEach(input => {
        if (input.tagName === 'SELECT') {
            input.selectedIndex = 0;
        } else {
            input.value = '';
        }
    });
}

updateLastActiveTime(time) {
    const element = document.getElementById('last-active-time');
    if (element && time) {
        element.textContent = this.formatRelativeTime(time);
    }
}

updateMoodIndicator(indicator) {
    const element = document.getElementById('mood-indicator');
    if (element) {
        element.textContent = indicator;
    }
}

showNotification(message, type = 'info') {
    // Clear existing notification timeout
    if (this.notificationTimeout) {
        clearTimeout(this.notificationTimeout);
    }
    
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
    `;
    
    // Set background color based on type
    const colors = {
        success: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        error: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        info: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        warning: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    };
    
    notification.style.background = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    this.notificationTimeout = setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

formatRelativeTime(date) {
    if (!date) return 'Never';
    
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
}

// Modal dialog for advanced features
showModal(title, content) {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
    `;
    
    // Create modal content
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.cssText = `
        background: white;
        border-radius: 15px;
        padding: 30px;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
        position: relative;
    `;
    
    // Add title
    const titleEl = document.createElement('h2');
    titleEl.textContent = title;
    titleEl.style.marginBottom = '20px';
    modal.appendChild(titleEl);
    
    // Add content
    const contentEl = document.createElement('div');
    contentEl.innerHTML = content;
    modal.appendChild(contentEl);
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = `
        position: absolute;
        top: 10px;
        right: 15px;
        background: none;
        border: none;
        font-size: 30px;
        cursor: pointer;
        color: #999;
    `;
    closeBtn.addEventListener('click', () => overlay.remove());
    modal.appendChild(closeBtn);
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
}
```

}

// Add animation styles
const style = document.createElement(‘style’);
style.textContent = `
@keyframes slideIn {
from {
transform: translateX(100%);
opacity: 0;
}
to {
transform: translateX(0);
opacity: 1;
}
}

```
@keyframes slideOut {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}
```

`;
document.head.appendChild(style);