console.log("******** PROFILE ROUTES FILE LOADED ********");
const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
    findUserById,
    findUserByEmail,
    updateUserProfile
} = require("../database/userModel");

const router = express.Router();


// =====================================================
// GET CURRENT USER PROFILE
// GET /api/profile
// =====================================================

router.get(
    "/",
    authMiddleware,
    async (req, res) => {

        try {

            const userId = req.user.id;

            console.log(
                "GET PROFILE USER ID:",
                userId
            );

            const user =
                await findUserById(userId);

            if (!user) {

                return res.status(404).json({
                    success: false,
                    message: "User not found"
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
                    "Failed to load profile"
            });
        }
    }
);


// =====================================================
// UPDATE CURRENT USER PROFILE
// PUT /api/profile
// =====================================================

router.put(
    "/",
    authMiddleware,
    async (req, res) => {

        try {

            const userId =
                req.user.id;

            let {
                fullName,
                email,
                phone
            } = req.body;


            // -----------------------------------------
            // CLEAN VALUES
            // -----------------------------------------

            fullName =
                String(fullName || "")
                    .trim();

            email =
                String(email || "")
                    .trim()
                    .toLowerCase();

            phone =
                String(phone || "")
                    .trim();


            console.log(
                "UPDATE PROFILE:",
                {
                    userId,
                    fullName,
                    email,
                    phone
                }
            );


            // -----------------------------------------
            // VALIDATION
            // -----------------------------------------

            if (!fullName) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Full name is required"
                });

            }


            if (!email) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Email is required"
                });

            }


            // -----------------------------------------
            // CHECK EMAIL
            // -----------------------------------------

            const existingUser =
                await findUserByEmail(email);


            if (
                existingUser &&
                Number(existingUser.id) !==
                Number(userId)
            ) {

                return res.status(409).json({
                    success: false,
                    message:
                        "This email is already registered"
                });

            }


            // -----------------------------------------
            // UPDATE DATABASE
            // -----------------------------------------

            const result =
                await updateUserProfile(
                    userId,
                    fullName,
                    email,
                    phone
                );


            console.log(
                "UPDATE RESULT:",
                result
            );


            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({
                    success: false,
                    message:
                        "User not found"
                });

            }


            // -----------------------------------------
            // GET UPDATED USER
            // -----------------------------------------

            const updatedUser =
                await findUserById(
                    userId
                );


            if (!updatedUser) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Updated user could not be found"
                });

            }


            // -----------------------------------------
            // RESPONSE
            // -----------------------------------------

            res.json({

                success: true,

                message:
                    "Profile updated successfully",

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
                        "This email is already registered"
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

// =====================================================
// PROFILE ROUTE TEST
// GET /api/profile/test
// =====================================================

router.get(
    "/test",
    (req, res) => {

        res.json({
            success: true,
            message: "Profile routes are working"
        });

    }
);
module.exports = router;