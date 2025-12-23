import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
export function useAuth() {
  //region Use Auth Context
  /**
   * Retrieves the authentication context
   */
  const context = useContext(AuthContext);
  //endregion
  //region Validate Context
  /**
 * Ensures useAuth is called within AuthProvider
 */
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  //endregion
  // region return Context
  /**
   * Returns the validated authentication context
   */
  return context;
  // endregion
}
