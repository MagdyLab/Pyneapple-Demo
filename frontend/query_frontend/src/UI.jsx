import React, { useState } from 'react';
import logo from './pyneapple-logo-9.png';
import RangeSlider from './RangeSlider';
import './App.css';
import './UI.css';
import MapContainer from './MapContainer';
import ExecutionTimeChart from './ExecutionTimeChart';

const FileSelector = ({ selectedFile, handleChange, files }) => (
  <div className="select-container">
    <label htmlFor="selectedFile">Select File:</label>
    <select
      id="selectedFile"
      value={selectedFile}
      onChange={handleChange}
      className="custom-select"
    >
      {files.map((file, index) => (
        <option value={file} key={index}>
          {file}
        </option>
      ))}
    </select>
  </div>
);
const DynamicDropdown = ({ label, id, value, handleApiParamChange, options }) => (
  <div className="select-container">
    <label htmlFor={id}>{id}:</label>
    <select
      id={id}
      value={value}
      label={label}
      onChange={(e) => {
        console.log('Selected value:', e.target.value);
        handleApiParamChange(e.target.value);
      }}
      className="custom-select"
    >
      {options.map((option, index) => (
        <option value={option} key={index}>
          {option}
        </option>
      ))}
    </select>

  </div>
);

const ApiTypeSelector = ({ apiType, handleApiTypeChange }) => (
  <div className="select-container">
    <label htmlFor="apiType">Algorithm Type:</label>
    <select
      id="apiType"
      value={apiType}
      onChange={handleApiTypeChange}
      className="parameter-input"
    >
      <option value="emp">Expressive max-p</option>
      <option value="generalizedP">Generalized p</option>
      <option value="libraryMaxP">Max-p Pysal</option>
      <option value="ScalableMaxP">Scalable Max-p</option>
      <option value="compareMaxP">Max-p Comparision</option>
    </select>
  </div>
);

const FetchButton = ({ fetchData }) => (
  <div className="button-container">
    <label>&nbsp;</label>
    <button onClick={fetchData} className="custom-button">
      Fetch Data
    </button>
  </div>
);


const WeightSelector = ({ weight, handleWeightChange }) => (
  <div className="select-container">
    <label htmlFor="weight">Weight:</label>
    <select
      id="weight"
      value={weight}
      onChange={handleWeightChange}
      className="custom-select"
    >
      <option value="Rook">Rook</option>
      <option value="Queen">Queen</option>
    </select>
  </div>
);
const ParameterInput = ({ label, id, value, handleChange }) => (
  <div className="input-container">
    <label htmlFor={id}>{label}:</label>
    <input
      type="text"
      id={id}
      name={id}
      value={value}
      onChange={handleChange}
      className="parameter-input"
    />
  </div>
);

const Slider = ({ apiParams, handleApiParamChange, labels }) => (
  <div>
    <RangeSlider
      labelLow={labels.low}
      labelHigh={labels.high}
      lowValue={apiParams[labels.low]}
      highValue={apiParams[labels.high]}
      onSliderChange={(type, value) => {
        const name = type === 'low' ? labels.low : labels.high;
        handleApiParamChange({ target: { name, value } });
      }}
    />
  </div>
);
const FileUpload = ({ onFileChange, onFileUpload }) => (
  <div className="upload-container">
    <label htmlFor="file">Upload File:</label>
    <input
      type="file"
      id="file"
      onChange={onFileChange}
      className="file-upload-input"
      multiple
    />
    <button onClick={onFileUpload} className="upload-button">
      Upload
    </button>
  </div>
);
const apiTypeParams = {
  emp: ['file_name', 'disname', 'minName', 'minLow', 'minHigh', 'maxName', 'maxLow', 'maxHigh', 'avgName', 'avgLow', 'avgHigh', 'sumName', 'sumLow', 'sumHigh', 'countName', 'countLow', 'countHigh'],
  generalizedP: ['sim_attr', 'ext_attr', 'threshold', 'p'],
  libraryMaxP: ['attr_name', 'threshold_name', 'threshold'],
  ScalableMaxP: ['sim_attr', 'ext_attr', 'threshold'],
  compareMaxP: ['sim_attr', 'ext_attr', 'threshold']
};






