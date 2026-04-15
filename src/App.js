import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";  // ← tambahkan Navigate
import Login from "./Login";
import Register from "./Register";
import Home from "./Home";
import Barang from "./Barang";
import History from "./History";
import Tambahkar from "./Tambahkar";
import Admnbrg from "./Admnbrg";
import AdminB from "./AdminB";
import Admncuti from "./Admncuti";
import AdminC from "./AdminC";
import HistoryPermohonan from "./Historypermohonan";
import Historycuti from "./Historycuti";

import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Tambahkan baris ini untuk redirect dari "/" ke "/login" */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/barang" element={<Barang />} />
        <Route path="/history" element={<History />} />
        <Route path="/tambahkar" element={<Tambahkar />} />
        <Route path="/adminB" element={<AdminB />} />
        <Route path="/admnbrg" element={<Admnbrg />} />
        <Route path="/admncuti" element={<Admncuti />} />
        <Route path="/adminC" element={<AdminC />} />
        <Route path="/historypermohonan" element={<HistoryPermohonan />} />
        <Route path="/historycuti" element={<Historycuti />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;