import readline from "readline";
import pool from "./config/db.js";
import {
  createUserService,
  createUsersTable,
  deleteUserByEmail,
  deleteUsersTable,
  getUsersService,
} from "./services/user.service.js";

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
2. Create user
3. List users
4. Delete user by name
5. Delete users table
6. Exit

=============================
`);

    const choice = await ask("Choose an option: ");

    try {
      switch (choice.trim()) {
        // --------------------------------
        // CREATE TABLE
        // --------------------------------
        case "1":
          await createUsersTable();
          console.log("✅ Users table is ready.");
          break;

        // --------------------------------
        // CREATE USER
        // --------------------------------
        case "2": {
          const name = await ask("Name: ");
          const email = await ask("Email: ");
          const password = await ask("Password: ");

          const user = await createUserService(name, email, password);

          console.log("\n✅ User created:");
          console.log(user);
          break;
        }

        // --------------------------------
        // LIST USERS
        // --------------------------------
        case "3": {
          const users = await getUsersService();

          console.log("\nUsers:");

          if (users.length === 0) {
            console.log("No users found.");
          } else {
            console.table(users);
          }

          break;
        }

        // --------------------------------
        // DELETE USER
        // --------------------------------
        case "4": {
          const name = await ask("Enter user's name: ");

          const confirm = await ask(
            `Are you sure you want to delete "${name}"? (y/n): `,
          );

          if (confirm.toLowerCase() !== "y") {
            console.log("❌ Delete cancelled.");
            break;
          }

          const deletedUser = await deleteUserByEmail(name);

          if (!deletedUser) {
            console.log(`❌ No user found with name "${name}".`);
          } else {
            console.log("✅ User deleted:");
            console.log(deletedUser);
          }

          break;
        }

        // --------------------------------
        // DELETE TABLE
        // --------------------------------
        case "5": {
          console.log("\n⚠️ WARNING: This will delete the entire users table.");

          const confirm = await ask('Type "DELETE USERS TABLE" to continue: ');

          if (confirm !== "DELETE USERS TABLE") {
            console.log("❌ Operation cancelled.");
            break;
          }

          await deleteUsersTable();

          console.log("🗑️ Users table deleted.");
          break;
        }

        // --------------------------------
        // EXIT
        // --------------------------------
        case "6":
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
