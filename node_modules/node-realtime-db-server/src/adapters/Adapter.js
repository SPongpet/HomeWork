import operations from '../operations'
import fn2async from '../utils/fn2async'

class Adapter {
  constructor(dbOptions = {}) {
    this._operationMap = this.getOriginalHandles(dbOptions)
    this.lock = false
    this.useLock = dbOptions.useLock
    this.lockRetryTimeout = dbOptions.lockRetryTimeout || 100
  }

  async set(path, value, option) {
    if (this.useLock) {
      while (this.lock) {
        await new Promise((resolve) => setTimeout(() => resolve(), this.lockRetryTimeout))
      }
      this.lock = true
    }
    const op = getOperation(option)
    if (this._operationMap[op]) {
      const rtn = await this._operationMap[op](path, value)
      if (this.useLock) {
        this.lock = false
      }
      return rtn
    }
    throw `not implemented option: ${op}`
  }

  async get(path) {
    return undefined
  }

  async update(path, value) {
    return undefined
  }

  async incr(path, value) {
    return undefined
  }

  async decr(path, value) {
    return undefined
  }

  async push(path, item) {
    return undefined
  }

  async unshift(path, item) {
    return undefined
  }

  async splice(path, args) {
    return undefined
  }

  getOriginalHandles() {
    const isNumber = x => typeof x == 'number'
    const checkMap = {
      incr: [isNumber, 0],
      decr: [isNumber, 0],
      push: [Array.isArray, []],
      unshift: [Array.isArray, []],
      splice: [Array.isArray, []],
    }

    const _operationMap = {
      set: async (path, v) => this.update(path, v),
    }

    Object.keys(checkMap).map(method => {
      _operationMap[method] = async (path, v) => {
        const { pass, value } = await this.checkPathType(path, checkMap[method][0], checkMap[method][1])
        if (!pass) {
          return value
        }
        return await this[method](path, v, value)
      }
    })
    return _operationMap
  }

  async checkPathType(path, check, defaultValue) {
    const value = await this.get(path)
    if (typeof value == 'undefined') {
      return {
        value: defaultValue,
        pass: true,
      }
    }
    const checkPass = await fn2async(check, [value])
    if (checkPass) {
      return {
        value,
        pass: true
      }
    }
    return {
      value,
      pass: false
    }
  }
}

function getOperation(option) {
  const defaultOperation = operations.set
  if (!option) {
    return defaultOperation
  }
  if (typeof option == 'string') {
    if (isValid(option)) {
      return option
    }
    return defaultOperation
  }
  if (option.operation) {
    if (isValid(option.operation)) {
      return option.operation
    }
    return defaultOperation
  }
  return defaultOperation

  function isValid(operation) {
    return operations[operation]
  }
}

export default Adapter