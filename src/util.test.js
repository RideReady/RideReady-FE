import { describe, expect, test } from '@jest/globals';

import * as utils from './util';
import * as testData from './utilTestData';

describe('getGearIdNumbers', () => {
  test('it should correctly filter rides', () => {
    const result = utils.getGearIDNumbers(testData.userRides);
    const expectedResult = ['b1979857', 'b9082682'];

    expectedResult.forEach((gearId) => {
      expect(result).toContain(gearId);
    });
  });
});
