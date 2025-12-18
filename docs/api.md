# ARGOS API Reference

This document provides details on the integration endpoints for the ARGOS network.

## Overview

ARGOS exposes its functionality through the `AggregatorCore` smart contract deployed on Ethereum-compatible networks. Developers can interact with ARGOS in two primary ways:

1. **Smart Contract Integration** - Directly call contract functions via Web3
2. **ION Agent Development** - Build oracle nodes that submit predictions

## Contract Address

The contract address varies by network. After deployment, retrieve it from:

```javascript
// Frontend
import contractAddress from './contracts/contract-address.json';
console.log('AggregatorCore:', contractAddress.address);

// Python agents
import os
from dotenv import load_dotenv
load_dotenv()
contract_address = os.getenv('CONTRACT_ADDRESS')
```

---

## Smart Contract API

### Data Structures

#### QueryType Enum

```solidity
enum QueryType {
    Binary,   // 0: Yes/No questions (value: 0 or 1)
    Numeric   // 1: Integer predictions (value: any int256)
}
```

#### QueryStatus Enum

```solidity
enum QueryStatus {
    Active,    // 0: Accepting predictions
    Anchored,  // 1: Final value set, awaiting settlement
    Settled    // 2: Reputation updates complete
}
```

#### Query Struct

```solidity
struct Query {
    uint256 id;              // Unique query identifier
    string description;      // Human-readable question
    QueryType qtype;         // Binary or Numeric
    uint256 createdAt;       // Block timestamp of creation
    uint256 liveness;        // Seconds until anchoring permitted
    QueryStatus status;      // Current lifecycle status
    int256 provisional;      // Weighted consensus value
    bool hasConsensus;       // Whether any predictions submitted
    int256 finalValue;       // UMA-anchored truth (0 if not anchored)
}
```

#### Prediction Struct

```solidity
struct Prediction {
    address node;       // Address of the ION agent
    int256 value;       // 0/1 for Binary, int for Numeric
    uint256 confidence; // Weight (0-100 for binary queries)
}
```

---

## Core Functions

### Query Management

#### createQuery

Creates a new query for oracle resolution.

```solidity
function createQuery(
    string calldata description,
    QueryType qtype,
    uint256 liveness
) external onlyOwner returns (uint256)
```

**Parameters**:
- `description`: Human-readable question (e.g., "Will BTC hit $100k in 2025?")
- `qtype`: `0` for Binary, `1` for Numeric
- `liveness`: Seconds before anchoring is permitted (e.g., `172800` for 48 hours)

**Returns**: Query ID (uint256)

**Access**: Owner only (demo limitation)

**Events**: Emits `QueryCreated(queryId, description, qtype, liveness)`

**JavaScript Example**:
```javascript
import { ethers } from 'ethers';
import AggregatorCoreABI from './contracts/AggregatorCore.json';

const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
const signer = provider.getSigner();
const aggregator = new ethers.Contract(contractAddress, AggregatorCoreABI.abi, signer);

const tx = await aggregator.createQuery(
    "Will ETH surpass $5000 in Q1 2026?",
    0,  // QueryType.Binary
    172800  // 48 hours liveness
);
const receipt = await tx.wait();
const queryId = await aggregator.nextQueryId();
console.log('Created query:', queryId.toString());
```

---

#### submitPrediction

Submits an ION's prediction for an active query.

```solidity
function submitPrediction(
    uint256 queryId,
    int256 value,
    uint256 confidence
) external
```

**Parameters**:
- `queryId`: Target query identifier
- `value`: 
  - Binary queries: `0` (NO) or `1` (YES)
  - Numeric queries: Any `int256` value
- `confidence`: Weight for consensus calculation
  - Binary: `1-100` (percentage)
  - Numeric: Any positive uint256

**Validation**:
- Query must exist and be in `Active` status
- One submission per address per query
- Confidence must be > 0
- For binary queries: value must be 0 or 1, confidence ≤ 100

**Events**: 
- `PredictionSubmitted(queryId, node, value, confidence)`
- `ConsensusUpdated(queryId, provisional)` (triggered automatically)

**Python Example** (from ION agents):
```python
from web3 import Web3
import json

w3 = Web3(Web3.HTTPProvider('http://localhost:8545'))
account = w3.eth.account.from_key(private_key)

with open('contract_abi.json') as f:
    abi = json.load(f)
contract = w3.eth.contract(address=contract_address, abi=abi)

# Submit prediction
nonce = w3.eth.get_transaction_count(account.address)
tx = contract.functions.submitPrediction(
    1,     # queryId
    1,     # value (YES)
    85     # confidence (85%)
).build_transaction({
    'from': account.address,
    'nonce': nonce,
    'gas': 200000,
    'gasPrice': w3.to_wei('50', 'gwei')
})

signed_tx = account.sign_transaction(tx)
tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
print(f"Prediction submitted: {receipt.transactionHash.hex()}")
```

