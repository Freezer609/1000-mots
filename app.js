const container = document.querySelector('.container');
const flashcard = document.getElementById('flashcard');
const frontFace = document.getElementById('front');
const backFace = document.getElementById('back');
const cardCounter = document.getElementById('cardCounter');
const vocabularyList = document.querySelector('.vocabulary-list');
const feedbackButtons = document.getElementById('feedbackButtons');
const knewItBtn = document.getElementById('knewItBtn');
const didntKnowBtn = document.getElementById('didntKnowBtn');

const flashcardModeBtn = document.getElementById('flashcardModeBtn');
const quizModeBtn = document.getElementById('quizModeBtn');
const hangmanModeBtn = document.getElementById('hangmanModeBtn');
const scrambleModeBtn = document.getElementById('scrambleModeBtn');
const dictationModeBtn = document.getElementById('dictationModeBtn');
const matchModeBtn = document.getElementById('matchModeBtn');

const flashcardGameContainer = document.getElementById('flashcardGameContainer');
const quizGameContainer = document.getElementById('quizGameContainer');
const hangmanGameContainer = document.getElementById('hangmanGameContainer');
const scrambleGameContainer = document.getElementById('scrambleGameContainer');
const dictationGameContainer = document.getElementById('dictationGameContainer');
const matchGameContainer = document.getElementById('matchGameContainer');
const allContainers = [flashcardGameContainer, quizGameContainer, hangmanGameContainer, scrambleGameContainer, dictationGameContainer, matchGameContainer];
const allModeBtns = [flashcardModeBtn, quizModeBtn, hangmanModeBtn, scrambleModeBtn, dictationModeBtn, matchModeBtn];

const quizQuestion = document.getElementById('quizQuestion');
const quizOptions = document.getElementById('quizOptions');
const quizScore = document.getElementById('quizScore');

const hangmanWordDiv = document.getElementById('hangmanWord');
const hangmanLettersDiv = document.getElementById('hangmanLetters');
const hangmanParts = ["head", "body", "arm1", "arm2", "leg1", "leg2"];

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

const chapterSelectorDiv = document.getElementById('chapterSelector');
const listTitleSummary = document.getElementById('listTitle');
const alertMessageDiv = document.getElementById('alertMessage');
const alertTextP = document.getElementById('alertText');
const vocabDetails = document.getElementById('vocabDetails');

const categoryModal = document.getElementById('categoryModal');
const modalTitle = document.getElementById('modalTitle');
const modalButtons = document.getElementById('modalButtons');

const varCss = {
    colorCorrect: getComputedStyle(document.documentElement).getPropertyValue('--color-correct').trim(),
    colorIncorrect: getComputedStyle(document.documentElement).getPropertyValue('--color-incorrect').trim(),
    colorPrimary: getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim(),
    colorCard: getComputedStyle(document.documentElement).getPropertyValue('--color-card').trim(),
    colorText: getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim(),
    colorSecondary: getComputedStyle(document.documentElement).getPropertyValue('--color-secondary').trim()
};

let vocab = [];
let currentChapterKey = null;
let currentSubcategoryKey = null;
let chapterAlert = null;
let chosenWord = '';
let shuffledVocab = [];
let currentCardIndex = 0;
let masteredWords = new Set();

let currentQuizQuestionIndex = 0;
let quizQuestions = [];
let score = { correct: 0, total: 0 };

let hangmanWord = '';
let hangmanCorrectAnswer = '';
let guessedLetters = new Set();
const maxErrors = hangmanParts.length;
let errors = 0;

let currentScrambleWord = '';
let currentDictationWord = '';

let matchPairs = [];
let matchedPairsCount = 0;
let selectedWordItem = null;
let selectedDefItem = null;
const MATCH_COUNT = 6;


function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function hideAllGameContainers() {
    allContainers.forEach(container => {
        container.style.display = 'none';
        container.classList.remove('active-mode');
        setTimeout(() => container.style.opacity = '0', 0);
    });
    allModeBtns.forEach(btn => btn.classList.remove('active'));
}

function showGameContainer(container, button) {
    hideAllGameContainers();
    container.style.display = 'flex';
    button.classList.add('active');
    setTimeout(() => {
        container.classList.add('active-mode');
        container.style.opacity = '1';
    }, 50);
}

function displayAlert(message, color) {
    alertTextP.textContent = message;
    alertMessageDiv.style.backgroundColor = color;
    alertMessageDiv.style.display = 'block';
}

function hideAlert() {
    alertMessageDiv.style.display = 'none';
}

