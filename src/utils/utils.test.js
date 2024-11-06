import { describe, expect, test } from '@jest/globals';

import { suspensionData } from '../SuspensionData';
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
    const result = utils.filterRidesForSpecificBike(testData.userRides, testData.enduroInfo);
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
      }),
    ).toEqual(testData.userRides);
  });
});

describe('formatBikeDetails', () => {
  test('it should return a bike object with id, name, brand_name, model_nam, and frame_type', () => {
    expect(utils.formatBikeDetails([testData.enduroInfo, testData.bikeMissingModelAndBrand])).toEqual([
      {
        id: 'b9082682',
        name: 'Enduro',
        brand_name: 'Specialized',
        model_name: 'Enduro',
        frame_type: 'Mountain Bike',
      },
      {
        id: 'unknownBike',
        name: 'My bike',
        brand_name: '',
        model_name: 'My bike',
        frame_type: 'Mountain Bike',
      },
    ]);
  });
});

describe('calculateRebuildLife', () => {
  const createRebuildLifeResult = (selectedSuspensionData, rebuildDate, onBike) =>
    utils.calculateRebuildLife(
      selectedSuspensionData.id,
      rebuildDate,
      testData.userRides,
      onBike.id,
      testData.userBikes,
    );

  test('it should calculate the rebuild life for a known bike', () => {
    const rockshoxRearShockData = suspensionData[1];
    const knownBike = testData.userBikes[0];

    const result1 = createRebuildLifeResult(rockshoxRearShockData, '2024-9-20', knownBike);
    expect(result1).toEqual(0.951253);

    const result2 = createRebuildLifeResult(rockshoxRearShockData, '2024-10-4', knownBike);
    expect(result2).toEqual(1);

    const result3 = createRebuildLifeResult(rockshoxRearShockData, '2024-9-13', knownBike);
    expect(result3).toEqual(0.922574);
  });

  test('it should use all rides after rebuild date if bike is unknown', () => {
    const ohlinsForkSusData = suspensionData[5];
    const unknownBike = { id: 'unknownBike' };

    const result1 = createRebuildLifeResult(ohlinsForkSusData, '2024-9-23', unknownBike);
    expect(result1).toEqual(0.910822);
  });
});
