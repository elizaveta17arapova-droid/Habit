class AIAssistant {
     constructor() {
        this.apiKey = '';
        this.apiUrl = 'https://api.openai.com/v1/chat/completions';
        this.conversationHistory = [];
        this.generatedHabits = [];
        this.userChronotype = null;
        this.userSleepSchedule = null;
        this.init();
    }

    init() {
        this.loadAPIKey();
        this.loadUserChronotype();
        this.setupEventListeners();
    }

    loadAPIKey() {
        this.apiKey = localStorage.getItem('openai_api_key') || '';
    }
    loadUserChronotype() {
        // Загружаем сохраненные данные о хронобиологии пользователя
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            const userData = JSON.parse(localStorage.getItem('user_' + currentUser.email) || '{}');
            this.userChronotype = userData.chronotype || null;
            this.userSleepSchedule = userData.sleepSchedule || null;
        }
    }

    showAPIKeyModal() {
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
        // Кнопка для определения хронобиологии
        const analyzeChronotypeBtn = document.getElementById('analyzeChronotypeBtn');
        if (analyzeChronotypeBtn) {
            analyzeChronotypeBtn.addEventListener('click', () => {
                this.analyzeChronotype();
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
            
            // Добавляем рекомендации по времени на основе хронобиологии
            const habitsWithTiming = await this.enhanceWithChronobiology(habits);
            
            this.displayGeneratedHabits(habitsWithTiming);
        } catch (error) {
            console.error('Error generating habits:', error);
            this.showDemoHabits();
        } finally {
            this.showLoading(false);
        }
    }

    buildHabitPrompt(goals, time, experience, preferences) {
        let chronotypeInfo = '';
        if (this.userChronotype) {
            chronotypeInfo = `Хронобиологический тип пользователя: ${this.userChronotype}\nОптимальное время активности: ${this.getOptimalTimeRange()}`;
        }

        return `Создай персонализированный план из 3-5 привычек для пользователя:

Основные цели: ${goals}
Свободное время: ${time} минут в день
Уровень опыта: ${experience}
Ограничения: ${preferences || 'нет'}
${chronotypeInfo}

Для каждой привычки учитывай оптимальное время выполнения на основе хронобиологии:
- Утренние часы (6-9): физическая активность, творческие задачи
- Обеденное время (12-14): легкие задачи, перерывы
- Вечерние часы (18-21): размышления, планирование, рутинные задачи

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
            "optimal_time": "рекомендованное время на основе биоритмов",
            "scientific_basis": "научное обоснование времени выполнения",
            "benefits": ["польза 1", "польза 2"],
            "tips": ["совет 1", "совет 2"]
        }
    ]
}`;
    }

    getOptimalTimeRange() {
        if (!this.userChronotype) return 'Не определено';
        
        const chronotypeRanges = {
            'жаворонок': '6:00-12:00 (утренняя активность)',
            'голубь': '9:00-15:00 (дневная активность)',
            'сова': '15:00-21:00 (вечерняя активность)',
            'дельфин': '10:00-16:00 (переменная активность)'
        };
        
        return chronotypeRanges[this.userChronotype] || '9:00-18:00 (стандартная активность)';
    }

    async enhanceWithChronobiology(habits) {
        if (!this.userChronotype) {
            // Если хронобиология не определена, добавляем стандартные рекомендации
            return habits.map(habit => ({
                ...habit,
                optimal_time: this.getDefaultOptimalTime(habit.category),
                scientific_basis: habit.scientific_basis || 'Общие рекомендации на основе типа привычки'
            }));
        }

        try {
            const prompt = `На основе хронобиологического типа "${this.userChronotype}" и сна ${this.userSleepSchedule}, оптимизируй время выполнения привычек:
            
            Привычки для оптимизации: ${JSON.stringify(habits.map(h => ({name: h.name, category: h.category})))}
            
            Верни JSON с оптимизированным временем для каждой привычки в формате:
            {
                "optimized_habits": [
                    {
                        "name": "название привычки",
                        "optimal_time": "рекомендованное время",
                        "scientific_basis": "научное обоснование"
                    }
                ]
            }`;
            
            const response = await this.callOpenAI(prompt, 'optimize');
            const optimization = this.parseOptimizationResponse(response);
            
            return habits.map(habit => {
                const optimized = optimization.find(h => h.name === habit.name);
                return {
                    ...habit,
                    optimal_time: optimized?.optimal_time || this.getDefaultOptimalTime(habit.category),
                    scientific_basis: optimized?.scientific_basis || 'Рекомендация на основе общего хронобиологического профиля'
                };
            });
        } catch (error) {
            console.error('Error optimizing habits:', error);
            return habits.map(habit => ({
                ...habit,
                optimal_time: this.getDefaultOptimalTime(habit.category),
                scientific_basis: 'Общие рекомендации на основе хронобиологии'
            }));
        }
    }

    getDefaultOptimalTime(category) {
        const timeMap = {
            'здоровье': '6:00-8:00 или 17:00-19:00',
            'продуктивность': '9:00-11:00 или 15:00-17:00',
            'обучение': '10:00-12:00 или 19:00-21:00',
            'отдых': '13:00-15:00 или 20:00-22:00'
        };
        return timeMap[category] || '9:00-18:00';
    }

    async analyzeChronotype() {
        if (!this.apiKey) {
            this.showAPIKeyModal();
            if (!this.apiKey) return;
        }

        const questions = [
            "В какое время вы обычно просыпаетесь без будильника?",
            "Когда вы чувствуете наибольший прилив энергии?",
            "В какое время суток вам легче всего концентрироваться?",
            "Когда вы предпочитаете ложиться спать?",
            "Как вы чувствуете себя при раннем пробуждении?"
        ];

        const answers = [];
        for (let i = 0; i < questions.length; i++) {
            const answer = prompt(questions[i] + "\n\nОтвет будет использован для определения вашего хронобиологического типа.");
            if (answer === null) return; // Пользователь отменил
            answers.push(answer);
        }

        try {
            const prompt = `Проанализируй ответы пользователя для определения хронобиологического типа (жаворонок, голубь, сова, дельфин):
            
            Ответы: ${JSON.stringify(answers)}
            
            Также определи оптимальное расписание для привычек.
            
            Верни ответ в JSON формате:
            {
                "chronotype": "тип",
                "description": "описание типа",
                "optimal_sleep": "рекомендуемое время сна",
                "peak_performance": "периоды наивысшей продуктивности",
                "habit_recommendations": [
                    {
                        "time": "время",
                        "activity": "рекомендуемая активность",
                        "reason": "обоснование"
                    }
                ]
            }`;
            
            const response = await this.callOpenAI(prompt, 'analyze');
            const chronotypeData = this.parseChronotypeResponse(response);
            this.saveChronotypeData(chronotypeData);
            this.displayChronotypeResults(chronotypeData);
        } catch (error) {
            console.error('Error analyzing chronotype:', error);
            alert('Не удалось определить хронобиологический тип. Попробуйте позже.');
        }
    }

    parseChronotypeResponse(content) {
        try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('No JSON found');
        } catch (error) {
            console.error('Error parsing chronotype response:', error);
            return {
                chronotype: 'голубь',
                description: 'Стандартный тип с равномерной активностью в течение дня',
                optimal_sleep: '23:00-7:00',
                peak_performance: '9:00-12:00 и 15:00-18:00'
            };
        }
    }

    parseOptimizationResponse(content) {
        try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return parsed.optimized_habits || [];
            }
            throw new Error('No JSON found');
        } catch (error) {
            console.error('Error parsing optimization response:', error);
            return [];
        }
    }

    saveChronotypeData(data) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            alert('Сначала войдите в систему');
            return;
        }

        this.userChronotype = data.chronotype;
        this.userSleepSchedule = data.optimal_sleep;

        const userData = JSON.parse(localStorage.getItem('user_' + currentUser.email) || '{}');
        userData.chronotype = data.chronotype;
        userData.sleepSchedule = data.optimal_sleep;
        userData.chronotypeData = data;
        userData.chronotypeAnalyzedAt = new Date().toISOString();
        
        localStorage.setItem('user_' + currentUser.email, JSON.stringify(userData));
        
        alert(`Ваш хронобиологический тип: ${data.chronotype}\n\nДанные сохранены для персонализации привычек.`);
    }

    displayChronotypeResults(data) {
        const resultsDiv = document.getElementById('chronotypeResults');
        if (!resultsDiv) {
            // Создаем элемент для отображения результатов
            const container = document.querySelector('.ai-content');
            const resultsElement = document.createElement('div');
            resultsElement.className = 'chronotype-results';
            resultsElement.id = 'chronotypeResults';
            resultsElement.innerHTML = `
                <h3>Результаты анализа хронобиологии</h3>
                <div class="chronotype-card">
                    <h4>Ваш тип: ${data.chronotype}</h4>
                    <p>${data.description}</p>
                    <div class="chronotype-details">
                        <p><strong>Оптимальное время сна:</strong> ${data.optimal_sleep}</p>
                        <p><strong>Пики продуктивности:</strong> ${data.peak_performance}</p>
                    </div>
                    ${data.habit_recommendations ? `
                    <div class="recommendations">
                        <strong>Рекомендации по времени привычек:</strong>
                        <ul>
                            ${data.habit_recommendations.map(rec => 
                                `<li><strong>${rec.time}:</strong> ${rec.activity} (${rec.reason})</li>`
                            ).join('')}
                        </ul>
                    </div>
                    ` : ''}
                </div>
            `;
            container.insertBefore(resultsElement, document.querySelector('.ai-chat'));
        }
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

            // Улучшаем промпт с учетом хронобиологии при вопросах о времени
            let enhancedMessage = message;
            if (this.containsTimeRelatedKeywords(message) && this.userChronotype) {
                enhancedMessage = `Пользователь с хронобиологическим типом "${this.userChronotype}" спрашивает: ${message}. Учти это в ответе.`;
            }

            const response = await this.callOpenAI(enhancedMessage, 'chat');
            
            // Доработка ответов на основе контекста
            const improvedResponse = await this.improveResponse(message, response);
            
            this.addMessageToChat('ai', improvedResponse);
        } catch (error) {
            console.error('Error in chat:', error);
            const demoResponse = this.getDemoResponse(message);
            this.addMessageToChat('ai', demoResponse);
        } finally {
            this.showChatLoading(false);
        }
    }

    containsTimeRelatedKeywords(message) {
        const keywords = ['время', 'когда', 'утро', 'день', 'вечер', 'ночь', 'расписание', 'график', 'биоритм', 'хроно'];
        const lowerMessage = message.toLowerCase();
        return keywords.some(keyword => lowerMessage.includes(keyword));
    }

    async improveResponse(userQuestion, aiResponse) {
        // Если ответ короткий или общий, улучшаем его
        if (aiResponse.length < 100 || this.isGenericResponse(aiResponse)) {
            try {
                const improvementPrompt = `Пользователь спросил: "${userQuestion}"
ИИ ответил: "${aiResponse}"
                
Улучши этот ответ, сделав его более:
1. Персонализированным (учти возможные цели пользователя)
2. Практичным (добавь конкретные шаги)
3. Научно обоснованным (при необходимости)
4. Мотивирующим

Улучшенный ответ:`;
                
                const improved = await this.callOpenAI(improvementPrompt, 'improve');
                return improved || aiResponse;
            } catch (error) {
                console.error('Error improving response:', error);
                return aiResponse;
            }
        }
        return aiResponse;
    }

    isGenericResponse(response) {
        const genericPhrases = [
            'я не уверен',
            'не могу сказать',
            'зависит от ситуации',
            'это индивидуально',
            'попробуйте',
            'рекомендую'
        ];
        return genericPhrases.some(phrase => response.toLowerCase().includes(phrase));
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
            <div class="chrono-recommendation">
                <strong>⏰ Оптимальное время:</strong> ${habit.optimal_time}
                <div class="scientific-basis">${habit.scientific_basis}</div>
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