// STRAVA API Calls

export const getAccessToken = (userAuthToken) => {
  let clientID = `${import.meta.env.VITE_CLIENT_ID}`;
  let clientSecret = `${import.meta.env.VITE_CLIENT_SECRET}`;

  // if (window.location.href.startsWith("http://localhost:5173/redirect/")) {
  //   clientID = `${import.meta.env.VITE_CLIENT_ID_LOCAL}`;
  //   clientSecret = `${import.meta.env.VITE_CLIENT_SECRET_LOCAL}`;
  // }

  return fetch(`https://www.strava.com/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
// export const getUserDetails = (userAccessToken) => {
//   return fetch("https://www.strava.com/api/v3/athlete", {
//     headers: {
//       Authorization: `Bearer ${userAccessToken}`,
//     },
//   }).then((response) => {
//     if (response.ok) {
//       return response.json();
//     }
//     throw new Error();
//   });
// };

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

// Must have `credentials: "include"` in header of
// all requests to maintain same Express session
// All req besides GET need to send the csrfToken
// in the body of the req

// CSRF added to BE 10.31.23

// NEED TO REFACTOR THESE URLS TO NOT USE /SUSPENSION AND
// UPDATE PROD AND DEV ENV VARS

export const getCsrfToken = () => {
  // const dbUrl = import.meta.env.VITE_DB_URL;
  // Change below hard code, and change above var to be base URL, add /suspension where needed below
  return fetch(`http://localhost:5001/csrf-token`, {
    method: "GET",
    credentials: "include",
  }).then((response) => {
    if (response.ok) {
      return response.json();
    }
    throw new Error();
  });
};

export const loadUserSuspensionFromDatabase = (userID) => {
  const dbUrl = import.meta.env.VITE_DB_URL;
  return fetch(`${dbUrl}${userID}`, {
    method: "GET",
    credentials: "include",
  }).then((response) => {
    if (response.ok) {
      return response.json();
    }
    throw new Error();
  });
};

export const postUserSuspensionToDatabase = (newSus, csrfToken) => {
  const dbUrl = import.meta.env.VITE_DB_URL;
  return fetch(dbUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify({_csrf: csrfToken, sus: newSus}),
  }).then((response) => {
    if (response.ok) {
      return response.json();
    }
    throw new Error();
  });
};

// FIRST CSRF REQ -------------
export const editUserSuspensionInDatabase = async (susToEdit, csrfToken) => {
  const dbUrl = import.meta.env.VITE_DB_URL;
  return fetch(`${dbUrl}${susToEdit.id}`, {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({_csrf: csrfToken, sus: susToEdit}),
  }).then((response) => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error();
    }
  });
};

export const deleteUserSuspensionInDatabase = (susToDeleteId) => {
  const dbUrl = import.meta.env.VITE_DB_URL;
  return fetch(`${dbUrl}${susToDeleteId}`, {
    method: "DELETE",
  }).then((response) => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error();
    }
  });
};
