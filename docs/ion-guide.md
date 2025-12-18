# ION Developer Guide

This guide provides everything you need to build your own Instant Oracle Node (ION).

## Introduction

**Instant Oracle Nodes (IONs)** are the eyes and ears of ARGOS—autonomous agents that observe reality and submit predictions to the network. As an ION developer, you have complete freedom to implement any architecture or strategy that you believe will produce accurate predictions.

### Why Build an ION?

- **Earn reputation** and future economic rewards
- **Specialize** in domains where you have unique data or insights
- **Contribute** to a decentralized oracle network
- **Compete** with other strategies in a Darwinian marketplace of truth

---

## Prerequisites

### Required Skills

- **Python 3.8+** proficiency
- Basic understanding of **Ethereum** and smart contracts
- Familiarity with **web3.py** library
- Understanding of REST APIs or data sources

### Required Tools

```bash
# Python environment
python --version  # 3.8 or higher

# Install dependencies
pip install web3 python-dotenv requests beautifulsoup4 textblob openai

# Optional: for development and testing
pip install eth-brownie pytest
```

---

## Getting Started

### Project Structure

Create a new directory for your ION agent:

```bash
mkdir my-ion-agent
cd my-ion-agent
touch my_oracle.py
touch .env
```

**Directory Layout**:
```
my-ion-agent/
├── my_oracle.py          # Your agent implementation
├── .env                  # Environment variables
├── contract_abi.json     # AggregatorCore ABI (from deployment)
└── requirements.txt      # Python dependencies
```

### Environment Setup

Create a `.env` file with the following variables:

```bash
# Ethereum Network
RPC_URL=http://127.0.0.1:8545

# Contract Address (from deployment)
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

# Agent Credentials
AGENT_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Optional: API Keys for data sources
OPENAI_API_KEY=sk-...
COINGECKO_API_KEY=...
```

⚠️ **Security**: Never commit `.env` to version control. Add it to `.gitignore`.

---

## Building Your First ION

### Step 1: Connect to Ethereum

All IONs need to connect to an Ethereum node and load the AggregatorCore contract:

```python
import os
import json
from web3 import Web3
from dotenv import load_dotenv

load_dotenv()

def setup_web3():
    """Initialize Web3 connection and contract"""
    # Connect to Ethereum node
    rpc_url = os.getenv('RPC_URL')
    w3 = Web3(Web3.HTTPProvider(rpc_url))
    
    if not w3.is_connected():
        raise ConnectionError("Failed to connect to Ethereum node")
    
    print(f"✓ Connected to Ethereum (Chain ID: {w3.eth.chain_id})")
    
    # Load account from private key
    private_key = os.getenv('AGENT_PRIVATE_KEY')
    account = w3.eth.account.from_key(private_key)
    print(f"✓ Agent address: {account.address}")
    
    # Load contract
    contract_address = os.getenv('CONTRACT_ADDRESS')
    with open('contract_abi.json') as f:
        contract_abi = json.load(f)
    
    contract = w3.eth.contract(
        address=contract_address,
        abi=contract_abi
    )
    print(f"✓ Contract loaded: {contract_address}")
    
    return w3, account, contract
```

### Step 2: Implement Prediction Logic

This is where your unique strategy goes. Here's a simple example:

```python
def get_prediction(query_description):
    """
    Analyze the query and return a prediction.
    
    Returns:
        tuple: (outcome, confidence)
            outcome: int (0 or 1 for binary queries)
            confidence: int (1-100)
    """
    # Example: Simple keyword-based prediction
    if "bitcoin" in query_description.lower():
        # Mock: check BTC price via API
        current_price = 98000  # In reality, call CoinGecko API
        threshold = 100000
        outcome = 1 if current_price > threshold else 0
        confidence = 75
        return outcome, confidence
    
    # Default: conservative NO with low confidence
    return 0, 50
```

### Step 3: Submit to Contract

Build and sign a transaction to submit your prediction:

```python
def submit_prediction(w3, account, contract, query_id, outcome, confidence):
    """Submit prediction to AggregatorCore contract"""
    
    try:
        # Get current nonce
        nonce = w3.eth.get_transaction_count(account.address)
        
        # Build transaction
        tx = contract.functions.submitPrediction(
            query_id,
            outcome,
            confidence
        ).build_transaction({
            'from': account.address,
            'nonce': nonce,
            'gas': 200000,
            'gasPrice': w3.to_wei('50', 'gwei')
        })
        
        # Sign transaction
        signed_tx = w3.eth.account.sign_transaction(tx, account.key)
        
        # Send transaction
        tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        
        print(f"📤 Transaction sent: {tx_hash.hex()}")
        
        # Wait for confirmation
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        
        if receipt.status == 1:
            print(f"✅ Prediction submitted successfully")
            return True
        else:
            print(f"❌ Transaction failed")
            return False
            
    except Exception as e:
        print(f"❌ Error submitting prediction: {e}")
        return False
```

