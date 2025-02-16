// /api/hello.js
export default async function handler(req, res) {
    console.log("Hello endpoint triggered");
    res.status(200).json({ message: "Hello, world!" });
  }
  