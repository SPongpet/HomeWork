import fs from 'fs-extra'
import { join } from 'path'
import objectPath from 'object-path'
import Adapter from './Adapter'

class JsonFile extends Adapter {
  constructor(dbOptions = {}) {
    super(dbOptions)
    const { initalData = {}, filePath = join(process.cwd(), 'node-realtime-db.json') } = dbOptions
    this.jsonFilePath = filePath

    const exist = fs.existsSync(filePath)
    if (!exist) {
      fs.writeJsonSync(this.jsonFilePath, initalData)
    }
  }

  async get(path) {
    const data = await fs.readJson(this.jsonFilePath)
    return objectPath.get(data, path, undefined)
  }

  async update(path, newValue) {
    const data = await fs.readJson(this.jsonFilePath)
    objectPath.set(data, path, newValue)
    await fs.writeJson(this.jsonFilePath, data)
    return newValue
  }

  async incr(path, toIncr, value) {
    const data = await fs.readJson(this.jsonFilePath)
    const newValue = value + toIncr
    objectPath.set(data, path, newValue)
    await fs.writeJson(this.jsonFilePath, data)
    return newValue
  }

  async decr(path, toDecr, value) {
    const data = await fs.readJson(this.jsonFilePath)
    const newValue = value - toDecr
    objectPath.set(data, path, newValue)
    await fs.writeJson(this.jsonFilePath, data)
    return newValue
  }

  async push(path, item, value) {
    const data = await fs.readJson(this.jsonFilePath)
    const newValue = [...value, item]
    objectPath.set(data, path, newValue)
    await fs.writeJson(this.jsonFilePath, data)
    return newValue
  }

  async unshift(path, item, value) {
    const data = await fs.readJson(this.jsonFilePath)
    const newValue = [item, ...value]
    objectPath.set(data, path, newValue)
    await fs.writeJson(this.jsonFilePath, data)
    return newValue
  }

  async splice(path, args, value) {
    const data = await fs.readJson(this.jsonFilePath)
    const arr = [...value]
    arr.splice(...args)
    objectPath.set(data, path, arr)
    await fs.writeJson(this.jsonFilePath, data)
    return arr
  }
}

export default JsonFile
