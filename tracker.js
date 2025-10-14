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

// Профиль и текущая дата
userEmail.textContent = currentUser.email;
const today = new Date();
const todayStr = today.toISOString().split('T')[0];
currentDateEl.textContent = today.toLocaleDateString();
habitDateInput.value = todayStr;

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

// ----------------- Выход -----------------
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
});

// ----------------- Календарь -----------------
function renderCalendar() {
    calendarList.innerHTML = '';
    const monthDays = new Date(today.getFullYear(), today.getMonth()+1, 0).getDate();
    for (let i = 1; i <= monthDays; i++) {
        const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
        const li = document.createElement('li');
        li.textContent = i;

        // Подсветка, если есть привычки
        if (habits.some(h => h.date === dateStr)) {
            li.style.backgroundColor = '#a0e7a0';
        }
        if (dateStr === selectedDate) {
            li.style.border = '2px solid #333';
        }

        li.addEventListener('click', () => {
            selectedDate = dateStr;
            habitDateInput.value = dateStr;
            renderHabits();
            renderCalendar();
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

    // Streak: последовательные дни с выполнением всех привычек
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
