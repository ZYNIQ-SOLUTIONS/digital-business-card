// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ZavatarNFT
 * @notice ERC-721 Soulbound and Tradable Avatar NFT Contract for Digital Business Card Identities.
 * @dev Inherits OpenZeppelin ERC721URIStorage and Ownable (v5.0+).
 */
contract ZavatarNFT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    /// @notice Per-token soulbound flag. If true, token transfers between non-zero addresses are blocked.
    mapping(uint256 => bool) public soulbound;

    /// @dev Custom error emitted when a transfer is attempted on a soulbound token.
    error SoulboundTokenTransferBlocked(uint256 tokenId);

    /// @dev Custom error emitted when token does not exist.
    error TokenDoesNotExist(uint256 tokenId);

    /// @dev Custom error emitted when mint recipient is invalid address(0).
    error InvalidRecipient();

    /// @notice Emitted when a token's soulbound status is modified.
    event TokenSoulboundStatusChanged(uint256 indexed tokenId, bool isSoulbound);

    /**
     * @notice Constructor sets token name, symbol, and transfers initial ownership to deployer.
     * @param initialOwner Address of the contract owner / deployer.
     */
    constructor(address initialOwner)
        ERC721("Zavatar NFT", "ZAVATAR")
        Ownable(initialOwner)
    {}

    /**
     * @notice Mints a new avatar NFT to the specified recipient and attaches token metadata URI.
     * @dev Base avatar NFTs default to soulbound = true.
     * @param to Recipient address for the minted NFT.
     * @param uri IPFS or HTTP metadata URI.
     * @return tokenId The ID of the freshly minted token.
     */
    function safeMint(address to, string memory uri) external onlyOwner returns (uint256) {
        if (to == address(0)) revert InvalidRecipient();

        uint256 tokenId = ++_nextTokenId;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        // All base avatar identity NFTs default to soulbound
        soulbound[tokenId] = true;
        emit TokenSoulboundStatusChanged(tokenId, true);

        return tokenId;
    }

    /**
     * @notice Allows the contract owner to toggle the soulbound restriction (e.g. for cosmetic assets).
     * @param tokenId Target token ID.
     * @param value True to lock transferability, false to allow standard transfers.
     */
    function setSoulbound(uint256 tokenId, bool value) external onlyOwner {
        if (_ownerOf(tokenId) == address(0)) revert TokenDoesNotExist(tokenId);
        soulbound[tokenId] = value;
        emit TokenSoulboundStatusChanged(tokenId, value);
    }

    /**
     * @dev OpenZeppelin v5 hook overriding _update to enforce soulbound token restrictions.
     * Allows minting (from == address(0)) and burning (to == address(0)).
     * Reverts if from != address(0) && to != address(0) and soulbound[tokenId] is true.
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);

        if (from != address(0) && to != address(0) && soulbound[tokenId]) {
            revert SoulboundTokenTransferBlocked(tokenId);
        }

        return super._update(to, tokenId, auth);
    }

    /**
     * @dev Resolves inheritance conflict for supportsInterface.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Resolves inheritance conflict for tokenURI.
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}
