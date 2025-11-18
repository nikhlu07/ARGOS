const hre = require("hardhat");

async function main() {
  const [deployer, a1, a2, a3] = await hre.ethers.getSigners();
  console.log("Using accounts:", deployer.address, a1.address, a2.address, a3.address);

  const addrJson = require("../../argos-web/src/contracts/contract-address.json");
  const AggregatorCore = await hre.ethers.getContractFactory("AggregatorCore");
  const aggregator = AggregatorCore.attach(addrJson.address);
  console.log("AggregatorCore at:", aggregator.address);

  // 1) Create a binary query with liveness=0 for quick demo
  const desc = "Will BTC close above $100k on Dec 31, 2025?";
  const qtypeBinary = 0; // QueryType.Binary
  const liveness = 0; // allow immediate anchoring in demo
  const txCreate = await aggregator.connect(deployer).createQuery(desc, qtypeBinary, liveness);
  const rcCreate = await txCreate.wait();
  const queryId = await aggregator.nextQueryId();
  console.log("Query created:", queryId.toString());

  // 2) Submit predictions from three nodes with confidence weights
  const submit1 = await aggregator.connect(a1).submitPrediction(queryId, 1, 70); // yes
  await submit1.wait();
  const submit2 = await aggregator.connect(a2).submitPrediction(queryId, 0, 50); // no
  await submit2.wait();
  const submit3 = await aggregator.connect(a3).submitPrediction(queryId, 1, 80); // yes
  await submit3.wait();
  console.log("Predictions submitted by", a1.address, a2.address, a3.address);

  const q = await aggregator.queries(queryId);
  console.log("Provisional consensus:", q.provisional.toString(), "hasConsensus:", q.hasConsensus);

  // 3) Anchor final result (owner or anchor)
  const finalValue = 1; // assume UMA final truth = YES
  const txAnchor = await aggregator.connect(deployer).anchorFinal(queryId, finalValue);
  await txAnchor.wait();
  console.log("Anchored final value:", finalValue);

  // 4) Settle and update reputation
  const txSettle = await aggregator.connect(deployer).settle(queryId);
  await txSettle.wait();
  console.log("Settled query:", queryId.toString());

  const rep1 = await aggregator.reputation(a1.address);
  const rep2 = await aggregator.reputation(a2.address);
  const rep3 = await aggregator.reputation(a3.address);
  console.log("Reputation:");
  console.log("  ", a1.address, rep1.toString());
  console.log("  ", a2.address, rep2.toString());
  console.log("  ", a3.address, rep3.toString());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});