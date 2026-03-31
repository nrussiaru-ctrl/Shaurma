// ============================================
// 🎮 MINECRAFT SERVER CONTROL - FULL SCRIPT
// ============================================
// Owner: @Prostynskiy
// Version: 2.0.0
// ============================================

// Initialize Telegram Web App
const tg = window.Telegram.WebApp;

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
    // API URL (замените на свой когда будет)
    API_URL: '', // Например: 'https://your-api.com/api'
    
    // Обновление статистики (мс)
    STATS_UPDATE_INTERVAL: 3000,
    
    // Максимум строк в консоли
    MAX_CONSOLE_LINES: 100,
    
    // Время показа уведомлений (мс)
    TOAST_DURATION: 3000,
    
    // Тема
    THEME: {
        primary: '#6366f1',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6'
    }
};

// ============================================
// STATE
// ============================================

let serverState = {
    online: false,
    players: 0,
    maxPlayers: 100,
    uptime: 0,
    memory: 0,
    cpu: 0,
    tps: 0,
    disk: 0
};

let uptimeSeconds = 0;
let consoleLines = [];
let isConnected = false;
let updateInterval = null;

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', init);

function init() {
    console.log('🎮 Minecraft Server Control - Initializing...');
    
    // Initialize Telegram Web App
    initTelegram();
    
    // Setup UI
    setupUI();
    
    // Setup event listeners
    setupEventListeners();
    
    // Start auto updates
    startAutoUpdate();
    
    // Start uptime counter
    startUptimeCounter();
    
    // Load saved data
    loadSavedData();
    
    console.log('✅ Web App initialized successfully!');
    showToast('Web App loaded!', 'success');
}

// ============================================
// TELEGRAM INIT
// ============================================

function initTelegram() {
    tg.ready();
    tg.expand();
    
    // Set theme colors
    if (tg.themeParams) {
        document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#0f172a');
        document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#f8fafc');
        document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#6366f1');
        document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#ffffff');
    }
    
    // Set header color
    tg.setHeaderColor(tg.themeParams.bg_color || '#0f172a');
    tg.setBackgroundColor(tg.themeParams.bg_color || '#0f172a');
    
    // Enable closing confirmation
    tg.enableClosingConfirmation();
    
    // Setup Main Button (optional)
    // tg.MainButton.setText("REFRESH");
    // tg.MainButton.onClick(() => updateServerStats());
    
    console.log('📱 Telegram Web App initialized');
}

// ============================================
// UI SETUP
// ============================================

function setupUI() {
    // Initialize all UI elements
    updateUI();
    
    // Set initial uptime
    uptimeSeconds = 0;
    updateUptimeDisplay();
    
    // Show welcome message
    console.log('👋 Welcome to Minecraft Server Control Panel');
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    // Console input Enter key
    const consoleInput = document.getElementById('console-input');
    if (consoleInput) {
        consoleInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendCommand();
            }
        });
    }
    
    // Telegram theme changed
    tg.onEvent('themeChanged', () => {
        updateTheme();
    });
    
    // Telegram viewport changed
    tg.onEvent('viewportChanged', () => {
        tg.expand();
    });
    
    // Telegram popup closed
    tg.onEvent('popupClosed', () => {
        console.log('Popup closed');
    });
    
    // Page visibility change
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            console.log('Page visible - updating stats');
            updateServerStats();
        }
    });
    
    // Online/Offline status
    window.addEventListener('online', () => {
        isConnected = true;
        showToast('Connection restored', 'success');
        updateConnectionStatus();
    });
    
    window.addEventListener('offline', () => {
        isConnected = false;
        showToast('Connection lost', 'error');
        updateConnectionStatus();
    });
    
    // Prevent zoom on double tap
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    // Handle back button
    tg.BackButton.onClick(() => {
        tg.close();
    });
    
    console.log('🎯 Event listeners setup complete');
}

// ============================================
// AUTO UPDATE
// ============================================

function startAutoUpdate() {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
    
    updateInterval = setInterval(() => {
        updateServerStats();
    }, CONFIG.STATS_UPDATE_INTERVAL);
    
    console.log('⏱️ Auto update started (interval: ' + CONFIG.STATS_UPDATE_INTERVAL + 'ms)');
}

function stopAutoUpdate() {
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
        console.log('⏹️ Auto update stopped');
    }
}

// ============================================
// SERVER STATS
// ============================================

async function updateServerStats() {
    try {
        if (CONFIG.API_URL) {
            // Real API call
            await fetchRealStats();
        } else {
            // Simulated data (for demo)
            await fetchSimulatedStats();
        }
        
        updateUI();
        isConnected = true;
        updateConnectionStatus();
        
    } catch (error) {
        console.error('❌ Error fetching stats:', error);
        isConnected = false;
        updateConnectionStatus();
        showToast('Failed to fetch stats', 'error');
    }
}

