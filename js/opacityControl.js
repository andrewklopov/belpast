import { LAYERS_IMAGERY, LAYERS_MAPS, LAYERS_PLACES } from "./layers.js";

function updateOpacity() {
  var opacity = document.getElementById('opacitySlider').value;
  var regionSelect = document.getElementById('regionSelect');
  var yearSelect = document.getElementById('yearSelect');
  var mapTypeSelect = document.getElementById('mapTypeSelect');
  var region = regionSelect.value;
  var year = yearSelect.value;
  var mapType = mapTypeSelect.value;

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
  }
}


document.getElementById('opacitySlider').addEventListener('input', updateOpacity);