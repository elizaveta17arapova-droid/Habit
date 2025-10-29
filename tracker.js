// Проверка, залогинен ли пользователь
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
if (!currentUser) {
    alert('Сначала войдите в систему');
    window.location.href = 'index.html';
}

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

if(currentUser.avatar){
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

// ----------------- Отметка выполнения -----------------
function toggleDone(index) {
    const filtered = habits.filter(h => h.date === selectedDate);
    const habitIndex = habits.indexOf(filtered[index]);
    if (habitIndex === -1) return;
    habits[habitIndex].done = !habits[habitIndex].done;
    saveHabits();
    renderHabits();
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
if(currentUser.avatar){
    profileImg.src = currentUser.avatar;
    menuAvatar.src = currentUser.avatar;
} else {
    // если avatar нет в currentUser, берём из отдельного ключа "avatar"
    const savedAvatar = localStorage.getItem("avatar");
    if(savedAvatar){
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
