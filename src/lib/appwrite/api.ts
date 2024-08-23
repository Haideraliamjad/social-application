import { INewUser } from "@/types";
import { account, databases } from "./config";
import { ID, Query } from "appwrite";
import { avatar } from "./config";
import { appWriteConfig } from "./config";
export async function createUserAccount(user: INewUser) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      user.email,
      user.password,
      user.name
    );
    if (!newAccount) throw Error;
    const avatarUrl = avatar.getInitials(user.name)!;
    const newUser = await saveUserToDb({
      accountId: newAccount.$id,
      name: newAccount.name,
      email: newAccount.email,
      username: user.username,
      imageUrl: avatarUrl,
    });
    return newUser;
  } catch (error) {
    console.error(error);
    return error;
  }
}

export async function saveUserToDb(user: {
  accountId: string;
  name: string;
  email: string;
  imageUrl: string;
  username: string;
}) {
  try {
    const newUser = await databases.createDocument(
      appWriteConfig.database,
      appWriteConfig.userCollection,
      ID.unique(),
      user
    );
    return newUser;
  } catch (error) {
    console.error(error);
  }
}

export async function signInAccount(user: { email: string; password: string }) {
  try {
    const session = await account.createEmailPasswordSession(
      user.email,
      user.password
    );
    return session;
  } catch (error) {
    console.error(error);
  }
}

export async function getCurrentUser() {
  try {
    const currentAccount = await account.get();
    if (!createUserAccount) throw Error;
    const currentUser = await databases.listDocuments(
      appWriteConfig.database,
      appWriteConfig.userCollection,
      [Query.equal("accountId", currentAccount.$id)]
    );
    if (!currentUser) throw Error;
    return currentUser.documents[0];
  } catch (error) {
    console.error(error);
  }
}
