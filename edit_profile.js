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

                  // === Сохраняем аватар ===
                  localStorage.setItem("avatar", imageData);

                  // === Обновляем currentUser ===
                  const currentUserStr = localStorage.getItem("currentUser");
                  if (currentUserStr) {
                      const currentUser = JSON.parse(currentUserStr);
                      currentUser.avatar = imageData;
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

  // === Кнопка "Сведения учетной записи" (новый код) ===
  document.getElementById("account-info").addEventListener("click", () => {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (!currentUser) {
          alert("Сначала войдите в систему");
          window.location.href = "index.html";
          return;
      }
      // Сохраняем данные для страницы account_info
      localStorage.setItem("accountInfo_email", currentUser.email || "");
      localStorage.setItem("accountInfo_id", currentUser.id || "");
      // Переходим на страницу account_info.html
      window.location.href = "account_info.html";
  });

  // === Переход в настройки образа жизни ===
  document.getElementById("lifestyle-settings").addEventListener("click", () => {
      window.location.href = "lifestyle.html"; // теперь открывает страницу lifestyle.html
  });

  // === Подсказки и эффект наведения для кнопок ===
  const extraBtns = [document.getElementById("account-info"), document.getElementById("lifestyle-settings")];
  extraBtns.forEach(btn => {
      btn.addEventListener("mouseenter", () => btn.style.backgroundColor = "#357abd");
      btn.addEventListener("mouseleave", () => btn.style.backgroundColor = "#4a90e2");
  });

  // === Добавляем лёгкий стиль при загрузке (анимация карточки) ===
  const editCard = document.querySelector(".edit-card");
  if (editCard) {
      editCard.style.opacity = "0";
      editCard.style.transform = "translateY(20px)";
      setTimeout(() => {
          editCard.style.transition = "all 0.4s ease";
          editCard.style.opacity = "1";
          editCard.style.transform = "translateY(0)";
      }, 100);
  }
});
