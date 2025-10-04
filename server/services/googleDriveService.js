import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

class GoogleDriveService {
  constructor() {
    this.auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE, // Path to your service account key file
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    this.drive = google.drive({ version: 'v3', auth: this.auth });
  }

  /**
   * Get all files from Google Drive
   */
  async getAllFiles() {
  try {
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    
    let query = 'trashed=false';
    if (folderId) {
      query = `'${folderId}' in parents and trashed=false`;
    }

    const response = await this.drive.files.list({
      pageSize: 1000,
      fields: 'files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink, parents)',
      q: query,
      orderBy: 'name'
    });

    console.log('Google Drive API Response:', {
      totalFiles: response.data.files.length,
      folderId: folderId || 'root',
      files: response.data.files.map(f => ({ name: f.name, id: f.id }))
    });

    return {
      success: true,
      files: response.data.files,
      total: response.data.files.length
    };
  } catch (error) {
    console.error('Error fetching files from Google Drive:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
  /**
   * Get files by specific folder ID
   */
  async getFilesByFolder(folderId) {
    try {
      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        pageSize: 1000,
        fields: 'files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink)',
      });

      return {
        success: true,
        files: response.data.files,
        total: response.data.files.length
      };
    } catch (error) {
      console.error('Error fetching files from folder:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Search files by name or type
   */
  async searchFiles(query) {
    try {
      const response = await this.drive.files.list({
        q: `name contains '${query}' and trashed=false`,
        pageSize: 100,
        fields: 'files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink)',
      });

      return {
        success: true,
        files: response.data.files,
        total: response.data.files.length
      };
    } catch (error) {
      console.error('Error searching files:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get file metadata by ID
   */
  async getFileById(fileId) {
    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        fields: 'id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink',
      });

      return {
        success: true,
        file: response.data
      };
    } catch (error) {
      console.error('Error fetching file by ID:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Download file by ID
   */
  async downloadFile(fileId) {
    try {
      const response = await this.drive.files.get(
        {
          fileId: fileId,
          alt: 'media',
        },
        { responseType: 'stream' }
      );

      return {
        success: true,
        stream: response.data,
        headers: response.headers
      };
    } catch (error) {
      console.error('Error downloading file:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new GoogleDriveService();