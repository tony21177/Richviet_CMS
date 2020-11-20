import request from '@/utils/request'

export function fetchMemberList(query) {
  return request({
    url: '/admin/v1/useradmin',
    method: 'get',
    params: query
  })
}

export function fetchMemberById(id) {
  return request({
    url: `/admin/v1/useradmin/${id}`,
    method: 'get'
  })
}

export function updateMemberKycStatus(id, data) {
  console.log('debut updateMemberKycStatus')
  console.log(id, data)
  return request({
    url: `/admin/v1/kyc/${id}`,
    method: 'put',
    data
  })
}
