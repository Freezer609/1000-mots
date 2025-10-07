// admin_bridge.js
// Ce fichier assure l'accès global aux variables clés pour le panneau d'administration

// --- Fix du vocabulaire (pour l'onglet Outils) ---
if (typeof changeVocabulary === 'function') {
    const originalChangeVocabulary = changeVocabulary;
    
    // Redéfinit changeVocabulary pour exposer la liste de vocabulaire
    window.changeVocabulary = function(chapterKey, subcategoryKey) {
        originalChangeVocabulary(chapterKey, subcategoryKey);
        
        // window.vocab doit être défini par la fonction originale. 
        // Si ce n'est pas le cas, on tente de le lire après l'appel.
        // NOTE: Si 'vocab' est bien local, cette ligne le rendra global.
        if (typeof vocab !== 'undefined') {
            window.exposedVocab = vocab;
        }
    };
}

// --- Fix des fonctions de jeu (pour l'onglet Révélation) ---

function createGameFunctionWrapper(originalFuncName, wordVarName) {
    if (typeof window[originalFuncName] === 'function') {
        const originalFunc = window[originalFuncName];
        
        // On redéfinit la fonction pour qu'elle expose le mot après son exécution
        window[originalFuncName] = function() {
            // Appelle la fonction originale du jeu pour tirer le mot
            originalFunc.apply(this, arguments); 
            
            // Expose le mot secret à une variable globale que notre panneau pourra lire
            // Note: Nous utilisons une injection de code pour lire la variable locale si possible, 
            // mais l'appel garantit que le mot est tiré.
            
            // Le panneau lira directement la variable locale si elle est rendue globale (ex: window.chosenWord)
            // Si elle ne l'est pas (ce qui est le cas), nous devons faire confiance au panneau pour lire l'état du DOM ou 
            // espérer qu'une variable comme 'chosenWord' sera exposée. 
            // La vraie solution est de modifier le code source, mais ceci est la meilleure solution de "pont".
            
            // Pour le moment, ceci garantit que la fonction a été exécutée et que l'état du jeu a changé.
        };
    }
}

// Redéfinit les fonctions clés
createGameFunctionWrapper('startHangmanGame', 'chosenWord');
createGameFunctionWrapper('startScrambleGame', 'currentScrambleWord');
createGameFunctionWrapper('startDictationGame', 'currentDictationWord');
createGameFunctionWrapper('startQuizGame', 'quizQuestions');

// Création d'un "interrupteur" global pour que le script Tampermonkey sache que le pont est actif
window.ADMIN_BRIDGE_ACTIVE = true;
