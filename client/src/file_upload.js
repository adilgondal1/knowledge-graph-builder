import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import './file_upload.css';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    // Check if file exists
    if (!selectedFile) {
      setFile(null);
      return;
    }
    
    // Validate file type
    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      setFile(null);
      e.target.value = '';
      return;
    }
    
    setFile(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFile = e.dataTransfer.files[0];
    
    // Check if file exists
    if (!droppedFile) return;
    
    // Validate file type
    if (!droppedFile.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }
    
    setFile(droppedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please select a CSV file to upload');
      return;
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    setUploading(true);
    
    try {
      // Upload file to server
      const response = await axios.post('/api/upload-csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Check response
      if (response.data.success) {
        toast.success('CSV uploaded successfully! Processing started.');
        setFile(null);
        // Reset file input
        document.getElementById('file-input').value = '';
      } else {
        toast.error('Error uploading CSV: ' + response.data.message);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload CSV file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <div 
        className="upload-area"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="upload-content">
          <h2>Upload CSV File</h2>
          <p>Drag and drop your CSV file here, or click to select</p>
          
          <input
            id="file-input"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="file-input"
          />
          
          <label htmlFor="file-input" className="file-label">
            Select CSV
          </label>
          
          {file && (
            <div className="file-info">
              <p>Selected file: {file.name}</p>
              <button 
                className="upload-button"
                onClick={handleSubmit}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload CSV'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;