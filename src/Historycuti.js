// HistoryCuti.js - History permohonan cuti dengan auto-refresh dan update data
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

function HistoryCuti() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [filter, setFilter] = useState({
    status: "",
    search: ""
  });
  const [selectedCuti, setSelectedCuti] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    id: "",
    tanggal_mulai: "",
    tanggal_selesai: "",
    keperluan: "",
    alamat: ""
  });
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const refreshIntervalRef = useRef(null);
  
  // Ambil data user dari localStorage
  const [userInfo, setUserInfo] = useState({
    nip: '',
    nama: '',
    role: 'karyawan'
  });

  useEffect(() => {
    // Ambil data user dari localStorage saat komponen mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserInfo({
        nip: user.nip || '',
        nama: user.nama || '',
        role: user.role || 'karyawan'
      });
    } else {
      alert('Session expired, silakan login kembali');
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (userInfo.nip) {
      fetchData();
      
      // Setup auto-refresh setiap 10 detik
      refreshIntervalRef.current = setInterval(() => {
        console.log('Auto-refresh data...');
        fetchData(true);
      }, 10000);
      
      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [userInfo.nip]);

  // Refresh ketika filter berubah
  useEffect(() => {
    if (userInfo.nip) {
      fetchData();
    }
  }, [filter]);

  const fetchData = async (silent = false) => {
    if (!userInfo.nip) {
      console.log('NIP tidak ditemukan');
      return;
    }

    if (!silent) setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('nip', userInfo.nip);
      params.append('role', userInfo.role);
      if (filter.status) params.append('status', filter.status);
      if (filter.search) params.append('search', filter.search);
      
      const url = `http://localhost/sendik/historycuti.php?${params}`;
      console.log('Fetching from:', url);
      
      const response = await axios.get(url);
      console.log('Response:', response.data);
      
      if (response.data.success) {
        const formattedData = response.data.data.map(item => ({
          ...item,
          status: item.status ? item.status.toLowerCase() : 'pending',
          jumlah_hari: item.jumlah_hari || item.lama_cuti || 0,
          keperluan: item.keperluan || item.alasan_cuti || '-',
          created_at: item.created_at || item.tanggal_pengajuan,
          tanggal_mulai: item.tanggal_mulai || item.start_date,
          tanggal_selesai: item.tanggal_selesai || item.end_date
        }));
        setData(formattedData);
        setLastUpdate(new Date());
        
        if (!silent && formattedData.length > 0) {
          checkStatusChanges(formattedData);
        }
      } else {
        console.error("API Error:", response.data.message);
        setData([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      if (!silent) {
        alert("Gagal mengambil data: " + (error.response?.data?.message || error.message));
      }
      setData([]);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Fungsi untuk update data cuti
  const handleUpdateCuti = async (e) => {
    e.preventDefault();
    
    if (!editForm.id) {
      alert("ID cuti tidak ditemukan");
      return;
    }

    // Validasi tanggal
    const startDate = new Date(editForm.tanggal_mulai);
    const endDate = new Date(editForm.tanggal_selesai);
    
    if (startDate > endDate) {
      alert("Tanggal selesai harus lebih besar dari tanggal mulai");
      return;
    }

    // Hitung jumlah hari
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    const payload = {
      id: editForm.id,
      nip: userInfo.nip,
      tanggal_mulai: editForm.tanggal_mulai,
      tanggal_selesai: editForm.tanggal_selesai,
      jumlah_hari: diffDays,
      keperluan: editForm.keperluan,
      alamat: editForm.alamat,
      action: 'update'
    };

    setUpdating(true);
    try {
      const response = await axios.post(
        "http://localhost/sendik/up_cuti.php",
        payload,
        { 
          headers: { "Content-Type": "application/json" },
          timeout: 5000
        }
      );
      
      console.log('Update response:', response.data);
      
      if (response.data.success) {
        alert("Data cuti berhasil diperbarui!");
        setShowEditModal(false);
        fetchData(false); // Refresh data
        resetEditForm();
      } else {
        alert("Gagal memperbarui data: " + (response.data.message || "Terjadi kesalahan"));
      }
    } catch (error) {
      console.error("Error updating cuti:", error);
      alert("Gagal memperbarui data: " + (error.response?.data?.message || error.message));
    } finally {
      setUpdating(false);
    }
  };

  // Cek perubahan status
  const checkStatusChanges = (newData) => {
    const previousDataStr = localStorage.getItem('previousHistoryData');
    if (previousDataStr) {
      const previousData = JSON.parse(previousDataStr);
      const changedItems = newData.filter(newItem => {
        const oldItem = previousData.find(old => old.id === newItem.id);
        return oldItem && oldItem.status !== newItem.status;
      });
      
      changedItems.forEach(item => {
        const statusText = item.status === 'disetujui' || item.status === 'approved' ? 'DISETUJUI' : 
                          (item.status === 'ditolak' || item.status === 'rejected' ? 'DITOLAK' : item.status);
        showNotification(`Status permohonan cuti Anda telah berubah menjadi ${statusText.toUpperCase()}`);
      });
    }
    localStorage.setItem('previousHistoryData', JSON.stringify(newData));
  };

  const showNotification = (message) => {
    if (Notification && Notification.permission === 'granted') {
      new Notification('SENDIK - Update Status Cuti', { body: message });
    }
    console.log('Notifikasi:', message);
  };

  const requestNotificationPermission = () => {
    if (Notification && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  };

  const handleManualRefresh = () => {
    fetchData(false);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };

  const resetFilter = () => {
    setFilter({ status: "", search: "" });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': 'warning',
      'disetujui': 'success',
      'approved': 'success',
      'ditolak': 'danger',
      'rejected': 'danger',
      'selesai': 'info',
      'diproses': 'primary'
    };
    const color = statusMap[status?.toLowerCase()] || 'secondary';
    return `badge bg-${color}`;
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'Menunggu Persetujuan',
      'disetujui': '✓ Disetujui',
      'approved': '✓ Disetujui',
      'ditolak': '✗ Ditolak',
      'rejected': '✗ Ditolak',
      'selesai': 'Selesai',
      'diproses': 'Diproses'
    };
    return statusMap[status?.toLowerCase()] || status || 'Menunggu';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return '-';
    }
  };


  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return '-';
    }
  };

  const viewDetail = (item) => {
    setSelectedCuti(item);
    setShowDetailModal(true);
  };

  const openEditModal = (item) => {
    // Hanya bisa edit jika status masih pending
    if (item.status !== 'pending' && item.status !== 'diproses') {
      alert(`Tidak dapat mengedit permohonan dengan status ${getStatusText(item.status)}`);
      return;
    }
    
    setEditForm({
      id: item.id,
      tanggal_mulai: item.tanggal_mulai || '',
      tanggal_selesai: item.tanggal_selesai || '',
      keperluan: item.keperluan || '',
      alamat: item.alamat || ''
    });
    setShowEditModal(true);
  };

  const resetEditForm = () => {
    setEditForm({
      id: "",
      tanggal_mulai: "",
      tanggal_selesai: "",
      keperluan: "",
      alamat: ""
    });
  };

  // Request notifikasi permission saat komponen mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

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
      <small className="ms-2 d-none d-md-inline" style={{ color: '#e0e0e0' }}></small>
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
      </ul>
    </div>
  </div>
</nav>

      {/* Main Content */}
      <div className="container mt-4 mb-5">
        <div className="card shadow">
          <div className="card-header bg-primary text-white">
            <div className="d-flex justify-content-between align-items-center flex-wrap">
              <div>
                <h4 className="mb-0">
                  <i className="bi bi-clock-history me-2"></i>
                  Riwayat Permohonan Cuti
                </h4>
                {userInfo.nama && (
                  <small className="d-block mt-1">
                    <i className="bi bi-person-circle me-1"></i>
                    {userInfo.nama} (NIP: {userInfo.nip})
                  </small>
                )}
              </div>
              <div className="mt-2 mt-sm-0">
                <small className="me-2 text-light">
                  <i className="bi bi-clock me-1"></i>
                  Update: {formatDateTime(lastUpdate)}
                </small>
                <button 
                  className="btn btn-light btn-sm"
                  onClick={() => navigate("/home")}
                >
                  <i className="bi bi-plus-circle me-1"></i>
                  Ajukan Baru
                </button>
              </div>
            </div>
          </div>

          <div className="card-body">
            {/* Statistik Ringkasan */}
            {!loading && data.length > 0 && (
              <div className="row mb-4 g-2">
                <div className="col-md-3 col-6">
                  <div className="card bg-info text-white">
                    <div className="card-body text-center py-2">
                      <h6 className="mb-0">Total</h6>
                      <h3 className="mb-0">{data.length}</h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 col-6">
                  <div className="card bg-warning text-dark">
                    <div className="card-body text-center py-2">
                      <h6 className="mb-0">Menunggu</h6>
                      <h3 className="mb-0">{data.filter(d => d.status === 'pending' || d.status === 'diproses').length}</h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 col-6">
                  <div className="card bg-success text-white">
                    <div className="card-body text-center py-2">
                      <h6 className="mb-0">Disetujui</h6>
                      <h3 className="mb-0">{data.filter(d => d.status === 'disetujui' || d.status === 'approved').length}</h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 col-6">
                  <div className="card bg-danger text-white">
                    <div className="card-body text-center py-2">
                      <h6 className="mb-0">Ditolak</h6>
                      <h3 className="mb-0">{data.filter(d => d.status === 'ditolak' || d.status === 'rejected').length}</h3>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tabel Data */}
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Memuat data...</p>
              </div>
            ) : data.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-inbox fs-1 text-muted"></i>
                <p className="mt-3 text-muted">Belum ada data permohonan cuti</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate("/home")}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Ajukan Cuti Sekarang
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>No</th>
                      <th>Tanggal Pengajuan</th>
                      <th>Nama</th>
                      <th>NIP</th>
                      <th>Jabatan</th>
                      <th>Periode Cuti</th>
                      <th>Jumlah Hari</th>
                      <th>Keperluan</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, index) => (
                      <tr key={item.id || index}>
                        <td>{index + 1}</td>
                        <td>{formatDateTime(item.created_at)}</td>
                        <td>
                          <strong>{item.nama || userInfo.nama || '-'}</strong>
                        </td>
                        <td>
                          <code>{item.nip}</code>
                        </td>
                        <td>{item.jabatan || '-'}</td>
                        <td>
                          {formatDate(item.tanggal_mulai)} → {formatDate(item.tanggal_selesai)}
                        </td>
                        <td>
                          <span className="badge bg-info">
                            {item.jumlah_hari} hari
                          </span>
                        </td>
                        <td>
                          <small>{item.keperluan?.substring(0, 30)}{item.keperluan?.length > 30 ? '...' : ''}</small>
                        </td>
                        <td>
                          <span className={getStatusBadge(item.status)}>
                            {getStatusText(item.status)}
                          </span>
                          {(item.status === 'ditolak' || item.status === 'rejected') && item.alasan_tolak && (
                            <small className="text-danger d-block mt-1">
                              <i className="bi bi-info-circle"></i> {item.alasan_tolak.substring(0, 20)}
                            </small>
                          )}
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button 
                              className="btn btn-outline-primary"
                              onClick={() => viewDetail(item)}
                              title="Lihat Detail"
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                           
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Detail */}
      {showDetailModal && selectedCuti && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className={`modal-header bg-${selectedCuti.status === 'disetujui' || selectedCuti.status === 'approved' ? 'success' : selectedCuti.status === 'ditolak' || selectedCuti.status === 'rejected' ? 'danger' : 'warning'} text-white`}>
                <h5 className="modal-title">
                  <i className="bi bi-file-text me-2"></i>
                  Detail Permohonan Cuti - {getStatusText(selectedCuti.status)}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDetailModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="border-bottom pb-2">Data Pemohon</h6>
                    <table className="table table-sm">
                      <tbody>
                        <tr><th width="40%">Nama Lengkap</th><td>: {selectedCuti.nama || userInfo.nama}</td></tr>
                        <tr><th>NIP</th><td>: {selectedCuti.nip}</td></tr>
                        <tr><th>Jabatan</th><td>: {selectedCuti.jabatan || '-'}</td></tr>
                        <tr><th>Unit Kerja</th><td>: {selectedCuti.unit_kerja || '-'}</td></tr>
                        <tr><th>No. Telepon</th><td>: {selectedCuti.no_telp || '-'}</td></tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="col-md-6">
                    <h6 className="border-bottom pb-2">Detail Cuti</h6>
                    <table className="table table-sm">
                      <tbody>
                        <tr><th width="40%">Periode Cuti</th><td>: {formatDate(selectedCuti.tanggal_mulai)} - {formatDate(selectedCuti.tanggal_selesai)}</td></tr>
                        <tr><th>Jumlah Hari</th><td>: {selectedCuti.jumlah_hari} hari</td></tr>
                        <tr><th>Keperluan</th><td>: {selectedCuti.keperluan}</td></tr>
                        <tr><th>Alamat</th><td>: {selectedCuti.alamat || '-'}</td></tr>
                        <tr><th>Tanggal Pengajuan</th><td>: {formatDateTime(selectedCuti.created_at)}</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {(selectedCuti.catatan_supervisor || selectedCuti.disposisi_pimpinan || selectedCuti.alasan_tolak) && (
                  <div className="mt-3">
                    <h6 className="border-bottom pb-2">Catatan & Disposisi</h6>
                    {selectedCuti.catatan_supervisor && (
                      <div className="alert alert-info mt-2">
                        <strong>Catatan Supervisor:</strong><br />
                        {selectedCuti.catatan_supervisor}
                      </div>
                    )}
                    {selectedCuti.disposisi_pimpinan && (
                      <div className="alert alert-secondary mt-2">
                        <strong>Disposisi Pimpinan:</strong><br />
                        {selectedCuti.disposisi_pimpinan}
                      </div>
                    )}
                    {(selectedCuti.status === 'ditolak' || selectedCuti.status === 'rejected') && selectedCuti.alasan_tolak && (
                      <div className="alert alert-danger mt-2">
                        <strong>Alasan Penolakan:</strong><br />
                        {selectedCuti.alasan_tolak}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>
                  <i className="bi bi-x-circle me-1"></i> Tutup
                </button>
                <button className="btn btn-primary" onClick={handleManualRefresh}>
                  <i className="bi bi-arrow-clockwise me-1"></i> Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Cuti */}
      {showEditModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-warning">
                <h5 className="modal-title">
                  <i className="bi bi-pencil-square me-2"></i>
                  Edit Permohonan Cuti
                </h5>
                <button type="button" className="btn-close" onClick={() => { setShowEditModal(false); resetEditForm(); }}></button>
              </div>
              <form onSubmit={handleUpdateCuti}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Tanggal Mulai *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={editForm.tanggal_mulai}
                      onChange={(e) => setEditForm({...editForm, tanggal_mulai: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Tanggal Selesai *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={editForm.tanggal_selesai}
                      onChange={(e) => setEditForm({...editForm, tanggal_selesai: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Keperluan *</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={editForm.keperluan}
                      onChange={(e) => setEditForm({...editForm, keperluan: e.target.value})}
                      required
                      placeholder="Jelaskan keperluan cuti..."
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Alamat Selama Cuti</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={editForm.alamat}
                      onChange={(e) => setEditForm({...editForm, alamat: e.target.value})}
                      placeholder="Alamat selama menjalani cuti..."
                    ></textarea>
                  </div>
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    <small>Catatan: Hanya permohonan dengan status "Menunggu" yang dapat diedit.</small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowEditModal(false); resetEditForm(); }}>
                    <i className="bi bi-x-circle me-1"></i> Batal
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={updating}>
                    {updating ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1"></span>
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-save me-1"></i> Simpan Perubahan
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default HistoryCuti;