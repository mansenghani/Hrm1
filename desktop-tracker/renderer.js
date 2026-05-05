let activeSeconds = 0;
let inactiveSeconds = 0;
let timerInterval = null;
let syncInterval = null;
let status = 'OFFLINE';
let lastActivity = Date.now();
let serverLastActivity = Date.now();
let lastActivityType = 'mouse';
let isIdle = false;
let idleNotificationSent = false;
let authToken = '';
let statusPollInterval = null;
let lastActionTime = 0; // Guard for polling sync

const API_BASE = 'http://localhost:5000/api/time';
const IDLE_THRESHOLD = 5 * 60 * 1000; // 5 Minutes in ms
const SYNC_INTERVAL = 15 * 1000; // 15 Second sync
const STATUS_POLL = 10000; // Increased poll since we have sockets
let socket = null;

const activeTimerEl = document.getElementById('active-timer');
const inactiveTimerEl = document.getElementById('inactive-timer');
const statusEl = document.getElementById('status-display');
const syncIndicator = document.getElementById('sync-indicator');

// 🔄 LOAD PERSISTENT SESSION
async function loadSession() {
    requestNotificationPermission();

    const savedToken = await window.electronAPI.getStoreValue('authToken');
    if (!savedToken) {
        document.getElementById('auth-section').style.display = 'flex';
        status = 'OFFLINE';
        updateUI();
        return;
    }

    authToken = savedToken;
    document.getElementById('auth-section').style.display = 'none';
    await fetchUserProfile();
    initSocket();

    const statusLoaded = await fetchSessionStatus();
    if (!statusLoaded) {
        authToken = '';
        await window.electronAPI.setStoreValue('authToken', '');
        document.getElementById('auth-section').style.display = 'flex';
        status = 'OFFLINE';
        updateUI();
        return;
    }

    startStatusPolling();
}

loadSession();

