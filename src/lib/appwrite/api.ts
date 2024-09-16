import { INewUser, INewPost, IUpdatePost, IUpdateUser } from "@/types";
import { account, databases } from "./config";
import { ID, ImageGravity, Query } from "appwrite";
import { avatar } from "./config";
import { appWriteConfig, storage } from "./config";

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
  imageUrl: URL;
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
    console.log(currentAccount);
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

export async function signOutAccount() {
  try {
    const session = await account.deleteSession("current");
    return session;
  } catch (error) {
    console.error(error);
  }
}

export async function createPost(post: INewPost) {
  try {
    // Upload file to appwrite storage
    const uploadedFile = await uploadFile(post.file[0]);

    if (!uploadedFile) throw Error;

    // Get file url
    const fileUrl = getFilePreview(uploadedFile.$id);
    if (!fileUrl) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    // Create post
    const newPost = await databases.createDocument(
      appWriteConfig.database,
      appWriteConfig.postCollection,
      ID.unique(),
      {
        creator: post.userId,
        caption: post.caption,
        imageUrl: fileUrl,
        imageId: uploadedFile.$id,
        location: post.location,
        tags: tags,
      }
    );

    if (!newPost) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    return newPost;
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPLOAD FILE
export async function uploadFile(file: File) {
  try {
    const uploadedFile = await storage.createFile(
      appWriteConfig.storage,
      ID.unique(),
      file
    );

    return uploadedFile;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET FILE URL

export function getFilePreview(fileId: string) {
  try {
    const fileUrl = storage.getFilePreview(
      appWriteConfig.storage,
      fileId,
      2000,
      2000,
      "top" as ImageGravity,
      100
    );

    if (!fileUrl) throw Error;

    return fileUrl;
  } catch (error) {
    console.log(error);
  }
}

export async function deleteFile(fileId: string) {
  try {
    await storage.deleteFile(appWriteConfig.storage, fileId);

    return { status: "ok" };
  } catch (error) {
    console.log(error);
  }
}

export async function getRecentPosts() {
  try {
    const posts = await databases.listDocuments(
      appWriteConfig.database,
      appWriteConfig.postCollection,
      [Query.orderDesc("$createdAt"), Query.limit(20)]
    );
    if (!posts) throw Error;
    return posts;
  } catch (error) {
    console.error(error);
  }
}

export async function likePost(postId: string, likesArray: string[]) {
  try {
    const updatedPost = await databases.updateDocument(
      appWriteConfig.database,
      appWriteConfig.postCollection,
      postId,
      {
        likes: likesArray,
      }
    );
    if (!updatedPost) throw Error;
    return updatedPost;
  } catch (error) {
    console.error(error);
  }
}

export async function savePost(postId: string, userId: string) {
  try {
    console.log("I am here");
    const updatedPost = await databases.createDocument(
      appWriteConfig.database,
      appWriteConfig.saveCollection,
      ID.unique(),
      {
        users: userId,
        post: postId,
      }
    );
    if (!updatedPost) throw Error;
    return updatedPost;
  } catch (error) {
    console.error(error);
  }
}

export async function deleteSavedPost(saveRecordId: string) {
  try {
    const statusCode = await databases.deleteDocument(
      appWriteConfig.database,
      appWriteConfig.saveCollection,
      saveRecordId
    );
    if (!statusCode) throw Error;
    return statusCode;
  } catch (error) {
    console.error(error);
  }
}

export async function getPostById(postId: string) {
  try {
    const post = await databases.getDocument(
      appWriteConfig.database,
      appWriteConfig.postCollection,
      postId
    );
    return post;
  } catch (error) {
    console.error(error);
  }
}

export async function updatePost(post: IUpdatePost) {
  try {
    const hasImageToUpdate = post.file.length > 0;

    let image = {
      postUrl: post.imageUrl,
      imageId: post.imageId,
    };

    if (hasImageToUpdate) {
      const uploadedFile = await uploadFile(post.file[0]);
      // Upload file to appwrite storage
      if (!uploadedFile) throw Error;
      // Get file url
      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }
      image = { ...image, postUrl: fileUrl, imageId: uploadedFile.$id };
    }

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    // update Post
    const updatedPost = await databases.updateDocument(
      appWriteConfig.database,
      appWriteConfig.postCollection,
      post.postId,
      {
        caption: post.caption,
        imageUrl: image.postUrl,
        imageId: image.imageId,
        location: post.location,
        tags: tags,
      }
    );

    if (!updatedPost) {
      await deleteFile(post.imageId);
      throw Error;
    }

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

export async function deletePost(postId: string, imageId: string) {
  if (!postId || !imageId) {
    throw Error;
  }
  try {
    await databases.deleteDocument(
      appWriteConfig.database,
      appWriteConfig.postCollection,
      postId
    );
    await storage.deleteFile(appWriteConfig.storage, imageId);
  } catch (error) {
    console.error(error);
  }
}

export async function getUserPosts(userId?: string) {
  if (!userId) return;

  try {
    const post = await databases.listDocuments(
      appWriteConfig.database,
      appWriteConfig.postCollection[
        (Query.equal("creator", userId), Query.orderDesc("$createdAt"))
      ]
    );

    if (!post) throw Error;

    return post;
  } catch (error) {
    console.log(error);
  }
}

export async function getInfinitePosts({ pageParam }: { pageParam: number }) {
  const quires = [Query.orderDesc("$updatedAt"), Query.limit(10)];

  if (pageParam) {
    quires.push(Query.cursorAfter(pageParam.toString()));
  }
  try {
    const post = await databases.listDocuments(
      appWriteConfig.database,
      appWriteConfig.postCollection,
      quires
    );
    if (!post) throw Error;
    return post;
  } catch (error) {
    console.error(error);
  }
}

export async function searchPosts(searchTerm: string) {
  try {
    const post = await databases.listDocuments(
      appWriteConfig.database,
      appWriteConfig.postCollection,
      [Query.search("caption", searchTerm)]
    );
    if (!post) throw Error;
    return post;
  } catch (error) {
    console.error(error);
  }
}

export async function getUsers(limit?: number) {
  const queries = [Query.orderDesc("$createdAt")];
  if (limit) {
    queries.push(Query.limit(limit));
  }

  try {
    const users = await databases.listDocuments(
      appWriteConfig.database,
      appWriteConfig.userCollection,
      queries
    );

    if (!users) throw Error;
    return users;
  } catch (error) {
    console.error(error);
  }
}

export async function getUserById(userId: string) {
  try {
    const user = await databases.getDocument(
      appWriteConfig.database,
      appWriteConfig.userCollection,
      userId
    );

    if (!user) throw Error;

    return user;
  } catch (error) {
    console.log(error);
  }
}

export async function updateUser(user: IUpdateUser) {
  const hasFileToUpdate = user.file.length > 0;
  try {
    let image = {
      imageUrl: user.imageUrl,
      imageId: user.imageId,
    };

    if (hasFileToUpdate) {
      // Upload new file to appwrite storage
      const uploadedFile = await uploadFile(user.file[0]);
      if (!uploadedFile) throw Error;

      // Get new file url
      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    //  Update user
    const updatedUser = await databases.updateDocument(
      appWriteConfig.database,
      appWriteConfig.userCollection,
      user.userId,
      {
        name: user.name,
        bio: user.bio,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
      }
    );

    // Failed to update
    if (!updatedUser) {
      // Delete new file that has been recently uploaded
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }
      // If no new file uploaded, just throw error
      throw Error;
    }

    // Safely delete old file after successful update
    if (user.imageId && hasFileToUpdate) {
      await deleteFile(user.imageId);
    }

    return updatedUser;
  } catch (error) {
    console.log(error);
  }
}
