/* global cy, describe, beforeEach, it */
describe("add-new-part", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5173/dashboard/add-new-part");
  });

  it("Should display the site title", () => {
    cy.get("h1").should("have.text", "Ride Ready");
  });

  it("Should show all labels, inputs and buttons", () => {
    cy.get('label[for="bikeSelect"]').should(
      "have.text",
      "Which bike is this part on?"
    );
    cy.get('label[for="suspensionSelect"]').should(
      "have.text",
      "What is the make and type?"
    );
    cy.get('label[for="lastRebuild"]').should(
      "have.text",
      "When was it last rebuilt?"
    );

    cy.get('select[name="bikeSelect"]').should("be.visible");
    cy.get('select[name="suspensionSelect"]').should("be.visible");
    cy.get('input[name="lastRebuild"]').should("be.visible");

    cy.get("button").eq(0).should("have.text", "Back");
    cy.get("button").eq(1).should("have.text", "Submit");
  });

  it("Should update values when selecting options", () => {
    cy.get('select[name="bikeSelect"]').select(1);
    cy.get('select[name="suspensionSelect"]').select(5);
    cy.get('input[name="lastRebuild"]').type("2023-01-01");

    cy.get('select[name="bikeSelect"]').should("have.value", 0);
    cy.get('select[name="suspensionSelect"]').should("have.value", 5);
    cy.get('input[name="lastRebuild"]').should("have.value", "2023-01-01");
  });

  it("Should not allow a user to submit a new part without date selected", () => {
    cy.get('select[name="bikeSelect"]').select(1);
    cy.get('select[name="suspensionSelect"]').select([5]);
    cy.get("button").eq(1).click();

    cy.get("p[class=error-wait-message]").should("be.visible");
    cy.url().should("eq", "http://localhost:5173/dashboard/add-new-part");
  });

  it("Should not allow a user to submit a new part without suspension selected", () => {
    cy.get('select[name="bikeSelect"]').select(1);
    cy.get('input[name="lastRebuild"]').type("2023-01-01");
    cy.get("button").eq(1).click();

    cy.get("p[class=error-wait-message]").should("be.visible");
    cy.url().should("eq", "http://localhost:5173/dashboard/add-new-part");
  });

  it("Should not allow a user to submit a new part without bike selected", () => {
    cy.get('select[name="suspensionSelect"]').select([5]);
    cy.get('input[name="lastRebuild"]').type("2023-01-01");
    cy.get("button").eq(1).click();

    cy.get("p[class=error-wait-message]").should("be.visible");
    cy.url().should("eq", "http://localhost:5173/dashboard/add-new-part");
  });

  it("Should create a new suspension part on the dashboard when all inputs are filled out", () => {
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

    cy.intercept("GET", "http://localhost:5001/suspension/*", {
      body: { suspension: [] },
    }).as("localDbGetSuspension");

    cy.intercept("POST", "http://localhost:5001/suspension", {
      statusCode: 201,
      body: JSON.stringify("New suspension added to DB: newSusData from test"),
    }).as("localDbPostSuspension");

    cy.visit(
      "http://localhost:5173/redirect/exchange_token?state=&code=97dd82f961714a09adb14e47b242a23103c4c202&scope=read,activity:read_all"
    );

    cy.get('button[id="dash-add-sus-btn"]').click();

    cy.wait(200);
    cy.get('select[name="bikeSelect"]').select(1);
    cy.wait(200);
    cy.get('select[name="suspensionSelect"]').select("RockShox Fork");
    cy.wait(200);
    cy.get('input[name="lastRebuild"]').type("2023-01-01");
    cy.wait(200);
    cy.get("button").eq(1).click();

    cy.get("h2").should("have.text", "RockShox Fork");
    cy.get("h3").eq(0).should("have.text", "on your Specialized Enduro");
    cy.get("h3").eq(1).should("have.text", "50% service life remaining");
    cy.get("h3").eq(2).should("have.text", `It's Ride Ready!`);
    cy.get("p").eq(0).should("have.text", "Last serviced: Jan 1, 2023");
  });
});
