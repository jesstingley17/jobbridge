-- Community Management System Tables
-- Migration: Create all community-related tables

-- Community Posts (social feed)
CREATE TABLE IF NOT EXISTS community_posts (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id VARCHAR NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  media_urls TEXT[],
  post_type VARCHAR DEFAULT 'post',
  group_id VARCHAR REFERENCES community_groups(id) ON DELETE SET NULL,
  forum_id VARCHAR REFERENCES forums(id) ON DELETE SET NULL,
  is_pinned BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  tags TEXT[],
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_posts_author ON community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_group ON community_posts(group_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created ON community_posts(created_at DESC);

-- Post Comments
CREATE TABLE IF NOT EXISTS post_comments (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id VARCHAR NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  author_id VARCHAR NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  parent_comment_id VARCHAR REFERENCES post_comments(id) ON DELETE CASCADE,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_comments_post ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_author ON post_comments(author_id);

-- Post Reactions (likes, etc.)
CREATE TABLE IF NOT EXISTS post_reactions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id VARCHAR NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  reaction_type VARCHAR DEFAULT 'like',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_reactions_post ON post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_user ON post_reactions(user_id);

-- Community Groups
CREATE TABLE IF NOT EXISTS community_groups (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  slug VARCHAR NOT NULL UNIQUE,
  cover_image_url TEXT,
  avatar_url TEXT,
  owner_id VARCHAR NOT NULL REFERENCES users(id),
  category VARCHAR,
  is_public BOOLEAN DEFAULT true,
  is_private BOOLEAN DEFAULT false,
  members_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  rules TEXT,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_groups_owner ON community_groups(owner_id);
CREATE INDEX IF NOT EXISTS idx_community_groups_category ON community_groups(category);
CREATE INDEX IF NOT EXISTS idx_community_groups_slug ON community_groups(slug);

-- Group Members
CREATE TABLE IF NOT EXISTS group_members (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id VARCHAR NOT NULL REFERENCES community_groups(id) ON DELETE CASCADE,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  role VARCHAR DEFAULT 'member',
  status VARCHAR DEFAULT 'active',
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id);

-- Forums (Discussion Boards)
CREATE TABLE IF NOT EXISTS forums (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  slug VARCHAR NOT NULL UNIQUE,
  category VARCHAR,
  icon VARCHAR,
  is_public BOOLEAN DEFAULT true,
  topics_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  last_post_at TIMESTAMP,
  last_post_by VARCHAR REFERENCES users(id),
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forums_order ON forums("order");

-- Forum Topics (Discussion Threads)
CREATE TABLE IF NOT EXISTS forum_topics (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  forum_id VARCHAR NOT NULL REFERENCES forums(id) ON DELETE CASCADE,
  author_id VARCHAR NOT NULL REFERENCES users(id),
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  slug VARCHAR NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  last_reply_at TIMESTAMP,
  last_reply_by VARCHAR REFERENCES users(id),
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forum_topics_forum ON forum_topics(forum_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_author ON forum_topics(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_created ON forum_topics(created_at DESC);

-- Forum Replies
CREATE TABLE IF NOT EXISTS forum_replies (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id VARCHAR NOT NULL REFERENCES forum_topics(id) ON DELETE CASCADE,
  author_id VARCHAR NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  parent_reply_id VARCHAR REFERENCES forum_replies(id) ON DELETE CASCADE,
  likes_count INTEGER DEFAULT 0,
  is_solution BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forum_replies_topic ON forum_replies(topic_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_author ON forum_replies(author_id);

-- Community Events
CREATE TABLE IF NOT EXISTS community_events (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id VARCHAR NOT NULL REFERENCES users(id),
  title VARCHAR NOT NULL,
  description TEXT,
  slug VARCHAR NOT NULL UNIQUE,
  event_type VARCHAR,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  location TEXT,
  location_url TEXT,
  cover_image_url TEXT,
  is_online BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  max_attendees INTEGER,
  attendees_count INTEGER DEFAULT 0,
  registration_required BOOLEAN DEFAULT false,
  registration_url TEXT,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_events_organizer ON community_events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_community_events_start ON community_events(start_date);
CREATE INDEX IF NOT EXISTS idx_community_events_slug ON community_events(slug);

-- Event Attendees
CREATE TABLE IF NOT EXISTS event_attendees (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id VARCHAR NOT NULL REFERENCES community_events(id) ON DELETE CASCADE,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  status VARCHAR DEFAULT 'registered',
  registered_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_attendees_event ON event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_user ON event_attendees(user_id);

-- Activity Feed (user activity stream)
CREATE TABLE IF NOT EXISTS activity_feed (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  activity_type VARCHAR NOT NULL,
  target_type VARCHAR,
  target_id VARCHAR,
  metadata JSONB,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_feed_user ON activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_created ON activity_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_feed_public ON activity_feed(is_public, created_at DESC);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id),
  type VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);


