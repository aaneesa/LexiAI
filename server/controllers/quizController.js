import Quiz from '../models/Quiz.js';

export const getQuizzes = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    const quizzes = await Quiz.find({
      userId: req.user._id,
      documentId
    })
    .populate('documentId', 'title')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes,
      message: 'Quizzes fetched successfully'
    });
  } catch (error) {
    next(error);
  }
};


export const getQuizzesById = async (req, res, next) => {
    try{
        const quiz = await Quiz.findOne({ _id: req.params.id, userId: req.user._id })
        .populate('documentId', 'title');
        if(!quiz){
            return res.status(404).json({
                success: false,
                message: 'Quiz not found',
                statusCode: 404
            });
        }
        res.status(200).json({
            success: true,
            data: quiz,
            message: 'Quiz fetched successfully'
        });
    }catch(error){
       next(error); 
    }
}
export const submitQuiz = async (req, res, next) => {
    try {
        const { answers } = req.body;

        if (!Array.isArray(answers)) {
            return res.status(400).json({ success: false, message: 'Answers must be an array' });
        }

        const quiz = await Quiz.findOne({ _id: req.params.id, userId: req.user._id });
        if (!quiz) {
            return res.status(404).json({ success: false, message: 'Quiz not found' });
        }

        if (quiz.completedAt) {
            return res.status(400).json({ success: false, message: 'Quiz already submitted' });
        }

        let score = 0;

        quiz.userAnswers = quiz.questions.map((q, i) => {
            const selected = answers[i];
            const isCorrect = q.correctAnswer === selected;
            if (isCorrect) score++;

            return {
                questionIndex: i,
                selectedOption: selected,
                isCorrect,
                answeredAt: new Date()
            };
        });

        quiz.score = score;
        quiz.totalQuestions = quiz.questions.length;
        quiz.completedAt = new Date();

        await quiz.save();

        res.status(200).json({
            success: true,
            data: { score, total: quiz.totalQuestions },
            message: 'Quiz submitted successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const getQuizMarks = async (req, res, next) => {
    try{
        const quiz = await Quiz.findOne({ _id: req.params.id, userId: req.user._id });
        if(!quiz){
            return res.status(404).json({
                success: false,
                message: 'Quiz not found',
                statusCode: 404
            });
        }
        if (!quiz.completedAt) {
            return res.status(400).json({
                success: false,
                message: 'Quiz has not been submitted yet',
                statusCode: 400
            });
        }
        res.status(200).json({
            success: true,
            data: { score: quiz.score, total: quiz.questions.length },
            message: 'Quiz marks fetched successfully'
        });
    }catch(error){
       next(error); 
    }
}
export const deleteQuiz = async (req, res, next) => {
    try{
        const quiz = await Quiz.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if(!quiz){
            return res.status(404).json({
                success: false,
                message: 'Quiz not found',
                statusCode: 404
            });
        }
        res.status(200).json({
            success: true,
            message: 'Quiz deleted successfully'
        });
    }catch(error){
       next(error); 
    }
}

