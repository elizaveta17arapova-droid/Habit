// ----------------------------
// Загрузка сохранённых данных
// ----------------------------
let moodData = JSON.parse(localStorage.getItem("moodData")) || [];
let moodComments = JSON.parse(localStorage.getItem("moodComments")) || {};

const today = new Date().toISOString().split("T")[0];

// ----------------------------
// Эмоции (кнопки)
// ----------------------------
document.querySelectorAll(".mood-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const value = Number(btn.dataset.value);

        // Добавляем запись
        moodData.push({
            date: today,
            value: value
        });

        // Сохраняем
        localStorage.setItem("moodData", JSON.stringify(moodData));

        alert("Настроение сохранено!");
        updateChart();
    });
});

// ----------------------------
// Комментарий дня
// ----------------------------
const commentInput = document.getElementById("moodComment");
const saveBtn = document.getElementById("saveMood");

// Подгружаем комментарий, если есть
if (moodComments[today]) {
    commentInput.value = moodComments[today];
}

saveBtn.addEventListener("click", () => {
    moodComments[today] = commentInput.value;
    localStorage.setItem("moodComments", JSON.stringify(moodComments));
    alert("Комментарий сохранён!");
});

// ----------------------------
// Построение графика
// ----------------------------
const ctx = document.getElementById("moodChart").getContext("2d");

let chart;

// Функция обновления графика
function updateChart() {
    const last7 = moodData.slice(-7);  // последние 7 дней

    const labels = last7.map(item => item.date);
    const values = last7.map(item => item.value);

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Настроение",
                data: values,
                borderWidth: 2,
                tension: 0.3,
            }]
        },
        options: {
            scales: {
                y: {
                    min: 1,
                    max: 5,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

updateChart();
