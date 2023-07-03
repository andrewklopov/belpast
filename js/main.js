import { LAYERS_IMAGERY, LAYERS_MAPS, LAYERS_PLACES } from "./layers.js";
import { MAP_INITIAL_SETTINGS } from "/js/settings.js";

// Base layers
var osm = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', { attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors', minZoom: 1, maxZoom: 16 });


// Map
var map = L.map('map', {
  ...MAP_INITIAL_SETTINGS,
  layers: [osm]
});

L.control.zoom({
  position: 'bottomleft'  // 'topleft', 'topright', 'bottomleft' or 'bottomright'
}).addTo(map);

// Title
var title = L.control();
title.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'ctl title');
  this.update();
  return this._div;
};
title.update = function (props) {
  this._div.innerHTML = "BELARUS OLD MAPS";
};
title.addTo(map);

// Fit to overlay bounds (SW and NE points with (lat, lon))
map.fitBounds([[47.616300056188734, 33.13424593848343], [58.67369399516687, 17.7626839537081]]);



// GeoJSON layer with Belarus border
var borderLayer = L.geoJson(null, {
  style: {
    color: "red",
    weight: 4,
    opacity: 1,
    fill: false
  },
  // Load border data from GeoJSON file
  onEachFeature: function (feature, layer) {
    layer.bindPopup("<strong>" + feature.properties.name + "</strong>");
  }
});

// Load border data from GeoJSON file
var borderData = "./border.geojson";
fetch(borderData)
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    borderLayer.addData(data);
    // Add border layer to the map
    borderLayer.addTo(map);
    // Adjust map bounds to show the border layer
    map.fitBounds(borderLayer.getBounds());
  });


// Describe changing of layers via selects

window.onload = function () {
  let coll = document.getElementsByClassName("collapsible");
  let i;

  for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function () {
      this.classList.toggle("active");
      let content = this.nextElementSibling;
      if (content.style.maxHeight) {
        content.style.maxHeight = null;
      } else {
        content.style.maxHeight = content.scrollHeight + "px";
      }
    });
  }
  populateSelects();

  // Assign event listeners to selects
  document.getElementById('mapTypeSelect').addEventListener('change', function () {
    updateRegionOptions();
    updateYearOptions();
    changeMap()
  });
  document.getElementById('regionSelect').addEventListener('change', updateYearOptions);

  document.getElementById('yearSelect').addEventListener('change', changeMap);
}


function populateSelects() {
  var mapTypeSelect = document.getElementById('mapTypeSelect');
  var mapTypes = ['Regions', 'Places', 'Imagery'];

  for (var i = 0; i < mapTypes.length; i++) {
    var option = document.createElement('option');
    option.value = mapTypes[i];
    option.text = mapTypes[i];
    mapTypeSelect.add(option);
  }
  updateRegionOptions();
  updateYearOptions();
}

function updateRegionOptions() {
  var regionSelect = document.getElementById('regionSelect');
  var mapType = document.getElementById('mapTypeSelect').value;
  regionSelect.innerHTML = ''; // clear list of regions

  var regions = {};
  if (mapType === 'Regions') {
    regions = LAYERS_MAPS;
  } else if (mapType === 'Imagery') {
    regions = LAYERS_IMAGERY;
  } else if (mapType === 'Places') {
    regions = LAYERS_PLACES;
  }

  for (var region in regions) {
    var option = document.createElement('option');
    option.value = region;
    option.text = region.charAt(0).toUpperCase() + region.slice(1);
    regionSelect.add(option);
  }
}

function updateYearOptions() {
  var regionSelect = document.getElementById('regionSelect');
  var yearSelect = document.getElementById('yearSelect');
  var mapType = document.getElementById('mapTypeSelect').value;
  yearSelect.innerHTML = '';
  var region = regionSelect.value;

  var regions = {};
  if (mapType === 'Regions') {
    regions = LAYERS_MAPS;
  } else if (mapType === 'Imagery') {
    regions = LAYERS_IMAGERY;
  } else if (mapType === 'Places') {
    regions = LAYERS_PLACES;
  }

  const sorted = Object.entries(regions[region]).sort(([yearA], [yearB]) => {
    const comparesionAsStrings = yearA - yearB
    if (!Number.isNaN(comparesionAsStrings)) return comparesionAsStrings
    // мат операции вроде '1696' - '1696_2' дадут результат NaN. В этом случае приведём '1696_2' к '1696.2'
    return yearA.replace('_', '.') - yearB.replace('_', '.')
  })

  sorted.forEach(([year, layerSettings]) => {
    var option = document.createElement('option');
    option.value = year;
    option.text = year;
    yearSelect.add(option);
  })
  // If options of year succesufully updated and chosed option of year's, than call changeMap()
  if (yearSelect.options[yearSelect.selectedIndex]) {
    changeMap();
  }
}

function changeMap() {
  var regionSelect = document.getElementById('regionSelect');
  var yearSelect = document.getElementById('yearSelect');
  var mapTypeSelect = document.getElementById('mapTypeSelect');
  var region = regionSelect.value;
  var year = yearSelect.value;
  var mapType = mapTypeSelect.value;
  var opacity = document.getElementById('opacitySlider').value;

  // clearing of all layers
  for (var r in LAYERS_MAPS) {
    for (var y in LAYERS_MAPS[r]) {
      map.removeLayer(LAYERS_MAPS[r][y]);
    }
  }
  for (var p in LAYERS_PLACES) {
    for (var y in LAYERS_PLACES[p]) {
      map.removeLayer(LAYERS_PLACES[p][y]);
    }
  }
  for (var i in LAYERS_IMAGERY) {
    for (var y in LAYERS_IMAGERY[i]) {
      map.removeLayer(LAYERS_IMAGERY[i][y]);
    }
  }

  var layers = {};
  if (mapType === 'Regions') {
    layers = LAYERS_MAPS;
  } else if (mapType === 'Imagery') {
    layers = LAYERS_IMAGERY;
  } else if (mapType === 'Places') {
    layers = LAYERS_PLACES;
  }

  if (layers[region] && layers[region][year]) {
    layers[region][year].setOpacity(opacity);
    map.addLayer(layers[region][year]);
  }
}