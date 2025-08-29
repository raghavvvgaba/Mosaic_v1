export const APP_NAME = 'Mosaic'
export const APP_DESCRIPTION = 'Your Second Brain - Capture, Create, Connect'

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  NOTES: '/notes',
  SETTINGS: '/settings',
} as const

export const APPWRITE_CONFIG = {
  endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT || 'http://localhost/v1',
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID || '',
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID || '',
  storageId: import.meta.env.VITE_APPWRITE_STORAGE_ID || '',
}

export const COLLECTIONS = {
  WORKSPACES: 'workspaces',
  NOTES: 'notes',
  ATTACHMENTS: 'attachments',
} as const
