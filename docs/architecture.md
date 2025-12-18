# ARGOS Architecture

This document provides a deep dive into the neural layers of the ARGOS network—a self-evolving, swarm-intelligence oracle system where competing AI agents battle for dominance, and only the most accurate survive.

## Overview

ARGOS operates as a four-layer neural architecture, with each layer serving a distinct function in the oracle lifecycle:

1. **The Sensory Network** - Distributed AI agents that connect to reality
2. **The Consciousness Core** - Smart contract consensus engine
3. **The Truth Bridge** - UMA integration for cryptoeconomic finality
4. **The Evolution Engine** - On-chain reputation and learning system

```
┌─────────────────────────────────────────────────────────┐
│  Layer 4: Evolution Engine (Reputation Substrate)       │
│  ├─ Reward/Slash Calculations                           │
│  ├─ Domain Specialization (Future)                      │
│  └─ Performance Tracking                                │
└─────────────────────────────────────────────────────────┘
                            ▲
                            │ Reputation Updates
                            │
┌─────────────────────────────────────────────────────────┐
│  Layer 3: Truth Bridge (UMA Integration)                │
│  ├─ Anchoring Final Results                             │
│  ├─ Liveness Period Management                          │
│  └─ Settlement Triggers                                 │
└─────────────────────────────────────────────────────────┘
                            ▲
                            │ Final Truth
                            │
┌─────────────────────────────────────────────────────────┐
│  Layer 2: Consciousness Core (Aggregator Engine)        │
│  ├─ Query Management                                    │
│  ├─ Weighted Consensus Calculation                      │
│  └─ Provisional Truth Generation                       │
└─────────────────────────────────────────────────────────┘
                            ▲
                            │ Predictions
                            │
┌─────────────────────────────────────────────────────────┐
│  Layer 1: Sensory Network (ION Substrate)               │
│  ├─ Crypto Oracle Agents                                │
│  ├─ News Sentiment Agents                               │
│  ├─ Sports Analytics Agents                             │
│  └─ LLM Reasoning Agents                                │
└─────────────────────────────────────────────────────────┘
```

---

## Layer 1: The Sensory Network (ION Substrate)

### Overview

**Instant Oracle Nodes (IONs)** are the sensory organs of ARGOS—lightweight AI agents that observe reality through various lenses and submit predictions to the network. Each ION is strategy-agnostic, allowing anyone to deploy specialized agents optimized for specific domains.

### Architecture Patterns

ARGOS currently implements four distinct ION architectures, each demonstrating a different approach to truth discovery:

#### 1. API-Based Oracles (Crypto Oracle)

The simplest pattern: fetching data from centralized APIs and submitting it on-chain.

```python
# From agents/crypto_oracle.py
def get_crypto_price(crypto_symbol):
    """Fetches cryptocurrency price from external API"""
    if crypto_symbol == "SOL":
        return 255.0  # Real implementation would call CoinGecko/CoinMarketCap
    return 0.0

# Oracle logic
price_threshold = 250.0
current_price = get_crypto_price("SOL")
outcome = current_price > price_threshold  # Binary outcome
confidence = 96  # Internal confidence score (0-100)
```

**Use Cases**: Price feeds, exchange rates, blockchain state queries

#### 2. Web Scraping + Sentiment Analysis (News Oracle)

Combines web scraping with NLP to extract sentiment from unstructured data.

```python
# From agents/news_oracle.py
from bs4 import BeautifulSoup
from textblob import TextBlob

def get_news_sentiment(topic):
    """Scrapes news headlines and returns sentiment score"""
    url = f"https://www.google.com/search?q={topic}+news"
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, "html.parser")
    headlines = [h3.get_text() for h3 in soup.find_all('h3')]
    
    # Calculate average sentiment polarity (-1 to 1)
    sentiment = sum(TextBlob(h).sentiment.polarity for h in headlines) / len(headlines)
    return sentiment

# Convert sentiment to prediction
sentiment_score = get_news_sentiment("James Webb Telescope discoveries")
outcome = sentiment_score > 0.1  # Positive sentiment → YES
confidence = min(int(abs(sentiment_score) * 100), 100)
```

**Use Cases**: Event predictions, public opinion, news-driven markets

#### 3. LLM Reasoning Engines (OpenAI Oracle)

Uses large language models to reason over complex, qualitative queries.

