import request from '@/utils/request'

export function fetchTransactionList() {
  return request({
    url: '/vue-element-admin/transactions',
    method: 'get'
  })
}

export function fetchTransactionById(id) {
  return request({
    url: `/vue-element-admin/transactions/${id}`,
    method: 'get'
  })
}


export function verifyTransactionById(id,data) {
  return request({
    url: `/vue-element-admin/transactions/${id}`,
    method: 'post',
    data
  })
}
