// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BlindAssistanceNetwork {
    address public admin;
    
    struct Obstacle {
        uint256 id;
        string dataHash;
        address reporter;
        uint256 timestamp;
        uint256 confirmations;
        bool verified;
    }
    
    struct Verifier {
        uint256 correctValidations;
        uint256 incorrectValidations;
        uint256 lastActivity;
        uint256 stakedAmount;
    }
    
    // 使用更精确的单位 (1 INJ = 1e18 wei)
    uint256 public rewardAmount = 2e14; // 0.0002 INJ
    uint256 public stakeAmount = 1e16;  // 0.01 INJ 
    uint256 public verificationThreshold = 10;
    uint256 public reporterReward = 1e15; // 0.001 INJ

    // 新增总质押量跟踪
    uint256 public totalStaked; 
    
    mapping(uint256 => bool) public reporterRewardClaimed;
    mapping(uint256 => Obstacle) public obstacles;
    mapping(address => Verifier) public verifiers;
    mapping(uint256 => mapping(address => bool)) public hasVerified;
    
    uint256 public obstacleCount;
    
    event ObstacleReported(uint256 id, string dataHash, address reporter);
    event ObstacleVerified(uint256 id, address verifier);
    event RewardClaimed(address verifier, uint256 amount);
    event StakeDeposited(address verifier, uint256 amount);
    event ReporterRewardClaimed(uint256 indexed obstacleId, address reporter, uint256 amount);
    event DepositRetrieved(address verifier, uint256 amount);
    event DepositDestroyed(address verifier, uint256 amount);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }
    
    modifier onlyStakedVerifier() {
        require(verifiers[msg.sender].lastActivity > 0, "Not a verifier");
        _;
    }
    
    constructor() payable {
        admin = msg.sender;
    }
    
    function reportObstacle(string memory _dataHash) external {
        obstacleCount++;
        obstacles[obstacleCount] = Obstacle({
            id: obstacleCount,
            dataHash: _dataHash,
            reporter: msg.sender,
            timestamp: block.timestamp,
            confirmations: 0,
            verified: false
        });
        emit ObstacleReported(obstacleCount, _dataHash, msg.sender);
    }
    
    function stakeToVerify() external payable {
        require(msg.value >= stakeAmount, "Insufficient stake");
        require(verifiers[msg.sender].lastActivity == 0, "Already a verifier");
        
        totalStaked += msg.value;
        verifiers[msg.sender] = Verifier({
            correctValidations: 0,
            incorrectValidations: 0,
            lastActivity: block.timestamp,
            stakedAmount: msg.value
        });
        emit StakeDeposited(msg.sender, msg.value);
    }
    
    function verifyObstacle(uint256 _obstacleId, bool _isValid) external onlyStakedVerifier {
        require(_obstacleId > 0 && _obstacleId <= obstacleCount, "Invalid ID");
        require(!hasVerified[_obstacleId][msg.sender], "Already verified");
        
        Obstacle storage obstacle = obstacles[_obstacleId];
        
        if (_isValid) {
            obstacle.confirmations++;
            if (obstacle.confirmations >= verificationThreshold && !obstacle.verified) {
                obstacle.verified = true;
            }
            verifiers[msg.sender].correctValidations++;
        } else {
            verifiers[msg.sender].incorrectValidations++;
        }
        
        hasVerified[_obstacleId][msg.sender] = true;
        verifiers[msg.sender].lastActivity = block.timestamp;
        emit ObstacleVerified(_obstacleId, msg.sender);
    }
    
    function claimReward() external onlyStakedVerifier {
        Verifier storage verifier = verifiers[msg.sender];
        require(verifier.correctValidations > 0, "No rewards");
        
        uint256 totalReward = verifier.correctValidations * rewardAmount;
        verifier.correctValidations = 0;
        
        require(address(this).balance - totalStaked >= totalReward, "Insufficient funds");
        payable(msg.sender).transfer(totalReward);
        emit RewardClaimed(msg.sender, totalReward);
    }

    // 新增上报者奖励领取
    function claimReporterReward(uint256 _obstacleId) external {
        Obstacle memory obstacle = obstacles[_obstacleId];
        require(obstacle.reporter == msg.sender, "Not reporter");
        require(obstacle.verified, "Not verified");
        require(!reporterRewardClaimed[_obstacleId], "Already claimed");
        
        reporterRewardClaimed[_obstacleId] = true;
        payable(msg.sender).transfer(reporterReward);
        emit ReporterRewardClaimed(_obstacleId, msg.sender, reporterReward);
    }

    function retrieveDeposit() external onlyStakedVerifier {
        Verifier memory verifier = verifiers[msg.sender];
        uint256 score = getVerifierScore(msg.sender);
        uint256 userStake = verifier.stakedAmount;
        require(userStake > 0, "No stake");
        
        // 先更新状态防止重入
        delete verifiers[msg.sender];
        totalStaked -= userStake;

        if (score < 60) {
            payable(address(this)).transfer(userStake);
            emit DepositDestroyed(msg.sender, userStake);
            revert("Score <60: Destroyed");
        } else if (score < 75) {
            // 恢复状态
            verifiers[msg.sender] = verifier;
            totalStaked += userStake;
            revert("Score 60-75: Locked");
        } else {
            (bool success, ) = msg.sender.call{value: userStake}("");
            require(success, "Transfer failed");
            emit DepositRetrieved(msg.sender, userStake);
        }
    }

    // 管理员安全提款（防止提取质押金）
    function withdrawFunds(uint256 _amount) external onlyAdmin {
        require(_amount <= address(this).balance - totalStaked, "Cannot withdraw staked");
        payable(admin).transfer(_amount);
    }

    function getVerifierScore(address _verifier) public view returns (uint256) {
        Verifier memory v = verifiers[_verifier];
        uint256 total = v.correctValidations + v.incorrectValidations;
        return total == 0 ? 0 : (v.correctValidations * 100) / total;
    }

    // 新增合约余额查询
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
}