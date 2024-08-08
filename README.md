# E-commerce Platform - API README

## Installation and Setup

1. Navigate to the root dir of this repository
2. Install the node version: `nvm install`
3. Install the necessary node packages: `npm install`
4. This application makes use of SQLITE and its in-memory option. If you have SQLITE already on your machine and wish to persit your data, you may change the default db credentials in ./src/app/utils/env-utils
5. Edit the createShipment nocked failure rate in ./src/config **NOTE** Defaults to failing every one in six times
6. Start the application: `npm start`
7  View openapi documentation at /api-docs
8. **OPTIONAL** Import the ./postman.json collection for ease of API testing
9. Enter your authorization token header value as stored in config.ts:
   3ab2eff7-517f-4b69-b851-9e43b96e9ec5
10. Check the ./app/services/nocks/ directory for customer, product, and promo code data for your use

2. Write explanation of why I did things
3. Talk about enhancements/design of flows that I haven't had time to implement
4. Talk about design differences that I'd use instead of shipments (orders/etc)