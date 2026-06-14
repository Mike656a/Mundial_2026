// ============================================================
// App.tsx — Raíz de la aplicación con enrutamiento (US-13)
// Rutas:
//   /                  → Dashboard (listado + filtros)
//   /partido/:matchId  → MatchDetail (sede, horas, países, XI)
// ============================================================

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import MatchDetail from './pages/MatchDetail';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/partido/:matchId" element={<MatchDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
