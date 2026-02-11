document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const mainContainer = document.querySelector('.container');
    const alertMessageDiv = document.getElementById('alertMessage');
    const listTitle = document.getElementById('listTitle');
    const fullVocabularyList = document.getElementById('fullVocabularyList');
    const flashcard = document.getElementById('flashcard');
    const wordTypeSpan = document.querySelector('.word-type');
    const wordH2 = document.querySelector('.word');
    const backFaceP = document.querySelector('#back p');
    const cardCounter = document.getElementById('cardCounter');
    const progressBar = document.getElementById('progressBar');

    const modeButtons = {
        flashcard: document.getElementById('flashcardModeBtn'),
        reverse: document.getElementById('reverseModeBtn'),
        quiz: document.getElementById('quizModeBtn'),
        hangman: document.getElementById('hangmanModeBtn'),
        scramble: document.getElementById('scrambleModeBtn'),
        dictation: document.getElementById('dictationModeBtn'),
        match: document.getElementById('matchModeBtn'),
    };

    const gameContainers = {
        flashcard: document.getElementById('flashcardGameContainer'),
        reverse: document.getElementById('flashcardGameContainer'), // Reuses the same container
        quiz: document.getElementById('quizGameContainer'),
        hangman: document.getElementById('hangmanGameContainer'),
        scramble: document.getElementById('scrambleGameContainer'),
        dictation: document.getElementById('dictationGameContainer'),
        match: document.getElementById('matchGameContainer'),
    };

    const nativeChapterSelect = document.getElementById('chapterSelect');
    const nativeSubcategorySelect = document.getElementById('subcategorySelect');

    // Search / Filters UI
    const searchInput = document.getElementById('searchInput');
    const filterMasteredChk = document.getElementById('filterMastered');
    const filterUnmasteredChk = document.getElementById('filterUnmastered');
    const playWordBtn = document.getElementById('playWordBtn');
    const liveStatus = document.getElementById('liveStatus');

    const chapterSelectWrapper = document.getElementById('chapterSelectWrapper');
    const customChapterTrigger = chapterSelectWrapper.querySelector('.custom-select-trigger');
    const customChapterOptionsContainer = chapterSelectWrapper.querySelector('.custom-options');

    const subcategorySelectWrapper = document.getElementById('subcategorySelectWrapper');
    const customSubcategoryTrigger = subcategorySelectWrapper.querySelector('.custom-select-trigger');
    const customSubcategoryOptionsContainer = subcategorySelectWrapper.querySelector('.custom-options');

    const prevCardBtn = document.getElementById('prevCardBtn');
    const nextCardBtn = document.getElementById('nextCardBtn');
    const knewItBtn = document.getElementById('knewItBtn');
    const didntKnowBtn = document.getElementById('didntKnowBtn');
    const masteredBtn = document.getElementById('masteredBtn');
    const masteredVocabularyList = document.getElementById('masteredVocabularyList');
    const resetMasteredBtn = document.getElementById('resetMasteredBtn');

    const quizQuestion = document.getElementById('quizQuestion');
    const quizOptions = document.getElementById('quizOptions');
    const quizScore = document.getElementById('quizScore');

    const hangmanWordDiv = document.getElementById('hangmanWord');
    const hangmanLettersDiv = document.getElementById('hangmanLetters');
    const hangmanParts = Array.from(document.querySelectorAll('.hangman-svg-part'));

    const scrambleWordDiv = document.getElementById('scrambleWord');
    const scrambleClueDiv = document.getElementById('scrambleClue');
    const scrambleInput = document.getElementById('scrambleInput');
    const scrambleCheckBtn = document.getElementById('scrambleCheckBtn');
    const scrambleFeedbackDiv = document.getElementById('scrambleFeedback');
    const scrambleNextBtn = document.getElementById('scrambleNextBtn');

    const dictationClueDiv = document.getElementById('dictationClue');
    const dictationInput = document.getElementById('dictationInput');
    const dictationCheckBtn = document.getElementById('dictationCheckBtn');
    const dictationFeedbackDiv = document.getElementById('dictationFeedback');
    const dictationNextBtn = document.getElementById('dictationNextBtn');

    const matchScoreSpan = document.getElementById('matchScore');
    const wordsColumn = document.getElementById('wordsColumn');
    const definitionsColumn = document.getElementById('definitionsColumn');
    const matchNextBtn = document.getElementById('matchNextBtn');

    // --- State ---
    let vocab = [];
    let currentMode = 'flashcard';
    let shuffledVocab = [];
    let currentCardIndex = 0;
    let masteredWords = new Set(JSON.parse(localStorage.getItem('masteredWords')) || []);
    let markedWords = new Set();
    let quizQuestions = [];
    let currentQuizQuestionIndex = 0;
    let score = { correct: 0, total: 0 };
    let hangmanCorrectAnswer = '';
    let guessedLetters = new Set();
    let errors = 0;
    let currentWord = '';
    const MATCH_COUNT = 6;
    let matchPairs = [];
    let selected = {word: null, def: null};

    // --- SRS (simplified SM-2) ---
    const SRS_KEY = 'srsData_v1';
    let srsData = JSON.parse(localStorage.getItem(SRS_KEY) || '{}');

    function saveSRS() {
        localStorage.setItem(SRS_KEY, JSON.stringify(srsData));
    }

    function nowDays() { return Math.floor(Date.now() / (1000 * 60 * 60 * 24)); }

    function scheduleSM2(id, quality) {
        if (!srsData[id]) srsData[id] = {ef: 2.5, interval: 0, repetitions: 0, next: nowDays()};
        const item = srsData[id];
        if (quality < 3) {
            item.repetitions = 0;
            item.interval = 1;
        } else {
            if (item.repetitions === 0) item.interval = 1;
            else if (item.repetitions === 1) item.interval = 6;
            else item.interval = Math.round((item.interval || 1) * item.ef);
            item.repetitions = (item.repetitions || 0) + 1;
        }
        item.ef = Math.max(1.3, item.ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
        item.next = nowDays() + (item.interval || 1);
        item.last = Date.now();
        saveSRS();
    }

    function getIdForWord(wordText) {
        const chapter = currentChapterKey || '_global';
        return `${chapter}::${wordText}`;
    }

    function updateSRSForCurrent(result) {
        try {
            const wordText = wordH2?.textContent?.trim();
            if (!wordText) return;
            const id = getIdForWord(wordText);
            if (result === 'mastered') {
                scheduleSM2(id, 5);
                masteredWords.add(wordText);
                localStorage.setItem('masteredWords', JSON.stringify(Array.from(masteredWords)));
            } else if (result === 'known') {
                scheduleSM2(id, 5);
            } else if (result === 'didntKnow') {
                scheduleSM2(id, 2);
            }
            updateStatsUI();
        } catch (e) { console.warn(e); }
    }

    function pickNextCardSRS() {
        const today = nowDays();
        const candidates = shuffledVocab.length ? shuffledVocab.slice() : vocab.slice();
        const due = candidates.filter(it => {
            const label = Array.isArray(it) ? it[0] : it.word;
            const id = getIdForWord(label);
            if (!srsData[id]) return true;
            return (srsData[id].next || 0) <= today;
        });
        if (due.length) return due[Math.floor(Math.random() * due.length)];
        if (candidates.length) return candidates[Math.floor(Math.random() * candidates.length)];
        return null;
    }

    // --- Adaptive Session ---
    const adaptiveSessionBtn = document.getElementById('adaptiveSessionBtn');
    const adaptiveEndBtn = document.getElementById('adaptiveEndBtn');
    const adaptiveDueCountSpan = document.getElementById('adaptiveDueCount');
    let adaptiveQueue = [];
    let adaptiveActive = false;

    function countDueItems() {
        const today = nowDays();
        let count = 0;
        Object.keys(ALL_VOCAB_DATA).forEach(ch => {
            const chapter = ALL_VOCAB_DATA[ch];
            Object.keys(chapter.subcategories || {}).forEach(sub => {
                const list = chapter.subcategories[sub].data || [];
                list.forEach(row => {
                    const w = String(row[0] || '');
                    if (masteredWords.has(w)) return; // skip mastered
                    const id = getIdForWord(w);
                    if (!srsData[id] || (srsData[id].next || 0) <= today) count++;
                });
            });
        });
        return count;
    }

    function buildAdaptiveQueue() {
        const today = nowDays();
        const queue = [];
        Object.keys(ALL_VOCAB_DATA).forEach(ch => {
            const chapter = ALL_VOCAB_DATA[ch];
            Object.keys(chapter.subcategories || {}).forEach(sub => {
                const list = chapter.subcategories[sub].data || [];
                list.forEach(row => {
                    const w = String(row[0] || '');
                    if (masteredWords.has(w)) return;
                    const id = getIdForWord(w);
                    const item = srsData[id] || null;
                    if (!item || (item.next || 0) <= today) {
                        queue.push({ row, srs: item });
                    }
                });
            });
        });
        // sort based on selected mode
        const mode = adaptiveSortSelect?.value || 'due';
        if (mode === 'due') {
            queue.sort((a,b) => ( (a.srs?.next||0) - (b.srs?.next||0) ));
        } else if (mode === 'ef') {
            queue.sort((a,b) => ( (a.srs?.ef||2.5) - (b.srs?.ef||2.5) ));
        } else if (mode === 'random') {
            return shuffleArray(queue).map(x => x.row);
        }
        return queue.map(x => x.row);
    }

    function startAdaptiveSession() {
        adaptiveQueue = buildAdaptiveQueue();
        if (!adaptiveQueue.length) {
            displayAlert('Aucun mot dû pour aujourd\'hui — bonne révision !', 'var(--correct-color)');
            setTimeout(hideAlert, 1600);
            return;
        }
        adaptiveActive = true;
        shuffledVocab = adaptiveQueue.slice();
        currentCardIndex = 0;
        adaptiveSessionBtn.style.display = 'none';
        adaptiveEndBtn.style.display = 'inline-flex';
        updateAdaptiveUI();
        showGameContainer('flashcard');
        displayCard();
    }

    function endAdaptiveSession() {
        adaptiveActive = false;
        adaptiveQueue = [];
        adaptiveSessionBtn.style.display = 'inline-flex';
        adaptiveEndBtn.style.display = 'none';
        displayAlert('Session terminée.', 'var(--primary-glow)');
        setTimeout(hideAlert, 1200);
        // restore normal flashcard set for current chapter
        startGame('flashcard');
    }

    function updateAdaptiveUI() {
        try { adaptiveDueCountSpan.textContent = `${shuffledVocab.length} mots dans la session`; } catch(e){}
    }

    adaptiveSessionBtn?.addEventListener('click', () => startAdaptiveSession());
    adaptiveEndBtn?.addEventListener('click', () => endAdaptiveSession());

    // refresh due count on load and when SRS changes
    function refreshAdaptiveCount() {
        try { adaptiveDueCountSpan.textContent = `${countDueItems()} mots dus`; } catch(e){}
    }
    refreshAdaptiveCount();

    // --- Adaptive queue rendering and controls ---
    const adaptiveQueueList = document.getElementById('adaptiveQueueList');
    const adaptiveSkipBtn = document.getElementById('adaptiveSkipBtn');
    const adaptiveRebuildBtn = document.getElementById('adaptiveRebuildBtn');

    function renderAdaptiveQueue() {
        if (!adaptiveQueueList) return;
        adaptiveQueueList.innerHTML = '';
        if (!adaptiveQueue || !adaptiveQueue.length) {
            adaptiveQueueList.innerHTML = '<li>Aucune entrée</li>'; return;
        }
        adaptiveQueue.forEach((row, idx) => {
            const li = document.createElement('li');
            li.className = 'adaptive-item';
            const w = row[0];
            const title = document.createElement('div');
            title.textContent = w;
            const meta = document.createElement('div'); meta.className = 'meta';
            // srs info
            const id = getIdForWord(w);
            const s = srsData[id] || { ef: 2.5, interval: 0, next: null };
            const nextDisplay = (s.next && typeof s.next === 'number') ? formatNextDay(s.next) : 'Jamais';
            meta.textContent = `${nextDisplay} · interval ${s.interval||0}j · EF ${Number((s.ef||2.5).toFixed(2))}`;
            li.appendChild(title);
            li.appendChild(meta);
            li.tabIndex = 0;
            const goBtn = document.createElement('button'); goBtn.textContent = 'Aller'; goBtn.className='icon-btn';
            goBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                // make this entry the current shuffled list
                shuffledVocab = adaptiveQueue.slice();
                currentCardIndex = idx;
                displayCard();
                showGameContainer('flashcard');
            });
            const skipBtn = document.createElement('button'); skipBtn.textContent='Ignorer'; skipBtn.className='icon-btn';
            skipBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                adaptiveQueue.splice(idx,1);
                shuffledVocab = adaptiveQueue.slice();
                if (currentCardIndex >= shuffledVocab.length) currentCardIndex = 0;
                renderAdaptiveQueue(); updateAdaptiveUI(); displayCard();
            });
            const controls = document.createElement('div'); controls.style.marginLeft='8px'; controls.style.display='inline-flex'; controls.style.gap='6px';
            controls.appendChild(goBtn); controls.appendChild(skipBtn);
            li.appendChild(controls);
            adaptiveQueueList.appendChild(li);
        });
    }

    adaptiveSkipBtn?.addEventListener('click', () => {
        // remove current
        if (!shuffledVocab || !shuffledVocab.length) return;
        const removed = shuffledVocab.splice(currentCardIndex,1);
        adaptiveQueue = shuffledVocab.slice();
        if (currentCardIndex >= shuffledVocab.length) currentCardIndex = 0;
        renderAdaptiveQueue(); updateAdaptiveUI(); displayCard();
    });
    adaptiveRebuildBtn?.addEventListener('click', () => { adaptiveQueue = buildAdaptiveQueue(); shuffledVocab = adaptiveQueue.slice(); currentCardIndex = 0; renderAdaptiveQueue(); updateAdaptiveUI(); displayCard(); });

    // initial render
    renderAdaptiveQueue();

    // helper: format next day (from days number)
    function daysToDate(days) {
        const ms = days * 24 * 60 * 60 * 1000;
        return new Date(ms);
    }
    function formatNextDay(nextDays) {
        const today = nowDays();
        if (!nextDays) return 'Jamais';
        const diff = nextDays - today;
        if (diff <= 0) return 'Aujourd\'hui';
        if (diff === 1) return 'Demain';
        const dt = daysToDate(nextDays);
        return dt.toLocaleDateString();
    }

    // update when sort mode changes
    const adaptiveSortSelect = document.getElementById('adaptiveSortSelect');
    adaptiveSortSelect?.addEventListener('change', () => { adaptiveQueue = buildAdaptiveQueue(); shuffledVocab = adaptiveQueue.slice(); renderAdaptiveQueue(); updateAdaptiveUI(); });

    // --- Export adaptive session ---
    const adaptiveExportBtn = document.getElementById('adaptiveExportBtn');
    const adaptiveExportFormat = document.getElementById('adaptiveExportFormat');
    function exportAdaptiveSession(format = 'csv') {
        if (!adaptiveQueue || !adaptiveQueue.length) { displayAlert('Aucune entrée à exporter.', 'var(--incorrect-color)'); setTimeout(hideAlert,1200); return; }
        const sep = (format === 'tsv') ? '\t' : ',';
        const rows = adaptiveQueue.map(r => {
            const word = String(r[0] || '').replace(/"/g, '""');
            const def = String(r[1] || '').replace(/"/g, '""');
            if (sep === '\t') return `${word}\t${def}`;
            return `"${word}","${def}"`;
        });
        const header = (format === 'tsv') ? '' : ''; // no header for Anki/TSV; keep CSV without header for simplicity
        const content = (header ? header + '\n' : '') + rows.join('\n');
        try {
            showGlobalSpinner(); adaptiveExportBtn.disabled = true;
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `adaptive_session.${format === 'tsv' ? 'tsv' : 'csv'}`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
            displayAlert('Export créé.', 'var(--correct-color)'); setTimeout(hideAlert,1200);
        } finally {
            setTimeout(() => { hideGlobalSpinner(); adaptiveExportBtn.disabled = false; }, 800);
        }
    }
    adaptiveExportBtn?.addEventListener('click', () => exportAdaptiveSession(adaptiveExportFormat?.value || 'csv'));

    // Global spinner helpers
    const globalSpinner = document.getElementById('globalSpinner');
    function showGlobalSpinner() { try { if (globalSpinner) globalSpinner.classList.add('show'); } catch(e){} }
    function hideGlobalSpinner() { try { if (globalSpinner) globalSpinner.classList.remove('show'); } catch(e){} }

    // --- Statistics System ---
    const defaultStats = {
        totalMastered: 0,
        totalLearnedTime: 0, // seconds
        lastLogin: new Date().toDateString(),
        streak: 0,
        skills: {
            memory: 0, // Flashcards
            speed: 0, // Quiz
            precision: 0, // Dictation/Hangman
            logic: 0 // Scramble/Match
        }
        ,
        consecutiveKnown: {}
    };
    
    // Stats per chapter support
    let currentChapterKey = null;
    let activeStats = JSON.parse(JSON.stringify(defaultStats));

    function saveStats() {
        const all = JSON.parse(localStorage.getItem('userStatsByChapter') || '{}');
        if (currentChapterKey) all[currentChapterKey] = activeStats;
        else all['_global'] = activeStats;
        localStorage.setItem('userStatsByChapter', JSON.stringify(all));
    }

    function loadChapterStats(chapterKey) {
        currentChapterKey = chapterKey || null;
        const all = JSON.parse(localStorage.getItem('userStatsByChapter') || '{}');
        if (currentChapterKey && all[currentChapterKey]) {
            activeStats = all[currentChapterKey];
        } else {
            activeStats = JSON.parse(JSON.stringify(defaultStats));
        }
        // Ensure consecutiveKnown exists
        if (!activeStats.consecutiveKnown) activeStats.consecutiveKnown = {};

        // Check streak for this chapter
        const today = new Date().toDateString();
        if (activeStats.lastLogin !== today) {
            const lastLoginDate = new Date(activeStats.lastLogin);
            const diffTime = Math.abs(new Date() - lastLoginDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays === 1) activeStats.streak++;
            else if (diffDays > 1) activeStats.streak = 1;
            activeStats.lastLogin = today;
            saveStats();
        }
        updateStatsUI();
    }

    function updateSkill(skill, amount) {
        activeStats.skills[skill] += amount;
        activeStats.totalMastered = masteredWords.size;
        saveStats();
    }

    // Timer for total time
    setInterval(() => {
        if (document.hasFocus()) {
            activeStats.totalLearnedTime++;
            if (activeStats.totalLearnedTime % 60 === 0) saveStats(); // Save every minute
        }
    }, 1000);


    // --- Stats UI & Radar Chart ---
    const statsBtn = document.getElementById('statsBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettings = document.getElementById('closeSettings');
    const masteryThresholdInput = document.getElementById('masteryThreshold');
    const confettiEnabledInput = document.getElementById('confettiEnabled');
    const confettiDesktopOnlyInput = document.getElementById('confettiDesktopOnly');
    const confettiIgnoreReducedMotionInput = document.getElementById('confettiIgnoreReducedMotion');
    const showConsecBadgeInput = document.getElementById('showConsecBadge');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const resetSettingsBtn = document.getElementById('resetSettingsBtn');
    const statsModal = document.getElementById('statsModal');
    const closeModal = statsModal.querySelector('.close-modal');

    function openStats() {
        updateStatsUI();
        statsModal.style.display = 'flex';
        // Slight delay to allow display:flex to apply before adding class for transition
        // focus management: remember last focused element
        lastFocus = document.activeElement;
        setTimeout(() => {
            statsModal.classList.add('show');
            // focus first focusable element inside
            const focusable = statsModal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusable) focusable.focus();
            // trap focus inside modal for accessibility
            try { trapFocus(statsModal); } catch(e) {}
        }, 10);
    }
    
    function closeStats() {
        // release focus trap first
        try { releaseFocus(statsModal); } catch(e) {}
        statsModal.classList.remove('show');
        // Wait for transition to finish before hiding
        setTimeout(() => {
            statsModal.style.display = 'none';
        }, 300); // Match CSS transition time
    }

    // Update event listeners to use the new closeStats function
    statsBtn.addEventListener('click', openStats);
    closeModal.addEventListener('click', closeStats);
    window.addEventListener('click', (e) => { 
        if (e.target === statsModal) closeStats(); 
    });

    // Settings management
    const defaultSettings = {
        masteryThreshold: 5,
        confettiEnabled: true,
        confettiDesktopOnly: false,
        showConsecBadge: true,
        confettiIgnoreReducedMotion: false,
        theme: 'midnight-aura',
        defaultTheme: 'midnight-aura'
    };
    let userSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');

    // --- Theme System ---
    const THEME_KEY = 'selectedTheme';
    const DEFAULT_THEME_KEY = 'defaultTheme';
    const themes = ['midnight-aura', 'aurora-borealis', 'sunset-ember'];
    const themeMetaColor = {
        'midnight-aura': '#0D0B1A',
        'aurora-borealis': '#0A1628',
        'sunset-ember': '#1A0F0A'
    };

    function applyTheme(themeName) {
        if (!themes.includes(themeName)) themeName = 'midnight-aura';
        document.documentElement.setAttribute('data-theme', themeName);
        document.body.style.backgroundColor = '';  // let CSS handle it
        // update meta theme-color
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) metaTheme.setAttribute('content', themeMetaColor[themeName] || '#0D0B1A');
        // persist current selection
        localStorage.setItem(THEME_KEY, themeName);
        userSettings.theme = themeName;
        // update theme picker UI
        updateThemePickerUI(themeName);
    }

    function updateThemePickerUI(activeTheme) {
        const picker = document.getElementById('themePicker');
        if (!picker) return;
        const defaultTheme = localStorage.getItem(DEFAULT_THEME_KEY) || 'midnight-aura';
        picker.querySelectorAll('.theme-card').forEach(card => {
            const t = card.getAttribute('data-theme');
            card.classList.toggle('active', t === activeTheme);
        });
        picker.querySelectorAll('.theme-default-btn').forEach(btn => {
            const t = btn.getAttribute('data-theme');
            btn.classList.toggle('is-default', t === defaultTheme);
        });
    }

    function setDefaultTheme(themeName) {
        if (!themes.includes(themeName)) themeName = 'midnight-aura';
        localStorage.setItem(DEFAULT_THEME_KEY, themeName);
        userSettings.defaultTheme = themeName;
        saveSettings();
        updateThemePickerUI(localStorage.getItem(THEME_KEY) || themeName);
    }

    // Apply saved or default theme immediately
    (function initTheme() {
        const saved = localStorage.getItem(THEME_KEY);
        const defaultT = localStorage.getItem(DEFAULT_THEME_KEY) || 'midnight-aura';
        applyTheme(saved || defaultT);
    })();

    // Wire up theme picker clicks
    const themePicker = document.getElementById('themePicker');
    if (themePicker) {
        themePicker.addEventListener('click', (e) => {
            // Handle theme card click
            const card = e.target.closest('.theme-card');
            const defaultBtn = e.target.closest('.theme-default-btn');
            if (defaultBtn) {
                e.stopPropagation();
                const t = defaultBtn.getAttribute('data-theme');
                setDefaultTheme(t);
                return;
            }
            if (card) {
                const t = card.getAttribute('data-theme');
                applyTheme(t);
            }
        });
    }
    function loadSettings() {
        userSettings = Object.assign({}, defaultSettings, userSettings || {});
        // apply to UI inputs if present
        try {
            masteryThresholdInput.value = userSettings.masteryThreshold;
            confettiEnabledInput.checked = !!userSettings.confettiEnabled;
            confettiDesktopOnlyInput.checked = !!userSettings.confettiDesktopOnly;
            showConsecBadgeInput.checked = !!userSettings.showConsecBadge;
            if (confettiIgnoreReducedMotionInput) confettiIgnoreReducedMotionInput.checked = !!userSettings.confettiIgnoreReducedMotion;
        } catch(e) {}
        // apply theme
        const savedTheme = localStorage.getItem(THEME_KEY) || localStorage.getItem(DEFAULT_THEME_KEY) || 'midnight-aura';
        applyTheme(savedTheme);
    }
    function saveSettings() {
        localStorage.setItem('userSettings', JSON.stringify(userSettings));
    }

    function openSettings() {
        loadSettings();
        settingsModal.style.display = 'flex';
        lastFocus = document.activeElement;
        setTimeout(() => {
            settingsModal.classList.add('show');
            // focus first input in settings
            const focusable = settingsModal.querySelector('input, button, [tabindex]:not([tabindex="-1"])');
            if (focusable) focusable.focus();
            try { trapFocus(settingsModal); } catch(e) {}
        }, 10);
    }
    function closeSettingsModal() { try { releaseFocus(settingsModal); } catch(e) {} settingsModal.classList.remove('show'); setTimeout(()=> settingsModal.style.display='none',300); }

    settingsBtn?.addEventListener('click', openSettings);
    closeSettings?.addEventListener('click', closeSettingsModal);
    window.addEventListener('click', (e) => { if (e.target === settingsModal) closeSettingsModal(); });

    saveSettingsBtn?.addEventListener('click', () => {
        userSettings.masteryThreshold = parseInt(masteryThresholdInput.value, 10) || defaultSettings.masteryThreshold;
        userSettings.confettiEnabled = !!confettiEnabledInput.checked;
        userSettings.confettiDesktopOnly = !!confettiDesktopOnlyInput.checked;
        userSettings.showConsecBadge = !!showConsecBadgeInput.checked;
        saveSettings();
        closeSettingsModal();
    });
    resetSettingsBtn?.addEventListener('click', () => {
        userSettings = Object.assign({}, defaultSettings);
        saveSettings();
        localStorage.setItem(DEFAULT_THEME_KEY, 'midnight-aura');
        applyTheme('midnight-aura');
        loadSettings();
    });

    // Live apply: update settings immediately when inputs change
    const liveApply = () => {
        try {
            userSettings.masteryThreshold = parseInt(masteryThresholdInput.value, 10) || defaultSettings.masteryThreshold;
            userSettings.confettiEnabled = !!confettiEnabledInput.checked;
            userSettings.confettiDesktopOnly = !!confettiDesktopOnlyInput.checked;
            userSettings.confettiIgnoreReducedMotion = !!(confettiIgnoreReducedMotionInput && confettiIgnoreReducedMotionInput.checked);
            userSettings.showConsecBadge = !!showConsecBadgeInput.checked;
            saveSettings();
            // refresh current card UI to reflect badge visibility/threshold change
            if (shuffledVocab && shuffledVocab.length) displayCard();
        } catch(e) { /* ignore */ }
    };
    confettiIgnoreReducedMotionInput?.addEventListener('change', liveApply);
    masteryThresholdInput?.addEventListener('input', liveApply);
    confettiEnabledInput?.addEventListener('change', liveApply);
    confettiDesktopOnlyInput?.addEventListener('change', liveApply);
    showConsecBadgeInput?.addEventListener('change', liveApply);

    // Keyboard shortcut: Ctrl+, to open settings
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === ',') {
            // avoid when typing in inputs
            const tag = document.activeElement?.tagName || '';
            if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
                openSettings();
                e.preventDefault();
            }
        }
    });

    // Stats modal controls: reset + export
    const resetChapterStatsBtn = document.getElementById('resetChapterStatsBtn');
    const exportChapterStatsBtn = document.getElementById('exportChapterStatsBtn');
    const importChapterStatsBtn = document.getElementById('importChapterStatsBtn');
    const importStatsFile = document.getElementById('importStatsFile');
    let lastFocus = null;

    // Focus trap helpers for accessibility
    function trapFocus(modal) {
        if (!modal) return;
        const focusable = Array.from(modal.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(el => !el.disabled && el.offsetParent !== null);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        function handler(e) {
            if (e.key === 'Tab') {
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault(); last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault(); first.focus();
                }
            } else if (e.key === 'Escape') {
                // Close appropriate modal
                if (modal === settingsModal) closeSettingsModal();
                else if (modal === statsModal) closeStats();
            }
        }
        modal._focusHandler = handler;
        document.addEventListener('keydown', handler);
    }
    function releaseFocus(modal) {
        if (!modal || !modal._focusHandler) return;
        document.removeEventListener('keydown', modal._focusHandler);
        delete modal._focusHandler;
        // restore previous focus if possible
        try { if (lastFocus && lastFocus.focus) lastFocus.focus(); } catch(e) {}
    }
    if (resetChapterStatsBtn) {
        resetChapterStatsBtn.addEventListener('click', () => {
            if (!currentChapterKey) {
                if (!confirm('Réinitialiser les statistiques globales ?')) return;
            } else {
                if (!confirm(`Réinitialiser les statistiques pour ${ALL_VOCAB_DATA[currentChapterKey]?.title || currentChapterKey} ?`)) return;
            }
            activeStats = JSON.parse(JSON.stringify(defaultStats));
            saveStats();
            updateStatsUI();
            displayAlert('Statistiques réinitialisées.', 'var(--correct-color)');
            setTimeout(hideAlert, 1400);
        });
    }
    if (exportChapterStatsBtn) {
        exportChapterStatsBtn.addEventListener('click', () => {
            const rows = [
                ['key','value'],
                ['chapter', currentChapterKey || '_global'],
                ['totalMastered', activeStats.totalMastered],
                ['totalLearnedTime', activeStats.totalLearnedTime],
                ['lastLogin', activeStats.lastLogin],
                ['streak', activeStats.streak],
                ['memory', activeStats.skills.memory],
                ['speed', activeStats.skills.speed],
                ['precision', activeStats.skills.precision],
                ['logic', activeStats.skills.logic]
            ];
            const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `stats_${currentChapterKey || 'global'}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }
    if (importChapterStatsBtn && importStatsFile) {
        importChapterStatsBtn.addEventListener('click', () => importStatsFile.click());
        importStatsFile.addEventListener('change', (e) => {
            const f = e.target.files[0];
            if (!f) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                const text = ev.target.result;
                // parse CSV simple format produced by export
                const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l);
                const data = {};
                lines.forEach((ln) => {
                    // split only on the first comma to tolerate commas in values
                    const idx = ln.indexOf(',');
                    if (idx === -1) return;
                    const k = ln.slice(0, idx).replace(/^"|"$/g, '').trim();
                    const v = ln.slice(idx + 1).replace(/^"|"$/g, '').trim();
                    data[k] = v;
                });
                const requiredKeys = ['chapter','totalMastered','totalLearnedTime','lastLogin','streak','memory','speed','precision','logic'];
                const hasAll = requiredKeys.every(k => typeof data[k] !== 'undefined');
                if (!hasAll) {
                    displayAlert('Format CSV invalide ou incomplet.', 'var(--incorrect-color)');
                    setTimeout(hideAlert, 1800);
                    return;
                }
                const chapterKey = data['chapter'] || '_imported';
                const obj = JSON.parse(JSON.stringify(defaultStats));
                obj.totalMastered = parseInt(data['totalMastered']) || 0;
                obj.totalLearnedTime = parseInt(data['totalLearnedTime']) || 0;
                obj.lastLogin = data['lastLogin'] || new Date().toDateString();
                obj.streak = parseInt(data['streak']) || 0;
                obj.skills.memory = parseInt(data['memory']) || 0;
                obj.skills.speed = parseInt(data['speed']) || 0;
                obj.skills.precision = parseInt(data['precision']) || 0;
                obj.skills.logic = parseInt(data['logic']) || 0;
                const all = JSON.parse(localStorage.getItem('userStatsByChapter') || '{}');
                all[chapterKey] = obj;
                localStorage.setItem('userStatsByChapter', JSON.stringify(all));
                displayAlert('Statistiques importées pour ' + chapterKey, 'var(--correct-color)');
                setTimeout(hideAlert, 1400);
            };
            reader.readAsText(f);
        });
    }

    function formatTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    }

    function getLevel(xp) {
        return Math.floor(Math.sqrt(xp / 10)) + 1; // Simple progression curve
    }

    function updateStatsUI() {
        document.getElementById('statTotalMastered').textContent = activeStats.totalMastered;
        document.getElementById('statTotalBar').style.width = `${Math.min((activeStats.totalMastered / 1000) * 100, 100)}%`;
        document.getElementById('statTime').textContent = formatTime(activeStats.totalLearnedTime);

        document.getElementById('lvlMemory').textContent = `Lvl ${getLevel(activeStats.skills.memory)}`;
        document.getElementById('lvlSpeed').textContent = `Lvl ${getLevel(activeStats.skills.speed)}`;
        document.getElementById('lvlPrecision').textContent = `Lvl ${getLevel(activeStats.skills.precision)}`;
        document.getElementById('lvlLogic').textContent = `Lvl ${getLevel(activeStats.skills.logic)}`;

        // Update chapter title in modal header
        const titleEl = document.getElementById('statsChapterTitle');
        if (titleEl) titleEl.textContent = currentChapterKey ? (ALL_VOCAB_DATA[currentChapterKey]?.title || currentChapterKey) : 'Statistiques — Global';

        drawRadarChart();
    }

    function drawRadarChart() {
        const svg = document.getElementById('radarChart');
        svg.innerHTML = ''; // Clear
        
        const stats = [
            { val: getLevel(activeStats.skills.memory), label: "MÉMOIRE" },
            { val: getLevel(activeStats.skills.speed), label: "VITESSE" },
            { val: getLevel(activeStats.skills.precision), label: "PRÉCISION" },
            { val: getLevel(activeStats.skills.logic), label: "LOGIQUE" }
        ];

        const maxLvl = Math.max(...stats.map(s => s.val), 10); // Scale based on max level
        const center = 100;
        const radius = 80;
        const angleStep = (Math.PI * 2) / 4;

        // Draw Axis & Levels
        for (let i = 0; i < 4; i++) {
            const angle = i * angleStep - Math.PI / 2;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            
            // Axis
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", center); line.setAttribute("y1", center);
            line.setAttribute("x2", x); line.setAttribute("y2", y);
            line.classList.add("radar-axis");
            svg.appendChild(line);

            // Label
            const labelX = center + (radius + 15) * Math.cos(angle);
            const labelY = center + (radius + 15) * Math.sin(angle);
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", labelX); text.setAttribute("y", labelY + 3); // +3 to center vertically
            text.textContent = stats[i].label;
            text.classList.add("radar-label");
            svg.appendChild(text);
        }

        // Draw Levels (Concentric polygons)
        [0.25, 0.5, 0.75, 1].forEach(scale => {
            let points = "";
            for (let i = 0; i < 4; i++) {
                const angle = i * angleStep - Math.PI / 2;
                const r = radius * scale;
                points += `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)} `;
            }
            const poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
            poly.setAttribute("points", points);
            poly.classList.add("radar-level");
            svg.appendChild(poly);
        });

        // Draw Data Shape
        let dataPoints = "";
        stats.forEach((s, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const r = (s.val / maxLvl) * radius;
            dataPoints += `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)} `;
        });

        const shape = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        shape.setAttribute("points", dataPoints);
        shape.classList.add("radar-shape");
        svg.appendChild(shape);
    }

    // (listeners already attached above using openStats/closeStats)


    // --- Utility ---
    // Fisher-Yates shuffle (returns a shuffled copy)
    function shuffleArray(array) {
        const arr = array.slice();
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    // Normalize text: lowercase, trim, remove diacritics
    function normalizeText(s) {
        if (!s) return '';
        return s.toString().trim().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
    }

    // Words that should show a "Facultative" badge on flashcards (normalized)
    const FACULTATIVE_WORDS = new Set([
        'sensation',
        'sensualite',
        'inclinaison',
        'desinteressement'
    ]);

    // Simple Levenshtein distance
    function levenshtein(a, b) {
        a = a || '';
        b = b || '';
        const m = a.length, n = b.length;
        if (m === 0) return n;
        if (n === 0) return m;
        const dp = Array.from({ length: m + 1 }, () => new Array(n + 1));
        for (let i = 0; i <= m; i++) dp[i][0] = i;
        for (let j = 0; j <= n; j++) dp[0][j] = j;
        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                dp[i][j] = Math.min(
                    dp[i - 1][j] + 1,
                    dp[i][j - 1] + 1,
                    dp[i - 1][j - 1] + cost
                );
            }
        }
        return dp[m][n];
    }
    const displayAlert = (message, color) => {
        alertMessageDiv.textContent = message;
        alertMessageDiv.style.backgroundColor = color;
        alertMessageDiv.style.display = 'block';
    };
    const hideAlert = () => alertMessageDiv.style.display = 'none';

    // Simple confetti: spawn colored pieces and animate then remove
    function launchConfetti() {
        // Respect user preference for reduced motion unless user chose to ignore it
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            if (!(userSettings && userSettings.confettiIgnoreReducedMotion)) return;
        }
        const colors = ['#FF4D4F','#FFB400','#36CFC9','#5C7CFA','#00C853','#FF6B6B'];
        const flashRect = flashcard.getBoundingClientRect();
        const centerX = flashRect.left + flashRect.width / 2;
        const centerY = flashRect.top + flashRect.height / 2;
        // Cap pieces for performance
        const pieces = Math.min(12, Math.max(6, Math.floor((window.deviceMemory || 1) > 2 ? 12 : 8)));
        for (let i = 0; i < pieces; i++) {
            const el = document.createElement('div');
            el.className = 'confetti-piece';
            const color = colors[Math.floor(Math.random() * colors.length)];
            el.style.background = color;
            el.style.left = `${centerX}px`;
            el.style.top = `${centerY}px`;
            el.style.transform = `translate(${(Math.random() - 0.5) * 60}px, ${-10 - Math.random() * 40}px) rotate(${Math.random() * 360}deg)`;
            el.setAttribute('aria-hidden', 'true');
            document.body.appendChild(el);
            // animate using CSS; remove after duration
            setTimeout(() => { if (el && el.parentNode) el.remove(); }, 1200 + Math.random() * 600);
        }
    }

    function isTouchDevice() {
        return (('ontouchstart' in window) || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0);
    }

    // --- UX helpers: search, keyboard, swipe, SRS hooks ---
    // Attach SRS updates to feedback buttons
    knewItBtn?.addEventListener('click', () => updateSRSForCurrent('known'));
    didntKnowBtn?.addEventListener('click', () => updateSRSForCurrent('didntKnow'));
    masteredBtn?.addEventListener('click', () => updateSRSForCurrent('mastered'));

    // Search & filter implementation (lightweight)
    function filterFullList() {
        const q = normalizeText(searchInput?.value || '');
        fullVocabularyList.innerHTML = '';
        if (!q) return; // Keep default rendering when empty
        const results = [];
        Object.keys(ALL_VOCAB_DATA).forEach(ch => {
            const cat = ALL_VOCAB_DATA[ch];
            Object.keys(cat.subcategories || {}).forEach(sub => {
                const list = cat.subcategories[sub].data || [];
                list.forEach(row => {
                    const w = String(row[0] || '');
                    const d = String(row[1] || '');
                    if (normalizeText(w).includes(q) || normalizeText(d).includes(q)) {
                        const mastered = masteredWords.has(w);
                        if (mastered && !filterMasteredChk?.checked) return;
                        if (!mastered && !filterUnmasteredChk?.checked) return;
                        results.push({word: w, def: d, chap: ch});
                    }
                });
            });
        });
        if (!results.length) {
            fullVocabularyList.innerHTML = `<li>No result</li>`;
            return;
        }
        const frag = document.createDocumentFragment();
        results.forEach(r => {
            const li = document.createElement('li');
            li.textContent = `${r.word} — ${r.def}`;
            li.tabIndex = 0;
            li.addEventListener('click', () => {
                displayAlert(`Sélection : ${r.word}`, 'var(--primary-glow)');
                setTimeout(hideAlert, 1300);
            });
            frag.appendChild(li);
        });
        fullVocabularyList.appendChild(frag);
    }
    searchInput?.addEventListener('input', filterFullList);
    filterMasteredChk?.addEventListener('change', filterFullList);
    filterUnmasteredChk?.addEventListener('change', filterFullList);

    // Keyboard navigation and accessibility
    document.addEventListener('keydown', (e) => {
        const tag = document.activeElement?.tagName || '';
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        if (e.key === 'ArrowLeft') { prevCardBtn?.click(); }
        else if (e.key === 'ArrowRight') { nextCardBtn?.click(); }
        else if (e.key === ' ') { // space flips the card
            e.preventDefault(); flashcard?.click();
        } else if (e.key.toLowerCase() === 'p') {
            // play pronunciation
            e.preventDefault();
            try { playCurrentWord(); } catch(e) {}
        }
    });

    // Simple swipe detection on flashcard for mobile
    (function attachSwipe() {
        if (!flashcard) return;
        let sx = 0, sy = 0;
        flashcard.addEventListener('touchstart', (ev) => {
            const t = ev.touches[0]; sx = t.clientX; sy = t.clientY;
        }, {passive: true});
        flashcard.addEventListener('touchend', (ev) => {
            const t = ev.changedTouches[0]; const dx = t.clientX - sx; const dy = t.clientY - sy;
            // Horizontal swipe = prev/next
            if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
                if (dx > 0) prevCardBtn?.click(); else nextCardBtn?.click();
                return;
            }
            // Vertical swipe = flip
            if (Math.abs(dy) > 30 && Math.abs(dy) > Math.abs(dx)) {
                flashcard.classList.toggle('flipped');
            }
        });
    })();

    // --- Text-to-Speech (TTS) ---
    function speakText(text, lang = 'fr-FR') {
        if (!text) return;
        if (!('speechSynthesis' in window)) {
            displayAlert('Synthèse vocale non disponible dans ce navigateur.', 'var(--incorrect-color)');
            setTimeout(hideAlert, 1400);
            return;
        }
        try {
            window.speechSynthesis.cancel();
            const ut = new SpeechSynthesisUtterance(text);
            ut.lang = lang;
            ut.rate = 0.95;
            ut.onstart = () => { if (liveStatus) liveStatus.textContent = `Lecture : ${text}`; };
            ut.onend = () => { if (liveStatus) liveStatus.textContent = ''; };
            window.speechSynthesis.speak(ut);
        } catch (e) { console.warn('TTS error', e); }
    }

    function playCurrentWord() {
        if (!flashcard) return;
        const isBack = flashcard.classList.contains('flipped');
        const frontText = wordH2?.textContent?.trim();
        const backText = backFaceP?.textContent?.trim();
        if (isBack && backText) speakText(backText);
        else if (frontText) speakText(frontText);
    }

    playWordBtn?.addEventListener('click', (e) => { e.stopPropagation(); playCurrentWord(); });

    // --- Export / Import SRS and Mastered ---
    const importSRSFile = document.getElementById('importSRSFile');
    const importMasteredFile = document.getElementById('importMasteredFile');
    const importSRSBtn = document.getElementById('importSRSBtn');
    const exportSRSBtn = document.getElementById('exportSRSBtn');
    const importMasteredBtn = document.getElementById('importMasteredBtn');
    const exportMasteredBtn = document.getElementById('exportMasteredBtn');

    exportSRSBtn?.addEventListener('click', () => {
        try {
            showGlobalSpinner();
            exportSRSBtn.disabled = true;
            const blob = new Blob([JSON.stringify(srsData, null, 2)], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = 'srs_export.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
        } finally {
            setTimeout(() => { hideGlobalSpinner(); exportSRSBtn.disabled = false; }, 700);
        }
    });
    importSRSBtn?.addEventListener('click', () => importSRSFile.click());
    importSRSFile?.addEventListener('change', (e) => {
        const f = e.target.files[0]; if(!f) return; const r = new FileReader(); r.onload = (ev) => {
            try { const obj = JSON.parse(ev.target.result); if (confirm('Remplacer les données SRS existantes ? OK = remplacer, Annuler = fusionner')) {
                srsData = obj || {}; saveSRS();
            } else { Object.assign(srsData, obj || {}); saveSRS(); }
            displayAlert('SRS importé.', 'var(--correct-color)'); setTimeout(hideAlert,1400); refreshAdaptiveCount(); renderAdaptiveQueue(); }
            catch(err){ displayAlert('Erreur JSON SRS.', 'var(--incorrect-color)'); setTimeout(hideAlert,1400); }
        }; r.readAsText(f);
    });

    exportMasteredBtn?.addEventListener('click', () => {
        try {
            showGlobalSpinner();
            exportMasteredBtn.disabled = true;
            const arr = Array.from(masteredWords);
            const blob = new Blob([JSON.stringify(arr, null, 2)], {type: 'application/json'});
            const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'mastered_export.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
        } finally {
            setTimeout(() => { hideGlobalSpinner(); exportMasteredBtn.disabled = false; }, 700);
        }
    });
    importMasteredBtn?.addEventListener('click', () => importMasteredFile.click());
    importMasteredFile?.addEventListener('change', (e) => {
        const f = e.target.files[0]; if(!f) return; const r = new FileReader(); r.onload = (ev) => {
            try { const arr = JSON.parse(ev.target.result); if (!Array.isArray(arr)) throw new Error('Not array');
                if (confirm('Remplacer la liste des mots maîtrisés ? OK = remplacer, Annuler = fusionner')) {
                    masteredWords = new Set(arr || []);
                } else { arr.forEach(w => masteredWords.add(w)); }
                updateMasteredList(); displayAlert('Maîtrisés importés.', 'var(--correct-color)'); setTimeout(hideAlert,1400); refreshAdaptiveCount(); renderAdaptiveQueue();
            } catch(err){ displayAlert('Erreur JSON Maîtrisés.', 'var(--incorrect-color)'); setTimeout(hideAlert,1400); }
        }; r.readAsText(f);
    });

    // Register service worker for offline support (PWA)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js').then(reg => {
            console.log('ServiceWorker registered', reg.scope);
        }).catch(err => {
            console.warn('SW registration failed', err);
        });
    }

    // --- Game Mode Management ---
    const showGameContainer = (mode) => {
        currentMode = mode;
        Object.values(gameContainers).forEach(c => c.classList.remove('active-mode'));
        Object.values(modeButtons).forEach(b => b.classList.remove('active'));
        gameContainers[mode].classList.add('active-mode');
        modeButtons[mode].classList.add('active');
        startGame(mode);
    };

    const startGame = (mode) => {
        const startFunctions = {
            flashcard: startFlashcardGame, reverse: startFlashcardGame, // Both use same logic
            quiz: startQuizGame, hangman: startHangmanGame,
            scramble: startScrambleGame, dictation: startDictationGame, match: startMatchGame,
        };
        if(startFunctions[mode]) startFunctions[mode]();
    };

    // --- Chapter & Vocab Data ---
    function initSelectors() {
        // Setup Chapter Select
        setupCustomSelect(chapterSelectWrapper, customChapterTrigger, customChapterOptionsContainer, nativeChapterSelect);

        // Setup Subcategory Select (initially disabled)
        setupCustomSelect(subcategorySelectWrapper, customSubcategoryTrigger, customSubcategoryOptionsContainer, nativeSubcategorySelect);
        subcategorySelectWrapper.classList.add('disabled');

        // Setup adaptive export format custom select (if present)
        const adaptiveExportFormatWrapper = document.getElementById('adaptiveExportFormatWrapper');
        if (adaptiveExportFormatWrapper) {
            const trigger = adaptiveExportFormatWrapper.querySelector('.custom-select-trigger');
            const optionsContainer = adaptiveExportFormatWrapper.querySelector('.custom-options');
            const native = document.getElementById('adaptiveExportFormat');
            try { setupCustomSelect(adaptiveExportFormatWrapper, trigger, optionsContainer, native); }
            catch(e) { /* ignore if not available */ }
        }

        // Setup export orientation custom select (if present)
        const exportOrientationWrapper = document.getElementById('exportOrientationWrapper');
        if (exportOrientationWrapper) {
            const trigger = exportOrientationWrapper.querySelector('.custom-select-trigger');
            const optionsContainer = exportOrientationWrapper.querySelector('.custom-options');
            const native = document.getElementById('exportOrientationSelect');
            try { setupCustomSelect(exportOrientationWrapper, trigger, optionsContainer, native); }
            catch(e) { /* ignore if not available */ }
        }

        // Setup adaptive sort custom select (if present)
        const adaptiveSortWrapper = document.getElementById('adaptiveSortWrapper');
        if (adaptiveSortWrapper) {
            const trigger = adaptiveSortWrapper.querySelector('.custom-select-trigger');
            const optionsContainer = adaptiveSortWrapper.querySelector('.custom-options');
            const native = document.getElementById('adaptiveSortSelect');
            try { setupCustomSelect(adaptiveSortWrapper, trigger, optionsContainer, native); }
            catch(e) { /* ignore if not available */ }
        }

        Object.entries(ALL_VOCAB_DATA).forEach(([key, chapter]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = chapter.title;
            nativeChapterSelect.appendChild(option);
        });
        chapterSelectWrapper.updateCustomSelect(); // Update custom display

        nativeChapterSelect.addEventListener('change', () => {
            const chapterKey = nativeChapterSelect.value;
            // Load stats for the selected chapter
            loadChapterStats(chapterKey);
            
            // Clear and reset native subcategory select
            nativeSubcategorySelect.innerHTML = '<option value="" disabled selected>Choisir une liste</option>';
            nativeSubcategorySelect.disabled = true;
            subcategorySelectWrapper.classList.add('disabled'); // Disable custom wrapper
            
                if (chapterKey && ALL_VOCAB_DATA[chapterKey]) {
                    const chapter = ALL_VOCAB_DATA[chapterKey];
                    // If chapter has explicit subcategories, populate them
                    if (chapter.subcategories) {
                        Object.entries(chapter.subcategories).forEach(([subKey, sub]) => {
                            const option = document.createElement('option');
                            option.value = subKey;
                            option.textContent = sub.name;
                            nativeSubcategorySelect.appendChild(option);
                        });
                        nativeSubcategorySelect.disabled = false;
                        subcategorySelectWrapper.classList.remove('disabled'); // Enable custom wrapper
                    } else if (chapter.data) {
                        // Single flat list for the chapter -- expose as a single selectable option
                        const option = document.createElement('option');
                        option.value = 'all';
                        option.textContent = chapter.title || 'Liste';
                        nativeSubcategorySelect.appendChild(option);
                        nativeSubcategorySelect.disabled = false;
                        subcategorySelectWrapper.classList.remove('disabled');
                    }
                }
            subcategorySelectWrapper.updateCustomSelect(); // Update custom display for subcategory
        });

        nativeSubcategorySelect.addEventListener('change', () => {
            const chapterKey = nativeChapterSelect.value;
            const subcategoryKey = nativeSubcategorySelect.value;
            if (chapterKey && subcategoryKey) {
                changeVocabulary(chapterKey, subcategoryKey);
            }
        });
    }

    // Generic function to set up custom select dropdowns
    function setupCustomSelect(wrapper, trigger, optionsContainer, nativeSelect) {
        // Initial setup for trigger text
        trigger.textContent = nativeSelect.options[nativeSelect.selectedIndex]?.textContent || "Sélectionner...";

        // Handle click on custom trigger to toggle options visibility
        trigger.addEventListener('click', () => {
            if (wrapper.classList.contains('disabled')) return; // Do nothing if disabled
            wrapper.classList.toggle('open');
            trigger.classList.toggle('active');
            optionsContainer.classList.toggle('open');
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!wrapper.contains(e.target)) {
                wrapper.classList.remove('open');
                trigger.classList.remove('active');
                optionsContainer.classList.remove('open');
            }
        });

        // Function to populate custom options from native select's options
        function populateCustomOptions() {
            optionsContainer.innerHTML = ''; // Clear previous options
            Array.from(nativeSelect.options).forEach((option) => {
                const customOption = document.createElement('div');
                customOption.classList.add('custom-option');
                customOption.textContent = option.textContent;
                customOption.dataset.value = option.value;
                if (option.disabled) {
                    customOption.classList.add('disabled');
                }
                if (option.selected) {
                    customOption.classList.add('selected');
                }

                // Handle click on custom option
                customOption.addEventListener('click', () => {
                    if (customOption.classList.contains('disabled')) return; // Do nothing if disabled

                    nativeSelect.value = option.value; // Update native select's value
                    trigger.textContent = option.textContent; // Update custom trigger text

                    // Remove 'selected' from old option and add to new
                    Array.from(optionsContainer.children).forEach(opt => opt.classList.remove('selected'));
                    customOption.classList.add('selected');

                    // Close the custom dropdown
                    wrapper.classList.remove('open');
                    trigger.classList.remove('active');
                    optionsContainer.classList.remove('open');

                    // Dispatch 'change' event on the native select
                    const event = new Event('change', { bubbles: true });
                    nativeSelect.dispatchEvent(event);
                });
                optionsContainer.appendChild(customOption);
            });
        }
        
        // Initial population
        populateCustomOptions();

        // Observer for changes in native select (childList for options added/removed, attributes for disabled)
        const observer = new MutationObserver(() => {
            populateCustomOptions();
            updateDisabledState(); // Also update disabled state if native select's disabled attribute changes
            // If the native select's value changed programmatically, update the custom display
            const selectedOption = nativeSelect.options[nativeSelect.selectedIndex];
            if (selectedOption) {
                trigger.textContent = selectedOption.textContent;
            }
        });
        observer.observe(nativeSelect, { childList: true, attributes: true, attributeFilter: ['disabled', 'value'] });

        // Function to update the disabled state of the custom wrapper
        const updateDisabledState = () => {
            if (nativeSelect.disabled) {
                wrapper.classList.add('disabled');
            } else {
                wrapper.classList.remove('disabled');
            }
        };

        // Initial check and observe disabled attribute on the native select
        updateDisabledState(); // Initial state
    
        // Method to call externally if native select's value or options are changed programmatically
        wrapper.updateCustomSelect = () => {
            populateCustomOptions();
            updateDisabledState();
            const selectedOption = nativeSelect.options[nativeSelect.selectedIndex];
            if (selectedOption) {
                trigger.textContent = selectedOption.textContent;
                Array.from(optionsContainer.children).forEach(opt => opt.classList.remove('selected'));
                const matchingCustomOption = Array.from(optionsContainer.children).find(
                    opt => opt.dataset.value === selectedOption.value
                );
                if (matchingCustomOption) {
                    matchingCustomOption.classList.add('selected');
                }
            } else {
                // If no option is selected in native select, reset custom trigger to placeholder
                trigger.textContent = nativeSelect.options[0]?.textContent || "Sélectionner...";
                Array.from(optionsContainer.children).forEach(opt => opt.classList.remove('selected'));
                optionsContainer.children[0]?.classList.add('selected');
            }
        };
        wrapper.updateCustomSelect(); // Initial display update
    }

    function changeVocabulary(chapterKey, subcategoryKey) {
        const chapter = ALL_VOCAB_DATA[chapterKey];
        let sub;
        if (chapter.subcategories) {
            sub = chapter.subcategories[subcategoryKey];
        } else if (chapter.data) {
            sub = { name: chapter.title, data: chapter.data, alert: chapter.alert };
        }
        if (!sub) return displayAlert('Liste introuvable pour ce chapitre.', 'var(--incorrect-color)');
        vocab = sub.data;
        listTitle.textContent = `${chapter.title}${sub.name ? ' - ' + sub.name : ''}`;
        
        while (fullVocabularyList.firstChild) {
            fullVocabularyList.removeChild(fullVocabularyList.firstChild);
        }
        vocab.forEach(v => {
            const li = document.createElement('li');
            // Create a structured item for better copying/reading
            const wordSpan = document.createElement('span');
            wordSpan.className = 'vocab-word';
            wordSpan.textContent = v[0];
            
            const separator = document.createTextNode(' : ');
            
            const defSpan = document.createElement('span');
            defSpan.className = 'vocab-def';
            defSpan.textContent = v[1];

            li.appendChild(wordSpan);
            li.appendChild(separator);
            li.appendChild(defSpan);
            fullVocabularyList.appendChild(li);
        });

        sub.alert ? displayAlert(sub.alert.message, sub.alert.color) : hideAlert();
        startGame(currentMode);
    }

    // --- Export printable Excel (HTML) / CSV for current displayed list ---
    const exportListExcelBtn = document.getElementById('exportListExcelBtn');
    const exportListCsvBtn = document.getElementById('exportListCsvBtn');

    function escapeHtml(s) {
        return (s||'').toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    function buildPrintableHtml(title, rows, options = {}) {
        const now = new Date();
        const includeIndex = options.includeIndex !== false; // default true
        const includeType = !!options.includeType;
        const orientation = options.orientation === 'landscape' ? 'landscape' : 'portrait';

        const header = `<!doctype html><!doctype html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"/><meta charset="utf-8"><meta name="color-scheme" content="light"><title>${escapeHtml(title)}</title><style>
            /* Force light color-scheme to avoid browser/OS forced-dark inversion */
            html { color-scheme: light; }
            @page { size: A4 ${orientation}; margin: 10mm; }
            body{font-family:Arial,Helvetica,sans-serif;color:#111 !important;background:#ffffff !important;padding:6mm; -webkit-print-color-adjust: exact; print-color-adjust: exact;}
            .sheet-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
            h1{font-size:20px;margin:0}
            table{border-collapse:collapse;width:100%;margin-top:12px;font-size:12px;background:transparent}
            th,td{border:1px solid #ddd;padding:6px;text-align:left;vertical-align:top;color:#111 !important;background:transparent}
            th{background:#f3f3f8 !important}
            .nowrap { white-space:nowrap }
            @media print{ .no-print{display:none} table{page-break-inside:auto} tr{page-break-inside:avoid;page-break-after:auto} }
            </style></head><body>`;

        let body = `<div class="sheet-header"><h1>${escapeHtml(title)}</h1><div>${now.toLocaleString()}</div></div>`;
        // Build table header dynamically
        body += `<table><thead><tr>`;
        if (includeIndex) body += `<th class="nowrap">#</th>`;
        body += `<th>Mot</th><th>Définition</th>`;
        if (includeType) body += `<th class="nowrap">Type</th>`;
        body += `</tr></thead><tbody>`;

        rows.forEach((r,i) => {
            const w = escapeHtml(r[0]||'');
            const d = escapeHtml(r[1]||'');
            const t = escapeHtml(r[2]||'');
            body += `<tr>`;
            if (includeIndex) body += `<td class="nowrap">${i+1}</td>`;
            body += `<td>${w}</td><td>${d}</td>`;
            if (includeType) body += `<td class="nowrap">${t}</td>`;
            body += `</tr>`;
        });
        body += `</tbody></table>`;
        body += `</body></html>`;
        // Wrap Excel-specific workbook options for better compatibility
        const excelCfg = `<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>${escapeHtml(title)}</x:Name><x:WorksheetOptions><x:Print><x:ValidPrinterInfo/></x:Print></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->`;
        return header + excelCfg + body;
    }

    function downloadFile(filename, blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    }

    exportListExcelBtn?.addEventListener('click', () => {
        if (!vocab || !vocab.length) { displayAlert('Aucune liste sélectionnée.', 'var(--incorrect-color)'); setTimeout(hideAlert,1400); return; }
        const title = listTitle?.textContent || 'Liste de vocabulaire';
        const includeIndex = !!document.getElementById('exportIncludeIndex')?.checked;
        const includeType = !!document.getElementById('exportIncludeType')?.checked;
        const orientation = document.getElementById('exportOrientationSelect')?.value || 'portrait';
        const html = buildPrintableHtml(title, vocab, { includeIndex, includeType, orientation });
        // Excel accepts HTML with .xls extension; add BOM for better detection
        const bom = '\uFEFF';
        const blob = new Blob([bom + html], { type: 'application/vnd.ms-excel;charset=utf-8' });
        downloadFile(`${title.replace(/\s+/g,'_')}.xls`, blob);
    });

    exportListCsvBtn?.addEventListener('click', () => {
        if (!vocab || !vocab.length) { displayAlert('Aucune liste sélectionnée.', 'var(--incorrect-color)'); setTimeout(hideAlert,1400); return; }
        const includeIndex = !!document.getElementById('exportIncludeIndex')?.checked;
        const includeType = !!document.getElementById('exportIncludeType')?.checked;
        const title = listTitle?.textContent || 'liste';
        // Build header
        const headers = [];
        if (includeIndex) headers.push('Index');
        headers.push('Mot','Définition');
        if (includeType) headers.push('Type');

        const rows = vocab.map((r,i) => {
            const cols = [];
            if (includeIndex) cols.push(String(i+1));
            cols.push(String(r[0]||''), String(r[1]||''));
            if (includeType) cols.push(String(r[2]||''));
            return cols.map(c => `"${c.replace(/"/g,'""')}"`).join(',');
        });
        const headerLine = headers.length ? headers.map(h => `"${h.replace(/"/g,'""')}"`).join(',') : '';
        const content = (headerLine ? headerLine + '\n' : '') + rows.join('\n');
        // Prepend UTF-8 BOM for Excel on Windows
        const bom = '\uFEFF';
        const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' });
        downloadFile(`${title.replace(/\s+/g,'_')}.csv`, blob);
    });

    // --- Flashcard Game ---
    function startFlashcardGame() {
        if (!vocab.length) {
            wordH2.textContent = "Sélectionnez un chapitre";
            backFaceP.textContent = "";
            shuffledVocab = [];
            updateFlashcardUI();
            return;
        }
        shuffledVocab = shuffleArray([...vocab.filter(v => !masteredWords.has(v[0]))]);
        if(shuffledVocab.length === 0) {
            wordH2.textContent = "Félicitations!";
            backFaceP.textContent = "Tous les mots sont maîtrisés.";
            return;
        }
        currentCardIndex = 0;
        displayCard();
    }

    function displayCard() {
        const [word, definition, type] = shuffledVocab[currentCardIndex];
        
        if (currentMode === 'reverse') {
            // In reverse mode: Front = Definition, Back = Word
            wordH2.textContent = definition;
            wordH2.style.fontSize = definition.length > 50 ? '1.5rem' : '2rem'; // Adjust size for long defs
            backFaceP.textContent = word;
            backFaceP.style.fontSize = '2rem';
            backFaceP.style.fontWeight = 'bold';
        } else {
            // Normal mode: Front = Word, Back = Definition
            wordH2.textContent = word;
            wordH2.style.fontSize = ''; // Reset
            backFaceP.textContent = definition;
            backFaceP.style.fontSize = ''; // Reset
            backFaceP.style.fontWeight = '';
        }
        
        const isFacultative = FACULTATIVE_WORDS.has(normalizeText(word));
        const consecKey = normalizeText(word);
        const consecCount = activeStats.consecutiveKnown?.[consecKey] || 0;
        const threshold = (userSettings && userSettings.masteryThreshold) || 5;
        const showBadge = (userSettings && typeof userSettings.showConsecBadge !== 'undefined') ? userSettings.showConsecBadge : true;
        // Build the content safely using DOM methods (avoid innerHTML)
        if (wordTypeSpan) {
            // Clear previous content
            while (wordTypeSpan.firstChild) wordTypeSpan.removeChild(wordTypeSpan.firstChild);
            const typeNode = document.createTextNode((type || 'voc'));
            wordTypeSpan.appendChild(typeNode);
            if (isFacultative) {
                const space = document.createTextNode(' ');
                const badge = document.createElement('span');
                badge.className = 'facultative-badge';
                badge.textContent = 'Facultative';
                wordTypeSpan.appendChild(space);
                wordTypeSpan.appendChild(badge);
            }
            if (consecCount > 0 && showBadge) {
                const cb = document.createElement('span');
                cb.className = 'consec-badge';
                cb.textContent = `${consecCount}/${threshold}`;
                wordTypeSpan.appendChild(cb);
            }
        }
        flashcard.classList.remove('flipped');
        updateFlashcardUI();
    }

    function advanceAndNext(isMastered) {
        setTimeout(() => {
            currentCardIndex++;
            if (currentCardIndex >= shuffledVocab.length) {
                startFlashcardGame();
            } else {
                displayCard();
            }
            flashcard.classList.remove('flipped');
        }, 400);
        if (isMastered) {
            // small delay on alert already handled by caller
        }
        // Refresh adaptive queue and UI if in adaptive session
        try {
            if (adaptiveActive) {
                adaptiveQueue = buildAdaptiveQueue();
                shuffledVocab = adaptiveQueue.slice();
                if (currentCardIndex >= shuffledVocab.length) currentCardIndex = 0;
                renderAdaptiveQueue();
                updateAdaptiveUI();
            }
        } catch(e) {}
    }

    function updateFlashcardUI() {
        const total = shuffledVocab.length;
        const current = total > 0 ? currentCardIndex + 1 : 0;
        cardCounter.textContent = `${current}/${total}`;
        progressBar.style.width = total > 0 ? `${(current / total) * 100}%` : '0%';
        prevCardBtn.disabled = currentCardIndex === 0;
        nextCardBtn.disabled = currentCardIndex >= total - 1;
    }

    prevCardBtn.addEventListener('click', () => { if (currentCardIndex > 0) { currentCardIndex--; displayCard(); }});
    nextCardBtn.addEventListener('click', () => { if (currentCardIndex < shuffledVocab.length - 1) { currentCardIndex++; displayCard(); }});
    flashcard.addEventListener('click', () => flashcard.classList.toggle('flipped'));

    // Knew it handler: increment consecutive counter, master if reaches 5
    knewItBtn.addEventListener('click', () => {
        const word = shuffledVocab[currentCardIndex][0];
        const key = normalizeText(word);
        const prev = activeStats.consecutiveKnown[key] || 0;
        const next = prev + 1;
        activeStats.consecutiveKnown[key] = next;
        saveStats();
        const threshold = (userSettings && userSettings.masteryThreshold) || 5;
        if (next >= threshold) {
            // mark mastered
            masteredWords.add(word);
            updateMasteredList();
            updateSkill('memory', 10); // bonus XP
            activeStats.consecutiveKnown[key] = 0; // reset counter
            saveStats();
            displayAlert(`${word} maîtrisé !`, 'var(--correct-color)');
            if (userSettings.confettiEnabled) {
                if (!userSettings.confettiDesktopOnly || (userSettings.confettiDesktopOnly && !isTouchDevice())) {
                    try { launchConfetti(); } catch(e) {}
                }
            }
            setTimeout(hideAlert, 1400);
            advanceAndNext(true);
        } else {
            updateSkill('memory', 2);
            advanceAndNext(false);
        }
    });

    // Didn't know: reset consecutive counter
    didntKnowBtn.addEventListener('click', () => {
        const word = shuffledVocab[currentCardIndex][0];
        const key = normalizeText(word);
        activeStats.consecutiveKnown[key] = 0;
        saveStats();
        updateSkill('memory', 2);
        advanceAndNext(false);
    });

    masteredBtn.addEventListener('click', () => {
        const word = shuffledVocab[currentCardIndex][0];
        const key = normalizeText(word);
        masteredWords.add(word);
        activeStats.consecutiveKnown[key] = 0;
        saveStats();
        updateMasteredList();
        updateSkill('memory', 10);
        displayAlert(`${word} maîtrisé !`, 'var(--correct-color)');
        if (userSettings.confettiEnabled) {
            if (!userSettings.confettiDesktopOnly || (userSettings.confettiDesktopOnly && !isTouchDevice())) {
                try { launchConfetti(); } catch(e) {}
            }
        }
        setTimeout(hideAlert, 1400);
        advanceAndNext(true);
    });

    // --- Mastered Words Management ---
    function updateMasteredList() {
        while (masteredVocabularyList.firstChild) {
            masteredVocabularyList.removeChild(masteredVocabularyList.firstChild);
        }
        const masteredArray = Array.from(masteredWords);
        masteredArray.forEach(word => {
            const li = document.createElement('li');
            li.textContent = word;
            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '&times;';
            deleteBtn.className = 'delete-word-btn';
            deleteBtn.onclick = () => {
                masteredWords.delete(word);
                updateMasteredList();
                updateSkill('memory', -5); // Penalty for forgetting
                startGame(currentMode); // Refresh game
            };
            li.appendChild(deleteBtn);
            masteredVocabularyList.appendChild(li);
        });
        localStorage.setItem('masteredWords', JSON.stringify(masteredArray));
        activeStats.totalMastered = masteredWords.size; // Sync count
        saveStats();
    }

    resetMasteredBtn.addEventListener('click', () => {
        masteredWords.clear();
        updateMasteredList();
        startGame(currentMode); // Refresh game
    });


    // --- Quiz Game ---
    function startQuizGame() {
        const availableVocab = vocab.filter(v => !masteredWords.has(v[0]));
        if (availableVocab.length < 4) {
            quizQuestion.textContent = "Pas assez de mots pour un quiz.";
            while (quizOptions.firstChild) {
                quizOptions.removeChild(quizOptions.firstChild);
            }
            return;
        }
        quizQuestions = shuffleArray([...availableVocab]).map(([word, definition]) => {
            const correctAnswer = definition;
            let incorrectAnswers = shuffleArray(availableVocab.filter(v => v[1] !== correctAnswer)).slice(0, 3).map(v => v[1]);
            return { question: word, options: shuffleArray([correctAnswer, ...incorrectAnswers]), correctAnswer };
        });
        currentQuizQuestionIndex = 0;
        score = { correct: 0, total: 0 };
        displayQuizQuestion();
    }

    function displayQuizQuestion() {
        if (currentQuizQuestionIndex >= quizQuestions.length) {
            quizQuestion.textContent = `Quiz terminé! Score: ${score.correct}/${score.total}`;
            while (quizOptions.firstChild) {
                quizOptions.removeChild(quizOptions.firstChild);
            }
            const button = document.createElement('button');
            button.textContent = "Recommencer";
            button.onclick = () => startGame('quiz');
            quizOptions.appendChild(button);
            return;
        }
        const q = quizQuestions[currentQuizQuestionIndex];
        quizQuestion.textContent = q.question;
        while (quizOptions.firstChild) {
            quizOptions.removeChild(quizOptions.firstChild);
        }
        q.options.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option;
            quizOptions.appendChild(button);
        });
        updateQuizScore();
    }

    quizOptions.addEventListener('click', e => {
        if(e.target.tagName === 'BUTTON'){
            const q = quizQuestions[currentQuizQuestionIndex];
            checkQuizAnswer(e.target, e.target.textContent, q.correctAnswer);
        }
    });

    function checkQuizAnswer(button, selected, correct) {
        score.total++;
        quizOptions.querySelectorAll('button').forEach(btn => {
            btn.disabled = true;
            if (normalizeText(btn.textContent) === normalizeText(correct)) btn.classList.add('correct');
        });
        const selectedNorm = normalizeText(selected);
        const correctNorm = normalizeText(correct);
        if (selectedNorm === correctNorm) {
            score.correct++;
            button.classList.add('correct');
            updateSkill('speed', 5); // XP Speed
            updateSkill('memory', 2); // XP Memory
        } else {
            button.classList.add('incorrect');
        }
        updateQuizScore();
        setTimeout(() => { currentQuizQuestionIndex++; displayQuizQuestion(); }, 1200);
    }

    const updateQuizScore = () => quizScore.textContent = `Score: ${score.correct} / ${score.total}`;

    // --- Hangman Game ---
    function startHangmanGame() {
        const availableVocab = vocab.filter(v => !masteredWords.has(v[0]));
        if (!availableVocab.length) {
            hangmanWordDiv.textContent = "Aucun mot disponible.";
            return;
        }
        [hangmanCorrectAnswer] = availableVocab[Math.floor(Math.random() * availableVocab.length)];
        hangmanCorrectAnswer = hangmanCorrectAnswer.toUpperCase();
        guessedLetters.clear();
        errors = 0;
        hangmanParts.forEach(p => p.style.display = 'none');
        displayHangmanWord();
        generateHangmanLetters();
    }

    const displayHangmanWord = () => hangmanWordDiv.textContent = hangmanCorrectAnswer.split('').map(l => (guessedLetters.has(l) || !/[A-Z]/.test(l) ? l : '_')).join(' ');
    const generateHangmanLetters = () => {
        while (hangmanLettersDiv.firstChild) {
            hangmanLettersDiv.removeChild(hangmanLettersDiv.firstChild);
        }
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(l => {
            const button = document.createElement('button');
            button.textContent = l;
            hangmanLettersDiv.appendChild(button);
        });
    };

    hangmanLettersDiv.addEventListener('click', e => {
        if(e.target.tagName === 'BUTTON' && !e.target.disabled) handleGuess(e.target.textContent, e.target);
    });

    function handleGuess(letter, button) {
        button.disabled = true;
        guessedLetters.add(letter);
        if (hangmanCorrectAnswer.includes(letter)) {
            displayHangmanWord();
            updateSkill('precision', 1); // Small XP per letter
            if (!hangmanWordDiv.textContent.includes('_')) endHangmanGame(true);
        } else {
            errors++;
            if (errors < hangmanParts.length) hangmanParts[errors - 1].style.display = 'block';
            if (errors === hangmanParts.length) endHangmanGame(false);
        }
    }

    const endHangmanGame = (won) => {
        if(won) updateSkill('precision', 10); // Bonus for win
        displayAlert(won ? "Gagné!" : `Perdu! Le mot était ${hangmanCorrectAnswer}`, won ? 'var(--correct-color)' : 'var(--incorrect-color)');
        setTimeout(() => { hideAlert(); startHangmanGame(); }, 2000);
    };

    // --- Scramble & Dictation ---
    const setupInputGame = (mode) => {
        const availableVocab = vocab.filter(v => !masteredWords.has(v[0]));
        if (!availableVocab.length) {
            if(mode === 'scramble') scrambleWordDiv.textContent = "Aucun mot disponible.";
            else dictationClueDiv.textContent = "Aucun mot disponible.";
            return;
        }
        const [word, clue] = availableVocab[Math.floor(Math.random() * availableVocab.length)];
        currentWord = word;
        const elements = mode === 'scramble' ?
            { wordDiv: scrambleWordDiv, clueDiv: scrambleClueDiv, input: scrambleInput, feedback: scrambleFeedbackDiv, checkBtn: scrambleCheckBtn, nextBtn: scrambleNextBtn } :
            { clueDiv: dictationClueDiv, input: dictationInput, feedback: dictationFeedbackDiv, checkBtn: dictationCheckBtn, nextBtn: dictationNextBtn };

        if(elements.wordDiv) elements.wordDiv.textContent = shuffleArray(word.split('')).join(' ');
        elements.clueDiv.textContent = clue;
        elements.input.value = '';
        elements.feedback.textContent = '';
        elements.checkBtn.style.display = 'inline-block';
        elements.nextBtn.style.display = 'none';
    }

    const checkAnswer = (mode) => {
        const elements = mode === 'scramble' ?
            { input: scrambleInput, feedback: scrambleFeedbackDiv, checkBtn: scrambleCheckBtn, nextBtn: scrambleNextBtn } :
            { input: dictationInput, feedback: dictationFeedbackDiv, checkBtn: dictationCheckBtn, nextBtn: dictationNextBtn };
        const userAnswer = elements.input.value;
        const expected = normalizeText(currentWord);
        const given = normalizeText(userAnswer);

        let isCorrect = false;
        if (expected === given) {
            isCorrect = true;
        } else {
            const dist = levenshtein(expected, given);
            // Threshold: allow small typos (relative to word length)
            const threshold = expected.length <= 4 ? 1 : Math.max(1, Math.floor(expected.length * 0.15));
            if (dist <= threshold) isCorrect = true;
        }

        elements.feedback.textContent = isCorrect ? 'Correct!' : `Faux, le mot était : ${currentWord}`;
        elements.feedback.style.color = isCorrect ? 'var(--correct-color)' : 'var(--incorrect-color)';

        if(isCorrect) {
            if(mode === 'scramble') updateSkill('logic', 8);
            else updateSkill('precision', 10);
        }

        elements.checkBtn.style.display = 'none';
        elements.nextBtn.style.display = 'inline-block';
    }

    const startScrambleGame = () => setupInputGame('scramble');
    const startDictationGame = () => {
        setupInputGame('dictation');
        // Focus input for keyboard users on PC
        try { dictationInput.focus(); dictationInput.select(); } catch(e) { /* ignore if element missing */ }
    };
    scrambleCheckBtn.addEventListener('click', () => checkAnswer('scramble'));
    dictationCheckBtn.addEventListener('click', () => checkAnswer('dictation'));
    scrambleNextBtn.addEventListener('click', startScrambleGame);
    dictationNextBtn.addEventListener('click', startDictationGame);

    // Keyboard support for dictation: Enter = check / next, Esc = skip (next)
    dictationInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            // If next button is visible, go to next; otherwise check answer
            if (dictationNextBtn.style.display && dictationNextBtn.style.display !== 'none') {
                startDictationGame();
            } else {
                checkAnswer('dictation');
            }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            // Skip to next word
            startDictationGame();
        }
    });

    // --- Match Game ---
    function startMatchGame() {
        const availableVocab = vocab.filter(v => !masteredWords.has(v[0]));
        if(availableVocab.length < MATCH_COUNT) {
            wordsColumn.textContent = 'Pas assez de mots';
            while (definitionsColumn.firstChild) {
                definitionsColumn.removeChild(definitionsColumn.firstChild);
            }
            return;
        }
        matchPairs = shuffleArray([...availableVocab]).slice(0, MATCH_COUNT);
        const words = shuffleArray(matchPairs.map(p => p[0]));
        const defs = shuffleArray(matchPairs.map(p => p[1]));

        while (wordsColumn.firstChild) {
            wordsColumn.removeChild(wordsColumn.firstChild);
        }
        words.forEach(w => {
            const div = document.createElement('div');
            div.className = 'match-item';
            div.dataset.type = 'word';
            div.textContent = w;
            wordsColumn.appendChild(div);
        });

        while (definitionsColumn.firstChild) {
            definitionsColumn.removeChild(definitionsColumn.firstChild);
        }
        defs.forEach(d => {
            const div = document.createElement('div');
            div.className = 'match-item';
            div.dataset.type = 'def';
            div.textContent = d;
            definitionsColumn.appendChild(div);
        });

        matchNextBtn.style.display = 'none';
        updateMatchScore(0);
    }

    const updateMatchScore = (count) => matchScoreSpan.textContent = `Paires : ${count} / ${MATCH_COUNT}`;

    document.getElementById('matchGrid').addEventListener('click', e => {
        const item = e.target;
        if(!item.classList.contains('match-item') || item.classList.contains('matched')) return;

        const type = item.dataset.type;
        if(selected[type]) selected[type].classList.remove('selected');
        selected[type] = item;
        item.classList.add('selected');

        if(selected.word && selected.def){
            const word = selected.word.textContent;
            const def = selected.def.textContent;
            const isMatch = matchPairs.some(p => normalizeText(p[0]) === normalizeText(word) && normalizeText(p[1]) === normalizeText(def));

            if(isMatch){
                selected.word.classList.add('matched');
                selected.def.classList.add('matched');
                updateSkill('logic', 3); // XP Logic per match
                const matchedCount = document.querySelectorAll('.match-item.matched').length / 2;
                updateMatchScore(matchedCount);
                if(matchedCount === MATCH_COUNT) matchNextBtn.style.display = 'block';
            } else {
                // Capture references so the timeout can remove classes even after `selected` is reset
                const wEl = selected.word;
                const dEl = selected.def;
                if (wEl) wEl.classList.add('error');
                if (dEl) dEl.classList.add('error');
                setTimeout(() => {
                    if (wEl) wEl.classList.remove('error');
                    if (dEl) dEl.classList.remove('error');
                }, 500);
            }
            if (selected.word) selected.word.classList.remove('selected');
            if (selected.def) selected.def.classList.remove('selected');
            selected = {word: null, def: null};
        }
    });

    matchNextBtn.addEventListener('click', startMatchGame);

    // --- Init ---
    Object.keys(modeButtons).forEach(mode => {
        modeButtons[mode].addEventListener('click', () => showGameContainer(mode));
    });
    
    initSelectors();
    // Initialize stats (global) until a chapter is selected
    loadChapterStats(null);
    updateMasteredList(); // Initial population of the mastered list
    showGameContainer('flashcard');
});
