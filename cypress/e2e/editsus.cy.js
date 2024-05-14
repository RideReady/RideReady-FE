/* global cy, describe, beforeEach, it */
describe("EditSus", () => {
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

    cy.intercept(
      "GET",
      `https://www.strava.com/api/v3/athlete/activities?page=3*`,
      {
        fixture: "activityDataPage3.json",
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

    cy.intercept("GET", "http://localhost:5001/suspension/*", {
      body: { suspension: [] },
    }).as("localDbGetSuspension");

    cy.intercept("POST", "http://localhost:5001/suspension", {
      statusCode: 201,
      body: JSON.stringify("New suspension added to DB: newSusData from test"),
    }).as("localDbPostSuspension");

    cy.intercept("PATCH", "http://localhost:5001/suspension/*", {
      statusCode: 200,
      body: { message: `Suspension testSusId updated successfully` },
    }).as("localDbPatchSuspension");

    // Start test set up
    cy.visit(
      "http://localhost:5173/redirect/exchange_token?state=&code=97dd82f961714a09adb14e47b242a23103c4c202&scope=read,activity:read_all"
    );

    cy.wait(200);
    cy.get('button[id="dash-add-sus-btn"]').click();

    cy.wait(200);
    cy.get('select[name="bikeSelect"]').select(1);
    cy.wait(200);
    cy.get('select[name="suspensionSelect"]').select("RockShox Fork");
    cy.wait(200);
    cy.get('input[name="lastRebuild"]').type("2023-06-01");
    cy.wait(200);
    cy.get("button").eq(1).click();
  });

  it("Should navigate to the edit view when clicking the edit button on a tile", () => {
    cy.get("button").eq(1).click();
    cy.url().should("eq", "http://localhost:5173/dashboard/edit");
  });

  it("Should not allow a submission if the date field has not been modified", () => {
    cy.get("button").eq(1).click();

    cy.get("button").eq(1).click();

    cy.get('p[class="error-wait-message"]').should("be.visible");

    cy.url().should("eq", "http://localhost:5173/dashboard/edit");
  });

  it("Should navigate to the dashboard on new date entry", () => {
    cy.get("button").eq(1).click();

    cy.get("input").type("2022-10-10");
    cy.get("button").eq(1).click();

    cy.url().should("eq", "http://localhost:5173/dashboard");
  });

  it("Should update the last rebuild date shown on the selected tile", () => {
    cy.get("button").eq(1).click();

    cy.get("input").type("2022-10-10");
    cy.wait(500);
    cy.get("button").eq(1).click();

    cy.get("h2").should("have.text", "RockShox Fork");
    cy.get("h3").eq(0).should("have.text", "on your Specialized Enduro");
    cy.get("h3").eq(1).should("have.text", "50% service life remaining");
    cy.get("h3").eq(2).should("have.text", `It's Ride Ready!`);
    cy.get("p").eq(0).should("have.text", "Last serviced: Oct 10, 2022");
  });

  it("Should remain on the editSus page if the database patch request fails", () => {
    cy.intercept("PATCH", "http://localhost:5001/suspension/*", {
      statusCode: 500,
      body: "Error updating suspension: errorDetails",
    });

    cy.get("button").eq(1).click();

    cy.get("input").type("2023-10-10");
    cy.get("button").eq(1).click();

    cy.url().should("eq", "http://localhost:5173/dashboard/edit");

    cy.get("h2").eq(1).should("have.text", "Currently: Jun 1, 2023");

    cy.get("dialog[id='editSusErrorModal']").should("be.visible");

    cy.get("dialog[id='editSusErrorModal']").should(
      "contain",
      "There was an issue modifying your suspension rebuild date"
    );
  });
});
