import { getAuth, GoogleAuthProvider, signInWithRedirect, onAuthStateChanged, signOut } from 'firebase/auth';
import app from './firebaseApp';
import { checkIfUserExists, addToDb } from './firebaseDatabase';

const auth = getAuth(app);

export const authWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
};