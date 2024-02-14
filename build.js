const dotenv = require("dotenv");
const replace = require("replace-in-file");

dotenv.config();

const options = {
  files: "firebaseConfig.js",
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

replace(options)
  .then((results) => {
    console.log("Replacement results:", results);
  })
  .catch((error) => {
    console.error("Error occurred:", error);
  });