function generateChapterButtons() {
    chapterSelectorDiv.innerHTML = '';
    if (typeof ALL_VOCAB_DATA === 'undefined') return;

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
    document.getElementById(chapter.selectorId).classList.add('active');

    const subEntries = Object.entries(chapter.subcategories);
    if (subEntries.length === 1) {
        changeVocabulary(chapterKey, subEntries[0][0]);
        return;
    }

    modalTitle.textContent = `Choisir la section pour ${chapter.title}`;
    modalButtons.innerHTML = '';
    
    subEntries.forEach(([subKey, subcategory]) => {
        const button = document.createElement('button');
        button.textContent = subcategory.name;
        button.style.backgroundColor = subcategory.color;
        button.style.color = '#1E1E1E';
        button.addEventListener('click', () => {
            changeVocabulary(chapterKey, subKey);
            categoryModal.style.display = 'none';
        });
        modalButtons.appendChild(button);
    });
    categoryModal.style.display = 'flex';
}

function changeVocabulary(chapterKey, subcategoryKey) {
    hideAllGameContainers();
    currentChapterKey = chapterKey;
    currentSubcategoryKey = subcategoryKey;
    
    if (typeof ALL_VOCAB_DATA === 'undefined') {
        displayAlert("Erreur: Fichier de données (vocab_data.js) manquant ou incorrect.", varCss.colorIncorrect);
        return;
    }

    const chapter = ALL_VOCAB_DATA[chapterKey];
    const subcategory = chapter.subcategories[subcategoryKey];
    vocab = subcategory.data;
    chapterAlert = subcategory.alert;

    listTitleSummary.textContent = `${chapter.title} - ${subcategory.name}`;

    if (chapterAlert && chapterAlert.message) {
        displayAlert(chapterAlert.message, chapterAlert.color || varCss.colorPrimary);
    } else {
        hideAlert();
    }

    generateList();
    startFlashcardGame();
}

function generateList() {
    vocabularyList.innerHTML = '';
    vocab.forEach(pair => {
        const li = document.createElement('li');
        li.textContent = `${pair[0]} - ${pair[1]}`;
        vocabularyList.appendChild(li);
    });
}

function startFlashcardGame() {
    showGameContainer(flashcardGameContainer, flashcardModeBtn);
    flashcard.classList.remove('flipped');
    feedbackButtons.style.display = 'none';
    
    if (vocab.length === 0) {
         frontFace.textContent = "Sélectionnez un chapitre et une section.";
         backFace.textContent = "Le jeu commencera après la sélection.";
         cardCounter.textContent = "";
         return;
    }

    shuffledVocab = shuffleArray([...vocab]);
    currentCardIndex = 0;
    masteredWords = new Set();
    displayCard();
}

function displayCard() {
    if (shuffledVocab.length === 0) {
        frontFace.textContent = "Aucun mot à réviser.";
        backFace.textContent = "";
        cardCounter.textContent = "0 / 0";
        return;
    }
    
    const [word, definition] = shuffledVocab[currentCardIndex];
    frontFace.textContent = word;
    backFace.innerHTML = definition;
    cardCounter.textContent = `${currentCardIndex + 1} / ${shuffledVocab.length}`;
    
    flashcard.classList.remove('flipped');
    feedbackButtons.style.display = 'none';
}

function flipCard() {
    if (vocab.length === 0) return;
    
    flashcard.classList.toggle('flipped');
    if (flashcard.classList.contains('flipped')) {
        feedbackButtons.style.display = 'flex';
    }
}

function handleFeedback(known) {
    const currentWord = shuffledVocab[currentCardIndex][0];
    
    if (known) {
        masteredWords.add(currentWord);
    } else {
        masteredWords.delete(currentWord);
        
        const wordToReinsert = shuffledVocab.splice(currentCardIndex, 1)[0];
        let insertIndex = currentCardIndex + Math.floor(Math.random() * (shuffledVocab.length - currentCardIndex)) + 1;
        if (insertIndex > shuffledVocab.length) insertIndex = shuffledVocab.length;
        shuffledVocab.splice(insertIndex, 0, wordToReinsert);
        currentCardIndex--; 
    }

    currentCardIndex++;
    if (currentCardIndex < shuffledVocab.length) {
        displayCard();
    } else {
        
        shuffledVocab = shuffledVocab.filter(pair => !masteredWords.has(pair[0]));
        if (shuffledVocab.length > 0) {
            currentCardIndex = 0;
            shuffleArray(shuffledVocab);
            displayAlert(`Nouveau tour avec ${shuffledVocab.length} mots restants!`, varCss.colorPrimary);
            displayCard();
        } else {
            frontFace.textContent = "Félicitations! Tu as maîtrisé tous les mots!";
            backFace.textContent = "Clique sur le bouton 'Mode Cartes' pour recommencer.";
            cardCounter.textContent = "";
            feedbackButtons.style.display = 'none';
            flashcard.classList.remove('flipped');
        }
    }
}

