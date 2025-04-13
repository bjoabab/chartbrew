const fs = require("fs").promises;
const crypto = require("crypto");
const path = require("path");

const envPath = path.join(__dirname, "..", "..", ".env");

function generateAESKey() {
  return crypto.randomBytes(32).toString("hex");
}

async function updateKeys(envVar) {
  if (process.env[envVar] && process.env[envVar].length === 64) {
    return;
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
        console.log(`Set up encryption key ${envVar}`);
      }
    } else {
      updatedData = `${data.trim()}\n${envVar}=${generateAESKey()}\n`;
      console.log(`Set up encryption key ${envVar}`);
    }

    await fs.writeFile(envPath, updatedData, "utf8");
  } catch (e) {
    console.error(`Encryption key '${envVar}' not found and .env update failed`);
  }
}

// ✅ Export a single setup function
async function setUpEncryptionKeys() {
  await updateKeys("CB_ENCRYPTION_KEY_DEV");
  await updateKeys("CB_ENCRYPTION_KEY");
}

module.exports = {
  setUpEncryptionKeys,
};