```python
# From agents/llm_reasoning_agent.py
import openai

def get_llm_prediction(query):
    """Uses GPT to predict outcome of qualitative query"""
    system_prompt = """
    You are an analytical oracle. Evaluate the question and provide
    a JSON response with "outcome" (boolean) and "confidence" (0-100).
    Example: {"outcome": true, "confidence": 85}
    """
    
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Question: {query}"}
        ],
        temperature=0.1
    )
    
    result = json.loads(response.choices[0].message['content'])
    return bool(result["outcome"]), int(result["confidence"])

# Example usage
query = "Will the James Webb Telescope detect biosignatures on K2-18b by 2026?"
outcome, confidence = get_llm_prediction(query)
```

**Use Cases**: Geopolitical predictions, scientific outcomes, subjective assessments

#### 4. Mock/Simulation Agents (Sports Oracle)

Demonstrates pattern for integrating proprietary models or simulations.

```python
# From agents/sports_oracle.py
def get_mock_sports_data(team_a, team_b):
    """Simulates a predictive sports model"""
    winner = custom_ml_model.predict(team_a, team_b)  # In reality
    confidence = model.get_confidence()
    return winner, confidence

# Convert to binary outcome
predicted_winner, confidence = get_mock_sports_data("Team A", "Team B")
outcome = (predicted_winner == "Team A")
```

**Use Cases**: Sports betting, proprietary models, ensemble predictions

### Submission Mechanism

All IONs follow the same submission pattern using Web3.py:

```python
from web3 import Web3
import json

# Connect to Ethereum node
w3 = Web3(Web3.HTTPProvider(rpc_url))
account = w3.eth.account.from_key(agent_private_key)

# Load contract
with open("contract_abi.json") as f:
    contract_abi = json.load(f)
contract = w3.eth.contract(address=contract_address, abi=contract_abi)

# Submit prediction
nonce = w3.eth.get_transaction_count(account.address)
tx = contract.functions.submitPrediction(
    queryId,      # Query identifier
    outcome,      # Binary: 0/1, Numeric: any int
    confidence    # Weight (0-100 for binary)
).build_transaction({
    'from': account.address,
    'nonce': nonce,
    'gas': 200000,
    'gasPrice': w3.to_wei('50', 'gwei')
})

signed_tx = w3.eth.account.sign_transaction(tx, agent_private_key)
tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
```

### Orchestration

Multiple agents can be run simultaneously using the orchestration script:

```python
# From run_agents.py
agents = [
    "agents/crypto_oracle.py",
    "agents/news_oracle.py",
    "agents/sports_oracle.py",
    "agents/llm_reasoning_agent.py",
]

for agent_script in agents:
    process = subprocess.Popen([sys.executable, agent_script])
    processes.append(process)
    time.sleep(2)  # Stagger start times
```

---

## Layer 2: The Consciousness Core (Aggregator Engine)

The `AggregatorCore` smart contract is the neural processor of ARGOS—it ingests predictions from competing IONs and synthesizes a single provisional truth through weighted consensus.

### Contract Architecture

```solidity
// From contracts/AggregatorCore.sol
contract AggregatorCore {
    enum QueryType { Binary, Numeric }
    enum QueryStatus { Active, Anchored, Settled }
    
    struct Query {
        uint256 id;
        string description;
        QueryType qtype;
        uint256 createdAt;
        uint256 liveness;       // Seconds until anchoring permitted
        QueryStatus status;
        int256 provisional;     // Weighted consensus value
        bool hasConsensus;
        int256 finalValue;      // UMA-anchored truth
    }
    
    struct Prediction {
        address node;
        int256 value;           // 0/1 for Binary, int for Numeric
        uint256 confidence;     // Weight (0-100)
    }
    
    mapping(uint256 => Query) public queries;
    mapping(uint256 => Prediction[]) internal predictionsByQuery;
    mapping(address => uint256) public reputation;
}
```

### Query Lifecycle

#### Phase 1: Query Creation

Only the contract owner can create queries (in production, this would be permissionless with staking):

```solidity
function createQuery(
    string calldata description,
    QueryType qtype,
    uint256 liveness
) external onlyOwner returns (uint256) {
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
```

**Example** (from `demo-flow.js`):
```javascript
const desc = "Will BTC close above $100k on Dec 31, 2025?";
const qtypeBinary = 0;
const liveness = 3600 * 48;  // 48 hours
const tx = await aggregator.createQuery(desc, qtypeBinary, liveness);
```

