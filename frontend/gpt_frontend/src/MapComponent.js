import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, GeoJSON, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet'; // Import leaflet
import 'leaflet/dist/leaflet.css';
import FileSelector from './FileSelector.js';
import QueryInput from './QueryInput.js';
// import {ColorMap} from './ColorMap.js';

// This component will receive the geoJSON data as a prop and update the map bounds when it changes
function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

const createColorMap = (labels) => {
  const uniqueLabels = [...new Set(labels)];
  let colorMap = {};
  uniqueLabels.forEach(label => {
    colorMap[label] = getRandomColor();
  });
  return colorMap;
}

let featureCounter = 0;

const styleFeature = (feature, labels, colorMap) => {
  if (!labels || labels.length === 0) {
    return { fillColor: 'transparent', fillOpacity: 0.6, weight: 2, opacity: 1, color: 'black', dashArray: '3' };
  }
  const featureLabel = labels[featureCounter]; // Adjust YOUR_UNIQUE_ID_FIELD to whatever unique field identifies each feature
  featureCounter++;
          return {
            fillColor: colorMap[featureLabel] || 'transparent',
            fillOpacity: 0.7,
            weight: 1,
            color: 'black',
          };
  // const label = feature.properties.label; 
  // const color = colorMap[label] || 'transparent';  // Default to transparent if color not found

  // return {
  //   fillColor: color,
  //   weight: 1,
  //   opacity: 1,
  //   color: 'white',  // Outline color
  //   fillOpacity: 0.7
  // };
};


function GeoJSONLayer({ data, labels, colorMap }) {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    if (data) {
      featureCounter = 0;
      // If there is a previous layer, remove it
      if (layerRef.current) {
        // layerRef.current.remove();
        map.removeLayer(layerRef.current);
      }

      // Create the new layer
      const geojsonLayer = L.geoJson(data, {
        style: (feature) => styleFeature(feature, labels, colorMap)
      });

      // Add the new layer to the map
      geojsonLayer.addTo(map);

      // Fit the map view to the layer bounds
      const bounds = geojsonLayer.getBounds();
      map.fitBounds(bounds);

      // Keep track of the new layer
      layerRef.current = geojsonLayer;
    }
  }, [data, map, colorMap, labels]);

  
  // return data ? <GeoJSON data={data} /> : null;
}

const MapComponent = () => {
  const [geoJSON, setGeoJSON] = useState(null);
  const [labels, setLabels] = useState([]);
  const [colorMap, setColorMap] = useState({});
  
  useEffect(() => {
    console.log('GeoJSON state:', geoJSON); // Log geoJSON state whenever it changes
  }, [geoJSON]);


  const handleLabelsReceived = (receivedLabels) => {
      console.log('Received labels:', receivedLabels);
      setLabels(receivedLabels);
      setColorMap(createColorMap(receivedLabels));
      console.log("ColorMap: " ,colorMap);
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: '0 0 20%', padding: '10px' }}>
        <FileSelector setGeoJSON={setGeoJSON} setLabels={setLabels} setColorMap={setColorMap}/>
        
        <QueryInput 
          style={{ minHeight: '5em', width: '100%' }}
          onQuerySubmit={(query) => console.log(query)} 
          OnLabelsReceived={handleLabelsReceived} 
      />
      </div>
      <div style={{ flex: '1', position: 'relative' }}>
        <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer // Add a TileLayer for the basemap
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />
          <GeoJSONLayer data={geoJSON} labels={labels} colorMap={colorMap} />
        </MapContainer>
      </div>
    </div>
  );
};

export default MapComponent;
