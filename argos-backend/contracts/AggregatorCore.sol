// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AggregatorCore {
    struct Submission {
        address nodeId;
        bool outcome;
        uint8 confidence;
        uint256 stake;
        bytes32 proofHash;
    }

    struct Reputation {
        uint256 score;
        // Further multi-dimensional aspects to be added
    }

    mapping(address => Reputation) public reputations;
    Submission[] public submissions;

    // Placeholder for more complex logic
    function submit(
        bool outcome,
        uint8 confidence,
        bytes32 proofHash
    ) public payable {
        require(confidence <= 100, "Confidence must be between 0 and 100");
        // Stake is msg.value

        submissions.push(
            Submission({
                nodeId: msg.sender,
                outcome: outcome,
                confidence: confidence,
                stake: msg.value,
                proofHash: proofHash
            })
        );
    }

    // Placeholder for consensus logic
    function getConsensus() public view returns (bool, uint8) {
        // Simple majority vote for now
        uint256 yesVotes;
        uint256 noVotes;
        for (uint i = 0; i < submissions.length; i++) {
            if (submissions[i].outcome) {
                yesVotes++;
            } else {
                noVotes++;
            }
        }
        if (yesVotes > noVotes) {
            return (true, uint8((yesVotes * 100) / submissions.length));
        } else {
            return (false, uint8((noVotes * 100) / submissions.length));
        }
    }

    // Placeholder for UMA bridge and evolution
    function finalize(bool finalOutcome) public {
        // In a real scenario, this would be called by the Truth Bridge
        for (uint i = 0; i < submissions.length; i++) {
            if (submissions[i].outcome == finalOutcome) {
                // Reward: increase reputation
                reputations[submissions[i].nodeId].score += 1;
            } else {
                // Slash: decrease reputation
                if (reputations[submissions[i].nodeId].score > 0) {
                    reputations[submissions[i].nodeId].score -= 1;
                }
            }
        }
        // Clear submissions for the next round
        delete submissions;
    }
}
