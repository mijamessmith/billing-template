import { CUSTOMER_TYPE } from '../service-types/customer-service-types';

export const CUSTOMER_DATA_BY_ID: Record<string, CUSTOMER_TYPE> = {
  '1': {
    id: '009cb5f8-64bb-49a9-86c0-7fe0843dd2e6',
    name: 'John Doe',
    billingAddress: {
      line1: '123 Main St',
      line2: 'Apt 4B',
      city: 'Anytown',
      postalCode: '12345',
      state: 'CA',
      country: 'USA'
    },
    shippingAddress: {
      line1: '123 Main St',
      line2: 'Apt 4B',
      city: 'Anytown',
      postalCode: '12345',
      state: 'CA',
      country: 'USA'
    },
    email: 'john.doe@example.com',
    createdAt: 1627811200000,
    lastModifiedAt: 1627811200000
  },
  '2': {
    id: '456494a7-71f6-4ddf-8f28-4ad5764fadf0',
    name: 'Jane Smith',
    billingAddress: {
      line1: '456 Elm St',
      line2: '',
      city: 'Othertown',
      postalCode: '54321',
      state: 'NY',
      country: 'USA'
    },
    shippingAddress: {
      line1: '456 Elm St',
      line2: '',
      city: 'Othertown',
      postalCode: '54321',
      state: 'NY',
      country: 'USA'
    },
    email: 'jane.smith@example.com',
    createdAt: 1627907600000,
    lastModifiedAt: 1627907600000
  },
  '3': {
    id: 'dbb1216b-03d5-4299-9ca0-8f74ba10ad7e',
    name: 'Alice Johnson',
    billingAddress: {
      line1: '789 Maple Ave',
      line2: 'Suite 100',
      city: 'Somewhere',
      postalCode: '67890',
      state: 'TX',
      country: 'USA'
    },
    shippingAddress: {
      line1: '789 Maple Ave',
      line2: 'Suite 100',
      city: 'Somewhere',
      postalCode: '67890',
      state: 'TX',
      country: 'USA'
    },
    email: 'alice.johnson@example.com',
    createdAt: 1628004000000,
    lastModifiedAt: 1628004000000
  },
  '4': {
    id: '9cad545b-c5fb-409e-bfdf-8f7568818686',
    name: 'Bob Brown',
    billingAddress: {
      line1: '101 Pine St',
      line2: '',
      city: 'Elsewhere',
      postalCode: '13579',
      state: 'FL',
      country: 'USA'
    },
    shippingAddress: {
      line1: '101 Pine St',
      line2: '',
      city: 'Elsewhere',
      postalCode: '13579',
      state: 'FL',
      country: 'USA'
    },
    email: 'bob.brown@example.com',
    createdAt: 1628090400000,
    lastModifiedAt: 1628090400000
  },
  '5': {
    id: '1854bbd2-5fa1-406e-bfad-0c681a23af3a',
    name: 'Charlie Davis',
    billingAddress: {
      line1: '202 Birch Rd',
      line2: 'Apt 2A',
      city: 'Anothertown',
      postalCode: '24680',
      state: 'WA',
      country: 'USA'
    },
    shippingAddress: {
      line1: '202 Birch Rd',
      line2: 'Apt 2A',
      city: 'Anothertown',
      postalCode: '24680',
      state: 'WA',
      country: 'USA'
    },
    email: 'charlie.davis@example.com',
    createdAt: 1628176800000,
    lastModifiedAt: 1628176800000
  }
};