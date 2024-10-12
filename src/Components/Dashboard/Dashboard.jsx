import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../Container/Container';
import './Dashboard.css';
import PropTypes from 'prop-types';
import {
  editUserSuspensionInDatabase,
  loadUserSuspensionFromDatabase,
} from '../../Services/APICalls';
import {
  calculateRebuildLife,
  convertSuspensionFromDatabase,
  isNewestRideAfterLastCalculated,
  filterRidesForSpecificBike,
  convertSusToDatabaseFormat,
  sortUserSuspensionByBikeId,
  fetchMoreRidesIfNeeded,
} from '../../util';

export default function Dashboard({
  userID,
  setUserID,
  userSuspension,
  setUserSuspension,
  setSelectedSuspension,
  userBikes,
  userRides,
  setUserBikes,
  setUserRides,
  userAccessToken,
  setUserAccessToken,
  dashboardInitialized,
  setDashboardInitialized,
  pagesFetched,
  setPagesFetched,
}) {
  const [loadingSus, setLoadingSus] = useState('');
  const [buttonLink, setButtonLink] = useState('/dashboard/add-new-part');
  const [buttonMsg, setButtonMsg] = useState('Add new suspension');
  const navigate = useNavigate();

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
    if (!userID) {
      const loadedId = JSON.parse(localStorage.getItem('userID'));
      setUserID(loadedId);
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (userRides && userRides.length <= 0) {
      setButtonLink('/');
      setButtonMsg('Return to login page');
    }
  }, [userRides]);

  useEffect(() => {
    if (userID === null || userBikes === null) return;
    if (!userSuspension && dashboardInitialized.current === false) {
      setLoadingSus('loading');
      // If running locally - need to start local BE server or this call fails first
      loadUserSuspensionFromDatabase(userID)
        .then((result) => {
          if (result.suspension && result.suspension.length > 0) {
            const convertedDBSus = result.suspension.map((sus) =>
              convertSuspensionFromDatabase(sus, userBikes)
            );
            console.log(`User suspension loaded from DB`, convertedDBSus);
            const sortedDbSus = sortUserSuspensionByBikeId(convertedDBSus);
            setUserSuspension(sortedDbSus);
          } else {
            console.log(`No suspension loaded from DB for userID: ${userID}`);
            setUserSuspension([]);
          }
          setLoadingSus('');
        })
        .catch((error) => {
          console.log(error);
          setLoadingSus('error');
          setUserSuspension([]);
          setButtonLink('/');
          setButtonMsg('Return to login page');
        });
    }
  }, [
    userSuspension,
    userID,
    userBikes,
    setUserSuspension,
    dashboardInitialized,
  ]);

  useEffect(() => {
    if (
      dashboardInitialized.current === true ||
      !userSuspension ||
      !userRides ||
      !userBikes
    )
      return;
    let userSusStateNeedsReset = false;

    const promises = userSuspension.map((sus) => {
      const susNeedsRecalc = isNewestRideAfterLastCalculated(userRides, sus);
      if (susNeedsRecalc) {
        console.log(`${sus.id} needs recalculation`);
        userSusStateNeedsReset = true;

        return (async () => {
          try {
            const result = await fetchMoreRidesIfNeeded(
              userAccessToken,
              sus.rebuildDate,
              userRides,
              pagesFetched
            );
            if (!result) {
              throw new Error('An unknown error occurred');
            }
            const { newUserRides, newPagesFetched } = result;
            setUserRides(newUserRides);
            window.localStorage.setItem(
              'userRides',
              JSON.stringify(newUserRides)
            );
            setPagesFetched(newPagesFetched);

            const newRebuildLife = calculateRebuildLife(
              sus.susData.id,
              sus.rebuildDate,
              newUserRides,
              sus.onBike.id,
              userBikes
            );
            console.log(`New rebuild life is ${newRebuildLife} for ${sus.id}`);

            const updatedSus = structuredClone(sus);
            updatedSus.rebuildLife = newRebuildLife;
            const newestRideOnBikeDate = filterRidesForSpecificBike(
              userRides,
              sus.onBike
            )[0].ride_date;
            updatedSus.lastRideCalculated = newestRideOnBikeDate;

            await editUserSuspensionInDatabase(
              convertSusToDatabaseFormat(updatedSus, userID)
            );
            return updatedSus;
          } catch (error) {
            console.error(
              'Error fetching more rides and recalculating:',
              error
            );
            return sus;
          }
        })();
      } else {
        console.log(`${sus.id} does not need recalculation`);
        return Promise.resolve(sus);
      }
    });

    if (userSusStateNeedsReset) {
      Promise.all(promises)
        .then((updatedSusArray) => {
          console.log(updatedSusArray);
          setUserSuspension(updatedSusArray);
        })
        .catch((err) => {
          console.error('Error resolving promises of updated sus:', err);
        });
    }

    setDashboardInitialized(true);
    // eslint-disable-next-line
  }, [userSuspension, dashboardInitialized]);

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
          window.location = 'mailto:rickv85@gmail.com';
        }}
      >
        Send feedback
      </button>
    </section>
  );
}

Dashboard.propTypes = {
  userID: PropTypes.number,
  setUserID: PropTypes.func,
  userSuspension: PropTypes.array,
  setUserSuspension: PropTypes.func,
  setSelectedSuspension: PropTypes.func,
  userBikes: PropTypes.array,
  setUserBikes: PropTypes.func,
  userRides: PropTypes.array,
  setUserRides: PropTypes.func,
  userAccessToken: PropTypes.string,
  setUserAccessToken: PropTypes.func,
  dashboardInitialized: PropTypes.object,
  setDashboardInitialized: PropTypes.func,
  pagesFetched: PropTypes.number,
  setPagesFetched: PropTypes.func,
};
