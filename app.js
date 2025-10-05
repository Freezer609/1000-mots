const gameContainers = document.querySelectorAll('.game-container');
const modeButtons = document.querySelectorAll('.mode-btn');

const chapterModal = document.getElementById('chapterModal');
const chapterSelectBtn = document.getElementById('chapterSelectBtn');
const chapterButtonsDiv = document.getElementById('chapterButtons');
const closeModalBtn = chapterModal.querySelector('.close-btn');

const alertBanner = document.getElementById('alert-banner');

let vocab = [];
let vocabPairs = [];
let currentChapterKey = null;
let currentSubKey = null;
let currentAlert = null;
let currentMode = 'flashcards';

function changeVocabulary(chapterKey, subKey) {
    if (!ALL_VOCAB_DATA[chapterKey] || !ALL_VOCAB_DATA[chapterKey].subcategories[subKey]) {
        console.error('Vocabulaire introuvable');
        return;
    }
    
    currentChapterKey = chapterKey;
    currentSubKey = subKey;
    const selectedData = ALL_VOCAB_DATA[chapterKey].subcategories[subKey];
    
    vocab = selectedData.data;
    vocabPairs = vocab.map(pair => ({ word: pair[0], definition: pair[1] }));

    currentAlert = selectedData.alert;
    
    document.getElementById('flashcardWord').textContent = `Chargé : ${selectedData.name}`;
    document.querySelector('.subtitle').textContent = `Révision de Vocabulaire - ${ALL_VOCAB_DATA[chapterKey].title} (${selectedData.name})`;
    
    hideModal();
    showMode(currentMode);
    
    if (currentMode === 'list') {
        generateList();
    }
    
    updateAlert();
}

function updateAlert() {
    if (currentAlert && currentAlert.message) {
        alertBanner.textContent = currentAlert.message;
        alertBanner.style.backgroundColor = currentAlert.color || '#F44336';
        alertBanner.style.display = 'block';
    } else {
        hideAlert();
    }
}

function hideAlert() {
    alertBanner.style.display = 'none';
}

function showMode(mode) {
    currentMode = mode;
    gameContainers.forEach(container => {
        container.style.display = 'none';
    });

    // Masquer tous les boutons Next/Check par défaut
    document.querySelectorAll('.nav-btn, #scrambleCheckBtn, #dictationCheckBtn').forEach(btn => btn.style.display = 'none');
    
    switch (mode) {
        case 'flashcards':
            document.getElementById('flashcardGameContainer').style.display = 'flex';
            startFlashcards();
            break;
        case 'quiz':
            document.getElementById('quizGameContainer').style.display = 'flex';
            startQuizGame();
            break;
        case 'hangman':
            document.getElementById('hangmanGameContainer').style.display = 'flex';
            startHangmanGame();
            break;
        case 'scramble':
            document.getElementById('scrambleGameContainer').style.display = 'flex';
            startScrambleGame();
            break;
        case 'dictation':
            document.getElementById('dictationGameContainer').style.display = 'flex';
            startDictationGame();
            break;
        case 'match':
            document.getElementById('matchGameContainer').style.display = 'flex';
            startMatchGame();
            break;
        case 'list':
            document.getElementById('vocabularyListContainer').style.display = 'flex';
            generateList();
            break;
    }
}

modeButtons.forEach(button => {
    button.addEventListener('click', () => {
        const mode = button.getAttribute('data-mode');
        if (mode) {
            if (vocab.length === 0 && mode !== 'list') {
                alert("Veuillez d'abord sélectionner un chapitre.");
                return;
            }
            showMode(mode);
        }
    });
});

// Fonctions Modales
function showModal(content) {
    chapterButtonsDiv.innerHTML = content;
    chapterModal.style.display = 'block';
}

function hideModal() {
    chapterModal.style.display = 'none';
}

closeModalBtn.addEventListener('click', hideModal);

window.onclick = function(event) {
    if (event.target == chapterModal) {
        hideModal();
    }
}

chapterSelectBtn.addEventListener('click', () => {
    generateChapterButtons();
    chapterModal.style.display = 'block';
});

