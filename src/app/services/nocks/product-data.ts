import { PRODUCT_TYPE } from '../service-types/product-service-types';

export const PRODUCT_DATA_BY_ID: Record<string, PRODUCT_TYPE> = {
  '1': {
    id: '196b40fb-f567-4344-a85c-17627b3e5a55',
    sku: 'GT-001',
    name: 'Garden Shovel',
    description: 'Heavy-duty garden shovel for all your digging needs.',
    price: 20,
    createdAt: 1627811200000,
    lastModifiedAt: 1627811200000
  },
  '2': {
    id: '98199c88-1429-490b-b136-51988b55a334',
    sku: 'GT-002',
    name: 'Pruning Shears',
    description: 'Precision pruning shears for trimming plants and bushes.',
    price: 30,
    createdAt: 1627907600000,
    lastModifiedAt: 1627907600000
  },
  '3': {
    id: '43443d88-bb21-41be-a942-76e32a32e171',
    sku: 'GT-003',
    name: 'Garden Rake',
    description: 'Durable garden rake for gathering leaves and debris.',
    price: 40,
    createdAt: 1628004000000,
    lastModifiedAt: 1628004000000
  },
  '4': {
    id: '81e055f2-b99e-4492-b9a2-3e4d31092cb0',
    sku: 'GT-004',
    name: 'Watering Can',
    description: 'Large capacity watering can for easy plant watering.',
    price: 50,
    createdAt: 1628090400000,
    lastModifiedAt: 1628090400000
  },
  '5': {
    id: '89a3be94-e69a-448e-a997-9b31dc617c98',
    sku: 'GT-005',
    name: 'Garden Hose',
    description: 'Sturdy garden hose for personal garden watering.',
    price: 60,
    createdAt: 1628176800000,
    lastModifiedAt: 1628176800000
  }
};
