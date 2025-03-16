import React from "react";

const Pagination = ({ filmsPerPage, totalFilms, currentPage, paginate }) => {
  const pageNumbers = [];

  // Tính tổng số trang
  for (let i = 1; i <= Math.ceil(totalFilms / filmsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <div aria-label="Page navigation example">
      <ul className="pagination justify-content-center">
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button
            type="button"
            className="page-link"
            aria-label="Previous"
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <span aria-hidden="true">&laquo;</span>
          </button>
        </li>

        {pageNumbers.map(number => (
          <li key={number} className={`page-item ${currentPage === number ? "active" : ""}`}>
            <button
              type="button"
              className="page-link"
              onClick={() => paginate(number)}
            >
              {number}
            </button>
          </li>
        ))}

        <li className={`page-item ${currentPage === pageNumbers.length ? "disabled" : ""}`}>
          <button
            type="button"
            className="page-link"
            aria-label="Next"
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === pageNumbers.length}
          >
            <span aria-hidden="true">&raquo;</span>
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Pagination;
