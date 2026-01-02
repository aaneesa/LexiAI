import mongoose from 'mongoose';
const quizSchema = new mongoose.Schema({
    userId :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: true
    },
    title :{
        type: String,
        required: true,
        trim: true
    },
    questions :[
        {
            question : {
                type: String ,
                required: true,
            },
            options : {
                type: [String],
                required: true,
                validate: [array => array.length === 3 , "A question must have exactly 3 options"]
            },
            correctAnswer: {
                type: String,
                default: ''
            },
            explanation: {
                type: String,
                deafult: ''
            },
            difficulty: {
                type: String,
                enum: ['easy', 'medium', 'hard'],
                required: true
            }

        }
    ],
    userAnswers: [{
        questionIndex: {
            type: Number, 
            required: true
        },
        selectedOption: {
            type: String,
            required: true
        },
        isCorrect: {
            type: Boolean,
            required: true
        },
        answeredAt: {
            type: Date
        },
    }],
    score: {
        type: Number,
        default: 0
    },
    totalQuestions:{
        type:Number,
        default:0
    },
    completedAt: {
        type: Date,
        default: null
    },
}, {
    timestamps: true
}
);
const Quiz = mongoose.model('Quiz', quizSchema);
export default Quiz;