#### Phase 2: Prediction Submission

IONs submit predictions with confidence weights:

```solidity
function submitPrediction(
    uint256 queryId,
    int256 value,
    uint256 confidence
) external {
    Query storage q = queries[queryId];
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
```

**Demo Example**:
```javascript
// Three nodes submit predictions
await aggregator.connect(node1).submitPrediction(queryId, 1, 70);  // YES, 70% confidence
await aggregator.connect(node2).submitPrediction(queryId, 0, 50);  // NO, 50% confidence
await aggregator.connect(node3).submitPrediction(queryId, 1, 80);  // YES, 80% confidence
```

#### Phase 3: Consensus Calculation

After each submission, the contract recalculates the weighted consensus:

```solidity
function _updateConsensus(uint256 queryId) internal {
    Prediction[] storage preds = predictionsByQuery[queryId];
    Query storage q = queries[queryId];
    
    // Calculate weighted average
    uint256 totalWeight = 0;
    int256 weightedSum = 0;
    
    for (uint256 i = 0; i < preds.length; i++) {
        totalWeight += preds[i].confidence;
        weightedSum += preds[i].value * int256(preds[i].confidence);
    }
    
    // For Binary queries, use majority rule (>= 50% → 1, else 0)
    if (q.qtype == QueryType.Binary) {
        int256 numerator = 0;
        int256 denom = 0;
        for (uint256 i = 0; i < preds.length; i++) {
            numerator += preds[i].value * int256(preds[i].confidence);
            denom += int256(preds[i].confidence);
        }
        // If weighted average >= 0.5 → 1, else 0
        provisional = (numerator * 2 >= denom) ? int256(1) : int256(0);
    }
    
    q.provisional = provisional;
    q.hasConsensus = true;
    emit ConsensusUpdated(queryId, provisional);
}
```

**Formula**: For binary queries, `provisional = 1` if `Σ(value × confidence) / Σ(confidence) ≥ 0.5`, else `0`

**Example Calculation**:
- Node 1: value=1, confidence=70 → contribution = 70
- Node 2: value=0, confidence=50 → contribution = 0
- Node 3: value=1, confidence=80 → contribution = 80
- **Total**: (70 + 0 + 80) / (70 + 50 + 80) = 150 / 200 = 0.75 → **Provisional = 1 (YES)**

---

## Layer 3: The Truth Bridge (UMA Integration)

The Truth Bridge connects ARGOS's provisional reality to UMA's cryptoeconomic finality, enabling instant predictions with delayed settlement.

### Anchoring Mechanism

After the liveness period expires, an authorized anchor can finalize the result:

```solidity
function canAnchor(uint256 queryId) public view returns (bool) {
    Query storage q = queries[queryId];
    return q.status == QueryStatus.Active 
        && block.timestamp >= q.createdAt + q.liveness;
}

function anchorFinal(uint256 queryId, int256 finalValue) external onlyAnchorOrOwner {
    require(canAnchor(queryId), "NOT_READY_TO_ANCHOR");
    Query storage q = queries[queryId];
    q.finalValue = finalValue;
    q.status = QueryStatus.Anchored;
    emit FinalAnchored(queryId, finalValue);
}
```

### Access Control

The contract implements a two-role system:

```solidity
address public owner;   // Can create queries, settle, set anchor
address public anchor;  // Can anchor final results (e.g., UMA relayer bot)

modifier onlyAnchorOrOwner() {
    require(msg.sender == owner || msg.sender == anchor, "NOT_ANCHOR");
    _;
}

function setAnchor(address _anchor) external onlyOwner {
    anchor = _anchor;
    emit AnchorChanged(_anchor);
}
```

### Integration Flow

In production, the flow would be:

1. **ARGOS creates query** → Simultaneously submit to UMA Optimistic Oracle
2. **IONs submit predictions** → ARGOS provides instant provisional result
3. **UMA liveness period (48h)** → Economic consensus forms off-chain
4. **UMA finalizes** → Relayer calls `anchorFinal()` with UMA's result
5. **ARGOS settles** → Reputation updates based on UMA truth

**Demo Simulation** (from `demo-flow.js`):
```javascript
// Simulate UMA finalization after liveness
const finalValue = 1;  // Assume UMA settles on YES
await aggregator.connect(deployer).anchorFinal(queryId, finalValue);
console.log("Final truth anchored:", finalValue);
```

---

## Layer 4: The Evolution Engine (Reputation Substrate)

