// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.9.0;
import "./voter.sol";
contract vote {
    address public admin;
    uint256 public filmCount;
    uint256 public stt; //biến để theo dõi vòng bình chọn hiện tại

    constructor(){
        admin =  msg.sender;
        filmCount = 0;
        stt = 1; // Bắt đầu từ vòng 1
    }

    function getAdmin() public view returns (address) {
        return admin;
    }
    modifier onlyAdmin() {
        require(msg.sender == admin);
        _;
    }

    struct FilmStruct {
        uint256 filmId;
        uint256 voteCount;
        string tenPhim;
        string noiDung;
        string quocGia;
        string hinhAnh;
        string ngay;
        string theLoai;
        string tenDD;
        string tenDV;
        uint256 roundId; 
    }
    mapping(uint256 => FilmStruct) public filmDetails;

    function addFilm(string memory _tenPhim, string memory _quocGia, string memory _ngay, string memory _theLoai, string memory _tenDV,
                    string memory _tenDD, string memory _noiDung, string memory _hinhAnh) public onlyAdmin {
        FilmStruct memory newFilm = FilmStruct({
                filmId: filmCount,
                voteCount: 0,
                tenPhim: _tenPhim,
                quocGia: _quocGia,
                ngay: _ngay,
                theLoai: _theLoai,
                tenDV: _tenDV,
                tenDD: _tenDD,
                noiDung: _noiDung,
                hinhAnh: _hinhAnh,
                roundId: stt
        });
        filmDetails[filmCount] = newFilm;
        filmCount += 1;
    }

    function addVote(uint256 filmId) public {
        require(filmId < filmCount, unicode"Phim không tồn tại.");
        filmDetails[filmId].voteCount += 1;
    }

    function getFilm(uint256 filmId) public view returns (string memory, string memory, string memory, 
                    string memory, string memory, string memory, string memory, string memory, uint256) {
        FilmStruct memory film = filmDetails[filmId];
        return (film.tenPhim, film.quocGia, film.ngay, film.theLoai, film.tenDV, film.tenDD, film.noiDung, film.hinhAnh, film.voteCount);
    }

    function getTotalFilms() public view returns (uint256) {
        return filmCount;
    }
    
    event NewRoundStarted(uint256 roundId);
    function startNewRound() public onlyAdmin {
        stt += 1;
        filmCount=0;
        emit NewRoundStarted(stt);
    }

    function getCurrentRound() public view returns (uint256) {
        return stt; 
    }

}
