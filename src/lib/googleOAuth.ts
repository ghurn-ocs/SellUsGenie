// Google OAuth Integration for Gmail API
// Handles Gmail authentication and email service setup

interface GoogleOAuthConfig {
  clientId: string
  redirectUri: string
  scopes: string[]
}

interface GoogleOAuthToken {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  scope: string
}

interface GoogleUserInfo {
  id: string
  email: string
  name: string
  picture?: string
}

export class GoogleOAuthService {
  private config: GoogleOAuthConfig
  private static instance: GoogleOAuthService

  constructor() {
    this.config = {
      clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
      redirectUri: `${window.location.origin}/auth/google/callback`,
      scopes: [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.compose',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ]
    }
  }

  static getInstance(): GoogleOAuthService {
    if (!GoogleOAuthService.instance) {
      GoogleOAuthService.instance = new GoogleOAuthService()
    }
    return GoogleOAuthService.instance
  }

  /**
   * Initiates Google OAuth flow for Gmail access
   */
  async initiateGmailAuth(): Promise<void> {
    if (!this.config.clientId) {
      throw new Error('Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in your environment variables.')
    }

    const authUrl = this.buildAuthUrl()
    
    // Open OAuth popup
    const popup = window.open(
      authUrl,
      'google-oauth',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    )

    if (!popup) {
      throw new Error('Popup blocked. Please allow popups for this site.')
    }

    // Wait for OAuth callback
    return new Promise((resolve, reject) => {
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed)
          reject(new Error('OAuth flow was cancelled'))
        }
      }, 1000)

      // Listen for OAuth callback
      const messageHandler = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return
        
        if (event.data.type === 'GOOGLE_OAUTH_SUCCESS') {
          clearInterval(checkClosed)
          popup.close()
          window.removeEventListener('message', messageHandler)
          resolve()
        } else if (event.data.type === 'GOOGLE_OAUTH_ERROR') {
          clearInterval(checkClosed)
          popup.close()
          window.removeEventListener('message', messageHandler)
          reject(new Error(event.data.error || 'OAuth failed'))
        }
      }

      window.addEventListener('message', messageHandler)
    })
  }

  /**
   * Builds the Google OAuth authorization URL
   */
  private buildAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(' '),
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
      state: this.generateState()
    })

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  }

  /**
   * Generates a secure state parameter for OAuth
   */
  private generateState(): string {
    return btoa(JSON.stringify({
      timestamp: Date.now(),
      random: Math.random().toString(36).substring(2)
    }))
  }

  /**
   * Exchanges authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<GoogleOAuthToken> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: '', // For public clients, this can be empty
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.config.redirectUri
      })
    })

    if (!response.ok) {
      throw new Error('Failed to exchange code for token')
    }

    return response.json()
  }

  /**
   * Gets user info from Google
   */
  async getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch user info')
    }

    return response.json()
  }

  /**
   * Refreshes an expired access token
   */
  async refreshToken(refreshToken: string): Promise<GoogleOAuthToken> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      })
    })

    if (!response.ok) {
      throw new Error('Failed to refresh token')
    }

    return response.json()
  }

  /**
   * Sends an email using Gmail API
   */
  async sendEmail(
    accessToken: string,
    to: string,
    subject: string,
    body: string,
    isHtml: boolean = false
  ): Promise<boolean> {
    const email = this.createEmailMessage(to, subject, body, isHtml)
    
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: btoa(email).replace(/\+/g, '-').replace(/\//g, '_')
      })
    })

    return response.ok
  }

  /**
   * Creates RFC 2822 formatted email message
   */
  private createEmailMessage(to: string, subject: string, body: string, isHtml: boolean): string {
    const contentType = isHtml ? 'text/html; charset=utf-8' : 'text/plain; charset=utf-8'
    
    return [
      `To: ${to}`,
      `Subject: ${subject}`,
      `Content-Type: ${contentType}`,
      '',
      body
    ].join('\r\n')
  }

  /**
   * Tests the Gmail connection
   */
  async testConnection(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      return response.ok
    } catch {
      return false
    }
  }
}

// Export singleton instance
export const googleOAuth = GoogleOAuthService.getInstance()