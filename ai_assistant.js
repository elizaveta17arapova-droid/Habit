class AIAssistant {
    constructor() {
        this.apiKey = '';
        this.apiUrl = 'https://api.openai.com/v1/chat/completions';
        this.conversationHistory = [];
        this.generatedHabits = [];
        this.init();
    }

    init() {
        this.loadAPIKey();
        this.setupEventListeners();
         const resetBtn = document.getElementById('resetApiKeyBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            localStorage.removeItem('openai_api_key');
            alert('API ключ сброшен. Перезагрузите страницу.');
            location.reload();
        });
    }
    }

    loadAPIKey() {
        if(!this.apiKey){
            this.showAPIKeyModal();
        }
        this.apiKey = localStorage.getItem('openai_api_key') || '';
    }
    owAPIKeyModal() {
        const savedKey = localStorage.getItem('openai_api_key');
        if (savedKey) {
            console.log('Найден сохраненный ключ:', savedKey.substring(0, 10) + '...');
            this.apiKey = savedKey;
            return;
        }
        
        const apiKey = prompt('Для работы ИИ-помощника нужен OpenAI API ключ.\n\nПолучите его здесь: https://platform.openai.com/api-keys\n\nВведите ваш API ключ:');
        if (apiKey) {
            this.apiKey = apiKey.trim();
            localStorage.setItem('openai_api_key', this.apiKey);
            console.log('Ключ сохранен:', this.apiKey.substring(0, 10) + '...');
            alert('API ключ сохранен! Теперь вы можете использовать ИИ-помощника.');
        } else {
            alert('Без API ключа ИИ-помощник будет работать в демо-режиме.');
        }
    }

    setupEventListeners() {
        const preferencesForm = document.getElementById('preferencesForm');
        if (preferencesForm) {
            preferencesForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.generateHabits();
            });
        }

        const sendBtn = document.getElementById('sendMessageBtn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => {
                this.sendMessage();
            });
        }

        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }

        const addAllBtn = document.getElementById('addAllBtn');
        if (addAllBtn) {
            addAllBtn.addEventListener('click', () => {
                this.addAllToTracker();
            });
        }
    }

    async generateHabits() {
        if (!this.apiKey) {
            this.showAPIKeyModal();
            if (!this.apiKey) return; // Если пользователь отменил ввод ключа
        }

        const goals = document.getElementById('goals').value;
        const availableTime = document.getElementById('availableTime').value;
        const experience = document.getElementById('experience').value;
        const preferences = document.getElementById('preferences').value;

        if (!goals.trim()) {
            alert('Пожалуйста, укажите ваши цели');
            return;
        }

        this.showLoading(true);

        try {
            const prompt = this.buildHabitPrompt(goals, availableTime, experience, preferences);
            const response = await this.callOpenAI(prompt, 'generate');
            const habits = this.parseHabitsResponse(response);
            this.displayGeneratedHabits(habits);
        } catch (error) {
            console.error('Error generating habits:', error);
            this.showDemoHabits();
        } finally {
            this.showLoading(false);
        }
    }

    buildHabitPrompt(goals, time, experience, preferences) {
        return `Создай персонализированный план из 3-5 привычек для пользователя:

Основные цели: ${goals}
Свободное время: ${time} минут в день
Уровень опыта: ${experience}
Ограничения: ${preferences || 'нет'}

Верни ответ в JSON формате:
{
    "habits": [
        {
            "name": "Название привычки",
            "description": "Описание",
            "category": "здоровье/продуктивность/обучение/отдых",
            "duration": "X минут",
            "frequency": "ежедневно",
            "difficulty": "легкая/средняя/сложная",
            "benefits": ["польза 1", "польза 2"],
            "tips": ["совет 1", "совет 2"]
        }
    ]
}`;
    }

    async sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();

        if (!message) return;

        this.addMessageToChat('user', message);
        input.value = '';
        this.showChatLoading(true);

        try {
            if (!this.apiKey) {
                throw new Error('No API key');
            }

            const response = await this.callOpenAI(message, 'chat');
            this.addMessageToChat('ai', response);
        } catch (error) {
            console.error('Error in chat:', error);
            const demoResponse = this.getDemoResponse(message);
            this.addMessageToChat('ai', demoResponse);
        } finally {
            this.showChatLoading(false);
        }
    }

    getDemoResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('привет')) {
            return 'Привет! Я ваш помощник по привычкам. Введите API ключ для полного функционала.';
        }
        
        if (lowerMessage.includes('привычк')) {
            return 'Для новых привычек начинайте с 2-5 минут в день. Главное - регулярность!';
        }
        
        if (lowerMessage.includes('мотивац')) {
            return 'Мотивация приходит с действием! Начните с маленьких шагов.';
        }
        
        if (lowerMessage.includes('врем')) {
            return 'Для привычек лучше выделять постоянное время дня.';
        }
        
        return 'Я демо-версия ИИ помощника. Для полного функционала введите OpenAI API ключ.';
    }

    async callOpenAI(prompt, mode = 'generate') {
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: mode === 'generate' 
                            ? 'Ты эксперт по формированию привычек. Всегда отвечай в valid JSON формате.'
                            : 'Ты полезный ассистент по привычкам.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: mode === 'generate' ? 1000 : 500
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    parseHabitsResponse(content) {
        try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return parsed.habits || [];
            }
            throw new Error('No JSON found');
        } catch (error) {
            console.error('Error parsing habits:', error);
            return this.generateDemoHabits();
        }
    }

    generateDemoHabits() {
        return [
            {
                name: "Утренняя зарядка 5 минут",
                description: "Легкие упражнения для пробуждения тела",
                category: "здоровье",
                duration: "5 минут",
                frequency: "ежедневно",
                difficulty: "легкая",
                benefits: ["Улучшение кровообращения", "Повышение энергии"],
                tips: ["Делайте после пробуждения", "Начните с растяжек"]
            },
            {
                name: "Чтение 10 минут в день",
                description: "Развивающее чтение для личностного роста",
                category: "обучение",
                duration: "10 минут",
                frequency: "ежедневно",
                difficulty: "легкая",
                benefits: ["Расширение кругозора", "Улучшение концентрации"],
                tips: ["Выберите книгу заранее", "Читайте в спокойной обстановке"]
            }
        ];
    }

    showDemoHabits() {
        const demoHabits = this.generateDemoHabits();
        this.displayGeneratedHabits(demoHabits);
    }

    displayGeneratedHabits(habits) {
        const habitsList = document.getElementById('habitsList');
        const resultsSection = document.getElementById('resultsSection');

        if (!habitsList || !resultsSection) return;

        habitsList.innerHTML = '';
        this.generatedHabits = habits;

        if (habits.length === 0) {
            habitsList.innerHTML = '<p>Не удалось сгенерировать привычки. Попробуйте снова.</p>';
        } else {
            habits.forEach((habit, index) => {
                const habitElement = this.createHabitElement(habit, index);
                habitsList.appendChild(habitElement);
            });
        }

        resultsSection.classList.remove('hidden');
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    createHabitElement(habit, index) {
        const div = document.createElement('div');
        div.className = 'habit-card';
        div.innerHTML = `
            <div class="habit-header">
                <h4>${habit.name}</h4>
                <span class="difficulty-badge ${habit.difficulty}">${habit.difficulty}</span>
            </div>
            <p class="habit-description">${habit.description}</p>
            <div class="habit-details">
                <span class="category">${habit.category}</span>
                <span class="duration">${habit.duration}</span>
                <span class="frequency">${habit.frequency}</span>
            </div>
            <div class="habit-benefits">
                <strong>Преимущества:</strong>
                <ul>
                    ${habit.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
                </ul>
            </div>
            <div class="habit-tips">
                <strong>Советы:</strong>
                <ul>
                    ${habit.tips.map(tip => `<li>${tip}</li>`).join('')}
                </ul>
            </div>
            <button class="btn-small" onclick="aiAssistant.addToTracker(${index})">Добавить в трекер</button>
        `;
        return div;
    }

    addToTracker(habitIndex) {
        const habit = this.generatedHabits[habitIndex];
        this.saveHabitToTracker(habit);
        alert(`Привычка "${habit.name}" добавлена в трекер!`);
    }

    addAllToTracker() {
        if (!this.generatedHabits || this.generatedHabits.length === 0) {
            alert('Нет привычек для добавления');
            return;
        }

        this.generatedHabits.forEach(habit => {
            this.saveHabitToTracker(habit);
        });

        alert(`Все ${this.generatedHabits.length} привычек добавлены в трекер!`);
    }

    saveHabitToTracker(habit) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            alert('Сначала войдите в систему');
            return;
        }

        const userHabits = JSON.parse(localStorage.getItem('habits_' + currentUser.email) || '[]');
        
        const newHabit = {
            name: habit.name,
            done: false,
            date: new Date().toISOString().split('T')[0],
            description: habit.description,
            category: habit.category
        };

        userHabits.push(newHabit);
        localStorage.setItem('habits_' + currentUser.email, JSON.stringify(userHabits));

        // Сохраняем для статистики ИИ
        const aiHabits = JSON.parse(localStorage.getItem('ai_generated_habits') || '[]');
        aiHabits.push({
            ...habit,
            addedAt: new Date().toISOString(),
            userId: currentUser.email
        });
        localStorage.setItem('ai_generated_habits', JSON.stringify(aiHabits));
    }

    addMessageToChat(sender, message) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        messageDiv.innerHTML = `
            <div class="message-content">${this.formatMessage(message)}</div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    formatMessage(message) {
        return message.replace(/\n/g, '<br>');
    }

    showLoading(show) {
        const btnText = document.getElementById('btnText');
        const spinner = document.getElementById('spinner');
        const generateBtn = document.getElementById('generateBtn');

        if (btnText && spinner && generateBtn) {
            if (show) {
                btnText.textContent = 'Генерация...';
                spinner.classList.remove('hidden');
                generateBtn.disabled = true;
            } else {
                btnText.textContent = 'Сгенерировать привычки';
                spinner.classList.add('hidden');
                generateBtn.disabled = false;
            }
        }
    }

    showChatLoading(show) {
        const sendBtn = document.getElementById('sendMessageBtn');
        if (sendBtn) {
            sendBtn.disabled = show;
            sendBtn.textContent = show ? '...' : 'Отправить';
        }
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    window.aiAssistant = new AIAssistant();
});