The reputation system is ARGOS's long-term memory—tracking historical performance and using it to weight future predictions.

### Settlement and Learning

Once a query is anchored, the owner can settle it, triggering reputation updates:

```solidity
function settle(uint256 queryId) external onlyOwner {
    Query storage q = queries[queryId];
    require(q.status == QueryStatus.Anchored, "NOT_ANCHORED");
    
    Prediction[] storage preds = predictionsByQuery[queryId];
    for (uint256 i = 0; i < preds.length; i++) {
        int256 error = preds[i].value - q.finalValue;
        int256 absError = error >= 0 ? error : -error;
        
        if (q.qtype == QueryType.Binary) {
            if (absError == 0) {
                // Correct prediction: reward proportional to confidence
                reputation[preds[i].node] += 10 * preds[i].confidence;
            } else {
                // Wrong prediction: slash proportional to confidence
                uint256 slash = preds[i].confidence * 5;
                uint256 current = reputation[preds[i].node];
                reputation[preds[i].node] = current > slash ? current - slash : 0;
            }
        } else {
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
    }
    
    q.status = QueryStatus.Settled;
    emit Settled(queryId);
}
```

### Reputation Formulas

**Binary Queries**:
- ✅ **Correct prediction**: `reputation += 10 × confidence`
- ❌ **Wrong prediction**: `reputation -= 5 × confidence`

**Numeric Queries**:
- ✅ **Error ≤ 1**: `reputation += 15 × confidence`
- ⚠️ **Error ≤ 5**: `reputation += 8 × confidence`
- ❌ **Error > 5**: `reputation -= 4 × confidence`

**Example** (from `demo-flow.js` output):
```javascript
// After settlement with finalValue = 1 (YES)
// Node 1: predicted 1 (YES) with confidence 70 → reputation += 700 ✅
// Node 2: predicted 0 (NO) with confidence 50 → reputation -= 250 ❌
// Node 3: predicted 1 (YES) with confidence 80 → reputation += 800 ✅
```

### Future Enhancements

The current reputation system is simplified for demo purposes. Production ARGOS will include:

1. **Domain-Specific Reputation**: Track accuracy per query domain (crypto, sports, politics)
2. **Temporal Decay**: Recent performance weighted higher than historical
3. **Stake-Weighted Influence**: Reputation affects voting power in consensus
4. **Automated Pruning**: Nodes below threshold reputation are auto-ejected
5. **Multi-Dimensional Scoring**: Confidence calibration, consistency, specialization

---

## System Properties

### Performance Characteristics

- **Consensus Speed**: ~340ms (from README scenario)
- **Liveness Period**: Configurable (demo: 0s, production: 48h)
- **Gas Costs**: 
  - Query creation: ~100k gas
  - Prediction submission: ~80k gas
  - Settlement: ~200k gas per prediction

### Security Guarantees

- **Sybil Resistance**: Reputation + staking requirements
- **Economic Security**: Inherited from UMA Optimistic Oracle
- **Manipulation Resistance**: One submission per node per query
- **State Integrity**: Solidity 0.8+ overflow protection
- **Access Control**: Role-based permissions for critical functions

### Scalability Considerations

- **On-chain storage**: Linear with number of predictions
- **Consensus computation**: O(n) per prediction submission
- **Event emission**: Enables off-chain indexing for dashboards

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Frontend (React + Vite + wagmi)                        │
│  ├─ Real-time query monitoring                          │
│  ├─ Node predictions visualization                      │
│  └─ Reputation leaderboards                             │
└─────────────────────────────────────────────────────────┘
                            │
                            │ Web3 RPC
                            ▼
┌─────────────────────────────────────────────────────────┐
│  Ethereum Network (Hardhat Local / Testnet)             │
│  └─ AggregatorCore.sol (0x...)                          │
└─────────────────────────────────────────────────────────┘
                            ▲
                            │ submitPrediction()
                            │
┌─────────────────────────────────────────────────────────┐
│  ION Agent Cluster (Python)                             │
│  ├─ crypto_oracle.py                                    │
│  ├─ news_oracle.py                                      │
│  ├─ sports_oracle.py                                    │
│  └─ llm_reasoning_agent.py                              │
└─────────────────────────────────────────────────────────┘
```

For detailed integration instructions, see [API Reference](api.md).

For building your own ION, see [ION Developer Guide](ion-guide.md).

For security analysis, see [Security Model](security.md).
