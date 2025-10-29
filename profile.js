// === profile.js ===

document.addEventListener("DOMContentLoaded", () => {
    const emailSpan = document.getElementById("user-email");
    const userEmail = localStorage.getItem("userEmail") || "user@example.com";
    if (emailSpan) emailSpan.textContent = userEmail;

    // === Универсальная функция уведомлений ===
    function showNotification(text) {
        const note = document.createElement("div");
        note.className = "custom-alert";
        note.textContent = text;
        document.body.appendChild(note);
        setTimeout(() => note.classList.add("show"), 50);
        setTimeout(() => {
            note.classList.remove("show");
            setTimeout(() => note.remove(), 300);
        }, 2000);
    }

    // === Сменить аватар ===
    document.getElementById("change-avatar-btn")?.addEventListener("click", () => {
        showNotification("Функция смены аватара появится скоро 😊");
    });

    // === Уведомления ===
    document.getElementById("notifications")?.addEventListener("click", () => {
        showNotification("🔔 Раздел уведомлений пока не активен");
    });

    // === Общие настройки ===
    document.getElementById("settings")?.addEventListener("click", () => {
        showNotification("⚙️ Здесь будут общие настройки профиля");
    });

    // === Языковые параметры ===
    document.getElementById("language")?.addEventListener("click", () => {
        showNotification("🌐 Возможность смены языка появится позже");
    });

    // === Поделиться с друзьями ===
    document.getElementById("share")?.addEventListener("click", () => {
        navigator.clipboard.writeText(window.location.href);
        showNotification("🔗 Ссылка на сайт скопирована!");
    });

    // === Оцените нас ===
    document.getElementById("rate")?.addEventListener("click", () => {
        showNotification("⭐ Спасибо за вашу поддержку!");
    });

    // === Обратная связь ===
    document.getElementById("feedback")?.addEventListener("click", () => {
        window.location.href =
            "mailto:support@habitapp.com?subject=Обратная%20связь";
    });
// === Переход на страницу редактирования профиля ===
document.getElementById("edit-profile-btn")?.addEventListener("click", () => {
    window.location.href = "edit_profile.html";
});

    // === Диаграмма отчетности ===
    const ctx = document.getElementById("reportChart").getContext("2d");
    new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Выполнено", "В процессе", "Пропущено"],
            datasets: [
                {
                    data: [65, 25, 10],
                    backgroundColor: ["#4a90e2", "#a3c4f3", "#f8c8dc"],
                    borderWidth: 2,
                },
            ],
        },
        options: {
            plugins: {
                legend: {
                    position: "bottom",
                    labels: { color: "#333" },
                },
            },
        },
    });
});
