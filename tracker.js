habits[habitIndex].name=newName.trim();
    habits[habitIndex].date=newDate;
    saveHabits();
    renderHabits();
    renderCalendar();

// Удаление
function deleteHabit(index){
    const filtered = habits.filter(h=>h.date===selectedDate);
    const habitIndex = habits.indexOf(filtered[index]);
    if(habitIndex===-1) return;
    if(confirm('Вы уверены, что хотите удалить эту привычку?')){
        habits.splice(habitIndex,1);
        saveHabits();
        renderHabits();
        renderCalendar();
    }
}

// Выход
logoutBtn.addEventListener('click', ()=>{
    localStorage.removeItem('currentUser');
    window.location.href='index.html';
});

// Календарь
function renderCalendar(){
    calendarList.innerHTML='';
    const monthDays = new Date(today.getFullYear(),today.getMonth()+1,0).getDate();
    for(let i=1;i<=monthDays;i++){
        const dateStr=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
        const li=document.createElement('li');
        li.textContent=i;

        if(habits.some(h=>h.date===dateStr)){
            li.style.backgroundColor='#a0e7a0';
        }
        if(dateStr===selectedDate){
            li.style.border='2px solid #333';
        }

        li.addEventListener('click',()=>{
            selectedDate=dateStr;
            habitDateInput.value=dateStr;
            renderHabits();
            renderCalendar();
        });

        calendarList.appendChild(li);
    }
}

// Статистика
function updateStats(){
    const filtered=habits.filter(h=>h.date===selectedDate);
    const total=filtered.length;
    const done=filtered.filter(h=>h.done).length;
    const percent=total===0?0:Math.round((done/total)*100);
    completionEl.textContent=percent+'%';

    // Streak
    let streakCount=0;
    let checkDate=new Date(selectedDate);
    while(true){
        const dateStr=checkDate.toISOString().split('T')[0];
        const dayHabits=habits.filter(h=>h.date===dateStr);
        if(dayHabits.length===0) break;
        if(!dayHabits.every(h=>h.done)) break;
        streakCount++;
        checkDate.setDate(checkDate.getDate()-1);
    }
    streakEl.textContent=streakCount;
}