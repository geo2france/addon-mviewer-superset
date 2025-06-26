//------------------- CONSTANTES ET UTILITAIRES -----------------

// ✅ Liste des layers possibles
const layers = ["realise", "instruction", "refus", "accorde_constr", "abandon"];

// 🎨 Styles prédéfinis pour les couches cartographiques
const epciStyle = new ol.style.Style({
  fill: new ol.style.Fill({ color: "rgba(255, 255, 255, 0.1)" }),
  stroke: new ol.style.Stroke({ color: "black", width: 2 }),
});

const departmentStyle = new ol.style.Style({
  stroke: new ol.style.Stroke({ color: "orange", width: 2 }),
});

// 🔄 Normalisation des chaînes (suppression des accents et conversion en minuscule)
// Permet d'harmoniser les comparaisons de texte pour éviter les erreurs dues aux accents.
function normalizeString(str) {
  return str
    .normalize("NFD") // Décomposition en caractères de base + diacritiques
    .replace(/[\u0300-\u036f]/g, "") // Suppression des diacritiques
    .toLowerCase(); // Conversion en minuscule
}

// 🛠️ Gestion des erreurs réseau
// Effectue une requête GET pour récupérer un fichier JSON depuis une URL donnée.
async function fetchJson(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erreur réseau: ${response.statusText} (${response.status})`);
    }
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error);
    throw error;
  }
}

//------------------- LAYER -----------------

// 🚀 Initialisation de l'affichage des couches selon les paramètres d'URL
showLayersFromUrl();

function showLayersFromUrl() {
  const layerIds = getLayersFromUrl();
  if (layerIds.length > 0) {
    disableAllLayers(); // Désactive toutes les couches avant d'activer celles sélectionnées
    layerIds.forEach(toggleLayer);
  }
}

// 🔍 Récupération des couches spécifiées dans l'URL et conversion des codes abrégés
function getLayersFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const layerNames = urlParams.get("layer");
  if (!layerNames) return [];
  
  return layerNames
    .split(",")
    .map((name) => {
      switch (name.trim()) {
        case "RE": return "refus";
        case "REA": return "realise";
        case "AB": return "abandon";
        case "INS": return "instruction";
        case "TRA": return "accorde_constr";
        default: return name.trim();
      }
    })
    .filter((name) => layers.includes(name)); // Filtrage des noms valides
}

// ❌ Désactive toutes les couches visibles sur la carte
function disableAllLayers() {
  layers.forEach((layerId) => {
    const layer = mviewer.getLayer(layerId);
    if (layer) layer.layer.setVisible(false);
  });
}

// ✅ Active la couche spécifiée si elle existe
function toggleLayer(layerId) {
  const layer = mviewer.getLayer(layerId);
  if (layer) layer.layer.setVisible(true);
}

//------------------- EPCI -----------------

// 🚀 Chargement et filtrage des EPCI (établissements publics de coopération intercommunale)
const epciCodes = getEPCICodesFromUrl();
let epciLoaded = false;
if (epciCodes.length > 0) {
  epciLoaded = true;
  loadAndFilterFeatures(
    epciCodes,
    "epci",
    "code_epci",
    epciStyle
  );
}

// 🔍 Extraction des codes EPCI depuis l'URL
function getEPCICodesFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const epciCodes = urlParams.get("epci");
  const codes = epciCodes ? epciCodes.split(",").map((code) => code.trim()) : [];
  
  if (codes.length > 5) {
    console.warn("Trop de codes EPCI (max: 5). Aucun code sélectionné.");
    return [];
  }
  return [...new Set(codes)]; // Suppression des doublons
}

//------------------- DEPARTEMENTS -----------------

// 📌 Récupération et affichage conditionnel des départements après un délai
setTimeout(() => {
  const departmentNames = getDepartmentNamesFromUrl();

  if (departmentNames.length > 0) {
    if (departmentNames.length >= 4) {
      console.log("Cinq départements sélectionnés. Aucun layer département affiché.");
      return;
    }

    // Chargement des départements uniquement si aucun EPCI n'a été trouvé
    if (!epciLoaded) {
      loadAndFilterFeatures(
        departmentNames,
        "DEPARTEMENT",
        "INSEE_DEP",
        departmentStyle,
        true
      );
    }
  }

  // 🔍 Extraction et normalisation des noms de départements depuis l'URL
  function getDepartmentNamesFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const departmentNames = urlParams.get("departement");
    const names = departmentNames
      ? departmentNames.split(",").map((name) => normalizeString(name.trim()))
      : [];
    return [...new Set(names)];
  }
}, "3000");

//------------------- FILTRAGE & AFFICHAGE -----------------

// 🗺️ Création d'un masque pour assombrir les zones non sélectionnées
function applyMaskOutsideSelection(selectedFeatures) {
    const map = mviewer.getMap();
    const extent = map.getView().calculateExtent(map.getSize());
    const fullExtentPolygon = ol.geom.Polygon.fromExtent(extent);
    
    const selectedGeometries = selectedFeatures.map(f => f.getGeometry());
    
    const maskGeometry = new ol.geom.Polygon(fullExtentPolygon.getCoordinates());
    selectedGeometries.forEach(geometry => {
        if (geometry instanceof ol.geom.Polygon) {
            maskGeometry.appendLinearRing(geometry.getLinearRing(0));
        } else if (geometry instanceof ol.geom.MultiPolygon) {
            geometry.getPolygons().forEach(polygon => {
                maskGeometry.appendLinearRing(polygon.getLinearRing(0));
            });
        }
    });
    
    const maskFeature = new ol.Feature(maskGeometry);
    const maskLayer = new ol.layer.Vector({
        source: new ol.source.Vector({ features: [maskFeature] }),
        style: new ol.style.Style({
            fill: new ol.style.Fill({ color: "rgba(255, 255, 255, 0.7)" })
        })
    });
    
    map.addLayer(maskLayer);
}

// 📥 Chargement et filtrage des entités (EPCI ou départements) selon les paramètres d'URL
async function loadAndFilterFeatures(keys, typeName, property, style, normalize = false) {
    const url = `https://www.geo2france.fr/geoserver/spld/ows?SERVICE=WFS&VERSION=1.0.0&REQUEST=GETFEATURE&TYPENAME=${typeName}&outputFormat=application/json`;

    try {
        const data = await fetchJson(url);
        const features = new ol.format.GeoJSON().readFeatures(data);

        const filteredFeatures = features.filter((feature) => {
            const featureValue = feature.get(property);
            if (!featureValue) return false;
            const normalizedValue = normalize ? normalizeString(featureValue) : featureValue;
            return keys.includes(normalizedValue);
        });

        if (filteredFeatures.length === 0) {
            console.warn(`Aucun ${typeName} trouvé pour les clés fournies.`);
            return;
        }

        const filteredSource = new ol.source.Vector({ features: filteredFeatures });
        const customLayer = new ol.layer.Vector({ source: filteredSource, style });
        mviewer.getMap().addLayer(customLayer);
        
        const extent = ol.extent.createEmpty();
        filteredFeatures.forEach((feature) => ol.extent.extend(extent, feature.getGeometry().getExtent()));
        mviewer.getMap().getView().fit(extent, { maxZoom: 16, duration: 1000 });
        
        applyMaskOutsideSelection(filteredFeatures);
    } catch (error) {
        console.error(`Erreur lors du chargement et du filtrage des ${typeName}:`, error);
    }
}
