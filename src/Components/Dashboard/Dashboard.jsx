import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "../Container/Container";
import "./Dashboard.css";
import PropTypes from "prop-types";
import {
  editUserSuspensionInDatabase,
  loadUserSuspensionFromDatabase,
} from "../../Services/APICalls";
import {
  calculateRebuildLife,
  convertSuspensionFromDatabase,
  isNewestRideAfterLastCalculated,
  filterRidesForSpecificBike,
  convertSusToDatabaseFormat,
} from "../../util";

export default function Dashboard({
  userID,
  userSuspension,
  setUserSuspension,
  setSelectedSuspension,
  userBikes,
  // setUserBikes,
  userRides,
}) {
  const [loadingSus, setLoadingSus] = useState("");
  const [buttonLink, setButtonLink] = useState("/dashboard/add-new-part");
  const [buttonMsg, setButtonMsg] = useState("Add new suspension");
  const navigate = useNavigate();

  // Need to replace this LS func with a call to Strava for bikes

  // useEffect(() => {
  //   if (userBikes === null) {
  //     const loadedBikes = JSON.parse(localStorage.getItem("userBikes"));
  //     if (loadedBikes) {
  //       setUserBikes(loadedBikes);
  //     } else {
  //       setUserBikes([]);
  //     }
  //   } else if (userBikes) {
  //     window.localStorage.setItem("userBikes", JSON.stringify(userBikes));
  //   }
  //   // eslint-disable-next-line
  // }, []);

  useEffect(() => {
    if (userID === null || userBikes === null) return;
    if (!userSuspension) {
      setLoadingSus("loading");
      loadUserSuspensionFromDatabase(userID)
        .then((result) => {
          if (result.suspension && result.suspension.length > 0) {
            const convertedDBSus = result.suspension.map((sus) =>
              convertSuspensionFromDatabase(sus, userBikes)
            );
            console.log(`User suspension loaded from DB`, convertedDBSus);
            setUserSuspension(convertedDBSus);
            setLoadingSus("");
          } else {
            console.log(`No suspension loaded from DB for userID: ${userID}`);
            setUserSuspension([]);
            setLoadingSus("");
          }
        })
        .catch((error) => {
          console.log(error);
          setLoadingSus("error");
          setUserSuspension([]);
          setButtonLink("/");
          setButtonMsg("Return to login page");
        });
    }
  }, [userSuspension, userID, userBikes, setUserSuspension]);

  useEffect(() => {
    // THIS NEEDS TO BE TESTED

    if (!userSuspension || !userRides || !userBikes) return;
    let userSusStateNeedsReset = false;

    const recalculatedUserSus = userSuspension.map((sus) => {
      console.log(sus);
      const susNeedsRecalc = isNewestRideAfterLastCalculated(userRides, sus);
      if (susNeedsRecalc === true) {
        console.log(`${sus.id} needs recalculation`);
        userSusStateNeedsReset = true;
        const newRebuildLife = calculateRebuildLife(
          sus.susData.id,
          sus.rebuildDate,
          userRides,
          sus.onBike.id,
          userBikes
        );
        console.log(`New rebuild life is ${newRebuildLife} for ${sus.id}`);

        let updatedSus = JSON.parse(JSON.stringify(sus));
        updatedSus.rebuildLife = newRebuildLife;
        const newestRideOnBikeDate = filterRidesForSpecificBike(
          userRides,
          sus.onBike
        )[0].ride_date;
        updatedSus.lastRideCalculated = newestRideOnBikeDate;

        const susDataToPatch = convertSusToDatabaseFormat(updatedSus, userID);
        editUserSuspensionInDatabase(susDataToPatch)
          .then((result) => {
            console.log(result);
          })
          .catch((error) => {
            console.log(
              `There was an error updating rebuild life based on new ride data. ${error}`
            );
          });

        return updatedSus;
      } else if (susNeedsRecalc === false) {
        console.log(`${sus.id} does not need recalculation`);
        return sus;
      }
    });

    if (userSusStateNeedsReset) {
      setUserSuspension(recalculatedUserSus)
    }
  }, [userSuspension, userBikes, userRides, userID, setUserSuspension]);

  return (
    <section className="dashboard">
      <h1 className="site-logo">Ride Ready</h1>
      <Container
        userSuspension={userSuspension}
        setSelectedSuspension={setSelectedSuspension}
        loadingSus={loadingSus}
      />
      <button id="dash-add-sus" onClick={() => navigate(buttonLink)}>
        {buttonMsg}
      </button>
    </section>
  );
}

Dashboard.propTypes = {
  userID: PropTypes.number,
  userSuspension: PropTypes.array,
  setUserSuspension: PropTypes.func,
  setSelectedSuspension: PropTypes.func,
  userBikes: PropTypes.array,
  setUserBikes: PropTypes.func,
  userRides: PropTypes.array,
};
