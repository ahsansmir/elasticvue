import ElasticsearchAdapter from '../ElasticsearchAdapter'
import ElasticsearchVersionService from './ElasticsearchVersionService'

export default class ConnectionService {
  constructor (host) {
    this.host = host
  }

  async getAdapter () {
    let client = await this.buildClient()
    return new ElasticsearchAdapter(client)
  }

  async buildClient () {
    let versionService = new ElasticsearchVersionService(this.host)
    let apiVersion = await versionService.getApiVersion()

    return import(/* webpackChunkName: "elasticsearch-js" */ 'elasticsearch').then(Elasticsearch => {
      return new Elasticsearch.Client({
        host: this.host,
        apiVersion: apiVersion,
        log: false // process.env.NODE_ENV === 'production' ? false : 'trace'
      })
    })
  }

  async testConnection () {
    try {
      let client = await this.buildClient()
      let adapter = new ElasticsearchAdapter(client)
      await adapter.ping()
      await adapter.search({ size: 0 })
      return adapter
    } catch (e) {
      return Promise.reject(e)
    }
  }
}
