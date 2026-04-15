import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

function AdminB() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalShow, setModalShow] = useState(false);
  const [actionType, setActionType] = useState("");
  const [formData, setFormData] = useState({
    keterangan_admin: "",
    disetujui_oleh: "",
    diterima_oleh: "",
    tanggal_setuju: "",
    tanggal_terima: "",
    admin_name: "Admin"
  });

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost/sendik/get_permohonan.php");
      
      if (res.data.success && Array.isArray(res.data.data)) {
        setData(res.data.data);
      } else if (Array.isArray(res.data)) {
        setData(res.data);
      } else {
        setData([]);
      }
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Open modal for action
  const openModal = (item, type) => {
    setSelectedItem(item);
    setActionType(type);
    
    // Set default tanggal ke hari ini
    const today = new Date().toISOString().split('T')[0];
    
    setFormData({
      keterangan_admin: "",
      disetujui_oleh: "",
      diterima_oleh: "",
      tanggal_setuju: today,
      tanggal_terima: today,
      admin_name: "Admin"
    });
    setModalShow(true);
  };

  // Close modal
  const closeModal = () => {
    setModalShow(false);
    setSelectedItem(null);
    setActionType("");
  };

  // Handle form input change
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Submit action
  const handleSubmitAction = async () => {
    if (!selectedItem) return;

    try {
      console.log("Selected Item:", selectedItem);
      console.log("Action Type:", actionType);
      console.log("Form Data:", formData);

      let payload = { 
        id: selectedItem.id,
        admin_name: formData.admin_name
      };

      switch(actionType) {
        case "setujui":
          payload.status = "disetujui";
          payload.keterangan_admin = formData.keterangan_admin;
          payload.disetujui_oleh = formData.disetujui_oleh;
          payload.tanggal_setuju = formData.tanggal_setuju;
          break;
        case "tolak":
          payload.status = "ditolak";
          payload.keterangan_admin = formData.keterangan_admin;
          break;
        case "terima":
          payload.status = "diterima";
          payload.diterima_oleh = formData.diterima_oleh;
          payload.tanggal_terima = formData.tanggal_terima;
          break;
        case "proses":
          payload.status = "diproses";
          payload.keterangan_admin = formData.keterangan_admin;
          break;
        default:
          return;
      }

      console.log("Payload to send:", payload);

      const response = await axios.post(
        "http://localhost/sendik/up_status.php",
        payload,
        { 
          headers: { "Content-Type": "application/json" },
          timeout: 5000
        }
      );

      if (response.data.success) {
        alert(`Permohonan berhasil di-${actionType}`);
        closeModal();
        loadData();
      } else {
        alert(response.data.message || "Gagal memperbarui status");
      }
      
    } catch (err) {
      console.error("Error updating:", err);
      alert("Gagal memperbarui status: " + (err.response?.data?.message || err.message));
    }
  };

  // Status badge color
  const getStatusBadge = (status) => {
    switch(status) {
      case "disetujui": return "success";
      case "ditolak": return "danger";
      case "diterima": return "primary";
      case "diproses": return "warning";
      default: return "secondary";
    }
  };

  // Format date for display
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

  // Filter actions based on current status
  const getAvailableActions = (item) => {
    const actions = [];
    
    switch(item.status) {
      case "pending":
        actions.push({ type: "setujui", label: "Setujui", icon: "check", color: "success" });
        actions.push({ type: "tolak", label: "Tolak", icon: "x", color: "danger" });
        actions.push({ type: "proses", label: "Proses", icon: "gear", color: "warning" });
        break;
      case "disetujui":
        actions.push({ type: "terima", label: "Barang Diterima", icon: "box-seam", color: "primary" });
        actions.push({ type: "tolak", label: "Batalkan", icon: "x", color: "danger" });
        break;
      case "diproses":
        actions.push({ type: "setujui", label: "Setujui", icon: "check", color: "success" });
        actions.push({ type: "tolak", label: "Tolak", icon: "x", color: "danger" });
        break;
      case "ditolak":
        actions.push({ type: "setujui", label: "Setujui Kembali", icon: "arrow-clockwise", color: "success" });
        break;
    }
    
    return actions;
  };

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Memuat data permohonan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-primary" onClick={loadData}>
          <i className="bi bi-arrow-clockwise"></i> Coba Lagi
        </button>
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
    <small className="text-muted"> Permintaan Barang</small>
  </div>
  
  <nav className="nav flex-column mt-3 px-2">

    <Link 
      to="/AdminB" 
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
      <div className="container-fluid p-4" style={{ flex: 1 }}>
        <div className="card shadow">
          <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h4 className="mb-0">
              <i className="bi bi-clipboard-check me-2"></i>
              Admin - Persetujuan Permohonan Barang
            </h4>
            <button className="btn btn-light btn-sm" onClick={loadData}>
              <i className="bi bi-arrow-clockwise"></i> Refresh
            </button>
          </div>

          <div className="card-body">
            {data.length === 0 ? (
              <div className="alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                Tidak ada data permohonan barang.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover table-striped">
                  <thead className="table-dark">
                    <tr>
                      <th>No</th>
                      <th>Tanggal</th>
                      <th>Tempat</th>
                      <th>Jenis Permohonan</th>
                      <th>Jumlah</th>
                      <th>Diajukan Oleh</th>
                      <th>Keterangan</th>
                      <th>Status</th>
                      <th>Tanggal Setuju</th>
                      <th>Tanggal Terima</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, index) => {
                      const actions = getAvailableActions(item);
                      
                      return (
                        <tr key={item.id}>
                          <td>{index + 1}</td>
                          <td>
                            {new Date(item.tanggal || item.created_at).toLocaleDateString('id-ID')}
                          </td>
                          <td>{item.tempat}</td>
                          <td>{item.jenis_permohonan}</td>
                          <td>
                            <span className="badge bg-secondary">{item.jumlah}</span>
                          </td>
                          <td>{item.diajukanoleh}</td>
                          <td>
                            <small className="text-muted">
                              {item.keterangan || "-"}
                              {item.keterangan_admin && (
                                <>
                                  <br />
                                  <strong>Admin:</strong> {item.keterangan_admin}
                                </>
                              )}
                            </small>
                          </td>
                          <td>
                            <span className={`badge bg-${getStatusBadge(item.status)}`}>
                              {item.status || "Pending"}
                            </span>
                          </td>
                          <td>
                            {item.waktu_setuju ? (
                              <small className="text-success">
                                <i className="bi bi-calendar-check me-1"></i>
                                {formatDate(item.waktu_setuju)}
                              </small>
                            ) : (
                              <small className="text-muted">-</small>
                            )}
                          </td>
                          <td>
                            {item.waktu_terima ? (
                              <small className="text-primary">
                                <i className="bi bi-calendar-check me-1"></i>
                                {formatDate(item.waktu_terima)}
                              </small>
                            ) : (
                              <small className="text-muted">-</small>
                            )}
                          </td>
                          <td>
                            <div className="btn-group">
                              {actions.map((action, idx) => (
                                <button
                                  key={idx}
                                  className={`btn btn-${action.color} btn-sm me-1 mb-1`}
                                  onClick={() => openModal(item, action.type)}
                                  title={action.label}
                                >
                                  <i className={`bi bi-${action.icon}`}></i>
                                </button>
                              ))}
                              
                              {/* Detail button */}
                              <button
                                className="btn btn-info btn-sm mb-1"
                                onClick={() => openModal(item, "detail")}
                                title="Detail"
                              >
                                <i className="bi bi-eye"></i>
                              </button>
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

        {/* Modal for Actions */}
        {modalShow && selectedItem && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {actionType === "detail" ? "Detail Permohonan" : 
                     actionType === "setujui" ? "Setujui Permohonan" :
                     actionType === "tolak" ? "Tolak Permohonan" :
                     actionType === "terima" ? "Konfirmasi Penerimaan Barang" :
                     "Proses Permohonan"}
                  </h5>
                  <button type="button" className="btn-close" onClick={closeModal}></button>
                </div>
                
                <div className="modal-body">
                  {actionType === "detail" ? (
                    <div>
                      <h6>Informasi Permohonan</h6>
                      <table className="table table-sm">
                        <tbody>
                          <tr><th>ID</th><td>{selectedItem.id}</td></tr>
                          <tr><th>Tempat</th><td>{selectedItem.tempat}</td></tr>
                          <tr><th>Jenis</th><td>{selectedItem.jenis_permohonan}</td></tr>
                          <tr><th>Jumlah</th><td>{selectedItem.jumlah}</td></tr>
                          <tr><th>Diajukan Oleh</th><td>{selectedItem.diajukanoleh}</td></tr>
                          <tr><th>Keterangan</th><td>{selectedItem.keterangan || "-"}</td></tr>
                          <tr><th>Status</th><td>
                            <span className={`badge bg-${getStatusBadge(selectedItem.status)}`}>
                              {selectedItem.status || "Pending"}
                            </span>
                          </td></tr>
                          {selectedItem.keterangan_admin && (
                            <tr><th>Keterangan Admin</th><td>{selectedItem.keterangan_admin}</td></tr>
                          )}
                          {selectedItem.disetujui_oleh && (
                            <tr><th>Disetujui Oleh</th><td>{selectedItem.disetujui_oleh}</td></tr>
                          )}
                          {selectedItem.waktu_setuju && (
                            <tr><th>Tanggal Disetujui</th><td>{formatDate(selectedItem.waktu_setuju)}</td></tr>
                          )}
                          {selectedItem.waktu_terima && (
                            <tr><th>Tanggal Diterima</th><td>{formatDate(selectedItem.waktu_terima)}</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <>
                      <div className="mb-3">
                        <strong>Informasi Permohonan:</strong>
                        <div className="bg-light p-2 rounded mt-2">
                          <div><small>ID: {selectedItem.id}</small></div>
                          <div><small>Tempat: {selectedItem.tempat}</small></div>
                          <div><small>Jenis: {selectedItem.jenis_permohonan}</small></div>
                          <div><small>Jumlah: {selectedItem.jumlah} unit</small></div>
                          <div><small>Pengaju: {selectedItem.diajukanoleh}</small></div>
                        </div>
                      </div>

                      {actionType === "setujui" && (
                        <>
                          <div className="mb-3">
                            <label className="form-label">Disetujui Oleh</label>
                            <input
                              type="text"
                              className="form-control"
                              name="disetujui_oleh"
                              value={formData.disetujui_oleh}
                              onChange={handleInputChange}
                              placeholder="Nama yang menyetujui"
                              required
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Tanggal Disetujui</label>
                            <input
                              type="date"
                              className="form-control"
                              name="tanggal_setuju"
                              value={formData.tanggal_setuju}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </>
                      )}

                      {actionType === "terima" && (
                        <>
                          <div className="mb-3">
                            <label className="form-label">Diterima Oleh</label>
                            <input
                              type="text"
                              className="form-control"
                              name="diterima_oleh"
                              value={formData.diterima_oleh}
                              onChange={handleInputChange}
                              placeholder="Nama yang menerima barang"
                              required
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Tanggal Diterima</label>
                            <input
                              type="date"
                              className="form-control"
                              name="tanggal_terima"
                              value={formData.tanggal_terima}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </>
                      )}

                      {(actionType === "setujui" || actionType === "tolak" || actionType === "proses") && (
                        <div className="mb-3">
                          <label className="form-label">
                            {actionType === "tolak" ? "Alasan Penolakan" : "Keterangan"}
                          </label>
                          <textarea
                            className="form-control"
                            name="keterangan_admin"
                            value={formData.keterangan_admin}
                            onChange={handleInputChange}
                            rows="3"
                            placeholder={actionType === "tolak" 
                              ? "Berikan alasan penolakan..." 
                              : "Tambahkan keterangan..."}
                            required={actionType === "tolak"}
                          />
                        </div>
                      )}

                      <div className="mb-3">
                        <label className="form-label">Nama Admin</label>
                        <input
                          type="text"
                          className="form-control"
                          name="admin_name"
                          value={formData.admin_name}
                          onChange={handleInputChange}
                          placeholder="Nama admin"
                          required
                        />
                      </div>
                    </>
                  )}
                </div>
                
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Batal
                  </button>
                  {actionType !== "detail" && (
                    <button 
                      type="button" 
                      className={`btn btn-${
                        actionType === "setujui" ? "success" :
                        actionType === "tolak" ? "danger" :
                        actionType === "terima" ? "primary" : "warning"
                      }`}
                      onClick={handleSubmitAction}
                    >
                      {actionType === "setujui" ? "Setujui" :
                       actionType === "tolak" ? "Tolak" :
                       actionType === "terima" ? "Konfirmasi Terima" : "Proses"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminB;