import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AnalyzePage from './pages/AnalyzePage';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>SafeBash</h1>
        <p>Secure and trustable bash script installations</p>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/analyze" element={<AnalyzePage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
