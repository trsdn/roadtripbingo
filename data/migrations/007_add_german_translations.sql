-- Migration 007: Add German translation support for AI features
-- This migration adds German name suggestions to the AI analysis table

-- Add German name suggestion column to ai_analysis table
ALTER TABLE ai_analysis ADD COLUMN name_suggestion_de TEXT;

-- Update database version
INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('version', '1.7.0');