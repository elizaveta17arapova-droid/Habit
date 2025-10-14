// Проверка, залогинен ли пользователь
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
if (!currentUser) {
    alert('Сначала войдите в систему');
    window.location.href = 'index.html';
}

// Элементы страницы
const habitInput = document.getElementById('habit-name');
const addBtn = document.getElementById('add-btn');
const habitsList = document.getElementById('habits');
const logoutBtn = document.getElementById('logout-btn');

// Загружаем привычки текущего пользователя
let habits = JSON.parse(localStorage.getItem('habits_' + currentUser.email)) || [];
renderHabits();

// ----------------- Добавление привычки -----------------
addBtn.addEventListener('click', () => {
    const name = habitInput.value.trim();
    if (name) {
        habits.push({ name, done: false });
        habitInput.value = '';
        saveHabits();
        renderHabits();
    }
});

// ----------------- Сохранение привычек -----------------
function saveHabits() {
    localStorage.setItem('habits_' + currentUser.email, JSON.stringify(habits));
}

// ----------------- Отображение привычек -----------------
function renderHabits() {
    habitsList.innerHTML = '';
    habits.forEach((habit, index) => {
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
}

// ----------------- Отметка выполнения -----------------
function toggleDone(index) {
    habits[index].done = !habits[index].done;
    saveHabits();
    renderHabits();
}

// ----------------- Редактирование привычки -----------------
function editHabit(index) {
    const newName = prompt('Введите новое название привычки:', habits[index].name);
    if (newName && newName.trim() !== '') {
        habits[index].name = newName.trim();
        saveHabits();
        renderHabits();
    }
}

// ----------------- Удаление привычки -----------------
function deleteHabit(index) {
    if (confirm('Вы уверены, что хотите удалить эту привычку?')) {
        habits.splice(index, 1);
        saveHabits();
        renderHabits();
    }
}

// ----------------- Выход из системы -----------------
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
});
