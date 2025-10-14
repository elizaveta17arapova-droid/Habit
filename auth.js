// =========================
// Получаем элементы
// =========================
const regEmail = document.getElementById('reg-email');
const regPassword = document.getElementById('reg-password');
const registerBtn = document.getElementById('register-btn');

const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const loginBtn = document.getElementById('login-btn');

const resetBtn = document.getElementById('reset-btn');

// Переключатели между формами
const loginSection = document.getElementById('login-section');
const registerSection = document.getElementById('register-section');
const toRegister = document.getElementById('to-register');
const toLogin = document.getElementById('to-login');

// "База пользователей"
let users = JSON.parse(localStorage.getItem('users')) || [];

// =========================
// Автоматический переход на регистрацию, если нет пользователей
// =========================
document.addEventListener('DOMContentLoaded', () => {
    if (users.length === 0) {
        loginSection.style.display = 'none';
        registerSection.style.display = 'block';
    } else {
        loginSection.style.display = 'block';
        registerSection.style.display = 'none';
    }
});

// =========================
// Переключение между регистрацией и входом
// =========================
toRegister.addEventListener('click', () => {
    loginSection.style.display = 'none';
    registerSection.style.display = 'block';
});

toLogin.addEventListener('click', () => {
    registerSection.style.display = 'none';
    loginSection.style.display = 'block';
});

// =========================
// Регистрация
// =========================
registerBtn.addEventListener('click', () => {
    const email = regEmail.value.trim();
    const password = regPassword.value.trim();

    if (!email || !password) {
        alert('Введите email и пароль');
        return;
    }

    if (users.some(u => u.email === email)) {
        alert('Пользователь с таким email уже существует');
        return;
    }

    users.push({ email, password }); // (в будущем можно хэшировать пароль)
    localStorage.setItem('users', JSON.stringify(users));

    alert('Регистрация успешна! Теперь войдите в систему.');

    // Очищаем поля и переключаем обратно на вход
    regEmail.value = '';
    regPassword.value = '';
    registerSection.style.display = 'none';
    loginSection.style.display = 'block';
});

// =========================
// Вход
// =========================
loginBtn.addEventListener('click', () => {
    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();

    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        alert('Вход успешен!');
        window.location.href = 'tracker.html'; // Переход на трекер привычек
    } else {
        alert('Неправильный email или пароль');
    }
});

// =========================
// Сброс пароля
// =========================
resetBtn.addEventListener('click', () => {
    const email = prompt('Введите ваш email для сброса пароля:');
    if (!email) return alert('Email не введён');

    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex === -1) {
        return alert('Пользователь с таким email не найден');
    }

    const newPassword = prompt('Введите новый пароль:');
    if (!newPassword) return alert('Пароль не введён');

    users[userIndex].password = newPassword;
    localStorage.setItem('users', JSON.stringify(users));
    alert('Пароль успешно сброшен');
});

// =========================
// Соц. вход (имитация)
// =========================
document.getElementById('google-login').addEventListener('click', () => {
    alert('Вход через Google (демо-режим)');
});

document.getElementById('apple-login').addEventListener('click', () => {
    alert('Вход через Apple (демо-режим)');
});
