# addon-mviewer-superset

Cet addon permet l'intégration de mviewer dans les tableaux de bord Superset en utilisant le chart de type Handlebars.
Deux approches distinctes ont été réalisées pour cette intégration :

- le dossier `addons` correspond au composant mis en production dans un tableau de bord pour le filtrage par emprise géographique (SCoT, EPCI, commune)
- le dossier `poc` correspond à un composant qui n'a pas été déployé en production pour le filtrage de certaines classes d'une couche.

---

## Custom Component mviewer (dossier `addons`) - En production

Cet addon est conçu pour permettre aux utilisateurs de Superset d'intégrer des visualisations interactives générées par mviewer directement dans leurs tableaux de bord. Cela est particulièrement utile pour :

- Afficher des cartes dynamiques dans Superset.
- Combiner les capacités analytiques de Superset avec les fonctionnalités cartographiques de mviewer.

### Cas d'usage

**URL de production** : [Lien vers l'instance en production](https://www.geo2france.fr/superset/superset/dashboard/conso-enaf/?standalone=2)

Avoir une cartographie de la consommation des ENAF (Espace Naturel Agricole Forestier) intégré dans le tableau de bord des indicateurs calculés à partir d'OCS2D (OCcupation du Sol à 2 Dimensions).
Ce tableau de bord délivre des indicateurs sur plusieurs niveaux administratifs : SCoT, EPCI (intercommunalités) et communes.
La carte (mviewer) se synchronise lors de la sélection d'un filtre (superset) en exposant (via un masque) la zone géographique concernée.

### Fonctionnement de l'addon

1. **Handlebars** : L'addon utilise Handlebars pour générer des templates dynamiques qui actualisent mviewer.
2. **Configuration** : Les paramètres de mviewer (comme les couches, les styles, etc.) sont configurés via des variables passées au template.
3. **Rendu** : Dans Superset, la carte mviewer est intégré comme un composant interactif.

### Fonctionnement dans Superset

1. **Installation** : La carte mviewer est appelé via un graphique de type Handlebar dans Superset.
2. **Utilisation** : Les utilisateurs ajoute dans le composant handlebar le code de l'iframe mviewer (mode u conseillé) en ajoutant les variables mentionnées dans le fichier js de l'addon.

```handlebars
<iframe width="800" height="500" style="border:none;" src="https://www.geo2france.fr/mviewer/?l=ocs2d_enaf_2021*enaf&lb=osmgp2&config=apps/geo2france/ocs2d_enaf_ss.xml&mode=u&epci={{#each data}}{{#if @last}}{{codepci}}{{else}}{{codepci}},{{/if}}{{/each}}&communes={{#each data}}{{#if @last}}{{codgeo}}{{else}}{{codgeo}},{{/if}}{{/each}}&scot={{#each data}}{{#if @last}}{{codscot}}{{else}}{{codscot}},{{/if}}{{/each}}"></iframe>
```

3. **Interactivité** : Les cartes mviewer sont entièrement interactives, permettant des zooms, des filtres, et d'autres actions directement dans Superset.

---

## Custom Component mviewer (dossier `poc`) - Non retenu pour la production

Cette preuve de concept explorait une alternative pour intégrer mviewer dans Superset, mais la méthode n'a pas été jugée satisfaisante en raison de limitations techniques ou des pré-requis de formalisation des couches.

### Cas d'usage

Avoir une cartographie d'une couche disposant de plusieurs états (exemple : réalisé, en cours, abandonné) intégré dans un tableau de bord d'indicateurs.
La carte (mviewer) se synchronise lors de la sélection d'un filtre (superset) en exposant (via un masque) la zone géographique concernée.

### Fonctionnement de l'addon

1. **Approche alternative** : L'addon utilisait une méthode différente pour intégrer mviewer, comme une iframe ou une API personnalisée.
2. **Problèmes rencontrés** : Des problèmes de performance, de compatibilité ou de maintenance ont conduit à l'abandon de cette approche.

### Fonctionnement dans Superset

1. **Expérimentation** : Bien que fonctionnelle, cette méthode n'offrait pas une expérience utilisateur aussi fluide ou fiable que celle du dossier `addons`.
2. **Résultat** : La décision a été prise de ne pas déployer cette solution en production.

---

### Installation et configuration

### Contributions

Les contributions sont les bienvenues ! Veuillez ouvrir une issue ou une pull request pour discuter des améliorations ou des corrections.
L'idéal serait de pouvoir facilement combiner ces deux types de besoins :

- Zoom sur un ou plusieurs niveaux d'emprise géographique
- Filtrage d'une ou plusieurs classes d'une couche
