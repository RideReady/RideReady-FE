import moment from "moment";
import { suspensionData } from "./SuspensionData";

export const testForDeniedPermission = (url) => {
  if (url.split("&")[1] === "error=access_denied") {
    return true;
  }
};

export const stripURLForToken = (url) => {
  if (!url) return;
  return url.split("&")[1].slice(5);
};

export const filterRideActivities = (activities) => {
  const rideActivities = activities.filter((act) => act.type === "Ride");
  return rideActivities;
};

export const cleanRideData = (rides) => {
  const cleanedRides = rides.map((ride) => {
    return {
      id: ride.id,
      user_id: ride.athlete.id,
      ride_duration: ride.moving_time,
      ride_distance: ride.distance,
      ride_date: ride.start_date,
      gear_id: ride.gear_id,
    };
  });
  return cleanedRides;
};

export const getGearIDNumbers = (userRides) => {
  let gearNumbers = userRides.reduce((arr, ride) => {
    let gearID = ride.gear_id;
    if (arr.includes(gearID)) {
      return arr;
    } else if (gearID === null) {
      return arr;
    } else {
      arr.push(gearID);
      return arr;
    }
  }, []);
  return gearNumbers;
};

// Could this be refactored to use filterRidesForSpecificBike?
export const calculateRebuildLife = (
  newSus,
  rebuildDate,
  userRides,
  onBike,
  bikeOptions
) => {
  const suspension = suspensionData.find((sus) => sus.id === +newSus);
  let susBike;
  let ridesOnBike;
  let rideTimeSinceLastRebuild;

  if (onBike.startsWith("b") && bikeOptions) {
    susBike = bikeOptions.find((bike) => bike.id === onBike);
    ridesOnBike = userRides.filter((ride) => ride.gear_id === susBike.id);
  }
  // For known bikes, ridesOnBike is now true
  if (ridesOnBike) {
    rideTimeSinceLastRebuild = ridesOnBike.reduce((total, ride) => {
      if (moment(ride.ride_date).isAfter(rebuildDate)) {
        total += ride.ride_duration;
      }
      return total;
    }, 0);
    // For unknownBike, ridesOnBike is false
  } else {
    rideTimeSinceLastRebuild = userRides.reduce((total, ride) => {
      if (moment(ride.ride_date).isAfter(rebuildDate)) {
        total += ride.ride_duration;
      }
      return total;
    }, 0);
  }
  const hoursSinceLastRebuild = rideTimeSinceLastRebuild / 3600;
  const percentRebuildLifeRemaining =
    1 - hoursSinceLastRebuild / suspension.rebuildInt;
  return percentRebuildLifeRemaining;
};

export const isOldestRideBeforeRebuild = (rides, rebuildDate) => {
  if (!rides) return;
  let today = moment().format();
  const oldestRideDate = rides.reduce((oldest, ride) => {
    if (moment(ride.ride_date).isBefore(oldest)) {
      oldest = ride.ride_date;
    }
    return oldest;
  }, today);
  const lastRideBeforeRebuild = moment(oldestRideDate).isBefore(rebuildDate);
  return lastRideBeforeRebuild;
};

export const findSusIndexByID = (id, susOptions) => {
  const foundSusIndex = susOptions.findIndex((sus) => sus.id === id);
  return foundSusIndex;
};

const findSusInfoById = (sus) => {
  const susInfo = suspensionData.find(
    (susData) => sus.sus_data_id === susData.id
  );
  return susInfo;
};

const findBikeDetailsById = (sus, bikeOptions) => {
  const bikeResult = bikeOptions.find((bike) => bike.id === sus.on_bike_id);

  if (bikeResult) {
    return bikeResult;
  } else {
    return {
      id: "unknownBike",
      brand_name: "Unknown",
      model_name: "Bike",
    };
  }
};

export const convertSuspensionFromDatabase = (sus, bikeOptions) => {
  const foundBike = findBikeDetailsById(sus, bikeOptions);
  const foundSusInfo = findSusInfoById(sus);

  const convertedSus = {
    id: sus.id,
    onBike: foundBike,
    rebuildDate: sus.rebuild_date,
    rebuildLife: sus.rebuild_life,
    susData: foundSusInfo,
    dateCreated: sus.date_created,
    lastRideCalculated: sus.last_ride_calculated,
  };

  return convertedSus;
};

export const convertSusToDatabaseFormat = (sus, userID) => {
  const susDataConverted = {
    id: sus.id,
    user_id: userID,
    rebuild_life: sus.rebuildLife,
    rebuild_date: sus.rebuildDate,
    sus_data_id: sus.susData.id,
    on_bike_id: sus.onBike.id,
    date_created: new Date(),
    last_ride_calculated: sus.lastRideCalculated,
  };

  return susDataConverted;
};

export const isNewestRideAfterLastCalculated = (userRides, sus) => {
  const lastRideCalculatedDate = sus.lastRideCalculated;
  const newestRideOnBikeDate = filterRidesForSpecificBike(
    userRides,
    sus.onBike
  )[0].ride_date;

  if (moment(newestRideOnBikeDate).isAfter(lastRideCalculatedDate)) {
    return true;
  } else {
    return false;
  }
};

export const filterRidesForSpecificBike = (userRides, onBike) => {
  let filteredRides;
  console.log(onBike)
  if (onBike.id !== "unknownBike") {
    filteredRides = userRides.filter((ride) => ride.gear_id === onBike.id);
  } else {
    filteredRides = userRides;
  }
  return filteredRides;
};

export const generateBikeTypeString = (frameTypeIdFromStrava) => {
  switch (frameTypeIdFromStrava) {
    case 1 : return "Mountain Bike";
    case 2 : return "Cross Bike";
    case 3 : return "Road Bike";
    case 4 : return "TT Bike";
    case 5 : return "Gravel Bike";
    default : return "Unknown Bike Type";
  }
}

export const sortUserSuspensionByBikeId = (susArr) => {
  const sortedSusArr = susArr.toSorted((a, b) => {
    if (a.onBike.id < b.onBike.id) {
      return -1;
    } else if (a.onBike.id > b.onBike.id) {
      return 1;
    }
    return 0;
  });
  return sortedSusArr;
}