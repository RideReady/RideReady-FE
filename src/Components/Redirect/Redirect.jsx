import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAccessToken,
  getUserActivities,
  getUserDetails,
  getUserGearDetails,
} from "../../Services/APICalls";
import {
  testForDeniedPermission,
  stripURLForToken,
  filterRideActivities,
  getGearIDNumbers,
  cleanRideData,
  formatBikeDetails,
} from "../../util.js";
import "./Redirect.css";
import PropTypes from "prop-types";

export default function Redirect({
  setUserAccessToken,
  userAccessToken,
  userID,
  setUserID,
  setUserBikes,
  setUserRides,
  userRides,
  changeErrorMessage,
}) {
  const [userAuthToken, setUserAuthToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (testForDeniedPermission(window.location.search)) {
      changeErrorMessage(`Please allow this app access to all activity data on Strava's login screen. 
        You are being redirected to the home page.`);
      return;
    }
    const fetchedAuthToken = stripURLForToken(window.location.search);
    setUserAuthToken(fetchedAuthToken);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!userAuthToken) return;
    getAccessToken(userAuthToken)
      .then((data) => {
        setUserAccessToken(data.access_token);
        window.localStorage.setItem(
          "userAccessToken",
          JSON.stringify(data.access_token)
        );
      })
      .catch((error) => {
        console.error(error);
        changeErrorMessage(`An error occurred while requesting an access token. 
      Please return to the home page and try logging in again.`);
      });
    // eslint-disable-next-line
  }, [userAuthToken]);

  useEffect(() => {
    if (userAccessToken && !userID) {
      getUserDetails(userAccessToken)
        .then((userDetails) => {
          if (userDetails.id) {
            setUserID(userDetails.id);
            window.localStorage.setItem(
              "userID",
              JSON.stringify(userDetails.id)
            );
          }
        })
        .catch((error) => {
          console.error(error);
          changeErrorMessage(`An error occurred while requesting user information. 
      Please return to the home page and try logging in again.`);
        });
    }
    // eslint-disable-next-line
  }, [userAccessToken]);

  useEffect(() => {
    if (userAccessToken && !userRides) {
      getUserActivities(1, userAccessToken)
        .then((activities) => {
          const cleanedRides = cleanRideData(filterRideActivities(activities));
          if (cleanedRides) {
            setUserRides(cleanedRides);
            window.localStorage.setItem(
              "userRides",
              JSON.stringify(cleanedRides)
            );
          }
        })
        .catch((error) => {
          console.error(error);
          changeErrorMessage(`An error occurred while fetching your rides. 
      Please return to the home page and try logging in again.`);
        });
    }
    // eslint-disable-next-line
  }, [userAccessToken]);

  useEffect(() => {
    if (!userAccessToken) return;
    if (userRides && userRides?.length) {
      const userGear = getGearIDNumbers(userRides);
      if (userGear.length === 0) {
        navigate("/dashboard", { replace: true });
      } else {
        Promise.all(
          userGear.map((gearID) => getUserGearDetails(gearID, userAccessToken))
        )
          .then((gearDetails) => {
            const formattedBikeDetails = formatBikeDetails(gearDetails);
            setUserBikes(formattedBikeDetails);
            window.localStorage.setItem(
              "userBikes",
              JSON.stringify(formattedBikeDetails)
            );
            navigate("/dashboard", { replace: true });
          })
          .catch((error) => {
            console.error(error);
            changeErrorMessage(`An error occurred while fetching your bike details. 
      Please return to the home page and try logging in again.`);
          });
      }
    } else if (userRides && !userRides?.length) {
      navigate("/dashboard", { replace: true });
    }
    // eslint-disable-next-line
  }, [userAccessToken, userRides]);

  return (
    <section className="home-page">
      <h1 className="site-logo">Ride Ready</h1>
      <img
        src="/assets/mtb-roost.gif"
        className="loading-gif"
        alt="mountain biker getting rowdy"
      />
      <p className="loading-message">
        Please wait while your data loads.
        <br />
        If this takes longer than 10 seconds, please return to the home screen
        and try again.
      </p>
    </section>
  );
}

Redirect.propTypes = {
  setUserAccessToken: PropTypes.func,
  userAccessToken: PropTypes.string,
  setUserID: PropTypes.func,
  setUserBikes: PropTypes.func,
  setUserRides: PropTypes.func,
  userRides: PropTypes.array,
  changeErrorMessage: PropTypes.func,
  userID: PropTypes.number,
};
