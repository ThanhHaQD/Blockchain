import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

// Components
import Navbar from "./Navbar/Nav";
import NavbarAdmin from "./Navbar/NavAdmin";
import HomeUser from "./HomeUser";
import StartEnd from "./StartEnd";
import ElectionStatus from "./ElectionStatus";

// Contract
import getWeb3 from "../getWeb3";
import voter from "../contracts/voter.json";
import vote from "../contracts/vote.json";

import "./Home.css";
import NotInit from "./NotInit";

const Home = () => {
    const [ElectionInstance, setElectionInstance] = useState(undefined);
    const [voteInstance, setVoteInstance] = useState(undefined);
    const [account, setAccount] = useState(null);
    const [web3, setWeb3] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [elStarted, setElStarted] = useState(false);
    const [elEnded, setElEnded] = useState(false);
    const [elDetails, setElDetails] = useState({});
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState("");
    const [topFilms, setTopFilms] = useState([]);

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

                const deployedNetwork = voter.networks[networkId];
                const instance = new web3.eth.Contract(voter.abi, deployedNetwork && deployedNetwork.address);
                setElectionInstance(instance);

                const voteNetwork = vote.networks[networkId];
                const instanceVote = new web3.eth.Contract(vote.abi, voteNetwork && voteNetwork.address);
                setVoteInstance(instanceVote);

                setWeb3(web3);
                setAccount(accounts[0]);

                const admin = await instance.methods.getAdmin().call();
                if (accounts[0] === admin) {
                    setIsAdmin(true);
                }

                const start = await instance.methods.getStart().call();
                setElStarted(start);
                const end = await instance.methods.getEnd().call();
                setElEnded(end);

                const electionDetails = await instance.methods.getElectionDetails().call();
                setElDetails({
                    adminName: electionDetails[0],
                    adminEmail: electionDetails[1],
                    electionTitle: electionDetails[2],
                    startDate: new Date(parseInt(electionDetails[3]) * 1000).toLocaleDateString(),
                    endDate: new Date(parseInt(electionDetails[4]) * 1000).toLocaleDateString(),
                });
                const voterDetails = await instance.methods.voterDetails(accounts[0]).call();
                setUserName(voterDetails.name);
                setLoading(false);
            } catch (error) {
                alert("Failed to load web3, accounts, or contract. Check console for details.");
                console.error(error);
            }
        };
        if (!web3) { // Chỉ khởi tạo web3 nếu nó chưa tồn tại
            init();
        }
    }, [web3]);
    useEffect(() => {
        const fetchTopFilms = async () => {
            if (voteInstance) {
                try {
                    const totalFilms = await voteInstance.methods.getTotalFilms().call();
                    const films = [];
                    for (let i = 0; i < totalFilms; i++) {
                        const film = await voteInstance.methods.getFilm(i).call();
                        films.push({
                            id: i,
                            name: film[0],
                            image: film[7],
                            votes: parseInt(film[8], 10),
                        });
                    }
    
                    const sortedFilms = films.sort((a, b) => b.votes - a.votes).slice(0, 5);
                    setTopFilms(sortedFilms);
                } catch (error) {
                    console.error("Error fetching top films:", error);
                }
            }
        };
        fetchTopFilms();
    }, [voteInstance]);

    const endElection = async () => {
        await ElectionInstance.methods.endElection().send({ from: account, gas: 1000000 });
        window.location.reload(); 
    };
    
    const startNewRound = async () => {
        if (!voteInstance) {
            console.error("voteInstance is undefined.");
            return;
        }
        try {
            const receipt = await voteInstance.methods.startNewRound().send({ from: account, gas: 2000000 });
            console.log("New round started successfully:", receipt);

            const newRound = await voteInstance.methods.getCurrentRound().call();
            console.log("Current round after restart: ", newRound);

            setElDetails((prevDetails) => ({
                ...prevDetails,
                startDate: "",
                endDate: "",
            }));
            
            setElStarted(false);
            setElEnded(false);
            await ElectionInstance.methods.resetVoterStatus().send({from: account, gas: 1000000});
        } catch (error) { 
            console.error("Error starting new election: ", error);
        }
    };

    const registerElection = async (data) => {
        const startTimestamp = new Date(data.startDate).getTime() / 1000;
        const endTimestamp = new Date(data.endDate).getTime() / 1000;
    
        await ElectionInstance.methods
            .setElectionDetails(
                data.adminName,
                data.adminEmail.toLowerCase(),
                data.electionTitle.toLowerCase(),
                startTimestamp,
                endTimestamp
            ).send({ from: account, gas: 1000000 });
        window.location.reload(); 
    };
    
    const EMsg = (props) => <span style={{ color: "rgb(206, 49, 49)" }}>{props.msg}</span>;

    const AdminHome = () => {
        const { handleSubmit, register, formState: { errors } } = useForm();
        const onSubmit = (data) => { registerElection(data); };
        return (
            <div className="home container">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="row" style={{marginTop: "50px"}}>
                        <div className="col-md-6">
                            {!elStarted && !elEnded ? (
                                <div className="about-admin-election p-4 rounded shadow-lg bg-light">
                                    <h3 className="mb-4 text-center"><strong>Thông Tin</strong></h3>
                                        <div className="mb-3">
                                            <label className="form-label"><strong>Họ và tên Admin</strong> {errors.adminName && <EMsg msg="*required" />}</label>
                                            <input
                                                className="form-control shadow-sm"
                                                type="text"
                                                placeholder="eg. Nguyễn Văn A"
                                                {...register("adminName", { required: true })}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label"><strong>Email</strong> {errors.adminEmail && <EMsg msg={errors.adminEmail.message} />}</label>
                                            <input
                                                className="form-control shadow-sm"
                                                type="email"
                                                placeholder="eg. a@gmail.com"
                                                {...register("adminEmail", {
                                                    required: "*Required",
                                                    pattern: {
                                                        value: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/,
                                                        message: "*Invalid",
                                                    },
                                                })}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label"><strong>Tên cuộc bình chọn</strong> {errors.electionTitle && <EMsg msg="*required" />}</label>
                                            <input
                                                className="form-control shadow-sm"
                                                type="text"
                                                placeholder="eg. ABC..."
                                                {...register("electionTitle", { required: true })}
                                            />
                                        </div>
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label"><strong>Ngày bắt đầu</strong></label>
                                                <input
                                                    className="form-control shadow-sm"
                                                    type="date"
                                                    {...register("startDate", { required: true })}
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label"><strong>Ngày kết thúc</strong></label>
                                                <input
                                                    className="form-control shadow-sm"
                                                    type="date"
                                                    {...register("endDate", { required: true })}
                                                />
                                            </div>
                                        </div>
                                </div>
                            ) : elStarted ? (
                                <HomeUser el={elDetails} isAdmin={isAdmin} topFilms={topFilms}/>
                            ) : null}
                        </div>
                        
                        <div className="col-md-6">
                            <StartEnd elStarted={elStarted} elEnded={elEnded} endElFn={endElection} startNewRoundFn={startNewRound} />
                            <ElectionStatus elStarted={elStarted} elEnded={elEnded} startDate={elDetails.startDate} endDate={elDetails.endDate} />
                        </div>  
                    </div>
                </form>
            </div>
        );
    };

    if (loading) {
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
            <div className="h container-main">
                <div className="container-item center-items info text-center mt-3">
                    {isAdmin ? (
                        <>Xin chào, <span className="user-name">Admin</span>❣️</>
                    ) : (
                        <> Xin chào, <span className="user-name">{userName}</span>❣️!!!</>
                    )}
                </div>
                {!isAdmin && !elStarted && !elEnded  ? (
                    <NotInit></NotInit>
                ) : null}
            </div>
            {isAdmin ? (
                <>
                    <AdminHome />
                </>
            ) : elStarted ? (
                <>
                    <HomeUser el={elDetails} isAdmin={isAdmin} topFilms={topFilms}/>
                </>
            ) : !elStarted && elEnded ? (
                <>
                    <div className="ended">
                        <center>
                            <h3>Cuộc bình chọn đã kết thúc.</h3>
                            <br />
                            <Link to="/Results" style={{ color: "black", textDecoration: "underline" }}>
                                Xem kết quả
                            </Link>
                        </center>
                    </div>
                </>
            ) : null}
        </>
    );
};

export default Home;
