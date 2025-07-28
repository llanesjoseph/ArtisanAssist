import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { app } from "@/lib/firebase";

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
