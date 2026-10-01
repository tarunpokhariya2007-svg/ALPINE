const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const authMiddleware = require("../middleware/authMiddleware");

const {
    createUser,
    findUserByEmail,
    findUserById,
    updateUserProfile
} = require("../database/userModel");

const router = express.Router();

const JWT_SECRET = "nyaya_secret_key";


// =====================================================
// SIGNUP
// =====================================================

router.post("/signup", async (req, res) => {

    try {

        const {
            fullName,
            email,
            password,
            phone,
            role
        } = req.body;


        if (!fullName || !email || !password) {

            return res.status(400).json({
                success: false,
                message:
                    "Full name, email and password are required."
            });

        }


        const existingUser =
            await findUserByEmail(email.trim());


        if (existingUser) {

            return res.status(409).json({
                success: false,
                message:
                    "Email already registered."
            });

        }


        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        const userRole =
            role === "lawyer"
                ? "lawyer"
                : "citizen";


        const result =
            await createUser(
                fullName.trim(),
                email.trim(),
                hashedPassword,
                phone ? phone.trim() : "",
                userRole
            );


        res.status(201).json({

            success: true,

            message:
                "Signup Successful",

            user: {
                id: result.insertId,
                fullName: fullName.trim(),
                email: email.trim(),
                phone: phone ? phone.trim() : "",
                role: userRole
            }

        });

    } catch (err) {

        console.error(
            "SIGNUP ERROR:",
            err
        );

        res.status(500).json({

            success: false,

            message:
                err.message ||
                "Signup failed"

        });

    }

});


// =====================================================
// LOGIN
// =====================================================

router.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message:
                    "Email and password are required."

            });

        }


        const user =
            await findUserByEmail(
                email.trim()
            );


        if (!user) {

            return res.status(401).json({

                success: false,

                message:
                    "User not found"

            });

        }


        const valid =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!valid) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid password"

            });

        }


        const token =
            jwt.sign(

                {
                    id: user.id,
                    email: user.email,
                    role: user.role
                },

                JWT_SECRET,

                {
                    expiresIn: "7d"
                }

            );


        res.json({

            success: true,

            token,

            user: {

                id: user.id,

                fullName:
                    user.full_name,

                email:
                    user.email,

                phone:
                    user.phone || "",

                role:
                    user.role

            }

        });

    } catch (err) {

        console.error(
            "LOGIN ERROR:",
            err
        );

        res.status(500).json({

            success: false,

            message:
                err.message ||
                "Login failed"

        });

    }

});


// =====================================================
// GET CURRENT USER PROFILE
// GET /api/auth/profile
// =====================================================

router.get(
    "/profile",
    authMiddleware,
    async (req, res) => {

        try {

            const user =
                await findUserById(
                    req.user.id
                );


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found"

                });

            }


            res.json({

                success: true,

                user: {

                    id: user.id,

                    fullName:
                        user.full_name,

                    email:
                        user.email,

                    phone:
                        user.phone || "",

                    role:
                        user.role

                }

            });

        } catch (err) {

            console.error(
                "GET PROFILE ERROR:",
                err
            );

            res.status(500).json({

                success: false,

                message:
                    err.message ||
                    "Failed to load profile"

            });

        }

    }
);


// =====================================================
// UPDATE CURRENT USER PROFILE
// PUT /api/auth/profile
// =====================================================

router.put(
    "/profile",
    authMiddleware,
    async (req, res) => {

        try {

            const {
                fullName,
                email,
                phone
            } = req.body;


            // ---------------------------------------------
            // VALIDATION
            // ---------------------------------------------

            if (!fullName || !fullName.trim()) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Full name is required."

                });

            }


            if (!email || !email.trim()) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Email is required."

                });

            }


            const cleanName =
                fullName.trim();

            const cleanEmail =
                email.trim();

            const cleanPhone =
                phone
                    ? phone.trim()
                    : "";


            // ---------------------------------------------
            // CHECK EMAIL
            // ---------------------------------------------

            const existingUser =
                await findUserByEmail(
                    cleanEmail
                );


            if (
                existingUser &&
                Number(existingUser.id) !==
                Number(req.user.id)
            ) {

                return res.status(409).json({

                    success: false,

                    message:
                        "This email is already registered by another user."

                });

            }


            // ---------------------------------------------
            // UPDATE MYSQL
            // ---------------------------------------------

            const result =
                await updateUserProfile(

                    req.user.id,

                    cleanName,

                    cleanEmail,

                    cleanPhone

                );


            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found or no changes were made."

                });

            }


            // ---------------------------------------------
            // GET UPDATED USER
            // ---------------------------------------------

            const updatedUser =
                await findUserById(
                    req.user.id
                );


            // ---------------------------------------------
            // RESPONSE
            // ---------------------------------------------

            res.json({

                success: true,

                message:
                    "Profile updated successfully.",

                user: {

                    id:
                        updatedUser.id,

                    fullName:
                        updatedUser.full_name,

                    email:
                        updatedUser.email,

                    phone:
                        updatedUser.phone || "",

                    role:
                        updatedUser.role

                }

            });

        } catch (err) {

            console.error(
                "UPDATE PROFILE ERROR:",
                err
            );


            // MySQL duplicate email
            if (
                err.code ===
                "ER_DUP_ENTRY"
            ) {

                return res.status(409).json({

                    success: false,

                    message:
                        "This email is already registered."

                });

            }


            res.status(500).json({

                success: false,

                message:
                    err.message ||
                    "Failed to update profile"

            });

        }

    }
);


module.exports = router;