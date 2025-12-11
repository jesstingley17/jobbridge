# Community Management System Setup

## Overview

The JobBridge now includes a comprehensive community management system inspired by UNA, featuring:

- **Social Feed**: Post updates, share thoughts, and engage with the community
- **Groups**: Join or create groups based on interests, industries, or disability types
- **Forums**: Discussion boards for topics like career advice, job seeking, and accessibility
- **Events**: Create and register for networking events, workshops, and webinars
- **Mentors**: Connect with mentors (existing feature)
- **Activity Feed**: Track community activity
- **Notifications**: Get notified about interactions and updates

## Database Migration

To set up the community features, you need to run the database migration:

### Option 1: Using Drizzle Kit (Recommended)

```bash
npm run db:push
```

This will automatically generate and apply migrations based on the schema in `shared/schema.ts`.

### Option 2: Manual SQL Migration

If you prefer to run the SQL directly:

```bash
# Connect to your PostgreSQL database and run:
psql $DATABASE_URL -f migrations/create_community_tables.sql
```

Or if using a database client, copy and paste the contents of `migrations/create_community_tables.sql`.

## Features

### 1. Community Feed (`/community` - Feed tab)

- View all community posts in a social media-style feed
- Create new posts with text and optional media
- Like and comment on posts
- Tag posts for better discoverability

### 2. Groups (`/community` - Groups tab)

- Browse available community groups
- Join groups based on interests
- Create new groups (coming soon)
- View group posts and members

### 3. Events (`/community` - Events tab)

- View upcoming community events
- Register for events
- Create new events (coming soon)
- Filter by event type (networking, workshop, webinar, etc.)

### 4. Forums (Coming Soon)

- Discussion boards for specific topics
- Create topics and replies
- Mark solutions for Q&A-style forums

### 5. Activity Feed

- Track community activity
- See what others are doing
- Stay engaged with the community

### 6. Notifications

- Get notified about:
  - Post likes and comments
  - Group invitations
  - Event reminders
  - Connection requests

## API Endpoints

All community endpoints require authentication (`isAuthenticated` middleware).

### Posts
- `GET /api/community/posts` - Get all posts (with optional filters)
- `GET /api/community/posts/:id` - Get a specific post
- `POST /api/community/posts` - Create a new post
- `PUT /api/community/posts/:id` - Update a post (author only)
- `DELETE /api/community/posts/:id` - Delete a post (author only)

### Comments
- `GET /api/community/posts/:postId/comments` - Get comments for a post
- `POST /api/community/posts/:postId/comments` - Add a comment
- `DELETE /api/community/comments/:id` - Delete a comment (author only)

### Reactions
- `POST /api/community/posts/:postId/reactions` - Toggle like/reaction

### Groups
- `GET /api/community/groups` - Get all groups
- `GET /api/community/groups/:id` - Get a specific group
- `POST /api/community/groups` - Create a new group
- `POST /api/community/groups/:id/join` - Join a group
- `POST /api/community/groups/:id/leave` - Leave a group

### Events
- `GET /api/community/events` - Get all events (upcoming by default)
- `GET /api/community/events/:id` - Get a specific event
- `POST /api/community/events` - Create a new event
- `POST /api/community/events/:id/register` - Register for an event
- `POST /api/community/events/:id/unregister` - Unregister from an event

### Forums
- `GET /api/community/forums` - Get all forums
- `GET /api/community/forums/:id/topics` - Get topics in a forum
- `GET /api/community/topics/:id` - Get a specific topic
- `POST /api/community/forums/:forumId/topics` - Create a new topic
- `GET /api/community/topics/:topicId/replies` - Get replies for a topic
- `POST /api/community/topics/:topicId/replies` - Add a reply

### Activity & Notifications
- `GET /api/community/activity` - Get activity feed
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/:id/read` - Mark notification as read
- `POST /api/notifications/read-all` - Mark all notifications as read

## Database Schema

The community system uses the following tables:

- `community_posts` - Main posts/feed content
- `post_comments` - Comments on posts
- `post_reactions` - Likes/reactions
- `community_groups` - Groups
- `group_members` - Group membership
- `forums` - Discussion forums
- `forum_topics` - Discussion topics
- `forum_replies` - Replies to topics
- `community_events` - Events
- `event_attendees` - Event registrations
- `activity_feed` - Activity stream
- `notifications` - User notifications

## Next Steps

1. **Run the migration** to create the database tables
2. **Test the features** by creating posts, joining groups, and registering for events
3. **Customize** the UI components in `client/src/components/community/`
4. **Add more features** like:
   - Group creation UI
   - Event creation UI
   - Forum UI components
   - Real-time notifications
   - Search functionality
   - Media upload for posts

## Notes

- All community features respect user authentication
- Posts can be public or private
- Groups can be public or private
- Events can require registration or be open
- Activity feed tracks public activities
- Notifications are user-specific

For questions or issues, check the code in:
- `shared/schema.ts` - Database schema
- `server/storage.ts` - Database operations
- `server/routes.ts` - API routes
- `client/src/components/community/` - React components
- `client/src/pages/community.tsx` - Main community page

