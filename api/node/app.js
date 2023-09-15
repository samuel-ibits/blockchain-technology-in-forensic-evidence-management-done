import express from "express";
import multer from "multer";
import ethCrypto from "eth-crypto";
import Web3 from "web3";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import cors from "cors";

import { ethers } from "ethers";
// import { utils } from "ethers";

dotenv.config();

const app = express();
const port = 3000;

const web3 = new Web3(
  new Web3.providers.HttpProvider(
    `https://rpc-mumbai.maticvigil.com/v1/${process.env.MUMBAI_MATICVIGIL_API_KEY}`
  )
);

// Set up Web3 contract
const contractAddress = process.env.YOUR_CONTRACT_ADDRESS; // Replace with your contract address
// Replace with your contract ABI
const contractABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
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
  {
    inputs: [
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
    ],
    name: "shareEncryptedDocument",
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
    name: "storeEncryptedDocument",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

// Set up nodemailer
const transporter = nodemailer.createTransport({
  service: process.env.YOUR_EMAIL_SERVICE,
  auth: {
    user: process.env.YOUR_EMAIL,
    pass: process.env.YOUR_EMAIL_PASSWORD,
  },
});

// Set up multer storage configuration
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(express.static("public"));
app.use(cors({ origin: "*" }));
// ... your /decrypt and /send-email endpoints

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const fileData = req.file.buffer;
    const { ethAddress, publicKey } = req.body;

    console.log("publickey", publicKey);
    // const privateKey = process.env.YOUR_PRIVATE_KEY;
    // const publicKey = ethCrypto.publicKeyByPrivateKey(privateKey);
    const encryptedData = await ethCrypto.encryptWithPublicKey(
      publicKey,
      fileData
    );

    // Remove '0x' prefix and convert to bytes
    const bytes = new TextEncoder().encode(encryptedData);

    // Create a buffer of length 32 and copy the bytes
    const buffer = new Uint8Array(33);
    buffer.set(bytes);

    // Convert buffer to hexadecimal string
    const bytes32String =
      "0x" + [...buffer].map((b) => b.toString(16).padStart(2, "0")).join("");

    // Convert the encrypted data to bytes32 format
    const encodedEncryptedData = bytes32String;

    console.log(encodedEncryptedData);

    const contract = new web3.eth.Contract(contractABI, contractAddress);

    const YOUR_ETHEREUM_ADDRESS = ethAddress;
    console.log(contract.methods);
    // web3.eth.accounts.wallet.add(privateKey);

    //add user
    await contract.methods
      .addAuthorizedUser(ethAddress)
      .send({ from: YOUR_ETHEREUM_ADDRESS });
    res.status(200).json({ userAdded: true });
    // store data
    await contract.methods
      .storeEncryptedDocument(encodedEncryptedData)
      .send({ from: YOUR_ETHEREUM_ADDRESS });

    res.status(200).json({ uploadsuccess: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

async function convertStringToBytes32(inputString) {
  try {
    // Remove '0x' prefix and convert to bytes
    const bytes = new TextEncoder().encode(inputString);

    // Create a buffer of length 32 and copy the bytes
    const buffer = new Uint8Array(32);
    buffer.set(bytes);

    // Convert buffer to hexadecimal string
    const bytes32String =
      "0x" + [...buffer].map((b) => b.toString(16).padStart(2, "0")).join("");

    return bytes32String;
  } catch (error) {
    console.error("Error:", error.message);
    return null;
  }
}

app.post("/decrypt", upload.single("file"), async (req, res) => {
  try {
    const { encryptedData, privateKey } = req.body;

    const encryptedBuffer = Buffer.from(encryptedData, "hex");

    const decryptedBuffer = ethCrypto.decryptWithPrivateKey(
      privateKey,
      encryptedBuffer
    );
    const decryptedData = decryptedBuffer.toString("utf-8");

    res.status(200).json({ decryptedData });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Decryption failed" });
  }
});

app.post("/send-email", upload.single("file"), async (req, res) => {
  try {
    const { recipientEmail, encryptedData } = req.body;

    const mailOptions = {
      from: process.env.YOUR_EMAIL,
      to: recipientEmail,
      subject: "Encrypted File",
      text: "The encrypted file is attached.",
      attachments: [
        {
          filename: "encrypted-file.txt",
          content: encryptedData,
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Email sending failed" });
  }
});

app.get("/", (req, res) => {
  res.status(200).send("This api is working");
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
