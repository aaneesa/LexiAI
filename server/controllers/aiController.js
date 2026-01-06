import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import ChatHistory from '../models/ChatHistory.js';

import {
    generateFlashcardsAI,
    generateQuizAI,
    generateSummaryAI,
    explainConceptAI,
    chatWithContextAI,
} from '../utils/geminiService.js';

import { findRelevantChunks } from '../utils/textChunker.js';

/* =========================
   FLASHCARDS
========================= */

export const generateFlashcards = async (req, res, next) => {
    try {
        const { documentId, count = 10 } = req.body;

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready',
        });

        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        const cards = await generateFlashcardsAI(
            document.extractedText,
            Number(count)
        );

        const flashcardSet = await Flashcard.create({
            userId: req.user._id,
            documentId,
            cards,
        });

        res.status(201).json({ success: true, data: flashcardSet });
    } catch (err) {
        next(err);
    }
};

/* =========================
   QUIZ
========================= */

export const generateQuiz = async (req, res, next) => {
    try {
        const { documentId, count = 5 } = req.body;

        const document = await Document.findById(documentId);
        if (!document) return res.status(404).json({ error: 'Document not found' });

        const questions = await generateQuizAI(document.extractedText, count);

        const quiz = await Quiz.create({
            userId: req.user._id,
            documentId,
            questions,
        });

        res.json({ success: true, data: quiz });
    } catch (err) {
        next(err);
    }
};

/* =========================
   SUMMARY
========================= */

export const generateSummary = async (req, res, next) => {
    try {
        const { documentId } = req.body;
        const document = await Document.findById(documentId);

        const summary = await generateSummaryAI(document.extractedText);
        res.json({ success: true, summary });
    } catch (err) {
        next(err);
    }
};

/* =========================
   CHAT
========================= */

export const chat = async (req, res, next) => {
    try {
        const { documentId, question } = req.body;

        const document = await Document.findById(documentId);
        const chunks = findRelevantChunks(document.chunks, question);

        const answer = await chatWithContextAI(question, chunks);

        await ChatHistory.create({
            userId: req.user._id,
            documentId,
            messages: [
                { role: 'user', content: question },
                { role: 'assistant', content: answer },
            ],
        });

        res.json({ success: true, answer });
    } catch (err) {
        next(err);
    }
};

/* =========================
   EXPLAIN
========================= */

export const explainConcept = async (req, res, next) => {
    try {
        const { documentId, concept } = req.body;
        const document = await Document.findById(documentId);

        const explanation = await explainConceptAI(
            concept,
            document.extractedText
        );

        res.json({ success: true, explanation });
    } catch (err) {
        next(err);
    }
};

/* =========================
   CHAT HISTORY
========================= */

export const getChatHistory = async (req, res, next) => {
    try {
        const history = await ChatHistory.find({
            userId: req.user._id,
            documentId: req.params.documentId,
        }).sort({ createdAt: 1 });

        res.json({ success: true, data: history });
    } catch (err) {
        next(err);
    }
};


