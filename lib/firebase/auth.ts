// lib/firebase/auth.ts
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './config';

export interface UserData {
  uid: string;
  email: string;
  name: string;
  phone?: string;
  dni?: string;
  role: 'client' | 'staff' | 'admin';
  createdAt: Date;
}

// Lista de emails de staff (esto se puede mover a Firestore/Ventify)
// Emails autorizados como administradores/staff
const STAFF_EMAILS = [
  'empresaprivada@gmail.com', // Cuenta principal del restaurante
  'admin@ventify.com',
  'mesero@ventify.com',
  'cajero@ventify.com',
  // Añade aquí los emails de tu equipo
];

/**
 * Determina el rol del usuario basado en su email
 * En producción, esto consultaría a Ventify para verificar si es staff
 */
export const determineUserRole = async (email: string): Promise<'client' | 'staff' | 'admin'> => {
  const emailLower = email.toLowerCase();
  
  // Verificar si es admin
  if (emailLower.includes('admin')) {
    return 'admin';
  }
  
  // Verificar si es staff (mesero, cajero, etc.)
  if (STAFF_EMAILS.includes(emailLower) || 
      emailLower.includes('@ventify') ||
      emailLower.includes('mesero') ||
      emailLower.includes('cajero')) {
    return 'staff';
  }
  
  // Por defecto es cliente
  return 'client';
};

/**
 * Iniciar sesión con email y contraseña
 */
export const loginWithEmail = async (email: string, password: string): Promise<{ user: User; role: string }> => {
  if (!auth) throw new Error('Firebase authentication not configured');
  if (!db) throw new Error('Firebase Firestore not configured');
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const role = await determineUserRole(email);
    
    // Actualizar rol en Firestore si existe el documento
    const userRef = doc(db!, 'users', userCredential.user.uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      await setDoc(userRef, { role, lastLogin: new Date() }, { merge: true });
    }
    
    return { user: userCredential.user, role };
  } catch (error: any) {
    console.error('Error en login:', error);
    throw new Error(getFirebaseErrorMessage(error.code));
  }
};

/**
 * Registrar nuevo usuario (solo clientes)
 */
export const registerClient = async (
  email: string, 
  password: string, 
  name: string,
  phone?: string,
  dni?: string
): Promise<User> => {
  if (!auth) throw new Error('Firebase authentication not configured');
  if (!db) throw new Error('Firebase Firestore not configured');
  try {
    // 1. Crear cuenta en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // 2. Guardar datos adicionales en Firestore
    const userData: UserData = {
      uid: userCredential.user.uid,
      email,
      name,
      phone: phone || '',
      dni: dni || '',
      role: 'client',
      createdAt: new Date(),
    };
    
    await setDoc(doc(db!, 'users', userCredential.user.uid), userData);
    
    // 3. Sincronizar con Ventify (opcional, si tienes el endpoint)
    await syncClientWithVentify(userData);
    
    return userCredential.user;
  } catch (error: any) {
    console.error('Error en registro:', error);
    throw new Error(getFirebaseErrorMessage(error.code));
  }
};

/**
 * Sincronizar cliente con Ventify
 */
const syncClientWithVentify = async (userData: UserData): Promise<void> => {
  const signupUrl = process.env.NEXT_PUBLIC_PUBLIC_SIGNUP_URL;
  
  if (!signupUrl) {
    console.warn('URL de sincronización con Ventify no configurada');
    return;
  }
  
  try {
    const response = await fetch(signupUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        dni: userData.dni,
        source: 'web_restaurant',
      }),
    });
    
    if (response.ok) {
      console.log('✅ Cliente sincronizado con Ventify');
    } else {
      console.warn('⚠️ No se pudo sincronizar con Ventify');
    }
  } catch (error) {
    console.warn('⚠️ Error al sincronizar con Ventify:', error);
  }
};

/**
 * Cerrar sesión
 */
export const logout = async (): Promise<void> => {
  if (!auth) return;
  await signOut(auth);
};

/**
 * Obtener datos del usuario desde Firestore
 */
export const getUserData = async (uid: string): Promise<UserData | null> => {
  if (!db) return null;
  try {
    const userRef = doc(db!, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as UserData;
    }
    return null;
  } catch (error) {
    console.error('Error al obtener datos del usuario:', error);
    return null;
  }
};

/**
 * Escuchar cambios en el estado de autenticación
 */
export const onAuthChange = (callback: (user: User | null) => void) => {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
};

/**
 * Traducir errores de Firebase a español
 */
const getFirebaseErrorMessage = (code: string): string => {
  const errors: Record<string, string> = {
    'auth/invalid-email': 'El correo electrónico no es válido',
    'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
    'auth/user-not-found': 'No existe una cuenta con este correo',
    'auth/wrong-password': 'La contraseña es incorrecta',
    'auth/email-already-in-use': 'Este correo ya está registrado',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
    'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
    'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
    'auth/invalid-credential': 'Credenciales inválidas. Verifica tu email y contraseña',
  };
  
  return errors[code] || 'Ocurrió un error. Intenta de nuevo';
};
