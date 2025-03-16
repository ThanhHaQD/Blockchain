import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Nav.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const handleLogout =()=>{
    localStorage.removeItem("token");
    navigate("/");
  };
  return (
    <nav>
      <NavLink to="/Home" className="header">
        <i className="fab fa-hive"></i> Trang chủ
      </NavLink>
      <ul className="navbar-links" style={{ transform: open ? "translateX(0px)" : "" }}>
        <li>
          <NavLink to="/FilmList" className={({ isActive }) => isActive ? "nav-active" : ""}>
            <i className="far fa-registered" /> Xem thông tin phim
          </NavLink>
        </li>
        <li>
          <NavLink to="/Voting" className={({ isActive }) => isActive ? "nav-active" : ""}>
            <i className="fas fa-vote-yea" /> Bình chọn
          </NavLink>
        </li>
        <li>
          <NavLink to="/Results" className={({ isActive }) => isActive ? "nav-active" : ""}>
            <i className="fas fa-poll-h" /> Kết quả
          </NavLink>
        </li>
        <li>
          <button onClick={handleLogout} className="logout-button">
            <i className="fas fa-sign-out-alt" /> Đăng xuất
          </button>
        </li>
      </ul>
      <i onClick={() => setOpen(!open)} className="fas fa-bars burger-menu"></i>
    </nav>
  );
}
