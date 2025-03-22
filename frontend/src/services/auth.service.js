/**
 * Authentication Service
 * Handles user authentication, session management, and token validation
 */
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    getAuth 
  } from "firebase/auth";
  import { auth } from "../firebase.js";
  import { verifyUserRole, checkProfileCompletion, userService } from "./user.service.js";
  import { makeApiRequest } from "./helper.js";
import { createShortlist } from "./shortlist.service.js";
  
  /**
   * Checks if a response indicates expired authentication and handles logout
   * @param {Response} response - The API response to check
   * @returns {Promise<void>}
   */
  export async function checkTokenExpiration(response) {
    if (response.status === 403) {
      try {
        const data = await response.json();
        if (data.action === "LOGOUT") {
          await authService.signOut();
          window.dispatchEvent(new Event("sessionExpired"));
        }
      } catch (error) {
        // Continue if response body cannot be parsed
      }
    }
  }
  
  /**
   * Creates a user session after successful authentication
   * @param {Object} userCredential - Firebase user credential
   * @param {string} role - User role (employer or jobSeeker)
   * @returns {Promise<string>} - Authentication token
   */
  async function createUserSession(userCredential, role) {
    const idToken = await userCredential.user.getIdToken();
    sessionStorage.setItem('token', idToken);
    sessionStorage.setItem('role', role);
    window.dispatchEvent(new Event('authChange'));
    
    return idToken;
  }
  
  /**
   * Authentication service with public methods for authentication operations
   */
  export const authService = {
    /**
     * Registers a new user and creates account
     * @param {string} email - User email
     * @param {string} password - User password
     * @param {boolean} isEmployer - Whether user is an employer
     * @param {Function} navigate - Navigation function
     * @returns {Promise<void>}
     * @throws {Error} If registration fails
     */
    async signUp(email, password, isEmployer, navigate) {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      const role = isEmployer ? 'employer' : 'jobSeeker';
      const auth = getAuth();
      
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await createUserSession(userCredential, role);
        
        await createBasicUser({ email, role });
        await createShortlist();
        
        await checkProfileCompletion(navigate);
      } catch (error) {
        throw new Error("Signup failed: " + (error.message || "Unknown error"));
      }
    },
  
    /**
     * Signs in an existing user
     * @param {string} email - User email
     * @param {string} password - User password
     * @param {Function} navigate - Navigation function
     * @param {string} expectedRole - Expected user role
     * @returns {Promise<void>}
     * @throws {Error} If authentication fails
     */
    async signIn(email, password, navigate, expectedRole) {
        if (!email || !password) {
            throw new Error('Email and password are required');
        }
    
        try {
            const isValidRole = await verifyUserRole(email, expectedRole);
            
            if (!isValidRole) {
                if (expectedRole === 'employer') {
                    throw new Error('Use login page for job seekers');
                } else {
                    throw new Error('Use login page for employers');
                }
            }
    
            const auth = getAuth();
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            await createUserSession(userCredential, expectedRole);
    
            if (expectedRole === 'jobSeeker') {
                await checkProfileCompletion(navigate);
            }
        } catch (error) {
            throw new Error(error.message || 'Invalid email or password');
        }
    },
    
    /**
     * Signs out the current user
     * @returns {Promise<void>}
     * @throws {Error} If sign out fails
     */
    async signOut() {
      const auth = getAuth();
      
      try {
        await signOut(auth);
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('role');
        window.dispatchEvent(new Event('authChange'));
      } catch (error) {
        throw new Error("Sign out not successful");
      }
    }
  };