import { getAllLPs } from '../pages/api/lps';

// Write a test for the getLPTokens function
describe('getLPTokens', () => {
  test('returns an array of LP tokens', async () => {
    const result = await getAllLPs();
    console.log("result ", result);
    expect(Array.isArray(result)).toBe(true);
  });
});