import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

function AdminCuti() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalShow, setModalShow] = useState(false);
  const [actionType, setActionType] = useState("");
  const [formData, setFormData] = useState({
    catatan_supervisor: "",
    disposisi_pimpinan: "",
    admin_name: "Admin"
  });

   const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const loadData = async () => {
    try {
      const res = await axios.get("http://localhost/sendik/get_cuti.php?status=semua");
      if (res.data.success) setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = async () => {
    try {
      const payload = {
        id: selectedItem.id,
        status: actionType,
        catatan_supervisor: formData.catatan_supervisor,
        disposisi_pimpinan: formData.disposisi_pimpinan,
        admin_name: formData.admin_name
      };

      const res = await axios.post("http://localhost/sendik/update_status_cuti.php", payload);
      
      if (res.data.success) {
        alert(`Permohonan ${actionType === "disetujui" ? "disetujui" : "ditolak"}`);
        setModalShow(false);
        loadData();
      }
    } catch (err) {
      alert("Gagal memproses");
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: "warning", 
      disetujui: "success", 
      ditolak: "danger", 
      diproses: "info"
    };
    return map[status] || "secondary";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit', 
      month: 'short', 
      year: 'numeric'
    });
  };

  if (loading) {
    
    return (
      <div className="d-flex">
        <div className="col-md-3 col-lg-2 d-md-block sidebar bg-light p-0" style={{ minHeight: "100vh" }}>
          <div className="p-4">
            <h5 className="fw-bold">SENDIK - Admin</h5>
          </div>
          <nav className="nav flex-column">
            <Link to="/Admin" className="nav-link active">
              <i className="bi bi-calendar-check me-2"></i> Pengajuan Cuti
            </Link>
            <Link to="/AdminBarang" className="nav-link">
              <i className="bi bi-box-seam me-2"></i> Pengajuan Barang
            </Link>
          </nav>
        </div>
        <div className="container-fluid p-4 text-center">
          <div className="spinner-border text-primary"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div className="col-md-3 col-lg-2 d-md-block sidebar shadow-sm" style={{ 
  minHeight: "100vh", 
  background: "linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)",
  borderRight: "1px solid #dee2e6"
}}>
  <div className="p-3 border-bottom" style={{ background: "#fff" }}>
    <h5 className="mb-0 fw-bold" style={{ color: "#2c3e50" }}>
      SENDIK
    </h5>
    <small className="text-muted"> Pengajuan Cuti</small>
  </div>
  
  <nav className="nav flex-column mt-3 px-2">
    <Link 
      to="/Tambahkar" 
      className="nav-link mb-2 rounded-3 d-flex align-items-center gap-2"
      style={{
        color: "#495057",
        transition: "all 0.3s ease",
        padding: "12px 16px"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#0d6efd";
        e.currentTarget.style.color = "white";
        e.currentTarget.style.transform = "translateX(5px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "#495057";
        e.currentTarget.style.transform = "translateX(0)";
      }}
    >
      <span> Tambah Karyawan</span> 
    </Link>

    <Link 
      to="/Admncuti" 
      className="nav-link mb-2 rounded-3 d-flex align-items-center gap-2"
      style={{
        color: "#495057",
        transition: "all 0.3s ease",
        padding: "12px 16px"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#0d6efd";
        e.currentTarget.style.color = "white";
        e.currentTarget.style.transform = "translateX(5px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "#495057";
        e.currentTarget.style.transform = "translateX(0)";
      }}
    >
      <span> Pengajuan Cuti </span> 
    </Link>

    <Link 
      to="/admnbrg" 
      className="nav-link mb-2 rounded-3 d-flex align-items-center gap-2"
      style={{
        color: "#495057",
        transition: "all 0.3s ease",
        padding: "12px 16px"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#0d6efd";
        e.currentTarget.style.color = "white";
        e.currentTarget.style.transform = "translateX(5px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "#495057";
        e.currentTarget.style.transform = "translateX(0)";
      }}
    >
      <span> Permintaan Barang </span>
    </Link>

    <div className="mt-auto pt-5 mt-5">
      <hr className="my-3" />
      <button
        className="btn btn-outline-danger btn-sm w-100 rounded-3 d-flex align-items-center justify-content-center gap-2"
        onClick={handleLogout}
        style={{
          padding: "10px",
          transition: "all 0.3s ease",
          fontWeight: "500"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#dc3545";
          e.currentTarget.style.color = "white";
          e.currentTarget.style.transform = "scale(1.02)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "#dc3545";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <span></span> Logout
      </button>
    </div>
  </nav>
      </div>

      {/* Main Content */}
      <div className="container-fluid p-4">
        <div className="card shadow">
          <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h4 className="mb-0">
              <i className="bi bi-calendar-check me-2"></i>
              Admin - Persetujuan Cuti Tahunan
            </h4>
            <button className="btn btn-light btn-sm" onClick={loadData}>
              <i className="bi bi-arrow-clockwise"></i> Refresh
            </button>
          </div>
          <div className="card-body">
            {data.length === 0 ? (
              <div className="alert alert-info">Tidak ada data permohonan cuti</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>No</th>
                      <th>Tanggal</th>
                      <th>Nama</th>
                      <th>NIP</th>
                      <th>Jabatan</th>
                      <th>Unit Kerja</th>
                      <th>Jumlah Hari</th>
                      <th>Periode Cuti</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                   {Array.isArray(data) && data.map((item, idx) => (
  <tr key={item.id}>
    <td>{idx + 1}</td>
    <td>{formatDate(item.created_at)}</td>
    <td>{item.nama}</td>
    <td>{item.nip}</td>
    <td>{item.jabatan}</td>
    <td>{item.unit_kerja}</td>
    <td>{item.jumlah_hari} hari</td>
    <td>{formatDate(item.tanggal_mulai)} - {formatDate(item.tanggal_selesai)}</td>
    <td>
      <span className={`badge bg-${getStatusBadge(item.status)}`}>
        {item.status}
      </span>
    </td>
    <td>
      {item.status === "pending" && (
        <>
          <button 
            className="btn btn-success btn-sm me-1" 
            onClick={() => { 
              setSelectedItem(item); 
              setActionType("disetujui"); 
              setModalShow(true); 
            }}
            title="Setujui"
          >
            <i className="bi bi-check-circle"></i>
          </button>
          <button 
            className="btn btn-danger btn-sm me-1" 
            onClick={() => { 
              setSelectedItem(item); 
              setActionType("ditolak"); 
              setModalShow(true); 
            }}
            title="Tolak"
          >
            <i className="bi bi-x-circle"></i>
          </button>
        </>
      )}
      <button 
        className="btn btn-info btn-sm" 
        onClick={() => { 
          setSelectedItem(item); 
          setActionType("detail"); 
          setModalShow(true); 
        }}
        title="Detail"
      >
        <i className="bi bi-eye"></i>
      </button>
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

      {/* Modal Detail & Approval */}
      {modalShow && selectedItem && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  {actionType === "detail" ? "Detail Permohonan Cuti" : 
                   actionType === "disetujui" ? "Setujui Permohonan Cuti" : "Tolak Permohonan Cuti"}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setModalShow(false)}></button>
              </div>
              <div className="modal-body">
                {actionType === "detail" ? (
                  <div className="row">
                    <div className="col-md-6">
                      <h6 className="border-bottom pb-2">Data Pemohon</h6>
                      <table className="table table-sm">
                        <tbody>
                          <tr><th>Nama</th><td>{selectedItem.nama}</td></tr>
                          <tr><th>NIP</th><td>{selectedItem.nip}</td></tr>
                          <tr><th>Jabatan</th><td>{selectedItem.jabatan}</td></tr>
                          <tr><th>Unit Kerja</th><td>{selectedItem.unit_kerja}</td></tr>
                          <tr><th>No. Telepon</th><td>{selectedItem.no_telp}</td></tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="col-md-6">
                      <h6 className="border-bottom pb-2">Detail Cuti</h6>
                      <table className="table table-sm">
                        <tbody>
                          <tr><th>Jumlah Hari</th><td>{selectedItem.jumlah_hari} hari</td></tr>
                          <tr><th>Tanggal Mulai</th><td>{formatDate(selectedItem.tanggal_mulai)}</td></tr>
                          <tr><th>Tanggal Selesai</th><td>{formatDate(selectedItem.tanggal_selesai)}</td></tr>
                          <tr><th>Keperluan</th><td>{selectedItem.keperluan}</td></tr>
                          <tr><th>Alamat</th><td>{selectedItem.alamat}</td></tr>
                        </tbody>
                      </table>
                    </div>
                    
                    {selectedItem.petugas_pengganti_nama && (
                      <div className="col-12 mt-3">
                        <h6 className="border-bottom pb-2">Petugas Pengganti</h6>
                        <div>Nama: {selectedItem.petugas_pengganti_nama}</div>
                        <div>Jabatan: {selectedItem.petugas_pengganti_jabatan}</div>
                        <div>Alamat: {selectedItem.petugas_pengganti_alamat}</div>
                      </div>
                    )}
                    {selectedItem.catatan_kordinator && (
                      <div className="col-12 mt-3">
                        <h6 className="border-bottom pb-2">Catatan Kordinator</h6>
                        <div>{selectedItem.catatan_kordinator}</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="alert alert-info">
                      <strong>Informasi Pemohon:</strong><br />
                      {selectedItem.nama} - {selectedItem.jabatan}<br />
                      {selectedItem.unit_kerja}<br />
                      Mengajukan cuti {selectedItem.jumlah_hari} hari ({formatDate(selectedItem.tanggal_mulai)} - {formatDate(selectedItem.tanggal_selesai)})
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">Catatan Supervisor</label>
                      <textarea 
                        className="form-control" 
                        rows="3"
                        name="catatan_supervisor"
                        value={formData.catatan_supervisor}
                        onChange={(e) => setFormData({...formData, catatan_supervisor: e.target.value})}
                        placeholder="Masukkan catatan dari supervisor..."
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">Disposisi & Putusan Pimpinan</label>
                      <textarea 
                        className="form-control" 
                        rows="3"
                        name="disposisi_pimpinan"
                        value={formData.disposisi_pimpinan}
                        onChange={(e) => setFormData({...formData, disposisi_pimpinan: e.target.value})}
                        placeholder="Masukkan disposisi pimpinan..."
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Nama Admin</label>
                      <input
                        type="text"
                        className="form-control"
                        name="admin_name"
                        value={formData.admin_name}
                        onChange={(e) => setFormData({...formData, admin_name: e.target.value})}
                        placeholder="Nama admin"
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalShow(false)}>
                  <i className="bi bi-x-circle me-1"></i> Tutup
                </button>
                {actionType !== "detail" && (
                  <button 
                    type="button" 
                    className={`btn btn-${actionType === "disetujui" ? "success" : "danger"}`}
                    onClick={handleAction}
                  >
                    <i className={`bi bi-${actionType === "disetujui" ? "check-circle" : "x-circle"} me-1`}></i>
                    {actionType === "disetujui" ? "Setujui Cuti" : "Tolak Cuti"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCuti;