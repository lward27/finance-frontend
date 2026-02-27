import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Explorer from './pages/Explorer';
import TickerDetail from './pages/TickerDetail';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/explorer" element={<Explorer />} />
            <Route path="/ticker/:symbol" element={<TickerDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
