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
// CSS стили для ИИ-помощника
const addAIStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
        .ai-assistant-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }

        .ai-header {
            text-align: center;
            margin-bottom: 30px;
        }

        .preferences-form {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #333;
        }

        .form-group textarea,
        .form-group select {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 14px;
        }

        .form-group textarea {
            resize: vertical;
            min-height: 60px;
        }

        .spinner {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 2px solid #f3f3f3;
            border-top: 2px solid #007bff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-left: 10px;
        }

        .spinner.hidden {
            display: none;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .ai-results {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }

        .ai-results.hidden {
            display: none;
        }

        .habit-card {
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
            background: #f9f9f9;
        }

        .habit-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }

        .difficulty-badge {
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
        }

        .difficulty-badge.легкая {
            background: #d4edda;
            color: #155724;
        }

        .difficulty-badge.средняя {
            background: #fff3cd;
            color: #856404;
        }

        .difficulty-badge.сложная {
            background: #f8d7da;
            color: #721c24;
        }

        .habit-details {
            display: flex;
            gap: 10px;
            margin: 10px 0;
            flex-wrap: wrap;
        }

        .habit-details span {
            background: #e9ecef;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
        }

        .habit-benefits,
        .habit-tips {
            margin: 10px 0;
        }

        .habit-benefits ul,
        .habit-tips ul {
            margin: 5px 0;
            padding-left: 20px;
        }

        .habit-benefits li,
        .habit-tips li {
            margin: 2px 0;
            font-size: 14px;
        }

        .btn-small {
            padding: 5px 10px;
            font-size: 12px;
            margin-top: 10px;
        }

        .ai-chat {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .chat-container {
            border: 1px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
        }

        .chat-messages {
            height: 300px;
            overflow-y: auto;
            padding: 15px;
            background: #f8f9fa;
        }

        .message {
            margin-bottom: 15px;
            display: flex;
        }

        .user-message {
            justify-content: flex-end;
        }

        .ai-message {
            justify-content: flex-start;
        }

        .message-content {
            max-width: 70%;
            padding: 10px 15px;
            border-radius: 18px;
            word-wrap: break-word;
        }

        .user-message .message-content {
            background: #007bff;
            color: white;
        }

        .ai-message .message-content {
            background: white;
            border: 1px solid #ddd;
            color: #333;
        }

        .chat-input {
            display: flex;
            padding: 15px;
            background: white;
            border-top: 1px solid #ddd;
        }

        .chat-input input {
            flex: 1;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 20px;
            margin-right: 10px;
        }

        .chat-input button {
            padding: 10px 20px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 20px;
            cursor: pointer;
        }

        .chat-input button:disabled {
            background: #6c757d;
            cursor: not-allowed;
        }

        .hidden {
            display: none !important;
        }
    `;
    document.head.appendChild(style);
};

// Инициализация когда DOM загружен
document.addEventListener('DOMContentLoaded', () => {
    addAIStyles();
    window.aiAssistant = new AIAssistant();
});