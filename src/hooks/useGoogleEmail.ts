// Custom hook for Google Email integration
// Manages Gmail OAuth flow and email service state

import { useState, useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { googleOAuth } from '../lib/googleOAuth'
import { supabase } from '../lib/supabase-client'

interface GoogleEmailConnection {
  id: string
  store_id: string
  email: string
  name: string
  access_token: string
  refresh_token: string
  expires_at: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface UseGoogleEmailReturn {
  connection: GoogleEmailConnection | null
  isConnected: boolean
  isLoading: boolean
  isConnecting: boolean
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  sendEmail: (to: string, subject: string, body: string, isHtml?: boolean) => Promise<void>
  testConnection: () => Promise<boolean>
  error: string | null
}

export const useGoogleEmail = (storeId: string): UseGoogleEmailReturn => {
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  // Fetch existing Google email connection
  const { data: connection, isLoading } = useQuery({
    queryKey: ['google-email-connection', storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('google_email_connections')
        .select('*')
        .eq('store_id', storeId)
        .eq('is_active', true)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error
      }

      return data
    },
    enabled: !!storeId
  })

  // Connect to Google Email
  const connectMutation = useMutation({
    mutationFn: async (): Promise<GoogleEmailConnection> => {
      try {
        setError(null)
        setIsConnecting(true)

        // Initiate OAuth flow
        await googleOAuth.initiateGmailAuth()

        // At this point, we would normally get the authorization code from the callback
        // For now, we'll simulate a successful connection
        // In a real implementation, this would be handled by the OAuth callback
        
        throw new Error('OAuth callback implementation needed. Please complete the OAuth flow setup.')
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to connect to Gmail')
        throw err
      } finally {
        setIsConnecting(false)
      }
    },
    onSuccess: (newConnection) => {
      queryClient.setQueryData(['google-email-connection', storeId], newConnection)
      queryClient.invalidateQueries({ queryKey: ['google-email-connections'] })
    }
  })

  // Disconnect from Google Email
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      if (!connection) return

      const { error } = await supabase
        .from('google_email_connections')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', connection.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.setQueryData(['google-email-connection', storeId], null)
      queryClient.invalidateQueries({ queryKey: ['google-email-connections'] })
    }
  })

  // Send email
  const sendEmailMutation = useMutation({
    mutationFn: async ({
      to,
      subject,
      body,
      isHtml = false
    }: {
      to: string
      subject: string
      body: string
      isHtml?: boolean
    }) => {
      if (!connection) {
        throw new Error('No Gmail connection found')
      }

      // Check if token is expired and refresh if needed
      const now = new Date()
      const expiresAt = new Date(connection.expires_at)
      
      let accessToken = connection.access_token

      if (now >= expiresAt) {
        // Token expired, refresh it
        const tokenData = await googleOAuth.refreshToken(connection.refresh_token)
        
        // Update the stored token
        const newExpiresAt = new Date(now.getTime() + tokenData.expires_in * 1000)
        
        const { error } = await supabase
          .from('google_email_connections')
          .update({
            access_token: tokenData.access_token,
            expires_at: newExpiresAt.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', connection.id)

        if (error) throw error
        
        accessToken = tokenData.access_token
        
        // Update local state
        queryClient.setQueryData(['google-email-connection', storeId], {
          ...connection,
          access_token: accessToken,
          expires_at: newExpiresAt.toISOString()
        })
      }

      const success = await googleOAuth.sendEmail(accessToken, to, subject, body, isHtml)
      
      if (!success) {
        throw new Error('Failed to send email')
      }

      return success
    }
  })

  // Test connection
  const testConnectionMutation = useMutation({
    mutationFn: async (): Promise<boolean> => {
      if (!connection) {
        return false
      }

      return await googleOAuth.testConnection(connection.access_token)
    }
  })

  const connect = useCallback(async () => {
    await connectMutation.mutateAsync()
  }, [connectMutation])

  const disconnect = useCallback(async () => {
    await disconnectMutation.mutateAsync()
  }, [disconnectMutation])

  const sendEmail = useCallback(async (
    to: string,
    subject: string,
    body: string,
    isHtml: boolean = false
  ) => {
    await sendEmailMutation.mutateAsync({ to, subject, body, isHtml })
  }, [sendEmailMutation])

  const testConnection = useCallback(async (): Promise<boolean> => {
    return await testConnectionMutation.mutateAsync()
  }, [testConnectionMutation])

  return {
    connection,
    isConnected: !!connection,
    isLoading,
    isConnecting: isConnecting || connectMutation.isPending,
    connect,
    disconnect,
    sendEmail,
    testConnection,
    error: error || connectMutation.error?.message || disconnectMutation.error?.message || sendEmailMutation.error?.message || null
  }
}

export default useGoogleEmail