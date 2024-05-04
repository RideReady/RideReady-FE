/* global cy, describe, beforeEach, it */
describe("dashboard", () => {
  beforeEach(() => {
    // Create default intercepts
    cy.intercept("POST", `https://www.strava.com/oauth/token`, {
      statusCode: 200,
      body: {
        access_token: "accessToken",
      },
    }).as("stravaPostAuthToken");

    cy.intercept("https://www.strava.com/api/v3/athlete", {
      fixture: "athleteDetails.json",
    }).as("stravaAthleteDetailsApi");

    cy.intercept(
      "GET",
      `https://www.strava.com/api/v3/athlete/activities?page=*`,
      {
        fixture: "activityDataPage1.json",
      }
    ).as("stravaActivityApiPage1");

    cy.intercept("GET", `https://www.strava.com/api/v3/gear/b9082682`, {
      fixture: "EnduroData.json",
    }).as("stravaGearApiEnduro");

    cy.intercept("GET", `https://www.strava.com/api/v3/gear/b1979857`, {
      fixture: "AllezData.json",
    }).as("stravaGearApiAllez");

    cy.intercept("GET", "https://www.strava.com/api/v3/gear/b3913353", {
      fixture: "notMyBikeData.json",
    }).as("stravaGearApiNotMyBike");

    cy.intercept("GET", "http://localhost:5001/suspension/391197", {
      body: { suspension: [] },
    }).as("localDbGetSuspension");

    // Start test set up
    cy.visit(
      "http://localhost:5173/redirect/exchange_token?state=&code=97dd82f961714a09adb14e47b242a23103c4c202&scope=read,activity:read_all"
    );
  });

  it("Should display the site title", () => {
    cy.get("h1").should("have.text", "Ride Ready");
  });

  it('Should have a a "add suspension" message', () => {
    cy.get('p[class="add-new-mesg"]').should("be.visible");
  });

  it("Should have a button to add suspension", () => {
    cy.get("button").eq(0).should("have.text", "Add new suspension");
  });

  it("Should direct you to the AddNewPartForm on button click", () => {
    cy.intercept("GET", "http://localhost:5001/suspension/*", {
      body: {
        suspension: [
          {
            id: "8e2c847e-dd9c-44c6-91bc-6495c7eb803e",
            user_id: 391197,
            rebuild_life: 0.992804,
            rebuild_date: "2023-06-01T06:00:00.000Z",
            sus_data_id: 1,
            on_bike_id: "b9082682",
          },
        ],
      },
    });

    cy.wait(1000);

    cy.get('button[id="dash-add-sus-btn"]').click();
    cy.url().should("eq", "http://localhost:5173/dashboard/add-new-part");
  });

  it("Should load user suspension from database and display to user", () => {
    cy.intercept("GET", "http://localhost:5001/suspension/*", {
      body: {
        suspension: [
          {
            id: "8e2c847e-dd9c-44c6-91bc-6495c7eb803e",
            user_id: 391197,
            rebuild_life: 0.992804,
            rebuild_date: "2023-06-01T06:00:00.000Z",
            sus_data_id: 1,
            on_bike_id: "b9082682",
            date_created: "2023-06-27T06:00:00.000Z",
          },
        ],
      },
    });

    cy.wait(1000);

    cy.get("h2").should("have.text", "RockShox Fork");
    cy.get("h3").eq(0).should("have.text", "on your Specialized Enduro");
    cy.get("h3").eq(1).should("have.text", "99% service life remaining");
    cy.get("h3").eq(2).should("have.text", `It's Ride Ready!`);
    cy.get("p").eq(0).should("have.text", `Last serviced: Jun 1, 2023`);
  });

  it("Should show the user an error if error loading suspension from DB", () => {
    cy.intercept("GET", "http://localhost:5001/suspension/391197", {
      statusCode: 500,
      body: "Error with suspension query for userID: Error details",
    });

    cy.wait(1000);

    cy.get('p[class="add-new-mesg"]').should(
      "contain",
      "An error occurred while loading your data"
    );
  });

  it("Should show the user a button to return home and try logging in again", () => {
    cy.intercept("GET", "http://localhost:5001/suspension/*", {
      statusCode: 500,
      body: "Error with suspension query for userID: Error details",
    });

    cy.wait(1000);

    cy.get("button").eq(0).should("have.text", "Return to login page");

    cy.get("button").eq(0).click();

    cy.url().should("eq", "http://localhost:5173/");
  });

  it("Should load user data from localStorage on a page reload and not crash", () => {
    cy.intercept("GET", "http://localhost:5001/suspension/*", {
      body: {
        suspension: [
          {
            id: "8e2c847e-dd9c-44c6-91bc-6495c7eb803e",
            user_id: 391197,
            rebuild_life: 0.992804,
            rebuild_date: "2023-06-01T06:00:00.000Z",
            sus_data_id: 1,
            on_bike_id: "b9082682",
            date_created: "2023-06-27T06:00:00.000Z",
          },
        ],
      },
    });

    cy.reload();

    cy.wait(1000);

    cy.get("h1").should("have.text", "Ride Ready");
    cy.get("h2").should("have.text", "RockShox Fork");
    cy.get("h3").eq(0).should("have.text", "on your Specialized Enduro");
    cy.get("h3").eq(1).should("have.text", "99% service life remaining");
    cy.get("h3").eq(2).should("have.text", `It's Ride Ready!`);
    cy.get("p").eq(0).should("have.text", `Last serviced: Jun 1, 2023`);

    cy.get("button").eq(0).should("have.text", "Delete suspension");
    cy.get("button").eq(1).should("have.text", "Update service date");
    cy.get("button").eq(2).should("have.text", "Add new suspension");
    cy.get("button").eq(3).should("have.text", "Send feedback");
  });
});