// 🟢 START TRACKING
async function startSession() {
    if (!authToken) return alert('Please login first.');

    if (status === 'PAUSED' || status === 'IDLE') {
        return resumeSession();
    }

    idleNotificationSent = false;
    isIdle = false;
    lastActivityType = 'mouse';
    serverLastActivity = Date.now();

    try {
        const response = await fetch(`${API_BASE}/start`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (!response.ok) {
            const err = await response.json();
            return alert(err.message || 'Unable to start session.');
        }
        await fetchSessionStatus();
        lastActivity = Date.now();
        lastActionTime = Date.now();
        updateUI();
    } catch (err) {
        console.error('Start failed:', err);
        alert('Unable to start session.');
    }
}

function setControlState(currentStatus) {
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resumeBtn = document.getElementById('resume-btn');
    const binaryControls = document.querySelector('.binary-controls');

    if (currentStatus === 'ACTIVE') {
        startBtn.style.display = 'none';
        binaryControls.style.display = 'flex';
        pauseBtn.style.display = 'flex';
        resumeBtn.style.display = 'none';
        statusEl.innerText = 'ACTIVE';
        statusEl.className = 'status-badge status-active';
    } else if (currentStatus === 'PAUSED' || currentStatus === 'IDLE') {
        startBtn.style.display = 'none';
        binaryControls.style.display = 'flex';
        pauseBtn.style.display = 'none';
        resumeBtn.style.display = 'flex';
        statusEl.innerText = currentStatus;
        statusEl.className = 'status-badge status-idle';
    } else {
        startBtn.style.display = 'flex';
        binaryControls.style.display = 'none';
        statusEl.innerText = 'OFFLINE';
        statusEl.className = 'status-badge';
    }
}

function updateUI() {
    setControlState(status);
    const alertBox = document.getElementById('desktop-alert');
    if (status !== 'IDLE' && alertBox) {
        alertBox.style.display = 'none';
        idleNotificationSent = false;
    }
}

function startTimers() {
    // 🛡️ PREVENT INTERVAL MULTIPLICATION
    if (!timerInterval) {
        timerInterval = setInterval(() => {
            const now = Date.now();
            
            if (status === 'ACTIVE') {
                activeSeconds++;
                // 🛡️ TRUST LOCAL ACTIVITY FOR IDLE TRANSITION
                // We don't wait for serverLastActivity anymore to prevent "stuck" timers
                if (Date.now() - lastActivity > IDLE_THRESHOLD) {
                    console.log('Idle Threshold Hit (Local Activity)');
                    enterIdle();
                }
            } else if (status === 'IDLE') {
                inactiveSeconds++;
            }
            
            updateDisplay();
            saveProgress();
        }, 1000);
    }

    if (!syncInterval) {
        syncInterval = setInterval(syncWithServer, SYNC_INTERVAL);
    }
}

let lastNotificationTs = 0;
async function notifyDesktop(title, body) {
    const now = Date.now();
    if (now - lastNotificationTs < 60000) return true; // 1 minute throttle
    
    lastNotificationTs = now;
    const payload = { title, body };

    const tryRendererNotification = () => {
        try {
            if (window.Notification && window.Notification.permission !== 'denied') {
                if (window.Notification.permission !== 'granted') {
                    window.Notification.requestPermission();
                }
                if (window.Notification.permission === 'granted') {
                    new window.Notification(title, { body });
                    console.log('Renderer notification shown:', title);
                    return true;
                }
            }
        } catch (err) {
            console.error('Renderer notification failed:', err);
        }
        return false;
    };

    if (window.electronAPI && typeof window.electronAPI.notifyNative === 'function') {
        try {
            console.log('Requesting native notification via IPC:', payload);
            const result = await window.electronAPI.notifyNative(title, body);
            if (result) return true;
            console.warn('Native notification handler returned false; falling back to renderer notification.');
        } catch (err) {
            console.error('Native notify failed:', err);
        }
    } else {
        console.warn('Native notification API not available.');
    }

    return tryRendererNotification();
}

function showAppAlert(title, message) {
    const alertEl = document.getElementById('desktop-alert');
    if (!alertEl) return;
    alertEl.querySelector('.alert-title').innerText = title;
    alertEl.querySelector('.alert-text').innerText = message;
    alertEl.style.display = 'flex';
}

function hideAppAlert() {
    const alertEl = document.getElementById('desktop-alert');
    if (!alertEl) return;
    alertEl.style.display = 'none';
}

async function showIdleNotification() {
    if (idleNotificationSent) return;
    idleNotificationSent = true;
    showAppAlert('Inactivity Detected', 'No activity for 5 minutes. Time tracking paused.');
    await notifyDesktop('Inactivity Detected', 'No activity for 5 minutes. Time tracking paused.');
}

async function enterIdle() {
    if (status !== 'ACTIVE' || idleNotificationSent) return;
    lastActionTime = Date.now();
    status = 'IDLE';
    isIdle = true;
    
    // ✂️ INSTANT DEDUCTION (UI Sync)
    // Remove the 5-minute wait time from the active clock and move it to inactive
    activeSeconds = Math.max(0, activeSeconds - (IDLE_THRESHOLD / 1000));
    inactiveSeconds += (IDLE_THRESHOLD / 1000);
    updateDisplay();
    
    // 🛡️ IMMEDIATELY NOTIFY SERVER OF IDLE STATE
    // This prevents the status poller from seeing a stale ACTIVE status and resuming the timer
    await syncWithServer('idle');
    
    // Stop intervals during idle
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    if (syncInterval) { clearInterval(syncInterval); syncInterval = null; }
    
    document.getElementById('pause-btn').style.display = 'none';
    document.getElementById('resume-btn').style.display = 'flex';
    updateUI();
    await showIdleNotification();
}

async function resumeSession() {
    if (!authToken) return alert('Please login first.');
    
    // 🚀 INSTANT UI FEEDBACK
    lastActionTime = Date.now();
    idleNotificationSent = false;
    isIdle = false;
    status = 'ACTIVE';
    lastActivity = Date.now();
    serverLastActivity = Date.now();
    
    // Force immediate timer restart
    if (timerInterval) clearInterval(timerInterval);
    if (syncInterval) clearInterval(syncInterval);
    timerInterval = null;
    syncInterval = null;
    startTimers();
    updateUI();
    
    try {
        const response = await fetch(`${API_BASE}/resume`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (!response.ok) {
            const err = await response.json();
            await fetchSessionStatus();
            if (err.message?.toLowerCase().includes('already')) return;
            return alert(err.message || 'Unable to resume session.');
        }
        await fetchSessionStatus();
    } catch (err) {
        console.error('Resume failed:', err);
        alert('Unable to resume session.');
    }
}

async function pauseSession() {
    if (!authToken) return alert('Please login first.');
    if (status === 'PAUSED') return;
    lastActionTime = Date.now();
    status = 'PAUSED';
    isIdle = false;
    updateUI();
    clearInterval(timerInterval);
    clearInterval(syncInterval);
    try {
        const response = await fetch(`${API_BASE}/pause`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (!response.ok) {
            const err = await response.json();
            await fetchSessionStatus();
            if (err.message?.toLowerCase().includes('already')) return;
            return alert(err.message || 'Unable to pause session.');
        }
        await fetchSessionStatus();
        showAppAlert('Paused', 'Time tracking is paused.');
        await notifyDesktop('Time Paused', 'Your session has been paused.');
    } catch (err) {
        console.error('Pause failed:', err);
        alert('Unable to pause session.');
    }
}

async function stopSession() {
    if (!authToken) return alert('Please login first.');
    status = 'OFFLINE';
    idleNotificationSent = false;
    clearInterval(timerInterval);
    clearInterval(syncInterval);
    try {
        const response = await fetch(`${API_BASE}/stop`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (!response.ok) {
            const err = await response.json();
            await fetchSessionStatus();
            return alert(err.message || 'Unable to stop session.');
        }
        await fetchSessionStatus();
        hideAppAlert();
        document.getElementById('start-btn').style.display = 'flex';
        document.querySelector('.binary-controls').style.display = 'none';
        updateUI();
    } catch (err) {
        console.error('Stop failed:', err);
        alert('Unable to stop session.');
    }
}

async function logout() {
    authToken = '';
    await window.electronAPI.setStoreValue('authToken', '');
    document.getElementById('auth-section').style.display = 'flex';
    document.getElementById('user-profile-display').style.display = 'none';
    status = 'OFFLINE';
    activeSeconds = 0;
    inactiveSeconds = 0;
    clearInterval(timerInterval);
    clearInterval(syncInterval);
    clearStatusPolling();
    updateDisplay();
    updateUI();
}

// 🔄 SYNC LOGIC
async function syncWithServer(type = 'update') {
    if (!authToken) return;
    
    syncIndicator.classList.add('online');
    try {
        // 🛡️ ONLY SEND ACTIVE IF ACTUAL LOCAL ACTIVITY OCCURRED within IDLE_THRESHOLD
        const hasRecentLocalActivity = (Date.now() - lastActivity < IDLE_THRESHOLD);
        const activityType = (status === 'ACTIVE' && hasRecentLocalActivity) ? (lastActivityType || 'mouse') : 'idle';
        
        const response = await fetch(`${API_BASE}/activity`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                type: activityType
            })
        });
        const data = await response.json();
        console.log('Sync result:', data);
        await fetchSessionStatus();
    } catch (err) {
        console.error('Sync failed:', err);
    }
    setTimeout(() => syncIndicator.classList.remove('online'), 2000);
}

// 👤 FETCH USER PROFILE
async function fetchUserProfile() {
    if (!authToken) return false;
    try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!response.ok) {
            console.error('Profile fetch failed:', await response.text());
            return false;
        }

        const user = await response.json();
        if (user) {
            document.getElementById('display-name').innerText = user.name || (user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : 'System User');
            document.getElementById('display-role').innerText = user.role || 'Personnel';
            document.getElementById('user-profile-display').style.display = 'block';
            return true;
        }
        return false;
    } catch (err) {
        console.error('Profile fetch failed:', err);
        return false;
    }
}

