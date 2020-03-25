/* eslint import/prefer-default-export:0 */

// To determine if we're running in a browser context.
export const isClientSide = () => typeof window !== 'undefined'
