const OpenAI = require('openai');
require('dotenv').config();
const express = require('express') 
const cors = require('cors') 

var app = express(); 
app.use(cors()); 
app.use(express.json());

const API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
    apiKey: API_KEY 
  });

const bankConfigurations = {
    "Amex": {
        dateColumn: 0, 
        costColumn: 2, 
        descriptionColumn: 3 
    },
    "TD": {
        dateColumn: 0,
        costColumn: 1,
        descriptionColumn: 5 
    }
};

var cache = {}

function routes(app) {
    app.post('/api/process-transactions', async (req, res) => {
        try {
            const { data, bankName } = req.body;
            const categorizedTransactions = await processTransactions(bankName, data);
            res.json({ message: 'Success', data: categorizedTransactions });
        } catch (error) {
            console.error('Failed to process transactions:', error);
            res.status(500).json({ message: 'Failed to process transactions', error: error.toString() });
        }
    });
}

async function processTransactions(bankName, csvEntries) {
    const transactions = extractBankData(bankName, csvEntries);
    
    const categorizedTransactions = [];

    for (const transaction of transactions) {
        try {
            const category = await classifyTransaction(transaction.description);
            console.log(category);
            categorizedTransactions.push({
                ...transaction,
                category: category 
            });
        } catch (error) {
            console.error('Failed to classify transaction:', error);
            categorizedTransactions.push({
                ...transaction,
                category: 'Classification Failed' 
            });
        }
    }

    return categorizedTransactions;
}


function extractBankData(bankName, csvEntries) {
    const config = bankConfigurations[bankName];
    if (!config) {
        throw new Error('Bank configuration not found');
    }

    // Filter and map through valid CSV entries
    const validEntries = csvEntries.filter(entry => {
        // Check if all required columns are present and not empty
        return entry[config.dateColumn] && entry[config.costColumn] && entry[config.descriptionColumn];
    }).map(entry => {
        return {
            date: entry[config.dateColumn],
            cost: entry[config.costColumn],
            description: entry[config.descriptionColumn]
        };
    });

    return validEntries;
}

async function classifyTransaction(description) {
    try {
        if (description in cache) {
            return cache[description];
        }
        const response = await openai.chat.completions.create({
            messages: [{ role: "system", content: `Given the following transaction, classify its category into Housing, Groceries, Restaurant, Transportation, Entertainment, Shopping, Subscriptions, Miscellaneous, Payments/Refund: ${description}. Answer with just the category.` }],
            model: "gpt-3.5-turbo",
          });

        if (response && response.choices && response.choices.length > 0) {
            const category = response.choices[0].message.content;
            cache[description] = category;
            return category;
        } else {
            throw new Error('No response from OpenAI.');
        }
    } catch (error) {
        console.error('Error in classifyTransaction:', error);
        throw error;
    }
}

module.exports = routes;