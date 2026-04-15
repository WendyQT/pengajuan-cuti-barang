import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

function Tambahkar() {
  const navigate = useNavigate();

  const [karyawan, setKaryawan] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    id: "",
    nama: "",
    nip: "",
    password: "",
    usertype: "karyawan",
    jabatan: "",
    pos: "",
  });

  // Base URL - sesuaikan dengan path Anda
  const API_BASE_URL = "http://localhost/sendik";

  // ================= FETCH DATA =================
  const fetchKaryawan = async () => {
    try {
      setLoading(true);
      setError("");
      
      const url = `${API_BASE_URL}/get_karyawan.php`;
      console.log("Fetching from:", url);
      
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
      });
      
      console.log("Response status:", res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error response:", errorText);
        
        let errorMessage = `HTTP error! status: ${res.status}`;
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.message) {
            errorMessage = errorJson.message;
          }
        } catch (e) {
          if (errorText) {
            errorMessage = errorText;
          }
        }
        throw new Error(errorMessage);
      }
      
      const data = await res.json();
      console.log("Data received:", data);
      
      let karyawanData = [];
      if (Array.isArray(data)) {
        karyawanData = data;
      } else if (data.data && Array.isArray(data.data)) {
        karyawanData = data.data;
      } else if (data.status === "success" && data.data) {
        karyawanData = data.data;
      } else if (data.status === "error") {
        throw new Error(data.message);
      }
      
      setKaryawan(karyawanData);
      
    } catch (err) {
      console.error("Fetch error:", err);
      setError(`Gagal mengambil data: ${err.message}`);
      setKaryawan([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKaryawan();
  }, []);

  // ================= FILTER BERDASARKAN ROLE =================
  const adminSuperList = Array.isArray(karyawan) 
    ? karyawan.filter((item) => item.usertype === "admin") 
    : [];
    
  const adminBarangList = Array.isArray(karyawan) 
    ? karyawan.filter((item) => item.usertype === "admin_barang") 
    : [];
    
  const adminCutiList = Array.isArray(karyawan) 
    ? karyawan.filter((item) => item.usertype === "admin_cuti") 
    : [];
    
  const karyawanList = Array.isArray(karyawan) 
    ? karyawan.filter((item) => item.usertype === "karyawan") 
    : [];

  // ================= HANDLER =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validasi
    if (!isEdit && !form.password) {
      setError("Password wajib diisi untuk user baru");
      setLoading(false);
      return;
    }

    if (!form.nama || !form.nip) {
      setError("Nama dan NIP wajib diisi");
      setLoading(false);
      return;
    }

    const url = isEdit
      ? `${API_BASE_URL}/up_karyawan.php`
      : `${API_BASE_URL}/add_karyawan.php`;

    const dataToSend = { ...form };
    
    // Jika edit dan password kosong, hapus field password
    if (isEdit && !dataToSend.password) {
      delete dataToSend.password;
    }

    console.log("Sending to:", url);
    console.log("Data:", dataToSend);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(dataToSend),
      });

      console.log("Response status:", res.status);
      
      const responseText = await res.text();
      console.log("Raw response:", responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Parse error:", parseError);
        throw new Error(`Invalid response from server: ${responseText.substring(0, 200)}`);
      }

      if (result.status === "success") {
        alert(isEdit ? "Data berhasil diupdate" : "Karyawan berhasil ditambahkan");
        resetForm();
        fetchKaryawan();
      } else {
        throw new Error(result.message || "Terjadi kesalahan");
      }
    } catch (err) {
      console.error("Submit error:", err);
      const errorMsg = `Gagal menyimpan data: ${err.message}`;
      setError(errorMsg);
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setForm({ 
      ...item, 
      password: ""
    });
    setIsEdit(true);
    setError("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus data ini?")) return;
    
    try {
      setLoading(true);
      const url = `${API_BASE_URL}/del_karyawan.php?id=${id}`;
      console.log("Deleting:", url);
      
      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          "Accept": "application/json",
        },
      });
      
      const responseText = await res.text();
      console.log("Delete response:", responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        throw new Error("Invalid response from server");
      }
      
      if (result.status === "success") {
        alert("Data berhasil dihapus");
        fetchKaryawan();
      } else {
        throw new Error(result.message || "Gagal menghapus");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert(`Gagal menghapus: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      id: "",
      nama: "",
      nip: "",
      password: "",
      usertype: "karyawan",
      jabatan: "",
      pos: "",
    });
    setIsEdit(false);
    setError("");
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // ================= RENDER =================
  return (
    <div className="container-fluid">
      <div className="row">
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
            <small className="text-muted"> Penambahan Karyawan</small>
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

        {/* MAIN */}
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4 bg-light">
          <h2 className="fw-bold mb-4">Manajemen User</h2>

          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <strong>Error!</strong> {error}
              <button type="button" className="btn-close" onClick={() => setError("")}></button>
            </div>
          )}

          {loading && (
            <div className="alert alert-info">
              <div className="d-flex align-items-center">
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <span>Memproses data...</span>
              </div>
            </div>
          )}

          <div className="row">
            {/* FORM */}
            <div className="col-lg-4 mb-4">
              <div className="card border-0 shadow-sm">
                <div className={`card-header text-white ${isEdit ? "bg-warning" : "bg-primary"}`}>
                  <h6 className="mb-0">{isEdit ? "Edit User" : "Tambah User"}</h6>
                </div>

                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    <input type="hidden" name="id" value={form.id} />

                    <div className="mb-2">
                      <label className="small fw-bold">Nama *</label>
                      <input
                        className="form-control form-control-sm"
                        name="nama"
                        value={form.nama}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="mb-2">
                      <label className="small fw-bold">NIP *</label>
                      <input
                        className="form-control form-control-sm"
                        name="nip"
                        value={form.nip}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="mb-2">
                      <label className="small fw-bold">Password {!isEdit && "*"}</label>
                      <input
                        type="password"
                        className="form-control form-control-sm"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder={isEdit ? "Kosongkan jika tidak ganti" : "Minimal 6 karakter"}
                        required={!isEdit}
                        disabled={loading}
                      />
                      {isEdit && (
                        <small className="text-muted">*Isi password hanya jika ingin mengganti</small>
                      )}
                    </div>

                    <div className="mb-2">
                      <label className="small fw-bold">User Type</label>
                      <select
                        className="form-select form-select-sm"
                        name="usertype"
                        value={form.usertype}
                        onChange={handleChange}
                        disabled={loading}
                      >
                        <option value="karyawan">Karyawan</option>
                        <option value="admin">Admin Super</option>
                        <option value="admin_barang">Admin Barang</option>
                        <option value="admin_cuti">Admin Cuti</option>
                      </select>
                    </div>

                    <div className="mb-2">
                      <label className="small fw-bold">Jabatan</label>
                      <input
                        className="form-control form-control-sm"
                        name="jabatan"
                        value={form.jabatan}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="small fw-bold">Unit Kerja (POS)</label>
                      <input
                        className="form-control form-control-sm"
                        name="pos"
                        value={form.pos}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>

                    <button
                      type="submit"
                      className={`btn btn-sm w-100 ${isEdit ? "btn-warning" : "btn-primary"}`}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                          {isEdit ? "Mengupdate..." : "Menyimpan..."}
                        </>
                      ) : (
                        isEdit ? "Update User" : "Simpan User"
                      )}
                    </button>

                    {isEdit && (
                      <button
                        type="button"
                        className="btn btn-link btn-sm w-100 mt-2"
                        onClick={resetForm}
                        disabled={loading}
                      >
                        Batal
                      </button>
                    )}
                  </form>
                </div>
              </div>
            </div>

            {/* TABLES */}
            <div className="col-lg-8">
              {/* Tabel Admin Super */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-danger text-white">
                  <h6 className="mb-0">
                    <i className="bi bi-shield-lock-fill me-2"></i>
                    Daftar Admin Super
                  </h6>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th className="small">NIP</th>
                        <th className="small">Nama</th>
                        <th className="small">Jabatan</th>
                        <th className="small">Unit Kerja</th>
                        <th className="small text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminSuperList.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center small text-muted py-4">
                            <i className="bi bi-inbox me-2"></i>
                            Tidak ada data admin super
                          </td>
                        </tr>
                      ) : (
                        adminSuperList.map((item) => (
                          <tr key={item.id}>
                            <td className="small">{item.nip}</td>
                            <td>
                              <div className="fw-bold small">{item.nama}</div>
                            </td>
                            <td className="small">{item.jabatan || "-"}</td>
                            <td className="small">{item.pos || "-"}</td>
                            <td className="text-center">
                              <button
                                className="btn btn-sm btn-outline-primary me-1 py-0 px-2"
                                onClick={() => handleEdit(item)}
                                disabled={loading}
                              >
                                <i className="bi bi-pencil"></i> Edit
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger py-0 px-2"
                                onClick={() => handleDelete(item.id)}
                                disabled={loading}
                              >
                                <i className="bi bi-trash"></i> Hapus
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tabel Admin Barang */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-warning text-dark">
                  <h6 className="mb-0">
                    <i className="bi bi-box-seam me-2"></i>
                    Daftar Admin Barang
                  </h6>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th className="small">NIP</th>
                        <th className="small">Nama</th>
                        <th className="small">Jabatan</th>
                        <th className="small">Unit Kerja</th>
                        <th className="small text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminBarangList.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center small text-muted py-4">
                            <i className="bi bi-inbox me-2"></i>
                            Tidak ada data admin barang
                          </td>
                        </tr>
                      ) : (
                        adminBarangList.map((item) => (
                          <tr key={item.id}>
                            <td className="small">{item.nip}</td>
                            <td>
                              <div className="fw-bold small">{item.nama}</div>
                             </td>
                            <td className="small">{item.jabatan || "-"}</td>
                            <td className="small">{item.pos || "-"}</td>
                            <td className="text-center">
                              <button
                                className="btn btn-sm btn-outline-primary me-1 py-0 px-2"
                                onClick={() => handleEdit(item)}
                                disabled={loading}
                              >
                                <i className="bi bi-pencil"></i> Edit
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger py-0 px-2"
                                onClick={() => handleDelete(item.id)}
                                disabled={loading}
                              >
                                <i className="bi bi-trash"></i> Hapus
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tabel Admin Cuti */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-success text-white">
                  <h6 className="mb-0">
                    <i className="bi bi-calendar-check me-2"></i>
                    Daftar Admin Cuti
                  </h6>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th className="small">NIP</th>
                        <th className="small">Nama</th>
                        <th className="small">Jabatan</th>
                        <th className="small">Unit Kerja</th>
                        <th className="small text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminCutiList.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center small text-muted py-4">
                            <i className="bi bi-inbox me-2"></i>
                            Tidak ada data admin cuti
                          </td>
                        </tr>
                      ) : (
                        adminCutiList.map((item) => (
                          <tr key={item.id}>
                            <td className="small">{item.nip}</td>
                            <td>
                              <div className="fw-bold small">{item.nama}</div>
                             </td>
                            <td className="small">{item.jabatan || "-"}</td>
                            <td className="small">{item.pos || "-"}</td>
                            <td className="text-center">
                              <button
                                className="btn btn-sm btn-outline-primary me-1 py-0 px-2"
                                onClick={() => handleEdit(item)}
                                disabled={loading}
                              >
                                <i className="bi bi-pencil"></i> Edit
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger py-0 px-2"
                                onClick={() => handleDelete(item.id)}
                                disabled={loading}
                              >
                                <i className="bi bi-trash"></i> Hapus
                              </button>
                            </td>
                           </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tabel Karyawan */}
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-info text-white">
                  <h6 className="mb-0">
                    <i className="bi bi-people me-2"></i>
                    Daftar Karyawan
                  </h6>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th className="small">NIP</th>
                        <th className="small">Nama</th>
                        <th className="small">Jabatan</th>
                        <th className="small">Unit Kerja</th>
                        <th className="small text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {karyawanList.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center small text-muted py-4">
                            <i className="bi bi-inbox me-2"></i>
                            Tidak ada data karyawan
                          </td>
                        </tr>
                      ) : (
                        karyawanList.map((item) => (
                          <tr key={item.id}>
                            <td className="small">{item.nip}</td>
                            <td>
                              <div className="fw-bold small">{item.nama}</div>
                             </td>
                            <td className="small">{item.jabatan || "-"}</td>
                            <td className="small">{item.pos || "-"}</td>
                            <td className="text-center">
                              <button
                                className="btn btn-sm btn-outline-primary me-1 py-0 px-2"
                                onClick={() => handleEdit(item)}
                                disabled={loading}
                              >
                                <i className="bi bi-pencil"></i> Edit
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger py-0 px-2"
                                onClick={() => handleDelete(item.id)}
                                disabled={loading}
                              >
                                <i className="bi bi-trash"></i> Hapus
                              </button>
                            </td>
                           </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Tambahkar;