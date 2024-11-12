import { getAuth, GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';
import app from './firebaseApp';

const auth = getAuth(app);

export const authWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    return await signInWithRedirect(auth, provider);
}

// Need to create a way to limit google account access to only the accounts that are part of the organization