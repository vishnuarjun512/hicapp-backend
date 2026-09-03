import readline from "readline";
import pool from "./config/db.js";
import {
  createUsersTableService,
  deleteUsersTableService,
  getAllUsersService,
} from "./services/user.service.js";
import {
  createPostService,
  createPostTableService,
  getPostsByUserIdService,
} from "./services/post.service.js";

import { createFollowTables } from "./services/follow.service.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function main() {
  while (true) {
    console.log(`
=============================
        HICAPP CLI
=============================

1. Create users table
2. List users
3. Delete users table
4. Create posts table
5. Create post
6. Get all posts
7. Exit

=============================
`);

    const choice = await ask("Choose an option: ");

    try {
      switch (choice.trim()) {
        // --------------------------------
        // CREATE TABLE
        // --------------------------------
        case "1":
          await createUsersTableService();
          await createPostTableService();
          await createFollowTables();
          console.log("✅ All tables are ready.");
          break;

        // --------------------------------
        // LIST USERS
        // --------------------------------
        case "2": {
          const users = await getAllUsersService();

          console.log("\nUsers:");

          if (users.length === 0) {
            console.log("No users found.");
          } else {
            console.table(users);
          }

          break;
        }

        // --------------------------------
        // DELETE TABLE
        // --------------------------------
        case "3": {
          console.log("\n⚠️ WARNING: This will delete the entire users table.");

          const confirm = await ask('Type "CONFIRM" to continue: ');

          if (confirm !== "CONFIRM") {
            console.log("❌ Operation cancelled.");
            break;
          }

          await deleteUsersTableService();

          console.log("🗑️ Users table deleted.");
          break;
        }

        // --------------------------------
        // CREATE POST
        // --------------------------------
        case "4": {
          const userId = "a505e7b8-be9e-4cfc-9c68-20cb9ec27f88";
          const content = await ask("Write post content: ");

          const visibility = "public";

          const post = await createPostService(userId, content, visibility);

          console.log("\n✅ Post created:");
          console.log(post);

          break;
        }

        case "5":
          const userId = "a505e7b8-be9e-4cfc-9c68-20cb9ec27f88";
          const posts = await getPostsByUserIdService(userId);
          console.log(posts);
          break;

        // --------------------------------
        // EXIT
        // --------------------------------
        case "7":
          console.log("Goodbye!");
          rl.close();
          await pool.end();
          return;

        // --------------------------------
        // INVALID
        // --------------------------------
        default:
          console.log("❌ Invalid option.");
      }
    } catch (error) {
      console.error("\n❌ ERROR:", error.message);
    }

    console.log("\n");
  }
}

main();
