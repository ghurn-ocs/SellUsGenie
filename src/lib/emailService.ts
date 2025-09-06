// Email Service for SMTP Integration
// Handles Gmail SMTP configuration and email sending

export interface SMTPConfig {
  host: string
  port: number
  secure: boolean
  username: string
  password: string
  from_name: string
  from_email: string
}

export interface EmailMessage {
  to: string
  subject: string
  body: string
  isHtml?: boolean
  replyTo?: string
}

export interface EmailSendResult {
  success: boolean
  messageId?: string
  error?: string
}

// Gmail SMTP configuration constants
export const GMAIL_SMTP_CONFIG = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  requireTLS: true
}

export class EmailService {
  private config: SMTPConfig | null = null

  constructor(config?: SMTPConfig) {
    if (config) {
      this.config = config
    }
  }

  /**
   * Configure SMTP settings
   */
  configure(config: SMTPConfig): void {
    this.config = {
      ...config,
      host: config.host || GMAIL_SMTP_CONFIG.host,
      port: config.port || GMAIL_SMTP_CONFIG.port,
      secure: config.secure !== undefined ? config.secure : GMAIL_SMTP_CONFIG.secure
    }
  }

  /**
   * Validate SMTP configuration
   */
  validateConfig(config: SMTPConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!config.host) {
      errors.push('SMTP host is required')
    }

    if (!config.port || config.port < 1 || config.port > 65535) {
      errors.push('Valid SMTP port is required (1-65535)')
    }

    if (!config.username) {
      errors.push('Email username is required')
    }

    if (!config.password) {
      errors.push('Email password/app password is required')
    }

    if (!config.from_email) {
      errors.push('From email address is required')
    } else if (!this.isValidEmail(config.from_email)) {
      errors.push('Valid from email address is required')
    }

    if (!config.from_name) {
      errors.push('From name is required')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Test SMTP connection and authentication
   */
  async testConnection(config: SMTPConfig): Promise<{ success: boolean; error?: string }> {
    try {
      // Since we're in the browser, we can't directly test SMTP
      // This would typically be done through a backend API
      // For now, we'll validate the configuration format
      const validation = this.validateConfig(config)
      
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        }
      }

      // Simulate connection test
      // In a real implementation, this would make an API call to your backend
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true
          })
        }, 1500)
      })
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed'
      }
    }
  }

  /**
   * Send email using configured SMTP
   */
  async sendEmail(message: EmailMessage): Promise<EmailSendResult> {
    if (!this.config) {
      return {
        success: false,
        error: 'Email service not configured'
      }
    }

    try {
      // Validate message
      if (!message.to || !this.isValidEmail(message.to)) {
        return {
          success: false,
          error: 'Invalid recipient email address'
        }
      }

      if (!message.subject) {
        return {
          success: false,
          error: 'Email subject is required'
        }
      }

      if (!message.body) {
        return {
          success: false,
          error: 'Email body is required'
        }
      }

      // Since we're in the browser, actual SMTP sending would be done through a backend API
      // This is a simulation of the email sending process
      const emailData = {
        smtp: this.config,
        message: {
          from: `${this.config.from_name} <${this.config.from_email}>`,
          to: message.to,
          subject: message.subject,
          [message.isHtml ? 'html' : 'text']: message.body,
          replyTo: message.replyTo || this.config.from_email
        }
      }

      // In a real implementation, this would be:
      // const response = await fetch('/api/send-email', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(emailData)
      // })

      console.log('Email would be sent with config:', emailData)

      // Simulate successful send
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          })
        }, 1000)
      })

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email'
      }
    }
  }

  /**
   * Send multiple emails (bulk sending)
   */
  async sendBulkEmails(messages: EmailMessage[]): Promise<EmailSendResult[]> {
    const results: EmailSendResult[] = []

    for (const message of messages) {
      const result = await this.sendEmail(message)
      results.push(result)
      
      // Add small delay between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    return results
  }

  /**
   * Get predefined email templates
   */
  getEmailTemplates() {
    return {
      orderConfirmation: {
        subject: 'Order Confirmation - #{orderNumber}',
        template: `
          <h2>Thank you for your order!</h2>
          <p>Hi #{customerName},</p>
          <p>We've received your order <strong>#{orderNumber}</strong> and we're preparing it for shipment.</p>
          
          <div style="border: 1px solid #ddd; padding: 15px; margin: 20px 0;">
            <h3>Order Details</h3>
            #{orderDetails}
            <p><strong>Total: #{orderTotal}</strong></p>
          </div>
          
          <p>We'll send you another email when your order ships.</p>
          <p>Thanks for shopping with us!</p>
          
          <p>Best regards,<br>#{storeName}</p>
        `
      },
      shippingNotification: {
        subject: 'Your order has shipped - #{orderNumber}',
        template: `
          <h2>Your order is on the way!</h2>
          <p>Hi #{customerName},</p>
          <p>Great news! Your order <strong>#{orderNumber}</strong> has been shipped.</p>
          
          <div style="border: 1px solid #ddd; padding: 15px; margin: 20px 0;">
            <h3>Shipping Details</h3>
            <p><strong>Tracking Number:</strong> #{trackingNumber}</p>
            <p><strong>Carrier:</strong> #{carrier}</p>
            <p><strong>Expected Delivery:</strong> #{expectedDelivery}</p>
          </div>
          
          <p>You can track your package using the tracking number above.</p>
          
          <p>Best regards,<br>#{storeName}</p>
        `
      },
      cartAbandonment: {
        subject: 'You left something in your cart',
        template: `
          <h2>Complete your purchase</h2>
          <p>Hi #{customerName},</p>
          <p>You left some great items in your cart. Complete your purchase before they're gone!</p>
          
          <div style="border: 1px solid #ddd; padding: 15px; margin: 20px 0;">
            <h3>Your Cart</h3>
            #{cartItems}
            <p><strong>Total: #{cartTotal}</strong></p>
          </div>
          
          <p><a href="#{checkoutUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Complete Purchase</a></p>
          
          <p>Best regards,<br>#{storeName}</p>
        `
      }
    }
  }

  /**
   * Validate email address format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Get current configuration
   */
  getConfig(): SMTPConfig | null {
    return this.config
  }

  /**
   * Clear configuration
   */
  clearConfig(): void {
    this.config = null
  }
}

// Export singleton instance
export const emailService = new EmailService()