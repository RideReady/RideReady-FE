import { describe, expect, test } from '@jest/globals';

import * as utils from './util';
import * as testData from './utilTestData';

describe('filterRidesForSpecificBike', () => {
  test('it should correctly filter rides', () => {
    const result = utils.filterRidesForSpecificBike(
      testData.userRides,
      testData.enduroInfo
    );
    expect(result).toEqual(false);
  });

  // Cases for unknownBike
});
