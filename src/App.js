import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

import '@fortawesome/fontawesome-free/css/all.min.css';
import getWeb3 from './getWeb3';
import voter from './contracts/voter.json';

import Home from "./components/Home";
import Voting from "./components/Voting/Voting";
import Results from "./components/Results/Results";
import Registration from "./components/Registration/Registration";
import AddFilm from "./components/AddFilm/AddFilm";
import FilmList from "./components/FilmList/FilmList";
import ElectionRules from "./components/ElectionRules";
import Search from "./components/Search/Search";

import "./App.css";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); 
  const [voterPassword, setVoterPassword] = useState("");
  const [cccdNumber, setCccdNumber] = useState('');
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => {
    const initializeWeb3 = async () => {
      try {
        const web3Instance = await getWeb3();
        setWeb3(web3Instance);
        const accounts = await web3Instance.eth.getAccounts();
        setAccount(accounts[0]);

        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = voter.networks[networkId];
        const instance = new web3Instance.eth.Contract(voter.abi, deployedNetwork && deployedNetwork.address);
        setContract(instance);

        const admin = await instance.methods.getAdmin().call();
        if (accounts[0].toLowerCase() === admin.toLowerCase()) {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('Lỗi khởi tạo Web3:', error);
      }
    };
    initializeWeb3();
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
        if (!/^\d{12}$/.test(cccdNumber)) {
            alert("Vui lòng nhập số CCCD hợp lệ (12 chữ số).");
            return;
        }
        const cccdHash = web3.utils.keccak256(cccdNumber.trim());
        console.log("Hash của CCCD:", cccdHash);

        const isRegistered = await contract.methods.registeredCCCDHashes(cccdHash).call();
        console.log("Kết quả kiểm tra CCCD:", isRegistered);

        if (!isRegistered) {
            alert("CCCD không tồn tại. Vui lòng đăng ký trước.");
            return;
        }

        const isValid = await contract.methods.authenticateVoter(account, voterPassword).call();
        if (isValid) {
            setIsLoggedIn(true);
            navigate('/Home');
        } else {
            alert("Thông tin đăng nhập không hợp lệ.");
        }
    } catch (error) {
        console.error('Lỗi đăng nhập:', error);
        alert("Có lỗi xảy ra khi đăng nhập.");
    }
};

  const handleRegister = () => {
    navigate('/Registration');
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="App login">
      <Routes>
        <Route path="/" element={(
          <>
            <header id="header">
              <nav className="navbar navbar-expand-lg">
                <div className="container-fluid">
                  <a className="navbar-brand fw-bold" href="/">
                    <i className="fab fa-hive" /> The Voting Film
                  </a>
                  <button className="navbar-toggler" type="button"
                    data-bs-toggle="collapse" data-bs-target="#navbarContent"
                    aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation"
                  >
                    <span className="navbar-toggler-icon"></span>
                  </button>
                  <div className="collapse navbar-collapse" id="navbarContent">
                    <ul className="navbar-nav ms-auto">
                      {isAdmin ? (
                        <li className="nav-item">
                          <Link to="/Home" className="nav-link btn btn-outline-danger"><i className="fa fa-user-shield"></i> Admin</Link>
                        </li>
                      ) : (
                        <>
                          <li className="nav-item rule">
                            <Link to="/Rule" className="nav-link">
                              <i className="fa-solid fa-circle-exclamation"></i> Thể lệ
                            </Link>
                          </li>
                          <li className="nav-item search">
                            <Link to="/Search" className="nav-link">
                              <i className="fa-solid fa-search"></i> Tra cứu
                            </Link>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </nav>
            </header>

            {isLoggedIn ? <Home /> : (
                <div className="background">
                  <div className="main-content text-center">
                    <h1 className="display-10">Chào mừng bạn đến với The Voting Film</h1>
                    <p className="lead">Phiếu bầu của bạn rất quan trọng! Hãy tham gia trong việc chọn ra bộ phim hay nhất.</p>
                    <form onSubmit={handleLogin}>
                      {account && (
                        <div className="form-group mb-3">
                          <label htmlFor="account">Tài khoản MetaMask của bạn</label>
                          <input type="text" value={account} id="account" className="form-control" disabled />
                        </div>
                      )}
                      <div className="form-group mb-3">
                        <label htmlFor="cccdNumber">Số căn cước công dân của bạn</label>
                        <input type="text" id="cccdNumber" value={cccdNumber} onChange={(e) => setCccdNumber(e.target.value)} className="form-control" required />
                      </div>
                      <div className="form-group mb-3">
                        <label htmlFor="password">Mật khẩu của bạn</label>
                        <div className="password-wrapper">
                          <input type={showPassword ? "text" : "password"}
                                  id="password" value={voterPassword} onChange={(e) => setVoterPassword(e.target.value)} className="form-control" required />
                          <span onClick={togglePassword} className="toggle-password-span">
                                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                          </span>
                        </div>
                      </div>
                      <div className="button-container">
                        <button type="submit" className="btn btn-lg me-3">Đăng nhập</button>
                        <button type="button" onClick={handleRegister} className="btn btn-secondary btn-lg">Đăng ký</button>
                      </div>
                    </form>
                  </div>
                </div>
            )}
          </>
        )} />
        <Route path="/Home" element={<Home />} />
        <Route path="/AddFilm" element={<AddFilm />} />
        <Route path="/Voting" element={<Voting />} />
        <Route path="/Results" element={<Results />} />
        <Route path="/Registration" element={<Registration />} />
        <Route path="/FilmList" element={<FilmList />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/Rule" element={<ElectionRules />} />
        <Route path="/Search" element={<Search />} />
      </Routes>
    </div>
  );
};

const NotFound = () => (
  <div className="not-found-page">
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">Oops! Không tìm thấy trang bạn truy cập.</h2>
        <p className="not-found-text">
          Có vẻ như bạn đã lạc.
          <br />
          <Link to="/" className="back-home">
            Trở về Trang Chủ
          </Link>
        </p>
      </div>
      <div className="floating-astronaut">
        <img src="https://example.com/astronaut.png" alt="Astronaut" className="astronaut-img" />
      </div>
    </div>
  </div>
);


export default App;
