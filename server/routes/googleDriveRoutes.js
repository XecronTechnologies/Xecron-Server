import express from 'express';
import googleDriveService from '../services/googleDriveService.js';

const router = express.Router();

// Get all files
router.get('/files', async (req, res) => {
  try {
    const result = await googleDriveService.getAllFiles();
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result.files,
      total: result.total
    });
  } catch (error) {
    console.error('Error in /files route:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch files'
    });
  }
});

// Get files by folder
router.get('/files/folder/:folderId', async (req, res) => {
  try {
    const { folderId } = req.params;
    const result = await googleDriveService.getFilesByFolder(folderId);
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result.files,
      total: result.total
    });
  } catch (error) {
    console.error('Error in /files/folder route:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch folder files'
    });
  }
});

// Search files
router.get('/files/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required'
      });
    }

    const result = await googleDriveService.searchFiles(q);
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result.files,
      total: result.total,
      query: q
    });
  } catch (error) {
    console.error('Error in /files/search route:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search files'
    });
  }
});

// Get file by ID
router.get('/files/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const result = await googleDriveService.getFileById(fileId);
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result.file
    });
  } catch (error) {
    console.error('Error in /files/:fileId route:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch file'
    });
  }
});

// Download file
router.get('/files/:fileId/download', async (req, res) => {
  try {
    const { fileId } = req.params;
    const result = await googleDriveService.downloadFile(fileId);
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    // Set appropriate headers for download
    res.setHeader('Content-Type', result.headers['content-type']);
    res.setHeader('Content-Disposition', `attachment; filename="file"`);

    // Pipe the file stream to response
    result.stream.pipe(res);
  } catch (error) {
    console.error('Error in download route:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download file'
    });
  }
});

// Add to your googleDriveRoutes.js
router.get('/debug', async (req, res) => {
  try {
    const drive = google.drive({ version: 'v3', auth: googleDriveService.auth });
    
    // Test 1: Get root folder files
    const rootFiles = await drive.files.list({
      q: "'root' in parents and trashed=false",
      pageSize: 10,
      fields: 'files(id, name, mimeType)'
    });

    // Test 2: Get about info (always works)
    const about = await drive.about.get({
      fields: 'user, storageQuota'
    });

    res.json({
      success: true,
      debug: {
        serviceAccount: about.data.user,
        rootFiles: rootFiles.data.files,
        storage: about.data.storageQuota,
        message: 'If rootFiles is empty, share folders with service account'
      }
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message,
      solution: 'Share Google Drive folders with your service account email'
    });
  }
});

export default router;