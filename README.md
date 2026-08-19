# PaySphere - Bill Payment Platform

Welcome to **PaySphere**, a premium utility and bill payment application designed to make managing and paying recurring bills seamless, secure, and intuitive.

---

## 📱 What the App is Doing

PaySphere acts as a digital wallet and utility management hub. It provides an all-in-one sandbox and live environment for users to monitor utility transactions, manage balances, and handle multiple billing types:

1. **User Authentication & Profiles**:
   - Secure sign-up, sign-in, and session management using JSON Web Tokens (JWT).
   - Profile customizability (updating name, email, phone number, and setting daily transaction limits).
   - Security-focused features like transaction PIN verification and passcode protection.
   - Dark and light theme preferences preserved across sessions.

2. **Digital Wallet Management**:
   - Live wallet balance tracking.
   - Secure and convenient funding through card or bank payments.
   - Automatic deduction of funds when payments are processed.

3. **Bill Payment Features**:
   - **Airtime Purchase**: Refill mobile lines across major carriers.
   - **Data Bundles**: Purchase internet data subscription packages.
   - **Electricity Bills**: Real-time customer name and address verification for meters, support for prepaid/postpaid, and automatic generation of prepaid tokens.
   - **Cable TV**: Instant customer verification by Smartcard/IUC number, supporting various cable TV packages.

4. **Analytics & Notifications**:
   - Interactive transaction history with receipts for completed payments.
   - Visual distribution analysis of expenses (utility distribution and monthly trends).
   - Dynamic notification drawer alerting users of deposits and successful bill orders.

---

## 💳 How the Payment is Successful

PaySphere processes transactions using two primary gateways: **Paystack** for incoming wallet deposits, and **ClubKonnect** for outgoing bill payments.

### 1. Wallet Funding (Depositing)
* When a user inputs an amount to fund their wallet, the client makes a request to initialize the payment.
* Once the user pays via the Paystack page, Paystack dispatches a secure webhook payload to `/api/paystack/webhook`.
* **Webhook Verification**:
  1. The server extracts the `x-paystack-signature` header.
  2. It computes a hash of the raw request body using `HMAC-SHA512` and the server's private `PAYSTACK_SECRET_KEY`.
  3. If the calculated hash matches the signature header, the event is authentic.
  4. The server increments the user's `wallet_balance` in the database, inserts a `funding` transaction record, and creates a success notification.

### 2. Bill Payments (Expending)
* When a user initiates a bill payment:
  1. The server checks the user's database entry to confirm their current `wallet_balance` is greater than or equal to the transaction amount.
  2. If sufficient, the server attempts to process the transaction.
  3. **Gateway Integration**:
     * **Live Mode**: If the `CLUBKONNECT_USER_ID` and `CLUBKONNECT_API_KEY` are configured in `.env`, the server makes HTTP GET requests directly to Nellobyte Systems (ClubKonnect API). If the API response contains `ORDER_COMPLETED` or `ORDER_RECEIVED`, the transaction is marked successful. For electricity prepaid bills, the returned token is stored.
     * **Demo Mode**: If the API keys are not configured, the server runs in **Demo Mode**, bypassing external calls, simulating a successful provider response, and generating random prepaid electricity tokens.
  4. Upon success, the server deducts the amount from the user's `wallet_balance`, records the bill payment in the `transactions` table, and adds a notification.

---

## 👑 The Founder

PaySphere was created and developed by:

* **Victory** ([GitHub Profile: Victory364](https://github.com/Victory364))

Victory designed and implemented the architecture, front-end state management, security features (including the transaction limit PIN controls), and the backend services for routing database transactions and external provider integrations.