async function fetchRealStats() {
    const response = await fetch(CONFIG.API_URL + '/status');
    if (!response.ok) {
        throw new Error('HTTP error: ' + response.status);
    }
    const data = await response.json();
    
    serverState.online = data.online;
    serverState.players = data.players;
    serverState.maxPlayers = data.max_players;
    serverState.uptime = data.uptime;
    serverState.memory = data.memory;
    serverState.cpu = data.cpu;
    serverState.tps = data.tps;
    serverState.disk = data.disk;
}

async function fetchSimulatedStats() {
    // Simulate server data (REMOVE when using real API)
    serverState.online = true;
    serverState.players = Math.floor(Math.random() * 20) + 5;
    serverState.maxPlayers = 100;
    serverState.memory = 3.5 + Math.random() * 2;
    serverState.cpu = Math.floor(Math.random() * 30) + 15;
    serverState.tps = 19.5 + Math.random() * 0.5;
    serverState.disk = Math.floor(Math.random() * 30) + 50;
    
    // Simulate occasional offline
    if (Math.random() < 0.01) {
        serverState.online = false;
    }
}

// ============================================
// UI UPDATES
// ============================================

function updateUI() {
    updateStatusIndicator();
    updateValues();
    updateBars();
    updatePlayersList();
}

function updateStatusIndicator() {
    const indicator = document.getElementById('server-status-indicator');
    const pulse = document.querySelector('.status-pulse');
    const statusText = document.getElementById('server-status-text');
    const badge = document.getElementById('connection-status');
    
    if (!indicator || !statusText || !badge) return;
    
    if (serverState.online) {
        indicator.style.background = 'linear-gradient(135deg, #10b981, #34d399)';
        indicator.innerHTML = '<i class="fas fa-check" style="color: white; font-size: 32px;"></i>';
        if (pulse) pulse.style.background = '#10b981';
        statusText.textContent = 'Server Online';
        statusText.style.color = '#10b981';
        badge.innerHTML = '<span class="badge-dot online"></span><span class="badge-text">Online</span>';
    } else {
        indicator.style.background = 'linear-gradient(135deg, #ef4444, #f87171)';
        indicator.innerHTML = '<i class="fas fa-times" style="color: white; font-size: 32px;"></i>';
        if (pulse) pulse.style.background = '#ef4444';
        statusText.textContent = 'Server Offline';
        statusText.style.color = '#ef4444';
        badge.innerHTML = '<span class="badge-dot offline"></span><span class="badge-text">Offline</span>';
    }
}

function updateValues() {
    setElementText('players-count', `${serverState.players}/${serverState.maxPlayers}`);
    setElementText('memory-usage', `${serverState.memory.toFixed(1)} GB`);
    setElementText('cpu-usage', `${serverState.cpu}%`);
    setElementText('tps-value', serverState.tps.toFixed(1));
    setElementText('online-badge', serverState.players);
}

function updateBars() {
    updateBar('cpu-bar', 'cpu-bar-value', serverState.cpu);
    updateBar('ram-bar', 'ram-bar-value', (serverState.memory / 8) * 100);
    updateBar('disk-bar', 'disk-bar-value', serverState.disk);
}

function updateBar(barId, valueId, percentage) {
    const bar = document.getElementById(barId);
    const value = document.getElementById(valueId);
    
    if (bar && value) {
        const safePercentage = Math.min(Math.max(percentage, 0), 100);
        bar.style.width = `${safePercentage}%`;
        value.textContent = `${Math.round(safePercentage)}%`;
        
        // Change color based on percentage
        if (safePercentage > 80) {
            bar.style.background = 'linear-gradient(90deg, #ef4444, #f87171)';
        } else if (safePercentage > 50) {
            bar.style.background = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
        } else {
            bar.style.background = 'linear-gradient(90deg, #10b981, #34d399)';
        }
    }
}

function updatePlayersList() {
    const playersList = document.getElementById('players-list');
    if (!playersList) return;
    
    if (serverState.players === 0) {
        playersList.innerHTML = `
            <div class="player-item" style="justify-content: center; padding: 30px;">
                <div style="text-align: center; color: var(--text-muted);">
                    <i class="fas fa-users" style="font-size: 48px; margin-bottom: 15px; opacity: 0.5;"></i>
                    <p>No players online</p>
                </div>
            </div>
        `;
        return;
    }
    
    // Generate sample players (REMOVE when using real API)
    const sampleNames = ['Steve', 'Alex', 'Herobrine', 'Notch', 'Jeb', 'Dinnerbone', 'Grumm', 'Techno', 'Dream', 'Tommy'];
    let html = '';
    
    for (let i = 0; i < Math.min(serverState.players, 10); i++) {
        const name = sampleNames[i % sampleNames.length] + '_' + Math.floor(Math.random() * 100);
        const time = formatTime(Math.floor(Math.random() * 7200));
        
        html += `
            <div class="player-item">
                <div class="player-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="player-info">
                    <span class="player-name">${name}</span>
                    <span class="player-time">${time} online</span>
                </div>
                <div class="player-status online"></div>
            </div>
        `;
    }
    
    playersList.innerHTML = html;
}

