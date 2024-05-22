import bcrypt from "bcrypt";
import fs from "fs";
import util from "util";

const saltrounds = 10;
const password = "m295";
const email = "desk@library.example";
const envPassName = "PASSWORD_HASH";
const envMailName = "EMAIL_HASH";

const writeFile = util.promisify(fs.writeFile);

async function hashToEnv(password, email, envPassName, envMailName) {
  try {
    const passHash = await bcrypt.hash(password, saltrounds);
    const envPassContent = `${envPassName}=${passHash}\n`;

    const mailHash = await bcrypt.hash(email, saltrounds);
    const envMailContent = `${envMailName}=${mailHash}\n`;

    await writeFile(".env", envMailContent + envPassContent);
    console.log("hash written to .env");
  } catch (err) {
    console.error("error:", err);
  }
}

hashToEnv(password, email, envPassName, envMailName);
