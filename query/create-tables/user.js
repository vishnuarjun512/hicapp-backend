export const createUsersTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100),
        email VARCHAR(255),
        handle VARCHAR(100),
        verified BOOLEAN NOT NULL DEFAULT FALSE,
        password TEXT NOT NULL,
        bio VARCHAR(255),
        profile_pic_url VARCHAR(255),
        is_private BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) 
`;
