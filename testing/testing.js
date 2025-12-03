const messages = require("./sample_data");
const axios = require("axios");

async function runTests() {
  try {
    for (let message of messages) {
      try {
        const response = await axios.post(
          "http://localhost:8000/analyze_ui",
          message
        );
        console.log(response.data);
        // Handle the response data as needed
      } catch (error) {
        console.error("Error with message:", message);
        console.error("Error:", error.message);
      }
    }
  } catch (error) {
    console.error("Fatal error:", error.message);
  }
}

runTests();
