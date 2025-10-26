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
        quiz: document.getElementById('quizModeBtn'),
        hangman: document.getElementById('hangmanModeBtn'),
        scramble: document.getElementById('scrambleModeBtn'),
        dictation: document.getElementById('dictationModeBtn'),
        match: document.getElementById('matchModeBtn'),
    };

    const gameContainers = {
        flashcard: document.getElementById('flashcardGameContainer'),
        quiz: document.getElementById('quizGameContainer'),
        hangman: document.getElementById('hangmanGameContainer'),
        scramble: document.getElementById('scrambleGameContainer'),
        dictation: document.getElementById('dictationGameContainer'),
        match: document.getElementById('matchGameContainer'),
    };

    const chapterSelectorDiv = document.getElementById('chapterSelector');
    const categoryModal = document.getElementById('categoryModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalButtons = document.getElementById('modalButtons');

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


    // --- Utility ---
    const shuffleArray = (arr) => arr.sort(() => Math.random() - 0.5);
    const displayAlert = (message, color) => {
        alertMessageDiv.textContent = message;
        alertMessageDiv.style.backgroundColor = color;
        alertMessageDiv.style.display = 'block';
    };
    const hideAlert = () => alertMessageDiv.style.display = 'none';

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
            flashcard: startFlashcardGame, quiz: startQuizGame, hangman: startHangmanGame,
            scramble: startScrambleGame, dictation: startDictationGame, match: startMatchGame,
        };
        if(startFunctions[mode]) startFunctions[mode]();
    };

    // --- Chapter & Vocab Data ---
    function generateChapterButtons() {
        chapterSelectorDiv.innerHTML = '';
        Object.entries(ALL_VOCAB_DATA).forEach(([key, chapter]) => {
            const button = document.createElement('button');
            button.id = chapter.selectorId;
            button.textContent = chapter.title;
            button.addEventListener('click', () => openCategoryModal(key, chapter));
            chapterSelectorDiv.appendChild(button);
        });
    }

    function openCategoryModal(chapterKey, chapter) {
        document.querySelectorAll('.chapter-selector button').forEach(btn => btn.classList.remove('active'));
        document.getElementById(chapter.selectorId)?.classList.add('active');
        modalTitle.textContent = `Choisir la section pour ${chapter.title}`;
        modalButtons.innerHTML = '';
        Object.entries(chapter.subcategories).forEach(([subKey, sub]) => {
            const button = document.createElement('button');
            button.textContent = sub.name;
            button.style.backgroundColor = sub.color;
            button.onclick = () => { changeVocabulary(chapterKey, subKey); categoryModal.style.display = 'none'; };
            modalButtons.appendChild(button);
        });
        categoryModal.style.display = 'flex';
    }

    function changeVocabulary(chapterKey, subcategoryKey) {
        const sub = ALL_VOCAB_DATA[chapterKey].subcategories[subcategoryKey];
        vocab = sub.data;
        listTitle.textContent = `${ALL_VOCAB_DATA[chapterKey].title} - ${sub.name}`;
        fullVocabularyList.innerHTML = vocab.map(v => `<li>${v[0]} - ${v[1]}</li>`).join('');
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
        wordH2.textContent = word;
        backFaceP.textContent = definition;
        wordTypeSpan.textContent = type || 'voc';
        flashcard.classList.remove('flipped');
        updateFlashcardUI();
    }

    function handleFeedback(known) {
        const currentWord = shuffledVocab[currentCardIndex][0];
        if (known) {
            masteredWords.add(currentWord);
        }
        setTimeout(() => {
            currentCardIndex++;
            if (currentCardIndex >= shuffledVocab.length) {
                startFlashcardGame();
            } else {
                displayCard();
            }
            flashcard.classList.remove('flipped');
        }, 400);
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
    knewItBtn.addEventListener('click', () => handleFeedback(false)); // Knew it is not mastering
    didntKnowBtn.addEventListener('click', () => handleFeedback(false));
    masteredBtn.addEventListener('click', () => {
        const word = shuffledVocab[currentCardIndex][0];
        masteredWords.add(word);
        updateMasteredList();
        handleFeedback(false); // Move to next card, dont remove from current session
    });

    // --- Mastered Words Management ---
    function updateMasteredList() {
        masteredVocabularyList.innerHTML = '';
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
                startGame(currentMode); // Refresh game
            };
            li.appendChild(deleteBtn);
            masteredVocabularyList.appendChild(li);
        });
        localStorage.setItem('masteredWords', JSON.stringify(masteredArray));
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
            quizOptions.innerHTML = '';
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
            quizOptions.innerHTML = `<button onclick="startGame('quiz')">Recommencer</button>`;
            return;
        }
        const q = quizQuestions[currentQuizQuestionIndex];
        quizQuestion.textContent = q.question;
        quizOptions.innerHTML = q.options.map(option => `<button>${option}</button>`).join('');
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
            if(btn.textContent === correct) btn.classList.add('correct');
        });
        if (selected === correct) {
            score.correct++;
            button.classList.add('correct');
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
    const generateHangmanLetters = () => hangmanLettersDiv.innerHTML = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => `<button>${l}</button>`).join('');

    hangmanLettersDiv.addEventListener('click', e => {
        if(e.target.tagName === 'BUTTON' && !e.target.disabled) handleGuess(e.target.textContent, e.target);
    });

    function handleGuess(letter, button) {
        button.disabled = true;
        guessedLetters.add(letter);
        if (hangmanCorrectAnswer.includes(letter)) {
            displayHangmanWord();
            if (!hangmanWordDiv.textContent.includes('_')) endHangmanGame(true);
        } else {
            errors++;
            if (errors < hangmanParts.length) hangmanParts[errors - 1].style.display = 'block';
            if (errors === hangmanParts.length) endHangmanGame(false);
        }
    }

    const endHangmanGame = (won) => {
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

        const isCorrect = elements.input.value.trim().toLowerCase() === currentWord.toLowerCase();
        elements.feedback.textContent = isCorrect ? 'Correct!' : `Faux, le mot était : ${currentWord}`;
        elements.feedback.style.color = isCorrect ? 'var(--correct-color)' : 'var(--incorrect-color)';
        elements.checkBtn.style.display = 'none';
        elements.nextBtn.style.display = 'inline-block';
    }

    const startScrambleGame = () => setupInputGame('scramble');
    const startDictationGame = () => setupInputGame('dictation');
    scrambleCheckBtn.addEventListener('click', () => checkAnswer('scramble'));
    dictationCheckBtn.addEventListener('click', () => checkAnswer('dictation'));
    scrambleNextBtn.addEventListener('click', startScrambleGame);
    dictationNextBtn.addEventListener('click', startDictationGame);

    // --- Match Game ---
    function startMatchGame() {
        const availableVocab = vocab.filter(v => !masteredWords.has(v[0]));
        if(availableVocab.length < MATCH_COUNT) {
            wordsColumn.innerHTML = 'Pas assez de mots';
            definitionsColumn.innerHTML = '';
            return;
        }
        matchPairs = shuffleArray([...availableVocab]).slice(0, MATCH_COUNT);
        const words = shuffleArray(matchPairs.map(p => p[0]));
        const defs = shuffleArray(matchPairs.map(p => p[1]));

        wordsColumn.innerHTML = words.map(w => `<div class="match-item" data-type="word">${w}</div>`).join('');
        definitionsColumn.innerHTML = defs.map(d => `<div class="match-item" data-type="def">${d}</div>`).join('');
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
            const isMatch = matchPairs.some(p => p[0] === word && p[1] === def);

            if(isMatch){
                selected.word.classList.add('matched');
                selected.def.classList.add('matched');
                const matchedCount = document.querySelectorAll('.match-item.matched').length / 2;
                updateMatchScore(matchedCount);
                if(matchedCount === MATCH_COUNT) matchNextBtn.style.display = 'block';
            } else {
                selected.word.classList.add('error');
                selected.def.classList.add('error');
                setTimeout(() => {
                    selected.word.classList.remove('error');
                    selected.def.classList.remove('error');
                }, 500);
            }
            selected.word.classList.remove('selected');
            selected.def.classList.remove('selected');
            selected = {word: null, def: null};
        }
    });

    matchNextBtn.addEventListener('click', startMatchGame);

    // --- Init ---
    Object.keys(modeButtons).forEach(mode => {
        modeButtons[mode].addEventListener('click', () => showGameContainer(mode));
    });
    
    generateChapterButtons();
    updateMasteredList(); // Initial population of the mastered list
    showGameContainer('flashcard');
});