function updateUptimeDisplay() {
    const uptimeElement = document.getElementById('server-uptime');
    if (!uptimeElement) return;
    
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = uptimeSeconds % 60;
    
    let uptimeText = '';
    if (days > 0) uptimeText += `${days}d `;
    if (hours > 0) uptimeText += `${hours}h `;
    if (minutes > 0) uptimeText += `${minutes}m `;
    uptimeText += `${seconds}s`;
    
    uptimeElement.textContent = `Uptime: ${uptimeText}`;
}

function startUptimeCounter() {
    setInterval(() => {
        if (serverState.online) {
            uptimeSeconds++;
            updateUptimeDisplay();
        }
    }, 1000);
}

function updateConnectionStatus() {
    const badge = document.getElementById('connection-status');
    if (!badge) return;
    
    if (isConnected && serverState.online) {
        badge.innerHTML = '<span class="badge-dot online"></span><span class="badge-text">Online</span>';
    } else if (!isConnected) {
        badge.innerHTML = '<span class="badge-dot offline"></span><span class="badge-text">No Connection</span>';
    } else {
        badge.innerHTML = '<span class="badge-dot offline"></span><span class="badge-text">Server Offline</span>';
    }
}

function updateTheme() {
    if (tg.themeParams) {
        document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color);
        document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color);
        document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color);
        document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color);
    }
    console.log('🎨 Theme updated');
}

// ============================================
// SERVER ACTIONS
// ============================================

async function serverAction(action) {
    const btn = event.target.closest('.control-btn');
    if (btn) {
        btn.classList.add('loading');
        btn.disabled = true;
    }
    
    showLoading(true);
    
    try {
        // Send to Telegram bot
        tg.sendData(JSON.stringify({
            action: action,
            timestamp: new Date().toISOString(),
            user: tg.initDataUnsafe.user
        }));
        
        console.log(`📤 Sent action: ${action}`);
        log(`Executing: ${action}...`, 'user');
        
        // If API URL is set, use real API
        if (CONFIG.API_URL) {
            await sendRealAction(action);
        } else {
            // Simulate delay
            await simulateDelay(1500);
        }
        
        // Success
        showToast(`Server ${action} initiated!`, 'success');
        log(`✅ ${action} completed`, 'system');
        
        // Add to console
        addConsoleLine('system', `Command executed: ${action}`);
        
    } catch (error) {
        console.error(`❌ Action ${action} failed:`, error);
        showToast(`Error: ${error.message}`, 'error');
        log(`❌ Error: ${error.message}`, 'error');
    } finally {
        showLoading(false);
        if (btn) {
            btn.classList.remove('loading');
            btn.disabled = false;
        }
    }
}

async function sendRealAction(action) {
    const response = await fetch(CONFIG.API_URL + '/action', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: action,
            timestamp: new Date().toISOString()
        })
    });
    
    if (!response.ok) {
        throw new Error('HTTP error: ' + response.status);
    }
    
    const data = await response.json();
    if (!data.success) {
        throw new Error(data.message || 'Action failed');
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
    if (!consoleSection) return;
    
    const isVisible = consoleSection.style.display !== 'none';
    
    if (isVisible) {
        consoleSection.style.display = 'none';
        console.log('📝 Console hidden');
    } else {
        consoleSection.style.display = 'block';
        const input = document.getElementById('console-input');
        if (input) input.focus();
        console.log('📝 Console shown');
    }
}

function sendCommand() {
    const input = document.getElementById('console-input');
    if (!input) return;
    
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
    
    console.log(`📤 Sent command: ${command}`);
    
    // Clear input
    input.value = '';
    
    // Simulate response (REMOVE when using real API)
    setTimeout(() => {
        addConsoleLine('system', `Command executed: ${command}`);
    }, 500);
}

function clearConsole() {
    const output = document.getElementById('console-output');
    if (!output) return;
    
    output.innerHTML = '';
    consoleLines = [];
    showToast('Console cleared', 'info');
    console.log('🗑️ Console cleared');
}

