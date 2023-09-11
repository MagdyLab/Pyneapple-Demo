import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { SelectedFileContext } from './App';

const FileSelector = ({ setGeoJSON, setLabels, setColorMap}) => {

  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useContext(SelectedFileContext);

  useEffect(() => {
    axios.get('http://localhost:8000/listFiles')
      .then(response => {
        if (Array.isArray(response.data)) {
          setFiles(response.data);
          setSelectedFile(response.data[0] || '');
        } else {
          console.error('Expected an array but received:', response.data);
        }
      })
      .catch(error => console.error('Error fetching files:', error));
  }, [setSelectedFile]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.value);
    // setCurrFile(event.target.value);  
  };

  const handleLoadButtonClick = () => {
    console.log('Button clicked - handleLoadButtonClick called');
    axios.get(`http://localhost:8000/files/${selectedFile}`)
      .then(response => {
        console.log('Response from API:', response.data); // Check the response data from the API
        setGeoJSON(response.data); // Set the geoJSON state with the data
        setLabels([]); // Reset labels
        setColorMap({}); // Reset colorMap
        console.log('GeoJSON data set:', response.data); // Log the data set to geoJSON

        axios.get(`http://localhost:8000/gpt_end_point/generate_description/${selectedFile}`)
        .then(descResponse => {
          console.log('Description Status:', descResponse.data.status);
          // Optionally, you can set the description in a state or show it in the UI
        })
        .catch(error => console.error('Error fetching description:', error));
      })
      .catch(error => console.error('Error fetching file data:', error));
};

  

  return (
    <div>
      <label>Select a file: </label>
      <select value={selectedFile} onChange={handleFileChange}>
        {files.map(file => (
          <option key={file} value={file}>
            {file}
          </option>
        ))}
      </select>
      <button onClick={handleLoadButtonClick}>Load</button>
    </div>
  );
};

export default FileSelector;
