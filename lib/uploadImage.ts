import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

/* =========================================================
   Upload image to Firebase Storage
   ========================================================= */
export async function uploadChatImage(
  file: File,
  conversationId: string,
  userId: string
): Promise<string> {
  const ext = file.name.split(".").pop();
  const fileRef = ref(
    storage,
    `chat-images/${conversationId}/${userId}_${Date.now()}.${ext}`
  );

  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef);
}