// Génération des boutons de Chapitre
function generateChapterButtons() {
    chapterButtonsDiv.innerHTML = '';
    const chapters = Object.keys(ALL_VOCAB_DATA);

    chapters.forEach(chapterKey => {
        const chapterData = ALL_VOCAB_DATA[chapterKey];
        const chapterTitle = document.createElement('h3');
        chapterTitle.textContent = chapterData.title;
        chapterButtonsDiv.appendChild(chapterTitle);

        const subcategoryDiv = document.createElement('div');
        const subcategories = Object.keys(chapterData.subcategories);

        subcategories.forEach(subKey => {
            const subData = chapterData.subcategories[subKey];
            const subButton = document.createElement('button');
            subButton.classList.add('subcategory-btn');
            subButton.textContent = subData.name;
            subButton.style.backgroundColor = subData.color || '#BB86FC';
            subButton.addEventListener('click', () => changeVocabulary(chapterKey, subKey));
            subcategoryDiv.appendChild(subButton);
        });
        chapterButtonsDiv.appendChild(subcategoryDiv);
    });
}

// Fonction utilitaire de mélange (Fisher-Yates)
function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}

// Fonction utilitaire pour retirer les accents
function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}


// --- 1. Flashcards Logic ---
const flashcardDiv = document.getElementById('flashcard');
const flashcardWordSpan = document.getElementById('flashcardWord');
const flashcardDefSpan = document.getElementById('flashcardDef');
const flashcardNextBtn = document.getElementById('flashcardNextBtn');
const flashcardControls = document.getElementById('flashcardControls');
const feedbackBtns = document.querySelectorAll('.feedback-btn');

let currentCardIndex = 0;
let shuffledVocab = [];
let wordsToReview = []; 

function startFlashcards() {
    shuffledVocab = shuffle([...vocab]);
    wordsToReview = [];
    currentCardIndex = 0;
    displayFlashcard();
}

function displayFlashcard() {
    flashcardDiv.classList.remove('flipped');
    flashcardControls.style.display = 'none';

    if (shuffledVocab.length === 0) {
        if (wordsToReview.length > 0) {
            shuffledVocab = wordsToReview;
            wordsToReview = [];
            shuffle(shuffledVocab);
            currentCardIndex = 0;
            flashcardWordSpan.textContent = "Passons aux mots difficiles (révision)...";
            setTimeout(displayFlashcard, 1500);
            return;
        } else {
            flashcardWordSpan.textContent = "Fin des cartes ! Bien joué.";
            flashcardDefSpan.textContent = "";
            flashcardDiv.onclick = null;
            return;
        }
    }

    const currentPair = shuffledVocab[currentCardIndex];
    flashcardWordSpan.textContent = currentPair[0];
    flashcardDefSpan.textContent = currentPair[1];

    flashcardDiv.onclick = () => {
        flashcardDiv.classList.add('flipped');
        flashcardControls.style.display = 'flex';
    };
}

function handleFeedback(isCorrect) {
    const currentPair = shuffledVocab[currentCardIndex];
    if (!isCorrect) {
        wordsToReview.push(currentPair); 
    }
    
    currentCardIndex++;
    if (currentCardIndex < shuffledVocab.length) {
        displayFlashcard();
    } else {
        shuffledVocab = []; 
        displayFlashcard(); 
    }
}

feedbackBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const feedback = e.currentTarget.getAttribute('data-feedback');
        handleFeedback(feedback === 'correct');
    });
});

flashcardNextBtn.addEventListener('click', () => {
    currentCardIndex++;
    if (currentCardIndex < shuffledVocab.length) {
        displayFlashcard();
    } else {
        shuffledVocab = [];
        displayFlashcard();
    }
});


// --- 2. Quiz Game Logic ---
const quizOptionsDiv = document.getElementById('quiz-options');
const quizQuestionP = document.getElementById('quiz-question');
const quizNextBtn = document.getElementById('quizNextBtn');
const quizProgressP = document.getElementById('quiz-progress');
const quizScoreP = document.getElementById('quiz-score');

let quizPairs = [];
let currentQuizIndex = 0;
let quizScore = 0;
const QUIZ_LENGTH = 10;

