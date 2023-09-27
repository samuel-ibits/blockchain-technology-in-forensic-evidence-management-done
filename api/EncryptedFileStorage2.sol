// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

  /**
   * @title SecureDocumentStorage
   * @dev SecureEncryptedDocumentStorage
   * @custom:dev-run-script scripts/deploy_with_web3.ts
   */
contract SecureDocumentStorage {
    struct EncryptedDocument {
        string documentContent; // Change data type to string
        address owner;
        bool isShared;
    }

    address public owner;
    mapping(address => EncryptedDocument) private encryptedDocuments;
    mapping(address => bool) public authorizedUsers;

    event DocumentUploaded(address indexed owner, string documentContent);
    event UserAuthorized(address indexed user);
    event DocumentShared(address indexed owner, address indexed recipient);

    constructor() {
        owner = msg.sender;
        authorizedUsers[msg.sender] = true;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    modifier onlyAuthorized() {
        require(authorizedUsers[msg.sender], "You are not authorized to perform this action");
        _;
    }

    function addAuthorizedUser(address user) external onlyOwner {
        authorizedUsers[user] = true;
        emit UserAuthorized(user);
    }

    function uploadDocument(string memory documentContent) external {
        encryptedDocuments[msg.sender] = EncryptedDocument(documentContent, msg.sender, false);
        emit DocumentUploaded(msg.sender, documentContent);
    }

    function getEncryptedDocument() external view onlyAuthorized returns (string memory) {
        return encryptedDocuments[msg.sender].documentContent;
    }

    function shareDocument(address recipient) external onlyAuthorized {
        require(!encryptedDocuments[recipient].isShared, "Document already shared");
        encryptedDocuments[recipient] = EncryptedDocument(encryptedDocuments[msg.sender].documentContent, recipient, true);
        emit DocumentShared(msg.sender, recipient);
    }

    function getOwner() external view returns (address) {
        return owner;
    }

    function isAuthorizedUser(address user) external view returns (bool) {
        return authorizedUsers[user];
    }
}
