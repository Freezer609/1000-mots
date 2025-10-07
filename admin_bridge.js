// --- ADMIN BRIDGE SCRIPT ---
// Ce script est chargé de manière sécurisée par le fichier HTML principal 
// (Nouveau Document texte.html) après validation de la clé secrète par Tampermonkey.

// 1. Marqueur d'activation du pont
// Le script Tampermonkey attend cette variable pour démarrer le panneau.
window.ADMIN_BRIDGE_ACTIVE = true;

console.log("admin_bridge.js chargé. Exposition des variables de triche.");

// 2. Exposer les variables cruciales au niveau global (window)
// Cela permet au script Tampermonkey d'accéder aux données du jeu.

// a) Exposer la liste de vocabulaire actuelle.
// La variable 'vocab' est celle qui contient la paire [mot, définition] actuelle.
// Elle est mise à jour lorsque l'utilisateur sélectionne un chapitre/sous-catégorie.
if (typeof vocab !== 'undefined') {
    window.vocab = vocab;
} else {
    // Si la variable 'vocab' n'est pas encore définie (le site charge les données plus tard),
    // nous créons un getter pour la récupérer dès qu'elle existe.
    Object.defineProperty(window, 'vocab', {
        get: function() {
            // Tente de trouver la variable globale 'vocab' du site principal
            return window.globalVocab || (typeof vocab !== 'undefined' ? vocab : []);
        },
        set: function(value) {
            // Met à jour la variable globale si le site la modifie
            window.globalVocab = value;
        },
        configurable: true
    });
}


// b) Exposer le mot choisi pour l'énigme/la dictée.
// Nous exposons le mot secret le plus récent.
window.chosenWord = null;

// Surcharge des fonctions de jeu pour capter le mot secret.
// Nous allons écouter la fonction qui choisit le mot pour le mode Dictée.
const originalStartDictationGame = window.startDictationGame;
window.startDictationGame = function(currentVocab) {
    // Si le vocabulaire est chargé, c'est que le jeu a été initialisé
    if (currentVocab.length > 0) {
        // Le mot est choisi par la fonction originale, nous laissons le jeu le choisir.
        // Ensuite, nous récupérons le mot choisi (qui est stocké dans currentDictationWord).
        if (window.currentDictationWord) {
            window.chosenWord = window.currentDictationWord;
        } else {
            // Cas de secours si le mot n'est pas directement exposé dans la portée globale
            // On peut tenter de le récupérer via d'autres variables si le jeu est actif
            // (mais ce n'est pas toujours fiable).
            console.warn("admin_bridge: currentDictationWord non exposé, le panneau pourrait afficher le mot précédent.");
        }
    }
    // Appel de la fonction originale pour que le jeu démarre normalement
    return originalStartDictationGame.apply(this, arguments);
};


// On fait de même pour le jeu de Brouillage (Scramble) si présent.
const originalStartScrambleGame = window.startScrambleGame;
if(originalStartScrambleGame) {
    window.startScrambleGame = function(currentVocab) {
        if (currentVocab.length > 0) {
            if (window.currentScrambleWord) {
                window.chosenWord = window.currentScrambleWord;
            } else {
                console.warn("admin_bridge: currentScrambleWord non exposé.");
            }
        }
        return originalStartScrambleGame.apply(this, arguments);
    };
}


// 3. Exposer la fonction de génération de liste
// Ceci est utile pour forcer le rafraîchissement de la liste dans le panneau et sur le site.
if (typeof generateList !== 'undefined') {
    window.generateList = generateList;
} else {
    console.warn("La fonction 'generateList' n'a pas été trouvée, le bouton 'Actualiser la Liste' peut ne pas fonctionner.");
}