function generateQuizOptions(correctPair) {
    const options = [correctPair];
    const pool = vocabPairs.filter(p => p.word !== correctPair.word);
    
    shuffle(pool);

    for (let i = 0; options.length < 4 && i < pool.length; i++) {
        options.push(pool[i]);
    }
    
    shuffle(options);
    
    return options;
}

function displayQuizQuestion() {
    quizOptionsDiv.innerHTML = '';
    
    if (currentQuizIndex >= QUIZ_LENGTH) {
        quizQuestionP.textContent = `Partie terminée ! Score final : ${quizScore} / ${QUIZ_LENGTH}`;
        quizProgressP.textContent = `Score total : ${quizScore}`;
        quizNextBtn.style.display = 'none';
        return;
    }

    const currentPair = quizPairs[currentQuizIndex];
    quizQuestionP.textContent = `Quelle est la définition de : "${currentPair.word}" ?`;
    quizProgressP.textContent = `Question ${currentQuizIndex + 1} / ${QUIZ_LENGTH}`;
    quizScoreP.textContent = `Score : ${quizScore}`;
    quizNextBtn.style.display = 'none';

    const options = generateQuizOptions(currentPair);

    options.forEach(option => {
        const button = document.createElement('button');
        button.classList.add('quiz-option-btn');
        button.textContent = option.definition;
        button.addEventListener('click', () => checkQuizAnswer(button, option, currentPair));
        quizOptionsDiv.appendChild(button);
    });
}

function checkQuizAnswer(button, selectedOption, correctPair) {
    const buttons = quizOptionsDiv.querySelectorAll('.quiz-option-btn');
    buttons.forEach(btn => btn.classList.add('disabled'));
    
    if (selectedOption.word === correctPair.word) {
        button.classList.add('correct');
        quizScore++;
        quizScoreP.textContent = `Score : ${quizScore}`;
    } else {
        button.classList.add('incorrect');
        // Trouver et marquer la bonne réponse
        buttons.forEach(btn => {
            if (btn.textContent === correctPair.definition) {
                btn.classList.add('correct');
            }
        });
    }

    quizNextBtn.style.display = 'block';
}

function startQuizGame() {
    if (vocabPairs.length < 4) {
        quizQuestionP.textContent = "Besoin d'au moins 4 mots pour un Quiz !";
        quizProgressP.textContent = "";
        return;
    }
    
    currentQuizIndex = 0;
    quizScore = 0;
    // Sélectionner au hasard QUIZ_LENGTH paires pour le quiz
    let shuffledForQuiz = shuffle([...vocabPairs]);
    quizPairs = shuffledForQuiz.slice(0, QUIZ_LENGTH);
    
    displayQuizQuestion();
}

quizNextBtn.addEventListener('click', () => {
    currentQuizIndex++;
    displayQuizQuestion();
});


// --- 3. Hangman Game Logic ---
const hangmanWordP = document.getElementById('hangman-word');
const hangmanHintP = document.getElementById('hangman-hint');
const hangmanGuessesP = document.getElementById('hangman-guesses');
const hangmanKeyboardDiv = document.getElementById('hangman-keyboard');
const hangmanMessageP = document.getElementById('hangman-message');
const hangmanNextBtn = document.getElementById('hangmanNextBtn');

const MAX_GUESSES = 6;
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

let hangmanWordPair = null;
let wordToGuess = '';
let guessedLetters = new Set();
let remainingGuesses = MAX_GUESSES;
let availableHangmanWords = [];

function generateKeyboard() {
    hangmanKeyboardDiv.innerHTML = '';
    ALPHABET.split('').forEach(letter => {
        const button = document.createElement('button');
        button.classList.add('key-btn');
        button.textContent = letter;
        button.addEventListener('click', () => handleGuess(letter, button));
        hangmanKeyboardDiv.appendChild(button);
    });
}

function displayHangmanWord() {
    let display = '';
    for (const char of wordToGuess) {
        if (char === ' ' || char === '-') {
            display += char;
        } else if (guessedLetters.has(char)) {
            display += char;
        } else {
            display += '_';
        }
    }
    hangmanWordP.textContent = display.split('').join(' ');
    return display.replace(/ /g, '');
}

