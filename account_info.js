document.addEventListener("DOMContentLoaded", () => {
    const emailEl = document.getElementById("user-email");
    const idEl = document.getElementById("user-id");
  
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
        alert("Сначала войдите в систему");
        window.location.href = "index.html";
        return;
    }
  
    // Загружаем email и ID
    emailEl.textContent = currentUser.email || "не указан";
    idEl.textContent = currentUser.id || "не указан";
  });
  