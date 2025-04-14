import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FileUpload from './file_upload';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Knowledge Graph Builder</h1>
      </header>
      
      <main className="app-main">
        <FileUpload />
      </main>
      
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default App;