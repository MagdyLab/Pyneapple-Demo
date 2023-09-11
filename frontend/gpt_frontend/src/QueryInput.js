import React, { useState, useContext, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { SelectedFileContext } from './App';

const QueryInput = ({ onQuerySubmit, OnLabelsReceived }) => {
  const { transcript, resetTranscript, listening } = useSpeechRecognition();
  const [query, setQuery] = useState("");
  const [conversation, setConversation] = useState([]);
  const [selectedFile, setSelectedFile] = useContext(SelectedFileContext);
//   const [plotLabels, setPlotLabels] = useState([]);

  useEffect(() => {
    if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
      return null;
    }
  }, [])

  const handleQueryChange = event => {
    setQuery(event.target.value);
  };

  const handleQuerySubmit = async () => {
    console.log(selectedFile);
    console.log(query);

    const response = await fetch(`http://localhost:8000/gpt_end_point/process_query?user_query=${encodeURIComponent(query)}&file_name=${encodeURIComponent(selectedFile)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Backend response: ",data)
      const plotData = JSON.parse(data.plot);
      console.log("Backend plot data: ",plotData.labels)
      OnLabelsReceived && OnLabelsReceived(plotData.labels);
      setConversation(prev => [...prev, { text: "YOU: " + query, type: 'user' }, { text: "AI: " + data.gptResponse, type: 'ai' }]);
      setQuery(""); // Clear the query after it has been submitted
    

  } else {
    console.error('Server response:', response);
  }
};

  const startListening = () => {
    SpeechRecognition.startListening({ continuous: true });
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
    setQuery(transcript);
  };

  return (
    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ height: '600px', overflow: 'auto', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
        {conversation.map((c, index) => (
          <p key={index} style={{ textAlign: c.type === 'user' ? 'left' : 'right', color: c.type === 'user' ? 'blue' : 'green' }}>
            {c.text}
          </p>
        ))}
      </div>
      <textarea value={query} onChange={handleQueryChange} rows={3} style={{ marginTop: '10px', width: '100%', resize: 'none' }} placeholder="Type or speak your query here" />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
        <button disabled={listening} onClick={startListening}>Start</button>
        <button disabled={!listening} onClick={stopListening}>Stop</button>
        <button onClick={() => { resetTranscript(); setQuery(""); }}>Reset</button>
        <button onClick={handleQuerySubmit}>Submit Query</button>
      </div>
    </div>
  );
};

export default QueryInput;
