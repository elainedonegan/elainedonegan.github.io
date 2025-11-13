// Pattern Detection Utilities for Mood Tracker
// This module provides analysis functions for mood tracking patterns

(function(window) {
‘use strict’;

const PatternDetection = {
analyzeTimeOfDay: function(entries) {
const hourBuckets = {
lateNight: [],
earlyMorning: [],
morning: [],
afternoon: [],
evening: [],
night: []
};

```
  entries.forEach(entry => {
    const hour = new Date(entry.timestamp).getHours();
    
    if (hour >= 0 && hour < 5) hourBuckets.lateNight.push(entry);
    else if (hour >= 5 && hour < 9) hourBuckets.earlyMorning.push(entry);
    else if (hour >= 9 && hour < 12) hourBuckets.morning.push(entry);
    else if (hour >= 12 && hour < 17) hourBuckets.afternoon.push(entry);
    else if (hour >= 17 && hour < 21) hourBuckets.evening.push(entry);
    else hourBuckets.night.push(entry);
  });

  const mostActiveTime = Object.entries(hourBuckets)
    .sort(([, a], [, b]) => b.length - a.length)[0];

  const concerns = [];
  
  if (hourBuckets.lateNight.length > entries.length * 0.3) {
    concerns.push({
      type: 'lateNightActivity',
      severity: 'high',
      message: 'High late-night activity (12am-5am) may indicate sleep disruption or elevated mood',
      count: hourBuckets.lateNight.length
    });
  }

  if (hourBuckets.earlyMorning.length === 0 && entries.length > 5) {
    concerns.push({
      type: 'morningAvoidance',
      severity: 'medium',
      message: 'No morning entries (5am-9am) could suggest difficulty with mornings',
      count: 0
    });
  }

  return {
    distribution: hourBuckets,
    mostActiveTime: mostActiveTime ? mostActiveTime[0] : null,
    concerns
  };
},

analyzeRapidLogging: function(entries, windowMinutes = 60) {
  if (entries.length < 2) return { clusters: [], concerns: [] };

  const sortedEntries = [...entries].sort((a, b) => 
    new Date(a.timestamp) - new Date(b.timestamp)
  );

  const clusters = [];
  const concerns = [];

  for (let i = 0; i < sortedEntries.length; i++) {
    const currentTime = new Date(sortedEntries[i].timestamp);
    const cluster = [sortedEntries[i]];

    for (let j = i + 1; j < sortedEntries.length; j++) {
      const nextTime = new Date(sortedEntries[j].timestamp);
      const diffMinutes = (nextTime - currentTime) / 60000;

      if (diffMinutes <= windowMinutes) {
        cluster.push(sortedEntries[j]);
      } else {
        break;
      }
    }

    if (cluster.length >= 3) {
      clusters.push({
        startTime: cluster[0].timestamp,
        count: cluster.length,
        entries: cluster
      });
    }
  }

  if (clusters.length > 0) {
    concerns.push({
      type: 'rapidLogging',
      severity: clusters.some(c => c.count >= 5) ? 'high' : 'medium',
      message: `Found ${clusters.length} instance(s) of rapid logging (3+ entries within ${windowMinutes} min)`,
      details: 'May indicate compulsive checking, racing thoughts, or heightened anxiety'
    });
  }

  return { clusters, concerns };
},

analyzeCompletionRates: function(entries, metrics) {
  if (entries.length === 0) return { rates: {}, concerns: [] };

  const metricCompletionCount = {};
  metrics.forEach(metric => {
    metricCompletionCount[metric.id] = 0;
  });

  entries.forEach(entry => {
    Object.keys(entry.data).forEach(metricId => {
      if (metricCompletionCount[metricId] !== undefined) {
        metricCompletionCount[metricId]++;
      }
    });
  });

  const rates = {};
  const concerns = [];
  
  metrics.forEach(metric => {
    const rate = (metricCompletionCount[metric.id] / entries.length) * 100;
    rates[metric.id] = {
      name: metric.name,
      rate: rate.toFixed(1),
      count: metricCompletionCount[metric.id]
    };

    if (rate < 50 && entries.length >= 5) {
      concerns.push({
        type: 'lowCompletion',
        severity: 'low',
        message: `${metric.name} only tracked in ${rate.toFixed(0)}% of entries`,
        metricId: metric.id
      });
    }
  });

  return { rates, concerns };
},

analyzeAvoidancePatterns: function(entries) {
  if (entries.length < 3) return { gaps: [], concerns: [] };

  const sortedEntries = [...entries].sort((a, b) => 
    new Date(a.timestamp) - new Date(b.timestamp)
  );

  const gaps = [];
  
  for (let i = 0; i < sortedEntries.length - 1; i++) {
    const current = new Date(sortedEntries[i].timestamp);
    const next = new Date(sortedEntries[i + 1].timestamp);
    const gapHours = (next - current) / (1000 * 60 * 60);

    if (gapHours > 48) {
      gaps.push({
        start: sortedEntries[i].timestamp,
        end: sortedEntries[i + 1].timestamp,
        durationHours: gapHours,
        durationDays: (gapHours / 24).toFixed(1)
      });
    }
  }

  const concerns = [];
  
  if (gaps.length > 0) {
    const longestGap = gaps.sort((a, b) => b.durationHours - a.durationHours)[0];
    concerns.push({
      type: 'avoidance',
      severity: longestGap.durationDays > 7 ? 'high' : 'medium',
      message: `Longest gap: ${longestGap.durationDays} days without logging`,
      details: 'Extended gaps may indicate avoidance behavior or low mood'
    });
  }

  return { gaps, concerns };
},

analyzeMetricTrends: function(entries, metricId, windowSize = 7) {
  const values = entries
    .filter(e => e.data[metricId] !== undefined)
    .map(e => ({
      value: e.data[metricId],
      timestamp: e.timestamp
    }))
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  if (values.length < 3) return null;

  // Calculate moving average
  const movingAvg = [];
  for (let i = 0; i < values.length; i++) {
    const window = values.slice(Math.max(0, i - windowSize + 1), i + 1);
    const avg = window.reduce((sum, v) => sum + v.value, 0) / window.length;
    movingAvg.push(avg);
  }

  // Detect trend direction
  const recentValues = values.slice(-windowSize);
  const recentAvg = recentValues.reduce((sum, v) => sum + v.value, 0) / recentValues.length;
  const olderValues = values.slice(-windowSize * 2, -windowSize);
  const olderAvg = olderValues.length > 0 
    ? olderValues.reduce((sum, v) => sum + v.value, 0) / olderValues.length 
    : recentAvg;

  const trendDirection = recentAvg > olderAvg + 1 ? 'increasing' 
    : recentAvg < olderAvg - 1 ? 'decreasing' 
    : 'stable';

  return {
    current: values[values.length - 1].value,
    average: recentAvg.toFixed(1),
    trend: trendDirection,
    change: (recentAvg - olderAvg).toFixed(1)
  };
},

analyzeMetricCorrelations: function(entries, metricId1, metricId2) {
  const pairs = entries
    .filter(e => e.data[metricId1] !== undefined && e.data[metricId2] !== undefined)
    .map(e => ({
      x: e.data[metricId1],
      y: e.data[metricId2]
    }));

  if (pairs.length < 3) return null;

  // Simple correlation calculation
  const meanX = pairs.reduce((sum, p) => sum + p.x, 0) / pairs.length;
  const meanY = pairs.reduce((sum, p) => sum + p.y, 0) / pairs.length;

  const numerator = pairs.reduce((sum, p) => sum + (p.x - meanX) * (p.y - meanY), 0);
  const denomX = Math.sqrt(pairs.reduce((sum, p) => sum + Math.pow(p.x - meanX, 2), 0));
  const denomY = Math.sqrt(pairs.reduce((sum, p) => sum + Math.pow(p.y - meanY, 2), 0));

  const correlation = numerator / (denomX * denomY);

  let strength = 'weak';
  if (Math.abs(correlation) > 0.7) strength = 'strong';
  else if (Math.abs(correlation) > 0.4) strength = 'moderate';

  let direction = correlation > 0 ? 'positive' : 'negative';

  return {
    correlation: correlation.toFixed(2),
    strength,
    direction,
    sampleSize: pairs.length
  };
},

generateInsights: function(entries, metrics) {
  const allConcerns = [];

  const timeAnalysis = PatternDetection.analyzeTimeOfDay(entries);
  allConcerns.push(...timeAnalysis.concerns);

  const rapidAnalysis = PatternDetection.analyzeRapidLogging(entries);
  allConcerns.push(...rapidAnalysis.concerns);

  const completionAnalysis = PatternDetection.analyzeCompletionRates(entries, metrics);
  allConcerns.push(...completionAnalysis.concerns);

  const avoidanceAnalysis = PatternDetection.analyzeAvoidancePatterns(entries);
  allConcerns.push(...avoidanceAnalysis.concerns);

  const severityOrder = { high: 0, medium: 1, low: 2 };
  allConcerns.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return {
    concerns: allConcerns,
    timeAnalysis,
    rapidAnalysis,
    completionAnalysis,
    avoidanceAnalysis
  };
}
```

};

// Expose to global scope
window.PatternDetection = PatternDetection;

})(window);