// Insights Manager - generates analytics and patterns from tracking data
export class InsightsManager {
constructor(storage, activityMonitor) {
this.storage = storage;
this.activityMonitor = activityMonitor;
}

```
updateAll() {
    this.updateSessionDuration();
    this.updateMoodIndicator();
    this.updateDaysTracked();
}

updateSessionDuration() {
    const duration = this.activityMonitor.getSessionDuration();
    const element = document.getElementById('session-duration');
    if (element) {
        if (duration === 0) {
            element.textContent = 'Just started';
        } else if (duration === 1) {
            element.textContent = '1 minute';
        } else if (duration < 60) {
            element.textContent = `${duration} minutes`;
        } else {
            const hours = Math.floor(duration / 60);
            const mins = duration % 60;
            element.textContent = `${hours}h ${mins}m`;
        }
    }
}

updateMoodIndicator() {
    const indicator = this.activityMonitor.getMoodIndicator();
    const element = document.getElementById('mood-indicator');
    if (element) {
        element.textContent = indicator;
        
        // Add color coding based on indicator
        const card = element.closest('.insight-card');
        if (card) {
            // Remove existing gradient classes
            card.style.background = '';
            
            if (indicator.includes('Elevated')) {
                card.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
            } else if (indicator.includes('Low')) {
                card.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            } else if (indicator.includes('Variable')) {
                card.style.background = 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)';
            } else {
                card.style.background = 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)';
            }
        }
    }
}

updateDaysTracked() {
    const days = this.storage.getTotalDaysTracked();
    const element = document.getElementById('days-tracked');
    if (element) {
        element.textContent = days.toString();
    }
}

updateActivityInsights(data) {
    this.updateSessionDuration();
    this.updateMoodIndicator();
}

// Generate insights for a specific time period
generatePeriodInsights(startDate, endDate) {
    const entries = this.storage.getEntriesInRange(startDate, endDate);
    
    if (entries.length === 0) {
        return {
            message: 'No data available for this period',
            hasData: false
        };
    }
    
    const insights = {
        hasData: true,
        totalEntries: entries.length,
        patterns: this.analyzePatterns(entries),
        trends: this.analyzeTrends(entries),
        correlations: this.findCorrelations(entries),
        recommendations: this.generateRecommendations(entries)
    };
    
    return insights;
}

analyzePatterns(entries) {
    const patterns = {
        timeOfDay: {},
        dayOfWeek: {},
        moodIndicators: {}
    };
    
    entries.forEach(entry => {
        const date = new Date(entry.timestamp);
        
        // Time of day analysis
        const hour = date.getHours();
        const timeSlot = this.getTimeSlot(hour);
        patterns.timeOfDay[timeSlot] = (patterns.timeOfDay[timeSlot] || 0) + 1;
        
        // Day of week analysis
        const dayName = this.getDayName(date.getDay());
        patterns.dayOfWeek[dayName] = (patterns.dayOfWeek[dayName] || 0) + 1;
        
        // Mood indicator analysis
        if (entry.moodIndicator) {
            patterns.moodIndicators[entry.moodIndicator] = 
                (patterns.moodIndicators[entry.moodIndicator] || 0) + 1;
        }
    });
    
    return patterns;
}

analyzeTrends(entries) {
    const trends = {};
    const trackingItems = this.storage.getTrackingItems() || [];
    
    trackingItems.forEach(item => {
        if (item.type !== 'text') {
            const values = entries
                .filter(e => e.values && e.values[item.name])
                .map(e => ({
                    timestamp: e.timestamp,
                    value: parseFloat(e.values[item.name])
                }))
                .filter(v => !isNaN(v.value));
            
            if (values.length >= 2) {
                trends[item.name] = this.calculateTrend(values);
            }
        }
    });
    
    return trends;
}

calculateTrend(values) {
    // Simple trend calculation: compare average of first half vs second half
    const midpoint = Math.floor(values.length / 2);
    const firstHalf = values.slice(0, midpoint);
    const secondHalf = values.slice(midpoint);
    
    const avgFirst = firstHalf.reduce((sum, v) => sum + v.value, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((sum, v) => sum + v.value, 0) / secondHalf.length;
    
    const change = ((avgSecond - avgFirst) / avgFirst) * 100;
    
    let trend = 'stable';
    if (change > 10) trend = 'increasing';
    else if (change < -10) trend = 'decreasing';
    
    return {
        trend: trend,
        changePercent: change.toFixed(1),
        currentAverage: avgSecond.toFixed(1),
        previousAverage: avgFirst.toFixed(1)
    };
}

findCorrelations(entries) {
    const correlations = [];
    const trackingItems = this.storage.getTrackingItems() || [];
    const numericItems = trackingItems.filter(item => item.type !== 'text');
    
    // Find correlations between numeric items
    for (let i = 0; i < numericItems.length; i++) {
        for (let j = i + 1; j < numericItems.length; j++) {
            const item1 = numericItems[i];
            const item2 = numericItems[j];
            
            const correlation = this.calculateCorrelation(entries, item1.name, item2.name);
            
            if (Math.abs(correlation) > 0.5) { // Only show strong correlations
                correlations.push({
                    items: [item1.name, item2.name],
                    strength: correlation,
                    description: this.describeCorrelation(correlation)
                });
            }
        }
    }
    
    return correlations;
}

calculateCorrelation(entries, item1Name, item2Name) {
    const pairs = entries
        .filter(e => e.values && e.values[item1Name] && e.values[item2Name])
        .map(e => ({
            x: parseFloat(e.values[item1Name]),
            y: parseFloat(e.values[item2Name])
        }))
        .filter(p => !isNaN(p.x) && !isNaN(p.y));
    
    if (pairs.length < 3) return 0;
    
    // Calculate Pearson correlation coefficient
    const n = pairs.length;
    const sumX = pairs.reduce((sum, p) => sum + p.x, 0);
    const sumY = pairs.reduce((sum, p) => sum + p.y, 0);
    const sumXY = pairs.reduce((sum, p) => sum + p.x * p.y, 0);
    const sumX2 = pairs.reduce((sum, p) => sum + p.x * p.x, 0);
    const sumY2 = pairs.reduce((sum, p) => sum + p.y * p.y, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    if (denominator === 0) return 0;
    
    return numerator / denominator;
}

describeCorrelation(value) {
    if (value > 0.7) return 'Strong positive correlation';
    if (value > 0.3) return 'Moderate positive correlation';
    if (value < -0.7) return 'Strong negative correlation';
    if (value < -0.3) return 'Moderate negative correlation';
    return 'Weak correlation';
}

generateRecommendations(entries) {
    const recommendations = [];
    const patterns = this.analyzePatterns(entries);
    const activitySummary = this.activityMonitor.getActivitySummary();
    
    // Check for mood indicator patterns
    const moodCounts = patterns.moodIndicators;
    const totalMoods = Object.values(moodCounts).reduce((sum, count) => sum + count, 0);
    
    if (totalMoods > 0) {
        const elevatedPercent = ((moodCounts['Elevated (High engagement)'] || 0) + 
                                (moodCounts['Highly Elevated (Intense focus)'] || 0)) / totalMoods;
        const lowPercent = (moodCounts['Low (Limited engagement)'] || 0) / totalMoods;
        
        if (elevatedPercent > 0.5) {
            recommendations.push({
                type: 'pattern',
                message: 'You\'ve been showing high engagement patterns. Consider scheduling breaks to maintain balance.'
            });
        }
        
        if (lowPercent > 0.3) {
            recommendations.push({
                type: 'support',
                message: 'Lower engagement has been noted. Try setting small, achievable goals to boost motivation.'
            });
        }
    }
    
    // Check tracking consistency
    const daysTracked = this.storage.getTotalDaysTracked();
    if (entries.length < daysTracked * 2) {
        recommendations.push({
            type: 'consistency',
            message: 'Try to track multiple times per day for more detailed insights.'
        });
    }
    
    return recommendations;
}

getTimeSlot(hour) {
    if (hour >= 5 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 17) return 'Afternoon';
    if (hour >= 17 && hour < 21) return 'Evening';
    return 'Night';
}

getDayName(dayIndex) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex];
}
```

}