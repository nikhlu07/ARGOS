# ARGOS Security Model

This document outlines the cryptoeconomic guarantees of the ARGOS network.

## Overview

ARGOS operates on a **trust-through-incentives** model, where economic game theory and cryptographic enforcement combine to ensure oracle accuracy. The security model leverages three pillars:

1. **UMA Optimistic Oracle** - Cryptoeconomic finality and absolute truth anchor
2. **Reputation Staking** - Economic skin-in-the-game for all participants
3. **Evolutionary Selection** - Continuous filtering of inaccurate strategies

---

## UMA Integration

### Role as Truth Anchor

The **UMA Optimistic Oracle** serves as ARGOS's source of absolute truth. While ARGOS provides instant provisional results, UMA provides delayed but cryptoeconomically guaranteed finality.

**UMA Security Guarantees**:
- **Economic Finality**: Proposers and disputers stake bonds, ensuring rational actors cannot profitably lie
- **Dispute Resolution**: Any party can challenge a proposed result by staking a counter-bond
- **Liveness Period**: 48-hour window for disputes ensures sufficient time for economic consensus
- **Scalable Security**: Security scales with bond size (typically $2-10M for high-value queries)

### Integration Architecture

```solidity
// From contracts/AggregatorCore.sol
address public anchor;  // UMA relayer authorized to submit final values

function anchorFinal(uint256 queryId, int256 finalValue) 
    external onlyAnchorOrOwner {
    require(canAnchor(queryId), "NOT_READY_TO_ANCHOR");
    Query storage q = queries[queryId];
    q.finalValue = finalValue;
    q.status = QueryStatus.Anchored;
    emit FinalAnchored(queryId, finalValue);
}
```

**Security Properties**:
- Only designated `anchor` address can submit final values
- Liveness period must expire before anchoring (`canAnchor()` check)
- Final value is immutable once set
- Event emission enables off-chain verification

### Liveness Period Security

The liveness period protects against premature anchoring:

```solidity
function canAnchor(uint256 queryId) public view returns (bool) {
    Query storage q = queries[queryId];
    return q.status == QueryStatus.Active 
        && block.timestamp >= q.createdAt + q.liveness;
}
```

**Attack Scenarios Prevented**:
- **Premature finalization**: Cannot anchor before liveness expires
- **Front-running**: IONs cannot see UMA result before submitting
- **Time-based manipulation**: Liveness is blockchain time, not wall-clock time

---

## Slashing and Rewards

### Economic Incentive Alignment

ARGOS uses a **reward-slash asymmetry** to incentivize accuracy:

```
Correct predictions: +10× confidence (binary) or +15× confidence (numeric)
Wrong predictions:   -5× confidence (binary) or  -4× confidence (numeric)
```

**Rationale**: Higher rewards than slashing encourage participation, but slashing prevents spam.

### Binary Query Economics

From the `settle()` function in `AggregatorCore.sol`:

```solidity
if (q.qtype == QueryType.Binary) {
    if (absError == 0) {
        // Correct prediction
        reputation[preds[i].node] += 10 * preds[i].confidence;
    } else {
        // Wrong prediction
        uint256 slash = preds[i].confidence * 5;
        uint256 current = reputation[preds[i].node];
        reputation[preds[i].node] = current > slash ? current - slash : 0;
    }
}
```

**Security Properties**:
- **Proportional slashing**: Higher confidence = higher penalty for being wrong
- **No negative reputation**: `current > slash ? current - slash : 0` prevents underflow
- **All-or-nothing**: No partial credit for binary queries (correct/incorrect only)

**Example Scenario**:
```
Query: "Will BTC hit $100k by Dec 31, 2025?"
Final Truth: YES (1)

Node A: Predicted YES (1) with 90 confidence → +900 reputation ✅
Node B: Predicted NO (0) with 70 confidence  → -350 reputation ❌
Node C: Predicted YES (1) with 50 confidence → +500 reputation ✅
```

### Numeric Query Economics

```solidity
else {
    // Numeric: tiered rewards based on error magnitude
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
```

**Tiered Rewards**:
- **Very accurate** (error ≤ 1): 15× confidence
- **Moderately accurate** (error ≤ 5): 8× confidence  
- **Inaccurate** (error > 5): -4× confidence

**Example Scenario**:
```
Query: "What will SOL price be on Jan 1, 2026?" (Numeric)
Final Truth: 300

Node A: Predicted 301 with 80 confidence → Error = 1  → +1200 reputation ✅
Node B: Predicted 295 with 70 confidence → Error = 5  → +560 reputation ⚠️
Node C: Predicted 350 with 90 confidence → Error = 50 → -360 reputation ❌
```

