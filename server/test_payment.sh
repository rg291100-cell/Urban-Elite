#!/bin/bash

# Test Payment API on Render
# This simulates exactly what the mobile app does

echo "=== Testing Payment Gateway on Render ==="
echo ""

# Step 1: Login to get a real token
echo "Step 1: Getting authentication token..."
LOGIN_RESPONSE=$(curl -s https://urban-elite-api1.onrender.com/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rishabh@example.com",
    "password": "password123"
  }')

echo "Login Response: $LOGIN_RESPONSE"
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "ERROR: Failed to get token. Trying with a test user..."
  # Try creating a test user first
  curl -s https://urban-elite-api1.onrender.com/api/auth/signup \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Test User",
      "email": "testpayment@example.com",
      "password": "test123",
      "phone": "9999999999",
      "role": "USER"
    }'
  
  # Login again
  LOGIN_RESPONSE=$(curl -s https://urban-elite-api1.onrender.com/api/auth/login \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{
      "email": "testpayment@example.com",
      "password": "test123"
    }')
  
  TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
fi

echo "Token: ${TOKEN:0:20}..."
echo ""

# Step 2: Create Payment Order
echo "Step 2: Creating payment order..."
PAYMENT_RESPONSE=$(curl -s https://urban-elite-api1.onrender.com/api/payments/create-order \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "orderAmount": "100",
    "orderCurrency": "INR",
    "customerPhone": "9999999999",
    "customerName": "Test User",
    "customerEmail": "test@example.com"
  }')

echo "Payment Response:"
echo "$PAYMENT_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$PAYMENT_RESPONSE"
echo ""

# Check if payment_session_id exists
if echo "$PAYMENT_RESPONSE" | grep -q "payment_session_id"; then
  echo "✅ SUCCESS: Payment order created successfully!"
else
  echo "❌ FAILED: Payment order creation failed"
  echo "Check the error message above"
fi
