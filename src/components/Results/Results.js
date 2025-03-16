import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../Navbar/Nav";
import NavbarAdmin from "../Navbar/NavAdmin";
import NotInit from "../NotInit";
import getWeb3 from "../../getWeb3";
import Voter from "../../contracts/voter.json";
import vote from "../../contracts/vote.json";
import "./Results.css";

const Results = () => {
    const [VoterInstance, setVoterInstance] = useState(undefined);
    const [VoteInstance, setVoteInstance] = useState(undefined);
    const [account, setAccount] = useState(null);
    const [web3, setWeb3] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [films, setFilms] = useState([]);
    const [isElStarted, setIsElStarted] = useState(false);
    const [isElEnded, setIsElEnded] = useState(false);

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
                const VoterInstance = new web3.eth.Contract(Voter.abi, VoterNetwork && VoterNetwork.address);
                setVoterInstance(VoterInstance);

                const VoteNetwork = vote.networks[networkId];
                const VoteInstance = new web3.eth.Contract(vote.abi, VoteNetwork && VoteNetwork.address);
                setVoteInstance(VoteInstance);

                const filmCount = await VoteInstance.methods.getTotalFilms().call();

                const start = await VoterInstance.methods.getStart().call();
                setIsElStarted(start);
                const end = await VoterInstance.methods.getEnd().call();
                setIsElEnded(end);

                let filmsList = [];
                for (let i = 0; i < filmCount; i++) {
                    const film = await VoteInstance.methods.getFilm(i).call();
                    filmsList.push({
                        id: i,
                        title: film[0],
                        voteCount: parseInt(film[8]), 
                    });
                }

                // Sắp xếp theo số lượt bình chọn giảm dần
                filmsList.sort((a, b) => b.voteCount - a.voteCount);
                setFilms(filmsList);

                const admin = await VoterInstance.methods.getAdmin().call();
                if (accounts[0] === admin) {
                    setIsAdmin(true);
                }
            } catch (error) {
                alert("Failed to load web3, accounts, or contract. Check console for details.");
                console.error(error);
            }
        };
        init();
    }, []);

    const displayResults = (films) => {
        const renderResults = (film, index, rank) => (
            <tr key={film.id}>
                <td>{rank}</td> 
                <td>{film.title}</td>
                <td>{film.voteCount}</td>
            </tr>
        );

        const displayWinner = (films) => {
            const getWinner = (films) => {
                let maxVoteCount = 0;
                let winnerFilms = [];
                films.forEach((film) => {
                    if (film.voteCount > maxVoteCount) {
                        maxVoteCount = film.voteCount;
                        winnerFilms = [film];
                    } else if (film.voteCount === maxVoteCount) {
                        winnerFilms.push(film);
                    }
                });
                return winnerFilms;
            };

            const renderWinner = (winner) => (
                <div className="winner-card" key={winner.id}>
                    <div className="winner-info">
                        <p className="winner-tag">🏆 Top 1!</p>
                        <h2>{winner.title}</h2>
                        <p className="vote-count">Tổng số bình chọn: {winner.voteCount}</p>
                    </div>
                </div>
            );

            const winnerFilms = getWinner(films);
            return <>{winnerFilms.map(renderWinner)}</>;
        };
        const calculateRanks = (films) => {
            let ranks = [];
            let currentRank = 1;
    
            films.forEach((film, index) => {
                if (index > 0 && film.voteCount < films[index - 1].voteCount) {
                    currentRank = index + 1; // Chuyển sang thứ hạng tiếp theo
                }
                ranks.push(currentRank);
            });
    
            return ranks;
        };
        const ranks = calculateRanks(films);

        return (
            <div className="results-wrapper">
                <div className="winner-section">
                    {displayWinner(films)}
                </div>
                <div className="results-section">
                    <h2>Kết quả</h2>
                    <small>Tổng số phim: {films.length}</small>
                    
                    {films.length < 1 ? (
                        <div className="container-item attention">
                            <center>Không có phim nào.</center>
                        </div>
                    ) : (
                        <div className="container-item">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Top</th>
                                        <th>Tên phim</th>
                                        <th>Số bình chọn</th>
                                    </tr>
                                </thead>
                                <tbody>{films.map((films, index) => renderResults(films, index, ranks[index]))}</tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        );
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
            <br />
            <div>
                {!isElStarted && !isElEnded ? (
                    <NotInit />
                ) : isElStarted && !isElEnded ? (
                    <div className="result container-item attention">
                        <center>
                            <h3>Cuộc bình chọn đang diễn ra.</h3>
                            <p>Kết quả sẽ được công bố khi cuộc bình chọn kết thúc.</p>
                            <br />
                            {!isAdmin && (
                                <p>Hãy bình chọn {"(nếu chưa bình chọn)"}.{" "}
                                <Link to="/Voting" style={{ color: "rgb(194, 45, 45)", textDecoration: "underline" }}>
                                    Đến trang bình chọn
                                </Link>.</p>
                            )}
                        </center>
                    </div>
                ) : (
                    displayResults(films)
                )}
            </div>
        </>
    );
};

export default Results;
