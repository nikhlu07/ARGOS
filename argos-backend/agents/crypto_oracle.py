import os
import json
from web3 import Web3
from dotenv import load_dotenv

load_dotenv()

# Mock function to get crypto price
def get_crypto_price(crypto_symbol):
    # In a real scenario, this would call a real crypto API
    if crypto_symbol == "SOL":
        return 255.0  # Mock price
    return 0.0

def main():
    # Connect to the local Hardhat node
    w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))
    if not w3.is_connected():
        print("Failed to connect to Ethereum node")
        return

    # Get contract ABI and address
    # You'll need to compile your contract and get the ABI and address
    contract_address = os.getenv("CONTRACT_ADDRESS")
    with open("../contracts/AggregatorCore.json") as f:
        contract_abi = json.load(f)["abi"]

    contract = w3.eth.contract(address=contract_address, abi=contract_abi)

    # Oracle logic
    price_threshold = 250.0
    current_price = get_crypto_price("SOL")
    outcome = current_price > price_threshold
    confidence = 96  # Based on some internal model

    # Submit to the AggregatorCore contract
    # This requires a funded account on the local node
    account = w3.eth.accounts[0]
    tx_hash = contract.functions.submit(
        outcome, confidence, b"proof_hash_placeholder"
    ).transact({"from": account, "value": w3.to_wei(0.1, "ether")})

    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    print(f"Submission successful, transaction hash: {receipt.transactionHash.hex()}")

if __name__ == "__main__":
    main()
