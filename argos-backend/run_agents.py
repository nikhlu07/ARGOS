import subprocess
import time
import sys

# List of agent scripts to run
agents = [
    "agents/crypto_oracle.py",
    "agents/news_oracle.py",
    "agents/sports_oracle.py",
    "agents/llm_reasoning_agent.py",
]

def run_agents():
    """
    Runs all specified agent scripts as separate processes.
    """
    processes = []
    print("Starting all ION agents...")
    
    for agent_script in agents:
        try:
            # We use sys.executable to ensure we're using the same python interpreter
            process = subprocess.Popen([sys.executable, agent_script])
            processes.append(process)
            print(f"Started {agent_script} with PID: {process.pid}")
            time.sleep(2) # Stagger the start times slightly
        except FileNotFoundError:
            print(f"Error: Could not find {agent_script}. Make sure the file exists.")
        except Exception as e:
            print(f"An error occurred while starting {agent_script}: {e}")

    print("\nAll agents are running. Press Ctrl+C to stop.")

    try:
        # Wait for all processes to complete. 
        # In this long-running scenario, this will wait indefinitely until interrupted.
        for process in processes:
            process.wait()
    except KeyboardInterrupt:
        print("\nStopping all agents...")
        for process in processes:
            process.terminate() # Send termination signal
        
        # Optional: wait a bit and then force kill if they haven't stopped
        time.sleep(5)
        for process in processes:
            if process.poll() is None: # If the process is still running
                print(f"Force killing process {process.pid}")
                process.kill()
        print("All agents have been stopped.")

if __name__ == "__main__":
    run_agents()
