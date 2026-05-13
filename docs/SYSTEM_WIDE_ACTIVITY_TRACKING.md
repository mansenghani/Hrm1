# System-Wide Activity Tracking

## Overview
The desktop tracker now uses **Electron's `powerMonitor.getSystemIdleTime()`** to detect activity across **ALL applications on the PC**, not just the Electron window.

## How It Works

### Main Process (main.js)
Every second, the main process:
1. Calls `powerMonitor.getSystemIdleTime()` — returns seconds since last keyboard/mouse activity **anywhere on the PC**
2. Compares to `IDLE_THRESHOLD_SECONDS` (60s test mode)
3. Sends comprehensive status to renderer via IPC:
   ```js
   {
     idleSeconds: 45,        // actual system idle time
     isIdle: false,          // true if >= threshold
     isActive: false,        // true if idleSeconds === 0
     timestamp: 1234567890
   }
   ```

### Renderer Process (renderer.js)
Receives system-wide activity status:
- **If `isActive === true`**: Updates `lastLocalActivity` timestamp (activity detected in ANY app)
- **If `isIdle === true`**: Immediately sends `type: 'idle'` to backend → triggers idle transition

### Backend (timeTrackController.js)
Receives `type: 'idle'` heartbeat:
- Increments `inactivityCount`
- Sets `idleTime = inactivityCount × 60`
- Pauses timer
- Emits socket event to frontend

## Activity Detection Coverage

✅ **Detected across ALL apps:**
- Chrome / Edge / Firefox
- VS Code / Visual Studio
- Word / Excel / PowerPoint
- WhatsApp / Slack / Teams
- File Explorer
- Any keyboard/mouse activity on PC

❌ **NOT limited to:**
- Electron window focus
- Renderer process events
- Window-level listeners

## Testing

### Test 1: Work in Other Apps
1. Start timer in Electron tracker
2. Minimize tracker
3. Work in Chrome / VS Code / Word for 5 minutes
4. **Expected:** Timer continues, no false idle

### Test 2: True Inactivity
1. Start timer
2. Leave PC completely untouched for 1 minute
3. **Expected:** 
   - Idle notification appears
   - Timer pauses
   - `inactivityCount += 1`
   - `idleTime += 60s`
   - `activeTime` unchanged

### Test 3: Resume After Idle
1. After idle, move mouse or type in ANY app
2. Click Resume in tracker
3. **Expected:** Timer resumes, `idleApplied` resets

## Configuration

**Idle Threshold:**
- Main process: `IDLE_THRESHOLD_SECONDS = 60` (line 68 in main.js)
- Renderer: `IDLE_THRESHOLD_MS = 60 * 1000` (line 18 in renderer.js)
- Backend: `IDLE_THRESHOLD_SECONDS = 60` (line 17 in timeTrackController.js)

**Change to 5 minutes for production:**
```js
const IDLE_THRESHOLD_SECONDS = 300; // 5 minutes
```

## Architecture

```
┌─────────────────────────────────────────────┐
│  ANY APP ON PC (Chrome, Word, VS Code...)  │
│  Keyboard/Mouse Activity                    │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  Electron Main Process                      │
│  powerMonitor.getSystemIdleTime()           │
│  ↓ every 1 second                           │
│  IPC → 'system-activity-status'             │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  Renderer Process                           │
│  onSystemActivity({ idleSeconds, isIdle })  │
│  ↓ if isIdle                                │
│  POST /api/time/activity { type: 'idle' }  │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  Backend                                    │
│  inactivityCount++                          │
│  idleTime = count × 60                      │
│  status = 'idle'                            │
│  Socket emit → 'timer_paused'               │
└─────────────────────────────────────────────┘
```

## Key Files Modified

1. **desktop-tracker/main.js**
   - Added system-wide idle detection loop
   - Sends `system-activity-status` every second

2. **desktop-tracker/preload.js**
   - Exposed `onSystemActivity` IPC channel

3. **desktop-tracker/renderer.js**
   - Listens to `onSystemActivity`
   - Calls `sendHeartbeat_idle()` when system idle detected
   - Window events kept only for UI interactions (not idle detection)

## Production Checklist

- [ ] Change `IDLE_THRESHOLD_SECONDS` to 300 (5 min) in all 3 files
- [ ] Remove debug console.log in main.js (line 82)
- [ ] Test on Windows / macOS / Linux
- [ ] Verify no false idle during active work
- [ ] Verify true idle detection after 5 min inactivity
