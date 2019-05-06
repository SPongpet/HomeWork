import Memory from './adapters/Memory'

const eventPrifix = '$rtdb$'
const userPath = 'user'

class Db {
  constructor(io, dbOptions) {

    const { Adapter = Memory, auth = () => true, onChange = () => { } } = dbOptions

    this.io = io
    this.adapter = new Adapter(dbOptions)
    this.auth = auth
    this.io.on('connection', (socket) => {
      socket.rtdb = new Memory({})
      socket.on(`${eventPrifix}get`, async (eventData) => {
        //auth
        if (!await this.doAuth(socket, `${eventPrifix}get`, eventData)) {
          return
        }

        const { path = '' } = eventData

        //user data
        if (path.startsWith(userPath)) {
          const value = await socket.rtdb.get(path)
          socket.emit(`${eventPrifix}get`, {
            path,
            value,
          })
        }

        //shared data
        const value = await this.get(path)
        this.io.emit(`${eventPrifix}get`, {
          path,
          value,
        })
      })

      socket.on(`${eventPrifix}set`, async (eventData) => {
        //auth
        if (!await this.doAuth(socket, `${eventPrifix}set`, eventData)) {
          return
        }

        const { path = '', value, option } = eventData

        //user data
        if (path.startsWith(userPath)) {
          const newValue = await socket.rtdb.set(path, value, option)
          socket.emit(`${eventPrifix}update`, {
            path,
            value: newValue,
          })
          //onChange
          onChange(this, socket, path, newValue)
          return
        }

        //shared data
        const val = await this.set(path, value, option)
        this.io.emit(`${eventPrifix}set`, {
          path,
          value: val,
        })

        //onChange
        onChange(this, socket, path, val)
      })
    })
  }

  async set(path, value, option) {
    const newValue = await this.adapter.set(path, value, option)
    this.io.emit(`${eventPrifix}update`, {
      path,
      value: newValue,
    })
    return newValue
  }

  async get(path) {
    return await this.adapter.get(path)
  }

  async doAuth(socket, event, eventData) {
    const authit = () => {
      return new Promise((resolve, reject) => {
        const rtn = this.auth(socket.rtdb.data.user, event, eventData, this)
        if (rtn.then) {
          rtn.then(resolve).catch(reject)
        } else {
          resolve(rtn)
        }
      })
    }

    const rtn = await authit()
    if (!rtn) {
      socket.emit(event, {
        ...eventData,
        error: 'auth fail',
      })
      return false
    }
    return true
  }
}

export default Db