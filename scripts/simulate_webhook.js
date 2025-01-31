const axios = require('axios');
const crypto = require('crypto');

// we need to replace with our actual JWT token obtained from /auth/login
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InBrbGwiLCJpYXQiOjE3MzgzMDk0NjUsImV4cCI6MTczODMxMzA2NX0.YexHHDqbUROZnZ1RTHGBzoXORK-EA75Un5Lh4uYx-9g";  // 🔹 Add the correct token here

// For testing copy the secret key which was generated while calling the subscribe api. (Check the response)
const secret = "f8c12f351f4bf7edf5f942ead7677917bd5bd9f096d64a4c3a1b43636b14b175";  

const webhookUrl = "http://localhost:3000/webhooks/handle";

const payload = {
    sourceUrl: "https://11y14l2hhjhfgggithub.com/webhooks", // replace the sourceUrl which was subscribed while calling the subscribe api
    eventType: "push",
    payload: { repo: "my-project", commit: "abc123" }
};

const payloadString = JSON.stringify(payload);

const computedSignature = crypto.createHmac('sha256', secret)
    .update(payloadString)
    .digest('hex');

async function sendWebhookEvent() {
    try {
        const response = await axios.post(webhookUrl, payload, {
            headers: {
                "Content-Type": "application/json",
                "X-Hub-Signature": `sha256=${computedSignature}`,
                "Authorization": `Bearer ${token}`
            }
        });
        console.log("Webhook successfully sent! Server response:");
        console.log(response.data);
    } catch (error) {
        console.error("Failed to send webhook:");
        console.error(error.response ? error.response.data : error.message);
    }
}

sendWebhookEvent();
