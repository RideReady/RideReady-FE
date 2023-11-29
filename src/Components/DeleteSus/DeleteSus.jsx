import { useState, useEffect } from "react";
import "./DeleteSus.css";
import { useNavigate } from "react-router-dom";
import { findSusIndexByID, convertSuspensionFromDatabase } from "../../util";
import PropTypes from "prop-types";
import {
  deleteUserSuspensionInDatabase,
  loadUserSuspensionFromDatabase,
} from "../../Services/APICalls";

export default function DeleteSus({
  setUserSuspension,
  userSuspension,
  setSelectedSuspension,
  selectedSuspension,
  userID,
  setUserID,
  userBikes,
  setUserBikes,
}) {
  const [deleteSusIndex, setDeleteSusIndex] = useState(null);
  const [deleteSusDetails, setDeleteSusDetails] = useState(null);
  const [errorModalMessage, setErrorModalMessage] = useState("");

  const navigate = useNavigate();
  const deleteSusErrorModal = document.getElementById("deleteSusErrorModal");

  useEffect(() => {
    if (!userBikes) {
      const loadedBikes = JSON.parse(localStorage.getItem("userBikes"));
      setUserBikes(loadedBikes);
    }
    if (!selectedSuspension) {
      const loadedSelection = JSON.parse(
        localStorage.getItem("selectedSuspension")
      );
      setSelectedSuspension(loadedSelection);
    }
    if (!userID) {
      const loadedID = JSON.parse(localStorage.getItem("userID"));
      setUserID(loadedID);
    }
    if (!userSuspension && userID && userBikes) {
      loadUserSuspensionFromDatabase(userID)
        .then((result) => {
          if (result.suspension && result.suspension.length > 0) {
            const convertedDBSus = result.suspension.map((sus) =>
              convertSuspensionFromDatabase(sus, userBikes)
            );
            console.log(`User suspension loaded from DB`, convertedDBSus);
            setUserSuspension(convertedDBSus);
          } else {
            console.log(`No suspension loaded from DB for userID: ${userID}`);
            setUserSuspension([]);
          }
        })
        .catch((error) => {
          console.log(error);
          setErrorModalMessage(
            `There was an error loading your suspension from the database. Please try reloading the page by clicking the button below.`
          );
          deleteSusErrorModal.showModal();
          setTimeout(() => {
            deleteSusErrorModal.close();
          }, 10000);
        });
    }
    // eslint-disable-next-line
  }, [selectedSuspension, userID, userSuspension, userBikes]);

  useEffect(() => {
    if (!selectedSuspension || !userSuspension) return;
    const index = findSusIndexByID(selectedSuspension, userSuspension);
    setDeleteSusDetails(userSuspension[index]);
    setDeleteSusIndex(index);
  }, [selectedSuspension, userSuspension]);

  const handleDelete = () => {
    deleteUserSuspensionInDatabase(deleteSusDetails.id)
      .then((result) => {
        console.log(result);
        let newUserSusArr = [...userSuspension];
        newUserSusArr.splice(deleteSusIndex, 1);
        setUserSuspension(newUserSusArr);

        window.localStorage.setItem("selectedSuspension", JSON.stringify(null));
        setSelectedSuspension(null);
        navigate("/dashboard")
      })
      .catch((error) => {
        console.log(error);
        setErrorModalMessage(
          `There was an issue deleting your suspension. Please try reloading the page by clicking the button below and try your request again.`
        );
        deleteSusErrorModal.showModal();
        setTimeout(() => {
          deleteSusErrorModal.close();
        }, 10000);
      });
  };

  return (
    <section className="delete-part-form-section">
      <h1
        id="delete-sus-site-logo"
        className="site-logo"
        onClick={() => {
          window.localStorage.setItem(
            "selectedSuspension",
            JSON.stringify(null)
          );
          setSelectedSuspension(null);
          navigate('/dashboard');
        }}
      >
        Ride Ready
      </h1>
      <div className="delete-sus-details">
        <h2>Are you sure you want to delete your:</h2>
        {deleteSusDetails && (
          <h3 className="delete-part">{`${deleteSusDetails.susData.name} 
          on ${deleteSusDetails.onBike.brand_name} ${deleteSusDetails.onBike.model_name}`}</h3>
        )}
        <div className="delete-section-buttons">
          <button
            onClick={() => {
              window.localStorage.setItem(
                "selectedSuspension",
                JSON.stringify(null)
              );
              setSelectedSuspension(null);
              navigate('/dashboard');
            }}
          >
            Back
          </button>
          <button onClick={() => handleDelete()}>Delete</button>
        </div>
      </div>
      <div className="delete-spacer"></div>
      <dialog id="deleteSusErrorModal">
        {errorModalMessage}
        <button id="reloadButton" onClick={() => window.location.reload()}>
          Reload
        </button>
      </dialog>
    </section>
  );
}

DeleteSus.propTypes = {
  setUserSuspension: PropTypes.func,
  userSuspension: PropTypes.array,
  setSelectedSuspension: PropTypes.func,
  selectedSuspension: PropTypes.string,
  userID: PropTypes.number,
  setUserID: PropTypes.func,
  userBikes: PropTypes.array,
  setUserBikes: PropTypes.func,
};
