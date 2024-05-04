import { useEffect, useState, useRef } from "react";
import { suspensionData } from "../../SuspensionData";
import "./NewPartForm.css";
import PropTypes from "prop-types";
import {
  calculateRebuildLife,
  convertSusToDatabaseFormat,
  filterRidesForSpecificBike,
  convertSuspensionFromDatabase,
  fetchMoreRidesIfNeeded,
} from "../../util";
import {
  postUserSuspensionToDatabase,
  loadUserSuspensionFromDatabase,
} from "../../Services/APICalls";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

export default function NewPartForm({
  userID,
  userBikes,
  setUserBikes,
  userRides,
  setUserSuspension,
  userSuspension,
  userAccessToken,
  setUserAccessToken,
  setUserRides,
  pagesFetched,
  setPagesFetched,
  setUserID,
}) {
  const [bikeOptions, setBikeOptions] = useState(userBikes);
  const [bikeDropdownOptions, setBikeDropdownOptions] = useState([]);
  const [selectedBike, setSelectedBike] = useState("");
  const [selectedSus, setSelectedSus] = useState("");
  const [selectedRebuildDate, setSelectedRebuildDate] = useState("");
  const lastLoadedPageNum = useRef(pagesFetched);
  const [loadingRides, setLoadingRides] = useState(false);
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState("");

  const navigate = useNavigate();
  const newPartErrorModal = document.getElementById("newPartErrorModal");

  useEffect(() => {
    if (!userBikes) {
      const loadedBikes = JSON.parse(localStorage.getItem("userBikes"));
      setBikeOptions(loadedBikes);
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
          newPartErrorModal.showModal();
          setTimeout(() => {
            newPartErrorModal.close();
          }, 10000);
        });
    }
    // eslint-disable-next-line
  }, [userRides, userBikes, userAccessToken, userID, userSuspension]);

  useEffect(() => {
    if (bikeOptions) {
      const bikeSelects = bikeOptions.map((bike) => {
        return (
          <option key={bike.id} value={bike.id}>
            {`"${bike.name}" - ${bike.brand_name} ${bike.model_name} - ${bike.frame_type}`}
          </option>
        );
      });
      setBikeDropdownOptions([
        ...bikeSelects,
        <option key={0} value={0}>
          Unlisted bike - uses all rides available
        </option>,
      ]);
    } else {
      setBikeDropdownOptions([
        <option key={0} value={0}>
          Unlisted bike - uses all rides available
        </option>,
      ]);
    }
  }, [bikeOptions]);

  const suspensionOptions = suspensionData.map((sus) => {
    return (
      <option key={sus.id} value={sus.id}>
        {sus.name}
      </option>
    );
  });

  useEffect(() => {
    if (selectedRebuildDate) {
      fetchMoreRidesIfNeeded(
        userAccessToken,
        selectedRebuildDate,
        userRides,
        setUserRides,
        pagesFetched,
        setPagesFetched,
        setLoadingRides,
        setSubmitDisabled,
        setErrorModalMessage
      );
    }
    // eslint-disable-next-line
  }, [selectedRebuildDate]);

  const handleSubmit = () => {
    if (!(selectedBike && selectedSus && selectedRebuildDate)) {
      setSubmitError(true);
      setTimeout(() => setSubmitError(false), 3000);
      return;
    }

    const selectedSuspensionData = suspensionData.find(
      (sus) => sus.id === +selectedSus
    );

    let selectedBikeDetails;
    if (bikeOptions && selectedBike !== "0") {
      selectedBikeDetails = bikeOptions.find(
        (bike) => bike.id === selectedBike
      );
    } else {
      selectedBikeDetails = {
        id: "unknownBike",
        brand_name: "Unknown",
        model_name: "Bike",
      };
    }

    console.log(selectedBikeDetails);

    const newSuspensionDetails = {
      id: uuidv4(),
      susData: selectedSuspensionData,
      onBike: selectedBikeDetails,
      rebuildDate: selectedRebuildDate,
      rebuildLife: calculateRebuildLife(
        selectedSus,
        selectedRebuildDate,
        userRides,
        selectedBike,
        userBikes
      ),
      lastRideCalculated: filterRidesForSpecificBike(
        userRides,
        selectedBikeDetails
      )[0].ride_date,
    };

    console.log(newSuspensionDetails);

    const newSusPostData = convertSusToDatabaseFormat(
      newSuspensionDetails,
      userID
    );

    postUserSuspensionToDatabase(newSusPostData)
      .then((response) => {
        console.log(response);

        if (userSuspension) {
          setUserSuspension([...userSuspension, newSuspensionDetails]);
          window.localStorage.setItem(
            "userSuspension",
            JSON.stringify([...userSuspension, newSuspensionDetails])
          );
        } else {
          setUserSuspension([newSuspensionDetails]);
          window.localStorage.setItem(
            "userSuspension",
            JSON.stringify([newSuspensionDetails])
          );
        }

        setPagesFetched(lastLoadedPageNum.current);
        navigate("/dashboard");
      })
      .catch((error) => {
        console.log(error);
        setErrorModalMessage(
          `There was an error posting your suspension update to the database. Please try reloading the page by clicking the button below and try your request again.`
        );
        newPartErrorModal.showModal();
        setTimeout(() => {
          newPartErrorModal.close();
        }, 10000);
      });
  };

  return (
    <section className="new-part-form-section">
      <h1
        id="new-part-site-logo"
        className="site-logo"
        onClick={() => {
          navigate("/dashboard");
        }}
      >
        Ride Ready
      </h1>
      <form className="new-part-form">
        <label htmlFor="bikeSelect">Which bike is this part on?</label>
        <select
          name="bikeSelect"
          className="bike-select"
          value={selectedBike}
          onChange={(event) => setSelectedBike(event.target.value)}
        >
          <option key={"0"} value={""} disabled>
            Choose a bike
          </option>
          {bikeDropdownOptions}
        </select>
        <label htmlFor="suspensionSelect">What is the make and type?</label>
        <select
          name="suspensionSelect"
          value={selectedSus}
          onChange={(event) => setSelectedSus(event.target.value)}
        >
          <option key={"0"} value={""} disabled>
            Choose your suspension
          </option>
          {suspensionOptions}
        </select>
        <label htmlFor="lastRebuild">When was it last rebuilt?</label>
        <input
          name="lastRebuild"
          type={"date"}
          max={new Date().toLocaleDateString("fr-ca")}
          value={selectedRebuildDate}
          onChange={(event) => setSelectedRebuildDate(event.target.value)}
        />
      </form>
      <div className="newpartform-button-section">
        <button onClick={() => navigate("/dashboard")}>Back</button>
        <button onClick={() => handleSubmit()} disabled={submitDisabled}>
          Submit
        </button>
      </div>
      {submitError && (
        <p className="error-wait-message">
          Please fill out all forms before submitting
        </p>
      )}
      {loadingRides && (
        <p className="error-wait-message">
          Please wait for data to load.
          <br />
          This could take up to 15 seconds
        </p>
      )}
      <dialog id="newPartErrorModal">
        {errorModalMessage}
        <button id="reloadButton" onClick={() => window.location.reload()}>
          Reload
        </button>
      </dialog>
    </section>
  );
}

NewPartForm.propTypes = {
  userID: PropTypes.number,
  userBikes: PropTypes.array,
  setUserBikes: PropTypes.func,
  userRides: PropTypes.array,
  setUserSuspension: PropTypes.func,
  userSuspension: PropTypes.array,
  userAccessToken: PropTypes.string,
  setUserAccessToken: PropTypes.func,
  setUserRides: PropTypes.func,
  pagesFetched: PropTypes.number,
  setPagesFetched: PropTypes.func,
  changeErrorMessage: PropTypes.func,
  setUserID: PropTypes.func,
};