function clearStatusPolling() {
    if (statusPollInterval) {
        clearInterval(statusPollInterval);
        statusPollInterval = null;
    }
}

function startStatusPolling() {
    clearStatusPolling();
    statusPollInterval = setInterval(fetchSessionStatus, STATUS_POLL);
}

window.addEventListener('focus', () => {
    if (authToken) fetchSessionStatus();
});

window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && authToken) fetchSessionStatus();
});

function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            console.log('Notification permission:', permission);
        });
    }
}

function translateStatus(serverStatus, isRunningFlag) {
    if (!serverStatus) return 'OFFLINE';
    if (serverStatus.toLowerCase() === 'active') return 'ACTIVE';
    if (serverStatus.toLowerCase() === 'idle') return 'IDLE';
    if (serverStatus.toLowerCase() === 'paused') return 'PAUSED';
    if (serverStatus.toLowerCase() === 'completed') return 'PAUSED';
    return isRunningFlag ? 'ACTIVE' : 'PAUSED';
}

async function fetchSessionStatus() {
    if (!authToken) return false;
    try {
        const response = await fetch(`${API_BASE}/status`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!response.ok) {
            console.error('Status load failed:', await response.text());
            return false;
        }

        const data = await response.json();
        
        // 🛡️ SYNC SERVER ACTIVITY TIME TO PREVENT LOCAL IDLE FIGHTING (Clock Skew Compensation)
        if (data.lastActiveTime && data.serverTime) {
            const serverNow = Date.parse(data.serverTime);
            const serverLast = Date.parse(data.lastActiveTime);
            const localNow = Date.now();
            
            if (!isNaN(serverNow) && !isNaN(serverLast)) {
                const sinceLast = serverNow - serverLast;
                const adjustedLastActivity = localNow - sinceLast;
                
                if (adjustedLastActivity > lastActivity) {
                    lastActivity = adjustedLastActivity;
                    serverLastActivity = adjustedLastActivity;
                }
            }
        }

        if (!data.hasActiveSession) {
            status = 'OFFLINE';
            activeSeconds = 0;
            inactiveSeconds = 0;
            updateDisplay();
            updateUI();
            setControlState(status);
            if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
            if (syncInterval) { clearInterval(syncInterval); syncInterval = null; }
            return true;
        }

        const serverStatus = String(data.status || '').toUpperCase();
        
        // 🛡️ SYNC GUARD: Don't overwrite status if we just performed an action
        if (Date.now() - lastActionTime < 5000) {
            console.log('Sync Guard: Respecting transition grace period');
            return true;
        }

        // 🛡️ STRICT MANUAL RESUME: If we are locally IDLE, don't let the server force us back to ACTIVE
        // Only the Resume button (which sets lastActionTime) should break an idle state.
        if (status === 'IDLE' && serverStatus === 'ACTIVE') {
            console.log('Strict Mode: Blocking automatic server-side resume');
            return true;
        }

        const oldStatus = status;

        if (serverStatus === 'IDLE') {
            status = 'IDLE';
        } else if (serverStatus === 'ACTIVE') {
            status = 'ACTIVE';
        } else if (serverStatus === 'PAUSED' || serverStatus === 'COMPLETED') {
            status = 'PAUSED';
        } else {
            status = data.isRunning ? 'ACTIVE' : 'PAUSED';
        }

        if (status === 'ACTIVE') {
            idleNotificationSent = false;
        }
        
        inactiveSeconds = data.idleTime || 0;
        const totalActive = data.totalActiveTime || data.activeTime || 0;
        
        let calculatedTimer = totalActive;
        if (data.status === 'active' && data.startTime) {
            const elapsed = Math.floor((Date.now() - Date.parse(data.startTime)) / 1000);
            calculatedTimer = Math.max(0, elapsed + totalActive);
        }

        // 🛡️ SOFT SYNC: Only jump if difference > 1s
        // 🛡️ SOFT SYNC: Only jump if difference > 10s to prevent jumping/jitter
        if (Math.abs(activeSeconds - calculatedTimer) > 10 || activeSeconds === 0) {
            console.log('Sync: Correcting timer drift', { local: activeSeconds, server: calculatedTimer });
            activeSeconds = calculatedTimer;
        }

        updateDisplay();
        updateUI();
        setControlState(status);

        if (status === 'IDLE' || (Date.now() - lastActionTime < 5000)) {
            // 🛡️ DO NOT RESTART TIMERS OR SYNC DURING TRANSITIONS
            if (timerInterval) { 
                console.log('Timer Safety: Stopping timer during IDLE/Transition state');
                clearInterval(timerInterval); 
                timerInterval = null; 
            }
            if (syncInterval) { clearInterval(syncInterval); syncInterval = null; }
            
            if (status === 'IDLE') {
                await showIdleNotification();
            }
            
            updateDisplay();
            updateUI();
            return true;
        }

        if (status === 'ACTIVE') {
            startTimers();
        } else {
            if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
            if (syncInterval) { clearInterval(syncInterval); syncInterval = null; }
        }

        return true;
    } catch (err) {
        console.error('Session status failed:', err);
        return false;
    }
}

