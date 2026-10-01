const jwt = require("jsonwebtoken");

const JWT_SECRET = "nyaya_secret_key";

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    console.log("Authorization Header:", authHeader);

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "No token"
        });
    }

    const token = authHeader.split(" ")[1];

    console.log("Token:", token);

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        console.log("Decoded:", decoded);

        req.user = decoded;
        next();

    } catch (err) {
        console.log("JWT ERROR:", err.message);

        return res.status(401).json({
            success: false,
            message: err.message
        });
    }
}

module.exports = authMiddleware;