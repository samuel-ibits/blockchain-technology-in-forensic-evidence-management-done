// Check if Web3 is injected by MetaMask or another provider
if (typeof web3 !== "undefined") {
  web3 = new Web3(web3.currentProvider);
} else {
  // If no Web3 provider is found, fall back to a local development provider
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

// Load your contract
accounts = await ethereum.request({
  method: "eth_requestAccounts",
});

const contractAddress = "0x69b0D7D69739311bdc4aCbea34106e5bca584F36"; // Replace with your contract's address
const contractABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "addAuthorizedUser",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "recipient",
        type: "address",
      },
    ],
    name: "DocumentShared",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "documentHash",
        type: "bytes32",
      },
    ],
    name: "DocumentUploaded",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
    ],
    name: "shareDocument",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "documentHash",
        type: "bytes32",
      },
    ],
    name: "uploadDocument",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "UserAuthorized",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "authorizedUsers",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getEncryptedDocument",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getOwner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "isAuthorizedUser",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
const contract = new web3.eth.Contract(contractABI, contractAddress);

// Function to get the encrypted document
async function getUploadedDocument() {
  const owner = accounts; // Replace with the owner's address
  try {
    const encryptedDocument = await contract.methods
      .getEncryptedDocument()
      .call({ from: owner });
    console.log("Encrypted Document:", encryptedDocument);
    alert("Encrypted Document: " + encryptedDocument);
  } catch (error) {
    console.error("Error:", error);
    alert("Error: " + error.message);
  }
}

// Function to upload a document
async function uploadDocument(file) {
  const sender = accounts; // Replace with the sender's address
  const documentHash = file; // Replace with the document's hash

  try {
    const receipt = await contract.methods
      .uploadDocument(documentHash)
      .send({ from: sender });
    console.log("Transaction Receipt:", receipt);
    alert("Transaction Receipt: " + JSON.stringify(receipt));
  } catch (error) {
    console.error("Error:", error);
    alert("Error: " + error.message);
  }
}
