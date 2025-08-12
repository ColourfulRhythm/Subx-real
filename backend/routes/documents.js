import express from 'express';
import multer from 'multer';
import { supabase } from '../supabase.js';
import { v4 as uuidv4 } from 'uuid';
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Upload a document (PDF)
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { userId, userEmail, plotId, type, date } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    
    const docId = uuidv4();
    const fileName = `documents/${userId}/${docId}_${file.originalname}`;
    
    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype
      });
    
    if (uploadError) {
      throw uploadError;
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);
    
    // Store document metadata in Supabase database
    const { error: dbError } = await supabase
      .from('documents')
      .insert({
        id: docId,
        user_id: userId,
        plot_id: plotId,
        doc_type: type,
        storage_path: fileName,
        file_url: publicUrl,
        file_name: file.originalname,
        created_at: new Date().toISOString()
      });
    
    if (dbError) {
      throw dbError;
    }

    // Send email with attachment
    if (userEmail) {
      const msg = {
        to: userEmail,
        from: process.env.FROM_EMAIL,
        subject: `Your ${type} from Focal Point Property Development and Management Services Ltd.`,
        text: `Dear user, attached is your ${type} for plot ${plotId}.`,
        attachments: [
          {
            content: file.buffer.toString('base64'),
            filename: file.originalname,
            type: file.mimetype,
            disposition: 'attachment',
          },
        ],
      };
      try {
        await sgMail.send(msg);
      } catch (emailErr) {
        console.error('SendGrid email error:', emailErr);
        // Don't block the upload if email fails
      }
    }

    res.json({ success: true, fileUrl: publicUrl, docId });
  } catch (err) {
    console.error('Document upload error:', err);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// List all documents for a user
router.get('/list', async (req, res) => {
  try {
    const { userId } = req.query;
    
    const { data: docs, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    res.json(docs || []);
  } catch (err) {
    console.error('Document list error:', err);
    res.status(500).json({ error: 'Failed to list documents' });
  }
});

// Download a document by ID (returns the file URL)
router.get('/:id/download', async (req, res) => {
  try {
    const { data: doc, error } = await supabase
      .from('documents')
      .select('file_url')
      .eq('id', req.params.id)
      .single();
    
    if (error || !doc) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    res.json({ fileUrl: doc.file_url });
  } catch (err) {
    console.error('Document download error:', err);
    res.status(500).json({ error: 'Failed to get document' });
  }
});

export { router as documentsRouter }; 