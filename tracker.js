
// Проверка, залогинен ли пользователь
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
if (!currentUser) {
    alert('Сначала войдите в систему');
    window.location.href = 'regis.html';
}

// 🔧 НОВАЯ ФУНКЦИЯ: Загрузка привычек из ИИ
function loadHabitsFromAI() {
    const aiHabits = JSON.parse(localStorage.getItem('ai_generated_habits') || '[]');
    const userHabits = JSON.parse(localStorage.getItem('habits_' + currentUser.email) || '[]');
    
    // Фильтруем привычки ИИ для текущего пользователя
    const userAIHabits = aiHabits.filter(habit => 
        habit.userId === currentUser.email
    );
    
    // Добавляем только новые привычки
    userAIHabits.forEach(aiHabit => {
        const exists = userHabits.some(habit => habit.name === aiHabit.name);
        if (!exists) {
            userHabits.push({
                name: aiHabit.name,
                done: false,
                date: new Date().toISOString().split('T')[0],
                description: aiHabit.description,
                category: aiHabit.category
            });
        }
    });
    
    localStorage.setItem('habits_' + currentUser.email, JSON.stringify(userHabits));
    return userHabits;
}

// Вызовите эту функцию при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    loadHabitsFromAI();
    // остальной ваш код инициализации...
});
// Элементы страницы
const userEmail = document.getElementById('user-email');
const currentDateEl = document.getElementById('current-date');
const habitInput = document.getElementById('habit-name');
const habitDateInput = document.getElementById('habit-date');
const addBtn = document.getElementById('add-btn');
const habitsList = document.getElementById('habits');
const logoutBtn = document.getElementById('logout-btn');
const calendarList = document.getElementById('calendar-list');
const completionEl = document.getElementById('completion');
const streakEl = document.getElementById('streak');

// Профиль
const profileMenuBtn = document.getElementById('profile-menu-btn');
const profileMenu = document.getElementById('profile-menu');
const profileImg = document.getElementById('profile-img');
const menuAvatar = document.getElementById('menu-avatar');
const menuEmail = document.getElementById('menu-email');
const avatarInput = document.getElementById('avatar-input');
const changeAvatarBtn = document.getElementById('change-avatar-btn');

// Профиль и текущая дата
userEmail.textContent = currentUser.email;
menuEmail.textContent = currentUser.email;
const today = new Date();
const todayStr = today.toISOString().split('T')[0];
currentDateEl.textContent = today.toLocaleDateString();
habitDateInput.value = todayStr;

if (currentUser.avatar) {
    profileImg.src = currentUser.avatar;
    menuAvatar.src = currentUser.avatar;
}

// Загружаем привычки пользователя
let habits = JSON.parse(localStorage.getItem('habits_' + currentUser.email)) || [];

// Выбранная дата (по умолчанию сегодня)
let selectedDate = todayStr;

renderHabits();
renderCalendar();

// ----------------- Добавление привычки -----------------
addBtn.addEventListener('click', () => {
    const name = habitInput.value.trim();
    const date = habitDateInput.value;
    if (!name) return alert('Введите название привычки');
    if (!date) return alert('Выберите дату');

    habits.push({ name, done: false, date });
    habitInput.value = '';
    habitDateInput.value = selectedDate;
    saveHabits();
    renderHabits();
    renderCalendar();
});


// ----------------- Сохранение привычек -----------------
function saveHabits() {
    localStorage.setItem('habits_' + currentUser.email, JSON.stringify(habits));
}

// ----------------- Отображение привычек -----------------
function renderHabits() {
    habitsList.innerHTML = '';
    const filtered = habits.filter(h => h.date === selectedDate);
    filtered.forEach((habit, index) => {
        const li = document.createElement('li');
        li.className = 'habit-item';
        li.innerHTML = `
            <span style="text-decoration:${habit.done ? 'line-through' : 'none'}">${habit.name}</span>
            <div class="buttons">
                <button onclick="toggleDone(${index})">${habit.done ? 'Сбросить' : 'Выполнено'}</button>
                <button onclick="editHabit(${index})">Редактировать</button>
                <button onclick="deleteHabit(${index})">Удалить</button>
            </div>
        `;
        habitsList.appendChild(li);
    });
    updateStats();
}

