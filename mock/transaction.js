const { date } = require('jszip/lib/defaults')
const Mock = require('mockjs')

const List = []
const count = 9



for (let i = 0; i < count; i++) {
  List.push(Mock.mock({
    id: '@increment',
    userId : '1000'+i,
    name: '@name',
    arcNo: 'NC1234567'+i,
    fromAmount: '@integer(1000,20000)',
    fee: 150,
    discountAmount: 0,
    exchangeRate: 800,
    toAmount: 0,
    bank: 'Ngân hàng Cathay United',
    payeeAddress: '0013004245'+i,
    payeeRelationTypeDescription: '父母',
    'transactionStatus|1': [-10,-9,-8,0,1,2,3,9],
    formalApplyTime: new Date()
  }))
}

const transaction = {
  id: 1,
  userId : '10002',
  name: 'Nguyen Hoang Viet',
  arcNo: 'NC12345670',
  fromAmount: 10000,
  fee: 150,
  discountAmount: 0,
  exchangeRate: 800,
  bank: 'Ngân hàng Cathay United',
  payeeAddress: '00130042450',
  payeeRelationTypeDescription: '父母',
  transactionStatus: 4,
  formalApplyTime: new Date(),
  adminVerifyNote: "審核通過"
}

module.exports = [
  {
    url: '/vue-element-admin/transactions/[0-9]+',
    type: 'get',
    response: _ => {
      return {
        status: 200,
        success: true,
        msg: null,
        data:  transaction
      }
    }
  },
  {
    url: '/vue-element-admin/transactions',
    type: 'get',
    response: _ => {
      return {
        status: 200,
        success: true,
        msg: null,
        data:  List
      }
    }
  }
]

