const { generateKeyPair } = require("crypto")
const config = require("./config.json")
const fs = require("fs")

/** [generateKeyPair ~ Generate our key for bot and server communication] */
generateKeyPair(
  "rsa",
  {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
      cipher: "aes-256-cbc",
      passphrase: "saucetomate",
    },
  },
  (err, publicKey, privateKey) => {
    if (err) {
      console.log(err)
      return false
    }

    fs.writeFileSync(config.keyFile, privateKey, "utf-8")
    console.log("KeyGenerated")
  }
)
