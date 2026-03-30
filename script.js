// ============================================
// 🎮 MINECRAFT SERVER CONTROL - MEGA SCRIPT
// ============================================

// Initialize Telegram Web App
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Set theme
document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#0f172a');

// State
let serverState = {
    online: true,
    players: 12,
    maxPlayers: 100,
    uptime: 0,
    memory: 4.2,
    cpu: 23,
    tps: 20.0,
    disk: 67
};

let uptimeSeconds = 87332; // 24h 15m 32s
let consoleLines = [];

// ============================================
// INITIALIZATION
// ============================================

function init() {
    // Set header color
    tg.setHeaderColor(tg.themeParams.bg_color || '#0f172a');
    tg.setBackgroundColor(tg.themeParams.bg_color || '#0f172a');
    
    // Start updates
    startAutoUpdate();
    startUptimeCounter();
    
    // Event listeners
    setupEventListeners();
    
    // Log
    log('Web App initialized', 'system');
    showToast('Web App loaded successfully!', 'success');
}

// ============================================
// AUTO UPDATE
// ============================================

function startAutoUpdate() {
    // Update every 3 seconds
    setInterval(() => {
        updateServerStats();
    }, 3000);
}

function updateServerStats() {
    // Simulate real data (replace with actual API calls)
    serverState.cpu = Math.floor(Math.random() * 30) + 15;
    serverState.memory = 3.5 + Math.random() * 2;
    serverState.tps = 19.5 + Math.random() * 0.5;
    
    updateUI();
}

function startUptimeCounter() {
    setInterval(() => {
        uptimeSeconds++;
        updateUptimeDisplay();
    }, 1000);
}

function updateUptimeDisplay() {
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = uptimeSeconds % 60;
    
    let uptimeText = '';
    if (days > 0) uptimeText += `${days}d `;
    if (hours > 0) uptimeText += `${hours}h `;
    if (minutes > 0) uptimeText += `${minutes}m `;
    uptimeText += `${seconds}s`;
    
    document.getElementById('server-uptime').textContent = `Uptime: ${uptimeText}`;
}

// ============================================
// UI UPDATES
// ============================================

function updateUI() {
    // Update status indicators
    updateStatusIndicator();
    
    // Update values
    document.getElementById('players-count').textContent = `${serverState.players}/${serverState.maxPlayers}`;
    document.getElementById('memory-usage').textContent = `${serverState.memory.toFixed(1)} GB`;
    document.getElementById('cpu-usage').textContent = `${serverState.cpu}%`;
    document.getElementById('tps-value').textContent = serverState.tps.toFixed(1);
    
    // Update bars
    updateBar('cpu-bar', 'cpu-bar-value', serverState.cpu);
    updateBar('ram-bar', 'ram-bar-value', (serverState.memory / 8) * 100);
    updateBar('disk-bar', 'disk-bar-value', serverState.disk);
}

function updateStatusIndicator() {
    const indicator = document.getElementById('server-status-indicator');
    const pulse = document.querySelector('.status-pulse');
    const statusText = document.getElementById('server-status-text');
    const badge = document.getElementById('connection-status');
    
    if (serverState.online) {
        indicator.style.background = 'linear-gradient(135deg, #10b981, #34d399)';
        indicator.innerHTML = '<i class="fas fa-check" style="color: white; font-size: 32px;"></i>';
        pulse.style.background = '#10b981';
        statusText.textContent = 'Server Online';
        statusText.style.color = '#10b981';
        badge.innerHTML = '<span class="badge-dot online"></span><span class="badge-text">Online</span>';
    } else {
        indicator.style.background = 'linear-gradient(135deg, #ef4444, #f87171)';
        indicator.innerHTML = '<i class="fas fa-times" style="color: white; font-size: 32px;"></i>';
        pulse.style.background = '#ef4444';
        statusText.textContent = 'Server Offline';
        statusText.style.color = '#ef4444';
        badge.innerHTML = '<span class="badge-dot offline"></span><span class="badge-text">Offline</span>';
    }
}

