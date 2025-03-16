// một component dùng để hiển thị thông báo khi cuộc bình chọn chưa bắt đầu
// Node module
import React from "react";

const NotInit = () => {
  return (
    <div className="not-init">
      <center>
        <h3>Chưa có cuộc bình chọn nào.</h3>
        <p>Vui lòng chờ...</p><div class="loader"></div>
      </center> 
    </div>
  );
};
export default NotInit;
