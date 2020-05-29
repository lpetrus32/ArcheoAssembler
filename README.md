# ArcheoAssembler

Dans le cadre de notre première année en Master de Bio-informatique à l'Université de Bordeaux, nous avons réalisé un projet de programmation. L'interface Web développée pour ce projet vise à faciliter l'utilisation d'un algorithme de ré-assemblage d'artefacts. Cet algorithme, basé sur les graphes et les réseaux de neurones, propose aux scientifiques des reconstructions 2D de poteries à partir de fragments récupérés lors de fouilles archéologiques.

## Auteurs

Ce projet a été co-réalisé par Louis PETRUS, Hamza JLAJLA, Valentine LESOURD-AUBERT, Rémy JELIN et Julie PRATX.

## License

L'algorithme Python utilisé dans ce projet possède une license publique générale GNU v3.0.

# Programme

Dans cette section, vous trouvez tout ce qu'il y a savoir ce programme : comment le faire démarrer sur votre ordinateur, ses fonctionnalités principales ainsi que le détail des fonctions utilisées.

## Pré-requis pour le démarrage

Vous répertorierez vos données de fouilles dans un fichier de données tabulaires (tableur excel ou équivalent), dans lequel chaque ligne correspond à un artefact, et chaque colonne est associée à un attribut (langue, site de fouille, date, etc...).
Parmi les attributs, un correspond à la clef primaire du tableau et ses valeurs correspondent aux identifiants des images de fragments associés. Vous préparerez un répertoire d’images de fragments pour tout ou une partie des artefacts renseignés dans le fichier de données.
Vous nécessiterez un fichier contenant la séquence nucléique de  votre gène à séquencer. Cette séquence devra être conforme dans son intégralité à l'exemple du read fourni en introduction.

## Fonctionnalités

### Les données et les images

A partir de l'interface, vous pourrez visualiser votre banque de données. Les valeurs vous seront accessibles, vous pourrez ajouter des données comme en supprimer. Il vous sera également possible de les modifier.
Les images liées aux données apparaîtront à l'écran en appuyant sur le bouton PICTURES.
Vous retrouverez le nombre d'artefacts chargés en bas à droite du bloc de paramétrage des filtres.

### Paramétrage des filtres

Des paramètres de filtrage des données peuvent être entrer par les listes déroulantes et les champs de saisie dans le bloc situé au-dessus des données affichées sur l'interface.
Vous appliquerez un filtre comme suit :

 - Choisissez un attribut dans la liste déroulante en 1.,
 - Choisissez une valeur dans la seconde liste déroulante 2. ou entrez une valeur sous forme d'opérateur logique (>,<,==) dans le champs de saisie,
 - Appuyez sur APPLY.

Pour supprimer l'intégralité des filtres appliqués, il suffit d'appuyer sur le bouton CLEAR situé en haut à droite.

### Sélection d'artefact

Pour sélectionner un artefact, il vous suffira de cliquer sur la ligne et l'image correspondante s'affichera dans l'encart de sélection situé à droite de l'écran (bouton </>).

### Lancer un assemblage

Dans l'encart de sélection, vous pourrez lancer un assemblage de vos artefacts et ainsi tenter une reconstruction 2D en cliquant sur START ASSEMBLY.

## Technologies

Pour ce qui est de l'assemblage d'artefact et de la reconstruction 2D de poteries, le présent projet est basé sur l'utilisation des algorithmes Python que vous trouverez sur ce lien : [Github OstraNet](https://github.com/CeciliaOstertag/OstraNet.git).

Le module SheetJS js-xlsx est un outils de données de feuille de calcul qui est utile à la conversion des données : [Github SheetJS](https://github.com/SheetJS/sheetjs.git).


## Conçu avec :

 - Visual Studio Code (programmation en JavaScript/HTML/CSS)
<!--stackedit_data:
eyJoaXN0b3J5IjpbMTc0NDQ2MDM0NF19
-->