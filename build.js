const fs = require("fs");
const dotenv = require("dotenv");
const replace = require("replace-in-file");

// Load environment variables from .env file
dotenv.config();
console.log(process.env);

// Define the path to the Firebase configuration file
const firebaseConfigPath = "firebaseConfig.js";

// Ensure firebaseConfig.js exists
if (!fs.existsSync(firebaseConfigPath)) {
  console.error(
    "firebaseConfig.js file does not exist. Please check the path."
  );
  process.exit(1);
}

// Setup options for replace-in-file
const options = {
  files: firebaseConfigPath,
  from: [
    /__API_KEY__/g,
    /__AUTH_DOMAIN__/g,
    /__DATABASE_URL__/g,
    /__PROJECT_ID__/g,
    /__STORAGE_BUCKET__/g,
    /__MESSAGING_SENDER_ID__/g,
    /__APP_ID__/g,
    /__MEASUREMENT_ID__/g,
  ],
  to: [
    process.env.API_KEY,
    process.env.AUTH_DOMAIN,
    process.env.DATABASE_URL,
    process.env.PROJECT_ID,
    process.env.STORAGE_BUCKET,
    process.env.MESSAGING_SENDER_ID,
    process.env.APP_ID,
    process.env.MEASUREMENT_ID,
  ],
};

// Perform the replacement
console.log(options);
replace(options)
  .then((results) => {
    console.log("Replacement results:", results);
  })
  .catch((error) => {
    console.error("Error occurred:", error);
  });
