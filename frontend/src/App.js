// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TrackingPage from './Track';
import Main from './Main';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route exact path="/track" element={<TrackingPage />} />
        <Route path='/' element={<Main/>}/>
        <Route path="/:shortcode" element={<Navigate to="https://oof.fwshk.ninja/:shortcode" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
