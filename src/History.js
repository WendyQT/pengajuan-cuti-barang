import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css"; 

function HistoryPermohonan() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState({});
  const [filters, setFilters] = useState({
    status: "semua",
    tanggal_awal: "",
    tanggal_akhir: "",
    search: ""
  });
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);

  // Load data dengan filter
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Build query params
      const params = new URLSearchParams();
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
    setStartDate(null);
    setEndDate(null);
    setTimeout(loadData, 100);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
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
    link.setAttribute("download", `historypermohonan${new Date().toISOString().slice(0,10)}.csv`);
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
    <div className="container-fluid mt-4">
      {/* Header */}
      <div className="card shadow mb-4">
        <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
          <h4 className="mb-0">
            <i className="bi bi-clock-history me-2"></i>
            History & Laporan Permohonan Barang
          </h4>
          <div>
            <button className="btn btn-light btn-sm me-2" onClick={loadData}>
              <i className="bi bi-arrow-clockwise"></i> Refresh
            </button>
            <button className="btn btn-success btn-sm" onClick={exportToExcel}>
              <i className="bi bi-file-earmark-excel"></i> Export Excel
            </button>
          </div>
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

          {/* Filter Section */}
          <div className="card mb-4">
            <div className="card-header bg-light">
              <h6 className="mb-0">
                <i className="bi bi-funnel me-2"></i>Filter Data
              </h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label">Status</label>
                  <select 
                    className="form-select"
                    value={filters.status}
                    onChange={(e) => handleFilterChange("status", e.target.value)}
                  >
                    <option value="semua">Semua Status</option>
                    <option value="pending">Menunggu</option>
                    <option value="diproses">Diproses</option>
                    <option value="disetujui">Disetujui</option>
                    <option value="ditolak">Ditolak</option>
                    <option value="diterima">Diterima</option>
                  </select>
                </div>
                
                <div className="col-md-3">
                  <label className="form-label">Tanggal Awal</label>
                  <input
                    type="date"
                    className="form-control"
                    value={filters.tanggal_awal}
                    onChange={(e) => handleFilterChange("tanggal_awal", e.target.value)}
                  />
                </div>
                
                <div className="col-md-3">
                  <label className="form-label">Tanggal Akhir</label>
                  <input
                    type="date"
                    className="form-control"
                    value={filters.tanggal_akhir}
                    onChange={(e) => handleFilterChange("tanggal_akhir", e.target.value)}
                  />
                </div>
                
                <div className="col-md-3">
                  <label className="form-label">Pencarian</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Cari tempat/jenis/nama..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange("search", e.target.value)}
                    />
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={() => applyFilters()}
                    >
                      <i className="bi bi-search"></i>
                    </button>
                  </div>
                </div>
                
                <div className="col-12">
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-primary"
                      onClick={applyFilters}
                    >
                      <i className="bi bi-filter me-1"></i> Terapkan Filter
                    </button>
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={resetFilters}
                    >
                      <i className="bi bi-arrow-counterclockwise me-1"></i> Reset
                    </button>
                  </div>
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
                  <p className="mt-3">Tidak ada data permohonan</p>
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
                        <th>Timeline</th>
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
                                <br />
                                {item.tanggal_buat?.split(" ")[1] || ""}
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
                              {item.disetujui_oleh && (
                                <div className="small text-muted">
                                  Oleh: {item.disetujui_oleh}
                                </div>
                              )}
                            </td>
                            <td>
                              <div className="small">
                                <div>
                                  <i className="bi bi-clock text-warning me-1"></i>
                                  Diajukan: {item.tanggal_buat || "-"}
                                </div>
                                {item.waktu_setuju && (
                                  <div>
                                    <i className="bi bi-check-circle text-success me-1"></i>
                                    Disetujui: {item.waktu_setuju}
                                  </div>
                                )}
                                {item.waktu_terima && (
                                  <div>
                                    <i className="bi bi-box-seam text-primary me-1"></i>
                                    Diterima: {item.waktu_terima}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>
                              <button
                                className="btn btn-info btn-sm"
                                onClick={() => showDetail(item)}
                                title="Detail Lengkap"
                              >
                                <i className="bi bi-info-circle"></i>
                              </button>
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
                        <tr><th>Tanggal Pengajuan</th><td>{selectedDetail.tanggal_buat || "-"}</td></tr>
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
                        <tr><th>Tanggal Disetujui</th><td>{selectedDetail.waktu_setuju || "-"}</td></tr>
                        <tr><th>Tanggal Diterima</th><td>{selectedDetail.waktu_terima || "-"}</td></tr>
                        <tr>
                          <th>Durasi Proses</th>
                          <td>
                            {selectedDetail.hari_terlewat > 0 ? (
                              <span className="text-warning">
                                {selectedDetail.hari_terlewat} hari
                              </span>
                            ) : (
                              <span className="text-success">Cepat</span>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Timeline */}
                <div className="mt-4">
                  <h6 className="border-bottom pb-2">
                    <i className="bi bi-timeline me-2"></i>Timeline Proses
                  </h6>
                  <div className="timeline">
                    <div className="timeline-item">
                      <div className="timeline-marker bg-primary"></div>
                      <div className="timeline-content">
                        <h6>Pengajuan</h6>
                        <p className="text-muted mb-0">{selectedDetail.tanggal_buat || "-"}</p>
                        <small>Oleh: {selectedDetail.diajukanoleh || "-"}</small>
                      </div>
                    </div>
                    
                    {selectedDetail.waktu_setuju && (
                      <div className="timeline-item">
                        <div className="timeline-marker bg-success"></div>
                        <div className="timeline-content">
                          <h6>Disetujui</h6>
                          <p className="text-muted mb-0">{selectedDetail.waktu_setuju}</p>
                          <small>Oleh: {selectedDetail.disetujui_oleh || "-"}</small>
                        </div>
                      </div>
                    )}
                    
                    {selectedDetail.waktu_terima && (
                      <div className="timeline-item">
                        <div className="timeline-marker bg-info"></div>
                        <div className="timeline-content">
                          <h6>Diterima</h6>
                          <p className="text-muted mb-0">{selectedDetail.waktu_terima}</p>
                          <small>Oleh: {selectedDetail.diterima_oleh || "-"}</small>
                        </div>
                      </div>
                    )}
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

      {/* CSS untuk Timeline */}
      <style>{`
        .timeline {
          position: relative;
          padding-left: 30px;
        }
        .timeline-item {
          position: relative;
          margin-bottom: 20px;
        }
        .timeline-marker {
          position: absolute;
          left: -30px;
          top: 0;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 3px solid white;
        }
        .timeline-content {
          padding: 10px;
          background: #f8f9fa;
          border-radius: 5px;
          border-left: 3px solid #dee2e6;
        }
      `}</style>
    </div>
  );
}

export default HistoryPermohonan;