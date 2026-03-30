// Initialize Telegram Web App
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Set theme colors based on Telegram theme
document.documentElement.style.setProperty('--tg-theme-bg-color', tg.backgroundColor || '#1a1a2e');
document.documentElement.style.setProperty('--tg-theme-text-color', tg.textColor || '#ffffff');

// API endpoint (replace with your actual backend)
const API_URL = '/api';

// State
let serverStatus = {
    online: false,
    players: 0,
    maxPlayers: 100,
    uptime: '0h 0m',
    memory: 0,
    cpu: 0,
    tps: 20
};

// ==================== ACTIONS ====================

function action(type) {
    tg.sendData(JSON.stringify({ action: type }));
    log(`> Executing: ${type}...`, 'system');
    
    // Show feedback
    showNotification(`Executing ${type}...`, 'info');
}

function openConsole() {
    const consoleSection = document.getElementById('console-section');
    consoleSection.style.display = consoleSection.style.display === 'none' ? 'block' : 'none';
}

function sendCommand() {
    const input = document.getElementById('console-input');
    const command = input.value.trim();
    
    if (!command) return;
    
    tg.sendData(JSON.stringify({ action: 'console', command: command }));
    log(`> ${command}`, 'user');
    input.value = '';
}

// Handle Enter key in console input
document.getElementById('console-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendCommand();
    }
});

// ==================== LOGGING ====================

function log(text, type = 'system') {
    const consoleOutput = document.getElementById('console-output');
    const timestamp = new Date().toLocaleTimeString();
    
    const color = type === 'user' ? '#00ff88' : type === 'error' ? '#ff4444' : '#00d9ff';
    
    consoleOutput.innerHTML += `<div style="color: ${color};">[${timestamp}] ${text}</div>`;
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

// ==================== NOTIFICATIONS ====================

function showNotification(message, type = 'info') {
    tg.showPopup({
        title: type.toUpperCase(),
        message: message,
        buttons: [{ type: 'ok' }]
    });
}

// ==================== UI UPDATES ====================

function updateStatus(online) {
    const indicator = document.getElementById('status-indicator');
    const statusText = document.getElementById('status-text');
    const statusCard = document.getElementById('status-card');
    
    if (online) {
        indicator.classList.remove('offline');
        indicator.classList.add('online');
        statusText.textContent = 'Server Online';
        statusCard.style.borderColor = 'rgba(0, 255, 136, 0.3)';
    } else {
        indicator.classList.remove('online');
        indicator.classList.add('offline');
        statusText.textContent = 'Server Offline';
        statusCard.style.borderColor = 'rgba(255, 68, 68, 0.3)';
    }
}

function updatePlayers(count, max) {
    document.getElementById('players-count').textContent = `${count}/${max}`;
    
    const playersList = document.getElementById('players-list');
    
    if (count === 0) {
        playersList.innerHTML = '<p class="empty-message">No players online</p>';
    } else {
        // This would be populated from API
        playersList.innerHTML = `<p class="empty-message">${count} players online</p>`;
    }
}

function updateUptime(uptime) {
    document.getElementById('uptime').textContent = uptime;
}

function updateMemory(mb) {
    document.getElementById('memory').textContent = `${mb.toFixed(1)} MB`;
}

function updateCPU(percent) {
    document.getElementById('cpu-usage').textContent = `${percent.toFixed(1)}%`;
    document.getElementById('cpu-bar').style.width = `${Math.min(percent, 100)}%`;
}

function updateRAM(percent) {
    document.getElementById('ram-usage').textContent = `${percent.toFixed(1)}%`;
    document.getElementById('ram-bar').style.width = `${Math.min(percent, 100)}%`;
}

function updateTPS(tps) {
    document.getElementById('tps').textContent = tps.toFixed(1);
    const tpsPercent = (tps / 20) * 100;
    document.getElementById('tps-bar').style.width = `${Math.min(tpsPercent, 100)}%`;
}

// ==================== DATA FETCHING ====================

async function fetchServerStatus() {
    try {
        // In real implementation, this would fetch from your backend
        // For now, simulate with random data
        serverStatus.online = true;
        serverStatus.players = Math.floor(Math.random() * 20);
        serverStatus.cpu = Math.random() * 30;
        serverStatus.memory = 2048 + Math.random() * 1024;
        serverStatus.tps = 19 + Math.random();
        
        updateStatus(serverStatus.online);
        updatePlayers(serverStatus.players, serverStatus.maxPlayers);
        updateCPU(serverStatus.cpu);
        updateRAM((serverStatus.memory / 8192) * 100);
        updateTPS(serverStatus.tps);
        
    } catch (error) {
        console.error('Error fetching status:', error);
        updateStatus(false);
    }
}

// ==================== TELEGRAM DATA HANDLING ====================

tg.onEvent('mainButtonClicked', function() {
    // Handle main button click
});

// Receive data from bot
tg.onEvent('sendMessage', function(data) {
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
            updateStatus(data.online);
            break;
        case 'players':
            updatePlayers(data.count, data.max);
            break;
        case 'stats':
            updateCPU(data.cpu);
            updateRAM(data.ram);
            updateTPS(data.tps);
            break;
        case 'console':
            log(data.output, data.success ? 'system' : 'error');
            break;
        case 'notification':
            showNotification(data.message, data.level);
            break;
    }
}

// ==================== INITIALIZATION ====================

function init() {
    // Set header color
    tg.setHeaderColor(tg.themeParams.bg_color || '#1a1a2e');
    tg.setBackgroundColor(tg.themeParams.bg_color || '#1a1a2e');
    
    // Initial fetch
    fetchServerStatus();
    
    // Auto-refresh every 5 seconds
    setInterval(fetchServerStatus, 5000);
    
    // Log initialization
    log('Web App initialized', 'system');
    log(`User: ${tg.initDataUnsafe.user?.username || 'Unknown'}`, 'system');
}

// Start the app
init();