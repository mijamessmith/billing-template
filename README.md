# E-commerce Platform - API README

## Index
1. [Installation and Setup](#installation-and-setup)
2. [API Design Notes](#api-design-notes)
3. [Alternative API Design Thoughts](#alternative-api-design-thoughts)
4. [Additional API Features Not Present](#additional-api-features-not-present)

## Installation and Setup

1. **Navigate to the root directory of this repository**
2. **Install the node version**: `nvm install`
3. **Install the necessary node packages**: `npm install`
4. **SQLite Configuration**:
   - This application uses SQLite with its in-memory option.
   - If you wish to persist your data and have SQLite installed on your machine, change the default database credentials in `./src/app/utils/env-utils`.
5. **Edit Shipment Nock Failure Rate**:
   - Modify the failure rate for the `createShipment` nock in `./src/config`.
   - **Note**: Defaults to failing once every six times.
6. **Start the application**: `npm start`
7. **View OpenAPI Documentation**:
   - Documentation is available at `/api-docs`.
   - **Note**: No authorization header is needed for this route.
8. **Optional**: Import the `./postman.json` collection for easier API testing.
9. **Authorization Token**:
   - Enter your authorization token header value as stored in `config.ts`: `3ab2eff7-517f-4b69-b851-9e43b96e9ec5`.
10. **Check Mock Data**:
    - Mock data for customers, products, and promo codes can be found in the `./app/services/nocks/` directory.

## API Design Notes

This API separates a customer's balance (made up of a log of line items), their purchases (transactions), and all external API data models: promo-codes, customers, products, and shipments. The neutrality of the line items keeps the ledger system open for use by other external APIs that may want to add different kinds of product or metering charges in the future.

Several considerations ensure the acidity of line items:
- A unique `ledger_id` (UUID)
- A server-side lock system
- A datastore-side transaction rollback system

## Alternative API Design Thoughts

In general, an additional entity, `ORDERS`, could be implemented to link together multiple shipments of different purchase types. Orders could:
- Group shipments to the same shipping address
- Allow multiple billing sources
- Articulate additional customer information
- Provide another layer of relationships to solve data issues

A customer could have many orders, each with many shipments, and these could be invoiced together.

## Additional API Features Not Present

1. **Payload Validation**:
   - To expedite the application launch, a payload/request schema verification tool, such as JSON Schema validation or GraphQL, was not implemented.

2. **User Roles and Permissions**:
   - Essential for an accounting system, these deserve their own API and would strictly control access to the accounting API.

3. **Request Failures**:
   - Handling request failures, especially shipment creation, would typically involve an SQS for request retries and a corresponding DLQ. Alternatively, a Billing Service could handle fallout.

4. **Notification API**:
   - The shipment API should call a notification API after successfully creating a shipment. Additionally, a notification system within the customer balance API would ensure a user's client application is aware of any balance changes or purchase transactions.

5. **Invoicing**:
   - After creating a shipment, a message would be queued to a pub/sub system to create an invoice for the customer. This invoice would combine shipment, product, customer, and transaction data into an HTML template for email and PDF invoices.

Feel free to use this revised README to provide clear and structured information about your API.