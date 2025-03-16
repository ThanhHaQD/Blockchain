import React from "react";

function HomeUser(props) {
  return (
      <div className="user container-main">
        <div className="container-list title">
          <h1>{props.el.electionTitle || "No Title"}</h1>
          <br />
          <table className="table table-hover">
            <tbody>
              {props.isAdmin ? (
                <>
                  <tr>
                    <th><i className="fa-solid fa-user"></i> Admin</th>
                    <td>{props.el.adminName || "No Admin Name"}</td>
                  </tr>
                  <tr>
                    <th><i className="fa-solid fa-envelope"></i> Liên hệ</th>
                    <td>{props.el.adminEmail || "No Admin Email"}</td>
                  </tr>
                </>
              ) : (
                <>
                  <tr>
                    <th><i className="fa-solid fa-building"></i> Đơn vị</th>
                    <td>Bộ Văn hóa, Thể thao và Du lịch</td>
                  </tr>
                  <tr>
                    <th><i className="fa-solid fa-envelope"></i> Email</th>
                    <td>vanthu@bvhttdl.gov.vn</td>
                  </tr>
                  <tr>
                    <th><i className="fa-solid fa-clock"></i> Thời gian</th>
                    <td>{`${props.el.startDate || "Chưa có"} - ${props.el.endDate || "Chưa có"}`}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
        {!props.isAdmin && props.topFilms && props.topFilms.length > 0 && (
          <div className="top-films-container">
            <h3>Top 5 Phim Đang Được Bình Chọn Nhiều Nhất</h3>
            <div className="top-films">
              {props.topFilms.map((film, index) => (
                <div 
                  key={film.id} 
                  className={`film-card film-${index + 1}`}
                >
                  <div className="home-film-image">
                    <img src={film.image} alt={film.name} />
                  </div>
                  <div className="film-rank">Top {index + 1}</div>
                  <div className="film-name">{film.name}</div>
                  <div className="film-votes">{film.votes} lượt bình chọn</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
  );
}

export default HomeUser;
