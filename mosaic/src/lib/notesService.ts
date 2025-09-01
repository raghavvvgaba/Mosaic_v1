import { tablesDB, appwriteConfig } from './appwrite';
import { ID, Query, Permission, Role } from 'appwrite';
import type { Note, CreateNoteData, UpdateNoteData } from '../types';

class NotesService {
  private databaseId = appwriteConfig.databaseId;
  private tableId = appwriteConfig.notesTableId;

  // Create a new note using TablesDB API (SDK 19.0.0)
  async createNote(userId: string, noteData: CreateNoteData): Promise<Note> {
    try {
      const response = await tablesDB.createRow({
        databaseId: this.databaseId,
        tableId: this.tableId,
        rowId: ID.unique(),
        data: {
          title: noteData.title,
          content: noteData.content,
          userId: userId,
          tags: noteData.tags || [],
        },
        permissions: [
          Permission.read(Role.user(userId)),
          Permission.update(Role.user(userId)),
          Permission.delete(Role.user(userId)),
        ]
      });
      return response as unknown as Note;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  }

  // Get all notes for a specific user using TablesDB API (SDK 19.0.0)
  async getUserNotes(userId: string): Promise<Note[]> {
    try {
      const response = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: this.tableId,
        queries: [
          Query.equal('userId', userId),
          Query.orderDesc('$createdAt'),
        ]
      });
      return response.rows as unknown as Note[];
    } catch (error) {
      console.error('Error fetching user notes:', error);
      throw error;
    }
  }

  // Get a specific note by ID using TablesDB API (SDK 19.0.0)
  async getNote(noteId: string): Promise<Note> {
    try {
      const response = await tablesDB.getRow({
        databaseId: this.databaseId,
        tableId: this.tableId,
        rowId: noteId
      });
      return response as unknown as Note;
    } catch (error) {
      console.error('Error fetching note:', error);
      throw error;
    }
  }

  // Update a note using TablesDB API (SDK 19.0.0)
  async updateNote(noteId: string, updates: UpdateNoteData): Promise<Note> {
    try {
      const response = await tablesDB.updateRow({
        databaseId: this.databaseId,
        tableId: this.tableId,
        rowId: noteId,
        data: updates
      });
      return response as unknown as Note;
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  }

  // Delete a note using TablesDB API (SDK 19.0.0)
  async deleteNote(noteId: string): Promise<void> {
    try {
      await tablesDB.deleteRow({
        databaseId: this.databaseId,
        tableId: this.tableId,
        rowId: noteId
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }

  // Search notes by title or content using TablesDB API (SDK 19.0.0)
  async searchNotes(userId: string, searchTerm: string): Promise<Note[]> {
    try {
      const response = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: this.tableId,
        queries: [
          Query.equal('userId', userId),
          Query.or([
            Query.search('title', searchTerm),
            Query.search('content', searchTerm),
          ]),
          Query.orderDesc('$createdAt'),
        ]
      });
      return response.rows as unknown as Note[];
    } catch (error) {
      console.error('Error searching notes:', error);
      throw error;
    }
  }

  // Get notes by tag using TablesDB API (SDK 19.0.0)
  async getNotesByTag(userId: string, tag: string): Promise<Note[]> {
    try {
      const response = await tablesDB.listRows({
        databaseId: this.databaseId,
        tableId: this.tableId,
        queries: [
          Query.equal('userId', userId),
          Query.contains('tags', tag),
          Query.orderDesc('$createdAt'),
        ]
      });
      return response.rows as unknown as Note[];
    } catch (error) {
      console.error('Error fetching notes by tag:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const notesService = new NotesService();