**JavaScript Example**:
```javascript
const tx = await aggregator.connect(ionSigner).submitPrediction(
    queryId,
    1,    // YES prediction
    90    // 90% confidence
);
await tx.wait();
console.log('Prediction submitted');
```

---

#### getPredictions

Retrieves all predictions for a query.

```solidity
function getPredictions(uint256 queryId) 
    external view returns (Prediction[] memory)
```

**Parameters**: 
- `queryId`: Query identifier

**Returns**: Array of `Prediction` structs

**JavaScript Example**:
```javascript
const predictions = await aggregator.getPredictions(queryId);
predictions.forEach((pred, i) => {
    console.log(`Node ${i}: ${pred.node}`);
    console.log(`  Value: ${pred.value.toString()}`);
    console.log(`  Confidence: ${pred.confidence.toString()}`);
});
```

---

### Anchoring & Settlement

#### canAnchor

Checks if a query is ready for anchoring.

```solidity
function canAnchor(uint256 queryId) public view returns (bool)
```

**Returns**: `true` if query is Active and liveness period has passed

**JavaScript Example**:
```javascript
const ready = await aggregator.canAnchor(queryId);
if (ready) {
    console.log('Query ready for anchoring');
}
```

---

#### anchorFinal

Sets the final truth value from UMA Oracle.

```solidity
function anchorFinal(uint256 queryId, int256 finalValue) 
    external onlyAnchorOrOwner
```

**Parameters**:
- `queryId`: Query to anchor
- `finalValue`: The ground truth from UMA (0/1 for binary, int for numeric)

**Access**: Owner or designated anchor address

**Events**: `FinalAnchored(queryId, finalValue)`

**JavaScript Example**:
```javascript
// Typically called by UMA relayer bot
const tx = await aggregator.connect(anchorSigner).anchorFinal(
    queryId,
    1  // Final truth: YES
);
await tx.wait();
console.log('Final value anchored');
```

---

#### settle

Processes reputation updates based on anchored truth.

```solidity
function settle(uint256 queryId) external onlyOwner
```

**Parameters**: 
- `queryId`: Anchored query to settle

**Access**: Owner only

**Effects**: Updates reputation for all nodes that submitted predictions

**Events**: `Settled(queryId)`

**JavaScript Example**:
```javascript
const tx = await aggregator.connect(deployer).settle(queryId);
await tx.wait();

// Check updated reputations
const node1Rep = await aggregator.reputation(node1Address);
const node2Rep = await aggregator.reputation(node2Address);
console.log(`Node 1 reputation: ${node1Rep.toString()}`);
console.log(`Node 2 reputation: ${node2Rep.toString()}`);
```

---

### Admin Functions

#### setAnchor

Designates an address authorized to anchor final values.

```solidity
function setAnchor(address _anchor) external onlyOwner
```

**Parameters**: 
- `_anchor`: Address of UMA relayer or authorized anchor

**Access**: Owner only

**Events**: `AnchorChanged(_anchor)`

**JavaScript Example**:
```javascript
const tx = await aggregator.setAnchor(relayerAddress);
await tx.wait();
console.log('Anchor address updated');
```

---

### View Functions

#### queries

Retrieves query details.

```solidity
mapping(uint256 => Query) public queries;
```

**JavaScript Example**:
```javascript
const query = await aggregator.queries(queryId);
console.log('Description:', query.description);
console.log('Provisional:', query.provisional.toString());
console.log('Status:', query.status);  // 0=Active, 1=Anchored, 2=Settled
console.log('Has Consensus:', query.hasConsensus);
```

---

#### reputation

Retrieves an address's reputation score.

```solidity
mapping(address => uint256) public reputation;
```

**JavaScript Example**:
```javascript
const rep = await aggregator.reputation(nodeAddress);
console.log(`Reputation: ${rep.toString()}`);
```

---

## Events

Subscribe to contract events for real-time monitoring:

### QueryCreated

```solidity
event QueryCreated(
    uint256 indexed queryId,
    string description,
    QueryType qtype,
    uint256 liveness
);
```

**JavaScript Listener**:
```javascript
aggregator.on('QueryCreated', (queryId, description, qtype, liveness) => {
    console.log(`New query ${queryId}: ${description}`);
    console.log(`Type: ${qtype === 0 ? 'Binary' : 'Numeric'}`);
});
```

### PredictionSubmitted

```solidity
event PredictionSubmitted(
    uint256 indexed queryId,
    address indexed node,
    int256 value,
    uint256 confidence
);
```

### ConsensusUpdated

```solidity
event ConsensusUpdated(uint256 indexed queryId, int256 provisional);
```

### FinalAnchored

```solidity
event FinalAnchored(uint256 indexed queryId, int256 finalValue);
```

### Settled

```solidity
event Settled(uint256 indexed queryId);
```

---

## Complete Integration Example

### Demo Flow (from `demo-flow.js`)

