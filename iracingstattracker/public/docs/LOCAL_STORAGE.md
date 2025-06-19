# Local Storage Documentation

## Overview
The iRacing Stat Tracker uses the browser's localStorage API to persist all data locally. This means your data stays on your computer and is accessible even when offline.

## Data Structure

### Race Data
```typescript
interface RaceEntry {
  id: string;
  date: string;
  series: string;
  track: {
    name: string;
    type: 'oval' | 'road';
  };
  vehicle: string;
  result?: {
    startPosition: number;
    finishPosition: number;
    championshipPoints: number;
    incidentPoints: number;
    bestLapTime?: number;
    lapsCompleted?: number;
  };
  status: 'upcoming' | 'completed';
  week: number;
  season: number;
  championshipStanding?: {
    position: number;
    points: number;
    droppedWeeks?: number[];
  };
}
```

### Settings Data
```typescript
interface AppSettings {
  theme: 'light' | 'dark';
  defaultSeries?: string;
  backupFrequency: 'daily' | 'weekly' | 'monthly' | 'never';
  notifications: boolean;
}
```

## Storage Keys
- `iracing_races`: Array of race entries
- `iracing_settings`: Application settings
- `iracing_backup_timestamp`: Last backup timestamp

## Data Management

### Auto-Saving
All changes to races and settings are automatically saved to localStorage. The storage service implements debouncing to prevent excessive writes:

```typescript
const saveToStorage = debounce((key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
}, 1000);
```

### Data Export
You can export your data as a JSON file:
1. Go to Settings
2. Click "Export Data"
3. Choose save location
4. File will contain all races and settings

### Data Import
To import previously exported data:
1. Go to Settings
2. Click "Import Data"
3. Select your backup file
4. Data will be merged with existing data

### Data Limits
- localStorage typically has a 5-10MB limit
- Each race entry is approximately 1KB
- This allows for storing thousands of races
- The app will warn you when approaching storage limits

### Backup System
The app includes an automatic backup system:
1. Configurable backup frequency
2. Backups stored in a separate localStorage key
3. Automatic pruning of old backups
4. Manual backup option in settings

## Troubleshooting

### Storage Full
If you receive a storage full warning:
1. Export your data as backup
2. Clear old or unnecessary races
3. Check browser storage settings
4. Consider clearing other site data

### Data Corruption
If you experience data issues:
1. Export data immediately if possible
2. Clear application data from settings
3. Import the backup
4. If issues persist, check backup files

### Browser Compatibility
- Chrome: 5MB storage limit
- Firefox: 10MB storage limit
- Safari: 5MB storage limit
- Edge: 5MB storage limit

## Best Practices

### Regular Backups
- Enable automatic backups
- Manually export data before major changes
- Keep multiple backup files
- Store backups in different locations

### Data Cleanup
- Remove completed races older than desired
- Clear unused series data
- Regularly check storage usage
- Archive old seasons separately

### Performance Optimization
- The app implements pagination for large datasets
- Uses efficient data structures
- Implements caching for frequently accessed data
- Debounces save operations

## Development Guidelines

### Accessing Storage
```typescript
// Reading data
const races = JSON.parse(localStorage.getItem('iracing_races') || '[]');

// Writing data
localStorage.setItem('iracing_races', JSON.stringify(races));
```

### Error Handling
```typescript
try {
  localStorage.setItem(key, value);
} catch (e) {
  if (e.name === 'QuotaExceededError') {
    // Handle storage full
  }
}
```

### Data Migration
When updating data structures:
1. Check data version
2. Apply necessary transformations
3. Update version number
4. Maintain backward compatibility 