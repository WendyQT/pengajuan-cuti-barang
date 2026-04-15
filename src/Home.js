import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

function Cuti() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [userData, setUserData] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  const [formData, setFormData] = useState({
    nama: "",
    nip: "",
    jabatan: "",
    unit_kerja: "",
    periode_tahun: new Date().getFullYear(),
    tanggal_mulai: "",
    tanggal_selesai: "",
    keperluan: "",
    alamat: "",
    no_telp: "",
    hak_cuti_tahunan: "",
    hak_cuti_dipergunakan: "",
    hak_cuti_sisa: "",
    hak_cuti_diminta: "",
    hak_cuti_sisa_akhir: "",
    petugas_pengganti_nama: "",
    petugas_pengganti_jabatan: "",
    petugas_pengganti_alamat: "",
    catatan_kordinator: ""
  });

  // Fungsi untuk mengambil data user dari localStorage dan data cuti dari tabel karyawan
  const loadUserData = async () => {
    console.log("Mencoba mengambil data user dari localStorage...");
    
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        console.log("Data user ditemukan di localStorage:", user);
        
        if (user.nama && user.nip && user.jabatan && user.pos) {
          setUserData(user);
          
          // Ambil data cuti karyawan dari API/database
          await fetchCutiKaryawan(user.id || user.nip);
          
          setFormData(prev => ({
            ...prev,
            nama: user.nama || "",
            nip: user.nip || "",
            jabatan: user.jabatan || "",
            unit_kerja: user.pos || ""
          }));
          setDataLoaded(true);
          return;
        }
      }
      
      // Cek kemungkinan key lain
      const possibleKeys = ['userData', 'userInfo', 'userProfile', 'currentUser', 'authUser'];
      for (const key of possibleKeys) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            if (parsed.nama && parsed.nip) {
              console.log(`Data user ditemukan di localStorage dengan key: ${key}`, parsed);
              setUserData(parsed);
              
              // Ambil data cuti karyawan
              await fetchCutiKaryawan(parsed.id || parsed.nip);
              
              setFormData(prev => ({
                ...prev,
                nama: parsed.nama || "",
                nip: parsed.nip || "",
                jabatan: parsed.jabatan || "",
                unit_kerja: parsed.pos || parsed.unit_kerja || ""
              }));
              setDataLoaded(true);
              return;
            }
          } catch (e) {
            console.log(`Gagal parse data dari key ${key}:`, e);
          }
        }
      }
      
      console.log("Tidak ada data user ditemukan di localStorage");
      setDataLoaded(true);
      
    } catch (error) {
      console.error("Error loading user data:", error);
      setDataLoaded(true);
    }
  };

  // Fungsi untuk mengambil data cuti karyawan dari database
  const fetchCutiKaryawan = async (userId) => {
    try {
      // Panggil API untuk mendapatkan data cuti karyawan
      const response = await axios.get(`http://localhost/sendik/get_cuti_karyawan.php`, {
        params: { user_id: userId }
      });
      
      if (response.data.success && response.data.data) {
        const cutiData = response.data.data;
        setFormData(prev => ({
          ...prev,
          hak_cuti_tahunan: cutiData.hak_cuti_tahunan || "12", // Default 12 hari
          hak_cuti_dipergunakan: cutiData.hak_cuti_dipergunakan || "0",
          hak_cuti_sisa: cutiData.hak_cuti_sisa || "12",
          hak_cuti_sisa_akhir: cutiData.hak_cuti_sisa || "12"
        }));
      } else {
        // Data default jika tidak ada di database
        setFormData(prev => ({
          ...prev,
          hak_cuti_tahunan: "12",
          hak_cuti_dipergunakan: "0",
          hak_cuti_sisa: "12",
          hak_cuti_sisa_akhir: "12"
        }));
      }
    } catch (error) {
      console.error("Error fetching cuti data:", error);
      // Data default jika error
      setFormData(prev => ({
        ...prev,
        hak_cuti_tahunan: "12",
        hak_cuti_dipergunakan: "0",
        hak_cuti_sisa: "12",
        hak_cuti_sisa_akhir: "12"
      }));
    }
  };

  // Hitung jumlah hari antara dua tanggal
  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 untuk termasuk hari mulai
    return diffDays;
  };

  // Update hak cuti yang diminta dan sisa cuti ketika tanggal berubah
  useEffect(() => {
    if (formData.tanggal_mulai && formData.tanggal_selesai) {
      const jumlahHari = calculateDays(formData.tanggal_mulai, formData.tanggal_selesai);
      const cutiTahunan = parseInt(formData.hak_cuti_tahunan) || 0;
      const cutiDigunakan = parseInt(formData.hak_cuti_dipergunakan) || 0;
      const sisaCutiSaatIni = cutiTahunan - cutiDigunakan;
      
      // Validasi apakah cuti yang diminta melebihi sisa
      if (jumlahHari > sisaCutiSaatIni) {
        alert(`Sisa cuti Anda hanya ${sisaCutiSaatIni} hari. Tidak dapat mengajukan cuti ${jumlahHari} hari.`);
        setFormData(prev => ({
          ...prev,
          hak_cuti_diminta: "",
          hak_cuti_sisa_akhir: sisaCutiSaatIni.toString()
        }));
      } else {
        const sisaAkhir = sisaCutiSaatIni - jumlahHari;
        setFormData(prev => ({
          ...prev,
          hak_cuti_diminta: jumlahHari.toString(),
          hak_cuti_sisa_akhir: sisaAkhir.toString(),
          hak_cuti_sisa: sisaCutiSaatIni.toString()
        }));
      }
    }
  }, [formData.tanggal_mulai, formData.tanggal_selesai, formData.hak_cuti_tahunan, formData.hak_cuti_dipergunakan]);

  // Ambil data user saat komponen dimuat
  useEffect(() => {
    loadUserData();
    
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key?.includes('user')) {
        console.log("Storage berubah, memuat ulang data user...");
        loadUserData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const saveUserData = () => {
    const user = {
      id: 1,
      nama: "Budi Santoso",
      nip: "198507152010011001",
      password: "encrypted_password",
      usertype: "karyawan",
      jabatan: "Staff Administrasi",
      pos: "BRI Unit Sendik BRI"
    };
    
    localStorage.setItem('user', JSON.stringify(user));
    console.log("Data user berhasil disimpan:", user);
    
    setFormData(prev => ({
      ...prev,
      nama: user.nama,
      nip: user.nip,
      jabatan: user.jabatan,
      unit_kerja: user.pos,
      hak_cuti_tahunan: "12",
      hak_cuti_dipergunakan: "3", // Contoh: sudah menggunakan 3 hari
      hak_cuti_sisa: "9",
      hak_cuti_sisa_akhir: "9"
    }));
    
    setUserData(user);
    setDataLoaded(true);
    
    alert("Data user berhasil disimpan ke localStorage!");
  };

  const clearUserData = () => {
    localStorage.removeItem('user');
    setUserData(null);
    setFormData(prev => ({
      ...prev,
      nama: "",
      nip: "",
      jabatan: "",
      unit_kerja: "",
      hak_cuti_tahunan: "",
      hak_cuti_dipergunakan: "",
      hak_cuti_sisa: "",
      hak_cuti_diminta: "",
      hak_cuti_sisa_akhir: ""
    }));
    alert("Data user telah dihapus");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.tanggal_mulai) newErrors.tanggal_mulai = "Tanggal mulai harus diisi";
    if (!formData.tanggal_selesai) newErrors.tanggal_selesai = "Tanggal selesai harus diisi";
    if (!formData.keperluan.trim()) newErrors.keperluan = "Keperluan cuti harus diisi";
    if (!formData.alamat.trim()) newErrors.alamat = "Alamat harus diisi";
    if (!formData.no_telp.trim()) newErrors.no_telp = "No. Telepon harus diisi";
    
    // Validasi cuti tidak melebihi sisa
    const cutiDiminta = parseInt(formData.hak_cuti_diminta) || 0;
    const sisaCuti = parseInt(formData.hak_cuti_sisa) || 0;
    if (cutiDiminta > sisaCuti) {
      newErrors.hak_cuti_diminta = `Cuti yang diminta (${cutiDiminta} hari) melebihi sisa cuti (${sisaCuti} hari)`;
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        alert("Mohon lengkapi data yang wajib diisi");
        return;
    }
    
    setLoading(true);
    
    try {
        // Kirim hanya data yang diperlukan (HAPUS field yang tidak ada di tabel)
        const payload = {
            nama: formData.nama,
            nip: formData.nip,
            jabatan: formData.jabatan,
            unit_kerja: formData.unit_kerja,
            periode_tahun: formData.periode_tahun,
            tanggal_mulai: formData.tanggal_mulai,
            tanggal_selesai: formData.tanggal_selesai,
            keperluan: formData.keperluan,
            alamat: formData.alamat,
            no_telp: formData.no_telp,
            hak_cuti_diminta: formData.hak_cuti_diminta,
            petugas_pengganti_nama: formData.petugas_pengganti_nama,
            petugas_pengganti_jabatan: formData.petugas_pengganti_jabatan,
            petugas_pengganti_alamat: formData.petugas_pengganti_alamat,
            catatan_kordinator: formData.catatan_kordinator,
            status: "pending",
            created_at: new Date().toISOString()
        };

        console.log("Mengirim payload:", payload); // Untuk debugging

        const response = await axios.post(
            "http://localhost/sendik/add_cuti.php",
            payload,
            { 
                headers: { "Content-Type": "application/json" },
                timeout: 10000
            }
        );
        
        if (response.data.success) {
            alert(`Permohonan cuti berhasil dikirim! Sisa cuti Anda: ${response.data.sisa_cuti} hari`);
            
            // Refresh data cuti
            await fetchCutiKaryawan(formData.nip);
            
            // Reset form
            setFormData(prev => ({
                ...prev,
                tanggal_mulai: "",
                tanggal_selesai: "",
                keperluan: "",
                alamat: "",
                no_telp: "",
                hak_cuti_diminta: "",
                petugas_pengganti_nama: "",
                petugas_pengganti_jabatan: "",
                petugas_pengganti_alamat: "",
                catatan_kordinator: ""
            }));
            
            navigate("/historycuti");
        } else {
            alert("Gagal mengirim permohonan: " + (response.data.message || "Unknown error"));
        }
    } catch (error) {
        console.error("Error submitting form:", error);
        alert("Error: " + (error.response?.data?.message || error.message));
    } finally {
        setLoading(false);
    }
};

  return (
    <>
      {/* Navbar */}
    <nav className="navbar navbar-expand-lg shadow sticky-top" style={{ 
  background: 'linear-gradient(135deg, #667eea 0%, #4b78a2 100%)'
}}>
  <div className="container">
    {/* Brand/Logo */}
    <a className="navbar-brand d-flex align-items-center" href="/home">
     
      <span className="fw-bold" style={{ color: '#ffffff' }}>SENDIK</span>
      <small className="ms-2 d-none d-md-inline" style={{ color: '#e0e0e0' }}>Permintaan Cuti</small>
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
          <a className="nav-link" href="/historycuti" style={{
             color: '#fffefe',
             fontWeight: 'bold', }}>
            <i className="bi bi-clock-history me-1"></i> 
          Riwayat
          </a>
        </li>
        <li className="nav-item">
          <a className="nav-link" href="/login" style={{
             color: '#ff0000',
             fontWeight: 'bold', }}>
            
          keluar
          </a>
        </li>
      </ul>
    </div>
  </div>
</nav>



      {/* Main Content */}
      <div className="container mt-4 mb-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card shadow">
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <div>
                  <h4 className="mb-0">
                    <i className="bi bi-calendar-plus me-2"></i>
                    Form Permohonan Cuti Tahunan
                  </h4>
                  <small></small>
                </div>
                <div>
                  {!userData?.nama && (
                    <button 
                      type="button"
                      className="btn btn-sm btn-light me-2"
                      onClick={saveUserData}
                    >
                      <i className="bi bi-person-plus me-1"></i>
                      Simpan Data Test
                    </button>
                  )}
                 
                </div>
              </div>

              <div className="card-body">
                {/* Informasi status data */}
                {userData?.nama ? (
                  <div className="alert alert-success">
                    <i className="bi bi-check-circle me-2"></i>
                    Data profil Anda telah dimuat: 
                    <strong> {formData.nama}</strong> (NIP: {formData.nip}) - 
                    <strong> {formData.jabatan}</strong> - 
                    <strong> {formData.unit_kerja}</strong>
                  </div>
                ) : (
                  <div className="alert alert-warning">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Data profil tidak ditemukan. Silakan login terlebih dahulu.
                    {!userData?.nama && (
                      <button 
                        className="btn btn-sm btn-warning ms-3"
                        onClick={saveUserData}
                      >
                        Gunakan Data Test
                      </button>
                    )}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Data Pemohon - Read Only */}
                  <div className="card mb-4">
                    <div className="card-header bg-light">
                      <h6 className="mb-0">Data Pribadi</h6>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Nama Lengkap</label>
                          <input
                            type="text"
                            className="form-control bg-light"
                            name="nama"
                            value={formData.nama}
                            readOnly
                            disabled
                          />
                          <small className="text-muted">Data otomatis dari profil Anda</small>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">NIP</label>
                          <input
                            type="text"
                            className="form-control bg-light"
                            name="nip"
                            value={formData.nip}
                            readOnly
                            disabled
                          />
                          <small className="text-muted">Data otomatis dari profil Anda</small>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Jabatan/Penugasan</label>
                          <input
                            type="text"
                            className="form-control bg-light"
                            name="jabatan"
                            value={formData.jabatan}
                            readOnly
                            disabled
                          />
                          <small className="text-muted">Data otomatis dari profil Anda</small>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Unit Kerja (Pos)</label>
                          <input
                            type="text"
                            className="form-control bg-light"
                            name="unit_kerja"
                            value={formData.unit_kerja}
                            readOnly
                            disabled
                          />
                          <small className="text-muted">Data otomatis dari profil Anda (pos)</small>
                        </div>
                      </div>

                      <div className="number">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Periode Tahun</label>
                          <input
                            type="number"
                            className="form-control"
                            name="periode_tahun"
                            value={formData.periode_tahun}
                            onChange={handleChange}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detail Cuti - Tanpa field Jumlah Hari Kerja */}
                  <div className="card mb-4">
                    <div className="card-header bg-light">
                      <h6 className="mb-0">Detail Permohonan Cuti</h6>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Tanggal Mulai *</label>
                          <input
                            type="date"
                            className={`form-control ${errors.tanggal_mulai ? 'is-invalid' : ''}`}
                            name="tanggal_mulai"
                            value={formData.tanggal_mulai}
                            onChange={handleChange}
                          />
                          {errors.tanggal_mulai && <div className="invalid-feedback">{errors.tanggal_mulai}</div>}
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Tanggal Selesai *</label>
                          <input
                            type="date"
                            className={`form-control ${errors.tanggal_selesai ? 'is-invalid' : ''}`}
                            name="tanggal_selesai"
                            value={formData.tanggal_selesai}
                            onChange={handleChange}
                          />
                          {errors.tanggal_selesai && <div className="invalid-feedback">{errors.tanggal_selesai}</div>}
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Keperluan Cuti *</label>
                        <textarea
                          className={`form-control ${errors.keperluan ? 'is-invalid' : ''}`}
                          name="keperluan"
                          rows="2"
                          value={formData.keperluan}
                          onChange={handleChange}
                          placeholder="Contoh: Liburan keluarga, acara pernikahan, dll"
                        />
                        {errors.keperluan && <div className="invalid-feedback">{errors.keperluan}</div>}
                      </div>

                      <div className="row">
                        <div className="col-md-8 mb-3">
                          <label className="form-label">Alamat yang dapat dihubungi *</label>
                          <textarea
                            className={`form-control ${errors.alamat ? 'is-invalid' : ''}`}
                            name="alamat"
                            rows="2"
                            value={formData.alamat}
                            onChange={handleChange}
                            placeholder="Alamat lengkap selama cuti"
                          />
                          {errors.alamat && <div className="invalid-feedback">{errors.alamat}</div>}
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">No. Telepon/HP *</label>
                          <input
                            type="text"
                            className={`form-control ${errors.no_telp ? 'is-invalid' : ''}`}
                            name="no_telp"
                            value={formData.no_telp}
                            onChange={handleChange}
                            placeholder="Contoh: 08123456789"
                          />
                          {errors.no_telp && <div className="invalid-feedback">{errors.no_telp}</div>}
                        </div>
                      </div>
                    </div>
                  </div>

                 

                  {/* Petugas Pengganti */}
                  <div className="card mb-4">
                    <div className="card-header bg-light">
                      <h6 className="mb-0">Petugas Pengganti</h6>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-4 mb-3">
                          <label className="form-label">Nama Petugas Pengganti</label>
                          <input
                            type="text"
                            className="form-control"
                            name="petugas_pengganti_nama"
                            value={formData.petugas_pengganti_nama}
                            onChange={handleChange}
                            placeholder="Nama lengkap"
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">Jabatan</label>
                          <input
                            type="text"
                            className="form-control"
                            name="petugas_pengganti_jabatan"
                            value={formData.petugas_pengganti_jabatan}
                            onChange={handleChange}
                            placeholder="Jabatan"
                          />
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label">Alamat</label>
                          <input
                            type="text"
                            className="form-control"
                            name="petugas_pengganti_alamat"
                            value={formData.petugas_pengganti_alamat}
                            onChange={handleChange}
                            placeholder="Alamat"
                          />
                        </div>
                      </div>
                     
                    </div>
                  </div>

                  {/* Tombol Submit */}
                  <div className="d-flex gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg flex-fill"
                      disabled={loading || !userData?.nama || !formData.hak_cuti_diminta}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Mengirim...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-send me-2"></i>
                          Kirim Permohonan Cuti
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-lg"
                      onClick={() => {
                        setFormData({
                          nama: userData?.nama || "",
                          nip: userData?.nip || "",
                          jabatan: userData?.jabatan || "",
                          unit_kerja: userData?.pos || "",
                          periode_tahun: new Date().getFullYear(),
                          tanggal_mulai: "",
                          tanggal_selesai: "",
                          keperluan: "",
                          alamat: "",
                          no_telp: "",
                          hak_cuti_tahunan: formData.hak_cuti_tahunan,
                          hak_cuti_dipergunakan: formData.hak_cuti_dipergunakan,
                          hak_cuti_sisa: formData.hak_cuti_sisa,
                          hak_cuti_diminta: "",
                          hak_cuti_sisa_akhir: formData.hak_cuti_sisa,
                          petugas_pengganti_nama: "",
                          petugas_pengganti_jabatan: "",
                          petugas_pengganti_alamat: "",
                          catatan_kordinator: ""
                        });
                      }}
                    >
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      Reset
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

export default Cuti;