function updateHangmanGame() {
    const displayedWord = displayHangmanWord();
    hangmanGuessesP.textContent = `Essais restants : ${remainingGuesses}`;
    
    if (displayedWord === wordToGuess.replace(/ /g, '')) {
        hangmanMessageP.textContent = `Gagné ! Le mot était "${hangmanWordPair.word}".`;
        endHangmanGame(true);
    } else if (remainingGuesses <= 0) {
        hangmanMessageP.textContent = `Perdu ! Le mot était "${hangmanWordPair.word}".`;
        endHangmanGame(false);
    } else {
        hangmanMessageP.textContent = '';
    }
}

function handleGuess(letter, button) {
    if (button.classList.contains('disabled')) return;

    button.classList.add('disabled');
    guessedLetters.add(letter);

    if (wordToGuess.includes(letter)) {
        // Correct guess
        // Aucune pénalité, la mise à jour gère la victoire
    } else {
        // Incorrect guess
        remainingGuesses--;
    }
    
    updateHangmanGame();
}

function endHangmanGame(isWin) {
    hangmanKeyboardDiv.querySelectorAll('.key-btn').forEach(btn => btn.classList.add('disabled'));
    hangmanNextBtn.style.display = 'block';
}

function startHangmanGame() {
    if (vocabPairs.length === 0) {
        hangmanHintP.textContent = "Veuillez sélectionner un chapitre.";
        hangmanWordP.textContent = "";
        return;
    }
    
    if (availableHangmanWords.length === 0) {
        availableHangmanWords = shuffle([...vocabPairs]);
    }
    
    if (availableHangmanWords.length === 0) {
        hangmanHintP.textContent = "Toutes les cartes ont été jouées !";
        hangmanWordP.textContent = "";
        hangmanNextBtn.style.display = 'none';
        return;
    }
    
    hangmanWordPair = availableHangmanWords.pop();
    // Utiliser le mot en majuscules sans accents pour le jeu
    wordToGuess = removeAccents(hangmanWordPair.word).toUpperCase(); 
    
    guessedLetters = new Set();
    remainingGuesses = MAX_GUESSES;

    hangmanHintP.textContent = `Définition : ${hangmanWordPair.definition}`;
    hangmanMessageP.textContent = '';
    hangmanNextBtn.style.display = 'none';

    generateKeyboard(); 
    updateHangmanGame();
}

hangmanNextBtn.addEventListener('click', startHangmanGame);


// --- 4. Scramble Game Logic ---
const scrambleHintP = document.getElementById('scramble-hint');
const scrambleScrambledP = document.getElementById('scramble-scrambled');
const scrambleInput = document.getElementById('scramble-input');
const scrambleMessageP = document.getElementById('scramble-message');
const scrambleCheckBtn = document.getElementById('scrambleCheckBtn');
const scrambleNextBtn = document.getElementById('scrambleNextBtn');

let scrambleWordPair = null;
let availableScrambleWords = [];

function scrambleWord(word) {
    // Nettoyer et mettre en majuscule, puis mélanger
    let chars = removeAccents(word).toUpperCase().split('');
    shuffle(chars);
    return chars.join('');
}

function displayScramble() {
    if (availableScrambleWords.length === 0) {
        scrambleHintP.textContent = "Toutes les cartes ont été jouées !";
        scrambleScrambledP.textContent = "";
        scrambleInput.style.display = 'none';
        scrambleCheckBtn.style.display = 'none';
        scrambleNextBtn.style.display = 'none';
        return;
    }
    
    scrambleWordPair = availableScrambleWords.pop();
    
    scrambleHintP.textContent = `Définition : ${scrambleWordPair.definition}`;
    scrambleScrambledP.textContent = scrambleWord(scrambleWordPair.word).split('').join(' ');
    scrambleInput.value = '';
    scrambleMessageP.textContent = '';
    
    scrambleInput.style.display = 'block';
    scrambleCheckBtn.style.display = 'block';
    scrambleNextBtn.style.display = 'none';
}