function toggleDone(index) {
    const filtered = habits.filter(h => h.date === selectedDate);
    const habitIndex = habits.indexOf(filtered[index]);
    if (habitIndex === -1) return;

    const habit = habits[habitIndex];
    habit.done = !habit.done;
    saveHabits();
    renderHabits();

    // 🎮 Геймификация с передачей done
    Gamification.recordCompletion(habit.name, habit.done);

    // Обновляем панель геймификации
    updateGamificationPanel();
      checkAchievements();

    afterHabitUpdate();
}



// ----------------- Редактирование привычки -----------------
function editHabit(index) {
    const filtered = habits.filter(h => h.date === selectedDate);
    const habit = filtered[index];
    if (!habit) return alert('Привычка не найдена');

    const newName = prompt('Введите новое название привычки:', habit.name);
    if (!newName || newName.trim() === '') return;

    const newDate = prompt('Введите новую дату (YYYY-MM-DD):', habit.date);
    if (!newDate) return;

    const habitIndex = habits.indexOf(habit);
    if (habitIndex === -1) return alert('Ошибка при редактировании');

    habits[habitIndex].name = newName.trim();
    habits[habitIndex].date = newDate;
    saveHabits();
    renderHabits();
    renderCalendar();
}

// ----------------- Удаление привычки -----------------
function deleteHabit(index) {
    const filtered = habits.filter(h => h.date === selectedDate);
    const habitIndex = habits.indexOf(filtered[index]);
    if (habitIndex === -1) return;
    if (confirm('Вы уверены, что хотите удалить эту привычку?')) {
        habits.splice(habitIndex, 1);
        saveHabits();
        renderHabits();
        renderCalendar();
    }
}

// ----------------- Календарь -----------------
function renderCalendar() {
    calendarList.innerHTML = '';
    const monthDays = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    for (let i = 1; i <= monthDays; i++) {
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const li = document.createElement('li');
        li.textContent = i;

        const dayHabits = habits.filter(h => h.date === dateStr);
        const total = dayHabits.length;
        const done = dayHabits.filter(h => h.done).length;
        const percent = total === 0 ? 0 : Math.round((done / total) * 100);

        // 🎨 Определяем цвет в зависимости от процента выполнения
        if (total > 0) {
            if (percent === 0) {
                li.style.backgroundColor = '#ffb3b3'; // красный (ничего не выполнено)
            } else if (percent < 70) {
                li.style.backgroundColor = '#fff3b3'; // желтый (частично выполнено)
            } else {
                li.style.backgroundColor = '#a0e7a0'; // зеленый (выполнено >70%)
            }
        } else {
            li.style.backgroundColor = '#e3ecff'; // базовый фон — нет привычек
        }

        // Выделяем выбранную дату
        if (dateStr === selectedDate) {
            li.style.border = '2px solid #333';
        }

        li.addEventListener('click', () => {
            selectedDate = dateStr;
            habitDateInput.value = dateStr;
            renderHabits();
            renderCalendar();
            renderArchive();
        });

        calendarList.appendChild(li);
    }
}

// ----------------- Статистика -----------------
function updateStats() {
    const filtered = habits.filter(h => h.date === selectedDate);
    const total = filtered.length;
    const done = filtered.filter(h => h.done).length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    completionEl.textContent = percent + '%';

    let streakCount = 0;
    let checkDate = new Date(selectedDate);
    while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        const dayHabits = habits.filter(h => h.date === dateStr);
        if (dayHabits.length === 0) break;
        const allDone = dayHabits.every(h => h.done);
        if (!allDone) break;
        streakCount++;
        checkDate.setDate(checkDate.getDate() - 1);
    }
    streakEl.textContent = streakCount;
}
// ----------------- Архив привычек -----------------
const archiveList = document.getElementById('archived-habits');
const archiveFilters = document.querySelectorAll('.archive-filter');
let archiveFilter = 'all'; // текущий фильтр

// Обновление архива
function renderArchive() {
    archiveList.innerHTML = '';

    let filteredHabits = habits;

    // Фильтрация по статусу
    if (archiveFilter === 'done') {
        filteredHabits = habits.filter(h => h.done);
    } else if (archiveFilter === 'active') {
        filteredHabits = habits.filter(h => !h.done);
    }

    if (filteredHabits.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'Нет привычек для отображения';
        li.style.color = '#888';
        archiveList.appendChild(li);
        return;
    }

    // Группируем по дате
    const grouped = {};
    filteredHabits.forEach(h => {
        if (!grouped[h.date]) grouped[h.date] = [];
        grouped[h.date].push(h);
    });

    // Выводим по датам
    Object.keys(grouped).sort().forEach(date => {
        const dateHeader = document.createElement('h4');
        dateHeader.textContent = new Date(date).toLocaleDateString('ru-RU');
        dateHeader.style.marginTop = '10px';
        dateHeader.style.color = '#4a90e2';
        archiveList.appendChild(dateHeader);

        grouped[date].forEach(habit => {
            const li = document.createElement('li');
            li.textContent = habit.name + (habit.done ? ' ✅' : ' ❌');
            li.style.background = habit.done ? '#d9f7d9' : '#f9d9d9';
            li.style.borderRadius = '6px';
            li.style.marginBottom = '4px';
            li.style.padding = '6px 10px';
            archiveList.appendChild(li);
        });
    });
}

