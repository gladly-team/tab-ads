/* eslint-disable import/prefer-default-export */

// TODO: clean this up and test this. It's a replacement for the tab window variable.
let adDataStore = {}

export const getAdDataStore = () => adDataStore

export const clearAdDataStore = () => {
  adDataStore = {}
}
