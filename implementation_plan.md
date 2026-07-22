# Integrate Paystack for User Top-Ups

This plan details the steps required to replace the mock top-up functionality with a real Paystack integration for wallet top-ups.

## Proposed Changes

### Backend Components

#### [MODIFY] [EscrowService.java](file:///c:/Users/NUKE/Desktop/newnewSAFETRADE/safetrade/backend/src/main/java/com/safetrade/safetradebackend/service/EscrowService.java)
- Add a new method `initializeTopUp(String email, Double amount)` that calls the Paystack `/transaction/initialize` API specifically for top-ups. We will generate a unique reference like `topup_<uuid>`.
- Add a new method `verifyTopUpPayment(String reference)` that calls the Paystack `/transaction/verify/` API. Instead of just returning boolean, it will parse the response to extract the actual payment amount if successful, ensuring we credit the exact amount paid.

#### [MODIFY] [UsersController.java](file:///c:/Users/NUKE/Desktop/newnewSAFETRADE/safetrade/backend/src/main/java/com/safetrade/safetradebackend/controller/UsersController.java)
- Remove the old mock `/topup` endpoint.
- Add `POST /topup/initialize` which takes `{ amount }` from the user, uses `EscrowService.initializeTopUp`, and returns the `authorizationUrl` and `reference`.
- Add `POST /topup/verify` which takes the `reference` after the user completes payment. This will call `verifyTopUpPayment`, retrieve the `amount`, and increment the user's `balance`. 
- Implement a simple `Set<String> processedTopUps` in memory to track used references to prevent a user from verifying the same transaction multiple times to inflate their balance.

### Frontend Components

#### [MODIFY] [PortalHome.tsx](file:///c:/Users/NUKE/Desktop/newnewSAFETRADE/safetrade/frontend/components/home/PortalHome.tsx)
- Update the `processTopUp` function to implement a multi-step flow:
  1. Call the new `/users/topup/initialize` endpoint.
  2. Open the returned Paystack `authorizationUrl` using the device's browser (`Linking.openURL`).
  3. Show a confirmation dialog ("Confirm Payment") asking the user to press a button once they have completed the payment in the browser.
  4. On confirmation, call the new `/users/topup/verify` endpoint with the reference.
  5. Upon success, update the local user state to reflect the new balance.

## Verification Plan

### Automated Tests
- N/A - The backend uses mock fallback for Paystack if keys are invalid, ensuring it won't break if test keys aren't set up.

### Manual Verification
- Log in to the application and trigger a top-up.
- Ensure the browser opens the Paystack checkout page (or mock URL if API keys are missing/mocked).
- Ensure that tapping "Confirm Payment" successfully verifies the transaction and accurately updates the wallet balance on the home screen.
- Verify that attempting to confirm the same top-up twice does not double-credit the user.