// 💾 SAVE TO LOCAL STORE
function saveProgress() {
    window.electronAPI.setStoreValue('activeSeconds', activeSeconds);
    window.electronAPI.setStoreValue('inactiveSeconds', inactiveSeconds);
}

function updateDisplay() {
    activeTimerEl.innerText = formatTime(activeSeconds);
    inactiveTimerEl.innerText = formatTime(inactiveSeconds);
}

function formatTime(s) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

// 🖱️ ACTIVITY LISTENERS (In-Window)
const updateActivityTimestamp = (type) => {
    lastActivity = Date.now();
    lastActivityType = type || 'mouse';
    // ⚠️ STRICT RULE: DO NOT AUTO-RESUME ON ACTIVITY
};
window.addEventListener('mousemove', () => updateActivityTimestamp('mouse'));
window.addEventListener('mousedown', () => updateActivityTimestamp('mouse'));
window.addEventListener('wheel', () => updateActivityTimestamp('scroll'));
window.addEventListener('keydown', () => updateActivityTimestamp('keyboard'));
window.addEventListener('touchstart', () => updateActivityTimestamp('touch'));
window.addEventListener('focus', () => updateActivityTimestamp('focus'));

// 🎛️ EVENT BINDINGS
document.getElementById('start-btn').onclick = startSession;
document.getElementById('pause-btn').onclick = pauseSession;
document.getElementById('resume-btn').onclick = resumeSession;
document.getElementById('stop-btn').onclick = stopSession;
document.getElementById('minimize-btn').onclick = () => window.electronAPI.minimizeApp();
document.getElementById('close-btn').onclick = () => window.electronAPI.closeApp();

