// STRAVA API Calls

export const getAccessToken = (userAuthToken) => {
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

// Not using this but may in down the road, works for
// fetching all user information
export const getUserDetails = (userAccessToken) => {
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

export const getUserActivities = (pageNum, userAccessToken) => {
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

export const getUserGearDetails = (id, userAccessToken) => {
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

export const loadUserSuspensionFromDatabase = (userID) => {
  let url;
  if (window.location.href.startsWith("http://localhost:5173")) {
    url = `http://localhost:5001/suspension/${userID}`;
  } else {
    url = `https://rideready-be.herokuapp.com/suspension/${userID}`;
  }
  return fetch(url).then((response) => {
    if (response.ok) {
      return response.json();
    }
    throw new Error();
  });
};

export const postUserSuspensionToDatabase = (newSus) => {
  let url;
  if (window.location.href.startsWith("http://localhost:5173")) {
    url = `http://localhost:5001/suspension`;
  } else {
    url = `https://rideready-be.herokuapp.com/suspension`;
  }
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/JSON" },
    body: JSON.stringify(newSus),
  }).then((response) => {
    if (response.ok) {
      return response.json();
    }
    throw new Error();
  });
};

export const editUserSuspensionInDatabase = (susToEdit) => {
  let url;
  if (window.location.href.startsWith("http://localhost:5173")) {
    url = `http://localhost:5001/suspension/${susToEdit.id}`;
  } else {
    url = `https://rideready-be.herokuapp.com/suspension/${susToEdit.id}`;
  }
  return fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/JSON" },
    body: JSON.stringify(susToEdit),
  }).then((response) => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error();
    }
  })
}

export const deleteUserSuspensionInDatabase = (susToDeleteId) => {
  let url;
  if (window.location.href.startsWith("http://localhost:5173")) {
    url = `http://localhost:5001/suspension/${susToDeleteId}`;
  } else {
    url = `https://rideready-be.herokuapp.com/suspension/${susToDeleteId}`;
  }
  return fetch(url, {
    method: "DELETE"
  }).then((response) => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error();
    }
  })
}