function checkScrambleAnswer() {
    const userInput = removeAccents(scrambleInput.value).toUpperCase().trim();
    const correctWord = removeAccents(scrambleWordPair.word).toUpperCase().trim();
    
    if (userInput === correctWord) {
        scrambleMessageP.textContent = `Correct ! Le mot était : ${scrambleWordPair.word}`;
        scrambleMessageP.style.color = 'var(--color-correct)';
    } else {
        scrambleMessageP.textContent = `Faux. Le mot correct était : ${scrambleWordPair.word}`;
        scrambleMessageP.style.color = 'var(--color-incorrect)';
    }
    
    scrambleCheckBtn.style.display = 'none';
    scrambleNextBtn.style.display = 'block';
}

function startScrambleGame() {
    if (vocabPairs.length === 0) {
        scrambleHintP.textContent = "Veuillez sélectionner un chapitre.";
        scrambleScrambledP.textContent = "";
        return;
    }
    
    availableScrambleWords = shuffle([...vocabPairs]);
    displayScramble();
}

scrambleCheckBtn.addEventListener('click', checkScrambleAnswer);
scrambleNextBtn.addEventListener('click', displayScramble);


// --- 5. Dictation Game Logic ---
const dictationDefinitionP = document.getElementById('dictation-definition');
const dictationInput = document.getElementById('dictation-input');
const dictationMessageP = document.getElementById('dictation-message');
const dictationCheckBtn = document.getElementById('dictationCheckBtn');
const dictationNextBtn = document.getElementById('dictationNextBtn');

let dictationWordPair = null;
let availableDictationWords = [];

function displayDictation() {
    if (availableDictationWords.length === 0) {
        dictationDefinitionP.textContent = "Toutes les cartes ont été jouées !";
        dictationInput.style.display = 'none';
        dictationCheckBtn.style.display = 'none';
        dictationNextBtn.style.display = 'none';
        return;
    }
    
    dictationWordPair = availableDictationWords.pop();
    
    dictationDefinitionP.textContent = `Définition : ${dictationWordPair.definition}`;
    dictationInput.value = '';
    dictationMessageP.textContent = '';
    
    dictationInput.style.display = 'block';
    dictationCheckBtn.style.display = 'block';
    dictationNextBtn.style.display = 'none';
}

function checkDictationAnswer() {
    const userAnswer = dictationInput.value.trim();
    const correctWord = dictationWordPair.word.trim();
    
    // Vérification stricte
    if (userAnswer === correctWord) {
        dictationMessageP.textContent = `Correct ! (${correctWord})`;
        dictationMessageP.style.color = 'var(--color-correct)';
    } else {
        // Vérification avec normalisation (si l'utilisateur a mis des majuscules ou des accents différents)
        const normalizedUser = removeAccents(userAnswer).toUpperCase();
        const normalizedCorrect = removeAccents(correctWord).toUpperCase();
        
        if (normalizedUser === normalizedCorrect) {
            dictationMessageP.textContent = `Orthographe incorrecte : "${userAnswer}". Le mot correct est : "${correctWord}"`;
        } else {
            dictationMessageP.textContent = `Faux. Le mot correct était : "${correctWord}"`;
        }
        dictationMessageP.style.color = 'var(--color-incorrect)';
    }
    
    dictationCheckBtn.style.display = 'none';
    dictationNextBtn.style.display = 'block';
}

function startDictationGame() {
    if (vocabPairs.length === 0) {
        dictationDefinitionP.textContent = "Veuillez sélectionner un chapitre.";
        return;
    }
    
    availableDictationWords = shuffle([...vocabPairs]);
    displayDictation();
}

dictationCheckBtn.addEventListener('click', checkDictationAnswer);
dictationNextBtn.addEventListener('click', displayDictation);


// --- 6. Match Game Logic ---
const matchItemsDiv = document.getElementById('match-items');
const matchScoreSpan = document.getElementById('match-score');
const matchNextBtn = document.getElementById('matchNextBtn');
const matchMessageP = document.getElementById('match-message');

const MATCH_COUNT = 5;

let matchPairs = [];
let matchedPairsCount = 0;
let selectedWordItem = null;
let selectedDefItem = null;

