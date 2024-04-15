const OpenAI = require('openai');
require('dotenv').config();
const express = require('express') 
const cors = require('cors') 

var app = express(); 
app.use(cors()); 
app.use(express.json());

const API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
    apiKey: API_KEY  // Ensure your API key is set in the environment variables
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
    // Extract data using the predefined function
    const transactions = extractBankData(bankName, csvEntries);
    
    // Prepare to handle classification results
    const categorizedTransactions = [];

    // Iterate through each transaction and classify them
    for (const transaction of transactions) {
        try {
            const category = await classifyTransaction(transaction.description);
            console.log(category);
            // Add the classification result to the transaction data
            categorizedTransactions.push({
                ...transaction,
                category: category // Assuming the 'text' field contains the classification
            });
        } catch (error) {
            console.error('Failed to classify transaction:', error);
            // Handle error, for example, by skipping or marking this transaction
            categorizedTransactions.push({
                ...transaction,
                category: 'Classification Failed' // Indicate failure in the result
            });
        }
    }

    return categorizedTransactions;
}


function extractBankData(bankName, csvEntries) {
    // Get the column configuration for the specified bank
    const config = bankConfigurations[bankName];
    if (!config) {
        throw new Error('Bank configuration not found');
    }

    // Map through each CSV entry and extract the necessary columns
    return csvEntries.map(entry => ({
        date: entry[config.dateColumn],
        cost: entry[config.costColumn],
        description: entry[config.descriptionColumn]
    }));
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

// // Example usage:
// const sampleEntries = [
//     ['2022-01-01', 'Food', '$5.00', 'Coffee at Starbucks', '', 'Note'],
//     ['2022-01-02', 'Transport', '$20.00', 'Uber ride', '', 'Note']
// ];

// try {
//     const processedData = extractBankData('Amex', sampleEntries);
//     console.log(processedData);
// } catch (error) {
//     console.error(error.message);
// }


// classifyTransaction("NETFLIX.COM 866-716-0414")
//     .then(category => console.log('Transaction Category:', category))
//     .catch(error => console.error('Failed to classify transaction:', error));

module.exports = routes;