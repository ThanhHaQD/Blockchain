import React from "react";
import { Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

const StartEnd = (props) => {
  return (
    <div className="se container-main text-center py-4">
      {!props.elStarted ? (
        <>
          {!props.elEnded ? (
            <>
              <div className="container-item attention alert alert-secondary">
                <h2>Đừng quên thêm phim!!!</h2>
                <p>
                  Đi tới trang{" "}
                  <u>
                    <Link to="/AddFilm" className="alert-link">
                      thêm phim
                    </Link>
                  </u>
                  .
                </p>
              </div>
              <div className="container-item mt-3">
                <button type="submit" className="btn btn-outline-info">
                  Bắt đầu bình chọn {props.elEnded ? "Again" : null}
                </button>
              </div>
            </>
          ) : (
            <div className="container-item mt-3">
              <div className="restart">
                <p>Triển khai lại hợp đồng.</p>
                <button type="button" className="btn btn-outline-info" onClick={props.startNewRoundFn}><i className="fa-solid fa-rotate"></i> Restart</button>
              </div>
            </div>
          )}
          {props.elEnded ? (
            <div className="container-item mt-3">
              <div className="end">
                <p>Cuộc bình chọn đã kết thúc.</p>
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <>
          <div className="container-item mt-2">
            <div className="restart">
              <p>Cuộc bình chọn đã bắt đầu.</p>
            </div>
          </div>
          <div className="container-item mt-3">
            <button
              type="button"
              className="btn btn-danger"
              onClick={props.endElFn}
            >
              Kết thúc
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default StartEnd; 
