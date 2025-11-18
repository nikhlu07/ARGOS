import os
import json
from web3 import Web3
from dotenv import load_dotenv
import random

load_dotenv()

def get_mock_sports_data(team_a, team_b):
    """
    Mocks fetching sports data and returns a predicted winner and confidence.
    """
    # In a real scenario, this would call a sports data API (e.g., ESPN's API)
    # and run a predictive model.
    # For this example, we'll just generate a random outcome.
    
    winner = random.choice([team_a, team_b])
    confidence = random.randint(70, 95) # Simulate a confident prediction
    
    print(f"Mock Sports Analysis: Predicting {winner} to win against {('the other team')} with {confidence}% confidence.")
    return winner, confidence

def main():
    """
    Main function for the Sports Oracle agent.
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
    
    try:
        with open("contract_abi.json") as f:
            contract_abi = json.load(f)
    except FileNotFoundError:
        print("contract_abi.json not found. Please compile your contracts and place the ABI in this file.")
        return

    contract = w3.eth.contract(address=contract_address, abi=contract_abi)

    # Example query: "Will Team A beat Team B in the upcoming match?"
    team_a = "Team A"
    team_b = "Team B"
    predicted_winner, confidence = get_mock_sports_data(team_a, team_b)
    
    outcome = predicted_winner == team_a

    print(f"Predicted Outcome: {'YES' if outcome else 'NO'} (Team A wins), Confidence: {confidence}%")

    try:
        nonce = w3.eth.get_transaction_count(account.address)
        tx = contract.functions.submit(
            outcome,
            confidence,
            b'sports_proof_hash'  # Placeholder
        ).build_transaction({
            'from': account.address,
            'value': w3.to_wei(0.01, 'ether'),
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
