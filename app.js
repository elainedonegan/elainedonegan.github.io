// Main Mood Tracker Application
const { useState, useEffect } = React;
const { Plus, Trash2, TrendingUp, Activity, Moon, Sun, Calendar, AlertTriangle, BarChart3, Clock } = lucide;

function MoodTracker() {
const [metrics, setMetrics] = useState([
{ id: 1, name: ‘Mood’, type: ‘scale’, min: 1, max: 10 },
{ id: 2, name: ‘Irritability’, type: ‘scale’, min: 1, max: 10 },
{ id: 3, name: ‘Hours of Sleep’, type: ‘number’, min: 0, max: 24 },
{ id: 4, name: ‘Energy Level’, type: ‘emoji’, options: [‘😴’, ‘😑’, ‘🙂’, ‘😊’, ‘⚡’] },
{ id: 5, name: ‘Social Interaction’, type: ‘boolean’, label: ‘Had social interaction today’ }
]);

const [entries, setEntries] = useState([]);
const [currentEntry, setCurrentEntry] = useState({});
const [newMetricName, setNewMetricName] = useState(’’);
const [newMetricType, setNewMetricType] = useState(‘scale’);
const [showAddMetric, setShowAddMetric] = useState(false);
const [lastActiveTime, setLastActiveTime] = useState(Date.now());
const [sessionStart, setSessionStart] = useState(Date.now());
const [autoInferredMood, setAutoInferredMood] = useState(null);
const [showInsights, setShowInsights] = useState(false);
const [insights, setInsights] = useState(null);

const metricTypeOptions = [
{ value: ‘scale’, label: ‘Scale (1-10)’, description: ‘Numeric scale with min/max’ },
{ value: ‘number’, label: ‘Number’, description: ‘Any numeric value’ },
{ value: ‘boolean’, label: ‘Yes/No’, description: ‘True or false checkbox’ },
{ value: ‘emoji’, label: ‘Emoji Scale’, description: ‘Visual scale with emojis’ },
{ value: ‘text’, label: ‘Text Note’, description: ‘Short text entry’ },
{ value: ‘multiChoice’, label: ‘Multiple Choice’, description: ‘Select from options’ }
];

useEffect(() => {
const activityInterval = setInterval(() => {
const now = Date.now();
const timeSinceLastActive = now - lastActiveTime;
const sessionDuration = now - sessionStart;

```
  if (sessionDuration < 120000) {
    setAutoInferredMood({ mood: 'elevated', confidence: 'low', reason: 'Quick check-in' });
  } else if (sessionDuration > 600000) {
    setAutoInferredMood({ mood: 'elevated', confidence: 'medium', reason: 'Extended engagement' });
  } else {
    setAutoInferredMood({ mood: 'neutral', confidence: 'low', reason: 'Normal session' });
  }
  
  if (timeSinceLastActive > 86400000) {
    setAutoInferredMood({ mood: 'low', confidence: 'high', reason: 'Extended absence from app' });
  }
}, 30000);

return () => clearInterval(activityInterval);
```

}, [lastActiveTime, sessionStart]);

useEffect(() => {
if (entries.length >= 3 && window.PatternDetection) {
const newInsights = window.PatternDetection.generateInsights(entries, metrics);
setInsights(newInsights);
}
}, [entries, metrics]);

useEffect(() => {
const handleActivity = () => {
setLastActiveTime(Date.now());
};

```
window.addEventListener('click', handleActivity);
window.addEventListener('keypress', handleActivity);
window.addEventListener('scroll', handleActivity);

return () => {
  window.removeEventListener('click', handleActivity);
  window.removeEventListener('keypress', handleActivity);
  window.removeEventListener('scroll', handleActivity);
};
```

}, []);

const addMetric = () => {
if (newMetricName.trim()) {
const newMetric = {
id: Date.now(),
name: newMetricName,
type: newMetricType
};

```
  switch (newMetricType) {
    case 'scale':
      newMetric.min = 1;
      newMetric.max = 10;
      break;
    case 'number':
      newMetric.min = 0;
      newMetric.max = 100;
      break;
    case 'emoji':
      newMetric.options = ['😢', '😐', '🙂', '😊', '😄'];
      break;
    case 'boolean':
      newMetric.label = newMetricName;
      break;
    case 'multiChoice':
      newMetric.options = ['Option 1', 'Option 2', 'Option 3'];
      break;
  }

  setMetrics([...metrics, newMetric]);
  setNewMetricName('');
  setShowAddMetric(false);
}
```

};

const removeMetric = (id) => {
setMetrics(metrics.filter(m => m.id !== id));
setEntries(entries.map(entry => {
const newData = { …entry.data };
delete newData[id];
return { …entry, data: newData };
}));
};

const updateCurrentEntry = (metricId, value) => {
setCurrentEntry({
…currentEntry,
[metricId]: value
});
};

const saveEntry = () => {
const newEntry = {
id: Date.now(),
timestamp: new Date().toISOString(),
data: currentEntry,
autoInferred: autoInferredMood,
sessionDuration: Date.now() - sessionStart
};
setEntries([newEntry, …entries]);
setCurrentEntry({});
setSessionStart(Date.now());
};

const getMoodIcon = (mood) => {
if (!mood) return <Activity size={20} />;
switch (mood.mood) {
case ‘elevated’: return <Sun size={20} className="text-yellow-500" />;
case ‘low’: return <Moon size={20} className="text-blue-500" />;
default: return <Activity size={20} className="text-gray-500" />;
}
};

const getAverageForMetric = (metricId) => {
const metric = metrics.find(m => m.id === metricId);
if (!metric || metric.type === ‘text’ || metric.type === ‘boolean’ || metric.type === ‘multiChoice’) return null;

```
const values = entries
  .map(e => {
    const value = e.data[metricId];
    if (metric.type === 'emoji') {
      return metric.options.indexOf(value) + 1;
    }
    return value;
  })
  .filter(v => v !== undefined);

if (values.length === 0) return null;
return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
```

};

const formatDate = (isoString) => {
const date = new Date(isoString);
return date.toLocaleString(‘en-US’, {
month: ‘short’,
day: ‘numeric’,
hour: ‘2-digit’,
minute: ‘2-digit’
});
};

const formatDuration = (ms) => {
const minutes = Math.floor(ms / 60000);
if (minutes < 1) return ‘< 1 min’;
if (minutes < 60) return `${minutes} min`;
const hours = Math.floor(minutes / 60);
const remainingMins = minutes % 60;
return `${hours}h ${remainingMins}m`;
};

const renderMetricInput = (metric) => {
switch (metric.type) {
case ‘scale’:
return (
<input
type=“number”
min={metric.min}
max={metric.max}
step=“0.5”
value={currentEntry[metric.id] || ‘’}
onChange={(e) => updateCurrentEntry(metric.id, parseFloat(e.target.value))}
className=“w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent”
placeholder={`${metric.min}-${metric.max}`}
/>
);

```
  case 'number':
    return (
      <input
        type="number"
        value={currentEntry[metric.id] || ''}
        onChange={(e) => updateCurrentEntry(metric.id, parseFloat(e.target.value))}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        placeholder="Enter value"
      />
    );
  
  case 'boolean':
    return (
      <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
        <input
          type="checkbox"
          checked={currentEntry[metric.id] || false}
          onChange={(e) => updateCurrentEntry(metric.id, e.target.checked)}
          className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
        />
        <span className="text-gray-700">{metric.label || metric.name}</span>
      </label>
    );
  
  case 'emoji':
    return (
      <div className="flex gap-2 justify-around">
        {metric.options.map((emoji, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => updateCurrentEntry(metric.id, emoji)}
            className={`text-4xl p-3 rounded-lg transition-all ${
              currentEntry[metric.id] === emoji 
                ? 'bg-purple-100 scale-110 ring-2 ring-purple-500' 
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            {emoji}
          </button>
        ))}
      </div>
    );
  
  case 'text':
    return (
      <input
        type="text"
        value={currentEntry[metric.id] || ''}
        onChange={(e) => updateCurrentEntry(metric.id, e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        placeholder="Enter note"
      />
    );
  
  case 'multiChoice':
    return (
      <select
        value={currentEntry[metric.id] || ''}
        onChange={(e) => updateCurrentEntry(metric.id, e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      >
        <option value="">Select option...</option>
        {metric.options.map((option, idx) => (
          <option key={idx} value={option}>{option}</option>
        ))}
      </select>
    );
  
  default:
    return null;
}
```

};

const renderMetricValue = (metric, value) => {
if (value === undefined || value === null || value === ‘’) return ‘-’;

```
switch (metric.type) {
  case 'boolean':
    return value ? '✓ Yes' : '✗ No';
  case 'emoji':
    return <span className="text-2xl">{value}</span>;
  default:
    return value;
}
```

};

const getSeverityColor = (severity) => {
switch (severity) {
case ‘high’: return ‘text-red-600 bg-red-50 border-red-200’;
case ‘medium’: return ‘text-yellow-600 bg-yellow-50 border-yellow-200’;
case ‘low’: return ‘text-blue-600 bg-blue-50 border-blue-200’;
default: return ‘text-gray-600 bg-gray-50 border-gray-200’;
}
};

return (
<div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 md:p-8">
<div className="max-w-4xl mx-auto">
{/* Header */}
<div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
<div className="flex items-center justify-between mb-4">
<h1 className="text-3xl font-bold text-gray-800">Mood Tracker</h1>
<div className="flex items-center gap-3">
{insights && insights.concerns.length > 0 && (
<button
onClick={() => setShowInsights(!showInsights)}
className=“flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors”
>
<AlertTriangle size={20} />
<span className="font-semibold">{insights.concerns.length}</span>
</button>
)}
<Calendar size={32} className="text-purple-600" />
</div>
</div>

```
      {autoInferredMood && (
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-4 flex items-center gap-3">
          {getMoodIcon(autoInferredMood)}
          <div>
            <div className="font-semibold text-gray-800 capitalize">
              {autoInferredMood.mood} Mood Detected
            </div>
            <div className="text-sm text-gray-600">
              {autoInferredMood.reason} • {autoInferredMood.confidence} confidence
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Insights Panel */}
    {showInsights && insights && (
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={24} className="text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-800">Pattern Insights</h2>
        </div>

        {insights.concerns.length > 0 && (
          <div className="space-y-3 mb-6">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
              <AlertTriangle size={20} />
              Detected Patterns
            </h3>
            {insights.concerns.map((concern, idx) => (
              <div
                key={idx}
                className={`border rounded-lg p-4 ${getSeverityColor(concern.severity)}`}
              >
                <div className="font-semibold mb-1">{concern.message}</div>
                {concern.details && (
                  <div className="text-sm opacity-90">{concern.details}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {insights.timeAnalysis && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-3">
              <Clock size={20} />
              Activity by Time of Day
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(insights.timeAnalysis.distribution).map(([period, entries]) => (
                <div key={period} className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 capitalize mb-1">
                    {period.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className="text-2xl font-bold text-gray-800">{entries.length}</div>
                  {insights.timeAnalysis.mostActiveTime === period && (
                    <div className="text-xs text-purple-600 font-semibold mt-1">Most Active</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )}

    {/* Manage Metrics */}
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Tracking Metrics</h2>
        <button
          onClick={() => setShowAddMetric(!showAddMetric)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus size={16} />
          Add Metric
        </button>
      </div>

      {showAddMetric && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <input
            type="text"
            placeholder="Metric name (e.g., Energy Level)"
            value={newMetricName}
            onChange={(e) => setNewMetricName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <div className="grid grid-cols-2 gap-2 mb-3">
            {metricTypeOptions.map(option => (
              <label key={option.value} className="flex items-start gap-2 p-2 border rounded-lg cursor-pointer hover:bg-white">
                <input
                  type="radio"
                  value={option.value}
                  checked={newMetricType === option.value}
                  onChange={(e) => setNewMetricType(e.target.value)}
                  className="mt-1 text-purple-600"
                />
                <div>
                  <div className="text-sm font-medium">{option.label}</div>
                  <div className="text-xs text-gray-500">{option.description}</div>
                </div>
              </label>
            ))}
          </div>
          <button
            onClick={addMetric}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Save Metric
          </button>
        </div>
      )}

      <div className="space-y-2">
        {metrics.map(metric => (
          <div
            key={metric.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <TrendingUp size={20} className="text-purple-600" />
              <div>
                <div className="font-medium text-gray-800">{metric.name}</div>
                <div className="text-sm text-gray-500">
                  {metricTypeOptions.find(o => o.value === metric.type)?.label}
                  {getAverageForMetric(metric.id) && (
                    <span className="ml-2 text-purple-600">
                      Avg: {getAverageForMetric(metric.id)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => removeMetric(metric.id)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>

    {/* Log Entry */}
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Log Entry</h2>
      
      <div className="space-y-4 mb-4">
        {metrics.map(metric => (
          <div key={metric.id}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {metric.name}
            </label>
            {renderMetricInput(metric)}
          </div>
        ))}
      </div>

      <button
        onClick={saveEntry}
        disabled={Object.keys(currentEntry).length === 0}
        className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold"
      >
        Save Entry
      </button>
    </div>

    {/* History */}
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">History</h2>
      
      {entries.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No entries yet. Start tracking!</p>
      ) : (
        <div className="space-y-3">
          {entries.map(entry => (
            <div
              key={entry.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">{formatDate(entry.timestamp)}</span>
                {entry.autoInferred && (
                  <div className="flex items-center gap-2 text-sm">
                    {getMoodIcon(entry.autoInferred)}
                    <span className="text-gray-600">
                      {entry.autoInferred.mood} • {formatDuration(entry.sessionDuration)} session
                    </span>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {metrics.map(metric => (
                  entry.data[metric.id] !== undefined && (
                    <div key={metric.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">{metric.name}</div>
                      <div className="text-lg font-semibold text-gray-800">
                        {renderMetricValue(metric, entry.data[metric.id])}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
</div>
```

);
}

// Initialize the app
const root = ReactDOM.createRoot(document.getElementById(‘root’));
root.render(<MoodTracker />);