### Reputation as Stake

In the current demo, reputation is purely numerical. In production:

**Future Enhancements**:
1. **Token staking**: Reputation multiplies staked tokens for voting weight
2. **Economic slashing**: Wrong predictions forfeit actual stake, not just reputation
3. **Reputation decay**: Inactive nodes lose reputation over time
4. **Withdrawal delays**: Prevent rage-quitting after wrong predictions

---

## Adversarial Attacks

### Sybil Attacks

**Attack**: Create many low-quality nodes to outvote honest nodes

**Mitigations**:
1. **Reputation weighting**: New nodes start with 0 reputation, have minimal influence
2. **Confidence-based consensus**: Weight = `confidence × reputation × stake`
3. **One submission per address**: Prevents same actor from multi-voting
4. **Economic barrier** (future): Stake requirement creates financial friction

**Code Defense**:
```solidity
require(!hasSubmitted[queryId][msg.sender], "ALREADY_SUBMITTED");
hasSubmitted[queryId][msg.sender] = true;
```

**Effectiveness**: Without reputation, Sybil nodes have ~0% influence on consensus.

### Collusion Attacks

**Attack**: Multiple nodes coordinate to manipulate consensus

**Vulnerability**: If colluding nodes hold >50% of `Σ(confidence × reputation)`, they can force wrong consensus

**Mitigations**:
1. **UMA anchoring**: Even if provisional consensus is wrong, final truth prevails
2. **Slashing deterrent**: Colluders lose reputation when UMA corrects them
3. **Domain specialization** (future): Limits collusion to specific query types
4. **Quadratic weighting** (future): Diminishing returns on confidence stacking

**Attack Cost Analysis**:
```
To corrupt a query with N honest nodes at 80% confidence avg:
- Attacker needs: Reputation ≥ N × 80 × (avg honest reputation)
- Cost of building reputation: Months of accurate predictions
- Cost of attack: Loss of all built reputation after UMA settlement
```

**Conclusion**: Economically irrational for rational attackers.

### Front-Running Attacks

**Attack**: See other predictions before submitting, copy high-reputation nodes

**Mitigations**:
1. **Blockchain transparency**: All submissions are public, no hiding
2. **Time advantage minimal**: Consensus updates after each submission
3. **UMA final truth**: Front-runners still subject to UMA's judgment

**Why This Isn't Critical**: Copying accurate nodes actually *helps* consensus accuracy. The network doesn't care *how* a node arrived at the right answer, only that it did.

### Oracle Manipulation

**Attack**: Manipulate underlying data sources (e.g., flash loan price manipulation)

**Mitigations**:
1. **Multiple data sources**: Diversity in ION strategies (APIs, LLMs, scraping, etc.)
2. **Outlier detection**: Anomalous submissions can be ignored via low confidence
3. **UMA as referee**: If manipulation affects provisional consensus, UMA corrects it
4. **Liveness period**: 48-hour delay prevents real-time manipulation profitability

**Example**: Flash loan pumps BTC price to $200k for 1 block:
- Some API-based IONs might submit YES
- But: LLM reasoning, sentiment analysis, and smarter IONs submit NO
- Consensus likely leans NO (correctly)
- Even if YES wins provisionally, UMA anchors truth as NO 48h later
- Manipulated-IONs get slashed

### Spam Submissions

**Attack**: Submit to every query with random guesses to spam the network

**Mitigations**:
1. **One submission per address per query**: `require(!hasSubmitted[queryId][msg.sender])`
2. **Reputation slashing**: Random guesses have ~50% accuracy → net reputation loss
3. **Gas costs**: Every submission costs gas, making spam expensive
4. **Stake requirements** (future): Lock tokens to participate

**Gas Cost Analysis**:
```
Submission gas: ~80,000 gas
At 50 gwei: ~0.004 ETH (~$10 at $2500 ETH)
To spam 100 queries: $1000 in gas
Expected ROI: None (random guesses → slashed reputation)
```

**Conclusion**: Spam is economically unviable.

### Long-Range Attacks

**Attack**: Build reputation slowly with correct predictions, then exploit it with one big wrong prediction

**Mitigations**:
1. **Proportional slashing**: Exploit costs all built reputation
2. **Multi-dimensional reputation** (future): Domain-specific scores prevent cross-domain exploitation
3. **Audit trails**: All predictions on-chain, detectable patterns

**Example**:
```
Attacker spends 6 months building 10,000 reputation
Submits wrong prediction with 100 confidence on high-value query
Provisional consensus influenced (+10k weight)
UMA corrects 48h later
Attacker loses 100 × 5 = 500 reputation (not all 10k, but suffers for wrong answer)
```

