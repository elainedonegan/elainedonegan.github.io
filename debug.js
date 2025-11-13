// Debug Module - provides debugging tools and in-page console
export class DebugManager {
constructor() {
this.logs = [];
this.errors = [];
this.isVisible = false;
this.maxLogs = 500;

```
    this.initializeDebugConsole();
    this.interceptConsole();
    this.interceptErrors();
}

initializeDebugConsole() {
    // Create debug console container
    const debugContainer = document.createElement('div');
    debugContainer.id = 'debug-console';
    debugContainer.className = 'hidden';
    debugContainer.innerHTML = `
        <div class="debug-header">
            <span>Debug Console</span>
            <div class="debug-controls">
                <button id="debug-clear">Clear</button>
                <button id="debug-toggle">Hide</button>
            </div>
        </div>
        <div class="debug-content" id="debug-content">
            <div class="debug-output" id="debug-output"></div>
        </div>
    `;
    
    this.addDebugStyles();
    document.body.appendChild(debugContainer);
    this.setupDebugControls();
    this.addDebugToggleButton();
}

addDebugStyles() {
    const style = document.createElement('style');
    style.textContent = `
        #debug-console {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 300px;
            background: #1e1e1e;
            color: #fff;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            border-top: 3px solid #007acc;
            transition: transform 0.3s ease;
        }
        
        #debug-console.hidden {
            transform: translateY(100%);
        }
        
        .debug-header {
            background: #2d2d2d;
            padding: 8px 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #444;
        }
        
        .debug-controls button {
            background: #007acc;
            color: white;
            border: none;
            padding: 4px 12px;
            margin-left: 5px;
            border-radius: 3px;
            cursor: pointer;
            font-size: 11px;
        }
        
        .debug-content {
            flex: 1;
            overflow-y: auto;
            padding: 10px;
            background: #1e1e1e;
        }
        
        .debug-log-entry {
            margin: 2px 0;
            padding: 4px 8px;
            border-left: 3px solid transparent;
            font-family: monospace;
            white-space: pre-wrap;
            word-break: break-word;
        }
        
        .debug-log-entry.log { border-left-color: #888; }
        .debug-log-entry.info { border-left-color: #007acc; color: #4fc3f7; }
        .debug-log-entry.warn { border-left-color: #ff9800; color: #ffb74d; }
        .debug-log-entry.error { border-left-color: #f44336; color: #ff8a80; background: rgba(244,67,54,0.1); }
        .debug-log-entry.success { border-left-color: #4caf50; color: #81c784; }
        
        .debug-timestamp { color: #666; margin-right: 8px; }
        
        #debug-toggle-btn {
            position: fixed;
            bottom: 10px;
            right: 10px;
            background: #007acc;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 20px;
            cursor: pointer;
            z-index: 9999;
            font-size: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
        
        #debug-toggle-btn.has-errors {
            background: #f44336;
            animation: pulse 1s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
    `;
    document.head.appendChild(style);
}

addDebugToggleButton() {
    const btn = document.createElement('button');
    btn.id = 'debug-toggle-btn';
    btn.textContent = '🐛 Debug';
    btn.addEventListener('click', () => this.toggleConsole());
    document.body.appendChild(btn);
}

setupDebugControls() {
    document.getElementById('debug-clear')?.addEventListener('click', () => this.clearLogs());
    document.getElementById('debug-toggle')?.addEventListener('click', () => this.toggleConsole());
}

interceptConsole() {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;
    
    console.log = (...args) => {
        this.addLog('log', args);
        originalLog.apply(console, args);
    };
    
    console.error = (...args) => {
        this.addLog('error', args);
        this.errors.push({ timestamp: new Date(), message: args.join(' ') });
        this.updateErrorIndicator();
        originalError.apply(console, args);
    };
    
    console.warn = (...args) => {
        this.addLog('warn', args);
        originalWarn.apply(console, args);
    };
    
    console.info = (...args) => {
        this.addLog('info', args);
        originalInfo.apply(console, args);
    };
}

interceptErrors() {
    window.addEventListener('error', (event) => {
        this.addLog('error', [`Error: ${event.message} at ${event.filename}:${event.lineno}`]);
        this.errors.push({ timestamp: new Date(), message: event.message });
        this.updateErrorIndicator();
    });
    
    window.addEventListener('unhandledrejection', (event) => {
        this.addLog('error', [`Unhandled Promise Rejection: ${event.reason}`]);
        this.errors.push({ timestamp: new Date(), message: `Promise: ${event.reason}` });
        this.updateErrorIndicator();
    });
}

addLog(type, args) {
    const timestamp = new Date();
    const message = args.map(arg => {
        if (typeof arg === 'object') {
            try {
                return JSON.stringify(arg, null, 2);
            } catch (e) {
                return String(arg);
            }
        }
        return String(arg);
    }).join(' ');
    
    this.logs.push({ type, timestamp, message });
    
    if (this.logs.length > this.maxLogs) {
        this.logs.shift();
    }
    
    this.updateDisplay();
}

updateDisplay() {
    const output = document.getElementById('debug-output');
    if (!output) return;
    
    const html = this.logs.map(log => {
        const time = log.timestamp.toLocaleTimeString();
        return `<div class="debug-log-entry ${log.type}">
            <span class="debug-timestamp">[${time}]</span>
            <span>${this.escapeHtml(log.message)}</span>
        </div>`;
    }).join('');
    
    output.innerHTML = html;
    output.scrollTop = output.scrollHeight;
}

toggleConsole() {
    const console = document.getElementById('debug-console');
    const toggleBtn = document.getElementById('debug-toggle');
    
    if (console.classList.contains('hidden')) {
        console.classList.remove('hidden');
        this.isVisible = true;
        if (toggleBtn) toggleBtn.textContent = 'Hide';
    } else {
        console.classList.add('hidden');
        this.isVisible = false;
        if (toggleBtn) toggleBtn.textContent = 'Show';
    }
}

updateErrorIndicator() {
    const btn = document.getElementById('debug-toggle-btn');
    if (btn && this.errors.length > 0) {
        btn.classList.add('has-errors');
        btn.textContent = `🐛 Debug (${this.errors.length})`;
    }
}

clearLogs() {
    this.logs = [];
    this.errors = [];
    this.updateDisplay();
    this.updateErrorIndicator();
}

escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

checkForIssues() {
    const issues = [];
    
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
    } catch (e) {
        issues.push('localStorage is not available');
    }
    
    if (!window.moodTracker) {
        issues.push('Main app not initialized');
    }
    
    if (issues.length > 0) {
        issues.forEach(issue => console.error(issue));
    } else {
        console.info('✅ All systems operational');
    }
    
    return issues;
}
```

}

// Auto-initialize
window.debugManager = new DebugManager();
console.log(‘Debug manager initialized’);