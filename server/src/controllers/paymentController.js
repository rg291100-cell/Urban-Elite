const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const CASHFREE_ENV = process.env.CASHFREE_ENV || 'SANDBOX';

const BASE_URL = CASHFREE_ENV === 'PRODUCTION'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';

const supabase = require('../config/database');

const createOrder = async (req, res) => {
    try {
        const { orderAmount, orderCurrency, customerId, customerPhone, customerName, customerEmail } = req.body;
        const userId = req.user?.id; // authMiddleware adds this as req.user.id

        const orderId = `ORDER_${Date.now()}`;
        const requestData = {
            order_amount: parseFloat(orderAmount),
            order_currency: orderCurrency || "INR",
            order_id: orderId,
            customer_details: {
                customer_id: userId || customerId || "GUEST_USER",
                customer_phone: customerPhone || "9999999999",
                customer_name: customerName || "Urban Elite User",
                customer_email: customerEmail || "user@example.com"
            },
            order_meta: {
                return_url: `http://localhost:3000/api/payments/verify?order_id=${orderId}`
            }
        };

        const response = await axios.post(`${BASE_URL}/orders`, requestData, {
            headers: {
                'Content-Type': 'application/json',
                'x-client-id': CASHFREE_APP_ID,
                'x-client-secret': CASHFREE_SECRET_KEY,
                'x-api-version': '2023-08-01'
            }
        });

        res.json(response.data);

    } catch (error) {
        console.error("Error creating order:", error.response ? error.response.data : error.message);
        res.status(500).json({
            message: "Failed to create order",
            error: error.response ? error.response.data : error.message
        });
    }
};

const verifyPayment = async (req, res) => {
    try {
        console.log('Verify Payment Called. User:', req.user); // DEBUG
        const { orderId } = req.body;
        console.log('Verifying Order ID:', orderId); // DEBUG

        const response = await axios.get(`${BASE_URL}/orders/${orderId}/payments`, {
            headers: {
                'Content-Type': 'application/json',
                'x-client-id': CASHFREE_APP_ID,
                'x-client-secret': CASHFREE_SECRET_KEY,
                'x-api-version': '2023-08-01'
            }
        });

        const payments = response.data;
        // console.log('Cashfree Payments Response:', JSON.stringify(payments)); // DEBUG

        const successPayment = payments.find(p => p.payment_status === 'SUCCESS');
        const { type } = req.body;

        if (successPayment) {
            console.error('DEBUG: Found Success Payment. Amount:', successPayment.payment_amount); // DEBUG

            if (type === 'TOPUP') {
                console.error('DEBUG: Skipping transaction insert for TOPUP (handled by userController).');
                return res.json(response.data);
            }

            console.error('DEBUG: Transaction User ID:', req.user.id);

            // Check if transaction already exists (Idempotency via Title)
            const txTitle = `Service Booking Payment #${orderId}`;
            const { data: existingTx, error: findError } = await supabase
                .from('transactions')
                .select('*')
                .eq('title', txTitle)
                .single();

            if (findError && findError.code !== 'PGRST116') { // PGRST116 is "Row not found"
                console.error('DEBUG: Error checking existing tx:', findError);
            }

            if (!existingTx) {
                console.error('DEBUG: Inserting new transaction...');
                // Insert transaction
                const payload = {
                    user_id: req.user.id,
                    amount: successPayment.payment_amount,
                    type: 'debit',
                    title: txTitle, // Store Order ID in title
                    tag: 'Booking', // Use 'Booking' tag
                    date: new Date().toISOString()
                };
                // Removed: payment_method_id, status (columns prevent insert if not in schema)

                console.error('DEBUG: Payload:', JSON.stringify(payload));

                const { error: txError, data: insertedTx } = await supabase
                    .from('transactions')
                    .insert(payload)
                    .select();

                if (txError) {
                    console.error('DEBUG: Failed to log transaction:', txError);
                } else {
                    console.error('DEBUG: Transaction Logged Successfully:', insertedTx);
                }
            } else {
                console.error('DEBUG: Transaction already exists:', existingTx);
            }
        } else {
            console.error('DEBUG: No success payment found in Cashfree response. Statuses:', payments.map(p => p.payment_status));
        }

        res.json(response.data);
    } catch (error) {
        console.error("Error verifying payment:", error.response ? error.response.data : error.message);
        res.status(500).json({ message: "Failed to verify payment" });
    }
};

module.exports = {
    createOrder,
    verifyPayment
};
