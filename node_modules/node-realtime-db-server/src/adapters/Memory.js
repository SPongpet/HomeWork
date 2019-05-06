import objectPath from 'object-path'
import Adapter from './Adapter'

class Memory extends Adapter {
  constructor(dbOptions = {}) {
    super(dbOptions)

    const { initalData = {} } = dbOptions
    this.data = initalData
  }

  async get(path) {
    return objectPath.get(this.data, path, undefined)
  }

  async update(path, newValue) {
    objectPath.set(this.data, path, newValue)
    return newValue
  }

  async incr(path, toIncr, value) {
    const newValue = value + toIncr
    objectPath.set(this.data, path, newValue)
    return newValue
  }

  async decr(path, toDecr, value) {
    const newValue = value - toDecr
    objectPath.set(this.data, path, newValue)
    return newValue
  }

  async push(path, item, value) {
    const newValue = [...value, item]
    objectPath.set(this.data, path, newValue)
    return newValue
  }

  async unshift(path, item, value) {
    const newValue = [item, ...value]
    objectPath.set(this.data, path, newValue)
    return newValue
  }

  async splice(path, args, value) {
    const arr = [...value]
    arr.splice(...args)
    objectPath.set(this.data, path, arr)
    return arr
  }
}

export default Memory