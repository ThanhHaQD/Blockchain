import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import getWeb3 from "../../getWeb3";
import vote from "../../contracts/vote.json";
import voter from "../../contracts/voter.json";

import Navbar from "../Navbar/Nav";
import NavbarAdmin from "../Navbar/NavAdmin";
import OnlyAdmin from "../OnlyAdmin";
import "./AddFilm.css";

const AddFilm = () => {
  const [voteInstance, setVoteInstance] = useState(undefined);
  const [voterInstance, setVoterInstance] = useState(undefined);
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tenPhim, setTenPhim] = useState("");
  const [noiDung, setNoiDung] = useState("");
  const [quocGia, setQuocGia] = useState("");
  const [hinhAnh, setHinhAnh] = useState("");
  const [ngay, setNgay] = useState("");
  const [theLoai, setTheLoai] = useState("");
  const [tenDD, setTenDD] = useState("");
  const [tenDV, setTenDV] = useState("");
  const [films, setFilms] = useState([]);
  const [filmCount, setFilmCount] = useState(undefined);
  const [imageFile, setImageFile] = useState(null);
  const [start, setStart] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      if (!window.location.hash) {
        window.location = window.location + "#loaded";
        window.location.reload();
      }
      try {
        const web3 = await getWeb3();
        const accounts = await web3.eth.getAccounts();
        const networkId = await web3.eth.net.getId();
        const deployedVoteNetwork = vote.networks[networkId];
        const voteInstance = new web3.eth.Contract(
          vote.abi,
          deployedVoteNetwork && deployedVoteNetwork.address
        );

        const deployedVoterNetwork = voter.networks[networkId];
        const voterInstance = new web3.eth.Contract(
          voter.abi,
          deployedVoterNetwork && deployedVoterNetwork.address
        );
        
        setWeb3(web3);
        setAccounts(accounts);
        setVoteInstance(voteInstance);
        setVoterInstance(voterInstance);

        const admin = await voteInstance.methods.getAdmin().call();
        setIsAdmin(accounts[0] === admin);

        const hasVotingStarted = await voterInstance.methods.getStart().call();
        setStart(hasVotingStarted);

        loadFilms(voteInstance);
      } catch (error) {
        console.error("Failed to load web3, accounts, or contract", error);
        alert("Failed to load web3, accounts, or contract.");
      }
    };

    init();
  }, []); 

  const loadFilms = async (voteInstance) => {
    try {
      const filmCount = await voteInstance.methods.getTotalFilms().call();
      setFilmCount(filmCount);

      const films = [];
      for (let i = 0; i < filmCount; i++) {
        const film = await voteInstance.methods.getFilm(i).call();
        if (film) {
          films.push({
            id: i,
            tenPhim: film[0],
            quocGia: film[1],
            ngay: film[2],
            theLoai: film[3],
            tenDV: film[4],
            tenDD: film[5],
            noiDung: film[6],
            hinhAnh: film[7],
            voteCount: parseInt(film[8]),
          });
        }
      }
      setFilms(films);
    } catch (error) {
      console.error("Error loading films", error);
    }
  };

  const handleFileChange = (event) => {
    setImageFile(event.target.files[0]);
  };

  const uploadImageToPinata = async () => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    let data = new FormData();
    data.append("file", imageFile);

    const pinataApiKey = process.env.REACT_APP_PINATA_API_KEY;
    const pinataSecretApiKey = process.env.REACT_APP_PINATA_SECRET_API_KEY;

    try {
      const res = await axios.post(url, data, {
        headers: {
          "Content-Type": `multipart/form-data`,
          pinata_api_key: pinataApiKey,
          pinata_secret_api_key: pinataSecretApiKey,
        },
      });

      if (res.data && res.data.IpfsHash) {
        const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
        setHinhAnh(ipfsUrl);
        alert("Upload hình thành công!");
      } else {
        alert("Lỗi hình ảnh.");
      }
    } catch (error) {
      alert("Lỗi upload hình ảnh.");
    }
  };

  const addFilm = async () => {
    try {
      if (start) {
        alert("Không thể thêm phim, cuộc bình chọn đang diễn ra.");
        return;
      }
      const isDuplicate = films.some((film) => film.tenPhim.toLowerCase() === tenPhim.toLowerCase());
      if (isDuplicate) {
        alert("Tên phim đã tồn tại! Vui lòng nhập tên phim khác.");
        return;
      }
      await voteInstance.methods.addFilm(tenPhim, quocGia, ngay, theLoai, tenDV, tenDD, noiDung, hinhAnh)
        .send({ from: accounts[0], gas: 1000000 });

      loadFilms(voteInstance);
      alert("Thêm phim thành công!");
    } catch (error) {
      alert("Thất bại.");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    addFilm();
  };

  const handleBack = () => {
    navigate("/Home"); 
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

  if (!isAdmin) {
    return (
      <>
        <Navbar />
        <OnlyAdmin page="Trang Thêm Phim." />
      </>
    );
  }

  return (
    <>
      <NavbarAdmin />
      <div className="container-main">
        <div className="add container-item custom-form">
          <h2><strong>Thêm phim mới</strong></h2>
          {start ? (
            <div className="alert alert-info" role="alert">
              <strong>Cuộc bình chọn đã diễn ra!</strong> Bạn không thể thêm phim mới bây giờ.
            </div>
          ) : (
          <>
          <small>Số lượng phim: {films.length}</small>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <label className={"label-ac"}>
                Tên phim
                <input
                  className={"input-ac"}
                  type="text"
                  name="tenPhim"
                  placeholder="eg. The Matrix"
                  value={tenPhim}
                  onChange={(e) => setTenPhim(e.target.value)} required
                />
              </label>
              <label className={"label-ac"}>
                Quốc gia
                <input
                  className={"input-ac"}
                  type="text"
                  name="quocGia"
                  placeholder="eg. USA"
                  value={quocGia}
                  onChange={(e) => setQuocGia(e.target.value)} required
                />
              </label>
            </div>
            <div className="form-row">
              <label className={"label-ac"}>
                Ngày phát hành
                <input
                  className={"input-ac"}
                  type="date"
                  name="ngay"
                  value={ngay}
                  onChange={(e) => {const { value } = e.target;
                    setNgay(value);
                  }}
                  required
                />
              </label>

              <label className={"label-ac"}>
                Thể loại
                <input
                  className={"input-ac"}
                  type="text"
                  name="theLoai"
                  placeholder="eg. Action"
                  value={theLoai}
                  onChange={(e) => setTheLoai(e.target.value)} required
                />
              </label>
            </div>
            <div className="form-row">
              <label className={"label-ac"}>
                Diễn viên
                <input
                  className={"input-ac"}
                  type="text"
                  name="tenDV"
                  placeholder="eg. John Doe"
                  value={tenDV}
                  onChange={(e) => setTenDV(e.target.value)}
                />
              </label>
              <label className={"label-ac"}>
                Đạo diễn
                <input
                  className={"input-ac"}
                  type="text"
                  name="tenDD"
                  placeholder="eg. Jane Smith"
                  value={tenDD}
                  onChange={(e) => setTenDD(e.target.value)} required
                />
              </label>
            </div>
            <div className="form-row">
              <label className={"label-ac"}>
                Nội dung
                <input
                  className={"input-ac"}
                  type="text"
                  name="noiDung"
                  placeholder="eg. A sci-fi film"
                  value={noiDung}
                  onChange={(e) => setNoiDung(e.target.value)} required
                />
              </label>
            </div>
            <div className="form-row">
              <label className={"label-ac"}>
                Hình ảnh
                <input
                  className={"input-img"}
                  type="file"
                  accept="image/*"
                  name="imageFile"
                  onChange={handleFileChange}
                  required
                />
              </label>
              <button
                className="btn-upload"
                type="button"
                onClick={uploadImageToPinata}
              >
                <i className="fa-solid fa-cloud-arrow-up"></i> Tải ảnh lên Pinata
              </button>
            </div>
            <div className="form-row">
              <label className={"label-ac"}>
                URL:
                <input
                  className={"input-ac"}
                  type="text"
                  name="hinhAnh"
                  placeholder="Image URL from Pinata"
                  value={hinhAnh}
                  readOnly
                />
              </label>
            </div>
            <div className="form-row buttons">
              <button
                className="btn-add"
                disabled={
                  !(
                    tenPhim.trim().length > 0 &&
                    quocGia.trim().length > 0 &&
                    ngay.trim().length > 0 &&
                    hinhAnh.trim().length > 0 &&
                    noiDung.trim().length > 0
                  )
                }
                type="submit"
              ><i className="fa-solid fa-plus"></i> Thêm phim
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={handleBack}>
                <i className="fa-solid fa-arrow-left"></i> Quay lại
              </button>
            </div>
          </form>
          </> 
        )}
        </div>
      </div>
    </>
  );
};

export default AddFilm;
