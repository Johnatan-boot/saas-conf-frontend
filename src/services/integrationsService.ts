import api from './api'

export const integrationsService = {
  // iFood
  async getIFoodStatus() {
    const { data } = await api.get('/integrations/ifood/status')
    return data.data
  },
  async connectIFood(credentials: { clientId: string; clientSecret: string; merchantId: string }) {
    const { data } = await api.post('/integrations/ifood/connect', credentials)
    return data
  },
  async disconnectIFood() {
    const { data } = await api.post('/integrations/ifood/disconnect')
    return data
  },
  async syncIFood() {
    const { data } = await api.post('/integrations/ifood/sync')
    return data
  },
  async getIFoodOrders() {
    const { data } = await api.get('/integrations/ifood/orders')
    return data.data
  },
  async confirmIFoodOrder(externalId: string) {
    const { data } = await api.post(`/integrations/ifood/orders/${externalId}/confirm`)
    return data
  },
  async dispatchIFoodOrder(externalId: string) {
    const { data } = await api.post(`/integrations/ifood/orders/${externalId}/dispatch`)
    return data
  },
}
