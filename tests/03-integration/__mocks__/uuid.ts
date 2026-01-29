// uuid mock for integration tests
let counter = 0;

export const v4 = jest.fn(() => {
  counter++;
  return `mock-uuid-${counter}`;
});
