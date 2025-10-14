// Получаем элементы
const habitInput = document.getElementById('habit-name');
const addBtn = document.getElementById('add-btn');
const habitsList = document.getElementById('habits');

// Загружаем привычки из localStorage
let habits = JSON.parse(localStorage.getItem('habits')) || [];
renderHabits();

// Добавление новой привычки
addBtn.addEventListener('click', () => {
    const name = habitInput.value.trim();
    if (name) {
        habits.push({ name, done: false });
        habitInput.value = '';
        saveHabits();
        renderHabits();
    }
});

// Сохранение в localStorage
function saveHabits() {
    localStorage.setItem('habits', JSON.stringify(habits));
}

// Отображение привычек
function renderHabits() {
    habitsList.innerHTML = '';
    habits.forEach((habit, index) => {
        const li = document.createElement('li');
        li.className = 'habit-item';
        li.innerHTML = `
            <span style="text-decoration:${habit.done ? 'line-through' : 'none'}">${habit.name}</span>
            <button onclick="toggleDone(${index})">${habit.done ? 'Сбросить' : 'Выполнено'}</button>
        `;
        habitsList.appendChild(li);
    });
}

// Отметка выполнения
function toggleDone(index) {
    habits[index].done = !habits[index].done;
    saveHabits();
    renderHabits();
}
