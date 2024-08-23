import { Client, Storage, Databases, Account, Avatars } from "appwrite";
export const appWriteConfig = {
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
  url: import.meta.env.VITE_APPWRITE_URL,
  database: import.meta.env.VITE_APPWRITE_DATABASE_ID,
  storage: import.meta.env.VITE_APPWRITE_STORAGE_ID,
  postCollection: import.meta.env.VITE_APPWRITE_POSTS_COLLECTION_ID,
  saveCollection: import.meta.env.VITE_APPWRITE_SAVES_COLLECTION_ID,
  userCollection: import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID,
};

export const client = new Client()
  .setProject(appWriteConfig.projectId)
  .setEndpoint(appWriteConfig.url);
export const storage = new Storage(client);
export const databases = new Databases(client);
export const account = new Account(client);
export const avatar = new Avatars(client);
