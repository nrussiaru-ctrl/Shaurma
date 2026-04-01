// --- JS LOGIC ---

// 1. Переключение вкладок
function showSection(sectionId) {
    // Скрыть все секции
    document.querySelectorAll('.wiki-section').forEach(sec => sec.classList.remove('active'));
    // Убрать активный класс с кнопок
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    // Показать нужную секцию
    const target = document.getElementById(sectionId);
    if(target) target.classList.add('active');

    // Подсветить кнопку
    const activeBtn = Array.from(document.querySelectorAll('.nav-btn')).find(b => b.getAttribute('onclick').includes(sectionId));
    if(activeBtn) activeBtn.classList.add('active');

    // Сброс поиска при переключении
    document.getElementById('searchInput').value = '';
    document.getElementById('searchResultsMessage').style.display = 'none';
    
    // Показываем все элементы снова
    document.querySelectorAll('.info-card, .cmd-block').forEach(el => el.style.display = '');
    document.querySelectorAll('.rec-card').forEach(el => el.style.display = '');
}

// 2. Умный поиск (ищет по заголовкам и тексту)
function searchWiki() {
    const input = document.getElementById('searchInput');
    const filter = input.value.toUpperCase();
    const message = document.getElementById('searchResultsMessage');
    
    // Ищем во всех карточках и блоках команд
    const cards = document.getElementsByClassName('info-card');
    const cmds = document.getElementsByClassName('cmd-block');
    const recs = document.getElementsByClassName('rec-card');
    
    let hasResults = false;

    // Поиск в карточках
    for (let i = 0; i < cards.length; i++) {
        const txt = cards[i].innerText.toUpperCase();
        if (txt.indexOf(filter) > -1) {
            cards[i].style.display = "";
            hasResults = true;
        } else {
            cards[i].style.display = "none";
        }
    }

    // Поиск в командах
    for (let i = 0; i < cmds.length; i++) {
        const txt = cmds[i].innerText.toUpperCase();
        if (txt.indexOf(filter) > -1) {
            cmds[i].style.display = "flex";
            hasResults = true;
        } else {
            cmds[i].style.display = "none";
        }
    }

    // Поиск в рекомендациях
    for (let i = 0; i < recs.length; i++) {
        const txt = recs[i].innerText.toUpperCase();
        if (txt.indexOf(filter) > -1) {
            recs[i].style.display = "block";
            hasResults = true;
        } else {
            recs[i].style.display = "none";
        }
    }

    // Показать сообщение если ничего не найдено
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
