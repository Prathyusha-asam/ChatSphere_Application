import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";
//region uploadChatImage Helper
/**
 * uploadChatImage
 *
 * Uploads a chat image to Firebase Storage and
 * returns a public download URL.
 *
 * Storage structure:
 * chat-images/{conversationId}/{userId}_{timestamp}.{ext}
 *
 * @param file - Image file selected by the user
 * @param conversationId - Active conversation ID
 * @param userId - UID of the uploading user
 *
 * @returns Promise<string> - Downloadable image URL
 */
export async function uploadChatImage(
  file: File,
  conversationId: string,
  userId: string
): Promise<string> {
  //region Build Storage Reference
  /**
   * Generates a unique storage path using
   * conversation ID, user ID, and timestamp
   */
  const ext = file.name.split(".").pop();
  const fileRef = ref(
    storage,
    `chat-images/${conversationId}/${userId}_${Date.now()}.${ext}`
  );
  //endregion Build Storage Reference

  //region Upload File
  /**
   * Uploads file bytes to Firebase Storage
   */
  await uploadBytes(fileRef, file);
  //endregion Upload File

  //region Resolve Download URL
  /**
   * Retrieves public download URL for the uploaded file
   */
  return await getDownloadURL(fileRef);
  //endregion Resolve Download URL
}
//endregion uploadChatImage Helper
