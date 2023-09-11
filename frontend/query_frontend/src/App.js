import React, { useState, useEffect } from 'react';
import axios from 'axios';
import L from 'leaflet';
import * as shapefile from 'shapefile';
import UI from './UI';

function App() {
  const [geoLayer, setGeoLayer] = useState(null);
  const [map, setMap] = useState(null);
  const [selectedFile, setSelectedFile] = useState('LACity');
  const [files, setFiles] = useState([]);
  const [dropdownData, setDropdownData] = useState([]);
  const [file, setFile] = useState(null);
  const [labels1, setLabels] = useState([]);
  const [apiParams, setApiParams] = useState({
    file_name: `${selectedFile}.shp`,
    disname: 'households',
    minName: 'pop_16up',
    minLow: -1000000,
    minHigh: 1000000,
    maxName: 'pop_16up',
    maxLow: -1000000,
    maxHigh: 1000000,
    avgName: 'employed',
    avgLow: -1000000,
    avgHigh: 1000000,
    sumName: 'pop2010',
    sumLow: -1000000,
    sumHigh: 1000000,
    countLow: -1000000,
    countHigh: 1000000,
    weight: 'Rook',
    sim_attr :'households'
  });
  const [apiType, setApiType] = useState('emp');

const handleApiTypeChange = (event) => {
  setApiType(event.target.value);
};

const onFileChange = event => {
  setFile(event.target.files[0]);
};

const onFileUpload = () => {
  const formData = new FormData();
  formData.append("file", file);
  axios.post(`http://localhost:8000/upload`, formData);
};
const apiTypeParams = {
  emp: ['file_name', 'disname','minName', 'minLow', 'minHigh', 'maxName', 'maxLow', 'maxHigh', 'avgName', 'avgLow', 'avgHigh', 'sumName', 'sumLow', 'sumHigh','countName', 'countLow', 'countHigh'],
  generalizedP: ['file_name',  'sim_attr', 'ext_attr', 'threshold','p'],
  libraryMaxP: ['file_name',  'attr_name', 'threshold_name', 'threshold'],
  ScalableMaxP : ['file_name',  'sim_attr', 'ext_attr', 'threshold'],
  compareMaxP: ['file_name',  'sim_attr', 'ext_attr', 'threshold']
  // add the mappings for the other API types here
};

const [metrics, setMetrics] = useState([
  { name: 'ScalableMaxP Execution Time', value: 0 },
  { name: 'LibraryMaxP Execution Time', value: 0 },
  { name: 'Speed Up (Percentage)', value: 0 },
]);

useEffect(() => {
  let fileName = selectedFile.endsWith('.shp') ? selectedFile : `${selectedFile}.shp`
  fetch(`http://localhost:8000/dfDetails?filename=${fileName}`)
    .then(response => response.json())
    .then(data => {
      // Extracting just the names from the response for the dropdown
      const names = data.map(item => item[0]);
      setDropdownData(names);
    })
    .catch(error => console.error("Error fetching the dropdown data:", error));
}, [selectedFile]);

  useEffect(() => {
    if (selectedFile) {
      let fileName = selectedFile.endsWith('.shp') ? selectedFile : `${selectedFile}.shp`;
      setApiParams((prevParams) => ({
        ...prevParams,
        file_name: fileName,
      }));
    }
  }, [selectedFile]);

  useEffect(() => {
    axios
      .get('http://localhost:8000/listFiles')
      .then((response) => {
        setFiles(response.data);
      })
      .catch((error) => {
        console.log('Error fetching files:', error);
      });
  }, []);

  useEffect(() => {
    if (!map) {
      const mymap = L.map('mapid').setView([34.0522, -118.2437], 10);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(mymap);
      setMap(mymap);
    }
  }, [map]);
  

  useEffect(() => {
    if (map && selectedFile) {
      if (geoLayer) {
        map.removeLayer(geoLayer);
      }
      shapefile
        .read(`http://localhost:8003/${selectedFile}`)
        .then(({ features }) => {
          const newGeoLayer = L.geoJSON(features, {
            style: (feature) => {
              return {
                fillColor: getColor(feature.properties.POP),
                color: '#000',
                fillOpacity: 0.5,
              };
            },
            onEachFeature: (feature, layer) => {
              layer.on('click', function () {
                if (geoLayer) {
                  geoLayer.setStyle({ fillOpacity: 0.5 });
                  layer.setStyle({ fillOpacity: 1 });
                }
              });
  
              const tooltipContent = `Tract: ${feature.properties.TRACTCE10}\nTotal Population: ${feature.properties.POP}`;
              layer.bindTooltip(tooltipContent).openTooltip();
            },
          }).addTo(map);
  
          setGeoLayer(newGeoLayer);
  
          // Calculate the center and zoom level based on GeoJSON layer's bounding box
          if (features.length > 0) {
            const layerBounds = newGeoLayer.getBounds();
            const center = layerBounds.getCenter();
            const zoom = map.getBoundsZoom(layerBounds);
            map.setView(center, zoom);
          }
        })
        .catch((error) => {
          console.log('Error loading shapefile:', error);
        });
    }
  }, [map, selectedFile]);
  useEffect(() => {
    if (map && geoLayer)  {
      if (geoLayer) {
        map.removeLayer(geoLayer);
      }
      shapefile
        .read(`http://localhost:8003/${selectedFile}`)
        .then(({ features }) => {
          const newGeoLayer = L.geoJSON(features, {
            style: (feature) => {
              return {
                fillColor: getColor(feature.properties.POP),
                color: '#000',
                fillOpacity: 0.5,
              };
            },
            onEachFeature: (feature, layer) => {

              const tooltipContent = `Tract: ${feature.properties.TRACTCE10}\nTotal Population: ${feature.properties.POP}`;
              layer.bindTooltip(tooltipContent).openTooltip();
            },
          }).addTo(map);

          setGeoLayer(newGeoLayer);
        })
        .catch((error) => {
          console.log('Error loading shapefile:', error);
        });
    }
    setGeoLayer(null);
  }, [apiType, map]);

  function fetchData() {
    const currentParams = apiTypeParams[apiType] || apiTypeParams.default;

    const filteredParams = {};
    for (const param of currentParams) {
      filteredParams[param] = apiParams[param];
    }
    filteredParams.weight = apiParams.weight;
  if(apiType==='compareMaxP'){
    axios
    .get(`http://localhost:8000/api/endpoint/${apiType}`, {
      params: filteredParams,
    })
      .then((response) => {
        const labels = response.data.ScalableMaxP_Labels[1];
        const data = response.data;
        setLabels(response.data.LibraryMaxP_Labels[1]);
        // Step 3: Parse the data and update the state with the new metric values
        setMetrics([
          { name: 'ScalableMaxP Execution Time', value: data.ScalableMaxP_ExecutionTime },
          { name: 'LibraryMaxP Execution Time', value: data.LibraryMaxP_ExecutionTime },
          { name: 'Speed Up (Percentage)', value: data['Total_SpeedUp(Percentage)'] },
        ]);
        

        // Create a mapping from labels to colors
        const labelColorMap = {};
        labels.forEach((label) => {
          if (!labelColorMap[label]) {
            labelColorMap[label] = getRandomColor();
          }
        });

        setGeoLayer((currentGeoLayer) => {
          let labelIndex = 0;
          currentGeoLayer.eachLayer(function (layer) {
            const label = labels[labelIndex];
            const color = labelColorMap[label];
            layer.setStyle({ fillColor: color });
            layer.bindTooltip(`${label}`);
            labelIndex += 1;
          });

          return currentGeoLayer;
        });
      })
      .catch((error) => {
        console.log('Error fetching data:', error);
      });
  }
  else if(apiType==='ScalableMaxP' || apiType==='libraryMaxP' || apiType==="generalizedP"){
    axios
    .get(`http://localhost:8000/api/endpoint/${apiType}`, {
      params: filteredParams,
    })
    .then((response) => {
      const labels = response.data.labels[1]
      // Create a mapping from labels to colors
      let labelColorIndex = 0;
      const contrastColors = [
        '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', 
        '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe',
        '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', 
        '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080', 
      ]; 
      // Create a mapping from labels to colors
      const labelColorMap = labels.reduce((acc, label) => {
        acc[label] = contrastColors[labelColorIndex % contrastColors.length];
        labelColorIndex++;
        return acc;
      }, {});

      setGeoLayer((currentGeoLayer) => {
        let labelIndex = 0;
        currentGeoLayer.eachLayer(function (layer) {
          const label = labels[labelIndex];
          const color = labelColorMap[label];
          layer.setStyle({ fillColor: color });
          layer.bindTooltip(`${label}`);
          labelIndex += 1;
        });

        return currentGeoLayer;
      });
    })
      .catch((error) => {
        console.log('Error fetching data:', error);
      });
  }
  else{
    axios
    .get(`http://localhost:8000/api/endpoint/${apiType}`, {
      params: filteredParams,
    })
      .then((response) => {
        const labels = response.data.labels;

        // Create a mapping from labels to colors
        const labelColorMap = {};
        labels.forEach((label) => {
          if (!labelColorMap[label]) {
            labelColorMap[label] = getRandomColor();
          }
        });

        setGeoLayer((currentGeoLayer) => {
          let labelIndex = 0;
          currentGeoLayer.eachLayer(function (layer) {
            const label = labels[labelIndex];
            const color = labelColorMap[label];
            layer.setStyle({ fillColor: color });
            layer.bindTooltip(`${label}`);
            labelIndex += 1;
          });

          return currentGeoLayer;
        });
      })
      .catch((error) => {
        console.log('Error fetching data:', error);
      });
    }
  }

  const handleChange = (event) => {
    setSelectedFile(event.target.value);
  };

  const handleApiParamChange = (event) => {
    const { name, value } = event.target;
    setApiParams((prevParams) => ({
      ...prevParams,
      [name]: value,
    }));
  };
  
  const handleWeightChange = (event) => {
    const newWeightValue = event.target.value;
    
    setApiParams((prevParams) => ({
      ...prevParams,
      weight: newWeightValue,
    }));
  };
  
  
  const getColor = (value) => {
    return '#000';
  };

  const getRandomColor = () => {
    let color = '#';
    const letters = '0123456789ABCDEF';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  return (
<UI
    selectedFile={selectedFile}
    handleChange={handleChange}
    files={files}
    dropdownData={dropdownData}
    fetchData={fetchData}
    apiParams={apiParams}
    handleApiParamChange={handleApiParamChange}
    apiType={apiType} // Pass apiType
    handleApiTypeChange={handleApiTypeChange} // Pass handleApiTypeChange
    handleWeightChange={handleWeightChange}
     metrics={metrics}
     onFileChange={onFileChange}
     onFileUpload={onFileUpload}
     labels1={labels1}
  />
  );
}

export default App;
