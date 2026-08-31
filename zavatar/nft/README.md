# Zavatar NFT Smart Contracts

Standalone Hardhat project for the Zavatar ERC-721 Soulbound & Tradable Avatar NFT collection on Base Sepolia.

## Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

## Quickstart

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Compile contracts**:
   ```bash
   npx hardhat compile
   ```

3. **Run test suite**:
   ```bash
   npx hardhat test
   ```

4. **Start local Hardhat node**:
   ```bash
   npx hardhat node
   ```

5. **Deploy to local network**:
   ```bash
   npx hardhat run scripts/deploy.ts --network localhost
   ```

6. **Deploy to Base Sepolia testnet**:
   ```bash
   cp .env.example .env
   # Add your PRIVATE_KEY and optional BASESCAN_API_KEY
   npx hardhat run scripts/deploy.ts --network baseSepolia
   ```

## Smart Contract Architecture

- **Contract**: `contracts/ZavatarNFT.sol`
- **Standards**: OpenZeppelin ERC-721 with `ERC721URIStorage` and `Ownable` (v5.x).
- **Soulbound Behavior**:
  - `soulbound` mapping defaults to `true` on newly minted avatar NFTs.
  - The `_update` internal hook intercepts token transfers and blocks transfers of soulbound tokens between non-zero addresses with custom error `SoulboundTokenTransferBlocked(uint256 tokenId)`.
  - Minting (`from == address(0)`) and burning (`to == address(0)`) remain permitted.
  - Contract owner can toggle soulbound status using `setSoulbound(uint256 tokenId, bool value)`.
