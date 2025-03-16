import React, { useState, useEffect } from "react"; 
import { useNavigate } from "react-router-dom";  
import getWeb3 from "../../getWeb3";
import Voter from "../../contracts/voter.json";
import "./Registration.css";

const Registration = () => {
    const [VoterInstance, setVoterInstance] = useState(undefined);
    const [account, setAccount] = useState(null);
    const [web3, setWeb3] = useState(null);
    const [registrationStatus, setRegistrationStatus] = useState("");
    const [currentVoter, setCurrentVoter] = useState({
        address: undefined,
        name: null,
        cccd: null,
        password:null,
        hasVoted: false,
        isRegistered: false,
    });
    const [formData, setFormData] = useState({
        name: "",
        cccd: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate(); 

    // Khởi tạo và lấy dữ liệu từ blockchain
    useEffect(() => {
        const init = async () => {
            if (!window.location.hash) {
                window.location = window.location + "#loaded";
                window.location.reload();
            }
            try {
                const web3 = await getWeb3();
                setWeb3(web3);

                const accounts = await web3.eth.getAccounts();
                setAccount(accounts[0]);

                const networkId = await web3.eth.net.getId();
                const VoterNetwork = Voter.networks[networkId];
                if (VoterNetwork) {
                    const VoterInstance = new web3.eth.Contract(Voter.abi, VoterNetwork.address);
                    setVoterInstance(VoterInstance);

                    const voter = await VoterInstance.methods.voterDetails(accounts[0]).call();
                    setCurrentVoter({
                        address: voter.voterAddress,
                        name: voter.name,
                        cccd: voter.cccd,
                        password: voter.password,
                        hasVoted: voter.hasVoted,
                        isRegistered: voter.isRegistered,
                    });

                } else {
                    alert("Voter contract not deployed to detected network.");
                }
            } catch (error) {
                alert(`Failed to load web3, accounts, or contract. Check console for details.`);
                console.error(error);
            }
        };

        init();
    }, []);

    const handleChange = (e) => {
        setFormData({ 
            ...formData, 
            [e.target.name]: e.target.value 
        });
    };
    const checkIfCCCDRegistered = async (cccd) => {
        try {
            const cccdHash = web3.utils.keccak256(cccd);
            const isRegistered = await VoterInstance.methods.isCCCDRegistered(cccdHash).call();
            return isRegistered;
        } catch (error) {
            console.error("Lỗi kiểm tra CCCD:", error);
            return false;
        }
    };
    
    const handleRegister = async (e) => {
        e.preventDefault();
        setRegistrationStatus("");

        if (!VoterInstance) {
            setRegistrationStatus("Hợp đồng chưa được kết nối.");
            return;
        }

        const { name, cccd, password } = formData;
        if (!name || !cccd || !password || cccd.length !== 12) {
            setRegistrationStatus("Vui lòng nhập đầy đủ thông tin hợp lệ.");
            return;
        }

        try {
            const isCCCDAlreadyRegistered = await checkIfCCCDRegistered(cccd);
            if (isCCCDAlreadyRegistered) {
                setRegistrationStatus(`Số CCCD ${cccd} đã được đăng ký.`);
                return;
            }
            const cccdHash = web3.utils.keccak256(cccd);
            const passwordHash = web3.utils.keccak256(password);

            setRegistrationStatus("Đang xử lý giao dịch...");
            await VoterInstance.methods.registerAsVoter(name, cccdHash, passwordHash).send({ from: account });
            setRegistrationStatus("Đăng ký thành công!");
        } catch (error) {
            if (error.message.includes("CCCD already registered")) {
                setRegistrationStatus("Số CCCD đã được đăng ký.");
            } else {
                setRegistrationStatus("Đăng ký thất bại. Vui lòng thử lại.");
                console.error(error);
            }
        }
    };

    const handleBack = () => {
        navigate("/"); 
    };
    const togglePassword = () => {
        setShowPassword(!showPassword);
    };

    if (!web3) {
        return (
            <>
                <center style={{marginTop: "10px"}}>Loading Web3, accounts, and contract...</center>
                <div class="loader"></div>
            </>
        );
    }

    return (
        <>
            <header id="header">
              <nav className="navbar navbar-expand-lg">
                  <div className="container-fluid">
                    <a className="navbar-brand fw-bold" href="/"><i className="fab fa-hive" /> The Voting Film</a>
                  </div>
              </nav>
            </header>
            <div className="registration-container">
                <h2>Đăng Ký</h2>
                {currentVoter.isRegistered ? (
                    <div className="container-item success">
                        <p> Bạn đã đăng ký thành công. Vui lòng đăng nhập để bình chọn. </p>
                    </div>
                ) : (
                    <form onSubmit={handleRegister} className="registration-form">
                        <div className="form-group">
                            <label htmlFor="name">Họ và tên</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="eg. Nguyễn Văn A"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="cccd">Số Căn Cước Công Dân</label>
                            <input
                                type="text"
                                id="cccd"
                                name="cccd"
                                value={formData.cccd}
                                onChange={handleChange}
                                required
                                placeholder="eg. 123456789900"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Mật khẩu</label>
                            <div className="password-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                                <span onClick={togglePassword} className="toggle-password-span">
                                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                </span>
                            </div>
                            
                        </div>
                        <button type="submit" className="register-button">
                            Đăng Ký
                        </button>
                    </form>
                )}
                {registrationStatus && <p className="status-message">{registrationStatus}</p>}
                <button onClick={handleBack} className="btn btn-outline-secondary back-button">
                    <i className="fa-solid fa-arrow-left"></i> Quay lại
                </button>
            </div>
        </>
    );
};

export default Registration;