function addConsoleLine(type, text) {
    const output = document.getElementById('console-output');
    if (!output) return;
    
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
    while (consoleLines.length > CONFIG.MAX_CONSOLE_LINES) {
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
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    
    toast.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    console.log(`🔔 Toast: ${message} (${type})`);
    
    // Auto remove
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, CONFIG.TOAST_DURATION);
}

// ============================================
// LOADING
// ============================================

function showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    if (!overlay) return;
    
    overlay.style.display = show ? 'flex' : 'none';
    
    if (show) {
        console.log('⏳ Loading shown');
    } else {
        console.log('✅ Loading hidden');
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function setElementText(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text;
    }
}

function getElement(id) {
    return document.getElementById(id);
}

function log(message, type = 'info') {
    const prefix = {
        'system': '🔧',
        'user': '👤',
        'error': '❌',
        'success': '✅',
        'info': 'ℹ️',
        'warning': '⚠️'
    };
    
    console.log(`${prefix[type] || '📝'} [${type.toUpperCase()}] ${message}`);
}

function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    
    if (h > 0) {
        return `${h}h ${m}m`;
    } else {
        return `${m}m`;
    }
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ============================================
// LOCAL STORAGE
// ============================================

function saveData() {
    try {
        localStorage.setItem('minecraft_server_state', JSON.stringify(serverState));
        localStorage.setItem('minecraft_console_lines', JSON.stringify(consoleLines));
        console.log('💾 Data saved to localStorage');
    } catch (error) {
        console.error('❌ Failed to save data:', error);
    }
}

function loadSavedData() {
    try {
        const savedState = localStorage.getItem('minecraft_server_state');
        const savedLines = localStorage.getItem('minecraft_console_lines');
        
        if (savedState) {
            serverState = { ...serverState, ...JSON.parse(savedState) };
            console.log('📥 Server state loaded from localStorage');
        }
        
        if (savedLines) {
            consoleLines = JSON.parse(savedLines);
            restoreConsole();
            console.log('📥 Console lines loaded from localStorage');
        }
    } catch (error) {
        console.error('❌ Failed to load data:', error);
    }
}

function restoreConsole() {
    const output = document.getElementById('console-output');
    if (!output) return;
    
    output.innerHTML = '';
    
    consoleLines.forEach(line => {
        const lineDiv = document.createElement('div');
        lineDiv.className = `console-line ${line.type}`;
        lineDiv.innerHTML = `
            <span class="console-time">[${line.time}]</span>
            <span class="console-text">${escapeHtml(line.text)}</span>
        `;
        output.appendChild(lineDiv);
    });
    
    output.scrollTop = output.scrollHeight;
}

// Auto-save every 30 seconds
setInterval(() => {
    saveData();
}, 30000);

// ============================================
// TELEGRAM DATA HANDLER
// ============================================

tg.onEvent('sendMessage', (data) => {
    try {
        const parsed = JSON.parse(data);
        handleServerResponse(parsed);
    } catch (error) {
        console.error('❌ Error parsing Telegram data:', error);
    }
});

function handleServerResponse(data) {
    console.log('📥 Received from bot:', data);
    
    switch (data.type) {
        case 'status':
            serverState.online = data.online;
            serverState.players = data.players;
            serverState.maxPlayers = data.max_players;
            serverState.cpu = data.cpu;
            serverState.memory = data.memory;
            serverState.tps = data.tps;
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
            showToast(data.message, data.level || 'info');
            break;
            
        case 'action_result':
            if (data.success) {
                showToast(data.message, 'success');
            } else {
                showToast(data.message, 'error');
            }
            break;
            
        default:
            console.log('⚠️ Unknown message type:', data.type);
    }
}

// ============================================
// ERROR HANDLING
// ============================================

window.addEventListener('error', (event) => {
    console.error('💥 Global error:', event.error);
    showToast('An error occurred', 'error');
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('💥 Unhandled promise rejection:', event.reason);
});

// ============================================
// CLEANUP
// ============================================

window.addEventListener('beforeunload', () => {
    stopAutoUpdate();
    saveData();
    console.log('👋 Web App closing, data saved');
});

// ============================================
// DEBUG MODE
// ============================================

// Enable debug mode by adding ?debug=1 to URL
const urlParams = new URLSearchParams(window.location.search);
const DEBUG_MODE = urlParams.get('debug') === '1';

if (DEBUG_MODE) {
    console.log('🐛 DEBUG MODE ENABLED');
    window.debug = {
        state: serverState,
        config: CONFIG,
        console: consoleLines,
        tg: tg
    };
}

// ============================================
// END OF SCRIPT
// ============================================

console.log('✅ All scripts loaded successfully!');
console.log('🎮 Minecraft Server Control Panel ready!');
console.log('👤 Owner: @Prostynskiy');
