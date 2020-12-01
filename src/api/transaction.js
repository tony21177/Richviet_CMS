import request from '@/utils/request'

export function fetchTransactionList() {
  return request({
    url: '/vue-element-admin/transactions',
    method: 'get'
  })
}

