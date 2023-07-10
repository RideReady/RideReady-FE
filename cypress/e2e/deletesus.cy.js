/* global cy, describe, beforeEach, it */
describe('deleteSus', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/redirect/exchange_token?state=&code=97dd82f961714a09adb14e47b242a23103c4c202&scope=read,activity:read_all')
    cy.intercept('POST', `https://www.strava.com/oauth/token`, {
      statusCode: 200,
      body: {
        access_token: 'accessToken'
      }
    })

    cy.intercept("GET","http://localhost:5001/suspension/*", {
      body: []
    })

    cy.intercept('POST', 'http://localhost:5001/suspension', {
      statusCode: 201,
      body: JSON.stringify('New suspension added to DB: newSusData from test')
    })

    cy.intercept('GET',`https://www.strava.com/api/v3/athlete/activities?page=1&per_page=200`, {
      fixture: 'RideData.json'
    })

    cy.intercept('GET',`https://www.strava.com/api/v3/athlete/activities?page=*`, {
      fixture: 'RideData.json'
    })

    cy.intercept('GET',`https://www.strava.com/api/v3/gear/b9082682`, {
      fixture: 'EnduroData.json'
    })

    cy.intercept('GET',`https://www.strava.com/api/v3/gear/b1979857`, {
      fixture: 'AllezData.json'
    })

    cy.get('button[id="dash-add-sus"').click()

    cy.wait(200)
    cy.get('select[name="bikeSelect"]').select(1)
    cy.wait(200)
    cy.get('select[name="suspensionSelect"]').select('RockShox Fork')
    cy.wait(200)
    cy.get('input[name="lastRebuild"]').type('2023-01-01')
    cy.wait(200)
    cy.get('button').eq(1).click()
  })

  it('Should navigate to the delete sus page when button is clicked on tile', () => {
    cy.get('button').eq(0).click()

    cy.url().should('eq', 'http://localhost:5173/dashboard/delete')
  })

  it('Should show the name of the correct part selected to delete', () => {
    cy.get('button').eq(0).click()
    
    cy.get('h3').should('contain', 'RockShox Fork')
    cy.get('h3').should('contain', 'on Specialized Enduro')
  })

  it('Should delete the selected tile and navigate to the dashboard', () => {
    cy.get('button').eq(0).click()

    cy.get('button').eq(1).click()

    cy.url().should('eq', 'http://localhost:5173/dashboard')

    cy.get('article[class="tile"]').should('not.exist')

    cy.get('p[class="add-new-mesg"]').should('have.text', "No suspension to view. Add a new suspension part by clicking the button below.")
  })

  it("Should remain on the deleteSus page if the database delete request fails", () => {
    cy.intercept("DELETE", "http://localhost:5001/suspension/*", {
      statusCode: 500,
      body: "Error deleting suspension: errorDetails",
    });

    cy.get("button").eq(0).click();

    cy.get("button").eq(1).click();

    cy.url().should("eq", "http://localhost:5173/dashboard/delete");
  });

})