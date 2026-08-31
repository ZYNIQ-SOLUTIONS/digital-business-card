import { expect } from "chai";
import { ethers } from "hardhat";
import { ZavatarNFT } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("ZavatarNFT", function () {
  let zavatarNFT: ZavatarNFT;
  let owner: HardhatEthersSigner;
  let user: HardhatEthersSigner;
  let recipient: HardhatEthersSigner;

  const SAMPLE_METADATA_URI = "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi/metadata.json";

  beforeEach(async function () {
    [owner, user, recipient] = await ethers.getSigners();
    const ZavatarNFTFactory = await ethers.getContractFactory("ZavatarNFT");
    zavatarNFT = (await ZavatarNFTFactory.deploy(owner.address)) as unknown as ZavatarNFT;
    await zavatarNFT.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Sets the correct token name, symbol, and contract owner", async function () {
      expect(await zavatarNFT.name()).to.equal("Zavatar NFT");
      expect(await zavatarNFT.symbol()).to.equal("ZAVATAR");
      expect(await zavatarNFT.owner()).to.equal(owner.address);
    });
  });

  describe("Minting (safeMint)", function () {
    it("1. Owner can mint a token with URI and defaults to soulbound", async function () {
      const tx = await zavatarNFT.connect(owner).safeMint(user.address, SAMPLE_METADATA_URI);
      await tx.wait();

      const tokenId = 1n;
      expect(await zavatarNFT.ownerOf(tokenId)).to.equal(user.address);
      expect(await zavatarNFT.tokenURI(tokenId)).to.equal(SAMPLE_METADATA_URI);
      expect(await zavatarNFT.soulbound(tokenId)).to.equal(true);
    });

    it("2. Minted token emits Transfer event and TokenSoulboundStatusChanged", async function () {
      await expect(zavatarNFT.connect(owner).safeMint(user.address, SAMPLE_METADATA_URI))
        .to.emit(zavatarNFT, "Transfer")
        .withArgs(ethers.ZeroAddress, user.address, 1n)
        .and.to.emit(zavatarNFT, "TokenSoulboundStatusChanged")
        .withArgs(1n, true);
    });

    it("Non-owner cannot mint tokens", async function () {
      await expect(
        zavatarNFT.connect(user).safeMint(user.address, SAMPLE_METADATA_URI)
      ).to.be.revertedWithCustomError(zavatarNFT, "OwnableUnauthorizedAccount")
        .withArgs(user.address);
    });

    it("Minting to zero address reverts with InvalidRecipient", async function () {
      await expect(
        zavatarNFT.connect(owner).safeMint(ethers.ZeroAddress, SAMPLE_METADATA_URI)
      ).to.be.revertedWithCustomError(zavatarNFT, "InvalidRecipient");
    });
  });

  describe("Soulbound Transfer Enforcement", function () {
    beforeEach(async function () {
      await zavatarNFT.connect(owner).safeMint(user.address, SAMPLE_METADATA_URI);
    });

    it("3. Soulbound token cannot be transferred (reverts with SoulboundTokenTransferBlocked)", async function () {
      const tokenId = 1n;
      expect(await zavatarNFT.soulbound(tokenId)).to.equal(true);

      // Attempt standard transferFrom
      await expect(
        zavatarNFT.connect(user).transferFrom(user.address, recipient.address, tokenId)
      ).to.be.revertedWithCustomError(zavatarNFT, "SoulboundTokenTransferBlocked")
        .withArgs(tokenId);

      // Attempt safeTransferFrom
      await expect(
        zavatarNFT.connect(user)["safeTransferFrom(address,address,uint256)"](
          user.address,
          recipient.address,
          tokenId
        )
      ).to.be.revertedWithCustomError(zavatarNFT, "SoulboundTokenTransferBlocked")
        .withArgs(tokenId);
    });

    it("4. Non-soulbound token can be transferred successfully", async function () {
      const tokenId = 1n;

      // Owner unlocks soulbound restriction
      await expect(zavatarNFT.connect(owner).setSoulbound(tokenId, false))
        .to.emit(zavatarNFT, "TokenSoulboundStatusChanged")
        .withArgs(tokenId, false);

      expect(await zavatarNFT.soulbound(tokenId)).to.equal(false);

      // User transfers token to recipient
      await expect(
        zavatarNFT.connect(user).transferFrom(user.address, recipient.address, tokenId)
      ).to.emit(zavatarNFT, "Transfer")
        .withArgs(user.address, recipient.address, tokenId);

      expect(await zavatarNFT.ownerOf(tokenId)).to.equal(recipient.address);
    });

    it("Non-owner cannot alter soulbound flag", async function () {
      await expect(
        zavatarNFT.connect(user).setSoulbound(1n, false)
      ).to.be.revertedWithCustomError(zavatarNFT, "OwnableUnauthorizedAccount")
        .withArgs(user.address);
    });

    it("Cannot toggle soulbound on non-existent token", async function () {
      await expect(
        zavatarNFT.connect(owner).setSoulbound(999n, false)
      ).to.be.revertedWithCustomError(zavatarNFT, "TokenDoesNotExist")
        .withArgs(999n);
    });
  });
});