// Обработка фильтров архива
archiveFilters.forEach(btn => {
    btn.addEventListener('click', () => {
        archiveFilters.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        archiveFilter = btn.dataset.filter;
        renderArchive();
    });
});

// ----------------- Меню профиля -----------------
profileMenuBtn.addEventListener('click', () => {
    profileMenu.style.display = profileMenu.style.display === 'none' ? 'block' : 'none';
});

changeAvatarBtn.addEventListener('click', () => avatarInput.click());
// Загружаем аватар
if (currentUser.avatar) {
    profileImg.src = currentUser.avatar;
    menuAvatar.src = currentUser.avatar;
} else {
    // если avatar нет в currentUser, берём из отдельного ключа "avatar"
    const savedAvatar = localStorage.getItem("avatar");
    if (savedAvatar) {
        profileImg.src = savedAvatar;
        menuAvatar.src = savedAvatar;
        // обновляем currentUser, чтобы на будущее не было пусто
        currentUser.avatar = savedAvatar;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
}

// ----------------- Выход -----------------
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
});


// ===== Переключение темы =====
const themeToggleBtn = document.createElement('button');
themeToggleBtn.textContent = '🌓 Темная/Светлая тема';
themeToggleBtn.style.marginLeft = '10px';
document.querySelector('header').appendChild(themeToggleBtn);

const savedTheme = localStorage.getItem('theme') || 'light';
document.body.classList.add(savedTheme);

themeToggleBtn.addEventListener('click', () => {
    if (document.body.classList.contains('light')) {
        document.body.classList.replace('light', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.replace('dark', 'light');
        localStorage.setItem('theme', 'light');
    }
    // Перерисуем архив и календарь, чтобы цвета элементов тоже сменились
    renderArchive();
    renderCalendar();
    renderHabits();
});
// ================== 💧 Напоминание пить воду ==================
(function waterReminder() {
    // Получаем норму воды из лайфстайла (в литрах)
    const WATER_GOAL_LITERS = Math.max(2, parseFloat(localStorage.getItem("life_waterLiters")) || 2);
    const WATER_GOAL = WATER_GOAL_LITERS * 1000; // перевод в мл

    // Загружаем текущий прогресс воды из localStorage
    let waterDrunk = parseInt(localStorage.getItem('waterDrunk') || '0');

    // Если блока нет — создаём уведомление
    let reminder = document.createElement('div');
    reminder.id = 'water-reminder';
    reminder.style.position = 'fixed';
    reminder.style.bottom = '20px';
    reminder.style.left = '20px';
    reminder.style.background = '#4a90e2';
    reminder.style.color = 'white';
    reminder.style.padding = '12px 18px';
    reminder.style.borderRadius = '12px';
    reminder.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    reminder.style.zIndex = '9999';
    reminder.style.transition = '0.3s ease';
    reminder.style.cursor = 'pointer';
    reminder.textContent = `💧 Выпей воды! (${(waterDrunk / 1000).toFixed(1)}/${WATER_GOAL_LITERS} л)`;
    document.body.appendChild(reminder);

    // Клик по уведомлению — добавляем 200 мл
    reminder.addEventListener('click', () => {
        waterDrunk += 200;
        if (waterDrunk > WATER_GOAL) waterDrunk = WATER_GOAL;
        localStorage.setItem('waterDrunk', waterDrunk);
        reminder.textContent = `💧 Отлично! ${(waterDrunk / 1000).toFixed(1)}/${WATER_GOAL_LITERS} л`;

        if (waterDrunk >= WATER_GOAL) {
            reminder.style.background = '#2ecc71';
            reminder.textContent = '✅ Норма воды на сегодня выполнена!';
            setTimeout(() => reminder.remove(), 4000);
        }
    });

    // Обновляем уведомление каждые 2 часа
    setInterval(() => {
        const now = new Date();
        if (now.getHours() >= 8 && now.getHours() <= 22) { // только в активное время дня
            if (waterDrunk < WATER_GOAL) {
                reminder.style.display = 'block';
                reminder.textContent = `💧 Пора выпить воды! (${(waterDrunk / 1000).toFixed(1)}/${WATER_GOAL_LITERS} л)`;
            }
        }
    }, 1000 * 60 * 60 * 2); // каждые 2 часа

    // Автоматический сброс в полночь
    const now = new Date();
    const millisTillMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5) - now;
    setTimeout(() => {
        localStorage.setItem('waterDrunk', '0');
        reminder.remove();
    }, millisTillMidnight);
})();

