document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("lifestyle-form");
    const sleepEl = document.getElementById("sleep-hours");
    const waterEl = document.getElementById("water-liters");
    const stepsEl = document.getElementById("step-goal");
    const calorieEl = document.getElementById("calorie-goal");
    const weightEl = document.getElementById("weight");
    const heightEl = document.getElementById("height");
    const resetBtn = document.getElementById("reset-btn");
  
    // Загрузка сохранённых значений (ключи в localStorage)
    sleepEl.value = localStorage.getItem("life_sleepHours") || "";
    waterEl.value = localStorage.getItem("life_waterLiters") || "";
    stepsEl.value = localStorage.getItem("life_stepGoal") || "";
    calorieEl.value = localStorage.getItem("life_calorieGoal") || "";
    weightEl.value = localStorage.getItem("life_weight") || "";
    heightEl.value = localStorage.getItem("life_height") || "";
  
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      localStorage.setItem("life_sleepHours", sleepEl.value.trim());
      localStorage.setItem("life_waterLiters", waterEl.value.trim());
      localStorage.setItem("life_stepGoal", stepsEl.value.trim());
      localStorage.setItem("life_calorieGoal", calorieEl.value.trim());
      localStorage.setItem("life_weight", weightEl.value.trim());
      localStorage.setItem("life_height", heightEl.value.trim());
      alert("✅ Настройки образа жизни сохранены");
      // можно вернуться назад
      window.location.href = "edit_profile.html";
    });
  
    resetBtn.addEventListener("click", () => {
      if (!confirm("Сбросить настройки образа жизни?")) return;
      sleepEl.value = "";
      waterEl.value = "";
      stepsEl.value = "";
      calorieEl.value = "";
      weightEl.value = "";
      heightEl.value = "";
      localStorage.removeItem("life_sleepHours");
      localStorage.removeItem("life_waterLiters");
      localStorage.removeItem("life_stepGoal");
      localStorage.removeItem("life_calorieGoal");
      localStorage.removeItem("life_weight");
      localStorage.removeItem("life_height");
      alert("Настройки сброшены");
    });
  });
  