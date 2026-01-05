import Document from '../models/Document.js';
import FlashCard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import {extractTextFromPDF} from '../utils/pdfParser.js';
import {chunkText} from '../utils/textChunker.js';
import { promises as fs } from 'fs';
import mongoose from 'mongoose';

export const uploadDocument = async (req, res, next) => {
    try{
        if (!req.file){
            return res.status(400).json({
                success: false,
                error: 'No file uploaded',
                statusCode: 400
            });
        }
        const {title} = req.body;
        if (!title){
            if (req.file){
            await fs.unlink(req.file.path)
            };
            return res.status(400).json({
                success: false,
                error: 'Title is required',
                statusCode: 400
            });
        }

        const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 8000}`;
        const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

        const document = await Document.create({
            userId: req.user._id,
            title,
            fileName: req.file.originalname,
            filePath: fileUrl,
            fileSize: req.file.size,
            status: 'processing'
        });

        processPDF(document._id, req.file.path).catch(()=>{
            console.log('PDF processing failed');
        })

        res.status(201).json({
            success: true,
            data: document,
            message: 'Document uploaded successfully and is being processed'
        })

    }catch(error){
        if (req.file) {
            await fs.unlink(req.file.path).catch(()=>{})
        }
        next(error);
    }
}

// Helper function to process PDF
const processPDF = async (documentId, filePath) => {
    try{
        const {text} = await extractTextFromPDF(filePath);

        const chunks = chunkText(text, 500,50);
        await Document.findByIdAndUpdate(documentId,{
            extractedText: text,
            chunks: chunks,
            status: 'ready'
        });

        console.log(`Document ${documentId} processed successfully.`);
    }catch(error){
        console.error('Error processing PDF:', error.message);
        await Document.findByIdAndUpdate(documentId,{
            status: 'error'
        }); 
    }}

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
        $sort: { uploadDate: -1 }
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



export const getDocumentById = async (req,res,next) => {
    try {
        const document =  await Document.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!document){
            return res.status(404).json({
                success: false,
                error: 'Document not found',
                statusCode: 404
            });
        }

        const [flashcardsCount, quizzesCount] = await Promise.all([
  FlashCard.countDocuments({ documentId: document._id, userId: req.user._id }),
  Quiz.countDocuments({ documentId: document._id, userId: req.user._id })
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
    }catch(error){
        next(error);
    }
}

export const deleteDocument = async (req,res,next) => {
    try{
        const document = await Document.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!document){
            return res.status(404).json({
                success: false,
                error: 'Document not found',
                statusCode: 404
            });
        }

        await fs.unlink(`./uploads/${document.fileName}`).catch(()=>{});

        await document.deleteOne();
        
        await FlashCard.deleteMany({
            documentId: document._id,
            userId: req.user._id
        });
        await Quiz.deleteMany({
            documentId: document._id,
            userId: req.user._id
        });
        return res.status(200).json({
            success: true,
            message: 'Document and associated data deleted successfully'
        }); 
    }catch(error){
        next(error);
    }
}