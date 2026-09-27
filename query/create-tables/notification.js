export const createNotificationTable = () => {
  ` CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        recipient_id UUID NOT NULL,
        actor_id UUID NOT NULL,

        type TEXT NOT NULL,

        post_id UUID,
        comment_id UUID,
        friend_request_id UUID,

        is_read BOOLEAN NOT NULL DEFAULT FALSE,

        created_at TIMESTAMP NOT NULL DEFAULT NOW(),

        CONSTRAINT fk_notifications_recipient
            FOREIGN KEY (recipient_id)
            REFERENCES users(id)
            ON DELETE CASCADE,

        CONSTRAINT fk_notifications_actor
            FOREIGN KEY (actor_id)
            REFERENCES users(id)
            ON DELETE CASCADE,

        CONSTRAINT fk_notifications_post
            FOREIGN KEY (post_id)
            REFERENCES posts(id)
            ON DELETE CASCADE,

        CONSTRAINT fk_notifications_comment
            FOREIGN KEY (comment_id)
            REFERENCES comments(id)
            ON DELETE CASCADE,

        CONSTRAINT fk_notifications_friend_request
            FOREIGN KEY (friend_request_id)
            REFERENCES friend_requests(id)
            ON DELETE CASCADE
    );`;
};

export const createIndexesForNotificationTableQuery = () => {
  `CREATE INDEX idx_notifications_recipient_created
        ON notifications (recipient_id, created_at DESC);
    
    CREATE INDEX idx_notifications_recipient_unread
        ON notifications (recipient_id, is_read)
        WHERE is_read = FALSE;`;
};
