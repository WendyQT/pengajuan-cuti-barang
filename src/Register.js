import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Register.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    const res = await axios.post("http://localhost/sendik/register.php", {
      name,
      email,
      password,
    });

    alert(res.data.message);

    if (res.data.message === "Register berhasil!") {
      window.location.href = "/login"; // PINDAH KE LOGIN
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow-lg" style={{ width: "380px" }}>
        <h3 className="text-center mb-4">Register</h3>

        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label className="form-label">Nama</label>
            <input
              type="text"
              className="form-control"
              placeholder="Nama lengkap"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="btn btn-success w-100">Register</button>

          <p className="text-center mt-3">
            Sudah punya akun? <a href="/login">Login di sini</a>
          </p>
        </form>
      </div>
    </div>
  );
}
