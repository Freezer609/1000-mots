const ALL_VOCAB_DATA = {
    'chap19': {
        title: 'Chapitre 19',
        selectorId: 'chap19SelectBtn',
        subcategories: {
            'noms': {
                name: 'Noms',
                color: '#FF8C00',
                alert: {
                    message: "l'évaluation est déjà passé. Le site supporte toujours la liste de voc mais cette liste est obsolète pour la prochaine évaluation",
                    color: '#FF8C00'
                },
                data: [
                    ["Damnation", "la condamnation à l'enfer", "nom"],
                    ["Dogmes", "les vérités fondamentales, les croyances obligatoires", "nom"],
                    ["Ferveur", "l'ardeur, l'enthousiasme religieux", "nom"],
                    ["Genèse", "élaboration de quelque chose", "nom"],
                    ["Sacerdoce", "une fonction presque religieuse", "nom"],
                    ["Tabou", "quelque chose d'interdit", "nom"],
                    ["Éden", "sens propre : nom propre du paradis terrestre ; sens figuré : lieu qui apparaît comme un paradis", "nom"],
                    ["Apôtre", "sens propre : disciple du Christ envoyé par lui pour prêcher (enseigner) l'Évangile ; sens figuré: personne qui propage ou défend une doctrine", "nom"],
                    ["Foi", "sens général : confiance. Sens spécialisé en religion : croyance résultant d'une adhésion profonde du coeur et de l'esprit, certitude intérieure.", "nom"],
                    ["Rite", "règle(s) d'une cérémonie ou manière de faire invariable.", "nom"],
                    ["Fortune", "le sort, le hasard, personnifiés sous l'Antiquité par une déesse représentée les yeux bandés.", "nom"],
                    ["Bible", "Sens propre : ensemble des textes sacrés des religions juives et chrétiennes (étymologiquement : 'les livres') ; sens figuré : ouvrage faisant autorité, auquel on se réfère.", "nom"],
                    ["Idée", "synonyme de concept, ce qui est élaboré par la pensée.", "nom"],
                    ["Méditation", "réflexion solitaire et recueillie.", "nom"],
                    ["Sagesse", "disposition consistant à se connaître et à savoir bien mourir et bien vivre, selon Montaigne.", "nom"],
                    ["Salut", "ce qui permet d'être sauvé, d'échapper à un danger et de trouver un état heureux. Dans le christianisme : fait d'échapper à la damnation éternelle.", "nom"],
                    ["Relique", "sens propre : reste d'un saint, d'un héros qui est l'objet d'un culte ; sens figuré : objet auquel on attache un grand prix comme témoin du passé.", "nom"],
                    ["Intégrisme", "position de croyants qui, au nom d'un respect intransigeant de la tradition, se refusent à toute évolution dans l'interprétation des textes.", "nom"],
                    ["Hérésie", "Sens propre : doctrine ou interprétation contraire aux dogmes d'une religion et condamnée comme telle ; sens figuré : opinion, théorie qui heurte la raison.", "nom"],
                    ["Doctrine", "Ensemble des croyances ou des opinions qu'on affirme comme vraies et sur lesquelles on s'appuie pour interpréter des faits ou pour agir.", "nom"],
                    ["Métaphysique", "Recherche rationnelle sur des sujets qui se situent au-delà de la réalité concrète donc sur des abstractions telles que les principes de la connaissance, l'existence de Dieu.", "nom"],
                    ["Déterminisme", "doctrine ou opinion selon laquelle les phénomènes ou les actions humaines sont conditionnés par des éléments antérieurs ou par d'autres phénomènes ; désigne aussi, au pluriel, l'ensemble des causes concrètes préalable à un phénomène.", "nom"],
                    ["Fétichisme", "Sens propre : culte d'objets auxquels on attribue un pouvoir surnaturel ; sens figuré : attachement exagéré pour une entité, une personne ou un objet.", "nom"],
                    ["Holocauste", "Sens propre : dans la religion juive ancienne, sacrifice où la victime (animal) était entièrement brûlée ; sens figuré : sacrifice total. Désigne par analogie l'extermination des Juifs sous le régime nazi, la Shoah.", "nom"],
                    ["Iconoclaste", "Sens propre : qui interdit le culte des images saintes, notamment les statues ; par extension : qui détruit les oeuvres d'art ; sens figuré : qui se refuse à toute tradition.", "nom"],
                    ["Parabole", "Récit allégorique destiné à donner un enseignement sous une forme imagée.", "nom"],
                    ["Prosélytisme", "Sens propre : zèle déployé par une personne récemment convertie à une religion pour faire de nouveaux adeptes ; sens figuré : s'emploie aussi dans le domaine de la politique ou des opinions en général.", "nom"],
                    ["Âme", "dans le christianisme, principe spirituel immortel qui se sépare du corps à la mort et qui est jugé par Dieu. Plus largement : principe de vie qui anime l'être vivant, part de la pensée, de la sensibilité et de la conscience morale.", "nom"],
                    ["Ascète", "Personne qui s'impose, par piété et pour faire pénitence, des privations, des sacrifices (sens propre) ; personne qui mène une vie austère en se privant de tous les plaisirs terrestres (sens figuré).", "nom"],
                    ["Culte", "Ensemble de pratiques religieuses destinées à rendre hommage à une divinité (sens propre) ; vénération pour une personne ou une entité que l'on aime et que l'on respecte (sens figuré).", "nom"],
                    ["Entité", "Concept que l'on considère dans sa totalité et dont on parle comme d'un être réel.", "nom"],
                    ["Fanatisme", "Passion excessive inspirée notamment par une religion ou une doctrine et qui conduit à la violence.", "nom"],
                    ["Idéologie", "Système d'idées sur lequel se fonde un groupe social pour juger et agir (sens moderne).", "nom"],
                    ["Initiation", "Processus d'introduction à la connaissance de mystères, de savoirs réservés à un petit cercle.", "nom"],
                    ["Liturgie", "Cérémonial des offices religieux (sens propre). Peut se dire aussi de cérémonials de fêtes ayant une certaine solennité (sens figuré).", "nom"],
                    ["Magie", "Art ou pouvoir inexpliqué, merveilleux, occulte, par opposition à un processus logique et rationnel.", "nom"],
                    ["Oracle", "Dans l'Antiquité, réponse d'une divinité interrogée dans un sanctuaire ; opinion considérée avec beaucoup de respect, en laquelle on a confiance (parfois ironique).", "nom"],
                    ["Pardon", "Décision qui consiste à renoncer à éprouver de la rancune ou de l'hostilité à l'égard d'une personne qui vous à fait du mal. Sens religieux : absolution des pêchés.", "nom"],
                    ["Philosophie", "Réflexion abstraite sur les fondements du monde et les valeurs humaines, qui a pour but d'élaborer une 'sagesse', c'est-à-dire un système de valeurs personnel, un art de vivre.", "nom"]
                ]
            },
            'adj_verbes': {
                name: 'Adjectifs et Verbes',
                color: '#FF8C00',
                alert: {
                    message: "l'évaluation est déjà passé. Le site supporte toujours la liste de voc mais cette liste est obsolète pour la prochaine évaluation",
                    color: '#FF8C00'
                },
                data: [
                    ["absurde", "insensée, déraisonnable, contraire à la logique", "adjectif"],
                    ["athée", "qui ne croit en aucun dieu", "adjectif"],
                    ["augurer", "prévoir", "verbe"],
                    ["dominicale", "ce que l'on fait le dimanche", "adjectif"],
                    ["immanente", "qui est contenu dans toute chose", "adjectif"],
                    ["manichéen", "qui oppose systématiquement et sans nuances deux points de vue opposés", "adjectif"],
                    ["néophyte", "un nouveau converti à une religion ou une doctrine", "adjectif"],
                    ["pieuse", "pleine de dévotion, de ferveur religieuse", "adjectif"],
                    ["profane", "ne pas s'y connaître, ne pas avoir été initié à un art", "adjectif"],
                    ["vénielle", "peu grave", "adjectif"],
                    ["gratuit", "qui ne se paie pas, qui ne demande pas d'effort pour être obtenu ; par extension : acte accompli sans raison, sans mobile.", "adjectif"],
                    ["mystique", "personne qui atteint un état de communication intuitive et immédiate avec la divinité par la force de sa croyance.", "adjectif"],
                    ["spirituelle", "se dit de la vie de l'âme ou de la vie morale", "adjectif"],
                    ["puritain(ne)", "qualifie un respect rigoureux des principes moraux par allusion à une secte pratiquant un christianisme très 'pur'", "adjectif"],
                    ["païenne", "qui ne fait pas partie des trois religions révélées. Par extension : qui n'a pas de religion", "adjectif"],
                    ["prophétique", "qui prédit l'avenir", "adjectif"],
                    ["se repentir", "regretter profondément d'avoir accompli une action (connotation religieuse)", "verbe"],
                    ["profaner", "porter atteinte à un lieu ou un objet sacré", "verbe"],
                    ["vénérer", "aimer avec un grand respect une personne ou une chose (connotation religieuse)", "verbe"],
                    ["blasphémer", "dans la langue religieuse : prononcer des paroles sacrilèges qui outragent ce qui est sacré", "verbe"],
                    ["édifier", "donner un bon exemple moral", "verbe"],
                    ["absoudre", "donner le sacrement de pénitence, c'est-à-dire pardonner les péchés ou les fautes (langue religieuse)", "verbe"],
                    ["expier", "payer un crime ou une faute par un châtiment, une peine ou une réparation.", "verbe"],
                    ["immoler", "langue littéraire et religieuse : faire périr une victime en sacrifice à un dieu ; sens figuré : faire périr une personne pour une cause", "verbe"],
                    ["abjurer", "abandonner solennellement une opinion, une religion", "verbe"],
                    ["idolâtrer", "adorer quelqu'un, en faire son dieu", "verbe"],
                    ["impie", "qui n'est pas croyant ou qui offense la religion (vieilli ou religieux)", "adjectif"]
                ]
            }
        }
    },
    'chap20': {
        title: 'Chapitre 20',
        selectorId: 'chap20SelectBtn',
        subcategories: {
            'general': {
                name: 'Vocabulaire Général',
                color: '#BB86FC',
                alert: null,
                data: []
            }
        }
    }
};
