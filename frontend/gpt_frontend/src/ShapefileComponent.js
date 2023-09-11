import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { read } from 'shapefile';

const ShapefileComponent = () => {
  const [geojson, setGeojson] = useState(null);
  const [shapefiles, setShapefiles] = useState([]);
  const [selectedShapefile, setSelectedShapefile] = useState('');

  // Fetch the list of shapefiles when the component mounts
  useEffect(() => {
    axios.get('http://localhost:8000/listfiles/')
      .then(response => {
        setShapefiles(response.data);
        setSelectedShapefile(response.data[0]); // Select the first shapefile by default
      })
      .catch(error => console.log(error));
  }, []);

  // Load the selected shapefile
  useEffect(() => {
    if (!selectedShapefile) return; // If no shapefile is selected, do nothing

    axios.get(`http://localhost:8000/files/${selectedShapefile}`, { responseType: 'arraybuffer' })
      .then(response => {
        const reader = new FileReader();
        reader.onload = function () {
          read(reader.result)
            .then(data => setGeojson(data));
        };
        reader.readAsArrayBuffer(new Blob([response.data]));
      })
      .catch(error => console.log(error));
  }, [selectedShapefile]); // This effect runs whenever selectedShapefile changes

  return (
    <div>
      <select value={selectedShapefile} onChange={e => setSelectedShapefile(e.target.value)}>
        {shapefiles.map(file => <option key={file} value={file}>{file}</option>)}
      </select>
      {/* The rest of your component here, e.g., displaying the GeoJSON */}
    </div>
  );
};

export default ShapefileComponent;
