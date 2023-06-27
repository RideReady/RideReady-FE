/* global cy, describe, beforeEach, it */
describe("dashboard", () => {
  beforeEach(() => {
    cy.visit(
      "http://localhost:5173/redirect/exchange_token?state=&code=97dd82f961714a09adb14e47b242a23103c4c202&scope=read,activity:read_all"
    );
    cy.intercept("POST", `https://www.strava.com/oauth/token`, {
      statusCode: 200,
      body: {
        access_token: "accessToken",
      },
    });

    cy.intercept("GET", "http://localhost:5001/suspension/*", {
      body: { suspension: [] },
    });

    cy.intercept(
      "GET",
      `https://www.strava.com/api/v3/athlete/activities?page=1&per_page=200`,
      {
        fixture: "RideData.json",
      }
    );

    cy.intercept("GET", `https://www.strava.com/api/v3/gear/b9082682`, {
      fixture: "EnduroData.json",
    });

    cy.intercept("GET", `https://www.strava.com/api/v3/gear/b1979857`, {
      fixture: "AllezData.json",
    });
  });

  it("Should display the site title", () => {
    cy.get("h1").should("have.text", "Ride Ready");
  });

  it('Should have a a "add suspension" message', () => {
    cy.get('p[class="add-new-mesg"]').should("be.visible");
  });

  it("Should have a button to add suspension", () => {
    cy.get("button").should("have.text", "Add new suspension");
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

    cy.get('button[id="dash-add-sus"').click();
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
            date_created:"2023-06-27T06:00:00.000Z"
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
});