```javascript
const hre = require("hardhat");

async function main() {
    const [deployer, node1, node2, node3] = await hre.ethers.getSigners();
    
    // Load deployed contract
    const contractAddr = require("./argos-web/src/contracts/contract-address.json");
    const AggregatorCore = await hre.ethers.getContractFactory("AggregatorCore");
    const aggregator = AggregatorCore.attach(contractAddr.address);
    
    // 1. Create query
    const tx1 = await aggregator.createQuery(
        "Will BTC close above $100k on Dec 31, 2025?",
        0,  // Binary
        0   // Instant anchoring for demo
    );
    await tx1.wait();
    const queryId = await aggregator.nextQueryId();
    console.log('Query created:', queryId.toString());
    
    // 2. IONs submit predictions
    await aggregator.connect(node1).submitPrediction(queryId, 1, 70);
    await aggregator.connect(node2).submitPrediction(queryId, 0, 50);
    await aggregator.connect(node3).submitPrediction(queryId, 1, 80);
    console.log('Predictions submitted');
    
    // 3. Check provisional consensus
    const query = await aggregator.queries(queryId);
    console.log('Provisional:', query.provisional.toString());  // 1 (YES)
    
    // 4. Anchor final value (simulating UMA)
    await aggregator.anchorFinal(queryId, 1);
    console.log('Anchored final value: YES');
    
    // 5. Settle and update reputations
    await aggregator.settle(queryId);
    
    // 6. Check reputations
    const rep1 = await aggregator.reputation(node1.address);
    const rep2 = await aggregator.reputation(node2.address);
    const rep3 = await aggregator.reputation(node3.address);
    console.log('Reputations:', rep1.toString(), rep2.toString(), rep3.toString());
    // Output: 700, 0, 800 (node1 and node3 correct, node2 slashed)
}

main().catch(console.error);
```

---

## Frontend Integration

### React + wagmi Example

```typescript
import { useContractRead, useContractWrite } from 'wagmi';
import AggregatorCoreABI from './contracts/AggregatorCore.json';
import contractAddress from './contracts/contract-address.json';

function QueryDashboard() {
    // Read query data
    const { data: query } = useContractRead({
        address: contractAddress.address,
        abi: AggregatorCoreABI.abi,
        functionName: 'queries',
        args: [queryId],
        watch: true  // Real-time updates
    });
    
    // Submit prediction
    const { write: submitPrediction } = useContractWrite({
        address: contractAddress.address,
        abi: AggregatorCoreABI.abi,
        functionName: 'submitPrediction'
    });
    
    const handleSubmit = () => {
        submitPrediction({
            args: [queryId, prediction, confidence]
        });
    };
    
    return (
        <div>
            <h2>{query?.description}</h2>
            <p>Provisional: {query?.provisional.toString()}</p>
            <button onClick={handleSubmit}>Submit Prediction</button>
        </div>
    );
}
```

---

## Error Handling

Common error messages and their meanings:

| Error Message | Cause | Solution |
|--------------|-------|----------|
| `QUERY_NOT_FOUND` | Query ID doesn't exist | Verify query ID is valid |
| `QUERY_NOT_ACTIVE` | Query already anchored/settled | Check query status first |
| `ALREADY_SUBMITTED` | Address already submitted | Each address can submit once per query |
| `CONFIDENCE_ZERO` | Confidence is 0 | Use confidence > 0 |
| `BINARY_VALUE_INVALID` | Value not 0 or 1 for binary | Use 0 (NO) or 1 (YES) |
| `CONFIDENCE_TOO_HIGH` | Confidence > 100 for binary | Use confidence ≤ 100 |
| `NOT_READY_TO_ANCHOR` | Liveness period not expired | Wait until `canAnchor()` returns true |
| `NOT_ANCHORED` | Trying to settle before anchoring | Call `anchorFinal()` first |
| `NOT_OWNER` / `NOT_ANCHOR` | Unauthorized access | Use authorized signer |

---

## Gas Optimization Tips

1. **Batch submissions**: If running multiple IONs, stagger submissions to avoid nonce conflicts
2. **Monitor gas prices**: Use gas price oracles for optimal transaction timing
3. **Event filtering**: Use indexed parameters for efficient event queries
4. **Off-chain computation**: Calculate consensus off-chain for display; rely on contract for canonical state

---

## Network Information

### Local Development (Hardhat)

```bash
# Terminal 1: Start Hardhat node
npx hardhat node

# Terminal 2: Deploy contracts
npx hardhat run scripts/deploy.js --network localhost

# Terminal 3: Run demo
npx hardhat run scripts/demo-flow.js --network localhost
```

**RPC URL**: `http://127.0.0.1:8545`  
**Chain ID**: `31337`

### Testnet (Example: Sepolia)

Update `hardhat.config.js`:
```javascript
networks: {
    sepolia: {
        url: process.env.SEPOLIA_RPC_URL,
        accounts: [process.env.DEPLOYER_PRIVATE_KEY]
    }
}
```

---

## Next Steps

- **Building IONs**: See [ION Developer Guide](ion-guide.md)
- **Architecture Deep Dive**: See [Architecture Documentation](architecture.md)
- **Security Analysis**: See [Security Model](security.md)
