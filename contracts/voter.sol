// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.9.0;
import "./vote.sol";

contract voter {
    address public admin;
    uint256 public voterCount;
    bool public start;
    bool public end;
    uint256 public startDate;
    uint256 public endDate;

    struct ElectionDetails {
        string adminName;
        string adminEmail;
        string electionTitle;
    }
    ElectionDetails public electionDetails;

    constructor(){
        admin = msg.sender;
        voterCount = 0;
        start = false;
        end = false;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action.");
        _;
    }

    modifier duringElection() {
        require(start, "Election has not started.");
        require(!end, "Election has ended.");
        require(block.timestamp >= startDate && block.timestamp <= endDate, "Election is not active.");
        _;
    }

    function getAdmin() public view returns (address) {
        return admin;
    }

    struct VoterDetails {
        address voterAddress;
        string name;
        bytes32 cccdHash;
        bytes32 passwordHash;
        bool hasVoted;
        bool isRegistered;
        uint256 roundVoted; 
    }

    address[] public voters;
    mapping(address => VoterDetails) public voterDetails;
    mapping(bytes32 => address) public registeredCCCDHashes;

    event VoterRegistered(address indexed voterAddress);
    event FilmVoted(address indexed voterAddress, uint256 filmId);
    event ElectionStarted(string adminName, string adminEmail, string electionTitle, uint256 startDate, uint256 endDate);
    event ElectionEnded();

    function registerAsVoter(string memory _name, bytes32 _cccdHash, bytes32 _passwordHash) public {
        // Kiểm tra người dùng đã đăng ký chưa
        require(!voterDetails[msg.sender].isRegistered, "Voter already registered.");
        // Kiểm tra CCCD đã tồn tại hay chưa
         require(registeredCCCDHashes[_cccdHash] == address(0), "CCCD already registered.");
        VoterDetails memory newVoter = VoterDetails({
            voterAddress: msg.sender,
            name: _name,
            cccdHash: _cccdHash,
            passwordHash: _passwordHash,
            hasVoted: false,
            isRegistered: true,
            roundVoted: 0 // Mặc định chưa bỏ phiếu vòng nào
        });
        voterDetails[msg.sender] = newVoter;
        registeredCCCDHashes[_cccdHash] = msg.sender;
        voters.push(msg.sender);
        voterCount += 1;
        emit VoterRegistered(msg.sender);
    }

    function getVoterDetails(address _voter) public view returns (string memory name, bytes32 cccdHash, bool hasVoted,bool isRegistered) {
        VoterDetails memory voterInfo = voterDetails[_voter];
        return (voterInfo.name, voterInfo.cccdHash, voterInfo.hasVoted, voterInfo.isRegistered);
    }

    function getRegisteredCCCDHash(bytes32 _cccdHash) public view returns (address) {
        return registeredCCCDHashes[_cccdHash];
    }

    // Xác thực mật khẩu
    function authenticateVoter(address _voterAddress, string memory _password) public view returns (bool) {
        require(voterDetails[_voterAddress].isRegistered, "Voter is not registered.");
        return (voterDetails[_voterAddress].passwordHash == keccak256(abi.encodePacked(_password)));
    }

    function getTotalVoters() public view returns (uint256) {
        return voterCount;
    }

    function resetVoterStatus() public onlyAdmin {
        for (uint256 i = 0; i < voters.length; i++) {
            address voterAddress = voters[i];
            voterDetails[voterAddress].hasVoted = false;
        }
    }
    
    function isCCCDRegistered(bytes32 _cccdHash) public view returns (bool) {
        return registeredCCCDHashes[_cccdHash] != address(0);
    }

    function voteFilm(uint256 filmId, address filmContractAddress) public {
        require(!voterDetails[msg.sender].hasVoted || voterDetails[msg.sender].roundVoted != vote(filmContractAddress).stt(), "Voter has already voted in this round.");

        vote filmContract = vote(filmContractAddress);
        filmContract.addVote(filmId);
        voterDetails[msg.sender].hasVoted = true;
        voterDetails[msg.sender].roundVoted = filmContract.stt();  // Cập nhật vòng đã bỏ phiếu
        emit FilmVoted(msg.sender, filmId);
    }

    function setElectionDetails(string memory _adminName, string memory _adminEmail, string memory _electionTitle, uint256 _startDate, uint256 _endDate) public onlyAdmin {
        require(_startDate < _endDate, "Start date must be before end date.");
        electionDetails = ElectionDetails(_adminName, _adminEmail, _electionTitle);
        start = true;
        end = false;
        startDate = _startDate;
        endDate = _endDate;
        emit ElectionStarted(_adminName, _adminEmail, _electionTitle, _startDate, _endDate);
    }

    function getElectionDetails() public view returns (string memory, string memory, string memory, uint256, uint256) {
        return (electionDetails.adminName, electionDetails.adminEmail, electionDetails.electionTitle, startDate, endDate);
    }

    function endElection() public onlyAdmin {
        end = true;
        start = false;
        emit ElectionEnded();
    }

    function getStart() public view returns (bool) {
        return start;
    }

    function getEnd() public view returns (bool) {
        return end;
    }
}
