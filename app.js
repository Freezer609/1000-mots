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
    const statsModal = document.getElementById('statsModal');
    const closeModal = statsModal.querySelector('.close-modal');

    function openStats() {
        updateStatsUI();
        statsModal.style.display = 'flex';
        // Slight delay to allow display:flex to apply before adding class for transition
        setTimeout(() => {
            statsModal.classList.add('show');
        }, 10);
    }
    
    function closeStats() {
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

    // Stats modal controls: reset + export
    const resetChapterStatsBtn = document.getElementById('resetChapterStatsBtn');
    const exportChapterStatsBtn = document.getElementById('exportChapterStatsBtn');
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
        const colors = ['#FF4D4F','#FFB400','#36CFC9','#5C7CFA','#00C853','#FF6B6B'];
        const container = document.createDocumentFragment();
        const flashRect = flashcard.getBoundingClientRect();
        const centerX = flashRect.left + flashRect.width / 2;
        const centerY = flashRect.top + flashRect.height / 2;
        for (let i = 0; i < 18; i++) {
            const el = document.createElement('div');
            el.className = 'confetti-piece';
            const color = colors[Math.floor(Math.random() * colors.length)];
            el.style.background = color;
            el.style.left = `${centerX}px`;
            el.style.top = `${centerY}px`;
            el.style.transform = `translate(${(Math.random() - 0.5) * 80}px, ${-20 - Math.random() * 60}px) rotate(${Math.random() * 360}deg)`;
            document.body.appendChild(el);
            // animate using CSS; remove after duration
            setTimeout(() => { if (el && el.parentNode) el.remove(); }, 1400 + Math.random() * 400);
        }
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
        const consecHtml = consecCount > 0 ? ` <span class="consec-badge">${consecCount}/5</span>` : '';
        if (isFacultative) {
            wordTypeSpan.innerHTML = `${type || 'voc'} <span class="facultative-badge">Facultative</span>${consecHtml}`;
        } else {
            wordTypeSpan.innerHTML = `${type || 'voc'}${consecHtml}`;
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
        if (next >= 5) {
            // mark mastered
            masteredWords.add(word);
            updateMasteredList();
            updateSkill('memory', 10); // bonus XP
            activeStats.consecutiveKnown[key] = 0; // reset counter
            saveStats();
            displayAlert(`${word} maîtrisé !`, 'var(--correct-color)');
            try { launchConfetti(); } catch(e) {}
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
        try { launchConfetti(); } catch(e) {}
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
