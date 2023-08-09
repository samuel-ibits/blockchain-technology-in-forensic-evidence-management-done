// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EncryptedFileStorage {
    struct EncryptedFile {
        bytes32 fileHash;
        address owner;
        bool isShared;
    }

    mapping(address => EncryptedFile) private encryptedFiles;

    modifier onlyFileOwner() {
        require(encryptedFiles[msg.sender].owner == msg.sender, "Not the file owner");
        _;
    }

    function storeEncryptedFile(bytes32 fileHash) external {
        encryptedFiles[msg.sender] = EncryptedFile(fileHash, msg.sender, false);
    }

    function getEncryptedFile() external view onlyFileOwner returns (bytes32) {
        return encryptedFiles[msg.sender].fileHash;
    }

    function shareEncryptedFile(address recipient) external onlyFileOwner {
        require(!encryptedFiles[recipient].isShared, "File already shared");
        encryptedFiles[recipient] = EncryptedFile(encryptedFiles[msg.sender].fileHash, recipient, true);
    }
}