flashcard.addEventListener('click', flipCard);
knewItBtn.addEventListener('click', () => handleFeedback(true));
didntKnowBtn.addEventListener('click', () => handleFeedback(false));

function startQuizGame() {
    showGameContainer(quizGameContainer, quizModeBtn);
    if (vocab.length === 0) {
        quizQuestion.textContent = "Sélectionnez un chapitre et une section pour commencer.";
        quizOptions.innerHTML = '';
        quizScore.textContent = "Score: 0 / 0";
        return;
    }

    shuffledVocab = shuffleArray([...vocab]);
    quizQuestions = generateQuizQuestions();
    currentQuizQuestionIndex = 0;
    score = { correct: 0, total: 0 };
    displayQuizQuestion();
}

function generateQuizQuestions() {
    return shuffledVocab.map(([word, definition]) => {
        const type = Math.random() < 0.5 ? 'wordToDef' : 'defToWord';
        const correctAnswer = type === 'wordToDef' ? definition : word;
        const question = type === 'wordToDef' ? word : definition;
        
        let incorrectAnswers = [];
        let tempVocab = vocab.filter(pair => pair[0] !== word);
        shuffleArray(tempVocab);

        while (incorrectAnswers.length < 3 && tempVocab.length > 0) {
            const incorrectWord = type === 'wordToDef' ? tempVocab.pop()[1] : tempVocab.pop()[0];
            if (!incorrectAnswers.includes(incorrectWord)) {
                incorrectAnswers.push(incorrectWord);
            }
        }
        
        const options = shuffleArray([correctAnswer, ...incorrectAnswers]).slice(0, 4);

        return { question, correctAnswer, options };
    });
}

function displayQuizQuestion() {
    hideAlert();
    if (currentQuizQuestionIndex >= quizQuestions.length) {
        quizQuestion.textContent = `Quiz terminé! Ton score final : ${score.correct} / ${score.total}`;
        quizOptions.innerHTML = `<button onclick="startQuizGame()" style="background-color: ${varCss.colorSecondary}; color: ${varCss.colorCard}; border: none;">Recommencer le Quiz</button>`;
        return;
    }

    const q = quizQuestions[currentQuizQuestionIndex];
    quizQuestion.textContent = q.question;
    quizOptions.innerHTML = '';
    
    q.options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.addEventListener('click', () => checkQuizAnswer(button, option, q.correctAnswer));
        quizOptions.appendChild(button);
    });
    updateQuizScore();
}

function checkQuizAnswer(button, selectedAnswer, correctAnswer) {
    score.total++;
    
    Array.from(quizOptions.children).forEach(btn => {
        btn.disabled = true;
        if (btn.textContent === correctAnswer) {
            btn.classList.add('correct');
        } else if (btn.textContent === selectedAnswer) {
            btn.classList.add('incorrect');
        }
    });

    if (selectedAnswer === correctAnswer) {
        score.correct++;
        displayAlert('Correct!', varCss.colorCorrect);
    } else {
        displayAlert(`Faux. La bonne réponse était : ${correctAnswer}`, varCss.colorIncorrect);
    }
    
    updateQuizScore();
    
    setTimeout(() => {
        currentQuizQuestionIndex++;
        displayQuizQuestion();
    }, 1500);
}

function updateQuizScore() {
    quizScore.textContent = `Score: ${score.correct} / ${score.total}`;
}

function startHangGame() {
    showGameContainer(hangmanGameContainer, hangmanModeBtn);
     if (vocab.length === 0) {
        hangmanWordDiv.textContent = "Sélectionnez un chapitre pour jouer.";
        hangmanLettersDiv.innerHTML = '';
        return;
    }

    hideAlert();
    
    const randomPair = shuffleArray([...vocab])[0];
    hangmanCorrectAnswer = randomPair[0];
    hangmanWord = randomPair[0].toUpperCase(); 
    guessedLetters = new Set();
    errors = 0;
    
    hangmanParts.forEach(id => document.getElementById(id).style.display = 'none');
    
    let initialDisplay = '';
    for (const char of hangmanWord) {
        if (char.match(/[A-ZÀ-Ÿ]/i)) {
            initialDisplay += '_';
        } else {
            initialDisplay += char;
            guessedLetters.add(char.toUpperCase());
        }
    }

    hangmanWordDiv.textContent = initialDisplay.split('').join(' ');

    generateHangButtons();
}

