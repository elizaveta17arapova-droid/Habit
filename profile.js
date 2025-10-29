document.addEventListener("DOMContentLoaded", () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    const emailSpan = document.getElementById("user-email");
    emailSpan.textContent = currentUser.email;

    const avatarImg = document.getElementById("avatar");
    if (currentUser.avatar) avatarImg.src = currentUser.avatar;

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

    // Смена аватара
    const avatarUpload = document.getElementById("avatar-upload");
    const changeAvatarBtn = document.getElementById("change-avatar-btn");
    changeAvatarBtn.addEventListener("click", () => avatarUpload.click());
    avatarUpload.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            avatarImg.src = reader.result;
            currentUser.avatar = reader.result;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            localStorage.setItem("avatar", reader.result);
            showNotification("Аватар успешно изменен! ✅");
        };
        reader.readAsDataURL(file);
    });

    // Редактирование профиля
    document.getElementById("edit-profile-btn")?.addEventListener("click", () => {
        window.location.href = "edit_profile.html";
    });

    // Уведомления (реальное количество невыполненных привычек)
    document.getElementById("notifications")?.addEventListener("click", () => {
        const habits = JSON.parse(localStorage.getItem('habits_' + currentUser.email)) || [];
        const incompleteCount = habits.filter(h => !h.done).length;
        showNotification(`🔔 У вас осталось ${incompleteCount} невыполненных привычек`);
    });

    // Поделиться ссылкой
    document.getElementById("share")?.addEventListener("click", () => {
        navigator.clipboard.writeText(window.location.href);
        showNotification("🔗 Ссылка на сайт скопирована!");
    });

    // Переключение темы
    const themeToggle = document.getElementById("theme-toggle");
    const savedTheme = localStorage.getItem("theme") || "light";
    document.body.classList.add(savedTheme);
    themeToggle?.addEventListener("click", () => {
        if (document.body.classList.contains("light")) {
            document.body.classList.replace("light", "dark");
            localStorage.setItem("theme", "dark");
            showNotification("🌙 Темная тема включена");
        } else {
            document.body.classList.replace("dark", "light");
            localStorage.setItem("theme", "light");
            showNotification("☀️ Светлая тема включена");
        }
    });
});
