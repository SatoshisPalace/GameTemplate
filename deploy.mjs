import Arx from "@permaweb/arx";
import { WarpFactory } from "warp-contracts";
import Arweave from "arweave";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const ANT = "wRLnprAKi1NBvJbhiXPG6C-Nd3psFehrn1ugMQgH-mE";
const DEPLOY_FOLDER = "./build";
const TURBO_NODE = "https://turbo.ardrive.io";

// Ensure PERMAWEB_KEY is available
if (!process.env.PERMAWEB_KEY) {
  throw new Error("PERMAWEB_KEY is not defined in the environment variables.");
}

// Decode the PERMAWEB_KEY
const jwk = JSON.parse(Buffer.from(process.env.PERMAWEB_KEY, "base64").toString("utf-8"));

// Initialize Arweave
const arweave = Arweave.init({ host: "arweave.net", port: 443, protocol: "https" });

// Initialize Warp with cacheOptions
const warp = WarpFactory.forMainnet();

// Initialize Arx
const arx = new Arx({ url: TURBO_NODE, token: "arweave", key: jwk });

// Warp contract connection
const contract = warp.contract(ANT).connect(jwk);

(async () => {
  try {
    // Upload folder
    console.log("Uploading folder...");
    const result = await arx.uploadFolder(DEPLOY_FOLDER, {
      indexFile: "index.html",
    });
    console.log("Upload complete:", result);

    // Update ANT
    console.log("Updating ANT...");
    await contract.writeInteraction({
      function: "setRecord",
      subDomain: "test",
      transactionId: result.id,
    });

    console.log(
      "Deployed Cookbook. Please wait 20 - 30 minutes for ArNS to update!"
    );
  } catch (error) {
    console.error("Error:", error.message);
    console.error(error.stack);
  }
})();
