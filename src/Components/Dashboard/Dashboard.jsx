import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "../Container/Container";
import "./Dashboard.css";
import PropTypes from "prop-types";
import { loadUserSuspensionFromDatabase } from "../../Services/APICalls";
import { convertSuspensionFromDatabase } from "../../util";

export default function Dashboard({
  userID,
  userSuspension,
  setUserSuspension,
  setSelectedSuspension,
  userBikes,
  // setUserBikes,
}) {
  const [loadingSus, setLoadingSus] = useState("");
  const navigate = useNavigate();

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
      setLoadingSus("Loading your suspension...");
      loadUserSuspensionFromDatabase(userID).then((result) => {
        if (result.suspension && result.suspension.length > 0) {
          const convertedDBSus = result.suspension.map((sus) =>
          convertSuspensionFromDatabase(sus, userBikes)
          );
          console.log(`User suspension loaded from DB`, convertedDBSus);
          setUserSuspension(convertedDBSus);
          setLoadingSus("");
        } else {
          console.log(`No suspension loaded from DB for userID: ${userID}`);
          setLoadingSus("");
        }
      }).catch((error) => {
        console.log(error)
        setLoadingSus("An error occurred while loading your suspension, please try refreshing the page.")
      })
      // NEED TO ADD A CATCH HERE FOR FAILED DB LOAD CALL
      // Console log error, show user an error in the loadingSus msg
    }
    // eslint-disable-next-line
  }, [userSuspension, userID, userBikes]);

  return (
    <section className="dashboard">
      <h1 className="site-logo">Ride Ready</h1>
      <Container
        userSuspension={userSuspension}
        setSelectedSuspension={setSelectedSuspension}
        loadingSus={loadingSus}
      />
      <button
        id="dash-add-sus"
        onClick={() => navigate("/dashboard/add-new-part")}
      >
        Add new suspension
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
};
