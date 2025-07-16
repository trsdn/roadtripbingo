-- Migration 006: Add AI-powered features support
-- This migration adds tables for AI analysis, duplicate detection, and content suggestions

-- AI analysis results for icons
CREATE TABLE IF NOT EXISTS ai_analysis (
    icon_id TEXT PRIMARY KEY,
    category_suggestion TEXT,
    tags_suggestion TEXT, -- JSON array of suggested tags
    difficulty_suggestion INTEGER,
    name_suggestion TEXT,
    description_suggestion TEXT,
    confidence_score REAL,
    analysis_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    ai_model TEXT, -- 'gpt-4o' or 'gpt-4o-mini'
    analysis_version INTEGER DEFAULT 1,
    FOREIGN KEY (icon_id) REFERENCES icons(id) ON DELETE CASCADE
);

-- Duplicate detection groups
CREATE TABLE IF NOT EXISTS duplicate_groups (
    id TEXT PRIMARY KEY,
    group_type TEXT, -- 'visual', 'semantic', 'exact'
    similarity_score REAL,
    detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolution_status TEXT DEFAULT 'pending', -- 'pending', 'resolved', 'ignored'
    resolution_action TEXT, -- 'merged', 'kept_separate', 'deleted'
    resolved_at DATETIME,
    resolved_by TEXT
);

-- Members of duplicate groups
CREATE TABLE IF NOT EXISTS duplicate_group_members (
    group_id TEXT,
    icon_id TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    similarity_details TEXT, -- JSON with specific similarity metrics
    PRIMARY KEY (group_id, icon_id),
    FOREIGN KEY (group_id) REFERENCES duplicate_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (icon_id) REFERENCES icons(id) ON DELETE CASCADE
);

-- AI-generated content suggestions
CREATE TABLE IF NOT EXISTS ai_suggestions (
    id TEXT PRIMARY KEY,
    suggestion_type TEXT, -- 'missing_content', 'set_optimization', 'theme_suggestion'
    target_set TEXT, -- Which icon set this suggestion applies to
    suggestion_data TEXT, -- JSON with detailed suggestion content
    confidence_score REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    applied BOOLEAN DEFAULT FALSE,
    applied_at DATETIME,
    ai_model TEXT
);

-- Cache for AI API responses to reduce costs
CREATE TABLE IF NOT EXISTS ai_cache (
    cache_key TEXT PRIMARY KEY,
    request_type TEXT, -- 'analyze_icon', 'detect_duplicates', 'suggest_content'
    request_data TEXT, -- JSON of the request parameters
    response_data TEXT, -- JSON of the API response
    ai_model TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    hit_count INTEGER DEFAULT 0
);

-- User AI preferences
CREATE TABLE IF NOT EXISTS ai_preferences (
    user_id TEXT PRIMARY KEY DEFAULT 'default',
    enabled BOOLEAN DEFAULT TRUE,
    auto_apply_suggestions BOOLEAN DEFAULT FALSE,
    preferred_model TEXT DEFAULT 'gpt-4o-mini', -- 'gpt-4o' or 'gpt-4o-mini'
    duplicate_detection_sensitivity REAL DEFAULT 0.8, -- 0.0 to 1.0
    suggestion_aggressiveness TEXT DEFAULT 'moderate', -- 'conservative', 'moderate', 'aggressive'
    monthly_usage_limit INTEGER DEFAULT 1000, -- API calls per month
    current_month_usage INTEGER DEFAULT 0,
    usage_reset_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_analysis_date ON ai_analysis(analysis_date);
CREATE INDEX IF NOT EXISTS idx_duplicate_groups_status ON duplicate_groups(resolution_status);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_type ON ai_suggestions(suggestion_type, applied);
CREATE INDEX IF NOT EXISTS idx_ai_cache_expires ON ai_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_ai_cache_type ON ai_cache(request_type, cache_key);

-- Initial AI preferences
INSERT OR IGNORE INTO ai_preferences (user_id) VALUES ('default');