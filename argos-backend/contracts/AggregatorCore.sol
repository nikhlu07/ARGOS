// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title AggregatorCore
/// @notice Core consensus contract for ARGOS. Accepts predictions from nodes,
/// computes a provisional weighted consensus, and later anchors final truth.
/// Reputation updates are simplified for demo purposes.
contract AggregatorCore {
    // --- Access Control ---
    address public owner;
    address public anchor; // optional role allowed to finalize results (e.g., UMA relayer)

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    modifier onlyAnchorOrOwner() {
        require(msg.sender == owner || msg.sender == anchor, "NOT_ANCHOR");
        _;
    }

    // --- Types ---
    enum QueryType { Binary, Numeric }
    enum QueryStatus { Active, Anchored, Settled }

    struct Query {
        uint256 id;
        string description;
        QueryType qtype;
        uint256 createdAt;
        uint256 liveness; // seconds until anchoring permitted (demo parameter)
        QueryStatus status;
        int256 provisional; // weighted consensus value (0/1 for Binary, int for Numeric)
        bool hasConsensus;
        int256 finalValue; // anchored result
    }

    struct Prediction {
        address node;
        int256 value; // 0/1 for Binary; int for Numeric
        uint256 confidence; // weight (0..100 ideally)
    }

    // --- Storage ---
    uint256 public nextQueryId;
    mapping(uint256 => Query) public queries;
    mapping(uint256 => Prediction[]) internal predictionsByQuery;
    mapping(uint256 => mapping(address => bool)) internal hasSubmitted; // one submission per node in demo

    // Simple reputation store for demo: increments/decrements on settlement
    mapping(address => uint256) public reputation;

    // --- Events ---
    event OwnerChanged(address indexed newOwner);
    event AnchorChanged(address indexed newAnchor);

    event QueryCreated(uint256 indexed queryId, string description, QueryType qtype, uint256 liveness);
    event PredictionSubmitted(uint256 indexed queryId, address indexed node, int256 value, uint256 confidence);
    event ConsensusUpdated(uint256 indexed queryId, int256 provisional);
    event FinalAnchored(uint256 indexed queryId, int256 finalValue);
    event Settled(uint256 indexed queryId);

    constructor() {
        owner = msg.sender;
        emit OwnerChanged(owner);
    }

    // --- Admin ---
    function setAnchor(address _anchor) external onlyOwner {
        anchor = _anchor;
        emit AnchorChanged(_anchor);
    }

    // --- Query Lifecycle ---
    function createQuery(string calldata description, QueryType qtype, uint256 liveness) external onlyOwner returns (uint256) {
        uint256 qid = ++nextQueryId;
        queries[qid] = Query({
            id: qid,
            description: description,
            qtype: qtype,
            createdAt: block.timestamp,
            liveness: liveness,
            status: QueryStatus.Active,
            provisional: 0,
            hasConsensus: false,
            finalValue: 0
        });
        emit QueryCreated(qid, description, qtype, liveness);
        return qid;
    }

    function submitPrediction(uint256 queryId, int256 value, uint256 confidence) external {
        Query storage q = queries[queryId];
        require(q.id != 0, "QUERY_NOT_FOUND");
        require(q.status == QueryStatus.Active, "QUERY_NOT_ACTIVE");
        require(!hasSubmitted[queryId][msg.sender], "ALREADY_SUBMITTED");
        require(confidence > 0, "CONFIDENCE_ZERO");

        if (q.qtype == QueryType.Binary) {
            require(value == 0 || value == 1, "BINARY_VALUE_INVALID");
            require(confidence <= 100, "CONFIDENCE_TOO_HIGH");
        }

        predictionsByQuery[queryId].push(Prediction({
            node: msg.sender,
            value: value,
            confidence: confidence
        }));
        hasSubmitted[queryId][msg.sender] = true;

        emit PredictionSubmitted(queryId, msg.sender, value, confidence);
        _updateConsensus(queryId);
    }

    function _updateConsensus(uint256 queryId) internal {
        Prediction[] storage preds = predictionsByQuery[queryId];
        require(preds.length > 0, "NO_PREDICTIONS");
        Query storage q = queries[queryId];

        uint256 totalWeight = 0;
        int256 weightedSum = 0;

        for (uint256 i = 0; i < preds.length; i++) {
            uint256 w = preds[i].confidence;
            totalWeight += w;
            weightedSum += preds[i].value * int256(w);
        }

        require(totalWeight > 0, "ZERO_TOTAL_WEIGHT");
        int256 provisional = weightedSum / int256(totalWeight);

        // For Binary, clamp to 0/1 majority (>0.5 => 1 else 0)
        if (q.qtype == QueryType.Binary) {
            provisional = provisional >= 1 || provisional > 0 ? (provisional >= 1 ? int256(1) : int256(0)) : int256(0);
            // More precise: if weighted average >= 0.5 -> 1 else 0. But we use integer math.
            // Using confidence in 0..100, weightedSum/totalWeight approximates average. We convert any >= 1 to 1 else 0.
            // To be safer, we compute manually:
            int256 numerator = 0;
            int256 denom = 0;
            for (uint256 i = 0; i < preds.length; i++) {
                numerator += preds[i].value * int256(preds[i].confidence);
                denom += int256(preds[i].confidence);
            }
            // if (numerator * 2 >= denom) => 1 else 0
            provisional = (numerator * 2 >= denom) ? int256(1) : int256(0);
        }

        q.provisional = provisional;
        q.hasConsensus = true;
        emit ConsensusUpdated(queryId, provisional);
    }

    // --- Anchoring & Settlement ---
    function canAnchor(uint256 queryId) public view returns (bool) {
        Query storage q = queries[queryId];
        return q.status == QueryStatus.Active && block.timestamp >= q.createdAt + q.liveness;
    }

    function anchorFinal(uint256 queryId, int256 finalValue) external onlyAnchorOrOwner {
        require(canAnchor(queryId), "NOT_READY_TO_ANCHOR");
        Query storage q = queries[queryId];
        q.finalValue = finalValue;
        q.status = QueryStatus.Anchored;
        emit FinalAnchored(queryId, finalValue);
    }

    function settle(uint256 queryId) external onlyOwner {
        Query storage q = queries[queryId];
        require(q.status == QueryStatus.Anchored, "NOT_ANCHORED");

        // Reward/slash demo: nodes whose predictions are close to finalValue gain reputation; others lose
        Prediction[] storage preds = predictionsByQuery[queryId];
        for (uint256 i = 0; i < preds.length; i++) {
            int256 error = preds[i].value - q.finalValue;
            int256 absError = error >= 0 ? error : -error;
            if (q.qtype == QueryType.Binary) {
                if (absError == 0) {
                    reputation[preds[i].node] += 10 * preds[i].confidence; // reward
                } else {
                    uint256 slash = preds[i].confidence * 5; // penalty
                    uint256 current = reputation[preds[i].node];
                    reputation[preds[i].node] = current > slash ? current - slash : 0;
                }
            } else {
                // Numeric: reward inversely to error; simple tiering
                if (absError <= 1) {
                    reputation[preds[i].node] += 15 * preds[i].confidence;
                } else if (absError <= 5) {
                    reputation[preds[i].node] += 8 * preds[i].confidence;
                } else {
                    uint256 slash = preds[i].confidence * 4;
                    uint256 current = reputation[preds[i].node];
                    reputation[preds[i].node] = current > slash ? current - slash : 0;
                }
            }
        }

        q.status = QueryStatus.Settled;
        emit Settled(queryId);
    }

    // --- View Helpers ---
    function getPredictions(uint256 queryId) external view returns (Prediction[] memory) {
        return predictionsByQuery[queryId];
    }
}
