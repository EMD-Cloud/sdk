import type AppOptions from 'src/core/AppOptions'
import type { UserData } from 'src/types/user'

/**
 * Helper class for chat channel authentication using JWS tokens
 */
export class ChatAuth {
  constructor(private readonly applicationOptions: AppOptions) {}

  /**
   * Generate authentication signature for channel subscription
   * Uses JWT token from SDK as JWS signature
   *
   * @param chatId - Chat channel ID (for chat-* channels)
   * @returns Auth signature and user data for subscription
   */
  generateChannelAuth(chatId?: string): {
    auth: string
    user_data: string
    chatId?: string
  } {
    // Check if user is authenticated
    if (!this.isAuthenticated()) {
      throw new Error(
        'Authentication token not found. Please ensure user is authenticated.',
      )
    }

    // Get the JWT token from application options
    // This token is already a JWS token that the backend can verify
    const authToken = this.applicationOptions.getAuthToken()

    // For chat channels, extract user data from the auth token
    // The backend expects user_data to include the user ID (_id field)
    const userData = this.extractUserDataFromToken(authToken)

    return {
      auth: authToken,
      user_data: JSON.stringify(userData),
      ...(chatId ? { chatId } : {}),
    }
  }

  /**
   * Extract user data from JWT token
   * JWT format: header.payload.signature
   * We need to decode the payload to get user information
   *
   * @param token - JWT token
   * @returns User data object
   */
  private extractUserDataFromToken(token: string): Partial<UserData> {
    try {
      // JWT tokens have 3 parts: header.payload.signature
      const parts = token.split('.')
      if (parts.length !== 3) {
        throw new Error('Invalid JWT token format')
      }

      // Decode the payload (second part)
      // JWT payloads are base64url encoded
      const payload = parts[1]
      const decodedPayload = this.base64UrlDecode(payload)
      const userData = JSON.parse(decodedPayload)

      // Ensure _id field exists (required by backend)
      if (!userData._id) {
        throw new Error('User ID (_id) not found in auth token')
      }

      return userData
    } catch (error) {
      console.error('Failed to extract user data from token:', error)
      // Return minimal user data if extraction fails
      return { _id: 'unknown' }
    }
  }

  /**
   * Decode base64url encoded string
   * Base64url is base64 with URL-safe characters (- instead of +, _ instead of /)
   *
   * @param str - Base64url encoded string
   * @returns Decoded string
   */
  private base64UrlDecode(str: string): string {
    // Convert base64url to base64
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/')

    // Add padding if needed
    const pad = base64.length % 4
    if (pad) {
      if (pad === 1) {
        throw new Error('Invalid base64url string')
      }
      base64 += new Array(5 - pad).join('=')
    }

    // Decode base64
    // Use Buffer in Node.js, atob in browser
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(base64, 'base64').toString('utf-8')
    } else if (typeof atob !== 'undefined') {
      return decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      )
    } else {
      throw new Error('No base64 decoder available')
    }
  }

  /**
   * Check if user is authenticated
   * @returns true if auth token exists
   */
  isAuthenticated(): boolean {
    try {
      this.applicationOptions.getAuthToken()
      return true
    } catch {
      return false
    }
  }

  /**
   * Get user data from current authentication token
   * @returns User data or null if not authenticated
   */
  getUserData(): Partial<UserData> | null {
    try {
      if (!this.isAuthenticated()) {
        return null
      }

      const authToken = this.applicationOptions.getAuthToken()
      return this.extractUserDataFromToken(authToken)
    } catch (error) {
      console.error('Failed to get user data:', error)
      return null
    }
  }
}
