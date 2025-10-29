document.addEventListener("DOMContentLoaded", () => {
    const firstNameInput = document.getElementById("first-name");
    const lastNameInput = document.getElementById("last-name");
    const phoneInput = document.getElementById("phone");
    const avatarImg = document.getElementById("edit-avatar");
    const avatarUpload = document.getElementById("avatar-upload");
    const changeAvatarBtn = document.getElementById("change-avatar");
  
    // === Загружаем сохраненные данные ===
    firstNameInput.value = localStorage.getItem("firstName") || "";
    lastNameInput.value = localStorage.getItem("lastName") || "";
    phoneInput.value = localStorage.getItem("phone") || "";
  
    // === Загружаем сохранённый аватар ===
    const savedAvatar = localStorage.getItem("avatar");
    if (savedAvatar) avatarImg.src = savedAvatar;

    // === Плавная анимация при смене аватара ===
    avatarImg.style.transition = "0.3s ease-in-out";
  
    // === Подсказка при наведении на аватар ===
    avatarImg.title = "Нажмите кнопку 'Сменить аватар', чтобы изменить изображение";
  
    // === Выбор нового аватара ===
    changeAvatarBtn.addEventListener("click", () => {
      avatarUpload.click();
    });
  
    avatarUpload.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                avatarImg.style.opacity = 0;
                setTimeout(() => {
                    const imageData = reader.result;
                    avatarImg.src = imageData;
                    avatarImg.style.opacity = 1;
    
                    // === Сохраняем аватар для редактирования профиля ===
                    localStorage.setItem("avatar", imageData);
    
                    // === Обновляем текущего пользователя для трекера ===
                    const currentUserStr = localStorage.getItem("currentUser");
                    if (currentUserStr) {
                        const currentUser = JSON.parse(currentUserStr);
                        currentUser.avatar = imageData; // обновляем аватар
                        localStorage.setItem("currentUser", JSON.stringify(currentUser));
                    }
                }, 150);
            };
            reader.readAsDataURL(file);
        }
    });
    
  
    // === Сохранение данных профиля ===
    document.getElementById("edit-profile-form").addEventListener("submit", (e) => {
      e.preventDefault();
      localStorage.setItem("firstName", firstNameInput.value);
      localStorage.setItem("lastName", lastNameInput.value);
      localStorage.setItem("phone", phoneInput.value);
      alert("✅ Изменения сохранены!");
      window.location.href = "profile.html";
    });
  
    // === Кнопки дополнительных разделов ===
    document.getElementById("account-info").addEventListener("click", () => {
      alert("📄 Здесь будет информация об учетной записи");
    });
  
    document.getElementById("lifestyle-settings").addEventListener("click", () => {
      alert("🧘 Раздел настроек образа жизни в разработке");
    });

    // === Подсказки и эффект наведения для дополнительных кнопок ===
    const extraBtns = [document.getElementById("account-info"), document.getElementById("lifestyle-settings")];
    extraBtns.forEach(btn => {
        btn.addEventListener("mouseenter", () => btn.style.backgroundColor = "#357abd");
        btn.addEventListener("mouseleave", () => btn.style.backgroundColor = "#4a90e2");
    });
});
