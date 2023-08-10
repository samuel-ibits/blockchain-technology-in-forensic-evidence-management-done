import express from "express";
import multer from "multer";
import fs from "fs";
import Web3 from "web3";
import nodemailer from "nodemailer";
import ethCrypto from "eth-crypto"; // Import eth-crypto library
import dotenv from "dotenv";

// Load environment variables from .env
dotenv.config();
const app = express();
const port = 3000;

const web3 = new Web3(
  `https://goerli.infura.io/v3/${process.env.YOUR_INFURA_PROJECT_ID}`
);

// Set up Ethereum account and contract address
const PrivateKey = process.env.YOUR_PRIVATE_KEY; // Replace with your private key
const ContractAddress = process.env.YOUR_CONTRACT_ADDRESS; // Replace with your contract address
const ContractABI = JSON.parse(process.env.YOUR_CONTRACT_ABI); // Replace with your contract ABI

// Set up nodemailer with your email service provider credentials
const transporter = nodemailer.createTransport({
  service: process.env.YOUR_EMAIL_SERVICE,
  auth: {
    user: process.env.YOUR_EMAIL,
    pass: process.env.YOUR_EMAIL_PASSWORD,
  },
});

// Set up multer storage configuration
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage });

app.use(express.static("public"));

// ... your /decrypt and /send-email endpoints
app.post("/upload", upload.single("file"), async(req, res) => {
  try {
    const fileData = req.file.buffer;
    const privateKey = PrivateKey; // Replace with your private key
    const contractAddress = ContractAddress; // Replace with your contract address
    const contractABI = ContractABI; // Replace with your contract ABI


    // Encrypt the file data using eth-crypto
    const publicKey = ethCrypto.publicKeyByPrivateKey(privateKey);
    const encryptedData =await ethCrypto.encryptWithPublicKey(publicKey, fileData);
console.log('newdata', encryptedData)
    // Interact with the smart contract to store the encrypted data
    const contract = new web3.eth.Contract(contractABI, contractAddress);

    // Request account access if needed (Note: This part might not work as-is in a Node.js environment)
    web3.eth.getAccounts().then((accounts) => {
      if (accounts.length > 0) {
        const YOUR_ETHEREUM_ADDRESS = accounts[0];
        console.log(`User's Ethereum address: ${YOUR_ETHEREUM_ADDRESS}`);

        // Send the transaction to store encrypted data
        contract.methods
          .storeEncryptedFile(encryptedData)
          .send({ from: YOUR_ETHEREUM_ADDRESS })
          .on("transactionHash", (transactionHash) => {
            res.status(200).json({ success: true, transactionHash });
          })
          .on("error", (error) => {
            console.error(error);
            res.status(500).json({ error: "Contract interaction failed" });
          });
      } else {
        console.log("No Ethereum accounts found");
        res.status(500).json({ error: "No Ethereum accounts found" });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error"  });
  }
});

// ... decrypt

app.post("/decrypt", (req, res) => {
  const form = new formidable.IncomingForm();

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
      return;
    }

    const { encryptedData, privateKey } = fields;

    try {
      // Convert the encrypted data to a Buffer
      const encryptedBuffer = Buffer.from(encryptedData, "hex");

      // Use eth-crypto to decrypt the data
      const decryptedBuffer = ethCrypto.decryptWithPrivateKey(
        privateKey, // Your private key
        encryptedBuffer
      );

      // Convert the decrypted Buffer to a string (assuming it's a string)
      const decryptedData = decryptedBuffer.toString("utf-8");

      res.status(200).json({ decryptedData });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: "Decryption failed" });
    }
  });
});

// ... email

app.post("/send-email", async (req, res) => {
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
      return;
    }

    const { recipientEmail, encryptedData } = fields;

    try {
      // Send the encrypted data as an attachment via email
      const mailOptions = {
        from: "YOUR_EMAIL",
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
});

app.get("/", (req, res) => {
  res.status(200).send("This api is working");
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