function updateBar(barId, valueId, percentage) {
    const bar = document.getElementById(barId);
    const value = document.getElementById(valueId);
    
    if (bar && value) {
        bar.style.width = `${Math.min(percentage, 100)}%`;
        value.textContent = `${Math.round(percentage)}%`;
    }
}

// ============================================
// SERVER ACTIONS
// ============================================

async function serverAction(action) {
    showLoading(true);
    
    try {
        // Send to Telegram bot
        tg.sendData(JSON.stringify({ 
            action: action,
            timestamp: new Date().toISOString()
        }));
        
        // Log
        log(`Executing: ${action}...`, 'user');
        
        // Simulate API call (replace with real fetch)
        await simulateDelay(1500);
        
        // Success
        showToast(`Server ${action} initiated!`, 'success');
        log(`✅ ${action} completed`, 'system');
        
    } catch (error) {
        showToast(`Error: ${error.message}`, 'error');
        log(`❌ Error: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

function simulateDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// CONSOLE
// ============================================

function toggleConsole() {
    const consoleSection = document.getElementById('console-section');
    const isVisible = consoleSection.style.display !== 'none';
    
    if (isVisible) {
        consoleSection.style.display = 'none';
    } else {
        consoleSection.style.display = 'block';
        document.getElementById('console-input').focus();
    }
}

function sendCommand() {
    const input = document.getElementById('console-input');
    const command = input.value.trim();
    
    if (!command) return;
    
    // Add to console
    addConsoleLine('user', command);
    
    // Send to bot
    tg.sendData(JSON.stringify({ 
        action: 'console',
        command: command,
        timestamp: new Date().toISOString()
    }));
    
    // Clear input
    input.value = '';
    
    // Simulate response
    setTimeout(() => {
        addConsoleLine('system', `Command executed: ${command}`);
    }, 500);
}

function clearConsole() {
    const output = document.getElementById('console-output');
    output.innerHTML = '';
    consoleLines = [];
    showToast('Console cleared', 'info');
}

function addConsoleLine(type, text) {
    const output = document.getElementById('console-output');
    const time = new Date().toLocaleTimeString('ru-RU', { hour12: false });
    
    const line = document.createElement('div');
    line.className = `console-line ${type}`;
    line.innerHTML = `
        <span class="console-time">[${time}]</span>
        <span class="console-text">${escapeHtml(text)}</span>
    `;
    
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
    
    consoleLines.push({ type, text, time });
    
    // Limit lines
    if (consoleLines.length > 100) {
        consoleLines.shift();
        if (output.firstChild) {
            output.removeChild(output.firstChild);
        }
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    
    toast.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Auto remove
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================
// LOADING
// ============================================

function showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    overlay.style.display = show ? 'flex' : 'none';
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    // Console input Enter key
    document.getElementById('console-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendCommand();
        }
    });
    
    // Telegram events
    tg.onEvent('themeChanged', () => {
        updateTheme();
    });
    
    tg.onEvent('viewportChanged', () => {
        tg.expand();
    });
    
    // Visibility change
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            updateServerStats();
        }
    });
}

function updateTheme() {
    // Update colors based on Telegram theme
    document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color);
    document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function log(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ============================================
// HANDLE TELEGRAM DATA
// ============================================

tg.onEvent('sendMessage', (data) => {
    try {
        const parsed = JSON.parse(data);
        handleServerResponse(parsed);
    } catch (e) {
        console.error('Error parsing data:', e);
    }
});

function handleServerResponse(data) {
    switch (data.type) {
        case 'status':
            serverState.online = data.online;
            updateUI();
            break;
        case 'players':
            serverState.players = data.count;
            updateUI();
            break;
        case 'console':
            addConsoleLine(data.success ? 'system' : 'error', data.output);
            break;
        case 'notification':
            showToast(data.message, data.level);
            break;
    }
}

// ============================================
// START
// ============================================

window.addEventListener('load', init);

// Prevent zoom on double tap
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);
