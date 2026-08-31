import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("=== Deploying ZavatarNFT Smart Contract ===");
  console.log("Deployer address:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  const ZavatarNFTFactory = await ethers.getContractFactory("ZavatarNFT");
  const zavatarNFT = await ZavatarNFTFactory.deploy(deployer.address);

  await zavatarNFT.waitForDeployment();

  const contractAddress = await zavatarNFT.getAddress();
  console.log("ZavatarNFT deployed successfully to:", contractAddress);
  console.log("Target network chain ID:", (await ethers.provider.getNetwork()).chainId);
  console.log("Contract owner:", await zavatarNFT.owner());
}

main().catch((error) => {
  console.error("Deployment script failed:", error);
  process.exitCode = 1;
});
