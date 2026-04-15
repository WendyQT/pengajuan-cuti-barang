import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function Permohonan() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    tempat: "",
    jenis_permohonan: "",
    jumlah: "",
    keterangan: "",
    diajukanoleh: "",
    tanggal: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [userData, setUserData] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Ambil data user dari localStorage saat komponen dimuat
  useEffect(() => {
    loadUserData();
    // Set tanggal hari ini secara default
    const today = new Date().toISOString().split('T')[0];
    setForm(prev => ({ ...prev, tanggal: today }));
  }, []);

  // Fungsi untuk mengambil data user dari localStorage
  const loadUserData = () => {
    console.log("Mencoba mengambil data user dari localStorage...");
    
    try {
      // Coba ambil dari key 'user' terlebih dahulu
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        console.log("Data user ditemukan di localStorage dengan key 'user':", user);
        
        if (user.pos || user.pos) 
        if (user.nama || user.nama_lengkap) {
          setUserData(user);
          setForm(prev => ({
            ...prev,
            
            tempat: user.pos || user.pos || user.pos || "",
            diajukanoleh: user.nama_lengkap || user.nama || user.username || "",
          }));
          
          setIsLoadingUser(false);
          return;
        }
      }
      
      // Coba cari dengan key lainnya
      const possibleKeys = ['userData', 'userInfo', 'userProfile', 'currentUser', 'authUser'];
      for (const key of possibleKeys) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            if (parsed.pos || parsed.pos) 
            if (parsed.nama || parsed.nama_lengkap) {
              console.log(`Data user ditemukan di localStorage dengan key: ${key}`, parsed);
              setUserData(parsed);
              
              setForm(prev => ({
                ...prev,
                
                tempat: parsed.pos || parsed.pos || parsed.pos || "",
                diajukanoleh: parsed.nama_lengkap || parsed.nama || parsed.username || "",
              }));
              
              setIsLoadingUser(false);
              return;
            }
          } catch (e) {
            console.log(`Gagal parse data dari key ${key}:`, e);
          }
        }
      }
      
      console.log("Tidak ada data user ditemukan di localStorage");
      setIsLoadingUser(false);
      
    } catch (error) {
      console.error("Error loading user data:", error);
      setIsLoadingUser(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.tempat.trim()) newErrors.tempat = "";
    if (!form.jenis_permohonan.trim()) newErrors.jenis_permohonan = "Jenis permohonan harus diisi";
    if (!form.jumlah || form.jumlah <= 0) newErrors.jumlah = "Jumlah harus lebih dari 0";
    if (!form.diajukanoleh.trim()) newErrors.diajukanoleh = "Nama pengaju harus diisi";
    if (!form.tanggal) newErrors.tanggal = "Tanggal harus dipilih";
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setLoading(true);
    
    try {
      // Siapkan data yang akan dikirim
      const submitData = {
        tempat:  userData ? (userData.pos) : null,
        jenis_permohonan: form.jenis_permohonan,
        jumlah: parseInt(form.jumlah),
        keterangan: form.keterangan,
        diajukanoleh: form.diajukanoleh,
        tanggal: form.tanggal,
        user_id: userData ? (userData.id || userData.user_id) : null,
        user_nip: userData ? (userData.nip) : null
      };
      
      console.log("Mengirim data:", submitData);
      
      const response = await axios.post(
        "http://localhost/sendik/add.permohonan.php",
        submitData,
        { 
          headers: { "Content-Type": "application/json" },
          timeout: 10000
        }
      );
      
      if (response.data.success) {
        alert("Permohonan berhasil dikirim!");
      
        setForm({
          tempat: userData ? (userData.pos || userData.pos || userData.pos || "") : "",
          jenis_permohonan: "",
          jumlah: "",
          keterangan: "",
          diajukanoleh: userData ? (userData.nama_lengkap || userData.nama || userData.username || "") : "",
          tanggal: new Date().toISOString().split('T')[0],
        });
        setErrors({});
        
        // Optional: Redirect ke history setelah 2 detik
        setTimeout(() => {
          navigate("/historypermohonan");
        }, 2000);
      } else {
        alert("Gagal mengirim permohonan: " + (response.data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      
      if (error.response) {
        alert(`Server Error: ${error.response.status} - ${error.response.data.message || "Unknown error"}`);
      } else if (error.request) {
        alert("Tidak ada response dari server. Pastikan backend berjalan.");
      } else {
        alert("Error: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fungsi logout yang lebih komprehensif
  const handleLogout = () => {
    // Konfirmasi logout
    if (window.confirm("Apakah Anda yakin ingin logout?")) {
      // Hapus semua data user dari localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('userData');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('userProfile');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authUser');
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      
      // Hapus sessionStorage
      sessionStorage.clear();
      
      // Redirect ke halaman login
      navigate("/login", { replace: true });
    }
  };

  // Fungsi untuk kembali ke halaman home
  const handleBackToHome = () => {
    navigate("/login");
  };

  // Tampilkan loading saat mengambil data user
  if (isLoadingUser) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Memuat data user...</p>
        </div>
      </div>
    );
  }

  return (
    <>
        {/* Navbar */}
    <nav className="navbar navbar-expand-lg shadow sticky-top" style={{ 
  background: 'linear-gradient(135deg, #667eea 0%, #4b78a2 100%)'
}}>
  <div className="container">
    {/* Brand/Logo */}
    <a className="navbar-brand d-flex align-items-center" href="/home">
      <i className="bi bi-box-seam fs-4 me-2" style={{ color: '#f0f0f0' }}></i>
      <span className="fw-bold" style={{ color: '#ffffff' }}>SENDIK</span>
      <small className="ms-2 d-none d-md-inline" style={{ color: '#e0e0e0' }}>Permohonan Barang</small>
    </a>
    
    {/* Toggle Button */}
    <button 
      className="navbar-toggler" 
      type="button" 
      data-bs-toggle="collapse" 
      data-bs-target="#navbarNav"
    >
      <span className="navbar-toggler-icon"></span>
    </button>
    
    {/* Menu Navigasi */}
    <div className="collapse navbar-collapse" id="navbarNav">
      <ul className="navbar-nav ms-auto">
        <li className="nav-item">
          <a className="nav-link active" href="/home" style={{ 
            color: '#ffffff',
             fontWeight: 'bold', 
             }}>
            <i className="bi bi-calendar-check me-1"></i> 
            Pengajuan Cuti
          </a>
        </li>
        <li className="nav-item">
          <a className="nav-link active" href="/Barang" style={{ 
            color: '#ffffff', 
            fontWeight: 'bold',
          }}>
            <i className="bi bi-plus-circle me-1"></i> 
            Ajukan Barang
          </a>
        </li>
        <li className="nav-item">
          <a className="nav-link" href="/historypermohonan" style={{
             color: '#fffefe',
             fontWeight: 'bold', }}>
            <i className="bi bi-clock-history me-1"></i> 
          Riwayat
          </a>
        </li>
      </ul>
    </div>
  </div>
</nav>

      {/* Main Content */}
      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-md-10">
            <div className="card shadow border-0">
              <div className="card-header bg-primary text-white">
                <div className="d-flex align-items-center">
                  <i className="bi bi-clipboard-plus fs-4 me-3"></i>
                  <div>
                    <h4 className="mb-0">Form Permohonan Barang</h4>
                    <small className="opacity-75">Isi form untuk mengajukan permintaan barang</small>
                  </div>
                </div>
              </div>
              
              <div className="card-body p-4">
                {!userData && (
                  <div className="alert alert-warning mb-4">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-exclamation-triangle fs-4 me-3"></i>
                      <div>
                        <strong>Belum Login!</strong>
                        <br />
                        <small>Silakan login terlebih dahulu untuk mengajukan permohonan barang.</small>
                        <div className="mt-2">
                          <button className="btn btn-warning btn-sm" onClick={() => navigate("/login")}>
                            <i className="bi bi-box-arrow-in-right me-1"></i>
                            Login Sekarang
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  {/* Tempat - Diisi Manual */}
                  <div className="mb-3">
                    <label htmlFor="tempat" className="form-label fw-semibold">
                      <i className="bi bi-building me-1"></i> Tempat/Lokasi <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      id="tempat"
                      name="tempat"
                      className={`form-control ${errors.pos ? 'is-invalid' : ''}`}
                     
                      value={form.pos}
                      onChange={handleChange}
                      required
                    />
                    {errors.tempat && (
                      <div className="invalid-feedback">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.tempat}
                      </div>
                    )}
                    
                  </div>

                  {/* Jenis Permohonan */}
                  <div className="mb-3">
                    <label htmlFor="jenis_permohonan" className="form-label fw-semibold">
                      <i className="bi bi-tags me-1"></i> Jenis Permohonan <span className="text-danger">*</span>
                    </label>
                    <select
                      id="jenis_permohonan"
                      name="jenis_permohonan"
                      className={`form-control ${errors.jenis_permohonan ? 'is-invalid' : ''}`}
                      value={form.jenis_permohonan}
                      onChange={handleChange}
                    >
                      <option value="">Pilih jenis permohonan</option>
                      <option value="ATK">ATK (Alat Tulis Kantor)</option>
                      <option value="Peralatan Kantor">Peralatan Kantor</option>
                      <option value="Elektronik">Elektronik</option>
                      <option value="Furniture">Furniture / Mebel</option>
                      <option value="IT Equipment">IT Equipment</option>
                      <option value="Konsumsi">Konsumsi / Snack</option>
                      <option value="Kebersihan">Peralatan Kebersihan</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                    {errors.jenis_permohonan && (
                      <div className="invalid-feedback">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.jenis_permohonan}
                      </div>
                    )}
                  </div>

                  {/* Jumlah */}
                  <div className="mb-3">
                    <label htmlFor="jumlah" className="form-label fw-semibold">
                      <i className="bi bi-hash me-1"></i> Jumlah Barang <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      id="jumlah"
                      name="jumlah"
                      min="1"
                      className={`form-control ${errors.jumlah ? 'is-invalid' : ''}`}
                      placeholder="Masukkan jumlah barang"
                      value={form.jumlah}
                      onChange={handleChange}
                    />
                    {errors.jumlah && (
                      <div className="invalid-feedback">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.jumlah}
                      </div>
                    )}
                  </div>

                  {/* Keterangan */}
                  <div className="mb-3">
                    <label htmlFor="keterangan" className="form-label fw-semibold">
                      <i className="bi bi-card-text me-1"></i> Keterangan (Opsional)
                    </label>
                    <textarea
                      id="keterangan"
                      name="keterangan"
                      className="form-control"
                      rows="3"
                      placeholder="Tambahkan keterangan atau spesifikasi barang yang diajukan..."
                      value={form.keterangan}
                      onChange={handleChange}
                    />
                    <div className="form-text">
                      Jelaskan secara detail tentang barang yang diajukan jika diperlukan
                    </div>
                  </div>

                  {/* Diajukan Oleh - Otomatis dari user data */}
                  <div className="mb-3">
                    <label htmlFor="diajukanoleh" className="form-label fw-semibold">
                      <i className="bi bi-person me-1"></i> Diajukan Oleh <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      id="diajukanoleh"
                      name="diajukanoleh"
                      className={`form-control ${errors.diajukanoleh ? 'is-invalid' : ''} bg-light`}
                      value={form.diajukanoleh}
                      readOnly
                    />
                    {errors.diajukanoleh && (
                      <div className="invalid-feedback">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.diajukanoleh}
                      </div>
                    )}
                   
                  </div>

                  {/* Tanggal */}
                  <div className="mb-4">
                    <label htmlFor="tanggal" className="form-label fw-semibold">
                      <i className="bi bi-calendar me-1"></i> Tanggal Permohonan <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      id="tanggal"
                      name="tanggal"
                      className={`form-control ${errors.tanggal ? 'is-invalid' : ''}`}
                      value={form.tanggal}
                      onChange={handleChange}
                    />
                    {errors.tanggal && (
                      <div className="invalid-feedback">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.tanggal}
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="d-grid gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={loading || !userData}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Mengirim...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-send me-2"></i>
                          Kirim Permohonan
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        setForm({
                          tempat: userData ? (userData.pos || userData.pos || userData.pos || "") : "",
                          jenis_permohonan: "",
                          jumlah: "",
                          keterangan: "",
                          diajukanoleh: userData ? (userData.nama_lengkap || userData.nama || userData.username || "") : "",
                          tanggal: new Date().toISOString().split('T')[0],
                        });
                        setErrors({});
                      }}
                      disabled={loading}
                    >
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      Reset Form
                    </button>
                  </div>
                </form>
              </div>
              
              
            </div>
            
            
          </div>
        </div>
      </div>

      
    </>
  );
}

export default Permohonan;