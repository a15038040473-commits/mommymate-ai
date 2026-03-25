import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import DailyDetail from './pages/DailyDetail';
import MonthSwitch from './pages/MonthSwitch';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/daily/:dayId" element={<DailyDetail />} />
        <Route path="/month" element={<MonthSwitch />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
