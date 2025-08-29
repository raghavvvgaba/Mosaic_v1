// Core types for Mosaic app

export interface User {
  $id: string
  name: string
  email: string
  avatar?: string
  created_at: string
}

export interface Workspace {
  $id: string
  name: string
  description?: string
  owner_id: string
  type: 'personal' | 'team'
  settings: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Note {
  $id: string
  title: string
  content: Record<string, any>  // Rich text JSON
  canvas_data?: Record<string, any>  // Fabric.js canvas data
  workspace_id: string
  author_id: string
  tags: string[]
  is_archived: boolean
  created_at: string
  updated_at: string
}

export interface Attachment {
  $id: string
  note_id: string
  file_id: string  // Appwrite Storage file ID
  filename: string
  file_type: string
  file_size: number
  created_at: string
}

export interface Theme {
  mode: 'light' | 'dark'
}
