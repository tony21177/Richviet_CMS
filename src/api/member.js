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
    data,
    headers: {
      'Content-type': 'application/json; charset=UTF-8;'
    }
  })
}

export function updateMember(data) {
  console.log('debug updateMember')
  console.log(data)
  return request({
    url: `/admin/user/v1/command/modify`,
    method: 'post',
    data,
    headers: {
      'Content-type': 'application/json; charset=UTF-8;'
    }
  })
}

export function deleteMember(userId) {
  console.log('debug deleteMember')
  console.log(userId)
  return request({
    url: `admin/user/v1/command/${userId}`,
    method: 'delete'
  })
}