function UI({
  selectedFile,
  handleChange,
  files,
  fetchData,
  apiParams,
  handleWeightChange,
  handleApiParamChange,
  apiType,
  handleApiTypeChange,
  metrics,
  onFileChange,
  onFileUpload,
  labels1,
  dropdownData,
}) {
  const currentParams = apiTypeParams[apiType];

  const [isPanelVisible, setIsPanelVisible] = useState(false);



  const togglePanelVisibility = () => {
    setIsPanelVisible((prevVisible) => !prevVisible);
  };
  const renderMaps = () => {
    if (apiType === 'compareMaxP') {
      return (
        <div className="maps-container">
          <div className="map-container">
            <MapContainer selectedFile={selectedFile} apiParams={apiParams} labels={labels1} mapIndex={2} />
          </div>
        </div>

      );
    } else {

    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <img src={logo} alt="Logo" className="logo" />
        <h1 className="app-title">Pyneapple App Demo</h1>
      </header>
      <div className="app-body">
        <div className="show-panel-button" onClick={togglePanelVisibility} title="Show Panel">
          {isPanelVisible ? <span>&#9664;</span> : <span>&#9654;</span>}
        </div>
        {isPanelVisible && (
          <div className="left-panel">
            <FileSelector
              selectedFile={selectedFile}
              handleChange={handleChange}
              files={files}
            />
            <WeightSelector weight={apiParams.weight} handleWeightChange={handleWeightChange} />
            <FileUpload onFileChange={onFileChange} onFileUpload={onFileUpload} />
            <ApiTypeSelector
              apiType={apiType}
              handleApiTypeChange={handleApiTypeChange}
            />
            <FetchButton fetchData={fetchData} />
            <div className="api-params">
              {apiType === 'emp' ?
                <React.Fragment>

                  <DynamicDropdown
                    key="disname"  // You can use a static key here since you have only one dynamic dropdown
                    id="disname"
                    label="disname"
                    value={apiParams['disname']}
                    //handleApiParamChange={handleApiParamChange}
                    handleApiParamChange={(value) => handleApiParamChange({ target: { name: 'disname', value } })}
                    options={dropdownData}
                  />

                  {['min', 'max', 'avg', 'sum', 'count'].map((param, index) => (
                    <React.Fragment key={index}>
                      <DynamicDropdown
                        label={`${param}Name`}
                        id={`${param}Name`}
                        value={apiParams[`${param}Name`]}
                        handleApiParamChange={(value) => handleApiParamChange({ target: { name: `${param}Name`, value } })}
                        options={dropdownData}
                      />
                      <Slider
                        apiParams={apiParams}
                        handleApiParamChange={handleApiParamChange}
                        labels={{ low: `${param}Low`, high: `${param}High` }}
                      />
                    </React.Fragment>
                  ))}
                </React.Fragment>
                :
                currentParams.map((param, index) => (
                  param !== 'threshold' && param !== 'p' ? (
                    <DynamicDropdown
                    key={index}
                      label={param}
                      id={param}
                      value={apiParams[param]}
                      handleApiParamChange={(value) => handleApiParamChange({ target: { name: param, value } })}
                      options={dropdownData}
                     // apiParams={apiParams} // Pass apiParams here
                    />
                  ) : (
                    <ParameterInput
                      key={index}
                      label={param}
                      id={param}
                      value={apiParams[param]}
                      handleChange={handleApiParamChange}
                    />
                  )
                ))
              }
              {apiType === 'compareMaxP' && (
                <div className="metrics-panel">
                  <h2>Metrics</h2>
                  {metrics.map((metric, index) => (
                    <div className="metric-value" key={index}>
                      <label>{metric.name}: </label>
                      <span>{metric.value}</span>
                    </div>
                  ))}
                  <div className="chart-container">
                  <h2>Comparison Chart Execution Time</h2>
                    <ExecutionTimeChart data={[metrics[0], metrics[1]]} />
                    <h2>Speed Up</h2>
                    <ExecutionTimeChart data={[metrics[2]]} w={250} h={150} caption='speedup %' color = '#F85000' />
                  </div>
                </div>

              )}
            </div>
          </div>
        )}
        <div className="map-container">
          <div id="mapid"></div>
        </div>
        {renderMaps()}
      </div>
    </div>
  );
}

export default UI;

