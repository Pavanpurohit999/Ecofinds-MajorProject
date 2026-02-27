const jwt = require("jsonwebtoken");
const asynchandler = require("../utils/asynchandler");
const apiError = require("../utils/apiError");
const Admin = require("../models/Admin.model");

const verifyAdminJWT = asynchandler(async (req, _, next) => {
    try {
        const token =
            req.cookies?.adminAccessToken ||
            req.headers.authorization?.replace("Bearer ", "").trim();

        if (!token) {
            throw new apiError(401, "Admin access token required");
        }

        const secret =
            process.env.ADMIN_JWT_SECRET ||
            process.env.ACCESS_TOKEN_SECRET + "_admin";
        const decoded = jwt.verify(token, secret);

        if (!decoded?.isAdmin) {
            throw new apiError(401, "Not authorized as admin");
        }

        const admin = await Admin.findById(decoded._id).select("-password").lean();

        if (!admin) {
            throw new apiError(401, "Invalid admin token");
        }

        req.admin = admin;
        next();
    } catch (error) {
        throw new apiError(401, `Admin authentication failed: ${error.message}`);
    }
});

module.exports = verifyAdminJWT;
