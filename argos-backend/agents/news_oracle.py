import os
import json
from web3 import Web3
from dotenv import load_dotenv
import requests
from bs4 import BeautifulSoup
from textblob import TextBlob

load_dotenv()

def get_news_sentiment(topic):
    """
    Scrapes news headlines related to a topic and returns a sentiment score.
    """
    # This is a mock search URL. A real implementation would use a news API.
    url = f"https://www.google.com/search?q={topic}+news"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36"
    }
    try:
        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.text, "html.parser")
        headlines = [h3.get_text() for h3 in soup.find_all('h3')]
        
        if not headlines:
            return 0.0

        sentiment = sum(TextBlob(headline).sentiment.polarity for headline in headlines) / len(headlines)
        return sentiment
    except Exception as e:
        print(f"Error fetching news: {e}")
        return 0.0

def main():
    """
    Main function for the News Oracle agent.
    """
    rpc_url = os.getenv("RPC_URL")
    agent_private_key = os.getenv("AGENT_PRIVATE_KEY")
    contract_address = os.getenv("CONTRACT_ADDRESS")

    if not all([rpc_url, agent_private_key, contract_address]):
        print("Please set RPC_URL, AGENT_PRIVATE_KEY, and CONTRACT_ADDRESS in your .env file.")
        return

    w3 = Web3(Web3.HTTPProvider(rpc_url))
    if not w3.is_connected():
        print("Failed to connect to Ethereum node.")
        return

    account = w3.eth.account.from_key(agent_private_key)
    
    # You'll need to have the contract ABI available
    # This would typically be generated during the contract compilation/deployment process
    try:
        with open("contract_abi.json") as f:
            contract_abi = json.load(f)
    except FileNotFoundError:
        print("contract_abi.json not found. Please compile your contracts and place the ABI in this file.")
        return

    contract = w3.eth.contract(address=contract_address, abi=contract_abi)

    # Example query: "Will the James Webb Telescope detect biosignatures on K2-18b by 2026?"
    # For this example, we'll just check the sentiment around "James Webb Telescope discoveries"
    sentiment_score = get_news_sentiment("James Webb Telescope discoveries")

    # Convert sentiment to a boolean outcome and confidence
    # This is a simplistic model. A real agent would have a more sophisticated mapping.
    outcome = sentiment_score > 0.1  # If sentiment is positive, predict YES
    confidence = min(int(abs(sentiment_score) * 100), 100)

    print(f"News sentiment for 'James Webb Telescope discoveries': {sentiment_score:.2f}")
    print(f"Predicted Outcome: {'YES' if outcome else 'NO'}, Confidence: {confidence}%")

    try:
        nonce = w3.eth.get_transaction_count(account.address)
        tx = contract.functions.submit(
            outcome,
            confidence,
            b'news_proof_hash'  # Placeholder for a real proof hash
        ).build_transaction({
            'from': account.address,
            'value': w3.to_wei(0.01, 'ether'),  # Stake
            'nonce': nonce,
            'gas': 200000,
            'gasPrice': w3.to_wei('50', 'gwei')
        })

        signed_tx = w3.eth.account.sign_transaction(tx, private_key=agent_private_key)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        
        print(f"Submission transaction sent. Hash: {tx_hash.hex()}")
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        print("Transaction confirmed.")

    except Exception as e:
        print(f"An error occurred during the transaction: {e}")

if __name__ == "__main__":
    main()
