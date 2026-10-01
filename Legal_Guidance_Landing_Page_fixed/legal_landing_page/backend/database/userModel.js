const db = require("../db");

// =====================================================
// CREATE USER
// =====================================================

async function createUser(
    fullName,
    email,
    password,
    phone,
    role = "citizen"
) {

    const sql = `
        INSERT INTO users
        (
            full_name,
            email,
            password,
            phone,
            role
        )
        VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(
        sql,
        [
            fullName,
            email,
            password,
            phone,
            role
        ]
    );

    return result;
}


// =====================================================
// FIND USER BY EMAIL
// =====================================================

async function findUserByEmail(email) {

    console.log(
        "Searching email:",
        email
    );

    const sql = `
        SELECT *
        FROM users
        WHERE email = ?
        LIMIT 1
    `;

    const [rows] = await db.query(
        sql,
        [email]
    );

    console.log(
        "Rows found:",
        rows
    );

    return rows[0];
}


// =====================================================
// FIND USER BY ID
// =====================================================

async function findUserById(userId) {

    console.log(
        "Searching user ID:",
        userId
    );

    const sql = `
        SELECT
            id,
            full_name,
            email,
            phone,
            role
        FROM users
        WHERE id = ?
        LIMIT 1
    `;

    const [rows] = await db.query(
        sql,
        [userId]
    );

    console.log(
        "User by ID:",
        rows[0]
    );

    return rows[0];
}


// =====================================================
// UPDATE USER PROFILE
// =====================================================

async function updateUserProfile(
    userId,
    fullName,
    email,
    phone
) {

    console.log(
        "Updating user profile:",
        {
            userId,
            fullName,
            email,
            phone
        }
    );

    const sql = `
        UPDATE users
        SET
            full_name = ?,
            email = ?,
            phone = ?
        WHERE id = ?
    `;

    const [result] = await db.query(
        sql,
        [
            fullName,
            email,
            phone,
            userId
        ]
    );

    console.log(
        "PROFILE UPDATE RESULT:",
        result
    );

    return result;
}


// =====================================================
// EXPORTS
// =====================================================

module.exports = {

    createUser,

    findUserByEmail,

    findUserById,

    updateUserProfile

};