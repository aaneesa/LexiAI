import express from 'express';
import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';


export const getDashboard = async (req, res, next) => {
    try{
        const userId = req.user._id;

        const totalDocuments = await Document.countDocuments({ userId });
        const totalFlashcardsSets = await Flashcard.countDocuments({ userId });
        const totalQuizzes = await Quiz.countDocuments({ userId });
        const completedQuizzes = await Quiz.countDocuments({ userId, completedAt: { $ne: null } });

        const flashcards = await Flashcard.find({ userId });
        let totalFlashcards = 0 ;
        let reviewedFlashcards = 0 ;
        let starredFlashcards = 0 ;

        flashcards.forEach(set => {
            totalFlashcards += set.cards.length;
            reviewedFlashcards += set.cards.filter(card => card.reviewCount > 0).length;
            starredFlashcards += set.cards.filter(card => card.isStarred).length;
        });

        const Quizzes = await Quiz.find({ userId, completedAt: { $ne: null } });
        let averageQuizScore = 0 ;
        if(completedQuizzes > 0){
            const totalScore = Quizzes.reduce((sum, quiz) => sum + quiz.score, 0);
            averageQuizScore = Math.round(totalScore / completedQuizzes, 2);
        }


        const recentDocuments = await Document.find({ userId })
            .sort({ lastAccessed: -1 })
            .limit(5)
            .select('title fileName lastAccessed status');
        
        const recentQuizzes = await Quiz.find({ userId })
            .sort({ completedAt: -1 })
            .limit(5)
            .populate('documentId', 'title')
            .select('title score totalQuestions completedAt')

        const studyStreak = Math.floor(Math.random() * 7) + 1; 

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalDocuments,
                    totalFlashcardsSets,
                    totalFlashcards,
                    reviewedFlashcards,
                    starredFlashcards,
                    totalQuizzes,
                    completedQuizzes,
                    averageQuizScore,
                    studyStreak
                },
                recentActivity: {
                    recentDocuments,
                    recentQuizzes
                }
            }
        })


    }catch(error){
        next(error)
    }
}