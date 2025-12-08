// Получаем кнопки и iframe
const buttons = document.querySelectorAll(".music-btn");
const player = document.getElementById("music-player");

// Плейлисты (embed ссылки)
const playlist = {
    focus: "https://www.youtube.com/embed/pQHLD3-8czM",
    relax: "https://www.youtube.com/embed/eKO9BGdQ7Wk",
    sport: "https://www.youtube.com/embed/FeR-4_Opt-g"
};

// Клик по кнопке — смена видео
buttons.forEach(btn => {
    btn.addEventListener("click", () => {
        const type = btn.dataset.type;
        if (playlist[type]) {
            player.src = playlist[type] + "?autoplay=1";
        } else {
            alert("Плейлист не найден!");
        }
    });
});
