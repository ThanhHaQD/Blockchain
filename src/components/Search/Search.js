import React, { useState, useEffect } from "react";
import getWeb3 from "../../getWeb3";
import vote from "../../contracts/vote.json";
import voter from "../../contracts/voter.json";
import "./Search.css";
import dayjs from "dayjs";

const Search = () => {
    const [VoteInstance, setVoteInstance] = useState(undefined);
    const [voterInstance, setVoterInstance] = useState(undefined);
    const [web3, setWeb3] = useState(null);
    const [films, setFilms] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFilm, setSelectedFilm] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [electionTitle, setElectionTitle] = useState("");
    const [electionEnded, setElectionEnded] = useState(false);

    useEffect(() => {
        const init = async () => {
            if (!window.location.hash) {
                window.location = window.location + "#loaded";
                window.location.reload();
            }
            try {
                const web3 = await getWeb3();
                setWeb3(web3);

                const networkId = await web3.eth.net.getId();
                const VoteNetwork = vote.networks[networkId];
                const VoteInstance = new web3.eth.Contract(vote.abi, VoteNetwork && VoteNetwork.address);
                setVoteInstance(VoteInstance);
                const deployedVoterNetwork = voter.networks[networkId];
                const voterInstance = new web3.eth.Contract(
                  voter.abi,
                  deployedVoterNetwork && deployedVoterNetwork.address
                );
                setVoterInstance(voterInstance);

                const electionEnded = await voterInstance.methods.getEnd().call();
                setElectionEnded(electionEnded);
                
                const electionDetails = await voterInstance.methods.getElectionDetails().call();
                setElectionTitle(electionDetails[2]);
                const filmCount = await VoteInstance.methods.getTotalFilms().call();

                let filmsList = [];
                for (let i = 0; i < filmCount; i++) {
                    const film = await VoteInstance.methods.getFilm(i).call();
                    filmsList.push({
                        id: i,
                        tenPhim: film[0],
                        quocGia: film[1],
                        ngay: dayjs(film[2]).format("DD/MM/YYYY"),
                        theLoai: film[3],
                        tenDV: film[4],
                        tenDD: film[5],
                        noiDung: film[6],
                        hinhAnh: film[7],
                        voteCount: parseInt(film[8]),
                    });
                }
                filmsList.sort((a, b) => b.voteCount - a.voteCount);
                filmsList = filmsList.map((film, index, arr) => {
                    if (index === 0 || film.voteCount < arr[index - 1].voteCount) {
                        film.rank = index + 1;
                    } else {
                        film.rank = arr[index - 1].rank; 
                    }
                    return film;
                });
                setFilms(filmsList);
            } catch (error) {
                alert("Failed to load web3, accounts, or contract. Check console for details.");
                console.error(error);
            }
        };
        init();
    }, []);

    const handleSearch = () => {
        if (!electionEnded) {
            alert("Cuộc bình chọn vẫn đang diễn ra. Phim chỉ có thể tra cứu sau khi cuộc bình chọn kết thúc.");
            return;
        }
        setIsSearching(true);
        const film = films.find((film) =>
            film.tenPhim.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSelectedFilm(film || null); 
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
                <nav className="navbar">
                    <a className="navbar-brand" href="/">
                        <i className="fab fa-hive" /> The Voting Film
                    </a>
                </nav>
            </header>
            <div className="search-wrapper">
                <div className="search-container">
                    <h2>Tra cứu phim</h2>
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Nhập tên phim cần tìm..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value); 
                                setIsSearching(false); 
                            }}
                            className="search-input"
                        />
                        <button onClick={handleSearch} className="search-button">
                            <i className="fa-solid fa-magnifying-glass"></i> Tra cứu
                        </button>
                    </div>
                    {selectedFilm ? (
                        <div className="film-details-container">
                            <div className="film-image">
                                <img src={selectedFilm.hinhAnh} alt={selectedFilm.tenPhim} />
                            </div>
                            <div className="film-details">
                                <h3>{selectedFilm.tenPhim}</h3>
                                <p><strong>Quốc gia:</strong> {selectedFilm.quocGia}</p>
                                <p><strong>Ngày phát hành:</strong> {selectedFilm.ngay}</p>
                                <p><strong>Thể loại:</strong> {selectedFilm.theLoai}</p>
                                <p><strong>Diễn viên:</strong> {selectedFilm.tenDV}</p>
                                <p><strong>Đạo diễn:</strong> {selectedFilm.tenDD}</p>
                                <p><strong>Nội dung:</strong> {selectedFilm.noiDung}</p>
                                <p><strong>Cuộc bình chọn:</strong> <span className="name-title">{electionTitle}</span></p>
                                <p><strong>Số lượt bình chọn:</strong> {selectedFilm.voteCount}</p>
                                <p className="film-rank">
                                    <strong>Top:</strong> {selectedFilm.rank}
                                </p>
                            </div>
                        </div>
                    ) : (
                        isSearching && (
                            <p className="no-result">Không tìm thấy phim nào với tên "<strong>{searchTerm}</strong>".</p>
                        )
                    )}
                </div>
            </div>
        </>
    );
};

export default Search;
