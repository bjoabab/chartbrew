const fs = require("fs").promises;
const crypto = require("crypto");
const path = require("path");

const envPath = path.join(__dirname, "..", "..", ".env");

// Generates a 32-byte random key for AES-256 and returns its hexadecimal representation
function generateAESKey() {
  return crypto.randomBytes(32).toString("hex");
}

async function updateKeys(envVar) {
  // ✅ First: check if Railway env has it
  if (process.env[envVar] && process.env[envVar].length === 64) {
    return; // Key exists, do nothing
  }

  try {
    const data = await fs.readFile(envPath, "utf8");

    let updatedData = data;
    const keyRegex = new RegExp(`^${envVar}=(.*)$`, "m");
    const match = data.match(keyRegex);

    if (match) {
      if (match[1]) {
        return;
      } else {
        updatedData = data.replace(keyRegex, `${envVar}=${generateAESKey()}`);
        console.log(`Set up encryption key ${envVar}`); // eslint-disable-line
      }
    } else {
      updatedData = `${data.trim()}\n${envVar}=${generateAESKey()}\n`;
      console.log(`Set up encryption key ${envVar}`); // eslint-disable-line
    }

    await fs.writeFile(envPath, updatedData, "utf8");
  } catch (e) {
    console.error(`Encryption key '${envVar}' not found and .env update failed`); // eslint-disable-line
  }
}

updateKeys("CB_ENCRYPTION_KEY_DEV");
updateKeys("CB_ENCRYPTION_KEY");
