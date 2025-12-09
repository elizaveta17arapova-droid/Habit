// Получаем элементы
const titleInput = document.getElementById('music-title');
const categoryInput = document.getElementById('music-category');
const urlInput = document.getElementById('music-url');
const addBtn = document.getElementById('add-btn');
const playlistDiv = document.getElementById('playlist');
const player = document.getElementById('player');

// Загружаем плейлист из LocalStorage
let playlist = JSON.parse(localStorage.getItem('playlist')) || [];

// Функция конвертации ссылки YouTube в embed
function convertToEmbed(url) {
    try {
        if (url.includes("youtube.com/shorts/")) {
            let id = url.split("youtube.com/shorts/")[1].split("?")[0];
            return "https://www.youtube.com/embed/" + id;
        }
        if (url.includes("youtu.be/")) {
            let id = url.split("youtu.be/")[1].split("?")[0];
            return "https://www.youtube.com/embed/" + id;
        }
        if (url.includes("watch?v=")) {
            let id = url.split("watch?v=")[1].split("&")[0];
            return "https://www.youtube.com/embed/" + id;
        }
        if (url.includes("embed/")) return url;
        return null;
    } catch {
        return null;
    }
}

// Добавление музыки
addBtn.addEventListener('click', () => {
    const title = titleInput.value.trim();
    const category = categoryInput.value.trim();
    const url = convertToEmbed(urlInput.value.trim());

    if (!title || !category || !url) {
        alert("Пожалуйста, заполните все поля и вставьте корректную ссылку YouTube!");
        return;
    }

    const id = Date.now(); // уникальный id
    playlist.push({ id, title, category, url });
    localStorage.setItem('playlist', JSON.stringify(playlist));

    titleInput.value = '';
    categoryInput.value = '';
    urlInput.value = '';

    renderList();
});

// Отрисовка плейлиста
function renderList() {
    playlistDiv.innerHTML = '';
    playlist.forEach(item => {
        const track = document.createElement('div');
        track.className = 'track';
        track.innerHTML = `
            <span>🎧 ${item.category} — ${item.title}</span>
            <button onclick="playMusic(${item.id})">▶️</button>
            <button onclick="deleteMusic(${item.id})">✖</button>
        `;
        playlistDiv.appendChild(track);
    });
}

// Воспроизведение
function playMusic(id) {
    const item = playlist.find(t => t.id === id);
    if (item) {
        player.src = item.url + "?autoplay=1";
    }
}

// Удаление трека
function deleteMusic(id) {
    playlist = playlist.filter(item => item.id !== id);
    localStorage.setItem('playlist', JSON.stringify(playlist));
    renderList();
}

// Инициализация
renderList();
