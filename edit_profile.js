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
  
    // === Выбор нового аватара ===
    changeAvatarBtn.addEventListener("click", () => {
      avatarUpload.click();
    });
  
    avatarUpload.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          avatarImg.src = reader.result;
          localStorage.setItem("avatar", reader.result);
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
  });
  
  