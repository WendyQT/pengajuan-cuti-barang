import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [nip, setNip] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    // Validasi input
    if (!nip || !password) {
      alert("NIP dan Password harus diisi!");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost/sendik/login.php", 
        { nip, password },
        { 
          headers: { "Content-Type": "application/json" },
          timeout: 10000
        }
      );

      const data = response.data;

      if (data.status === "success") {
        const userData = data.user;
        
        // Simpan data user lengkap ke localStorage
        const userToStore = {
          id: userData.id,
          nama: userData.nama,
          nip: userData.nip,
          usertype: userData.usertype,
          jabatan: userData.jabatan || "",
          pos: userData.pos || userData.unit_kerja || ""
        };
        
        localStorage.setItem("user", JSON.stringify(userToStore));
        
        // Simpan juga secara terpisah untuk kompatibilitas
        localStorage.setItem("id", userData.id);
        localStorage.setItem("name", userData.nama);
        localStorage.setItem("nama", userData.nama);
        localStorage.setItem("usertype", userData.usertype);
        localStorage.setItem("nip", userData.nip);
        localStorage.setItem("jabatan", userData.jabatan || "");
        localStorage.setItem("pos", userData.pos || userData.unit_kerja || "");
        localStorage.setItem("unit_kerja", userData.pos || userData.unit_kerja || "");

        alert(`Selamat datang, ${userData.nama}!`);

        // 🔁 Routing berdasarkan usertype
        if (userData.usertype === "admin") {
          // Admin barang
          navigate("/Tambahkar");
        } 
        else if (userData.usertype === "admin_barang") {
          // Admin cuti
          navigate("/AdminB"); // sesuaikan dengan route admin cuti kamu
        } 
        else if (userData.usertype === "admin_cuti") {
          // Admin cuti
          navigate("/AdminC"); // sesuaikan dengan route admin cuti kamu
        } 
        else {
          // User biasa (pegawai)
          navigate("/home");
        }
      } else {
        alert(data.message || "Login gagal! Periksa NIP dan password Anda.");
      }
    } catch (error) {
      console.error("Login error:", error);
      
      if (error.code === 'ECONNABORTED') {
        alert("Koneksi timeout. Silakan coba lagi.");
      } else if (error.response) {
        alert(`Server error: ${error.response.data.message || error.response.status}`);
      } else if (error.request) {
        alert("Tidak dapat terhubung ke server. Pastikan server aktif.");
      } else {
        alert("Error: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow-lg" style={{ width: "400px" }}>
        <div className="text-center mb-4">
          <h3 className="mb-0">SENDIK</h3>
          <p className="text-muted"></p>
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">NIP</label>
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-person-badge"></i>
            </span>
            <input
              className="form-control"
              placeholder="Masukan NIP"
              value={nip}
              onChange={(e) => setNip(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label fw-bold">Kata Sandi</label>
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-lock"></i>
            </span>
            <input
              className="form-control"
              placeholder="Masukan Kata Sandi"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
          </div>
        </div>

        <button 
          className="btn btn-primary w-100 py-2 fw-bold" 
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Memproses...
            </>
          ) : (
            <>
              <i className="bi bi-box-arrow-in-right me-2"></i>
              Masuk
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default Login;