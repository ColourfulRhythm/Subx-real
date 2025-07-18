import express from 'express';
import multer from 'multer';
import { getStorage } from 'firebase-admin/storage';
import { getFirestore } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const db = getFirestore();
const storage = getStorage().bucket();

// Upload a document (PDF)
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { userId, userEmail, plotId, type, date } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    const docId = uuidv4();
    const fileName = `documents/${userId}/${docId}_${file.originalname}`;
    const fileUpload = storage.file(fileName);
    await fileUpload.save(file.buffer, { contentType: file.mimetype });
    const fileUrl = `https://storage.googleapis.com/${storage.name}/${fileName}`;
    await db.collection('documents').doc(docId).set({
      userId,
      plotId,
      type,
      date,
      fileUrl,
      fileName: file.originalname,
      createdAt: new Date().toISOString(),
    });

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

    res.json({ success: true, fileUrl, docId });
  } catch (err) {
    console.error('Document upload error:', err);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// List all documents for a user
router.get('/list', async (req, res) => {
  try {
    const { userId } = req.query;
    const snapshot = await db.collection('documents').where('userId', '==', userId).get();
    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(docs);
  } catch (err) {
    console.error('Document list error:', err);
    res.status(500).json({ error: 'Failed to list documents' });
  }
});

// Download a document by ID (returns the file URL)
router.get('/:id/download', async (req, res) => {
  try {
    const docRef = db.collection('documents').doc(req.params.id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) return res.status(404).json({ error: 'Document not found' });
    const { fileUrl } = docSnap.data();
    res.json({ fileUrl });
  } catch (err) {
    console.error('Document download error:', err);
    res.status(500).json({ error: 'Failed to get document' });
  }
});

export { router as documentsRouter }; 