document.addEventListener("DOMContentLoaded", () => {
    const firstNameInput = document.getElementById("first-name");
    const lastNameInput = document.getElementById("last-name");
    const phoneInput = document.getElementById("phone");
  
    // === Загружаем сохраненные данные ===
    firstNameInput.value = localStorage.getItem("firstName") || "";
    lastNameInput.value = localStorage.getItem("lastName") || "";
    phoneInput.value = localStorage.getItem("phone") || "";
  
    // === Сохраняем изменения ===
    document.getElementById("edit-profile-form").addEventListener("submit", (e) => {
      e.preventDefault();
      localStorage.setItem("firstName", firstNameInput.value);
      localStorage.setItem("lastName", lastNameInput.value);
      localStorage.setItem("phone", phoneInput.value);
      alert("✅ Изменения сохранены!");
      window.location.href = "profile.html";
    });
  
    // === Кнопки доп. разделов ===
    document.getElementById("account-info").addEventListener("click", () => {
      alert("📄 Здесь будет информация об учетной записи");
    });
  
    document.getElementById("lifestyle-settings").addEventListener("click", () => {
      alert("🧘 Раздел настроек образа жизни в разработке");
    });
  });
  