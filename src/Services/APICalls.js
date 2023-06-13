// STRAVA API Calls

const getAccessToken = (userAuthToken) => {
  let clientID = `${import.meta.env.VITE_CLIENT_ID}`;
  let clientSecret = `${import.meta.env.VITE_CLIENT_SECRET}`;

  if (window.location.href.startsWith("http://localhost:5173/redirect/")) {
    clientID = `${import.meta.env.VITE_CLIENT_ID_LOCAL}`;
    clientSecret = `${import.meta.env.VITE_CLIENT_SECRET_LOCAL}`;
  }

  return fetch(`https://www.strava.com/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/JSON" },
    body: JSON.stringify({
      client_id: clientID,
      client_secret: clientSecret,
      code: `${userAuthToken}`,
      grant_type: "authorization_code",
    }),
  }).then((response) => {
    if (response.ok) {
      return response.json();
    }
    throw new Error();
  });
};

const getUserDetails = (userAccessToken) => {
  return fetch("https://www.strava.com/api/v3/athlete", {
    headers: {
      Authorization: `Bearer ${userAccessToken}`,
    },
  }).then((response) => {
    if (response.ok) {
      return response.json();
    }
    throw new Error();
  });
};

const getUserActivities = (pageNum, userAccessToken) => {
  return fetch(
    `https://www.strava.com/api/v3/athlete/activities?page=${pageNum}&per_page=200`,
    {
      headers: {
        Authorization: `Bearer ${userAccessToken}`,
      },
    }
  ).then((response) => {
    if (response.ok) {
      return response.json();
    }
    throw new Error();
  });
};

const getUserGearDetails = (id, userAccessToken) => {
  return fetch(`https://www.strava.com/api/v3/gear/${id}`, {
    headers: {
      Authorization: `Bearer ${userAccessToken}`,
    },
  }).then((response) => {
    if (response.ok) {
      return response.json();
    }
    throw new Error();
  });
};

// Heroku BE Database API Calls

// const postNewUserToDatabase = (user) => {
//   let url;
//   if (window.location.href.startsWith("http://localhost:5173")) {
//     url = "http://localhost:5001/users";
//   } else {
//     url = "https://rideready-be.herokuapp.com/users";
//   }
//   return fetch(url, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(user),
//   }).then((response) => {
//     if (response.ok) {
//       return response.json();
//     }
//     throw new Error();
//   });
// };

// const postNewRidesToDatabase = (rides) => {
//   let url;
//   if (window.location.href.startsWith("http://localhost:5173")) {
//     url = "http://localhost:5001/rides";
//   } else {
//     url = "https://rideready-be.herokuapp.com/rides";
//   }
//   return fetch(url, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(rides),
//   }).then((response) => {
//     if (response.ok) {
//       return response.json();
//     }
//     throw new Error();
//   });
// };

export {
  getAccessToken,
  getUserDetails,
  getUserActivities,
  getUserGearDetails,
  // postNewUserToDatabase,
  // postNewRidesToDatabase
};
