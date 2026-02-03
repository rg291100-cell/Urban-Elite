require('dotenv').config({ path: '.env' });
const { supabase } = require('../lib/supabase');

async function debugBalance() {
    console.log('Fetching transactions...');

    const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Found ${transactions.length} transactions.`);

    let calculatedBalance = 0;

    transactions.forEach((tx, index) => {
        const originalAmount = tx.amount;
        const cleanAmount = String(tx.amount).replace(/[^0-9.-]+/g, "");
        const val = parseFloat(cleanAmount) || 0;

        let type = tx.type;
        let action = 'IGNORE';

        if (type === 'credit') {
            calculatedBalance += val;
            action = 'ADD';
        } else if (type === 'debit') {
            calculatedBalance -= val;
            action = 'SUBTRACT';
        }

        console.log(`[${index}] Type: ${type}, Org: "${originalAmount}", Clean: "${cleanAmount}", Val: ${val} -> ${action}`);
    });

    console.log('-----------------------------');
    console.log(`FINAL CALCULATED BALANCE: ₹${calculatedBalance}`);
}

debugBalance();
