const express = require('express');
const cors = require('cors'); // Import cors
const app = express();

app.use(cors()); // Use cors middleware
app.use(express.json());

// List of objects
const messages = [
    { id: 'firstname-label', message: 'Message 1', isFinished: false, action: 'click' },
    { id: 'email-label', message: 'Message 2', isFinished: false, action: 'click' },
    { id: 'firstname-label', message: 'Message 1', isFinished: false, action: 'click' },
    { id: 'email-label', message: 'Message 2', isFinished: false, action: 'click' },
    { id: 'firstname-label', message: 'Message 1', isFinished: true, action: 'click' },
];

let requestCount = 0;

// API route
app.post('/api/hello', (req, res) => {
    if (requestCount < messages.length) {
        console.log(`Request count: ${requestCount}`);
        res.json(messages[requestCount]);
        requestCount++;
    } else {
        res.json({ message: 'Hello, world!' });
    }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
