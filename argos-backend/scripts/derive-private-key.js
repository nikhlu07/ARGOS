// Derive a private key and address from a BIP39 mnemonic.
// Usage: node scripts/derive-private-key.js "word1 word2 ... word12"
const { ethers } = require("ethers");

async function main() {
  const mnemonic = process.argv.slice(2).join(" ").trim();
  if (!mnemonic || mnemonic.split(" ").length < 12) {
    console.error("Provide a 12/24-word mnemonic as an argument.");
    process.exit(1);
  }
  const wallet = ethers.Wallet.fromMnemonic(mnemonic);
  console.log("Address:", wallet.address);
  console.log("PrivateKey:", wallet.privateKey); // includes 0x prefix
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});