import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Homepage from './pages/Homepage';
import Feed from './pages/Feed';
import Analytics from './pages/Analytics';

function App() {
  return (
    <Router>
      <div className="d-flex">
        <Sidebar />  
        <div className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/homepage" element={<Homepage />} />
            <Route path="/feed" element={<Feed/>} />
            <Route path="/analytics" element={<Analytics/>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;