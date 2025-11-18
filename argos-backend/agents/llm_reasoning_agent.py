import os
import json
from web3 import Web3
from dotenv import load_dotenv
import openai

load_dotenv()

def get_llm_prediction(query):
    """
    Uses an LLM to predict the outcome of a qualitative query.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("OPENAI_API_KEY not found in .env file. Skipping LLM prediction.")
        return None, 0

    openai.api_key = api_key

    try:
        # This prompt is engineered to force the LLM to output a structured JSON response.
        system_prompt = """
        You are an analytical oracle. Your task is to evaluate a given question and provide a clear, binary prediction (YES or NO) and a confidence score from 0 to 100.
        The question will be a proposition that can be true or false.
        You must respond in a JSON format with two keys: "outcome" (boolean) and "confidence" (integer).
        For example:
        {
          "outcome": true,
          "confidence": 85
        }
        Do not provide any other text or explanation outside of the JSON structure.
        """

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Question: {query}"}
            ],
            temperature=0.1,
            max_tokens=50
        )

        # Extract the JSON content from the response
        content = response.choices[0].message['content']
        result = json.loads(content)
        
        outcome = bool(result.get("outcome"))
        confidence = int(result.get("confidence"))
        
        print(f"LLM Analysis for '{query}': Predicted {'YES' if outcome else 'NO'} with {confidence}% confidence.")
        return outcome, confidence

    except Exception as e:
        print(f"An error occurred with the LLM API: {e}")
        return None, 0

def main():
    """
    Main function for the LLM Reasoning Agent.
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

    # The qualitative query from the README
    query = "Will the James Webb Telescope detect biosignatures on K2-18b by 2026?"
    outcome, confidence = get_llm_prediction(query)

    if outcome is None:
        print("Could not get a prediction from the LLM. Aborting.")
        return

    try:
        nonce = w3.eth.get_transaction_count(account.address)
        tx = contract.functions.submit(
            outcome,
            confidence,
            b'llm_proof_hash'  # Placeholder
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
