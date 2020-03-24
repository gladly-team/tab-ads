// Support server-side rendering.
const getGlobal = () => {
  if (typeof window !== 'undefined') {
    return window
  }
  if (typeof global !== 'undefined') {
    return global
  }
  throw new Error('The tab-ads package should run in a browser or Node.')
}

export default getGlobal
