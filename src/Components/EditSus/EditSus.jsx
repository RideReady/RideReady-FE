import { useEffect, useState } from 'react';
import './EditSus.css';
import { useNavigate } from 'react-router-dom';
import {
  convertSusToDatabaseFormat,
  fetchMoreRidesIfNeeded,
  findSusIndexByID,
  isDateWithin20Years,
  isOldestRideBeforeRebuild,
} from '../../util';
import moment from 'moment';
import {
  calculateRebuildLife,
  filterRidesForSpecificBike,
  convertSuspensionFromDatabase,
} from '../../util';
import {
  editUserSuspensionInDatabase,
  loadUserSuspensionFromDatabase,
} from '../../Services/APICalls';
import PropTypes from 'prop-types';

export default function EditSus({
  setUserSuspension,
  userSuspension,
  setSelectedSuspension,
  selectedSuspension,
  userAccessToken,
  setUserAccessToken,
  userRides,
  setUserRides,
  pagesFetched,
  setPagesFetched,
  userBikes,
  setUserBikes,
  userID,
  setUserID,
}) {
  const [newRebuildDate, setNewRebuildDate] = useState('');
  const [editSusIndex, setEditSusIndex] = useState(null);
  const [editSusDetails, setEditSusDetails] = useState(null);
  const [loadingRides, setLoadingRides] = useState(false);
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [errorModalMessage, setErrorModalMessage] = useState('');

  const navigate = useNavigate();
  const editSusErrorModal = document.getElementById('editSusErrorModal');

  useEffect(() => {
    if (!userBikes) {
      const loadedBikes = JSON.parse(localStorage.getItem('userBikes'));
      setUserBikes(loadedBikes);
    }
    if (!userRides) {
      const loadedRides = JSON.parse(localStorage.getItem('userRides'));
      setUserRides(loadedRides);
    }
    if (!userAccessToken) {
      const loadedToken = JSON.parse(localStorage.getItem('userAccessToken'));
      setUserAccessToken(loadedToken);
    }
    if (!selectedSuspension) {
      const loadedSelection = JSON.parse(
        localStorage.getItem('selectedSuspension')
      );
      if (loadedSelection === null) {
        navigate('/dashboard');
      } else {
        setSelectedSuspension(loadedSelection);
      }
    }
    if (!userID) {
      const loadedID = JSON.parse(localStorage.getItem('userID'));
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
          editSusErrorModal.showModal();
          setTimeout(() => {
            editSusErrorModal.close();
          }, 10000);
        });
    }
    // eslint-disable-next-line
  }, [
    userBikes,
    userRides,
    userAccessToken,
    selectedSuspension,
    userID,
    userSuspension,
  ]);

  useEffect(() => {
    if (!selectedSuspension || !userSuspension) return;
    const index = findSusIndexByID(selectedSuspension, userSuspension);
    setEditSusIndex(index);
    setEditSusDetails(userSuspension[index]);
  }, [selectedSuspension, userSuspension]);

  useEffect(() => {
    if (
      !newRebuildDate ||
      !isDateWithin20Years(newRebuildDate) ||
      loadingRides ||
      !userAccessToken ||
      !userRides
    )
      return;
    if (!isOldestRideBeforeRebuild(userRides, newRebuildDate)) return;
    (async () => {
      try {
        setLoadingRides(true);
        setSubmitDisabled(true);
        const result = await fetchMoreRidesIfNeeded(
          userAccessToken,
          newRebuildDate,
          userRides,
          pagesFetched
        );
        if (!result) {
          throw new Error('An unknown error occurred');
        }
        const { newUserRides, newPagesFetched } = result;
        setUserRides(newUserRides);
        window.localStorage.setItem('userRides', JSON.stringify(newUserRides));
        setPagesFetched(newPagesFetched);
      } catch (err) {
        setErrorModalMessage(
          `An error occurred while fetching more rides. ${err}`
        );
        editSusErrorModal.showModal();
        setTimeout(() => {
          editSusErrorModal.close();
        }, 10000);
      } finally {
        setLoadingRides(false);
        setSubmitDisabled(false);
      }
    })();
    // eslint-disable-next-line
  }, [newRebuildDate]);

  const handleSubmit = () => {
    if (!newRebuildDate || submitDisabled) {
      setSubmitError('Please fill out all forms before submitting');
      setTimeout(() => setSubmitError(''), 3000);
      return;
    }

    if (!isDateWithin20Years(newRebuildDate)) {
      setSubmitError('Please select a rebuild date within 20 years');
      setTimeout(() => setSubmitError(''), 3000);
      return;
    }

    const modifiedSus = JSON.parse(JSON.stringify(editSusDetails));
    modifiedSus.rebuildDate = newRebuildDate;
    modifiedSus.rebuildLife = calculateRebuildLife(
      modifiedSus.susData.id,
      newRebuildDate,
      userRides,
      modifiedSus.onBike.id,
      userBikes
    );
    const newestRideOnBikeDate = filterRidesForSpecificBike(
      userRides,
      modifiedSus.onBike
    )[0]?.ride_date;
    modifiedSus.lastRideCalculated = newestRideOnBikeDate;

    editUserSuspensionInDatabase(
      convertSusToDatabaseFormat(modifiedSus, userID)
    )
      .then((result) => {
        console.log(result);
        setUserSuspension((prevUserSuspension) => {
          const newSusArr = [...prevUserSuspension];
          newSusArr.splice(editSusIndex, 1, modifiedSus);
          return newSusArr;
        });

        window.localStorage.setItem('selectedSuspension', JSON.stringify(null));
        setSelectedSuspension(null);
      })
      .catch((error) => {
        console.log(error);
        setErrorModalMessage(
          `There was an issue modifying your suspension rebuild date. Please try reloading the page by clicking the button below and try your request again. ${error}`
        );
        editSusErrorModal.showModal();
        setTimeout(() => {
          editSusErrorModal.close();
        }, 10000);
      });
  };

  return (
    <section className="edit-part-form-section">
      <h1
        id="edit-sus-site-logo"
        className="site-logo"
        onClick={() => {
          window.localStorage.setItem(
            'selectedSuspension',
            JSON.stringify(null)
          );
          setSelectedSuspension(null);
        }}
      >
        Ride Ready
      </h1>
      <div className="edit-sus-details">
        {editSusDetails && (
          <h2>{`Change rebuild date of the ${editSusDetails.susData.name}
          on your ${editSusDetails.onBike.brand_name} ${editSusDetails.onBike.model_name}`}</h2>
        )}
        {editSusDetails && (
          <h2>{`Currently: ${moment(editSusDetails.rebuildDate).format(
            'll'
          )}`}</h2>
        )}
        <form>
          <input
            type="date"
            value={newRebuildDate}
            max={new Date().toLocaleDateString('fr-ca')}
            onChange={(event) => setNewRebuildDate(event.target.value)}
          />
        </form>
        <div className="edit-section-buttons">
          <button
            onClick={() => {
              window.localStorage.setItem(
                'selectedSuspension',
                JSON.stringify(null)
              );
              setSelectedSuspension(null);
            }}
          >
            Back
          </button>
          <button onClick={() => handleSubmit()} disabled={submitDisabled}>
            Submit
          </button>
        </div>
      </div>
      {submitError && <p className="error-wait-message">{submitError}</p>}
      {loadingRides && (
        <p className="error-wait-message">
          Please wait for data to load.
          <br />
          This could take up to 15 seconds
        </p>
      )}
      <dialog id="editSusErrorModal">
        {errorModalMessage}
        <button id="reloadButton" onClick={() => window.location.reload()}>
          Reload
        </button>
      </dialog>
    </section>
  );
}

EditSus.propTypes = {
  setUserSuspension: PropTypes.func,
  userSuspension: PropTypes.array,
  setSelectedSuspension: PropTypes.func,
  selectedSuspension: PropTypes.string,
  userAccessToken: PropTypes.string,
  setUserAccessToken: PropTypes.func,
  userRides: PropTypes.array,
  setUserRides: PropTypes.func,
  pagesFetched: PropTypes.number,
  setPagesFetched: PropTypes.func,
  userBikes: PropTypes.array,
  setUserBikes: PropTypes.func,
  changeErrorMessage: PropTypes.func,
  userID: PropTypes.number,
  setUserID: PropTypes.func,
};