// ================== 💧 Визуальный виджет воды ==================
(function waterWidget() {
    const WATER_GOAL_LITERS = Math.max(2, parseFloat(localStorage.getItem("life_waterLiters")) || 2);
    const WATER_GOAL = WATER_GOAL_LITERS * 1000;

    let waterDrunk = parseInt(localStorage.getItem('waterDrunk') || '0');

    // Создаём контейнер виджета
    const widget = document.createElement('div');
    widget.id = 'water-widget';
    widget.style.position = 'fixed';
    widget.style.bottom = '100px';
    widget.style.left = '5px';
    widget.style.width = '120px';
    widget.style.height = '180px';
    widget.style.background = 'rgba(255,255,255,0.9)';
    widget.style.border = '2px solid #4a90e2';
    widget.style.borderRadius = '20px';
    widget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)';
    widget.style.overflow = 'hidden';
    widget.style.display = 'flex';
    widget.style.flexDirection = 'column';
    widget.style.alignItems = 'center';
    widget.style.justifyContent = 'flex-end';
    widget.style.cursor = 'pointer';
    widget.style.transition = 'transform 0.2s ease';
    widget.title = "Нажми, чтобы добавить 200 мл воды 💧";

    // Текст сверху
    const label = document.createElement('div');
    label.textContent = '💧 Вода';
    label.style.fontWeight = 'bold';
    label.style.marginTop = '6px';
    label.style.color = '#4a90e2';
    label.style.fontSize = '16px';

    // Контейнер стакана
    const glass = document.createElement('div');
    glass.style.position = 'relative';
    glass.style.width = '80px';
    glass.style.height = '120px';
    glass.style.border = '3px solid #4a90e2';
    glass.style.borderRadius = '10px';
    glass.style.overflow = 'hidden';
    glass.style.marginTop = '6px';
    glass.style.background = '#fff';

    // Вода (заливка)
    const fill = document.createElement('div');
    fill.style.position = 'absolute';
    fill.style.bottom = '0';
    fill.style.left = '0';
    fill.style.width = '100%';
    fill.style.background = '#4a90e2';
    fill.style.transition = 'height 0.4s ease';
    fill.style.height = `${(waterDrunk / WATER_GOAL) * 100}%`;

    // Текст с количеством воды
    const counter = document.createElement('div');
    counter.textContent = `${(waterDrunk / 1000).toFixed(1)}/${WATER_GOAL_LITERS} л`;
    counter.style.margin = '6px 0';
    counter.style.color = '#333';
    counter.style.fontSize = '14px';

    glass.appendChild(fill);
    widget.appendChild(label);
    widget.appendChild(glass);
    widget.appendChild(counter);
    document.body.appendChild(widget);

    // Эффект наведения
    widget.addEventListener('mouseenter', () => {
        widget.style.transform = 'scale(1.05)';
    });
    widget.addEventListener('mouseleave', () => {
        widget.style.transform = 'scale(1)';
    });

    // При клике добавляем 200 мл
    widget.addEventListener('click', () => {
        waterDrunk += 200;
        if (waterDrunk > WATER_GOAL) waterDrunk = WATER_GOAL;
        localStorage.setItem('waterDrunk', waterDrunk);

        fill.style.height = `${(waterDrunk / WATER_GOAL) * 100}%`;
        counter.textContent = `${(waterDrunk / 1000).toFixed(1)}/${WATER_GOAL_LITERS} л`;

        if (waterDrunk >= WATER_GOAL) {
            widget.style.borderColor = '#2ecc71';
            label.textContent = '✅ Выполнено';
            label.style.color = '#2ecc71';
        }
    });

    // Автоматический сброс в полночь
    const now = new Date();
    const millisTillMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5) - now;
    setTimeout(() => {
        localStorage.setItem('waterDrunk', '0');
        widget.remove();
        waterWidget(); // перезапуск виджета
    }, millisTillMidnight);

})();
// ================== 🎯 Панель геймификации ==================
function updateGamificationPanel() {
    const info = Gamification.getInfo();
    document.getElementById('gami-points').textContent = info.points;
    document.getElementById('gami-level').textContent = info.level;
    document.getElementById('gami-next').textContent = info.next;
}

