# Plug & Play Subscription Boilerplate

Easily integrate **subscription-based pricing** in your app using this boilerplate.  **Powered by [Dodo Payments](https://dodopayments.com)**  


## Project Structure
```
.
├── server/
│   ├── src/
│   │   ├── index.ts (main file)
│   │
│    ├── helper/ (helper functions)
│    │
│   ├── utils/
│   │   ├── auth.ts (better auth service)
│   │   └── supabase.ts (supabase service/ db)
│   │   └── dodopayments.ts (dodopayemnts service)
│   
├── client/ (frontend)
└── setup.sh

```


## Local Setup

Follow these steps to run the app locally:  

### 1. Clone Repository
```bash
git clone https://github.com/<username>/dodo_payments.git
cd dodo_payments
```


### 2. Run setup script
```bash
./setup.sh
```

### 3. Enviroment Variables
   After running the shell file you just need to provide the enviroment variables in the `server` folder in the `.env` .

```
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

DODO_PAYMENTS_API_KEY=
DODO_PAYMENTS_WEBHOOK_SECRET=

BASIC_PRODUCT_ID=
PREMIUM_PRODUCT_ID=
PREMIUM_PLUS_PRODUCT_ID=

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SECRET_KEY=

DATABASE_URL=
```
 
## Webhooks
To test webhooks locally, you can use ngrok.
By default, the server runs on port 3000. Run the following command to create a tunnel and get an https URL that can be used as a webhook endpoint to receive payloads
```
ngrok http 3000
```

## Assumptions, Trade-off and Time Spent
- The frontend code is vibe coded.
- Almost spend a day or one and half to compelete


## Demo

https://github.com/user-attachments/assets/9893c7c1-128f-467b-9bb2-5f66016191de


