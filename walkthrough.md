# Walkthrough: Paystack Top-Up Integration

I have successfully updated the application to use Paystack for wallet top-ups.

## Changes Made

### 1. Backend Payment Services
- Added `initializeTopUp` and `verifyTopUpPayment` methods to the `EscrowService`. These methods handle communication directly with Paystack's API to generate dynamic checkout URLs and to securely verify payment amounts.

### 2. Backend Top-Up Endpoints
- Replaced the direct balance modification endpoint with a two-step secure process in `UsersController`:
  - **`/topup/initialize`**: Passes the amount to Paystack and returns the authorization URL and transaction reference.
  - **`/topup/verify`**: Takes the returned reference and cross-references it with Paystack to confirm the payment was successful. It then securely increments the user's wallet balance by the exact amount paid. We also ensure that no transaction reference can be processed twice to prevent double crediting.

### 3. Frontend Top-Up Flow
- Updated the "Top Up" button logic in `PortalHome.tsx`.
- Instead of instantly crediting the wallet locally, the app now:
  - Fetches the payment link from the new initialization endpoint.
  - Uses `Linking` to automatically open the Paystack payment portal in the device's browser (or a new tab on web).
  - Presents an alert dialog allowing the user to tap **"Confirm Payment"** once they have finished paying.
  - Automatically queries the `/topup/verify` endpoint upon confirmation, and if successful, accurately updates the on-screen balance.

## Verification
You can manually test this by logging into your account and clicking "Top Up". You should see the browser immediately open Paystack's mock checkout (or real checkout if your API keys are live). After completing the payment, return to the app and click "Confirm Payment" to see your new balance.
