-- =====================================================
-- Migration: add file_size to documents table
--
-- This is applied automatically and idempotently at
-- backend startup by database/documentModel.js
-- (ensureDocumentStorageSupport). This file is provided
-- for manual reference / running by hand against Railway
-- MySQL if you ever need to.
--
-- Safe to run multiple times: check first, only ALTER if
-- the column doesn't already exist. Does NOT drop or
-- modify any existing data.
-- =====================================================

ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS file_size BIGINT NOT NULL DEFAULT 0;

-- Existing rows (uploaded before this migration) will get
-- file_size = 0 by default, since their real historical
-- size was never recorded. They will not count against a
-- user's 50 MB quota until re-uploaded.
