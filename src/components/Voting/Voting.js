import React, { useState, useEffect } from "react"; 
import { Link } from "react-router-dom";
import Navbar from "../Navbar/Nav";
import NavbarAdmin from "../Navbar/NavAdmin";
import NotInit from "../NotInit";
import getWeb3 from "../../getWeb3";
import Voter from "../../contracts/voter.json";
import vote from "../../contracts/vote.json";
import Pagination from "./Pagination";
import "./Voting.css";

const Voting = () => {
    const [VoterInstance, setVoterInstance] = useState(undefined);
    const [VoteInstance, setVoteInstance] = useState(undefined);
    const [account, setAccount] = useState(null);
    const [web3, setWeb3] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [filmCount, setFilmCount] = useState(undefined);
    const [films, setFilms] = useState([]);
    const [electionTitle, setElectionTitle] = useState("");
    const [isElStarted, setIsElStarted] = useState(false);
    const [isElEnded, setIsElEnded] = useState(false);
    const [currentVoter, setCurrentVoter] = useState({
        address: undefined,
        name: null,
        phone: null,
        hasVoted: false,
        isRegistered: false,
    });
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const filmsPerPage = 5;

    useEffect(() => {
        const init = async () => {
            if (!window.location.hash) {
                window.location = window.location + "#loaded";
                window.location.reload();
            }
            try {
                // Get web3 instance
                const web3 = await getWeb3();
                setWeb3(web3);

                const accounts = await web3.eth.getAccounts();
                setAccount(accounts[0]);

                const networkId = await web3.eth.net.getId();

                const VoterNetwork = Voter.networks[networkId];
                const VoterInstance = new web3.eth.Contract(Voter.abi, VoterNetwork && VoterNetwork.address);
                setVoterInstance(VoterInstance);

                const VoteNetwork = vote.networks[networkId];
                const VoteInstance = new web3.eth.Contract(vote.abi, VoteNetwork && VoteNetwork.address);
                setVoteInstance(VoteInstance);

                // Get total number of films
                const filmCount = await VoteInstance.methods.getTotalFilms().call();
                setFilmCount(filmCount);

                // Get election status (start and end)
                const start = await VoterInstance.methods.getStart().call();
                setIsElStarted(start);
                const end = await VoterInstance.methods.getEnd().call();
                setIsElEnded(end);

                // Load film details
                let filmsList = [];
                for (let i = 0; i < filmCount; i++) {
                    const film = await VoteInstance.methods.getFilm(i).call();
                    filmsList.push({
                        id: i,
                        title: film[0],
                        voteCount: parseInt(film[8]), 
                    });
                }
                filmsList.sort((a, b) => a.title.localeCompare(b.title));
                setFilms(filmsList);

                // chi tiết voter
                const voter = await VoterInstance.methods.voterDetails(accounts[0]).call();
                setCurrentVoter({
                    address: voter.voterAddress,
                    name: voter.name,
                    phone: voter.phone,
                    hasVoted: voter.hasVoted,
                    isRegistered: voter.isRegistered,
                });
                
                const electionDetails = await VoterInstance.methods.getElectionDetails().call();
                const electionTitle = electionDetails[2]; // Lấy tiêu đề cuộc bầu chọn
                setElectionTitle(electionTitle);

                const admin = await VoterInstance.methods.getAdmin().call();
                if (accounts[0] === admin) {
                    setIsAdmin(true);
                }
            } catch (error) {
                alert(`Failed to load web3, accounts, or contract. Check console for details.`);
                console.error(error);
            }
        };

        init();
    }, [isElStarted, isElEnded]);

    const renderFilms = (film) => {
        const castVote = async (id) => {
            try {
                await VoterInstance.methods
                    .voteFilm(id, VoteInstance._address)
                    .send({ from: account, gas: 1000000 });
                window.location.reload(); 
            } catch (error) {
                console.error("Error casting vote:", error);
                alert("Failed to cast vote. Check the console for details.");
            }
        };
        
        const confirmVote = (id, title) => {
            const r = window.confirm(`Bình chọn cho ${title}. Bạn chắc chắn không?`);
            if (r === true) {
                castVote(id);
            }
        };

        return (
            <div className="voting container-item" key={film.id}>
                <div className="film-info">
                    <h2>{film.title}</h2>
                    <p>{film.voteCount}</p>
                </div>
                <div className="vote-btn-container">
                    <button onClick={() => confirmVote(film.id, film.title)} className="vote-btn" disabled={currentVoter.hasVoted}>
                        Bình chọn
                    </button>
                </div>
            </div>
        );
    };
    // lấy ds phim cho trang hiện tại
    const indexOfLastFilm = currentPage * filmsPerPage;
    const indexOfFirstFilm = indexOfLastFilm - filmsPerPage;
    const currentFilms = films.slice(indexOfFirstFilm, indexOfLastFilm);
    // Hàm đổi trang
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (!web3) {
        return (
            <>
                {isAdmin ? <NavbarAdmin /> : <Navbar />}
                <center>Loading Web3, accounts, and contract...</center>
                <div class="loader"></div>
            </>
        );
    }

    return (
        <>
            {isAdmin ? <NavbarAdmin /> : <Navbar />}
            <div className="voting">
                {!isElStarted && !isElEnded ? (
                    <NotInit />
                ) : isElStarted && !isElEnded ? (
                    <>
                        {currentVoter.isRegistered && (
                            currentVoter.hasVoted ? (
                                <div className="container-item success">
                                    <div>
                                        <strong>Bạn đã bình chọn.</strong>
                                        <center>
                                            <Link to="/Results" style={{ color: "black", textDecoration: "underline" }}>
                                                Xem kết quả
                                            </Link>
                                        </center>
                                    </div>
                                </div>
                            ) : (
                                <div className="container-item info">
                                    <center>Bình chọn cho bộ phim hay nhất.</center>
                                </div>
                            )
                        )}
                        <div className="container-main">
                            <h2 style={{textTransform: "uppercase", fontWeight: "bold"}}>{electionTitle}</h2>
                            <small>Số lượng phim: {films.length}</small>
                            {films.length < 1 ? (
                                <div className="container-item attention">
                                    <center>Không có phim nào.</center>
                                </div>
                            ) : (
                                <>
                                    {currentFilms.map(renderFilms)}
                                    <Pagination
                                        filmsPerPage={filmsPerPage}
                                        totalFilms={films.length}
                                        currentPage={currentPage}
                                        paginate={paginate}
                                    />
                                </>
                            )}
                        </div>
                    </>
                ) : !isElStarted && isElEnded ? (
                    <div className="container-item attention">
                        <center>
                            <h3>Cuộc bình chọn đã kết thúc.</h3>
                            <Link to="/Results" style={{ color: "black", textDecoration: "underline" }}>
                                Xem kết quả
                            </Link>
                        </center>
                    </div>
                ) : null}
            </div>
        </>
    );
};

export default Voting;
