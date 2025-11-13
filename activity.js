// Activity Monitor - tracks user activity and infers mood patterns
export class ActivityMonitor {
constructor(storage) {
this.storage = storage;
this.sessionStartTime = new Date();
this.lastActivityTime = new Date();
this.activityLog = [];
this.listeners = {};
this.checkInterval = null;

```
    this.loadPreviousSession();
}

loadPreviousSession() {
    const sessionData = this.storage.getSessionData();
    if (sessionData) {
        // Calculate time away from app
        const lastActive = new Date(sessionData.lastActivityTime);
        const timeAway = Date.now() - lastActive.getTime();
        
        // Store for mood inference
        this.previousSessionGap = timeAway;
    }
    
    // Initialize new session
    this.storage.saveSessionData({
        sessionStartTime: this.sessionStartTime.toISOString(),
        lastActivityTime: this.lastActivityTime.toISOString()
    });
}

startMonitoring() {
    // Track user activity
    this.trackUserActivity();
    
    // Check activity every minute
    this.checkInterval = setInterval(() => {
        this.checkActivityPatterns();
    }, 60000); // 1 minute
    
    // Update last active time periodically
    setInterval(() => {
        this.storage.updateLastActiveTime();
    }, 30000); // Every 30 seconds
}

trackUserActivity() {
    const events = ['click', 'keypress', 'scroll', 'mousemove', 'touchstart'];
    
    events.forEach(event => {
        document.addEventListener(event, () => {
            this.recordActivity();
        }, { passive: true });
    });
}

recordActivity() {
    const now = new Date();
    const timeSinceLastActivity = now - this.lastActivityTime;
    
    this.lastActivityTime = now;
    
    // Log significant activity gaps (more than 5 minutes)
    if (timeSinceLastActivity > 300000) {
        this.activityLog.push({
            type: 'gap',
            duration: timeSinceLastActivity,
            timestamp: now
        });
    }
    
    // Update storage
    this.storage.saveSessionData({
        sessionStartTime: this.sessionStartTime.toISOString(),
        lastActivityTime: this.lastActivityTime.toISOString()
    });
}

checkActivityPatterns() {
    const sessionDuration = this.getSessionDuration();
    const moodIndicator = this.getMoodIndicator();
    
    // Emit activity update
    this.emit('activityUpdate', {
        sessionDuration,
        moodIndicator,
        lastActivity: this.lastActivityTime
    });
    
    // Emit mood indicator update
    this.emit('moodIndicatorUpdate', moodIndicator);
}

getSessionDuration() {
    const now = new Date();
    const duration = now - this.sessionStartTime;
    return Math.floor(duration / 60000); // Return in minutes
}

getMoodIndicator() {
    const sessionMinutes = this.getSessionDuration();
    const recentGaps = this.getRecentActivityGaps();
    
    // Analyze patterns
    let indicator = 'Balanced';
    
    // Long continuous session (>30 min) might indicate elevated mood
    if (sessionMinutes > 30 && recentGaps.length === 0) {
        indicator = 'Elevated (High engagement)';
    } 
    // Very long session (>60 min) might indicate hyperfocus
    else if (sessionMinutes > 60) {
        indicator = 'Highly Elevated (Intense focus)';
    }
    // Short session with gaps might indicate low mood
    else if (sessionMinutes < 10 && recentGaps.length > 0) {
        indicator = 'Low (Limited engagement)';
    }
    // Previous long gap before this session
    else if (this.previousSessionGap && this.previousSessionGap > 86400000) { // >24 hours
        indicator = 'Recovering (Returning after break)';
    }
    // Intermittent activity
    else if (recentGaps.length > 2) {
        indicator = 'Variable (Intermittent focus)';
    }
    
    return indicator;
}

getRecentActivityGaps() {
    const thirtyMinutesAgo = new Date(Date.now() - 1800000);
    return this.activityLog.filter(log => 
        log.type === 'gap' && log.timestamp > thirtyMinutesAgo
    );
}

getLastActiveTime() {
    return this.storage.getLastActiveTime();
}

// Event emitter pattern
on(event, callback) {
    if (!this.listeners[event]) {
        this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
}

emit(event, data) {
    if (this.listeners[event]) {
        this.listeners[event].forEach(callback => callback(data));
    }
}

// Get activity summary for analytics
getActivitySummary() {
    const entries = this.storage.getEntries() || [];
    
    // Calculate average session duration
    const sessionDurations = entries
        .filter(e => e.sessionDuration)
        .map(e => e.sessionDuration);
    
    const avgDuration = sessionDurations.length > 0
        ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length
        : 0;
    
    // Count mood indicators
    const moodCounts = {};
    entries.forEach(entry => {
        if (entry.moodIndicator) {
            moodCounts[entry.moodIndicator] = (moodCounts[entry.moodIndicator] || 0) + 1;
        }
    });
    
    return {
        averageSessionDuration: Math.round(avgDuration),
        currentSession: this.getSessionDuration(),
        moodDistribution: moodCounts,
        totalSessions: entries.length
    };
}

// Clean up
stopMonitoring() {
    if (this.checkInterval) {
        clearInterval(this.checkInterval);
    }
}
```

}