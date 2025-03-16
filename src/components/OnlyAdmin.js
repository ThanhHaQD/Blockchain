import React from "react";

const OnlyAdmin = (props) => {
  return (
    <div className="container-item attention" style={{ borderColor: "tomato" }}>
      <center>
        <div style={{ margin: "17px" }}>
          <h1>{props.page}</h1> {/* dùng để hiển thị tên của trang parent component */}
        </div>
        <p>Chỉ Admin mới có quyền truy cập.</p>
      </center>
    </div>
  );
};

export default OnlyAdmin;
