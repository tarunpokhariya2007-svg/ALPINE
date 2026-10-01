const pool = require("../db");

// Save a message
async function createMessage(conversationId, sender, message) {
  const [result] = await pool.execute(
    `
    INSERT INTO messages (conversation_id, sender, message)
    VALUES (?, ?, ?)
    `,
    [conversationId, sender, message]
  );

  return result.insertId;
}

// Get all messages of a conversation
async function getMessages(conversationId) {
  const [rows] = await pool.execute(
    `
    SELECT id, conversation_id, sender, message, created_at
    FROM messages
    WHERE conversation_id = ?
    ORDER BY created_at ASC, id ASC
    `,
    [conversationId]
  );

  return rows;
}

module.exports = {
  createMessage,
  getMessages,
};