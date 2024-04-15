import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';

const apiUrl = process.env.REACT_APP_API_URL;

const FileDrop = ({ onTransactionsUpdate }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [fileName, setFileName] = useState('');
  const [bank, setBank] = useState('');

  const banks = {
    Amex: 4, // Amex uses column number 3
    CIBC: 4, // CIBC uses column number 4
    TD: 6   // TD uses column number 6
  };

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.name.endsWith('.csv')) {
      if (!bank) {
        alert("Please select a bank before uploading the file.");
        return;
      }
      setIsProcessing(true);
      setIsComplete(false);
      setFileName(file.name);

      Papa.parse(file, {
        complete: (result) => {
          console.log('Parsed data:', result.data);
          // Extract descriptions based on selected bank's column index
        //   const descriptions = result.data.map(row => row[banks[bank] - 1]); // Adjusting index as array is zero-based
        //   console.log('Transaction Descriptions:', descriptions);
          uploadData(result.data);
        },
        header: false
      });
    } else {
      alert("Please upload a file with a .csv extension.");
    }
  }, [bank]);

  const uploadData = async (data) => {
    try {
        const response = await fetch(`${apiUrl}api/process-transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: data, bankName: bank }) // Assume 'Amex' or have user select it
        });
        const responseData = await response.json();
        setIsProcessing(false);
        setIsComplete(true);
        onTransactionsUpdate(responseData.data);
        console.log('Server response:', responseData);
    } catch (error) {
        console.error('Error uploading data:', error);
    }
};

  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    onDrop,
    multiple: false,
    accept: '.csv'
  });

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <select value={bank} onChange={(e) => setBank(e.target.value)} style={{ marginBottom: '20px' }}>
        <option value="">Select your bank</option>
        <option value="Amex">Amex</option>
        <option value="CIBC">CIBC</option>
        <option value="TD">TD</option>
      </select>
      <div {...getRootProps()} style={{ border: '2px dashed #007bff', padding: '20px' }}>
        <input {...getInputProps()} />
        {isDragActive ?
          <p>Drop the CSV file here ...</p> :
          !isComplete ? 
            <p>Drag 'n' drop a CSV file here, or click to select a file. Only CSV files are accepted.</p> : 
            <p>File processed: {fileName} <button onClick={() => setIsComplete(false)}>Replace File</button></p>
        }
        {isProcessing && <p>Loading...</p>}
      </div>
    </div>
  );
};

export default FileDrop;
