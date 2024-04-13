import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';

const FileDrop = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [fileName, setFileName] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];

    // Check if the file is a CSV
    if (file && file.name.endsWith('.csv')) {
      setIsProcessing(true);
      setIsComplete(false);
      setFileName(file.name);

      Papa.parse(file, {
        complete: (result) => {
          console.log('Parsed data:', result.data);
          setIsProcessing(false);
          setIsComplete(true);
        },
        header: true
      });
    } else {
      alert("Please upload a file with a .csv extension.");
    }
  }, []);

  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    onDrop,
    multiple: false,  // Ensure only one file is processed at a time
    accept: '.csv'  // Restrict file type to .csv
  });

  return (
    <div {...getRootProps()} style={{ border: '2px dashed #007bff', padding: '20px', textAlign: 'center' }}>
      <input {...getInputProps()} />
      {isDragActive ?
        <p>Drop the CSV file here ...</p> :
        !isComplete ? 
          <p>Drag 'n' drop a CSV file here, or click to select a file. Only CSV files are accepted.</p> : 
          <p>File processed: {fileName} <button onClick={() => setIsComplete(false)}>Replace File</button></p>
      }
      {isProcessing && <p>Loading...</p>}
    </div>
  );
};

export default FileDrop;
