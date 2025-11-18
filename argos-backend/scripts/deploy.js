const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("Deploying AggregatorCore contract...");
  
  const AggregatorCore = await hre.ethers.getContractFactory("AggregatorCore");
  const aggregatorCore = await AggregatorCore.deploy();

  await aggregatorCore.deployed();

  console.log("AggregatorCore deployed to:", aggregatorCore.address);

  // --- Post-deployment steps ---

  // 1. Save the contract's address to a file
  // This is useful for the frontend and agents to know where the contract is.
  const contractDir = __dirname + "/../../argos-web/src/contracts";
  if (!fs.existsSync(contractDir)) {
    fs.mkdirSync(contractDir, { recursive: true });
  }
  fs.writeFileSync(
    contractDir + "/contract-address.json",
    JSON.stringify({ address: aggregatorCore.address }, undefined, 2)
  );
  console.log("Contract address saved to argos-web/src/contracts/contract-address.json");


  // 2. Save the contract's ABI to a file
  const contractArtifact = hre.artifacts.readArtifactSync("AggregatorCore");
  fs.writeFileSync(
    contractDir + "/AggregatorCore.json",
    JSON.stringify(contractArtifact, null, 2)
  );
  console.log("Contract ABI saved to argos-web/src/contracts/AggregatorCore.json");

  // Also save the ABI for the Python agents
  const agentContractDir = __dirname + "/..";
  fs.writeFileSync(
    agentContractDir + "/contract_abi.json",
    JSON.stringify(contractArtifact.abi)
  );
  console.log("Contract ABI saved for Python agents in argos-backend/contract_abi.json");


  // 3. Update the .env file with the contract address
  const envPath = __dirname + "/../../.env";
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf8");
    if (envContent.includes("CONTRACT_ADDRESS")) {
      envContent = envContent.replace(/CONTRACT_ADDRESS=.*/g, `CONTRACT_ADDRESS="${aggregatorCore.address}"`);
    } else {
      envContent += `\nCONTRACT_ADDRESS="${aggregatorCore.address}"`;
    }
    fs.writeFileSync(envPath, envContent);
    console.log("Updated CONTRACT_ADDRESS in .env file.");
  } else {
    console.log("Note: .env file not found. Please create one from .env.example and add the contract address manually.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
