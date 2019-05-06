export default (fn, args) => () => {
  const rtn = fn(...args)
  if (rtn.then) {
    return rtn
  } else {
    return Promise.resolve(rtn)
  }
}