import axios from 'axios'
import FormData from 'formdata-node'

export class Mailgun {
  url: string
  apiKey: string
  constructor (options: { domain: string; apiKey: string }) {
    this.url = options.domain
    this.apiKey = options.apiKey
  }

  sendMail (options: any) {
    const data = this.jsonToFormData(options)
    if (!data) return
    return axios
      .post(`https://api.mailgun.net/v3/${this.url}/messages`, data.stream, {
        headers: data.headers,
        auth: { username: 'api', password: this.apiKey }
      })
      .catch((err) => {
        console.log(err.response)
        return err.response
      })
  }

  getStats () {
    return axios.get(`${this.url}/events`, {
      auth: {
        username: 'api',
        password: this.apiKey
      }
    })
  }

  jsonToFormData (json: Record<string, any>) {
    const formData = new FormData()
    if (typeof json === 'object') {
      for (const key in json) {
        formData.set(key, json[key])
      }
      return formData
    } else {
      return false
    }
  }
}
