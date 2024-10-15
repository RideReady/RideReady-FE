import { describe, expect, test } from '@jest/globals';

import * as utils from './utils';
import * as testData from './utilsTestData';

describe('getGearIdNumbers', () => {
  test('it should correctly filter rides', () => {
    const result = utils.getGearIDNumbers(testData.userRides);
    const expectedResult = ['b1979857', 'b9082682'];

    expectedResult.forEach((gearId) => {
      expect(result).toContainEqual(gearId);
    });
  });
});

describe('filterRidesForSpecificBike', () => {
  test('it should filter correctly for bikes with a gearId', () => {
    const result = utils.filterRidesForSpecificBike(
      testData.userRides,
      testData.enduroInfo
    );
    const expectedResult = [
      {
        id: 12568910646,
        user_id: 391197,
        ride_duration: 5651,
        ride_distance: 12193.4,
        ride_date: '2024-10-03T22:29:00Z',
        gear_id: 'b9082682',
      },
      {
        id: 12536113718,
        user_id: 391197,
        ride_duration: 15915,
        ride_distance: 61610.8,
        ride_date: '2024-09-29T16:19:39Z',
        gear_id: 'b9082682',
      },
      {
        id: 12470473859,
        user_id: 391197,
        ride_duration: 13532,
        ride_distance: 45928.5,
        ride_date: '2024-09-21T16:32:49Z',
        gear_id: 'b9082682',
      },
      {
        id: 12442540457,
        user_id: 391197,
        ride_duration: 5879,
        ride_distance: 12885.7,
        ride_date: '2024-09-18T13:28:49Z',
        gear_id: 'b9082682',
      },
      {
        id: 12411438719,
        user_id: 391197,
        ride_duration: 14770,
        ride_distance: 59680,
        ride_date: '2024-09-14T17:20:16Z',
        gear_id: 'b9082682',
      },
    ];

    expectedResult.forEach((ride) => {
      expect(result).toContainEqual(ride);
    });
  });

  test('it should return all rides for unknownBike', () => {
    expect(
      utils.filterRidesForSpecificBike(testData.userRides, {
        id: 'unknownBike',
      })
    ).toEqual(testData.userRides);
  });
});

// describe('calculateRideTimeSinceLastRebuild', () => {
//   test('it should calculate the amount of minutes the suspension has been ridden since a given rebuild date', () => {});
// });
