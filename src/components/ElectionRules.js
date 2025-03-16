import React from "react";
import { useNavigate } from "react-router-dom"; 

const ElectionRules = () => {
  const navigate = useNavigate();
  const handleBack = () => {
    navigate("/"); 
  };

  return (
    <>
    <header id="header">
      <nav className="navbar navbar-expand-lg">
        <div className="container-fluid">
          <a className="navbar-brand fw-bold" href="/"><i className="fab fa-hive" /> The Voting Film</a>
        </div>
      </nav>
    </header>
    <div className="election-rules"> 
      <h2>Thể lệ cuộc bình chọn</h2>
      <p className="intro">
        Cuộc bình chọn phim được tổ chức để khuyến khích cộng đồng tham gia và chọn ra bộ phim yêu thích nhất.
        Thông tin bình chọn sẽ được bảo mật và ghi nhận trên hệ thống Blockchain để đảm bảo tính công khai, minh bạch.
      </p>
      <ul>
        <li><i className="fas fa-star"></i> Mỗi người dùng chỉ được bỏ phiếu một lần cho một bộ phim trong cuộc bình chọn.</li>
        <li><i className="fas fa-user-check"></i> Người dùng phải đăng ký tài khoản trước khi tham gia bình chọn.</li>
        <li><i className="fas fa-lock"></i> Bình chọn của bạn không thể thay đổi sau khi bình chọn.</li>
        <li><i className="fas fa-eye"></i> Hãy chắc chắn rằng bạn đã đọc kỹ các thông tin về phim trước khi bình chọn.</li>
        <li><i className="fas fa-vote-yea"></i> Các bình chọn sẽ được tính vào tổng số bình chọn của phim.</li>
      </ul>
      <p className="note">
        Hãy chắc chắn bạn đã đọc và hiểu rõ các điều khoản trên trước khi tham gia cuộc bình chọn.
      </p>
      <button onClick={handleBack} className="btn btn-outline-secondary backbutton">
        <i className="fa-solid fa-arrow-left"></i> Quay lại
      </button>
    </div></>
  );

};
export default ElectionRules;
