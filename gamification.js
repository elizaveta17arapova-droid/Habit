// gamification.js

const Gamification = (() => {
    const STORAGE_KEY = 'habit_gamification_v1';
    const POINTS_PER_COMPLETION = 10;
    const POINTS_PER_LEVEL = 100;

    // Генератор коротких звуков прямо в браузере
function beep(freq = 440, duration = 200, type = 'sine') {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = freq;
  osc.type = type;
  osc.start();
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration / 1000);
  osc.stop(ctx.currentTime + duration / 1000);
}

// ---- 🎵 Звуки ----
const sounds = {
  complete: () => beep(440, 200, 'square'),
  badge: () => beep(660, 300, 'triangle'),
  levelup: () => beep(880, 500, 'sawtooth')
};



    const BADGES = [
        { id: 'first_day', title: 'Первый шаг', desc: 'Выполнил привычку 1 день', condition: s => s.totalCompletions >= 1 },
        { id: 'week', title: '7 дней подряд', desc: 'Стрик 7 дней', condition: s => s.currentStreak >= 7 },
        { id: 'month', title: 'Месячный подвиг', desc: 'Стрик 30 дней', condition: s => s.currentStreak >= 30 },
        { id: 'master', title: 'Мастер привычек', desc: '100 выполнений', condition: s => s.totalCompletions >= 100 }
    ];

    function load() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { byHabit: {}, global: { points: 0, badges: {} } };
        } catch {
            return { byHabit: {}, global: { points: 0, badges: {} } };
        }
    }

    function save(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    function today() {
        return new Date().toISOString().slice(0, 10);
    }

    function dateMinusDays(iso, n) {
        const d = new Date(iso);
        d.setDate(d.getDate() - n);
        return d.toISOString().slice(0, 10);
    }

    function computeStreak(completions) {
        let streak = 0;
        while (completions[dateMinusDays(today(), streak)]) {
            streak++;
        }
        return streak;
    }

    function notify(text) {
        const el = document.createElement('div');
        el.textContent = text;
        el.className = 'gami-toast';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 3000);
    }

    function play(sound) {
        if (sound && sound.play) sound.play().catch(() => { });
    }

    return {
        recordCompletion(habitId) {
            const data = load();
            const h = data.byHabit[habitId] || { completions: {}, totalCompletions: 0, currentStreak: 0, badges: {} };

            const day = today();
            if (h.completions[day]) {
                notify('Сегодня уже выполнено!');
                return;
            }

            // обновляем
            h.completions[day] = true;
            h.totalCompletions++;
            h.currentStreak = computeStreak(h.completions);
            data.byHabit[habitId] = h;

            // очки
            const oldPoints = data.global.points;
            data.global.points += POINTS_PER_COMPLETION;

            // уровень
            const oldLevel = Math.floor(oldPoints / POINTS_PER_LEVEL);
            const newLevel = Math.floor(data.global.points / POINTS_PER_LEVEL);
            if (newLevel > oldLevel) {
                notify('🎉 Новый уровень!');
                sounds.complete();
;
            } else {
                sounds.complete();
;
            }

            // бейджи
            BADGES.forEach(b => {
                if (!h.badges[b.id] && b.condition(h)) {
                    h.badges[b.id] = true;
                    notify('🏅 Новый бейдж: ' + b.title);
                    sounds.complete();
;
                }
            });

            save(data);
        },

        getInfo() {
            const data = load();
            const points = data.global.points;
            const level = Math.floor(points / POINTS_PER_LEVEL) + 1;
            const next = (level * POINTS_PER_LEVEL) - points;
            return { points, level, next };
        }
    };
})();
// Добавьте бонусные очки за использование ИИ-помощника
function awardAIUsagePoints() {
    const points = getCurrentPoints();
    const newPoints = points + 25; // 25 очков за использование ИИ
    updatePoints(newPoints);
    showNotification('+25 очков за использование ИИ помощника!', 'success');
}