// Функция переключения разделов
function showSection(sectionId) {
    // 1. Скрываем все разделы с контентом
    const sections = document.querySelectorAll('.wiki-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // 2. Убираем подсветку (класс active) со всех кнопок меню
    const buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });

    // 3. Показываем нужный раздел по ID
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // 4. Находим кнопку, которую нажали, и добавляем ей класс active
    // Мы ищем кнопку, в атрибуте onclick которой есть название нашего раздела
    const activeBtn = Array.from(buttons).find(btn => 
        btn.getAttribute('onclick').includes(sectionId)
    );
    
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    // 5. (Опционально) Прокручиваем страницу вверх при переключении на мобильных
    if (window.innerWidth < 900) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Добавляем обработчик для логотипа (чтобы он тоже вел на главную)
document.querySelector('.logo').addEventListener('click', () => {
    showSection('home');
});
