// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
/**
   * @title SecureEncryptedDocumentStorage
   * @dev SecureEncryptedDocumentStorage
   */

contract SecureEncryptedDocumentStorage {
    struct EncryptedDocument {
        bytes32 documentHash;
        address owner;
        bool isShared;
    }
 
     
    mapping(address => EncryptedDocument) private encryptedDocuments;
    mapping(address => bool) public authorizedUsers;

    address public owner;

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
    }

    function storeEncryptedDocument(bytes32 documentHash) external onlyAuthorized {
        encryptedDocuments[msg.sender] = EncryptedDocument(documentHash, msg.sender, false);
    }

    function getEncryptedDocument() external view onlyAuthorized returns (bytes32) {
        return encryptedDocuments[msg.sender].documentHash;
    }

    function shareEncryptedDocument(address recipient) external onlyAuthorized {
        require(!encryptedDocuments[recipient].isShared, "Document already shared");
        encryptedDocuments[recipient] = EncryptedDocument(encryptedDocuments[msg.sender].documentHash, recipient, true);
    }


}