// обновляем панель каждые 2 секунды (вдруг пользователь что-то сделал)
setInterval(updateGamificationPanel, 2000);
updateGamificationPanel();
// Добавьте эту функцию в tracker.js
function loadHabitsFromAI() {
    const aiHabits = JSON.parse(localStorage.getItem('ai_generated_habits') || '[]');
    const userHabits = JSON.parse(localStorage.getItem('user_habits') || '[]');
    
    // Объединяем привычки, избегая дубликатов
    const allHabits = [...userHabits];
    
    aiHabits.forEach(aiHabit => {
        const exists = userHabits.some(habit => habit.name === aiHabit.name);
        if (!exists) {
            allHabits.push(aiHabit);
        }
    });
    
    localStorage.setItem('user_habits', JSON.stringify(allHabits));
    return allHabits;
}

// -------------------------------------------------------
// ДОБАВЛЕНИЕ: список описаний челленджей (исправленный)
// -------------------------------------------------------
const challengeDescriptions = {
    "challenge1": [
        "День 1: Ложиться спать до 23:00",
        "День 2: Спать минимум 8 часов",
        "День 3: Не использовать телефон перед сном",
        "День 4: Медитация перед сном",
        "День 5: Теплая ванна",
        "День 6: Легкая нагрузка",
        "День 7: Отдых"
    ],
    "challenge2": [
        "День 1: Пить 1.5 литра воды",
        "День 2: Пить 2 литра воды",
        "День 3: Без сладких напитков",
        "День 4: Вода с лимоном",
        "День 5: Контроль водного баланса",
        "День 6: Много фруктов",
        "День 7: Полный детокс"
    ],
    "challenge3": [
        "День 1: 20 приседаний",
        "День 2: 30 приседаний",
        "День 3: 40 приседаний",
        "День 4: 20 выпады",
        "День 5: 40 выпады",
        "День 6: 20 мин ходьба",
        "День 7: Растяжка"
    ]
};

// -------------------------------------------------------
// Функция рендера активных челленджей + continue
// -------------------------------------------------------
function renderActiveChallenges() {
    const container = document.getElementById("active-challenges");
    if (!container) return;

    container.innerHTML = "";

    const challengeKeys = ["challenge1", "challenge2", "challenge3"];
    let hasAny = false;

    challengeKeys.forEach(key => {
        const isActive = localStorage.getItem("active_" + key);
        const progress = Number(localStorage.getItem(key)) || 0;

        if (!isActive) return;
        hasAny = true;

        const totalDays = (challengeDescriptions[key] || []).length;

        const block = document.createElement("div");
        block.className = "active-card";
        block.style.border = "1px solid #ddd";
        block.style.padding = "15px";
        block.style.borderRadius = "10px";
        block.style.marginBottom = "15px";
        block.style.background = "#fafafa";

        block.innerHTML = `
            <h3 style="margin-bottom: 10px;">${key}</h3>
            <p><b>Прогресс:</b> ${progress}/${totalDays} дней</p>
            <div style="margin: 10px 0;">
                ${ (challengeDescriptions[key] || []).map((day, index) => `
                    <div style="padding:6px 10px; margin-bottom:5px; border-radius:6px; background:${index < progress ? '#c4ffc4' : '#eee'}">
                        ${day}
                    </div>
                `).join('') }
            </div>
            <button onclick="continueChallenge('${key}')" style="padding:8px 12px; background:#3b82f6; color:#fff; border-radius:6px; border:none; cursor:pointer;">
                Продолжить челлендж
            </button>
        `;

        container.appendChild(block);
    });

    if (!hasAny) {
        container.innerHTML = "<p>Нет активных челленджей</p>";
    }
}

function continueChallenge(id) {
    // передаём в challenges.html параметр open — там можно открыть нужную карточку
    window.location.href = "challenges.html?open=" + encodeURIComponent(id);
}

// Создаём автоматическое обновление (если где-то меняется localStorage)
setInterval(renderActiveChallenges, 2000);