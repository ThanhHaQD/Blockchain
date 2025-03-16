import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Nav.css";

export default function NavbarAdmin() {
  //open=false, hàm setOpen cập nhật gtri của open
  //điều khiển trạng thái mở/đóng của menu khi ở chế độ màn hình nhỏ (hiển thị trên mobile).
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const handleLogout =()=>{
    localStorage.removeItem("token");
    navigate("/");
  };
  return (
    <nav>
      <div className="header">
        <NavLink to="/Home">
          <i className="fab fa-hive" /> Admin
        </NavLink>
      </div>
      <ul className="navbar-links" style={{ transform: open ? "translateX(0px)" : "" }}>
        <li>
          <NavLink to="/AddFilm" className={({ isActive }) => isActive ? "nav-active" : ""}>
            <i className="fa-solid fa-circle-plus"/> Thêm phim
          </NavLink>
        </li>
        <li>
          <NavLink to="/FilmList" className={({ isActive }) => isActive ? "nav-active" : ""}>
            <i className="far fa-registered" /> Xem thông tin phim
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