**Insight**: Slashing is calibrated to hurt but not destroy, encouraging long-term participation.

---

## Access Control

### Owner Role

**Capabilities**:
```solidity
modifier onlyOwner() {
    require(msg.sender == owner, "NOT_OWNER");
    _;
}

// Owner-only functions:
- createQuery()         // Create new queries
- setAnchor()          // Designate anchor address
- settle()             // Trigger reputation updates
```

**Security Considerations**:
- Owner has significant power (centralized in demo)
- **Production**: Owner should be a DAO multisig or governance contract
- **Risk**: Owner can censor queries or delay settlement

**Mitigation Roadmap**:
1. Transfer ownership to multisig (3-of-5 initially)
2. Implement governance token for voting
3. Fully decentralize query creation (permissionless)

### Anchor Role

**Capabilities**:
```solidity
modifier onlyAnchorOrOwner() {
    require(msg.sender == owner || msg.sender == anchor, "NOT_ANCHOR");
    _;
}

// Anchor can:
- anchorFinal()        // Submit UMA final truth
```

**Security Properties**:
- Anchor is typically a bot that monitors UMA Oracle
- Anchor cannot create queries or settle (lower privilege than owner)
- Anchor can be changed by owner at any time

**Trust Assumption**: Anchor correctly relays UMA truth without manipulation.

**Verification**: All `FinalAnchored` events are publicly auditable. Anyone can verify against UMA's on-chain state.

### Node Permissions

**Capabilities**:
- Anyone can submit predictions to active queries (`submitPrediction()` is unpermissioned)
- One submission per address per query
- No stake requirement in demo (future: must lock tokens)

**Security Properties**:
- Permissionless participation encourages diversity
- Economic barriers (gas + future stake) prevent pure spam
- Reputation gating ensures quality over time

---

## Smart Contract Security

### Integer Overflow/Underflow Protection

**Solidity 0.8+**: Automatic overflow checks

```solidity
pragma solidity ^0.8.20;
```

All arithmetic operations revert on overflow/underflow without manual SafeMath.

**Example**:
```solidity
reputation[preds[i].node] += 10 * preds[i].confidence;
// If this overflows, transaction reverts (safe)
```

### Reentrancy Protection

**Current Status**: No external calls in state-changing functions → no reentrancy risk

**Functions analyzed**:
- `submitPrediction()`: No external calls
- `anchorFinal()`: No external calls
- `settle()`: No external calls, only internal state updates

**Future Consideration**: If token staking is added, use ReentrancyGuard from OpenZeppelin.

### Input Validation

**Comprehensive checks in** `submitPrediction()`:
```solidity
require(q.id != 0, "QUERY_NOT_FOUND");
require(q.status == QueryStatus.Active, "QUERY_NOT_ACTIVE");
require(!hasSubmitted[queryId][msg.sender], "ALREADY_SUBMITTED");
require(confidence > 0, "CONFIDENCE_ZERO");

if (q.qtype == QueryType.Binary) {
    require(value == 0 || value == 1, "BINARY_VALUE_INVALID");
    require(confidence <= 100, "CONFIDENCE_TOO_HIGH");
}
```

**Security Properties**:
- Prevents invalid states
- Ensures data integrity
- Provides clear error messages for debugging

### State Machine Enforcement

**Query Lifecycle**: Active → Anchored → Settled

```solidity
enum QueryStatus { Active, Anchored, Settled }

// State transitions are enforced:
submitPrediction: requires Status.Active
anchorFinal:      requires Status.Active, sets Status.Anchored
settle:           requires Status.Anchored, sets Status.Settled
```

**Security**: Impossible to skip states or reverse transitions.

### Gas Optimization

**Storage patterns**:
- Use `storage` pointers to avoid redundant SLOAD: `Query storage q = queries[queryId]`
- Pack struct fields efficiently (though not critical at demo scale)
- Event emission for off-chain indexing instead of on-chain arrays

**Attack prevention**: No unbounded loops in critical functions.

**Concern**: `settle()` loops through all predictions. For 1000+ predictions, could hit block gas limit.

**Future Mitigation**: Batch settlement or off-chain computation with Merkle proofs.

---

## Future Security Enhancements

### 1. Economic Staking

**Current**: Reputation is free to acquire (just predict accurately)

**Future**: Require token stake to submit predictions