function startMatchGame() {
    if (vocabPairs.length < MATCH_COUNT) {
        matchScoreSpan.textContent = `Besoin d'au moins ${MATCH_COUNT} mots !`;
        matchItemsDiv.innerHTML = '';
        matchNextBtn.style.display = 'none';
        return;
    }
    
    matchedPairsCount = 0;
    selectedWordItem = null;
    selectedDefItem = null;
    matchMessageP.textContent = '';
    matchNextBtn.style.display = 'none';
    
    let shuffledForMatch = shuffle([...vocabPairs]);
    matchPairs = shuffledForMatch.slice(0, MATCH_COUNT);
    
    const words = matchPairs.map(p => ({ content: p.word, type: 'word', id: p.word }));
    const definitions = matchPairs.map(p => ({ content: p.definition, type: 'def', id: p.word }));
    
    const allItems = shuffle([...words, ...definitions]);
    
    matchItemsDiv.innerHTML = '';
    allItems.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('match-item', item.type);
        itemDiv.textContent = item.content;
        itemDiv.dataset.id = item.id;
        itemDiv.addEventListener('click', handleMatchClick);
        matchItemsDiv.appendChild(itemDiv);
    });
    
    updateMatchScore();
}

function handleMatchClick(event) {
    const item = event.target;
    
    if (item.classList.contains('matched') || item.classList.contains('error')) return;
    
    if (item.classList.contains('word')) {
        if (selectedWordItem) selectedWordItem.classList.remove('selected');
        selectedWordItem = item;
    } else {
        if (selectedDefItem) selectedDefItem.classList.remove('selected');
        selectedDefItem = item;
    }
    
    item.classList.add('selected');
    
    if (selectedWordItem && selectedDefItem) {
        const id1 = selectedWordItem.dataset.id;
        const id2 = selectedDefItem.dataset.id;
        
        const item1 = selectedWordItem;
        const item2 = selectedDefItem;
        
        selectedWordItem.classList.remove('selected');
        selectedDefItem.classList.remove('selected');
        
        if (id1 === id2) {
            // Match trouvé
            item1.classList.add('matched');
            item2.classList.add('matched');
            matchedPairsCount++;
            updateMatchScore();
            
            if (matchedPairsCount === MATCH_COUNT) {
                matchMessageP.textContent = 'Félicitations ! Toutes les paires ont été trouvées.';
                matchNextBtn.style.display = 'block';
            }
        } else {
            // Mauvais Match
            item1.classList.add('error');
            item2.classList.add('error');
            setTimeout(() => {
                item1.classList.remove('error');
                item2.classList.remove('error');
            }, 1000); 
        }
        
        selectedWordItem = null;
        selectedDefItem = null;
    }
}

function updateMatchScore() {
    matchScoreSpan.textContent = `Paires trouvées : ${matchedPairsCount} / ${MATCH_COUNT}`;
}

matchNextBtn.addEventListener('click', startMatchGame);


// --- 7. List Logic ---
const vocabularyList = document.getElementById('vocabularyList');

function generateList() {
    vocabularyList.innerHTML = '';
    vocab.forEach(pair => {
        const li = document.createElement('li');
        li.textContent = `${pair[0]} - ${pair[1]}`;
        vocabularyList.appendChild(li);
    });
}


// --- Initialisation ---
document.addEventListener('DOMContentLoaded', () => {
    generateChapterButtons(); 
    hideAlert();
    
    if (typeof ALL_VOCAB_DATA !== 'undefined' && Object.keys(ALL_VOCAB_DATA).length > 0) {
        const defaultChapterKey = Object.keys(ALL_VOCAB_DATA)[0];
        const defaultChapter = ALL_VOCAB_DATA[defaultChapterKey];
        if (Object.keys(defaultChapter.subcategories).length === 1) {
             const defaultSubKey = Object.keys(defaultChapter.subcategories)[0];
             changeVocabulary(defaultChapterKey, defaultSubKey);
        } else {
            // Si plusieurs sous-catégories, ouvrir la modale pour sélection
            chapterModal.style.display = 'block';
        }
    } else {
        document.getElementById('flashcardWord').textContent = "Erreur : Données de vocabulaire introuvables.";
    }
});
