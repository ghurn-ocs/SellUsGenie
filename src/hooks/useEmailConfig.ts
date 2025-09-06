// Custom hook for managing email SMTP configuration
// Handles Gmail SMTP setup and email sending

import { useState, useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { emailService, SMTPConfig, EmailMessage, EmailSendResult } from '../lib/emailService'
import { supabase } from '../lib/supabase'

interface EmailConfiguration {
  id: string
  store_id: string
  smtp_host: string
  smtp_port: number
  smtp_secure: boolean
  smtp_username: string
  smtp_password: string
  from_name: string
  from_email: string
  is_active: boolean
  last_tested_at?: string
  test_result?: string
  created_at: string
  updated_at: string
}

interface UseEmailConfigReturn {
  config: EmailConfiguration | null
  isConfigured: boolean
  isLoading: boolean
  isTesting: boolean
  isSending: boolean
  saveConfig: (config: SMTPConfig) => Promise<void>
  testConfig: (config: SMTPConfig) => Promise<{ success: boolean; error?: string }>
  deleteConfig: () => Promise<void>
  sendEmail: (message: EmailMessage) => Promise<EmailSendResult>
  sendBulkEmails: (messages: EmailMessage[]) => Promise<EmailSendResult[]>
  getEmailTemplates: () => any
  error: string | null
}

export const useEmailConfig = (storeId: string): UseEmailConfigReturn => {
  const [isTesting, setIsTesting] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  // Fetch email configuration
  const { data: config, isLoading } = useQuery({
    queryKey: ['email-config', storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_configurations')
        .select('*')
        .eq('store_id', storeId)
        .eq('is_active', true)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error
      }

      // Configure email service if config exists
      if (data) {
        emailService.configure({
          host: data.smtp_host,
          port: data.smtp_port,
          secure: data.smtp_secure,
          username: data.smtp_username,
          password: data.smtp_password,
          from_name: data.from_name,
          from_email: data.from_email
        })
      }

      return data
    },
    enabled: !!storeId
  })

  // Save email configuration
  const saveConfigMutation = useMutation({
    mutationFn: async (smtpConfig: SMTPConfig): Promise<EmailConfiguration> => {
      try {
        setError(null)

        // Validate configuration first
        const validation = emailService.validateConfig(smtpConfig)
        if (!validation.isValid) {
          throw new Error(validation.errors.join(', '))
        }

        // Prepare data for database
        const configData = {
          store_id: storeId,
          smtp_host: smtpConfig.host,
          smtp_port: smtpConfig.port,
          smtp_secure: smtpConfig.secure,
          smtp_username: smtpConfig.username,
          smtp_password: smtpConfig.password,
          from_name: smtpConfig.from_name,
          from_email: smtpConfig.from_email,
          is_active: true,
          updated_at: new Date().toISOString()
        }

        let result

        if (config) {
          // Update existing configuration
          const { data, error } = await supabase
            .from('email_configurations')
            .update(configData)
            .eq('id', config.id)
            .select()
            .single()

          if (error) throw error
          result = data
        } else {
          // Create new configuration
          const { data, error } = await supabase
            .from('email_configurations')
            .insert({
              ...configData,
              created_at: new Date().toISOString()
            })
            .select()
            .single()

          if (error) throw error
          result = data
        }

        // Configure email service with new settings
        emailService.configure(smtpConfig)

        return result
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save email configuration')
        throw err
      }
    },
    onSuccess: (newConfig) => {
      queryClient.setQueryData(['email-config', storeId], newConfig)
      queryClient.invalidateQueries({ queryKey: ['email-configurations'] })
    }
  })

  // Test email configuration
  const testConfigMutation = useMutation({
    mutationFn: async (smtpConfig: SMTPConfig): Promise<{ success: boolean; error?: string }> => {
      setIsTesting(true)
      setError(null)

      try {
        const result = await emailService.testConnection(smtpConfig)

        // Update test result in database if config exists
        if (config) {
          await supabase
            .from('email_configurations')
            .update({
              last_tested_at: new Date().toISOString(),
              test_result: result.success ? 'success' : result.error || 'failed',
              updated_at: new Date().toISOString()
            })
            .eq('id', config.id)
        }

        return result
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Connection test failed'
        setError(error)
        return { success: false, error }
      } finally {
        setIsTesting(false)
      }
    }
  })

  // Delete email configuration
  const deleteConfigMutation = useMutation({
    mutationFn: async () => {
      if (!config) return

      const { error } = await supabase
        .from('email_configurations')
        .update({ 
          is_active: false, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', config.id)

      if (error) throw error

      // Clear email service configuration
      emailService.clearConfig()
    },
    onSuccess: () => {
      queryClient.setQueryData(['email-config', storeId], null)
      queryClient.invalidateQueries({ queryKey: ['email-configurations'] })
    }
  })

  // Send single email
  const sendEmailMutation = useMutation({
    mutationFn: async (message: EmailMessage): Promise<EmailSendResult> => {
      if (!config) {
        throw new Error('Email not configured. Please configure email settings first.')
      }

      setIsSending(true)
      setError(null)

      try {
        const result = await emailService.sendEmail(message)

        if (!result.success && result.error) {
          setError(result.error)
        }

        return result
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Failed to send email'
        setError(error)
        throw err
      } finally {
        setIsSending(false)
      }
    }
  })

  // Send bulk emails
  const sendBulkEmailsMutation = useMutation({
    mutationFn: async (messages: EmailMessage[]): Promise<EmailSendResult[]> => {
      if (!config) {
        throw new Error('Email not configured. Please configure email settings first.')
      }

      setIsSending(true)
      setError(null)

      try {
        const results = await emailService.sendBulkEmails(messages)

        // Check for any failures
        const failures = results.filter(r => !r.success)
        if (failures.length > 0) {
          setError(`${failures.length} out of ${messages.length} emails failed to send`)
        }

        return results
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Failed to send emails'
        setError(error)
        throw err
      } finally {
        setIsSending(false)
      }
    }
  })

  const saveConfig = useCallback(async (smtpConfig: SMTPConfig) => {
    await saveConfigMutation.mutateAsync(smtpConfig)
  }, [saveConfigMutation])

  const testConfig = useCallback(async (smtpConfig: SMTPConfig): Promise<{ success: boolean; error?: string }> => {
    return await testConfigMutation.mutateAsync(smtpConfig)
  }, [testConfigMutation])

  const deleteConfig = useCallback(async () => {
    await deleteConfigMutation.mutateAsync()
  }, [deleteConfigMutation])

  const sendEmail = useCallback(async (message: EmailMessage): Promise<EmailSendResult> => {
    return await sendEmailMutation.mutateAsync(message)
  }, [sendEmailMutation])

  const sendBulkEmails = useCallback(async (messages: EmailMessage[]): Promise<EmailSendResult[]> => {
    return await sendBulkEmailsMutation.mutateAsync(messages)
  }, [sendBulkEmailsMutation])

  const getEmailTemplates = useCallback(() => {
    return emailService.getEmailTemplates()
  }, [])

  return {
    config,
    isConfigured: !!config,
    isLoading,
    isTesting: isTesting || testConfigMutation.isPending,
    isSending: isSending || sendEmailMutation.isPending || sendBulkEmailsMutation.isPending,
    saveConfig,
    testConfig,
    deleteConfig,
    sendEmail,
    sendBulkEmails,
    getEmailTemplates,
    error: error || 
           saveConfigMutation.error?.message || 
           deleteConfigMutation.error?.message || 
           sendEmailMutation.error?.message || 
           sendBulkEmailsMutation.error?.message || 
           null
  }
}

export default useEmailConfig