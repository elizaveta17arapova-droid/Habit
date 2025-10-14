// Получаем элементы даты
const habitDateInput = document.getElementById('habit-date');

// Устанавливаем сегодняшнюю дату по умолчанию
habitDateInput.valueAsDate = today;

// ----------------- Добавление привычки -----------------
addBtn.addEventListener('click', () => {
    const name = habitInput.value.trim();
    const date = habitDateInput.value; // дата в формате YYYY-MM-DD
    if (!name) return alert('Введите название привычки');
    if (!date) return alert('Выберите дату');

    habits.push({ name, done: false, date });
    habitInput.value = '';
    habitDateInput.valueAsDate = today;
    saveHabits();
    renderHabits();
    renderCalendar(); // обновляем календарь, если хотим показывать даты с привычками
});

// ----------------- Отображение привычек -----------------
function renderHabits(selectedDate = today.toISOString().split('T')[0]) {
    habitsList.innerHTML = '';
    // фильтруем привычки по выбранной дате
    const filteredHabits = habits.filter(h => h.date === selectedDate);
    filteredHabits.forEach((habit, index) => {
        const li = document.createElement('li');
        li.className = 'habit-item';
        li.innerHTML = `
            <span style="text-decoration:${habit.done ? 'line-through' : 'none'}">${habit.name}</span>
            <div class="buttons">
                <button onclick="toggleDone('${habit.date}', ${index})">${habit.done ? 'Сбросить' : 'Выполнено'}</button>
                <button onclick="editHabit('${habit.date}', ${index})">Редактировать</button>
                <button onclick="deleteHabit('${habit.date}', ${index})">Удалить</button>
            </div>
        `;
        habitsList.appendChild(li);
    });
}

// ----------------- Отметка выполнения -----------------
function toggleDone(date, index) {
    const filtered = habits.filter(h => h.date === date);
    const habitIndex = habits.indexOf(filtered[index]);
    habits[habitIndex].done = !habits[habitIndex].done;
    saveHabits();
    renderHabits(date);
}

// ----------------- Редактирование привычки -----------------
function editHabit(date, index) {
    const filtered = habits.filter(h => h.date === date);
    const habitIndex = habits.indexOf(filtered[index]);
    const newName = prompt('Введите новое название привычки:', habits[habitIndex].name);
    if (newName && newName.trim() !== '') {
        habits[habitIndex].name = newName.trim();
        saveHabits();
        renderHabits(date);
    }
}

// ----------------- Удаление привычки -----------------
function deleteHabit(date, index) {
    const filtered = habits.filter(h => h.date === date);
    const habitIndex = habits.indexOf(filtered[index]);
    if (confirm('Вы уверены, что хотите удалить эту привычку?')) {
        habits.splice(habitIndex, 1);
        saveHabits();
        renderHabits(date);
    }
}

// ----------------- Календарь с кликабельными датами -----------------
function renderCalendar() {
    calendarList.innerHTML = '';
    const monthDays = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    for (let i = 1; i <= monthDays; i++) {
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const li = document.createElement('li');
        li.textContent = i;
        // если есть привычка на эту дату — выделяем
        if (habits.some(h => h.date === dateStr)) {
            li.style.backgroundColor = '#a0e7a0';
        }
        li.addEventListener('click', () => {
            renderHabits(dateStr);
            habitDateInput.value = dateStr; // при добавлении привычки дата будет выбранная
        });
        calendarList.appendChild(li);
    }
}