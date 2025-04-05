const express = require("express");
const cors = require("cors"); // Import cors
const app = express();

app.use(cors()); // Use cors middleware
// Increase JSON payload size limit to 50mb
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// List of objects
const messages = [
  {
    id: "firstname-label",
    message: "Message 1",
    isFinished: false,
    action: "click",
  },
  {
    id: "email-label",
    message: "Message 2",
    isFinished: false,
    action: "click",
  },
  {
    id: "firstname-label",
    message: "Message 1",
    isFinished: false,
    action: "click",
  },
  {
    id: "email-label",
    message: "Message 2",
    isFinished: false,
    action: "click",
  },
  {
    id: "firstname-label",
    message: "Message 1",
    isFinished: true,
    action: "click",
  },
];

let requestCount = 0;

// API route
app.post("/api/hello", (req, res) => {
  const message = messages[requestCount % messages.length]; // Loop through messages
  console.log(`Request count: ${requestCount}`);
  res.json(message);
  requestCount++;
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
