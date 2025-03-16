import React, { useState, useEffect } from "react"; 
import dayjs from "dayjs";
import getWeb3 from "../../getWeb3";
import vote from "../../contracts/vote.json";
import Navbar from "../Navbar/Nav";
import NavbarAdmin from "../Navbar/NavAdmin";
import "./FilmList.css";

const FilmList = () => {
  const [voteInstance, setVoteInstance] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [films, setFilms] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filmCount, setFilmCount] = useState(0);
  const [selectedFilmId, setSelectedFilmId] = useState(null);
  const [selectedFilm, setSelectedFilm] = useState(null);

  useEffect(() => {
    const loadBlockchainData = async () => {
      try {
        if (!window.location.hash) {
          window.location = window.location + "#loaded";
          window.location.reload();
        }
        const web3 = await getWeb3();
        const accounts = await web3.eth.getAccounts();
        const networkId = await web3.eth.net.getId();
    
        const deployedVoteNetwork = vote.networks[networkId];
        if (!deployedVoteNetwork) {
          throw new Error("Contract not deployed to detected network.");
        }
        const voteInstance = new web3.eth.Contract(vote.abi, deployedVoteNetwork.address);
        setWeb3(web3);
        setVoteInstance(voteInstance);
        setAccounts(accounts);

        const admin = await voteInstance.methods.getAdmin().call();
        if (accounts[0] === admin) {
          setIsAdmin(true);
        }

        loadFilms(voteInstance);
      } catch (error) {
        console.error("Error loading web3, accounts, or contract:", error);
      }
    };

    loadBlockchainData();
  }, []);

  const loadFilms = async (voteInstance) => {
    try {
      const filmCount = await voteInstance.methods.getTotalFilms().call();
      setFilmCount(filmCount);

      const filmsArray = [];
      for (let i = 0; i < filmCount; i++) {
        const film = await voteInstance.methods.getFilm(i).call();
        filmsArray.push({
          id: i,
          tenPhim: film[0],
          quocGia: film[1],
          ngay: dayjs(film[2]).format("DD/MM/YYYY"),
          theLoai: film[3],
          tenDV: film[4],
          tenDD: film[5],
          noiDung: film[6],
          hinhAnh: film[7],
        });
      }
      setFilms(filmsArray);
    } catch (error) {
      console.error("Error loading films:", error);
    }
  };

  const handleFilmChange = (event) => {
    const selectedFilmId = event.target.value;
    setSelectedFilmId(selectedFilmId);

    if (selectedFilmId !== "none") {
      const film = films.find(film => film.id === parseInt(selectedFilmId));
      setSelectedFilm(film);
    } else {
      setSelectedFilm(null);
    }
  };

  if (!web3) {
    return (
      <>
        {isAdmin ? <NavbarAdmin /> : <Navbar />}
        <center style={{marginTop: "10px"}}>Loading Web3, accounts, and contract...</center>
        <div class="loader"></div>
      </>
    );
  }

  return (
    <>
      {isAdmin ? <NavbarAdmin /> : <Navbar />}
      <div className="list container-main">
        <h2><strong>Thông tin phim</strong></h2>
        <div className="form-group">
          <select id="film-select" onChange={handleFilmChange} value={selectedFilmId || "none"}>
            <option value="none">Hãy chọn phim bạn muốn xem thông tin</option>
            {films.map(film => (
              <option key={film.id} value={film.id}>
                {film.tenPhim}
              </option>
            ))}
          </select>
        </div>

        {selectedFilm && (
          <div className="film-details-container">
            <div className="film-image">
              <img src={selectedFilm.hinhAnh} alt={selectedFilm.tenPhim} />
            </div>
            <div className="film-details">
              <h3>{selectedFilm.tenPhim}</h3>
              <p><strong>Quốc gia:</strong> {selectedFilm.quocGia}</p>
              <p><strong>Ngày phát hành:</strong> {selectedFilm.ngay}</p>
              <p><strong>Thể loại:</strong> {selectedFilm.theLoai}</p>
              <p><strong>Đạo diễn:</strong> {selectedFilm.tenDD}</p>
              {selectedFilm.tenDV && <p><strong>Diễn viên:</strong> {selectedFilm.tenDV}</p>}
              <p><strong>Nội dung:</strong> {selectedFilm.noiDung}</p>
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default FilmList;