describe("dashboard login when new rides are needed", () => {
  it("should retrieve rides until ride data includes rebuild date", () => {
    cy.intercept("POST", `https://www.strava.com/oauth/token`, {
      statusCode: 200,
      body: {
        access_token: "accessToken",
      },
    }).as("stravaPostAuthToken");

    cy.intercept("https://www.strava.com/api/v3/athlete", {
      fixture: "athleteDetails.json",
    }).as("stravaAthleteDetailsApi");

    cy.intercept(
      "GET",
      `https://www.strava.com/api/v3/athlete/activities?page=1*`,
      {
        fixture: "activityDataPage1.json",
      }
    ).as("stravaActivityApiPage1");

    cy.intercept(
      "GET",
      `https://www.strava.com/api/v3/athlete/activities?page=2*`,
      {
        fixture: "activityDataPage2.json",
      }
    ).as("stravaActivityApiPage2");

    cy.intercept("GET", `https://www.strava.com/api/v3/gear/b9082682`, {
      fixture: "EnduroData.json",
    }).as("stravaGearApiEnduro");

    cy.intercept("GET", `https://www.strava.com/api/v3/gear/b1979857`, {
      fixture: "AllezData.json",
    }).as("stravaGearApiAllez");

    cy.intercept("GET", "https://www.strava.com/api/v3/gear/b3913353", {
      fixture: "notMyBikeData.json",
    }).as("stravaGearApiNotMyBike");

    cy.intercept("GET", "http://localhost:5001/suspension/391197", {
      fixture: "dbUserSusNeedsMoreRides.json",
    }).as("localDbSusNeedsMoreRides");

    cy.intercept("PATCH", "http://localhost:5001/suspension/*", {
      statusCode: 200,
      body: JSON.stringify("Suspension XXXXXX updated successfully"),
    }).as("patchSusDbSuccess");

    cy.visit(
      "http://localhost:5173/redirect/exchange_token?state=&code=97dd82f961714a09adb14e47b242a23103c4c202&scope=read,activity:read_all"
    );

    cy.get("article.tile")
      .eq(0)
      .find("h3")
      .eq(1)
      .should("have.text", "50% service life remaining");

      cy.get("article.tile")
      .eq(1)
      .find("h3")
      .eq(1)
      .should("have.text", "50% service life remaining");
  });
});
