import React from "react";

const ElectionStatus = (props) => {
  return (
    <div className="container-main pt-3" style={{ borderTop: "1px solid", marginTop: "0px" }}>
      <h3 className="text-center">Trạng thái cuộc bình chọn</h3>
      <div className="d-flex justify-content-around align-items-center border border-danger rounded py-2 px-3 my-3" style={{ width: "80%", margin: "0 auto" }}>
        <p className="mb-0">Bắt đầu: {props.startDate}</p>
        <p className="mb-0">Kết thúc: {props.endDate}</p>
      </div>
      <div className="container-item" />
    </div>
  );
};

export default ElectionStatus;