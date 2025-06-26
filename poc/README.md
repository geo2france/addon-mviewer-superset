# 🚀 Custom Component - MViewer Integration
[![forthebadge](https://forthebadge.com/images/badges/built-with-swag.svg)](https://forthebadge.com)
[![forthebadge](https://forthebadge.com/images/badges/ctrl-c-ctrl-v.svg)](https://forthebadge.com)

Bienvenue dans le Custom Component MViewer 🎉 ! Ce composant est conçu pour ajouter une interaction transparente entre votre tableau de bord Apache Superset et MViewer. Il permet d'envoyer des filtres depuis Superset vers MViewer via l'URL. Simple et efficace ! 😎

## 📖 Description

Le Custom Component MViewer permet d'enrichir vos tableaux de bord Superset en y intégrant des cartes interactives issues de MViewer. Vous pouvez filtrer dynamiquement les données sur la carte en fonction des sélections faites dans Superset. 🔥
Ce composant permet de filtrer par EPCI, layer ou départements

## 🚧 Prérequis

Avant de commencer la configuration, assurez-vous d'avoir  :
- 🐍Apache Superset (version 4.0 ou supérieure)
- 🗺️ Mviewer (version 3.10 ou supérieure)


## 🛠️ 1. Configuration Mviewer

### 📍 Ajouter le Custom Component à MViewer

1. Copiez le dossier dans le dossier apps de votre projet MViewer. 📂

2. Ajoutez cette ligne à la fin du fichier de configuration de MViewer (`default.xml`) :

```xml
<extension type="component" id="cc_superset_eolien" path="./apps"/>
```
L'id correspond au nom du dossier

3. Vérifiez dans la console du navigateur (F12) si l'extension est bien chargée. Vous devriez voir :
```text
cc_superset_eolien is successfully loaded ✅
```

> ✔️ Bravo vous venez de rajouter votre Custom Component à MViewer


## 🖥️ 2. Configuration de Superset

### 🗂️ Étape 1 : Création du Dataset 

Créez un nouveau dataset à partir de la requête SQL suivante pour obtenir les différents états des éoliennes en fonction des EPCI :

```sql
WITH all_states AS (
    SELECT 'AB' AS etat_eolie, 'Abandonnés' AS type_eolie
    UNION ALL
    SELECT 'REA', 'Réalisés'
    UNION ALL
    SELECT 'INS', 'En cours d''instruction'
    UNION ALL
    SELECT 'TRA', 'Accordés ou en construction'
    UNION ALL
    SELECT 'RE', 'Refusés'
),
epci_data AS (
    SELECT DISTINCT 
        e.Nom_comple, 
        e.epci, 
        e.dep, 
        d.nom
    FROM 
        eolien.eolien_pts_hdf e
    LEFT JOIN 
        departements_hdf d 
    ON 
        e.dep = d.code
)

SELECT
    s.etat_eolie,
    e.Nom_comple,
    e.epci,
    e.dep,
    e.nom,
    s.type_eolie

FROM
    all_states s
CROSS JOIN
    epci_data e
ORDER BY
    e.Nom_comple, s.etat_eolie;
WITH all_states AS (
    SELECT 'AB' AS etat_eolie, 'Abandonnés' AS type_eolie
    UNION ALL
    SELECT 'REA', 'Réalisés'
    UNION ALL
    SELECT 'INS', 'En cours d''instruction'
    UNION ALL
    SELECT 'TRA', 'Accordés ou en construction'
    UNION ALL
    SELECT 'RE', 'Refusés'
),
epci_data AS (
    SELECT DISTINCT 
        e.Nom_comple, 
        e.epci, 
        e.dep, 
        d.nom
    FROM 
        eolien.eolien_pts_hdf e
    LEFT JOIN 
        departements_hdf d 
    ON 
        e.dep = d.code
)

SELECT
    s.etat_eolie,
    e.Nom_comple,
    e.epci,
    e.dep,
    e.nom,
    s.type_eolie

FROM
    all_states s
CROSS JOIN
    epci_data e
ORDER BY
    e.Nom_comple, s.etat_eolie;

```


> 💡 Astuce : Cette requête génère une liste de tous les EPCI avec chaque type d'état des éoliennes.

### 🗺️ Étape 2 : Intégration HandleBar pour Superset

Pour afficher une carte MViewer dans un tableau de bord Superset, créez un chart de type HandleBar :

1. Limitez les dimensions à etat_eolie et epci.

2. Dans l'onglet Personnaliser, ajoutez ce code HTML pour intégrer une carte MViewer dynamique :

```html
<iframe 
    width="800" 
    height="500" 
    style="border:none;" 
    src="{https://{LIEN-CARTE}}?layer={{#each data}}{{#if @last}}{{etat_eolie}}{{else}}{{etat_eolie}},{{/if}}{{/each}}&epci={{#each data}}{{#if @last}}{{epci}}{{else}}{{epci}},{{/if}}{{/each}}&x=719675&y=7012000&z=8&l=DEPARTEMENT*polygone_bord_orange_transparent%2Crefus*%2Cabandon*%2Cinstruction*%2Caccorde_constr*%2Crealise*&lb=osmgp1&config=apps/default.xml&mode=u">

</iframe>
  ```
Cette iframe affiche votre carte MViewer avec les filtres appliqués en fonction des données sélectionnées dans le tableau de bord. 
- Les `{{#each data}}` permettent de parcourir chaque element.
- Les `{{if}}` permettent de séparer chaque élément par des virgules.


> ✔️ Vous êtes désormais prêt à ajouter des cartes Mviewer à vos tableaux de bord.

<img align="center" src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZTQ3YmE2ZjdjMzZkODU3YTM0ODRkMjY1NmJiNjQ3YTFmZDk2ZWIyZCZlcD12MV9pbnRlcm5hbF9naWZzX2dpZklkJmN0PWc/VbnUQpnihPSIgIXuZv/giphy.gif" width="auto" height="100" />