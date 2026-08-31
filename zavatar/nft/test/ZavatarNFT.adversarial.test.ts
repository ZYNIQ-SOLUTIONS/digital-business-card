import { expect } from "chai";
import { ethers } from "hardhat";
import { ZavatarNFT } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("ZavatarNFT Adversarial & Boundary Stress Test Suite", function () {
  let zavatarNFT: ZavatarNFT;
  let contractOwner: HardhatEthersSigner;
  let tokenOwner: HardhatEthersSigner;
  let recipient: HardhatEthersSigner;
  let approvedOperator: HardhatEthersSigner;
  let thirdPartyAttacker: HardhatEthersSigner;

  const SAMPLE_METADATA_URI = "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi/metadata.json";

  beforeEach(async function () {
    [contractOwner, tokenOwner, recipient, approvedOperator, thirdPartyAttacker] = await ethers.getSigners();
    const ZavatarNFTFactory = await ethers.getContractFactory("ZavatarNFT");
    zavatarNFT = (await ZavatarNFTFactory.deploy(contractOwner.address)) as unknown as ZavatarNFT;
    await zavatarNFT.waitForDeployment();

    // Mint token ID 1 to tokenOwner (defaults to soulbound = true)
    await zavatarNFT.connect(contractOwner).safeMint(tokenOwner.address, SAMPLE_METADATA_URI);
  });

  describe("Adversarial Soulbound Transfer Blocking", function () {
    const tokenId = 1n;

    it("ADV-1: Token owner cannot transfer via transferFrom", async function () {
      await expect(
        zavatarNFT.connect(tokenOwner).transferFrom(tokenOwner.address, recipient.address, tokenId)
      ).to.be.revertedWithCustomError(zavatarNFT, "SoulboundTokenTransferBlocked")
        .withArgs(tokenId);
    });

    it("ADV-2: Token owner cannot transfer via safeTransferFrom(address,address,uint256)", async function () {
      await expect(
        zavatarNFT.connect(tokenOwner)["safeTransferFrom(address,address,uint256)"](
          tokenOwner.address,
          recipient.address,
          tokenId
        )
      ).to.be.revertedWithCustomError(zavatarNFT, "SoulboundTokenTransferBlocked")
        .withArgs(tokenId);
    });

    it("ADV-3: Token owner cannot transfer via safeTransferFrom(address,address,uint256,bytes)", async function () {
      await expect(
        zavatarNFT.connect(tokenOwner)["safeTransferFrom(address,address,uint256,bytes)"](
          tokenOwner.address,
          recipient.address,
          tokenId,
          "0x1234"
        )
      ).to.be.revertedWithCustomError(zavatarNFT, "SoulboundTokenTransferBlocked")
        .withArgs(tokenId);
    });

    it("ADV-4: Contract owner/deployer cannot transfer soulbound token away from user", async function () {
      await expect(
        zavatarNFT.connect(contractOwner).transferFrom(tokenOwner.address, recipient.address, tokenId)
      ).to.be.revertedWithCustomError(zavatarNFT, "SoulboundTokenTransferBlocked")
        .withArgs(tokenId);
    });

    it("ADV-5: Third-party attacker cannot transfer soulbound token", async function () {
      await expect(
        zavatarNFT.connect(thirdPartyAttacker).transferFrom(tokenOwner.address, thirdPartyAttacker.address, tokenId)
      ).to.be.revertedWithCustomError(zavatarNFT, "SoulboundTokenTransferBlocked")
        .withArgs(tokenId);
    });

    it("ADV-6: Approved single-token operator cannot transfer soulbound token", async function () {
      await zavatarNFT.connect(tokenOwner).approve(approvedOperator.address, tokenId);
      expect(await zavatarNFT.getApproved(tokenId)).to.equal(approvedOperator.address);

      await expect(
        zavatarNFT.connect(approvedOperator).transferFrom(tokenOwner.address, recipient.address, tokenId)
      ).to.be.revertedWithCustomError(zavatarNFT, "SoulboundTokenTransferBlocked")
        .withArgs(tokenId);
    });

    it("ADV-7: Approved all-tokens operator cannot transfer soulbound token", async function () {
      await zavatarNFT.connect(tokenOwner).setApprovalForAll(approvedOperator.address, true);
      expect(await zavatarNFT.isApprovedForAll(tokenOwner.address, approvedOperator.address)).to.equal(true);

      await expect(
        zavatarNFT.connect(approvedOperator).transferFrom(tokenOwner.address, recipient.address, tokenId)
      ).to.be.revertedWithCustomError(zavatarNFT, "SoulboundTokenTransferBlocked")
        .withArgs(tokenId);
    });
  });

  describe("Soulbound State Transitions & Unlocking", function () {
    const tokenId = 1n;

    it("ADV-8: Toggling soulbound false -> transfers succeed -> toggling true -> transfers blocked again", async function () {
      // 1. Unlock
      await zavatarNFT.connect(contractOwner).setSoulbound(tokenId, false);
      expect(await zavatarNFT.soulbound(tokenId)).to.equal(false);

      // 2. Transfer to recipient succeeds
      await expect(
        zavatarNFT.connect(tokenOwner).transferFrom(tokenOwner.address, recipient.address, tokenId)
      ).to.emit(zavatarNFT, "Transfer").withArgs(tokenOwner.address, recipient.address, tokenId);

      expect(await zavatarNFT.ownerOf(tokenId)).to.equal(recipient.address);

      // 3. Relock
      await zavatarNFT.connect(contractOwner).setSoulbound(tokenId, true);
      expect(await zavatarNFT.soulbound(tokenId)).to.equal(true);

      // 4. Recipient now cannot transfer
      await expect(
        zavatarNFT.connect(recipient).transferFrom(recipient.address, tokenOwner.address, tokenId)
      ).to.be.revertedWithCustomError(zavatarNFT, "SoulboundTokenTransferBlocked")
        .withArgs(tokenId);
    });

    it("ADV-9: Unauthorized account cannot call setSoulbound", async function () {
      await expect(
        zavatarNFT.connect(tokenOwner).setSoulbound(tokenId, false)
      ).to.be.revertedWithCustomError(zavatarNFT, "OwnableUnauthorizedAccount")
        .withArgs(tokenOwner.address);

      await expect(
        zavatarNFT.connect(thirdPartyAttacker).setSoulbound(tokenId, false)
      ).to.be.revertedWithCustomError(zavatarNFT, "OwnableUnauthorizedAccount")
        .withArgs(thirdPartyAttacker.address);
    });

    it("ADV-10: Cannot set soulbound on unminted token ID", async function () {
      await expect(
        zavatarNFT.connect(contractOwner).setSoulbound(99999n, false)
      ).to.be.revertedWithCustomError(zavatarNFT, "TokenDoesNotExist")
        .withArgs(99999n);
    });
  });
});