### Step 4: Put It All Together

```python
def main():
    """Main ION agent loop"""
    # Setup
    w3, account, contract = setup_web3()
    
    # Hardcoded query for demo
    # In production, you'd listen for QueryCreated events
    query_id = 1
    query = contract.functions.queries(query_id).call()
    description = query[1]  # description field
    
    print(f"\n📋 Query: {description}")
    
    # Generate prediction
    outcome, confidence = get_prediction(description)
    print(f"🔮 Prediction: {'YES' if outcome else 'NO'} (confidence: {confidence}%)")
    
    # Submit to contract
    submit_prediction(w3, account, contract, query_id, outcome, confidence)

if __name__ == "__main__":
    main()
```

### Running Your ION

```bash
python my_oracle.py
```

**Expected Output**:
```
✓ Connected to Ethereum (Chain ID: 31337)
✓ Agent address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
✓ Contract loaded: 0x5FbDB2315678afecb367f032d93F642f64180aa3

📋 Query: Will BTC close above $100k on Dec 31, 2025?
🔮 Prediction: NO (confidence: 75%)
📤 Transaction sent: 0x1234...
✅ Prediction submitted successfully
```

---

## ION Architecture Patterns

ARGOS currently demonstrates four proven ION architectures. Study these to understand different approaches:

### Pattern 1: API Aggregator (Crypto Oracle)

**Use Case**: Price feeds, exchange rates, on-chain data

**Strategy**: Fetch data from reliable APIs, apply simple threshold logic

```python
# From agents/crypto_oracle.py
import requests

def get_crypto_price(symbol):
    """Fetch real-time crypto price"""
    url = f"https://api.coingecko.com/api/v3/simple/price"
    params = {'ids': symbol, 'vs_currencies': 'usd'}
    response = requests.get(url, params=params)
    data = response.json()
    return data[symbol]['usd']

# Usage
sol_price = get_crypto_price('solana')
outcome = 1 if sol_price > 250 else 0
confidence = 96  # High confidence from reliable API
```

**Pros**: Simple, reliable, fast  
**Cons**: Centralized data source, limited to quantifiable queries

---

### Pattern 2: Web Scraper + NLP (News Oracle)

**Use Case**: Event predictions, sentiment analysis, public opinion

**Strategy**: Scrape news sources, perform sentiment analysis

```python
# From agents/news_oracle.py
from bs4 import BeautifulSoup
from textblob import TextBlob
import requests

def get_news_sentiment(topic):
    """Scrape headlines and calculate sentiment"""
    url = f"https://www.google.com/search?q={topic}+news"
    headers = {'User-Agent': 'Mozilla/5.0'}
    
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    headlines = [h3.get_text() for h3 in soup.find_all('h3')]
    
    if not headlines:
        return 0.0
    
    # Calculate average sentiment polarity (-1 to +1)
    sentiments = [TextBlob(h).sentiment.polarity for h in headlines]
    avg_sentiment = sum(sentiments) / len(sentiments)
    
    return avg_sentiment

# Usage
sentiment = get_news_sentiment("James Webb Telescope discoveries")
outcome = 1 if sentiment > 0.1 else 0
confidence = min(int(abs(sentiment) * 100), 100)
```

**Pros**: Can handle unstructured data, captures public sentiment  
**Cons**: Prone to noise, dependent on scraping stability

---

### Pattern 3: LLM Reasoning Engine (OpenAI Oracle)

**Use Case**: Complex qualitative queries, subjective assessments

**Strategy**: Leverage large language models for reasoning

```python
# From agents/llm_reasoning_agent.py
import openai
import json

def get_llm_prediction(query):
    """Use GPT to reason about qualitative query"""
    system_prompt = """
    You are an analytical oracle. Evaluate the question and provide
    a JSON response with "outcome" (boolean) and "confidence" (0-100).
    Do not explain, just output JSON.
    Example: {"outcome": true, "confidence": 85}
    """
    
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Question: {query}"}
        ],
        temperature=0.1,  # Low temperature for consistency
        max_tokens=50
    )
    
    result = json.loads(response.choices[0].message['content'])
    return bool(result['outcome']), int(result['confidence'])

# Usage
query = "Will the James Webb Telescope detect biosignatures on K2-18b by 2026?"
outcome, confidence = get_llm_prediction(query)
```

**Pros**: Handles any query type, leverages world knowledge  
**Cons**: API costs, potential hallucinations, slower

---

### Pattern 4: Custom ML Model (Sports Oracle)

**Use Case**: Proprietary models, ensemble predictions

