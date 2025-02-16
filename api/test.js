// /api/test.js
export default async function handler(req, res) {
    console.log("Test endpoint triggered");
    res.status(200).json({ message: "Hello from the test endpoint!" });
  }
  