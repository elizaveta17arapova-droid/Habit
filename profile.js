// Проверяем, вошёл ли пользователь
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
if (!currentUser) {
    alert('Сначала войдите в систему');
    window.location.href = 'index.html';
}

// Вывод приветствия и даты
document.getElementById('welcome').textContent = `Привет, ${currentUser.email}`;
document.getElementById('date').textContent = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
});

// ----------------- Работа с привычками -----------------
const habitInput = document.getElementById('habit-input');
const addBtn = document.getElementById('add-btn');
const habitList = document.getElementById('habit-list');

let habits = JSON.parse(localStorage.getItem('habits_' + currentUser.email)) || [];

function renderHabits() {
    habitList.innerHTML = '';
    if (habits.length === 0) {
        habitList.innerHTML = '<li>На сегодня ничего не запланировано</li>';
        return;
    }

    habits.forEach((habit, index) => {
        const li = document.createElement('li');
        li.className = 'habit-item';
        li.innerHTML = `
      <span style="text-decoration:${habit.done ? 'line-through' : 'none'}">
        ${habit.name}
      </span>
      <div>
        <button onclick="toggleHabit(${index})">${habit.done ? 'Сбросить' : 'Выполнено'}</button>
        <button onclick="editHabit(${index})">Редактировать</button>
        <button onclick="deleteHabit(${index})">Удалить</button>
      </div>
    `;
        habitList.appendChild(li);
    });
}

function saveHabits() {
    localStorage.setItem('habits_' + currentUser.email, JSON.stringify(habits));
}

addBtn.onclick = () => {
    const name = habitInput.value.trim();
    if (!name) return;
    habits.push({ name, done: false });
    habitInput.value = '';
    saveHabits();
    renderHabits();
};

function toggleHabit(i) {
    habits[i].done = !habits[i].done;
    saveHabits();
    renderHabits();
}

function editHabit(i) {
    const newName = prompt('Изменить привычку:', habits[i].name);
    if (newName) {
        habits[i].name = newName;
        saveHabits();
        renderHabits();
    }
}

function deleteHabit(i) {
    if (confirm('Удалить привычку?')) {
        habits.splice(i, 1);
        saveHabits();
        renderHabits();
    }
}

renderHabits();

// ----------------- Календарь -----------------
const daysContainer = document.getElementById('days');
const today = new Date();
for (let i = -3; i <= 3; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const div = document.createElement('div');
    div.textContent = date.getDate();
    div.className = (i === 0) ? 'today' : '';
    daysContainer.appendChild(div);
}

// ----------------- Выход -----------------
document.getElementById('logout-btn').onclick = () => {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
};