**Strategy**: Integrate your own trained models

```python
# From agents/sports_oracle.py (simplified)
import random

class SportsModel:
    def predict(self, team_a, team_b):
        """Placeholder for a real ML model"""
        # In reality: load trained model, compute features, predict
        winner = random.choice([team_a, team_b])
        confidence = random.randint(70, 95)
        return winner, confidence

model = SportsModel()
winner, confidence = model.predict("Team A", "Team B")
outcome = 1 if winner == "Team A" else 0
```

**Pros**: Can leverage proprietary data/models  
**Cons**: Requires ML expertise, model maintenance

---

## Submitting Predictions

### Best Practices for Confidence Scoring

Your confidence score affects both your weight in consensus and your potential reward/slashing:

**Guidelines**:
- **High confidence (80-100)**: Only when you have strong, reliable data
- **Medium confidence (50-79)**: Standard predictions with decent evidence
- **Low confidence (20-49)**: Weak signal or contradictory data
- **Very low (1-19)**: Last-resort guesses

**Example Calibration**:
```python
def calculate_confidence(data_quality, source_reliability, signal_strength):
    """Calculate calibrated confidence score"""
    base = 50
    
    # Adjust for data quality
    if data_quality == 'high':
        base += 30
    elif data_quality == 'medium':
        base += 15
    
    # Adjust for source reliability
    if source_reliability > 0.9:
        base += 10
    elif source_reliability < 0.5:
        base -= 20
    
    # Adjust for signal strength
    base += int(signal_strength * 20)
    
    return max(1, min(100, base))
```

### Gas Management

```python
def estimate_gas(contract, function_call):
    """Estimate gas before submitting"""
    try:
        gas_estimate = function_call.estimate_gas()
        print(f"⛽ Estimated gas: {gas_estimate}")
        return gas_estimate
    except Exception as e:
        print(f"⚠️ Gas estimation failed: {e}")
        return 200000  # Default fallback

# Usage
tx_function = contract.functions.submitPrediction(query_id, outcome, confidence)
gas_needed = estimate_gas(contract, tx_function)
```

### Error Handling

```python
def safe_submit(w3, account, contract, query_id, outcome, confidence):
    """Submit with comprehensive error handling"""
    try:
        # Check if already submitted
        has_submitted = contract.functions.hasSubmitted(query_id, account.address).call()
        if has_submitted:
            print("⚠️ Already submitted to this query")
            return False
        
        # Check query status
        query = contract.functions.queries(query_id).call()
        if query[6] != 0:  # status field
            print("⚠️ Query not active")
            return False
        
        # Submit
        return submit_prediction(w3, account, contract, query_id, outcome, confidence)
        
    except Exception as e:
        print(f"❌ Submission error: {e}")
        return False
```

---

## Reputation and Staking

### How Reputation Works

Your reputation increases when your predictions match the final UMA truth:

**Binary Queries**:
- ✅ Correct: `reputation += 10 × confidence`
- ❌ Wrong: `reputation -= 5 × confidence`

**Numeric Queries**:
- ✅ Error ≤ 1: `reputation += 15 × confidence`
- ⚠️ Error ≤ 5: `reputation += 8 × confidence`
- ❌ Error > 5: `reputation -= 4 × confidence`

### Checking Your Reputation

```python
def check_reputation(contract, address):
    """Query current reputation"""
    rep = contract.functions.reputation(address).call()
    print(f"🏆 Reputation: {rep}")
    return rep
```

### Strategy Tips

1. **Start conservative**: Use moderate confidence (50-70) until you build reputation
2. **Specialize**: Focus on domains where you have an edge
3. **Calibrate**: Track your historical accuracy and adjust confidence accordingly
4. **Diversify**: Submit to multiple queries to reduce variance

---

## Running Multiple Agents

### Orchestration Script

```python
# orchestrator.py
import subprocess
import time
import sys

agents = [
    "crypto_oracle.py",
    "news_oracle.py",
    "sports_oracle.py",
    "llm_oracle.py"
]

processes = []

for agent in agents:
    process = subprocess.Popen([sys.executable, agent])
    processes.append(process)
    print(f"🚀 Started {agent} (PID: {process.pid})")
    time.sleep(2)  # Stagger starts

print("✅ All agents running. Press Ctrl+C to stop.")

try:
    for p in processes:
        p.wait()
except KeyboardInterrupt:
    print("\n⏹️  Stopping agents...")
    for p in processes:
        p.terminate()
    print("✅ All agents stopped")
```

### Process Management

```bash
# Start all agents
python orchestrator.py

# Monitor logs
tail -f agent_*.log

# Stop all agents
pkill -f "python.*oracle.py"
```

---

## Advanced Topics

### Event Monitoring

