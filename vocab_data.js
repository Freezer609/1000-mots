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
                color: '#FF8C00', 
                alert: {
                    message: "l'évaluation est déjà passé. Le site supporte toujours la liste de voc mais cette liste est obsolète pour la prochaine évaluation",
                    color: '#FF8C00'
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
    
    'chap20': {
        title: 'Chapitre 20',
        selectorId: 'chap20SelectBtn',
        subcategories: {
            'general': {
                name: 'Vocabulaire Général',
                color: '#BB86FC',
                alert: {
                    message: "les mots de vocabulaires est à jour ! utiliser cette liste afin d'étudier ou de vérifier vos connaissances",
                    color: '#4CAF50'
                },
                data: [
    ["une acception", "la signification d'un mot, d'un concept"],
    ["une bibliographie", "une liste des ouvrages écrits sur ce sujet"],
    ["la critique d'une œuvre", "l'avis qu'elle a reçu, pouvant être négatif ou positif"],
    ["érudit", "qui a des connaissances approfondies dans une matière"],
    ["un leitmotiv", "une formule revenant plusieurs fois dans un texte pour créer un effet comique ou dramatique"],
    ["un mécène", "une personne ou une institution qui aide financièrement et protège un ou plusieurs artistes"],
    ["un média", "un support de communication"],
    ["un mythe", "un récit qui idéalise les actions du personnage"],
    ["péjoratif", "dévalorisant"],
    ["le plagiat", "la copie et l'accaparation de l'œuvre d'autrui"],
    ["la psychanalyse", "l'interprétation de la vie psychique"],
    ["référer", "consulter pour y trouver des indications sur lesquelles vous appuyer"],
    ["suspense", "un moment d'attente qui suspend le déroulement d'une action ou précède son dénouement et tient le spectateur en haleine"],
    ["lyrique", "sens propre : œuvre destinée à être chantée; sens figuré: œuvre exprimant des sentiments intimes de manière à communiquer une émotion"],
    ["didactique", "qualifie un discours ou un texte dont la principale visée est d'instruire"],
    ["dramatique", "sens propre; qui a un rapport avec le théâtre; sens figuré: qualifie une action dont l'issue est incertaine, une lutte contre la mort qui émeut ceux qui en sont témoins"],
    ["épique", "qualifie une œuvre qui met en scène des événements historiques ou légendaires en mettant en valeur leur caractère grandiose ou héroïque; s'applique aussi à d'autres formes d'art (ex: cinéma)."],
    ["fantastique", "créé par l'imagination, qui n'existe pas dans la réalité, souvent avec connotation de bizarre, d'inquiétant."],
    ["humour", "disposition d'esprit qui consiste à faire apparaître les aspects drôles ou insolites de la réalité, par exemple en prenant au sérieux ce qui ne l'est pas et vice versa"],
    ["ironie", "manière de critiquer une chose ou de s'en moquer en disant le contraire de ce que l'on pense, en faisant comme si l'on était d'accord avec le point de vue opposé"],
    ["merveilleux", "qui étonne ou enchante par son caractère magique ou miraculeux, avec la connotation d'heureux ou d'admirable"],
    ["une parodie", "sens propre: imitation burlesque d'une œuvre sérieuse; sens figuré: imitation regrettable d'une action respectable"],
    ["réalisme", "volonté de donner dans une œuvre une vision exacte de la réalité telle qu'elle est, d'où parfois une certaine tendance à insister sur les aspects grossiers, répugnants de la réalité"],
    ["utopie", "gouvernement imaginaire et idéal / conception ou projet qui paraît irréalisable, mais qui peut pourtant être fructueux; parfois employé avec une nuance péjorative"],
    ["romanesque", "sens propre: qui se trouve dans les romans; sens figuré (avec nuances parfois péjorative): qualifie un esprit qui a tendance à s'évader de ka réalité, à se complaire dans un monde plus agréable que la réalité, comme on en trouve dans les romans"],
    ["tragique", "qualifie la situation d'un être qui paraît victime de la fatalité, qui s'efforce en vain d'échapper à son destin"],
    ["épistolaire", "qui concerne la correspondance"],
    ["Satires", "type d'écrit ou de discours qui critique une personne, une œuvre ou une institutions, en s'en moquant avec verve et virulence"],
    ["culture", "aventure personnelle qui tend à développer les qualités naturelles de l'individu, à le mettre en état de croissance intellectuels (selon Madeleine Hours)"],
    ["civilisation", "ensemble des aspects religieux et moraux, intellectuels, scientifiques et techniques ainsi que des pratiques sociales commune à un peuple ou à un groupe de peuples (peut sous entendre le progrès par rapport à un état primitif)"],
    ["connotation", "ensemble des valeurs affectives attachées à un mot en plus de son sens propre"],
    ["ellipse", "omission d'un mot qui se trouve ainsi sous-entendu; raccourci ou sous-entendu dans un récit ou un film"],
    ["euphémique", "expression atténuée pour parler d'une réalité déplaisante"],
    ["litote", "expression modéré d'une situation extrême"],
    ["métaphore", "comparaison condensée, figure de style fréquente en poésie"],
    ["néologisme", "mot nouveau ou sens nouveau d'un mot déjà existant"],
    ["symbole", "signe concret évoquant par un rapport qui paraît naturel quelque chose d'invisible; objet ou image de la réalité ayant des correspondance avec la vie intérieure"]
                ]
            }
        }
    }
};
