import Document from '../models/Document.js';
import FlashCard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import { extractTextFromPDF } from '../utils/pdfParser.js';
import { chunkText } from '../utils/textChunker.js';
import fs from 'fs/promises';
import mongoose from 'mongoose';

/* =========================
   UPLOAD DOCUMENT
========================= */
export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const { title } = req.body;
    if (!title) {
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }

    const baseUrl =
      process.env.BASE_URL ||
      `http://localhost:${process.env.PORT || 8000}`;

    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

    const document = await Document.create({
      userId: req.user._id,
      title,
      fileName: req.file.filename,          // ✅ FIXED
      originalName: req.file.originalname,
      filePath: req.file.path,               // ✅ LOCAL PATH
      fileUrl,
      fileSize: req.file.size,
      status: 'processing'
    });

    processPDF(document._id, req.file.path).catch(err => {
      console.error('PDF processing failed:', err.message);
    });

    return res.status(201).json({
      success: true,
      data: document,
      message: 'Document uploaded & processing started'
    });

  } catch (error) {
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    next(error);
  }
};

/* =========================
   BACKGROUND PDF PROCESS
========================= */
const processPDF = async (documentId, filePath) => {
  try {
    const { text } = await extractTextFromPDF(filePath);

    const chunks = chunkText(text, 500, 50);

    await Document.findByIdAndUpdate(documentId, {
      extractedText: text,
      chunks,
      status: 'ready'
    });

    console.log(`✅ Document ${documentId} processed`);
  } catch (error) {
    console.error('❌ PDF processing error:', error.message);

    await Document.findByIdAndUpdate(documentId, {
      status: 'error'
    });
  }
};

/* =========================
   GET ALL DOCUMENTS
========================= */
export const getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user._id)
        }
      },
      {
        $lookup: {
          from: 'quizzes',
          localField: '_id',
          foreignField: 'documentId',
          as: 'quizzes'
        }
      },
      {
        $lookup: {
          from: 'flashcards',
          localField: '_id',
          foreignField: 'documentId',
          as: 'flashcards'
        }
      },
      {
        $addFields: {
          quizCount: { $size: '$quizzes' },
          flashCardCount: { $size: '$flashcards' }
        }
      },
      {
        $project: {
          extractedText: 0,
          chunks: 0,
          quizzes: 0,
          flashcards: 0
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    return res.status(200).json({
      success: true,
      data: documents
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   GET DOCUMENT BY ID
========================= */
export const getDocumentById = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    const [flashcardsCount, quizzesCount] = await Promise.all([
      FlashCard.countDocuments({
        documentId: document._id,
        userId: req.user._id
      }),
      Quiz.countDocuments({
        documentId: document._id,
        userId: req.user._id
      })
    ]);

    document.lastAccessed = Date.now();
    await document.save();

    const documentData = document.toObject();
    documentData.flashcardsCount = flashcardsCount;
    documentData.quizzesCount = quizzesCount;

    return res.status(200).json({
      success: true,
      data: documentData
    });
  } catch (error) {
    next(error);
  }
};

/* =========================
   DELETE DOCUMENT
========================= */
export const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    await fs.unlink(document.filePath).catch(() => {});

    await FlashCard.deleteMany({
      documentId: document._id,
      userId: req.user._id
    });

    await Quiz.deleteMany({
      documentId: document._id,
      userId: req.user._id
    });

    await document.deleteOne(); 

    return res.status(200).json({
      success: true,
      message: 'Document and associated data deleted'
    });
  } catch (error) {
    next(error);
  }
};
