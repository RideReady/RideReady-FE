/* global cy, describe, beforeEach, it */
describe('Home', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/')
  })
    
  it('Should display the site title, tagline and login button', () => {
    cy.get('h1').should('have.text', 'Ride Ready')
    cy.get('h2').should('have.text', 'Mountain Bike Suspension Service Life Tracker')
    cy.get('button').should('have.text', 'Log in with Strava')
  })

  it('Should show an error on a bad url request', () => {
    cy.visit('http://localhost:5173/badurlrequest')
    cy.get('p').should('have.text', 'Oops, no page exists here. Sending you back to the home page.')
  })
})