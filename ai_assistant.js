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
        this.createChronotypeForm();

        // Отладка: проверяем API ключ
        console.log('API Key loaded:', this.apiKey ? 'Yes' : 'No');
        console.log('Chronotype:', this.userChronotype);
    }

    loadAPIKey() {
        this.apiKey = localStorage.getItem('openai_api_key') || '';
    }

    loadUserChronotype() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            const userData = JSON.parse(localStorage.getItem('user_' + currentUser.email) || '{}');
            this.userChronotype = userData.chronotype || null;
            this.userSleepSchedule = userData.sleepSchedule || null;
        }
    }

    createChronotypeForm() {
        // Проверяем, есть ли уже форма
        if (document.getElementById('chronotypeForm')) return;

        const preferencesForm = document.querySelector('.preferences-form');
        if (!preferencesForm) return;

        const chronotypeHTML = `
            <div class="chrono-form-section">
                <h3>⏰ Хронобиологический профиль</h3>
                <p class="help-text">Определите ваш тип для оптимального подбора времени привычек</p>
                
                <div class="chrono-form" id="chronotypeForm">
                    <div class="form-group">
                        <label for="wakeupTime">Во сколько вы обычно просыпаетесь?</label>
                        <select id="wakeupTime" class="time-select">
                            <option value="">Выберите время</option>
                            <option value="4:00">4:00</option>
                            <option value="5:00">5:00</option>
                            <option value="6:00">6:00</option>
                            <option value="7:00">7:00</option>
                            <option value="8:00">8:00</option>
                            <option value="9:00">9:00</option>
                            <option value="10:00">10:00</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="sleepTime">Во сколько вы обычно ложитесь спать?</label>
                        <select id="sleepTime" class="time-select">
                            <option value="">Выберите время</option>
                            <option value="20:00">20:00</option>
                            <option value="21:00">21:00</option>
                            <option value="22:00">22:00</option>
                            <option value="23:00">23:00</option>
                            <option value="0:00">0:00</option>
                            <option value="1:00">1:00</option>
                            <option value="2:00">2:00</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Когда у вас пик энергии?</label>
                        <div class="time-periods">
                            <label class="time-checkbox">
                                <input type="checkbox" name="energyPeak" value="утро"> Утро (6-9)
                            </label>
                            <label class="time-checkbox">
                                <input type="checkbox" name="energyPeak" value="день"> День (10-14)
                            </label>
                            <label class="time-checkbox">
                                <input type="checkbox" name="energyPeak" value="вечер"> Вечер (15-20)
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="chronotypeGuess">Как вы себя считаете?</label>
                        <select id="chronotypeGuess">
                            <option value="">Не знаю</option>
                            <option value="жаворонок">😴 Жаворонок</option>
                            <option value="голубь">🕊️ Голубь</option>
                            <option value="сова">🦉 Сова</option>
                        </select>
                    </div>
                    
                    <div class="chronotype-buttons">
                        <button type="button" class="btn-secondary" id="saveManualChronotypeBtn">
                            💾 Сохранить профиль
                        </button>
                        <button type="button" class="analyze-chronotype-btn" id="analyzeChronotypeBtn">
                            🔬 Автоматический анализ
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Вставляем после формы предпочтений
        preferencesForm.insertAdjacentHTML('afterend', chronotypeHTML);

        // Назначаем обработчики событий
        this.setupChronotypeListeners();
    }

    setupChronotypeListeners() {
        const saveManualBtn = document.getElementById('saveManualChronotypeBtn');
        const analyzeBtn = document.getElementById('analyzeChronotypeBtn');

        if (saveManualBtn) {
            saveManualBtn.addEventListener('click', () => this.saveManualChronotype());
        }

        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => this.analyzeChronotype());
        }
    }

    saveManualChronotype() {
        const wakeup = document.getElementById('wakeupTime').value;
        const sleep = document.getElementById('sleepTime').value;
        const energyCheckboxes = document.querySelectorAll('input[name="energyPeak"]:checked');
        const energyPeaks = Array.from(energyCheckboxes).map(cb => cb.value);
        const guess = document.getElementById('chronotypeGuess').value;

        if (!wakeup || !sleep) {
            alert('Пожалуйста, укажите время пробуждения и сна');
            return;
        }

        const chronotypeData = {
            chronotype: guess || this.calculateSimpleChronotype(wakeup, sleep),
            optimal_wakeup: wakeup,
            optimal_sleep: sleep,
            productivity_peaks: energyPeaks.length > 0 ? energyPeaks : ['день'],
            description: 'Определено на основе ручного ввода',
            confidence: 'средняя'
        };

        this.saveChronotypeData(chronotypeData);
        this.displayChronotypeResults(chronotypeData);
    }

    calculateSimpleChronotype(wakeup, sleep) {
        const wakeupHour = parseInt(wakeup.split(':')[0]);
        const sleepHour = parseInt(sleep.split(':')[0]);
        
        if (sleepHour >= 22) sleepHour -= 24; // Коррекция для ночных часов
        
        if (wakeupHour <= 6 && sleepHour <= 22) return 'жаворонок';
        if (wakeupHour >= 9) return 'сова';
        return 'голубь';
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

    async analyzeChronotype() {
        if (!this.apiKey) {
            this.showAPIKeyModal();
            if (!this.apiKey) return;
        }

        const chronotypeFormHTML = `
            <div class="chronotype-quiz">
                <h3>📊 Хронобиологический тест</h3>
                
                <div class="quiz-question">
                    <p>1. В какое время вы <strong>естественно просыпаетесь</strong> без будильника?</p>
                    <select id="q1" class="time-select">
                        <option value="4-5">4:00-5:00</option>
                        <option value="5-6">5:00-6:00</option>
                        <option value="6-7">6:00-7:00</option>
                        <option value="7-8">7:00-8:00</option>
                        <option value="8-9" selected>8:00-9:00</option>
                        <option value="9-10">9:00-10:00</option>
                        <option value="10+">После 10:00</option>
                    </select>
                </div>
                
                <div class="quiz-question">
                    <p>2. Когда вы чувствуете <strong>максимальную продуктивность</strong>?</p>
                    <select id="q2">
                        <option value="утро">Утро (6:00-10:00)</option>
                        <option value="день" selected>День (10:00-15:00)</option>
                        <option value="вечер">Вечер (15:00-21:00)</option>
                        <option value="ночь">Ночь (после 21:00)</option>
                    </select>
                </div>
                
                <div class="quiz-question">
                    <p>3. Во сколько вы <strong>обычно ложитесь спать</strong>?</p>
                    <select id="q3" class="time-select">
                        <option value="20-21">20:00-21:00</option>
                        <option value="21-22">21:00-22:00</option>
                        <option value="22-23" selected>22:00-23:00</option>
                        <option value="23-0">23:00-00:00</option>
                        <option value="0-1">00:00-01:00</option>
                        <option value="1+">После 1:00</option>
                    </select>
                </div>
                
                <div class="quiz-question">
                    <p>4. Как вы <strong>себя ощущаете</strong> по утрам?</p>
                    <select id="q4">
                        <option value="бодрый">Бодрый и свежий</option>
                        <option value="средне" selected>Нормально</option>
                        <option value="сонный">Сонный и разбитый</option>
                    </select>
                </div>
                
                <div class="quiz-question">
                    <p>5. Когда вам <strong>легче учиться новому</strong>?</p>
                    <select id="q5">
                        <option value="утро">Утром</option>
                        <option value="день" selected>Днем</option>
                        <option value="вечер">Вечером</option>
                    </select>
                </div>
            </div>
        `;

        const modal = document.createElement('div');
        modal.className = 'chronotype-modal';
        modal.innerHTML = `
            <div class="modal-content">
                ${chronotypeFormHTML}
                <div class="modal-buttons">
                    <button id="cancelBtn" class="btn-secondary">Отмена</button>
                    <button id="submitBtn" class="btn-primary">Проанализировать</button>
                </div>
            </div>
        `;

        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;

        const modalContent = modal.querySelector('.modal-content');
        modalContent.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 10px;
            max-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
        `;

        document.body.appendChild(modal);

        return new Promise((resolve) => {
            modal.querySelector('#cancelBtn').addEventListener('click', () => {
                document.body.removeChild(modal);
                resolve(null);
            });

            modal.querySelector('#submitBtn').addEventListener('click', async () => {
                const answers = {
                    q1: modal.querySelector('#q1').value,
                    q2: modal.querySelector('#q2').value,
                    q3: modal.querySelector('#q3').value,
                    q4: modal.querySelector('#q4').value,
                    q5: modal.querySelector('#q5').value
                };

                document.body.removeChild(modal);
                await this.processChronotypeAnswers(answers);
                resolve();
            });
        });
    }

    async processChronotypeAnswers(answers) {
        try {
            const prompt = `Проанализируй ответы на хронобиологический тест и определи тип (жаворонок, сова, голубь):
            
            1. Время естественного пробуждения: ${answers.q1}
            2. Пик продуктивности: ${answers.q2}
            3. Время отхода ко сну: ${answers.q3}
            4. Ощущение по утрам: ${answers.q4}
            5. Лучшее время для обучения: ${answers.q5}
            
            Определи хронобиологический тип и дай рекомендации по расписанию.
            
            Верни ответ в JSON формате:
            {
                "chronotype": "тип",
                "confidence": "высокая/средняя/низкая",
                "description": "описание типа и характеристик",
                "optimal_wakeup": "рекомендуемое время пробуждения",
                "optimal_sleep": "рекомендуемое время сна",
                "productivity_peaks": ["пик 1", "пик 2"],
                "recommendations": [
                    {
                        "time_range": "6:00-9:00",
                        "activities": ["рекомендованные активности"],
                        "reason": "обоснование"
                    }
                ]
            }`;
            
            const response = await this.callOpenAI(prompt, 'analyze');
            const chronotypeData = this.parseChronotypeResponse(response);
            this.saveChronotypeData(chronotypeData);
            this.displayChronotypeResults(chronotypeData);
            
        } catch (error) {
            console.error('Error processing chronotype:', error);
            this.showSimpleChronotypeForm();
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
                confidence: 'средняя',
                description: 'Стандартный тип с равномерной активностью в течение дня',
                optimal_wakeup: '7:00-8:00',
                optimal_sleep: '23:00-24:00',
                productivity_peaks: ['9:00-12:00', '15:00-18:00']
            };
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
        
        alert(`✅ Ваш хронобиологический тип: ${data.chronotype}\n\nДанные сохранены для персонализации привычек.`);
    }

    displayChronotypeResults(data) {
        let resultsDiv = document.getElementById('chronotypeResults');
        
        if (!resultsDiv) {
            resultsDiv = document.createElement('div');
            resultsDiv.id = 'chronotypeResults';
            resultsDiv.className = 'chronotype-results';
            
            const container = document.querySelector('.ai-content');
            const chatSection = document.querySelector('.ai-chat');
            container.insertBefore(resultsDiv, chatSection);
        }

        const recommendationsHTML = data.recommendations ? data.recommendations.map(rec => `
            <div class="schedule-item">
                <div class="schedule-time">${rec.time_range}</div>
                <div class="schedule-activity">${Array.isArray(rec.activities) ? rec.activities.join(', ') : rec.activities}</div>
                <div class="schedule-reason">${rec.reason}</div>
            </div>
        `).join('') : '';

        resultsDiv.innerHTML = `
            <h3>📊 Результаты анализа хронобиологии</h3>
            <div class="chronotype-card">
                <div class="chronotype-header">
                    <h4>Ваш тип: <span class="chronotype-badge">${data.chronotype}</span></h4>
                    <span class="confidence-badge">${data.confidence || 'средняя'} точность</span>
                </div>
                <p class="chronotype-description">${data.description}</p>
                
                <div class="chronotype-details">
                    <div class="detail-item">
                        <span class="detail-label">⏰ Оптимальное пробуждение:</span>
                        <span class="detail-value">${data.optimal_wakeup}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">🌙 Оптимальный сон:</span>
                        <span class="detail-value">${data.optimal_sleep}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">⚡ Пики продуктивности:</span>
                        <span class="detail-value">${Array.isArray(data.productivity_peaks) ? data.productivity_peaks.join(', ') : data.productivity_peaks}</span>
                    </div>
                </div>
                
                ${recommendationsHTML ? `
                <div class="schedule-recommendations">
                    <h5>📅 Рекомендуемое расписание:</h5>
                    <div class="schedule-grid">
                        ${recommendationsHTML}
                    </div>
                </div>
                ` : ''}
            </div>
        `;
    }

    normalizeTimeInput(timeInput) {
        if (!timeInput) return '9:00-18:00';
        
        const timeKeywords = {
            'утро': '6:00-9:00',
            'утром': '6:00-9:00',
            'день': '12:00-15:00',
            'днем': '12:00-15:00',
            'вечер': '18:00-21:00',
            'вечером': '18:00-21:00',
            'ночь': '22:00-4:00',
            'ночью': '22:00-4:00'
        };
        
        const lowerInput = timeInput.toLowerCase().trim();
        
        for (const [keyword, timeRange] of Object.entries(timeKeywords)) {
            if (lowerInput.includes(keyword)) {
                return timeRange;
            }
        }
        
        const timeRegex = /(\d{1,2})[:\.]?(\d{2})?/;
        const match = timeInput.match(timeRegex);
        
        if (match) {
            let hours = parseInt(match[1]);
            const minutes = match[2] ? parseInt(match[2]) : 0;
            
            if (hours < 10) hours = '0' + hours;
            const mins = minutes < 10 ? '0' + minutes : minutes;
            
            return `${hours}:${mins}`;
        }
        
        return '9:00-18:00';
    }

    getOptimalTimeRange() {
        if (!this.userChronotype) return 'Не определено';
        
        const chronotypeRanges = {
            'жаворонок': '6:00-12:00',
            'голубь': '9:00-15:00',
            'сова': '15:00-21:00',
            'дельфин': '10:00-16:00'
        };
        
        return chronotypeRanges[this.userChronotype] || '9:00-18:00';
    }

    async generateHabits() {
    if (!this.apiKey) {
        this.showAPIKeyModal();
        if (!this.apiKey) return;
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
        // Используем улучшенный промпт для генерации
        const prompt = this.buildHabitPrompt(goals, availableTime, experience, preferences);
        console.log('Sending prompt to OpenAI:', prompt);
        
        const response = await this.callOpenAI(prompt, 'generate');
        console.log('OpenAI response:', response);
        
        const habits = this.parseHabitsResponse(response);
        console.log('Parsed habits:', habits);
        
        if (!habits || habits.length === 0) {
            throw new Error('No habits generated');
        }
        
        // Добавляем рекомендации по времени
        const habitsWithTiming = await this.enhanceWithChronobiology(habits);
        this.displayGeneratedHabits(habitsWithTiming);
        
    } catch (error) {
        console.error('Error generating habits:', error);
        // Только в случае реальной ошибки показываем демо
        this.showDemoHabits();
    } finally {
        this.showLoading(false);
    }
}

    buildHabitPrompt(goals, time, experience, preferences) {
    let chronotypeInfo = '';
    if (this.userChronotype) {
        chronotypeInfo = `\nХронобиологический тип: ${this.userChronotype}`;
    }

    return `Ты эксперт по формированию привычек. Создай ПЕРСОНАЛИЗИРОВАННЫЙ план привычек для пользователя.

ВАЖНО: Учитывай ВСЕ параметры пользователя:
1. Цели: "${goals}"
2. Доступное время в день: ${time} минут
3. Уровень опыта: ${experience}
4. Ограничения: ${preferences || 'нет'}
${chronotypeInfo}

ГЕНЕРИРУЙ РЕАЛЬНЫЕ ПРИВЫЧКИ, которые соответствуют:
- Времени пользователя (${time} минут в день распредели на все привычки)
- Целям пользователя ("${goals}")
- Опыту пользователя (${experience})
- Ограничениям ("${preferences}")

Если пользователь говорит "нет времени" - создай короткие привычки по 5-15 минут.

Пример для "прокачать английский, 2+ часа, начинающий":
1. Аудирование: 30 минут в день
2. Чтение: 20 минут в день  
3. Практика разговорной речи: 15 минут в день

Верни ответ ТОЛЬКО в этом JSON формате (не добавляй текста до или после):
{
    "habits": [
        {
            "name": "Название привычки (максимум 5 слов)",
            "description": "Конкретное описание что делать, 1-2 предложения",
            "category": "обучение/здоровье/продуктивность/отдых/развитие",
            "duration": "X минут",
            "frequency": "ежедневно/3 раза в неделю",
            "difficulty": "легкая/средняя/сложная",
            "optimal_time": "рекомендованное время",
            "scientific_basis": "научное обоснование",
            "benefits": ["польза 1", "польза 2", "польза 3"],
            "tips": ["совет 1", "совет 2", "совет 3"]
        }
    ]
}

Создай 3-5 привычек, которые РЕАЛЬНО помогут достичь целей пользователя.`;
}

