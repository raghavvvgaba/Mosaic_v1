// Core types for Mosaic app
import type { Models } from 'appwrite';

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

// Current Note interface (extends Appwrite Row for TablesDB)
export interface Note extends Models.Row {
  title: string;
  content: string; // Will be upgraded to Record<string, any> for rich text later
  userId: string;
  tags: string[];
  // Future fields:
  // canvas_data?: Record<string, any>;
  // workspace_id?: string;
  // is_archived?: boolean;
}

// Type for creating a new note (without auto-generated fields)
export interface CreateNoteData {
  title: string;
  content: string;
  tags?: string[];
}

// Type for updating a note
export interface UpdateNoteData {
  title?: string;
  content?: string;
  tags?: string[];
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
