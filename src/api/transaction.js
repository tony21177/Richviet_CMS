import request from '@/utils/request'

export function fetchTransactionList() {
  return request({
    url: 'admin/remit/v1/review',
    method: 'get'
  })
}

export function fetchTransactionById(id) {
  return request({
    url: `admin/remit/v1/review/${id}`,
    method: 'get'
  })
}


export function amlReviewById(data) {
  return request({
    url: `/admin/remit/v1/review/AmlReview`,
    method: 'post',
    data,
    headers: {
      'Content-type': 'application/json; charset=UTF-8;'
    }
  })
}

export function completeById(data) {
  return request({
    url: `/admin/remit/v1/review/Complete`,
    method: 'post',
    data,
    headers: {
      'Content-type': 'application/json; charset=UTF-8;'
    }
  })
}

export function simulatePaying(data){
  return request({
    url: `/admin/remit/v1/review/SimulatingUserPay`,
    method: 'post',
    data,
    headers: {
      'Content-type': 'application/json; charset=UTF-8;'
    }
  })
}