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
  userRides,
  setUserBikes,
  setUserRides,
  userAccessToken,
  setUserAccessToken,
  setUserID,
}) {
  const [loadingSus, setLoadingSus] = useState("");
  const [buttonLink, setButtonLink] = useState("/dashboard/add-new-part");
  const [buttonMsg, setButtonMsg] = useState("Add new suspension");
  const navigate = useNavigate();

  useEffect(() => {
    if (!userBikes) {
      const loadedBikes = JSON.parse(localStorage.getItem("userBikes"));
      setUserBikes(loadedBikes);
    }
    if (!userRides) {
      const loadedRides = JSON.parse(localStorage.getItem("userRides"));
      setUserRides(loadedRides);
    }
    if (!userAccessToken) {
      const loadedToken = JSON.parse(localStorage.getItem("userAccessToken"));
      setUserAccessToken(loadedToken);
    }
    if (!userID) {
      const loadedToken = JSON.parse(localStorage.getItem("userID"));
      setUserID(loadedToken);
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (userRides.length <= 0) {
      setButtonLink("/");
      setButtonMsg("Return to login page");
    }
  }, [userRides])

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
      setUserSuspension(recalculatedUserSus);
    }
  }, [userSuspension, userBikes, userRides, userID, setUserSuspension]);

  return (
    <section className="dashboard">
      <h1 className="site-logo">Ride Ready</h1>
      <Container
        userSuspension={userSuspension}
        setSelectedSuspension={setSelectedSuspension}
        loadingSus={loadingSus}
        userRides={userRides}
      />
      <button id="dash-add-sus-btn" onClick={() => navigate(buttonLink)}>
        {buttonMsg}
      </button>
      <button
        id="dash-send-feedback-btn"
        onClick={(e) => {
          e.preventDefault();
          window.location = "mailto:rickv85@gmail.com";
        }}
      >
        Send feedback
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
  setUserRides: PropTypes.func,
  userAccessToken: PropTypes.string,
  setUserAccessToken: PropTypes.func,
  setUserID: PropTypes.func,
};