Listen for new queries instead of polling:

```python
def listen_for_queries(contract, callback):
    """Subscribe to QueryCreated events"""
    event_filter = contract.events.QueryCreated.create_filter(fromBlock='latest')
    
    print("👂 Listening for new queries...")
    
    while True:
        for event in event_filter.get_new_entries():
            query_id = event['args']['queryId']
            description = event['args']['description']
            print(f"\n🔔 New query {query_id}: {description}")
            
            # Process query
            callback(query_id, description)
        
        time.sleep(10)  # Poll every 10 seconds

# Usage
def handle_new_query(query_id, description):
    outcome, confidence = get_prediction(description)
    submit_prediction(w3, account, contract, query_id, outcome, confidence)

listen_for_queries(contract, handle_new_query)
```

### Ensemble Predictions

Combine multiple data sources for better accuracy:

```python
def ensemble_prediction(query):
    """Combine predictions from multiple sources"""
    predictions = []
    
    # Source 1: API data
    api_outcome, api_conf = get_api_prediction(query)
    predictions.append((api_outcome, api_conf, 0.4))  # 40% weight
    
    # Source 2: Sentiment
    sent_outcome, sent_conf = get_sentiment_prediction(query)
    predictions.append((sent_outcome, sent_conf, 0.3))  # 30% weight
    
    # Source 3: LLM
llm_outcome, llm_conf = get_llm_prediction(query)
    predictions.append((llm_outcome, llm_conf, 0.3))  # 30% weight
    
    # Weighted voting
    weighted_sum = sum(outcome * conf * weight 
                      for outcome, conf, weight in predictions)
    total_weight = sum(conf * weight for _, conf, weight in predictions)
    
    final_outcome = 1 if weighted_sum / total_weight > 0.5 else 0
    final_confidence = int(total_weight)
    
    return final_outcome, final_confidence
```

### Testing Against Local Node

```bash
# Terminal 1: Start Hardhat node
npx hardhat node

# Terminal 2: Deploy contract
npx hardhat run scripts/deploy.js --network localhost

# Terminal 3: Create test query
npx hardhat run scripts/create-test-query.js --network localhost

# Terminal 4: Run your ION
python my_oracle.py
```

---

## Debugging Tips

### Common Issues

**Issue**: "Failed to connect to Ethereum node"
```python
# Solution: Check RPC_URL in .env
import os
print(os.getenv('RPC_URL'))  # Should print valid URL
```

**Issue**: "ALREADY_SUBMITTED"
```python
# Solution: Check submission status before submitting
has_submitted = contract.functions.hasSubmitted(query_id, account.address).call()
if has_submitted:
    print("Already submitted!")
```

**Issue**: "Insufficient funds"
```python
# Solution: Check account balance
balance = w3.eth.get_balance(account.address)
print(f"Balance: {w3.from_wei(balance, 'ether')} ETH")
```

### Logging

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('ion_agent.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)
logger.info("Agent started")
```

---

## Next Steps

1. **Read the Architecture**: Understand how IONs fit into the larger system → [Architecture Docs](architecture.md)
2. **Study the API**: Learn all contract functions → [API Reference](api.md)
3. **Understand Security**: Know the risks and rewards → [Security Model](security.md)
4. **Join the Community**: Share strategies and learn from other ION developers

---

## Example ION Templates

### Minimal Template

```python
# minimal_ion.py
import os, json
from web3 import Web3
from dotenv import load_dotenv

load_dotenv()

def main():
    w3 = Web3(Web3.HTTPProvider(os.getenv('RPC_URL')))
    account = w3.eth.account.from_key(os.getenv('AGENT_PRIVATE_KEY'))
    
    with open('contract_abi.json') as f:
        abi = json.load(f)
    contract = w3.eth.contract(address=os.getenv('CONTRACT_ADDRESS'), abi=abi)
    
    # Your prediction logic here
    query_id = 1
    outcome = 1  # YES
    confidence = 75
    
    # Submit
    tx = contract.functions.submitPrediction(query_id, outcome, confidence).build_transaction({
        'from': account.address,
        'nonce': w3.eth.get_transaction_count(account.address),
        'gas': 200000,
        'gasPrice': w3.to_wei('50', 'gwei')
    })
    
    signed = account.sign_transaction(tx)
    tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
    print(f"Submitted: {tx_hash.hex()}")

if __name__ == "__main__":
    main()
```

### Production-Ready Template

See the full implementations in:
- `argos-backend/agents/crypto_oracle.py`
- `argos-backend/agents/news_oracle.py`
- `argos-backend/agents/llm_reasoning_agent.py`
- `argos-backend/agents/sports_oracle.py`

---

**Ready to build your ION? Start experimenting and join the evolution! 🚀**
