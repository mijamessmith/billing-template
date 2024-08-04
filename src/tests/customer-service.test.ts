import CustomerService from "../app/services/customer-service";

describe('The Customer Service', () => {
  const service = new CustomerService();

  it('exists', () => {
    expect(service).toBeTruthy;
  })
});