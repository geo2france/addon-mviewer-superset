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

1. **Configuration** : Les paramètres de mviewer (comme les couches, les styles de masque, etc.) sont configurés via le fichier `JS` de l'addon mviewer.
2. **Rendu** : Dans Superset, la carte mviewer est intégré comme un composant Handlebars pour actualiser mviewer en fonction des filtres.

### Fonctionnement dans Superset

1. **Installation** : La carte mviewer est appelé via un graphique de type Handlebar dans Superset.
2. **Utilisation** : Les utilisateurs ajoute dans le composant handlebar le code de l'iframe mviewer (mode u conseillé) en ajoutant les variables mentionnées dans le fichier js de l'addon.

```handlebars
<iframe width="800" height="500" style="border:none;" src="https://www.geo2france.fr/mviewer/?l=ocs2d_enaf_2021*enaf&lb=osmgp2&config=apps/geo2france/ocs2d_enaf_ss.xml&mode=u&epci={{#each data}}{{#if @last}}{{codepci}}{{else}}{{codepci}},{{/if}}{{/each}}&communes={{#each data}}{{#if @last}}{{codgeo}}{{else}}{{codgeo}},{{/if}}{{/each}}&scot={{#each data}}{{#if @last}}{{codscot}}{{else}}{{codscot}},{{/if}}{{/each}}"></iframe>
```

---

## Custom Component mviewer (dossier `poc`) - Non retenu pour la production

Cette preuve de concept explorait une alternative pour intégrer mviewer dans Superset, mais la méthode n'a pas été jugée satisfaisante en raison de limitations techniques ou des pré-requis de formalisation des couches.

### Cas d'usage

Avoir une cartographie d'une couche disposant de plusieurs états (exemple : réalisé, en cours, abandonné) intégré dans un tableau de bord d'indicateurs.
La carte (mviewer) se synchronise lors de la sélection d'un filtre (superset) en affichant un ou plusieurs états d'une couche spécifique (c-a-d un élément de légende).

### Fonctionnement de l'addon

1. **Configuration** : Les paramètres de mviewer (comme les couches, les états, etc.) sont configurés via le fichier `JS` de l'addon mviewer.
2. **Rendu** : Dans Superset, la carte mviewer est intégré comme un composant Handlebars pour actualiser mviewer en fonction des filtres.

Problème au lieu d'avoir une seule et même couche et de traiter l'appel selon un élement de légende, la couche a été éclatée pour chaque état et publié comme 5 flux distinct. Ce n'est pas le comportement attendu obligeant l'administrateur de données à dupliquer ces flux. Sur une donnée disposant potentiellement d'un grand nombre de classes, cela devient rapidement ingérable.

### Fonctionnement dans Superset

1. **Installation** : La carte mviewer est appelé via un graphique de type Handlebar dans Superset.
2. **Utilisation** : Les utilisateurs ajoute dans le composant handlebar le code de l'iframe mviewer (mode u conseillé) en ajoutant les variables mentionnées dans le fichier js de l'addon.

```handlebars
<iframe width="800" height="400" style="border:none;" src="https://localhost/mv/?layer={{#each data}}{{#if @last}}{{etat}}{{else}}{{etat}},{{/if}}{{/each}}&departement={{#each data}}{{#if @last}}{{dep}}{{else}}{{dep}},{{/if}}{{/each}}&epci={{#each data}}{{#if @last}}{{epci}}{{else}}{{epci}},{{/if}}{{/each}}&x=701046&y=6870863&z=7.245605029440839&l=DEPARTEMENT*polygone_bord_orange_transparent%2Crefus*%2Cabandon*%2Cinstruction*%2Caccorde_constr*%2Crealise*&lb=osmgp1&config=apps/my_project.xml&mode=u"></iframe>
```

---

### Contributions

Les contributions sont les bienvenues ! Veuillez ouvrir une issue ou une pull request pour discuter des améliorations ou des corrections.
L'idéal serait de pouvoir facilement combiner ces deux types de besoins :

- Zoom sur un ou plusieurs niveaux d'emprise géographique
- Filtrage d'une ou plusieurs classes d'une couche