async function loginWithCredentials() {
    const email = document.getElementById('email-input').value.trim();
    const password = document.getElementById('password-input').value;
    const errorEl = document.getElementById('auth-error');

    errorEl.style.display = 'none';

    if (!email || !password) {
        errorEl.innerText = 'Email and password required';
        errorEl.style.display = 'block';
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const error = await response.json();
            errorEl.innerText = error.message || 'Wrong password or ID';
            errorEl.style.display = 'block';
            return;
        }

        const data = await response.json();
        authToken = data.token;
        await window.electronAPI.setStoreValue('authToken', authToken);
        document.getElementById('auth-section').style.display = 'none';
        status = 'PAUSED';
        await fetchUserProfile();
        await fetchSessionStatus();
        startStatusPolling();
        updateUI();
    } catch (err) {
        console.error('Login error:', err);
        errorEl.innerText = 'Connection error. Is backend running?';
        errorEl.style.display = 'block';
    }
}

async function initSocket() {
    if (socket) return;
    
    const userResponse = await fetch('http://localhost:5000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const user = await userResponse.json();
    if (!user || !user.id) return;

    socket = io('http://localhost:5000');
    
    socket.on('connect', () => {
        console.log('Connected to socket server');
        socket.emit('join_notifications', { userId: user.id, role: user.role });
    });

    socket.on('timer_paused', (data) => {
        console.log('Socket: Timer Paused', data);
        fetchSessionStatus();
        if (data.reason === 'inactivity') {
            showIdleNotification();
        }
    });

    socket.on('timer_resumed', (data) => {
        console.log('Socket: Timer Resumed', data);
        idleNotificationSent = false;
        fetchSessionStatus();
    });
}

// ⚡ SYSTEM IDLE (Electron Power Monitor)
if (window.electronAPI && window.electronAPI.onPowerStatus) {
    window.electronAPI.onPowerStatus((powerStatus) => {
        console.log('System Power Status:', powerStatus);
        if (powerStatus === 'idle' && status === 'ACTIVE') {
            enterIdle();
        } else if (powerStatus === 'active') {
            updateActivityTimestamp('active');
            // 🛡️ ONLY NOTIFY IF WE WERE ACTUALLY IDLE
            if (status === 'IDLE' || status === 'PAUSED') {
                notifyDesktop('System Active', 'Click Resume to continue tracking.');
            }
        }
    });
}

// 🌐 GLOBAL SYSTEM ACTIVITY (Any app, anywhere on PC)
if (window.electronAPI && window.electronAPI.onGlobalActivity) {
    window.electronAPI.onGlobalActivity((status) => {
        // This fires whenever keyboard/mouse activity happens anywhere on the PC
        // Word, Browser, WhatsApp, etc.
        updateActivityTimestamp('system');
    });
}

document.getElementById('auth-btn').onclick = loginWithCredentials;
document.getElementById('logout-btn').onclick = logout;

// 🪟 WINDOW CONTROLS (Login Screen)
document.getElementById('auth-minimize-btn').onclick = () => window.electronAPI.minimizeApp();
document.getElementById('auth-close-btn').onclick = () => window.electronAPI.closeApp();
