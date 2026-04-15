import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

function HistoryPermohonan() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [filters, setFilters] = useState({
    status: "semua",
    tanggal_awal: "",
    tanggal_akhir: "",
    search: ""
  });
  const [selectedDetail, setSelectedDetail] = useState(null);
  
  // State untuk edit modal
  const [editModalShow, setEditModalShow] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editFormData, setEditFormData] = useState({
    tempat: "",
    jenis_permohonan: "",
    jumlah: "",
    diajukanoleh: "",
    keterangan: ""
  });

  // Ambil data user yang login dari localStorage/session
  const getCurrentUser = () => {
    try {
      // Sesuaikan dengan cara penyimpanan data user Anda
      const userData = localStorage.getItem('user');
      const sessionUser = sessionStorage.getItem('user');
      
      let user = null;
      if (userData) {
        user = JSON.parse(userData);
      } else if (sessionUser) {
        user = JSON.parse(sessionUser);
      }
      
      // Jika menggunakan context atau state management lain, sesuaikan
      return user;
    } catch (error) {
      console.error("Error getting user data:", error);
      return null;
    }
  };

  // Load data dengan filter berdasarkan user yang login
  const loadData = async () => {
    try {
      setLoading(true);
      
      const user = getCurrentUser();
      const userName = user?.nama || user?.username || user?.email || "";
      
      if (!userName) {
        console.warn("User tidak ditemukan, menampilkan semua data");
      }
      
      // Build query params
      const params = new URLSearchParams();
      
      // Filter berdasarkan nama user yang login
      if (userName) {
        params.append("diajukanoleh", userName);
      }
      
      if (filters.status && filters.status !== "semua") {
        params.append("status", filters.status);
      }
      if (filters.tanggal_awal) {
        params.append("tanggal_awal", filters.tanggal_awal);
      }
      if (filters.tanggal_akhir) {
        params.append("tanggal_akhir", filters.tanggal_akhir);
      }
      if (filters.search) {
        params.append("search", filters.search);
      }

      const url = `http://localhost/sendik/historybarang.php?${params.toString()}`;
      console.log("Fetching:", url);
      
      const res = await axios.get(url);
      
      if (res.data.success) {
        setData(res.data.data || []);
        setStatistics(res.data.statistics || {});
      } else {
        setData([]);
      }
    } catch (err) {
      console.error("Error loading history:", err);
      setError("Gagal memuat data history");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    loadData();
  }, []);

  // Handle filter change
  const handleFilterChange = (name, value) => {
    setFilters({
      ...filters,
      [name]: value
    });
  };

  // Apply filters
  const applyFilters = () => {
    loadData();
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: "semua",
      tanggal_awal: "",
      tanggal_akhir: "",
      search: ""
    });
    setTimeout(loadData, 100);
  }; 

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      "pending": { color: "warning", icon: "clock", label: "Menunggu" },
      "disetujui": { color: "success", icon: "check-circle", label: "Disetujui" },
      "ditolak": { color: "danger", icon: "x-circle", label: "Ditolak" },
      "diterima": { color: "primary", icon: "box-seam", label: "Diterima" },
      "diproses": { color: "info", icon: "gear", label: "Diproses" }
    };
    
    return statusConfig[status] || { color: "secondary", icon: "question", label: status };
  };

  // Show detail modal
  const showDetail = (item) => {
    setSelectedDetail(item);
  };

  // Close detail modal
  const closeDetail = () => {
    setSelectedDetail(null);
  };

  // Open edit modal
  const openEditModal = (item) => {
    setSelectedItem(item);
    setEditFormData({
      tempat: item.tempat || "",
      jenis_permohonan: item.jenis_permohonan || "",
      jumlah: item.jumlah || "",
      diajukanoleh: item.diajukanoleh || "",
      keterangan: item.keterangan || ""
    });
    setEditModalShow(true);
  };

  // Close edit modal
  const closeEditModal = () => {
    setEditModalShow(false);
    setSelectedItem(null);
    setEditFormData({
      tempat: "",
      jenis_permohonan: "",
      jumlah: "",
      diajukanoleh: "",
      keterangan: ""
    });
  };

  // Handle edit form input change
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  // Submit edit data
  const handleSubmitEdit = async () => {
    if (!selectedItem) return;

    // Validasi form
    if (!editFormData.tempat.trim()) {
      alert("Tempat harus diisi");
      return;
    }
    if (!editFormData.jenis_permohonan.trim()) {
      alert("Jenis permohonan harus diisi");
      return;
    }
    if (!editFormData.jumlah || editFormData.jumlah <= 0) {
      alert("Jumlah harus lebih dari 0");
      return;
    }
    if (!editFormData.diajukanoleh.trim()) {
      alert("Nama pengaju harus diisi");
      return;
    }

    try {
      const payload = {
        id: selectedItem.id,
        tempat: editFormData.tempat,
        jenis_permohonan: editFormData.jenis_permohonan,
        jumlah: editFormData.jumlah,
        diajukanoleh: editFormData.diajukanoleh,
        keterangan: editFormData.keterangan
      };

      console.log("Payload edit:", payload);

      const response = await axios.post(
        "http://localhost/sendik/up_permohonankar.php",
        payload,
        { 
          headers: { "Content-Type": "application/json" },
          timeout: 5000
        }
      );

      if (response.data.success) {
        alert("Data permohonan berhasil diperbarui");
        closeEditModal();
        loadData(); // Reload data
      } else {
        alert(response.data.message || "Gagal memperbarui data");
      }
      
    } catch (err) {
      console.error("Error updating:", err);
      alert("Gagal memperbarui data: " + (err.response?.data?.message || err.message));
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Header
    const headers = [
      "ID", "Tanggal", "Tempat", "Jenis Permohonan", 
      "Jumlah", "Diajukan Oleh", "Status", 
      "Disetujui Oleh", "Diterima Oleh", "Keterangan", 
      "Keterangan Admin", "Tanggal Disetujui", "Tanggal Diterima"
    ];
    csvContent += headers.join(",") + "\n";
    
    // Data
    data.forEach(item => {
      const row = [
        item.id,
        `"${item.tanggal_buat || item.created_at}"`,
        `"${item.tempat}"`,
        `"${item.jenis_permohonan}"`,
        item.jumlah,
        `"${item.diajukanoleh || '-'}"`,
        `"${item.status}"`,
        `"${item.disetujui_oleh || '-'}"`,
        `"${item.diterima_oleh || '-'}"`,
        `"${item.keterangan || '-'}"`,
        `"${item.keterangan_admin || '-'}"`,
        `"${item.waktu_setuju || '-'}"`,
        `"${item.waktu_terima || '-'}"`
      ];
      csvContent += row.join(",") + "\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `historypermohonan_${currentUser?.nama || 'user'}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get status counts
  const getStatusCount = (status) => {
    return statistics[status]?.jumlah || 0;
  };

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Memuat history permohonan...</p>
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
      <div className="container-fluid mt-4">
       

        <div className="card shadow mb-4">
          <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
            <h4 className="mb-0">
              <i className="bi bi-clock-history me-2"></i>
              Hasil Laporan Permohonan Barang
            </h4>
  
          </div>
          
          <div className="card-body">
            {/* Statistics Cards */}
            <div className="row mb-4">
              <div className="col-md-2 col-6 mb-3">
                <div className="card border-warning">
                  <div className="card-body text-center">
                    <h5 className="text-warning">
                      <i className="bi bi-clock"></i> {getStatusCount("pending")}
                    </h5>
                    <small className="text-muted">Menunggu</small>
                  </div>
                </div>
              </div>
              <div className="col-md-2 col-6 mb-3">
                <div className="card border-info">
                  <div className="card-body text-center">
                    <h5 className="text-info">
                      <i className="bi bi-gear"></i> {getStatusCount("diproses")}
                    </h5>
                    <small className="text-muted">Diproses</small>
                  </div>
                </div>
              </div>
              <div className="col-md-2 col-6 mb-3">
                <div className="card border-success">
                  <div className="card-body text-center">
                    <h5 className="text-success">
                      <i className="bi bi-check-circle"></i> {getStatusCount("disetujui")}
                    </h5>
                    <small className="text-muted">Disetujui</small>
                  </div>
                </div>
              </div>
              <div className="col-md-2 col-6 mb-3">
                <div className="card border-danger">
                  <div className="card-body text-center">
                    <h5 className="text-danger">
                      <i className="bi bi-x-circle"></i> {getStatusCount("ditolak")}
                    </h5>
                    <small className="text-muted">Ditolak</small>
                  </div>
                </div>
              </div>
              <div className="col-md-2 col-6 mb-3">
                <div className="card border-primary">
                  <div className="card-body text-center">
                    <h5 className="text-primary">
                      <i className="bi bi-box-seam"></i> {getStatusCount("diterima")}
                    </h5>
                    <small className="text-muted">Diterima</small>
                  </div>
                </div>
              </div>
              <div className="col-md-2 col-6 mb-3">
                <div className="card border-secondary">
                  <div className="card-body text-center">
                    <h5 className="text-secondary">
                      <i className="bi bi-list-check"></i> {data.length}
                    </h5>
                    <small className="text-muted">Total</small>
                  </div>
                </div>
              </div>
            </div>

           

            {/* Data Table */}
            <div className="card">
              <div className="card-header bg-light d-flex justify-content-between">
                <h6 className="mb-0">
                  <i className="bi bi-table me-2"></i>
                  Daftar Permohonan ({data.length} data)
                </h6>
                <span className="text-muted small">
                  Terakhir update: {new Date().toLocaleTimeString('id-ID')}
                </span>
              </div>
              
              <div className="card-body p-0">
                {error ? (
                  <div className="alert alert-danger m-3">{error}</div>
                ) : data.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-inbox display-1 text-muted"></i>
                    <p className="mt-3">Tidak ada data permohonan untuk {currentUser?.nama || 'Anda'}</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>No</th>
                          <th>Tanggal</th>
                          <th>Tempat</th>
                          <th>Jenis</th>
                          <th>Jumlah</th>
                          <th>Pengaju</th>
                          <th>Status</th>
                          <th>Keterangan</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.map((item, index) => {
                          const statusConfig = getStatusBadge(item.status);
                          
                          return (
                            <tr key={item.id}>
                              <td>{index + 1}</td>
                              <td>
                                <small className="text-muted">
                                  {formatDate(item.created_at)}
                                </small>
                              </td>
                              <td>{item.tempat}</td>
                              <td>{item.jenis_permohonan}</td>
                              <td>
                                <span className="badge bg-secondary">
                                  {item.jumlah}
                                </span>
                              </td>
                              <td>{item.diajukanoleh || "-"}</td>
                              <td>
                                <span className={`badge bg-${statusConfig.color}`}>
                                  <i className={`bi bi-${statusConfig.icon} me-1`}></i>
                                  {statusConfig.label}
                                </span>
                              </td>
                              <td>
                                <small>{item.keterangan || "-"}</small>
                              </td>
                              <td>
                                <div className="btn-group">
                                  {/* Tombol Detail */}
                                  <button
                                    className="btn btn-info btn-sm me-1"
                                    onClick={() => showDetail(item)}
                                    title="Detail"
                                  >
                                    <i className="bi bi-info-circle"></i>
                                  </button>
                                  
                                  {/* Tombol Edit - hanya untuk status pending dan milik user sendiri */}
                                  {item.status === "pending" && (
                                    <button
                                      className="btn btn-warning btn-sm"
                                      onClick={() => openEditModal(item)}
                                      title="Edit Data"
                                    >
                                      <i className="bi bi-pencil"></i>
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Detail Modal */}
        {selectedDetail && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-info text-white">
                  <h5 className="modal-title">
                    <i className="bi bi-info-circle me-2"></i>
                    Detail Lengkap Permohonan
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={closeDetail}></button>
                </div>
                
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <h6 className="border-bottom pb-2">Informasi Permohonan</h6>
                      <table className="table table-sm">
                        <tbody>
                          <tr><th>ID</th><td>{selectedDetail.id}</td></tr>
                          <tr><th>Tanggal Pengajuan</th><td>{formatDate(selectedDetail.created_at)}</td></tr>
                          <tr><th>Tempat</th><td>{selectedDetail.tempat}</td></tr>
                          <tr><th>Jenis Permohonan</th><td>{selectedDetail.jenis_permohonan}</td></tr>
                          <tr><th>Jumlah</th><td>{selectedDetail.jumlah} unit</td></tr>
                          <tr><th>Diajukan Oleh</th><td>{selectedDetail.diajukanoleh || "-"}</td></tr>
                          <tr><th>Keterangan Pengaju</th><td>{selectedDetail.keterangan || "-"}</td></tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="col-md-6">
                      <h6 className="border-bottom pb-2">Status & Persetujuan</h6>
                      <table className="table table-sm">
                        <tbody>
                          <tr>
                            <th>Status</th>
                            <td>
                              {(() => {
                                const config = getStatusBadge(selectedDetail.status);
                                return (
                                  <span className={`badge bg-${config.color}`}>
                                    <i className={`bi bi-${config.icon} me-1`}></i>
                                    {config.label}
                                  </span>
                                );
                              })()}
                            </td>
                          </tr>
                          <tr><th>Disetujui Oleh</th><td>{selectedDetail.disetujui_oleh || "-"}</td></tr>
                          <tr><th>Diterima Oleh</th><td>{selectedDetail.diterima_oleh || "-"}</td></tr>
                          <tr><th>Keterangan Admin</th><td>{selectedDetail.keterangan_admin || "-"}</td></tr>
                          <tr><th>Tanggal Disetujui</th><td>{formatDate(selectedDetail.waktu_setuju) || "-"}</td></tr>
                          <tr><th>Tanggal Diterima</th><td>{formatDate(selectedDetail.waktu_terima) || "-"}</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeDetail}>
                    <i className="bi bi-x-circle me-1"></i> Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editModalShow && selectedItem && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header bg-warning text-white">
                  <h5 className="modal-title">
                    <i className="bi bi-pencil-square me-2"></i>
                    Edit Data Permohonan
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={closeEditModal}></button>
                </div>
                
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Tempat/Lokasi</label>
                    <input
                      type="text"
                      className="form-control"
                      name="tempat"
                      value={editFormData.tempat}
                      onChange={handleEditInputChange}
                      placeholder="Masukkan tempat"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Jenis Permohonan</label>
                    <input
                      type="text"
                      className="form-control"
                      name="jenis_permohonan"
                      value={editFormData.jenis_permohonan}
                      onChange={handleEditInputChange}
                      placeholder="Masukkan jenis permohonan"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Jumlah Barang</label>
                    <input
                      type="number"
                      className="form-control"
                      name="jumlah"
                      min="1"
                      value={editFormData.jumlah}
                      onChange={handleEditInputChange}
                      placeholder="Masukkan jumlah"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Diajukan Oleh</label>
                    <input
                      type="text"
                      className="form-control"
                      name="diajukanoleh"
                      value={editFormData.diajukanoleh}
                      onChange={handleEditInputChange}
                      placeholder="Nama pengaju"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Keterangan (Opsional)</label>
                    <textarea
                      className="form-control"
                      name="keterangan"
                      rows="3"
                      value={editFormData.keterangan}
                      onChange={handleEditInputChange}
                      placeholder="Tambahkan keterangan..."
                    />
                  </div>

                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    <small>
                      Data yang diedit akan diperbarui di database. 
                      Pastikan data yang dimasukkan sudah benar.
                    </small>
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeEditModal}>
                    <i className="bi bi-x-circle me-1"></i> Batal
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-warning"
                    onClick={handleSubmitEdit}
                  >
                    <i className="bi bi-save me-1"></i> Simpan Perubahan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default HistoryPermohonan;