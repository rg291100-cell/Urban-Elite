# Ads & Job Openings Implementation Plan

## Overview
Implemented a unified system for Vendors to post both **Promotional Offers** and **Job Openings**, and for Users to view them in separate tabs.

## Changes Made

### 1. Database (Migration Required)
- Added a `type` column to the `offers` table to distinguish between `'PROMOTION'` and `'JOB'`.
- **Action Required**: Please run the SQL script located at `server/migrations/add_offer_type.sql` in your Supabase SQL Editor.

### 2. Backend (Server)
- Updated `offersController.js` to accept and store the `type` field when creating an offer.
- Defaulted `type` to `'PROMOTION'` for backward compatibility.

### 3. Frontend (Mobile App)
- **Vendor App**: Updated `VendorCreateOfferScreen` to include a "Type" selector (Promotion vs Job Opening). The form fields dynamically update labels based on the selected type (e.g., "Discount Amount" becomes "Salary Range").
- **User App**: Updated `AdsScreen` to feature two tabs: "Promotions" and "Job Openings". Job cards have a distinct design, highlighting the Company/Vendor name and "Hiring" status.

## Verification Steps
1. **Run Migration**: Execute the SQL script.
2. **Vendor Side**: Go to "Create Offer" -> "Post Job Opening". Fill in details and Submit.
3. **User Side**: Go to "Ads" screen -> Switch to "Job Openings" tab. Verify the new job post appears.
