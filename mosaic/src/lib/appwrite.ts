import { Client, TablesDB, Account, Storage } from 'appwrite';

// Initialize the Appwrite client
const client = new Client();

client
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT) // Your Appwrite Endpoint
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID); // Your project ID

// Initialize Appwrite services
export const account = new Account(client);
export const tablesDB = new TablesDB(client);
export const storage = new Storage(client);

// Export the client for advanced usage
export { client };

// Export configuration constants
export const appwriteConfig = {
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
  storageId: import.meta.env.VITE_APPWRITE_STORAGE_ID,
  notesTableId: import.meta.env.VITE_APPWRITE_NOTES_COLLECTION_ID,
};

export default client;