function generateHangButtons() {
    hangmanLettersDiv.innerHTML = '';
    
    const baseAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
    
    baseAlphabet.forEach(letter => {
        const button = document.createElement('button');
        button.textContent = letter;
        button.value = letter;
        button.addEventListener('click', () => guessLetter(letter, button));
        hangmanLettersDiv.appendChild(button);
    });
}

function guessLetter(letter, button) {
    if (button.disabled) return;

    button.disabled = true;
    hideAlert();

    const normalizedWord = hangmanWord.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const normalizedLetter = letter.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    guessedLetters.add(normalizedLetter);

    if (normalizedWord.includes(normalizedLetter)) {
        button.style.backgroundColor = varCss.colorCorrect;
        
        let updatedDisplay = '';
        let wordComplete = true;
        
        for (let i = 0; i < hangmanWord.length; i++) {
            const currentLetter = hangmanWord[i].toUpperCase();
            const normalizedCurrentLetter = currentLetter.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            if (guessedLetters.has(normalizedCurrentLetter) || !currentLetter.match(/[A-ZÀ-Ÿ]/i)) {
                updatedDisplay += currentLetter;
            } else {
                updatedDisplay += '_';
                wordComplete = false;
            }
        }
        
        hangmanWordDiv.textContent = updatedDisplay.split('').join(' ');

        if (wordComplete) {
            displayAlert(`Gagné ! Le mot était : ${hangmanCorrectAnswer}`, varCss.colorCorrect);
            disableHangButtons();
        }

    } else {
        button.style.backgroundColor = varCss.colorIncorrect;
        errors++;
        if (errors <= maxErrors) {
            document.getElementById(hangmanParts[errors - 1]).style.display = 'block';
        }

        if (errors >= maxErrors) {
            displayAlert(`Perdu ! Le mot était : ${hangmanCorrectAnswer}`, varCss.colorIncorrect);
            disableHangButtons();
        }
    }
}

function disableHangButtons() {
    Array.from(hangmanLettersDiv.children).forEach(btn => btn.disabled = true);
}

function scrambleWord(word) {
    const letters = word.split('');
    for (let i = letters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    return letters.join('');
}

function startScrambleGame() {
    showGameContainer(scrambleGameContainer, scrambleModeBtn);
    if (vocab.length === 0) {
        scrambleWordDiv.textContent = "Sélectionnez un chapitre pour jouer.";
        scrambleClueDiv.textContent = "";
        scrambleInput.value = '';
        scrambleFeedbackDiv.textContent = '';
        scrambleNextBtn.style.display = 'none';
        scrambleCheckBtn.style.display = 'block';
        return;
    }

    hideAlert();
    scrambleInput.value = '';
    scrambleFeedbackDiv.textContent = '';
    scrambleNextBtn.style.display = 'none';
    scrambleCheckBtn.style.display = 'block';
    
    const randomPair = shuffleArray([...vocab])[0];
    currentScrambleWord = randomPair[0];
    const definition = randomPair[1];

    const scrambled = scrambleWord(currentScrambleWord.toUpperCase().replace(/[\s-]/g, '')); 

    scrambleWordDiv.textContent = scrambled.split('').join(' ');
    scrambleClueDiv.textContent = definition;
    scrambleInput.focus();
}

function checkScrambleAnswer() {
    const userAnswer = scrambleInput.value.trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\s-]/g, '');
    const correctWord = currentScrambleWord.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\s-]/g, '');

    scrambleCheckBtn.style.display = 'none';
    scrambleNextBtn.style.display = 'block';

    if (userAnswer === correctWord) {
        scrambleFeedbackDiv.textContent = `Correct! Le mot était bien : ${currentScrambleWord}`;
        scrambleFeedbackDiv.style.color = varCss.colorCorrect;
    } else {
        scrambleFeedbackDiv.textContent = `Faux. Le mot correct était : ${currentScrambleWord}`;
        scrambleFeedbackDiv.style.color = varCss.colorIncorrect;
    }
}

scrambleCheckBtn.addEventListener('click', checkScrambleAnswer);
scrambleNextBtn.addEventListener('click', startScrambleGame);

function startDictationGame() {
    showGameContainer(dictationGameContainer, dictationModeBtn);
     if (vocab.length === 0) {
        dictationClueDiv.textContent = "Sélectionnez un chapitre pour jouer.";
        dictationInput.value = '';
        dictationFeedbackDiv.textContent = '';
        dictationNextBtn.style.display = 'none';
        dictationCheckBtn.style.display = 'block';
        return;
    }

    hideAlert();
    dictationInput.value = '';
    dictationFeedbackDiv.textContent = '';
    dictationNextBtn.style.display = 'none';
    dictationCheckBtn.style.display = 'block';

    const randomPair = shuffleArray([...vocab])[0];
    currentDictationWord = randomPair[0];
    const definition = randomPair[1];
    
    dictationClueDiv.textContent = definition;
    dictationInput.focus();
}

