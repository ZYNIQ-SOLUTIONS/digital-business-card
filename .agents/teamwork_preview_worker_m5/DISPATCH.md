## 2026-08-31T06:29:21Z
Worker M5 Assignment: Hardhat NFT Smart Contract & Tests (Requirement R6).
Working directory: /home/level-77/Desktop/digital_business_card/.agents/teamwork_preview_worker_m5/
Write ownership: /home/level-77/Desktop/digital_business_card/zavatar/nft/
Tasks:
1. Scaffold standalone Hardhat project in zavatar/nft/ (package.json, tsconfig.json, hardhat.config.ts, .env.example, README.md)
2. Implement contracts/ZavatarNFT.sol with ERC721URIStorage, Ownable, safeMint, soulbound toggle, custom error SoulboundTokenTransferBlocked(uint256 tokenId), _update override
3. Implement scripts/deploy.ts
4. Implement test/ZavatarNFT.test.ts covering owner mint, Transfer event, soulbound transfer block with custom error, non-soulbound transfer
5. Run npm install, npx hardhat compile, npx hardhat test inside zavatar/nft/ and verify 100% pass
6. Write handoff.md and send completion message to parent.
