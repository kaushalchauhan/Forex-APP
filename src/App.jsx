import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ForexRates from './components/ForexRates';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ForexRates />} />
      </Routes>
    </Router>
  );
};

export default App;