function checkDictationAnswer() {
    const userAnswer = dictationInput.value.trim();
    const correctWord = currentDictationWord;

    dictationCheckBtn.style.display = 'none';
    dictationNextBtn.style.display = 'block';
    
    if (userAnswer === correctWord) {
        dictationFeedbackDiv.textContent = `Exact! Le mot était : ${correctWord}`;
        dictationFeedbackDiv.style.color = varCss.colorCorrect;
    } else {
        dictationFeedbackDiv.textContent = `Incorrect. Le mot exact était : ${correctWord}`;
        dictationFeedbackDiv.style.color = varCss.colorIncorrect;
    }
}

dictationCheckBtn.addEventListener('click', checkDictationAnswer);
dictationNextBtn.addEventListener('click', startDictationGame);

function startMatchGame() {
    showGameContainer(matchGameContainer, matchModeBtn);
    if (vocab.length === 0) {
         matchScoreSpan.textContent = "Sélectionnez un chapitre pour jouer.";
         wordsColumn.innerHTML = '';
         definitionsColumn.innerHTML = '';
         return;
    }

    hideAlert();
    wordsColumn.innerHTML = '';
    definitionsColumn.innerHTML = '';
    matchNextBtn.style.display = 'none';
    matchedPairsCount = 0;
    selectedWordItem = null;
    selectedDefItem = null;
    updateMatchScore();

    const pairs = shuffleArray([...vocab]).slice(0, MATCH_COUNT);
    matchPairs = pairs.map(([word, definition]) => ({ word, definition }));

    let words = shuffleArray(matchPairs.map(p => p.word));
    let definitions = shuffleArray(matchPairs.map(p => p.definition));

    words.forEach(word => createMatchItem(wordsColumn, word, 'word'));
    definitions.forEach(def => createMatchItem(definitionsColumn, def, 'definition'));
}

function createMatchItem(parent, content, type) {
    const item = document.createElement('div');
    item.classList.add('match-item');
    item.textContent = content;
    item.dataset.type = type;
    item.dataset.value = content;
    item.addEventListener('click', () => handleMatchSelection(item));
    parent.appendChild(item);
}

function getMatchPair(item1, item2) {
    const wordValue = item1.dataset.type === 'word' ? item1.dataset.value : item2.dataset.value;
    const defValue = item1.dataset.type === 'definition' ? item1.dataset.value : item2.dataset.value;

    return matchPairs.find(p => p.word === wordValue && p.definition === defValue);
}

function handleMatchSelection(item) {
    if (item.classList.contains('matched')) return;

    if (item.dataset.type === 'word') {
        if (selectedWordItem) selectedWordItem.classList.remove('selected');
        selectedWordItem = item;
    } else {
        if (selectedDefItem) selectedDefItem.classList.remove('selected');
        selectedDefItem = item;
    }

    item.classList.add('selected');

    if (selectedWordItem && selectedDefItem) {
        const wordItem = selectedWordItem;
        const defItem = selectedDefItem;

        const pair = getMatchPair(wordItem, defItem);

        if (pair) {
            matchedPairsCount++;
            wordItem.classList.remove('selected');
            defItem.classList.remove('selected');
            wordItem.classList.add('matched');
            defItem.classList.add('matched');
            updateMatchScore();

            if (matchedPairsCount === MATCH_COUNT) {
                displayAlert('Félicitations! Toutes les paires trouvées.', varCss.colorCorrect);
                matchNextBtn.style.display = 'block';
            }
        } else {
            wordItem.classList.add('error');
            defItem.classList.add('error');
            setTimeout(() => {
                wordItem.classList.remove('error', 'selected');
                defItem.classList.remove('error', 'selected');
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

flashcardModeBtn.addEventListener('click', startFlashcardGame);
quizModeBtn.addEventListener('click', startQuizGame);
hangmanModeBtn.addEventListener('click', startHangGame);
scrambleModeBtn.addEventListener('click', startScrambleGame);
dictationModeBtn.addEventListener('click', startDictationGame);
matchModeBtn.addEventListener('click', startMatchGame);

document.addEventListener('DOMContentLoaded', () => {
    generateChapterButtons(); 
    hideAlert();
    
    frontFace.textContent = "Sélectionnez un chapitre ci-dessus";
    backFace.textContent = "Puis une section pour commencer à jouer.";
});