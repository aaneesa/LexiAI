import Flashcard from "../models/Flashcard.js";

export const getFlashcards = async (req, res, next) => {
  try {
    const flashcards = await Flashcard.find({
    userId: req.user._id,
    documentId: req.params.documentId
    })
    .populate('documentId', 'title')
    .sort({ createdAt: -1 });


    res.status(200).json({
        success: true,
        count: flashcards.length,
        data: flashcards
    })

  } catch (error) {
    next(error);
  }
}

export const getAllFlashcards = async (req,res,next) => {
    try{
        const flashcards = await Flashcard.find({
        userId: req.user._id,
        })
        .populate('documentId', 'title')
        .sort({ createdAt: -1 });


        res.status(200).json({
            success: true,
            count: flashcards.length,
            data: flashcards
        })
    }catch(error){
        next(error);
    }
}

export const reviewFlashcards = async (req,res,next) => {
    try{
        const flashCardSet = await Flashcard.findOne({'cards._id' : req.params.flashcardId,
            userId: req.user._id
        });
        if (!flashCardSet) {
            return res.status(404).json({
            success: false ,
            error: "Flashcard not found",
            statusCode: 404});
        }
        const cardIndex = flashCardSet.cards.findIndex(card => card._id.toString() === req.params.flashcardId);
        if(cardIndex === -1){
            return res.status(404).json({
                success: false,
                error: "Flashcard not found",
                statusCode: 404
            });
        }

        flashCardSet.cards[cardIndex].reviewCount += 1;

        flashCardSet.cards[cardIndex].lastReviewed = new Date();

        await flashCardSet.save();
        res.status(200).json({
            success: true,
            data: flashCardSet.cards[cardIndex],
            message: "Flashcard reviewed successfully"
        });
    }catch(error){
        next(error);
    }
}

export const toggleStarFlashcard = async (req,res,next) => {
    try{
        const flashCardSet = await Flashcard.findOne({'cards._id' : req.params.flashcardId,
            userId: req.user._id
        });
        if (!flashCardSet) {
            return res.status(404).json({
            success: false ,
            error: "Flashcard not found",
            statusCode: 404});
        }
        const cardIndex = flashCardSet.cards.findIndex(card => card._id.toString() === req.params.flashcardId);
        if(cardIndex === -1){
            return res.status(404).json({
                success: false,
                error: "Flashcard not found",
                statusCode: 404
            });
        }

        flashCardSet.cards[cardIndex].isStarred = !flashCardSet.cards[cardIndex].isStarred;
        
        await flashCardSet.save();
        res.status(200).json({
            success: true,
            data: flashCardSet.cards[cardIndex],
            message: "Flashcard star status toggled successfully"
        });
    }catch(error){
        next(error);
    }
}

export const deleteFlashcard = async (req, res, next) => {
  try {
    const flashCardSet = await Flashcard.findOne({
      userId: req.user._id,
      'cards._id': req.params.flashcardId
    });

    if (!flashCardSet) {
      return res.status(404).json({
        success: false,
        error: "Flashcard not found"
      });
    }

    flashCardSet.cards = flashCardSet.cards.filter(
      card => card._id.toString() !== req.params.flashcardId
    );

    await flashCardSet.save();

    res.status(200).json({
      success: true,
      message: "Flashcard deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};
