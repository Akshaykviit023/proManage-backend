import Card from "../models/Card.js";
import User from "../models/User.js";

export const createCard = async (req, res) => {
    try {
        console.log(req.body)
        const { cardData } = req.body;
        const user = req.user;

        const newCard = new Card({
            title: cardData.title,
            priority: cardData.priority,
            dueDate: cardData.dueDate,
            owner: user._id,
            assignee: cardData.assignee || null,
            category: 'to do'
        });

        newCard.checklist = cardData.checklist.map((task) => ({
            task: task.task,
            completed: task.completed,
        }));

        await newCard.save();
        user.cards.push(newCard._id);
        await user.save()
        res.status(201).json(newCard);
    } catch (error) {
        res.status(500).json({ message: "Failed to create card", error });
    }
};

export const cardDetails = async (req, res) => {
    try {
        const userId = req.user._id;
        const { filter } = req.query;

       
        const today = new Date();
        let startDate;
        let endDate;

        switch (filter) {
            case 'today':
                startDate = new Date(today.setHours(0, 0, 0, 0)); 
                endDate = new Date(today.setHours(23, 59, 59, 999)); 
                break;
            case 'this week':
                const startOfWeek = today.getDate() - today.getDay(); 
                startDate = new Date(today.setDate(startOfWeek));
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + 6); 
                endDate.setHours(23, 59, 59, 999);
                break;
            case 'this month':
                const allCards = await Card.find({ owner: userId });
                return res.status(200).json(allCards);
                
        }

        const filteredCards = await Card.find({
            owner: userId,
            dueDate: { $gte: startDate, $lte: endDate }, 
        });

        res.status(200).json(filteredCards);
    } catch (error) {
        console.error("Error fetching card details:", error);
        res.status(500).json({ message: "Failed to fetch card details", error });
    }
};

export const changeCardCategory = async (req, res) => {
    try {
        const { category, cardId } = req.body;

        if (!category || !cardId) {
            return res.status(400).json({ message: "Category and card ID are required." });
        }

        const card = await Card.findById(cardId);

        if (!card) {
            return res.status(404).json({ message: "Card not found." });
        }

        card.category = category;
        await card.save();

        return res.status(200).json(card);
    } catch (error) {
        console.error("Error changing category:", error);
        return res.status(500).json({ message: "Failed to change category", error });
    }
};

export const deleteCard = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id
        const deletedCard = await Card.findByIdAndDelete(id);
        if (!deletedCard) {
            return res.status(404).json({ message: 'Card not found' });
        }

        await User.findByIdAndUpdate(userId, {
            $pull: { cards: id },
        });

        res.status(200).json({ message: 'Card deleted successfully', deletedCard });
    } catch (error) {
        console.error("Error deleting card:", error);
        return res.status(500).json({ message: "Failed to delete card", error });
    }
}

export const updateCard = async (req, res) => {
    try {
        const updatedCard = await Card.findByIdAndUpdate({ _id: req.params.id }, { $set: req.body }, {new: true});
        if (!updatedCard) {
            return res.status(404).json({ message: 'Card not found' });
        }

        res.status(200).json({ message: 'Card updated successfully', updatedCard });
    } catch (error) {
        console.error("Error updating card:", error);
        return res.status(500).json({ message: "Failed to update card", error });
    }
}

export const getSummary = async (req, res) => {
    const userId = req.user._id;
    
    try {
        const user = await User.findById(userId).populate('cards');
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const cardIds = user.cards.map(card => card._id);

        const results = await Card.aggregate([
            {
                $match: { _id: { $in: cardIds } }
            },
            {
                $facet: {
                    statusCounts: [
                        {
                            $group: {
                                _id: "$category", 
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    priorityCounts: [
                        {
                            $group: {
                                _id: "$priority",
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    dueDateCount: [
                        {
                            $match: { dueDate: { $exists: true } }
                        },
                        {
                            $count: "totalDueDateTasks"
                        }
                    ]
                }
            }
        ]);

        const response = {
            statusCounts: results[0].statusCounts.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            priorityCounts: results[0].priorityCounts.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            totalDueDateTasks: results[0].dueDateCount.length ? results[0].dueDateCount[0].totalDueDateTasks : 0,
        };

        res.json(response);
    } catch (error) {
        console.error("Error fetching user-specific card summaries:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


export const updateChecklist = async (req, res) => {
    const { cardId, itemId } = req.params;
    const { completed } = req.body;

    try {
        const card = await Card.findById(cardId);
        if (!card) {
            return res.status(404).json({ message: 'Card not found' });
        }

        const checklistItem = card.checklist.id(itemId);
        if (!checklistItem) {
            return res.status(404).json({ message: 'Checklist item not found' });
        }

        checklistItem.completed = completed;
        await card.save();

        res.status(200).json({ message: 'Checklist item updated successfully', card });
    } catch (error) {
        console.error("Error updating checklist item:", error);
        res.status(500).json({ message: 'Failed to update checklist item' });
    }
}

export const fetchPublicCard = async (req, res) => {
    const cardId = req.params.cardId;
    try {
        const card = await Card.findById(cardId);
        if (!card) {
            return res.status(404).json({ message: 'Card not found' });
        }

        res.status(200).json({ message: 'card fetched successfully', card });

    } catch (error) {
        console.error("Error fetching card:", error);
        res.status(500).json({ message: 'Failed to fetch card' });
    }
}