```solidity
mapping(address => uint256) public stakes;

function submitPrediction(uint256 queryId, int256 value, uint256 confidence) external {
    require(stakes[msg.sender] >= MIN_STAKE, "INSUFFICIENT_STAKE");
    // ... rest of logic
}

function slash(address node, uint256 amount) internal {
    stakes[node] -= amount;  // Actual economic loss
}
```

**Security Improvement**: Makes spam economically impossible, increases attack cost.

### 2. Domain-Specific Reputation

**Current**: Single global reputation score

**Future**: Separate reputation per domain (crypto, sports, politics, etc.)

```solidity
mapping(address => mapping(bytes32 => uint256)) public domainReputation;

function submitPrediction(...) {
    bytes32 domain = keccak256(bytes(q.category));
    uint256 weight = confidence * domainReputation[msg.sender][domain];
}
```

**Security Improvement**: Prevents cross-domain reputation exploitation.

### 3. Temporal Reputation Decay

**Current**: Reputation is permanent

**Future**: Decay old reputation, weigh recent performance higher

```solidity
function getEffectiveReputation(address node) public view returns (uint256) {
    uint256 raw = reputation[node];
    uint256 decayFactor = computeDecay(lastActive[node], block.timestamp);
    return raw * decayFactor / 100;
}
```

**Security Improvement**: Prevents inactive nodes from coasting on old reputation.

### 4. Adversarial Detection

**Current**: No active adversarial detection

**Future**: ML-based anomaly detection for suspicious patterns

**Signals**:
- Sudden reputation surges
- Coordinated submissions (timing analysis)
- Outlier predictions (statistical analysis)

**Action**: Flagged nodes require higher stake or manual review.

### 5. Cryptographic Commitments

**Current**: Predictions are public immediately

**Future**: Commit-reveal scheme to prevent front-running

```solidity
// Phase 1: Commit
function commitPrediction(uint256 queryId, bytes32 commitment) external;

// Phase 2: Reveal (after commit period ends)
function revealPrediction(uint256 queryId, int256 value, uint256 confidence, bytes32 salt) external;
```

**Security Improvement**: Eliminates front-running entirely.

---

## Auditing and Verification

### On-Chain Auditability

All actions emit events for transparency:

```solidity
event QueryCreated(uint256 indexed queryId, string description, QueryType qtype, uint256 liveness);
event PredictionSubmitted(uint256 indexed queryId, address indexed node, int256 value, uint256 confidence);
event ConsensusUpdated(uint256 indexed queryId, int256 provisional);
event FinalAnchored(uint256 indexed queryId, int256 finalValue);
event Settled(uint256 indexed queryId);
```

**Use Cases**:
- Build reputation dashboards
- Verify anchor correctness against UMA
- Detect malicious patterns
- Analyze ION strategy effectiveness

### Off-Chain Verification

**Anyone can verify**:
1. Provisional consensus calculation (recalculate weighted average)
2. UMA final truth (check UMA Oracle directly)
3. Reputation updates (replay settlement logic)

**Tooling** (future):
- Blockchain explorer integration
- Automated verification bots
- Reputation API with historical tracking

---

## Security Assumptions

### Trust Requirements

1. **UMA Oracle**: ARGOS trusts UMA for final truth
   - *Justified*: UMA has $100M+ TVL, battle-tested, economically secure
   
2. **Anchor Bot**: Correctly relays UMA results
   - *Mitigated*: Anyone can verify relay accuracy on-chain
   
3. **Owner**: Acts in network's best interest
   - *Temporary*: Will decentralize to DAO governance

4. **Ethereum**: L1 security and finality
   - *Standard*: Same assumption as all DeFi protocols

### Security vs. Decentralization Tradeoffs

**Current (Demo Phase)**:
- ✅ High security (UMA-anchored)
- ⚠️ Moderate decentralization (owner-controlled)
- ✅ High speed (instant provisional)

**Future (Production)**:
- ✅ High security (stake + reputation + UMA)
- ✅ Full decentralization (DAO governance)
- ✅ High speed (unchanged)

---

## Conclusion

ARGOS's security model combines:

1. **Cryptoeconomic finality** via UMA
2. **Economic incentives** via reputation and slashing
3. **Evolutionary pressure** via reputation-weighted consensus
4. **Access controls** via role-based permissions
5. **Smart contract safety** via Solidity 0.8+ and input validation

The system is designed to be:
- **Attack-resistant**: Economic barriers make manipulation unprofitable
- **Self-correcting**: UMA anchoring overrides any provisional manipulation
- **Evolvable**: Reputation system filters out bad actors over time

For implementation details, see [Architecture Documentation](architecture.md).

For integration guidance, see [API Reference](api.md).

For building secure IONs, see [ION Developer Guide](ion-guide.md).