async callOpenAI(prompt, mode = 'generate') {
    try {
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
                            ? `Ты эксперт по формированию привычек. Твоя задача - создавать РЕАЛЬНЫЕ персонализированные привычки на основе ВСЕХ параметров пользователя. Всегда отвечай ТОЛЬКО в JSON формате без лишнего текста.
                               
                               ПРАВИЛА:
                               1. Учитывай ВСЕ данные пользователя
                               2. Длительность привычек должна соответствовать доступному времени
                               3. Сложность должна соответствовать опыту пользователя
                               4. Привычки должны быть достижимыми и реалистичными
                               5. Если пользователь "начинающий" - делай привычки легкими`
                            : 'Ты полезный ассистент по привычкам.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.8, // Более креативные ответы
                max_tokens: 1500, // Больше токенов для детальных ответов
                response_format: mode === 'generate' ? { type: "json_object" } : undefined
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API error details:', errorText);
            throw new Error(`API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('API response data:', data);
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Invalid API response format');
        }
        
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error in callOpenAI:', error);
        throw error;
    }
}

parseHabitsResponse(content) {
    console.log('Parsing response:', content);
    
    try {
        // Очищаем ответ от возможного лишнего текста
        let cleanedContent = content.trim();
        
        // Ищем JSON в ответе
        const jsonStart = cleanedContent.indexOf('{');
        const jsonEnd = cleanedContent.lastIndexOf('}') + 1;
        
        if (jsonStart === -1 || jsonEnd === 0) {
            throw new Error('No JSON found in response');
        }
        
        const jsonString = cleanedContent.substring(jsonStart, jsonEnd);
        console.log('Extracted JSON:', jsonString);
        
        const parsed = JSON.parse(jsonString);
        
        if (!parsed.habits || !Array.isArray(parsed.habits) || parsed.habits.length === 0) {
            throw new Error('No habits array in response');
        }
        
        // Проверяем и корректируем данные привычек
        const validatedHabits = parsed.habits.map((habit, index) => {
            return {
                name: habit.name || `Привычка ${index + 1}`,
                description: habit.description || 'Описание привычки',
                category: habit.category || 'развитие',
                duration: habit.duration || '10 минут',
                frequency: habit.frequency || 'ежедневно',
                difficulty: habit.difficulty || 'легкая',
                optimal_time: habit.optimal_time || 'утром',
                scientific_basis: habit.scientific_basis || 'Научное обоснование',
                benefits: Array.isArray(habit.benefits) ? habit.benefits : ['Польза для развития'],
                tips: Array.isArray(habit.tips) ? habit.tips : ['Начните с малого']
            };
        });
        
        console.log('Validated habits:', validatedHabits);
        return validatedHabits;
        
    } catch (error) {
        console.error('Error parsing habits:', error, 'Content was:', content);
        
        // Только в случае реального парсинга ошибки возвращаем демо
        // Но с учетом введенных параметров
        return this.generatePersonalizedDemoHabits();
    }
}

generatePersonalizedDemoHabits() {
    // Получаем данные пользователя для персонализации демо
    const goals = document.getElementById('goals').value.toLowerCase();
    const time = document.getElementById('availableTime').value;
    const experience = document.getElementById('experience').value;
    
    let habits = [];
    
    // Персонализируем демо-привычки на основе введенных данных
    if (goals.includes('английск') || goals.includes('english') || goals.includes('язык')) {
        habits = [
            {
                name: "Прослушивание подкастов на английском",
                description: "Слушайте английские подкасты во время commute или домашних дел",
                category: "обучение",
                duration: "30 минут",
                frequency: "ежедневно",
                difficulty: "легкая",
                optimal_time: "утром по дороге на работу/учебу",
                scientific_basis: "Пассивное восприятие улучшает аудирование",
                benefits: ["Улучшение понимания на слух", "Расширение словарного запаса", "Привыкание к акцентам"],
                tips: ["Начните с медленных подкастов", "Используйте субтитры", "Повторяйте услышанные фразы"]
            },
            {
                name: "Чтение статей на английском",
                description: "Читайте интересные статьи или новости на английском",
                category: "обучение",
                duration: "20 минут",
                frequency: "ежедневно",
                difficulty: "средняя",
                optimal_time: "обеденный перерыв",
                scientific_basis: "Чтение активирует визуальную память",
                benefits: ["Улучшение чтения", "Новая лексика", "Понимание грамматики в контексте"],
                tips: ["Читайте о том, что вам интересно", "Выписывайте незнакомые слова", "Не переводите каждое слово"]
            },
            {
                name: "Разговорная практика с приложением",
                description: "Говорите на английском с помощью языковых приложений",
                category: "обучение",
                duration: "15 минут",
                frequency: "ежедневно",
                difficulty: "легкая",
                optimal_time: "вечером",
                scientific_basis: "Говорение активирует речевой аппарат",
                benefits: ["Преодоление языкового барьера", "Улучшение произношения", "Автоматизация речевых конструкций"],
                tips: ["Начните с простых фраз", "Записывайте себя", "Не бойтесь ошибок"]
            }
        ];
    } else if (goals.includes('спорт') || goals.includes('фитнес') || goals.includes('тренировк')) {
        habits = [
            {
                name: "Утренняя зарядка",
                description: "Комплекс упражнений для разминки и тонуса мышц",
                category: "здоровье",
                duration: "15 минут",
                frequency: "ежедневно",
                difficulty: "легкая",
                optimal_time: "7:00-8:00",
                scientific_basis: "Утренние тренировки ускоряют метаболизм",
                benefits: ["Повышение энергии", "Улучшение настроения", "Укрепление мышц"],
                tips: ["Начинайте с растяжки", "Слушайте свое тело", "Постепенно увеличивайте нагрузку"]
            }
        ];
    } else {
        // Общие привычки на основе доступного времени
        const totalTime = parseInt(time) || 30;
        habits = [
            {
                name: "Короткая медитация",
                description: "5-минутная практика осознанности и дыхания",
                category: "здоровье",
                duration: "5 минут",
                frequency: "ежедневно",
                difficulty: "легкая",
                optimal_time: "утром после пробуждения",
                scientific_basis: "Медитация снижает стресс и улучшает концентрацию",
                benefits: ["Снижение стресса", "Улучшение фокуса", "Эмоциональный баланс"],
                tips: ["Найдите тихое место", "Сфокусируйтесь на дыхании", "Не оценивайте свои мысли"]
            },
            {
                name: "Чтение для развития",
                description: "Чтение полезной литературы или статей",
                category: "развитие",
                duration: `${Math.min(15, Math.floor(totalTime/2))} минут`,
                frequency: "ежедневно",
                difficulty: experience === 'beginner' ? "легкая" : "средняя",
                optimal_time: "вечером перед сном",
                scientific_basis: "Вечернее чтение расслабляет и развивает",
                benefits: ["Расширение кругозора", "Улучшение памяти", "Развитие критического мышления"],
                tips: ["Выбирайте интересные темы", "Делайте заметки", "Обсуждайте прочитанное"]
            }
        ];
    }
    
    return habits;
}

showDemoHabits() {
    console.log('Showing demo habits as fallback');
    const demoHabits = this.generatePersonalizedDemoHabits();
    this.displayGeneratedHabits(demoHabits);
    
    // Показываем сообщение, что это демо
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) {
        const demoNotice = document.createElement('div');
        demoNotice.className = 'demo-notice';
        demoNotice.innerHTML = `
            <div class="demo-notice-content">
                <strong>⚠️ Демо-режим</strong>
                <p>Для получения персонализированных привычек на основе ИИ введите OpenAI API ключ.</p>
                <p>Сейчас показаны примеры на основе ваших данных.</p>
            </div>
        `;
        resultsSection.insertBefore(demoNotice, resultsSection.firstChild);
    }
}

    async enhanceWithChronobiology(habits) {
        if (!this.userChronotype) {
            return habits.map(habit => ({
                ...habit,
                optimal_time: this.getDefaultOptimalTime(habit.category),
                scientific_basis: habit.scientific_basis || 'Общие рекомендации на основе типа привычки'
            }));
        }

        try {
            const prompt = `На основе хронобиологического типа "${this.userChronotype}" оптимизируй время выполнения привычек:
            
            Привычки для оптимизации: ${JSON.stringify(habits.map(h => ({name: h.name, category: h.category, duration: h.duration})))}
            
            Учти что пользователь ${this.userChronotype}. Дай научно обоснованные рекомендации по времени.
            
            Верни JSON в формате:
            {
                "optimized_habits": [
                    {
                        "name": "название привычки",
                        "optimal_time": "рекомендованное время (например, 7:00-8:00)",
                        "scientific_basis": "научное обоснование почему это время оптимально"
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
                    scientific_basis: optimized?.scientific_basis || habit.scientific_basis || 'Рекомендация на основе хронобиологического профиля'
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

    getDefaultOptimalTime(category) {
        const timeMap = {
            'здоровье': '6:00-8:00 или 17:00-19:00',
            'продуктивность': '9:00-11:00 или 15:00-17:00',
            'обучение': '10:00-12:00 или 19:00-21:00',
            'отдых': '13:00-15:00 или 20:00-22:00'
        };
        return timeMap[category] || '9:00-18:00';
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

            let enhancedMessage = message;
            if (this.containsTimeRelatedKeywords(message) && this.userChronotype) {
                enhancedMessage = `Пользователь с хронобиологическим типом "${this.userChronotype}" (оптимальное время активности: ${this.getOptimalTimeRange()}) спрашивает: ${message}. Учти хронобиологические особенности в ответе и дай персонализированные рекомендации.`;
            }

            const response = await this.callOpenAI(enhancedMessage, 'chat');
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
        const keywords = ['время', 'когда', 'утро', 'день', 'вечер', 'ночь', 'расписание', 'график', 'биоритм', 'хроно', 'режим', 'распорядок'];
        const lowerMessage = message.toLowerCase();
        return keywords.some(keyword => lowerMessage.includes(keyword));
    }

    async improveResponse(userQuestion, aiResponse) {
        if (aiResponse.length < 100 || this.isGenericResponse(aiResponse)) {
            try {
                const improvementPrompt = `Пользователь спросил: "${userQuestion}"
ИИ ответил: "${aiResponse}"
                
Улучши этот ответ:
1. Сделай более персонализированным (учти возможные цели пользователя)
2. Добавь практические шаги
3. Приведи научное обоснование если уместно
4. Сделай мотивирующим

Улучшенный ответ (на русском):`;
                
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
            'это индивидуально'
        ];
        return genericPhrases.some(phrase => response.toLowerCase().includes(phrase));
    }

    getDemoResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('привет')) {
            return 'Привет! Я ваш ИИ-помощник по привычкам. Определите ваш хронобиологический тип для получения персонализированных рекомендаций.';
        }
        
        if (lowerMessage.includes('привычк')) {
            return 'Начинайте с маленьких привычек (2-5 минут). Регулярность важнее длительности!';
        }
        
        if (lowerMessage.includes('мотивац')) {
            return 'Мотивация следует за действием. Начните с малого и отслеживайте прогресс.';
        }
        
        if (lowerMessage.includes('врем') || lowerMessage.includes('когда')) {
            return 'Определите ваш хронобиологический тип для получения рекомендаций по оптимальному времени привычек.';
        }
        
        if (lowerMessage.includes('хрон') || lowerMessage.includes('биоритм')) {
            return 'Хронобиология изучает оптимальное время для различных активностей. Определите ваш тип для персонализации.';
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
                            ? 'Ты эксперт по формированию привычек и хронобиологии. Всегда отвечай в строгом JSON формате когда требуется.'
                            : mode === 'analyze'
                            ? 'Ты эксперт по хронобиологии. Анализируй ответы и предоставляй рекомендации в JSON формате.'
                            : 'Ты полезный ассистент по привычкам и хронобиологии. Отвечай подробно и научно обоснованно.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: mode === 'generate' ? 0.7 : 0.8,
                max_tokens: mode === 'generate' ? 1000 : 800
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
                name: "Утренняя растяжка 5 минут",
                description: "Легкие упражнения на растяжку для пробуждения тела",
                category: "здоровье",
                duration: "5 минут",
                frequency: "ежедневно",
                difficulty: "легкая",
                optimal_time: "7:00-8:00",
                scientific_basis: "Утренняя растяжка улучшает кровообращение и гибкость",
                benefits: ["Улучшение осанки", "Повышение энергии", "Снятие напряжения"],
                tips: ["Делайте после пробуждения", "Дышите глубоко", "Не торопитесь"]
            },
            {
                name: "Вечерний дневник 10 минут",
                description: "Запись мыслей и рефлексия за день",
                category: "отдых",
                duration: "10 минут",
                frequency: "ежедневно",
                difficulty: "легкая",
                optimal_time: "21:00-22:00",
                scientific_basis: "Вечерняя рефлексия улучшает сон и снижает стресс",
                benefits: ["Снижение стресса", "Улучшение самопонимания", "Лучший сон"],
                tips: ["Записывайте 3 хорошие вещи за день", "Не редактируйте мысли", "Будьте честны"]
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
                <strong>Практические советы:</strong>
                <ul>
                    ${habit.tips.map(tip => `<li>${tip}</li>`).join('')}
                </ul>
            </div>
            <button class="btn-small add-to-tracker-btn" onclick="aiAssistant.addToTracker(${index})">
                ➕ Добавить в трекер
            </button>
        `;
        return div;
    }

    addToTracker(habitIndex) {
        const habit = this.generatedHabits[habitIndex];
        this.saveHabitToTracker(habit);
        
        // Показываем уведомление
        const notification = document.createElement('div');
        notification.className = 'habit-notification';
        notification.innerHTML = `
            ✅ Привычка "${habit.name}" добавлена в трекер!
            <br><small>Оптимальное время: ${habit.optimal_time}</small>
        `;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px;
            border-radius: 5px;
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }

    addAllToTracker() {
        if (!this.generatedHabits || this.generatedHabits.length === 0) {
            alert('Нет привычек для добавления');
            return;
        }

        this.generatedHabits.forEach(habit => {
            this.saveHabitToTracker(habit);
        });

        alert(`✅ Все ${this.generatedHabits.length} привычек добавлены в трекер!`);
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
            category: habit.category,
            optimal_time: habit.optimal_time,
            duration: habit.duration,
            added_from_ai: true,
            added_at: new Date().toISOString()
        };

        userHabits.push(newHabit);
        localStorage.setItem('habits_' + currentUser.email, JSON.stringify(userHabits));

        // Сохраняем для статистики ИИ
        const aiHabits = JSON.parse(localStorage.getItem('ai_generated_habits') || '[]');
        aiHabits.push({
            ...habit,
            addedAt: new Date().toISOString(),
            userId: currentUser.email,
            chronotype: this.userChronotype
        });
        localStorage.setItem('ai_generated_habits', JSON.stringify(aiHabits));
    }

    addMessageToChat(sender, message) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        messageDiv.innerHTML = `
            <div class="message-sender">${sender === 'user' ? 'Вы' : 'ИИ-помощник'}</div>
            <div class="message-content">${this.formatMessage(message)}</div>
            ${sender === 'ai' ? `<div class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>` : ''}
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    formatMessage(message) {
        // Форматируем сообщение с сохранением переносов и добавлением стилей
        return message
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }

    showLoading(show) {
        const btnText = document.getElementById('btnText');
        const spinner = document.getElementById('spinner');
        const generateBtn = document.getElementById('generateBtn');

        if (btnText && spinner && generateBtn) {
            if (show) {
                btnText.textContent = 'Анализ хронобиологии и генерация...';
                spinner.classList.remove('hidden');
                generateBtn.disabled = true;
            } else {
                btnText.textContent = 'Сгенерировать персонализированные привычки';
                spinner.classList.add('hidden');
                generateBtn.disabled = false;
            }
        }
    }

    showChatLoading(show) {
        const sendBtn = document.getElementById('sendMessageBtn');
        if (sendBtn) {
            sendBtn.disabled = show;
            sendBtn.innerHTML = show ? '<div class="chat-spinner"></div>' : 'Отправить';
        }
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    window.aiAssistant = new AIAssistant();
});