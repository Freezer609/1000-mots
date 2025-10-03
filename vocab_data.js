const ALL_VOCAB_DATA = {
    // Chapitre 19
    'chap19': {
        title: 'Chapitre 19',
        selectorId: 'chap19SelectBtn',
        subcategories: {
            'noms': {
                name: 'Noms',
                color: '#FF8C00',
                alert: {
                    message: "La liste de vocabulaire est toujours à jour mais l'intero s'est déroulé le 22-09-25. Cette liste est donc obsolète pour la prochaine intero.",
                    color: '#FF8C00' // Orange
                },
                data: [
    ["Damnation", "la condamnation à l'enfer"],
    ["Dogmes", "les vérités fondamentales, les croyances obligatoires"],
    ["Ferveur", "l'ardeur, l'enthousiasme religieux"],
    ["Genèse", "élaboration de quelque chose"],
    ["Sacerdoce", "une fonction presque religieuse"],
    ["Tabou", "quelque chose d'interdit"],
    ["Éden", "sens propre : nom propre du paradis terrestre ; sens figuré : lieu qui apparaît comme un paradis"],
    ["Apôtre", "sens propre : disciple du Christ envoyé par lui pour prêcher (enseigner) l'Évangile ; sens figuré: personne qui propage ou défend une doctrine"],
    ["Foi", "sens général : confiance. Sens spécialisé en religion : croyance résultant d'une adhésion profonde du coeur et de l'esprit, certitude intérieure."],
    ["Rite", "règle(s) d'une cérémonie ou manière de faire invariable."],
    ["Fortune", "le sort, le hasard, personnifiés sous l'Antiquité par une déesse représentée les yeux bandés."],
    ["Bible", "Sens propre : ensemble des textes sacrés des religions juives et chrétiennes (étymologiquement : 'les livres') ; sens figuré : ouvrage faisant autorité, auquel on se réfère."],
    ["Idée", "synonyme de concept, ce qui est élaboré par la pensée."],
    ["Méditation", "réflexion solitaire et recueillie."],
    ["Sagesse", "disposition consistant à se connaître et à savoir bien mourir et bien vivre, selon Montaigne."],
    ["Salut", "ce qui permet d'être sauvé, d'échapper à un danger et de trouver un état heureux. Dans le christianisme : fait d'échapper à la damnation éternelle."],
    ["Relique", "sens propre : reste d'un saint, d'un héros qui est l'objet d'un culte ; sens figuré : objet auquel on attache un grand prix comme témoin du passé."],
    ["Intégrisme", "position de croyants qui, au nom d'un respect intransigeant de la tradition, se refusent à toute évolution dans l'interprétation des textes."],
    ["Hérésie", "Sens propre : doctrine ou interprétation contraire aux dogmes d'une religion et condamnée comme telle ; sens figuré : opinion, théorie qui heurte la raison."],
    ["Doctrine", "Ensemble des croyances ou des opinions qu'on affirme comme vraies et sur lesquelles on s'appuie pour interpréter des faits ou pour agir."],
    ["Métaphysique", "Recherche rationnelle sur des sujets qui se situent au-delà de la réalité concrète donc sur des abstractions telles que les principes de la connaissance, l'existence de Dieu."],
    ["Déterminisme", "doctrine ou opinion selon laquelle les phénomènes ou les actions humaines sont conditionnés par des éléments antérieurs ou par d'autres phénomènes ; désigne aussi, au pluriel, l'ensemble des causes concrètes préalable à un phénomène."],
    ["Fétichisme", "Sens propre : culte d'objets auxquels on attribue un pouvoir surnaturel ; sens figuré : attachement exagéré pour une entité, une personne ou un objet."],
    ["Holocauste", "Sens propre : dans la religion juive ancienne, sacrifice où la victime (animal) était entièrement brûlée ; sens figuré : sacrifice total. Désigne par analogie l'extermination des Juifs sous le régime nazi, la Shoah."],
    ["Iconoclaste", "Sens propre : qui interdit le culte des images saintes, notamment les statues ; par extension : qui détruit les oeuvres d'art ; sens figuré : qui se refuse à toute tradition."],
    ["Parabole", "Récit allégorique destiné à donner un enseignement sous une forme imagée."],
    ["Prosélytisme", "Sens propre : zèle déployé par une personne récemment convertie à une religion pour faire de nouveaux adeptes ; sens figuré : s'emploie aussi dans le domaine de la politique ou des opinions en général."],
    ["Âme", "dans le christianisme, principe spirituel immortel qui se sépare du corps à la mort et qui est jugé par Dieu. Plus largement : principe de vie qui anime l'être vivant, part de la pensée, de la sensibilité et de la conscience morale."],
    ["Ascète", "Personne qui s'impose, par piété et pour faire pénitence, des privations, des sacrifices (sens propre) ; personne qui mène une vie austère en se privant de tous les plaisirs terrestres (sens figuré)."],
    ["Culte", "Ensemble de pratiques religieuses destinées à rendre hommage à une divinité (sens propre) ; vénération pour une personne ou une entité que l'on aime et que l'on respecte (sens figuré)."],
    ["Entité", "Concept que l'on considère dans sa totalité et dont on parle comme d'un être réel."],
    ["Fanatisme", "Passion excessive inspirée notamment par une religion ou une doctrine et qui conduit à la violence."],
    ["Idéologie", "Système d'idées sur lequel se fonde un groupe social pour juger et agir (sens moderne)."],
    ["Initiation", "Processus d'introduction à la connaissance de mystères, de savoirs réservés à un petit cercle."],
    ["Liturgie", "Cérémonial des offices religieux (sens propre). Peut se dire aussi de cérémonials de fêtes ayant une certaine solennité (sens figuré)."],
    ["Magie", "Art ou pouvoir inexpliqué, merveilleux, occulte, par opposition à un processus logique et rationnel."],
    ["Oracle", "Dans l'Antiquité, réponse d'une divinité interrogée dans un sanctuaire ; opinion considérée avec beaucoup de respect, en laquelle on a confiance (parfois ironique)."],
    ["Pardon", "Décision qui consiste à renoncer à éprouver de la rancune ou de l'hostilité à l'égard d'une personne qui vous à fait du mal. Sens religieux : absolution des pêchés."],
    ["Philosophie", "Réflexion abstraite sur les fondements du monde et les valeurs humaines, qui a pour but d'élaborer une 'sagesse', c'est-à-dire un système de valeurs personnel, un art de vivre."]
]
            },
            'adj_verbes': {
                name: 'Adjectifs et Verbes',
                color: '#4CAF50', 
                alert: {
                    message: "Le voc est à jour ! Vous pouvez étudier et tester vos connaissances sur le site ! Si une erreur survient, prévenez-moi, je me droguerai à nouveau à la caféine :)",
                    color: '#4CAF50' // Vert
                },
                data: [
    ["absurde", "insensée, déraisonnable, contraire à la logique"],
    ["athée", "qui ne croit en aucun dieu"],
    ["augurer", "prévoir"],
    ["dominicale", "ce que l'on fait le dimanche"],
    ["immanente", "qui est contenu dans toute chose"],
    ["manichéen", "qui oppose systématiquement et sans nuances deux points de vue opposés"],
    ["néophyte", "un nouveau converti à une religion ou une doctrine"],
    ["pieuse", "pleine de dévotion, de ferveur religieuse"],
    ["profane", "ne pas s'y connaître, ne pas avoir été initié à un art"],
    ["vénielle", "peu grave"],
    ["gratuit", "qui ne se paie pas, qui ne demande pas d'effort pour être obtenu ; par extension : acte accompli sans raison, sans mobile."],
    ["mystique", "personne qui atteint un état de communication intuitive et immédiate avec la divinité par la force de sa croyance."],
    ["spirituelle", "se dit de la vie de l'âme ou de la vie morale"],
    ["puritain(ne)", "qualifie un respect rigoureux des principes moraux par allusion à une secte pratiquant un christianisme très 'pur'"],
    ["païenne", "qui ne fait pas partie des trois religions révélées. Par extension : qui n'a pas de religion"],
    ["prophétique", "qui prédit l'avenir"],
    ["se repentir", "regretter profondément d'avoir accompli une action (connotation religieuse)"],
    ["profaner", "porter atteinte à un lieu ou un objet sacré"],
    ["vénérer", "aimer avec un grand respect une personne ou une chose (connotation religieuse)"],
    ["blasphémer", "dans la langue religieuse : prononcer des paroles sacrilèges qui outragent ce qui est sacré"],
    ["édifier", "donner un bon exemple moral"],
    ["absoudre", "donner le sacrement de pénitence, c'est-à-dire pardonner les péchés ou les fautes (langue religieuse)"],
    ["expier", "payer un crime ou une faute par un châtiment, une peine ou une réparation."],
    ["immoler", "langue littéraire et religieuse : faire périr une victime en sacrifice à un dieu ; sens figuré : faire périr une personne pour une cause"],
    ["abjurer", "abandonner solennellement une opinion, une religion"],
    ["idolâtrer", "adorer quelqu'un, en faire son dieu"],
    ["impie", "qui n'est pas croyant ou qui offense la religion (vieilli ou religieux)"]
]
     }
        }
    }, 
    
    // Exemple d'ajout futur : Chapitre 20
    'chap20': {
        title: 'Chapitre 20',
        selectorId: 'chap20SelectBtn',
        subcategories: {
            'general': {
                name: 'Vocabulaire Général',
                color: '#BB86FC',
                alert: null, // Pas d'alerte pour ce chapitre
                data: [
                     // PLACE ICI LES PAIRES MOT/DEFINITION DU CHAPITRE 20
                ]
            }
        }
    }
};
