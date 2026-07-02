const User = require('../models/User');
const Group = require('../models/Group');

// Get Top 5 Languages for a Pie Chart
exports.getLanguageStats = async (req, res) => {
    try {
        const topLanguages = await User.aggregate([
            { $unwind: "$language" }, // will count unique languages across all users, even if a user speaks multiple languages
            
            { $group: {  // Count occurances of each language
                _id: "$language", 
                count: { $sum: 1 } 
            }},
            
            { $sort: { count: -1 } }, // Sort by count descending
            
            { $limit: 5 } // Limit to the top 5 languages
        ]);

        res.status(200).json({
            message: "Language statistics fetched successfully",
            data: topLanguages
        });

    } catch (err) {
        res.status(500).json({ message: "Error fetching language stats", error: err.message });
    }
};

// Get Most Popular Groups for a Horizontal Bar Chart
exports.getPopularGroups = async (req, res) => {
    try {
        const popularGroups = await Group.aggregate([
            // Select only the fields we need, and calculate the size of the members array
            { 
                $project: { 
                    name: 1, 
                    description: 1, 
                    memberCount: { $size: "$members" } // Count how many members are in each group
                } 
            },
            
            { $sort: { memberCount: -1 } }, // Sort by memberCount in descending order
            
            { $limit: 5 } // Limit to the top 5 groups
        ]);

        res.status(200).json({
            message: "Popular groups fetched successfully",
            data: popularGroups
        });

    } catch (err) {
        res.status(500).json({ message: "Error fetching popular groups", error: err.message });
    }
};