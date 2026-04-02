// --- JS LOGIC ---

// 1. Переключение вкладок
function showSection(sectionId) {
    document.querySelectorAll('.wiki-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    const target = document.getElementById(sectionId);
    if(target) target.classList.add('active');

    const activeBtn = Array.from(document.querySelectorAll('.nav-btn')).find(b => b.getAttribute('onclick').includes(sectionId));
    if(activeBtn) activeBtn.classList.add('active');

    document.getElementById('searchInput').value = '';
    document.getElementById('searchResultsMessage').style.display = 'none';
    document.querySelectorAll('.info-card, .cmd-block').forEach(el => el.style.display = '');
    document.querySelectorAll('.rec-card').forEach(el => el.style.display = '');
}

// 2. Умный поиск
function searchWiki() {
    const input = document.getElementById('searchInput');
    const filter = input.value.toUpperCase();
    const message = document.getElementById('searchResultsMessage');
    
    const cards = document.getElementsByClassName('info-card');
    const cmds = document.getElementsByClassName('cmd-block');
    const recs = document.getElementsByClassName('rec-card');
    
    let hasResults = false;

    for (let i = 0; i < cards.length; i++) {
        const txt = cards[i].innerText.toUpperCase();
        if (txt.indexOf(filter) > -1) {
            cards[i].style.display = "";
            hasResults = true;
        } else {
            cards[i].style.display = "none";
        }
    }

    for (let i = 0; i < cmds.length; i++) {
        const txt = cmds[i].innerText.toUpperCase();
        if (txt.indexOf(filter) > -1) {
            cmds[i].style.display = "flex";
            hasResults = true;
        } else {
            cmds[i].style.display = "none";
        }
    }

    for (let i = 0; i < recs.length; i++) {
        const txt = recs[i].innerText.toUpperCase();
        if (txt.indexOf(filter) > -1) {
            recs[i].style.display = "block";
            hasResults = true;
        } else {
            recs[i].style.display = "none";
        }
    }

    if (filter.length > 0 && !hasResults) {
        message.style.display = 'block';
    } else {
        message.style.display = 'none';
    }
}

// 3. Копирование текста
function copyText(btn, text) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = btn.innerText;
        btn.innerText = "Скопировано!";
        btn.classList.add('copied');
        
        setTimeout(() => {
            btn.innerText = originalText;
            btn.classList.remove('copied');
        }, 2000);
    });
}

// 4. === НОВое: Получение реального онлайна ===
async function fetchServerStatus() {
    const statusElement = document.querySelector('.server-status span');
    const statusDot = document.querySelector('.status-dot');
    
    // ⚠️ ЗАМЕНИТЕ НА СВОЙ IP И ПОРТ
    const serverIP = 'shaurma.fhml.nl';  // Например: mc.shaurma.ru
    const serverPort = '8655';  // Стандартный порт
    
    try {
        const response = await fetch(`https://api.mcsrvstat.us/2/${serverIP}:${serverPort}`);
        const data = await response.json();
        
        if (data.online) {
            // Сервер онлайн
            statusElement.innerHTML = `Online: <strong style="color: white;">${data.players.online}</strong> / ${data.players.max}`;
            statusDot.style.backgroundColor = '#2ecc71';  // Зелёный
            statusDot.style.boxShadow = '0 0 10px #2ecc71';
        } else {
            // Сервер оффлайн
            statusElement.innerHTML = `Статус: <strong style="color: #ff4757;">OFFLINE</strong>`;
            statusDot.style.backgroundColor = '#ff4757';  // Красный
            statusDot.style.boxShadow = '0 0 10px #ff4757';
        }
    } catch (error) {
        console.error('Ошибка получения статуса сервера:', error);
        statusElement.innerHTML = `Статус: <strong style="color: #ffa502;">Неизвестно</strong>`;
        statusDot.style.backgroundColor = '#ffa502';  // Оранжевый
    }
}

// Запускаем при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    fetchServerStatus();
    // Обновляем онлайн каждые 60 секунд
    setInterval(fetchServerStatus, 60000);
});
