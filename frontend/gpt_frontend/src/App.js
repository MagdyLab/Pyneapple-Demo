// import logo from './logo.svg';
// import './App.css';
// import MapComponent from './MapComponent';
// import ShapefileComponent from './ShapefileComponent';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;

import React, { useState } from 'react';
import './App.css';
import MapComponent from './MapComponent';
import FileSelector from './FileSelector.js';
import QueryInput from './QueryInput';

export const SelectedFileContext = React.createContext();

function App() {
  const [selectedFile, setSelectedFile] = useState(null);

  return (
    <div className="App">
      <SelectedFileContext.Provider value={ [selectedFile, setSelectedFile ]}>
        <MapComponent />
        {/* <QueryInput /> */}
        {/* <FileSelector /> */}
      </SelectedFileContext.Provider>
    </div>
  );
}

export default App;


