<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.id"
        placeholder="id"
        style="width: 200px"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-select
        v-model="listQuery.sort"
        style="width: 140px"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option
          v-for="item in sortOptions"
          :key="item.key"
          :label="item.label"
          :value="item.key"
        />
      </el-select>
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >
        Search
      </el-button>
      <el-button
        v-waves
        :loading="downloadLoading"
        class="filter-item"
        type="primary"
        icon="el-icon-download"
        @click="handleDownload"
      >
        Export
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%"
      @sort-change="sortChange"
    >
      <el-table-column
        label="ID"
        prop="id"
        sortable="custom"
        align="center"
        width="80"
        :class-name="getSortClass('id')"
      >
        <template slot-scope="{ row }">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="會員id" width="150px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.userId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="會員姓名" width="150px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.arcName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="會員ARC" width="150px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.arcNo }}</span>
        </template>
      </el-table-column>
      <el-table-column label="交易金額" width="150px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.fromAmount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="交易狀態" width="200px" align="center">
        <template slot-scope="{ row }">
          <el-tag>{{ row.transactionStatus | transactionStatusFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="申請時間" width="110px" align="center">
        <template slot-scope="{ row }">
          <span>{{ new Date(row.formalApplyTime*1000).toLocaleDateString() }}<span /></span></template>
      </el-table-column>
      <el-table-column
        label="Actions"
        align="center"
        width="230"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{ row, $index }">
          <el-button
            type="primary"
            size="mini"
            @click="handleUpdate(row, $index)"
          >
            明細資料
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <!-- member detail dialog -->
    <el-dialog title="交易明細" :visible.sync="dialogFormVisible" width="60%">
      <el-form
        ref="dataForm"
        :model="temp"
        label-position="left"
        label-width="150px"
        style="width: 100%; margin-left: 50px"
      >
        <div class="left" style="float:left">
          <el-form-item label="姓名">
            <span>{{ temp.arcName }}</span>
          </el-form-item>
          <el-form-item label="ARC">
            <span>{{ temp.arcNo }}</span>
          </el-form-item>
          <el-form-item label="交易狀態">
            <span style="margin-right:10px">{{ temp.transactionStatus | transactionStatusFilter }}</span>
            <el-button
              type="primary"
              size="mini"
              :disabled="waitingAdminVerify"
              @click="showDialog()"
            >
              變更
            </el-button>
          </el-form-item>
          <div style="width: 100%; height: 40%; margin-top:70px" />
          <el-form-item label="交易金額">
            <span>{{ temp.fromAmount}}</span>
          </el-form-item>
          <el-form-item label="手續費">
            <span>{{ temp.fee }}</span>
          </el-form-item>
          <el-form-item label="優惠">
            <span>{{ temp.discountAmount==null?0:temp.discountAmount }}</span>
          </el-form-item>
          <el-form-item label="匯率">
            <span>{{ temp.transactionExchangeRate }}</span>
          </el-form-item>
          <el-form-item label="實收金額">
            <span>{{ temp.toAmount }}</span>
          </el-form-item>
          <div style="width: 100%; height: 40%; margin-top:70px" />
          <el-form-item label="收款銀行">
            <span>{{ temp.bank }}</span>
          </el-form-item>
          <el-form-item label="帳號">
            <span>{{ temp.payeeAddress }}</span>
          </el-form-item>
          <el-form-item label="關係">
            <span>{{ temp.payeeRelationTypeDescription }}</span>
          </el-form-item>
          <el-form-item label="及時拍照:">
            <img :src="imageUrl+'/0'" width="200" height="200">
          </el-form-item>
          <el-form-item label="電子簽名:">
            <img :src="imageUrl+'/1'" width="200" height="200">
          </el-form-item>
        </div>
        <div class="right" style="float:left">
          <el-timeline>
            <el-timeline-item
              v-for="(transactionStatus, index) in transactionStatusTimeLine"
              :key="index"
              :color="transactionStatus.color"
            >
              {{ transactionStatus.label }}:
              <el-card>
                <h4>{{ transactionStatus.note }}</h4>
                <p>{{ transactionStatus.timestamp }}</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer" style="clear:both;">
        <el-button @click="dialogFormVisible = false"> Cancel </el-button>
      </div>
    </el-dialog>

    <!-- change transaction status dialog -->
    <el-dialog :title="titleMap[dialogStatus]" :visible.sync="dialogTransactionStatusVisible">
      <el-form
        label-position="left"
        label-width="150px"
        style="width: 400px; margin-left: 50px"
      >
        <el-form-item label="營運人員審核:">
          <template>
            <el-radio v-model="verifyPass" :label="true" >{{passActionMap[adminPassAction]}}</el-radio>
            <el-radio v-model="verifyPass" :label="false">{{failActionMap[adminFailAction]}}</el-radio>
          </template>
        </el-form-item>
        <el-form-item label="備註:">
          <el-input v-model="adminVerifyNote" type="textarea" :rows="3" maxlength="50" placeholder="請輸入審核原因請輸入審核原因"/>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = true;dialogTransactionStatusVisible=false;"> Cancel </el-button>
        <el-button type="primary" @click="changeTransactionStatus()"> Confirm </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="SimulateingPayShow">
      <el-form
        label-position="left"
        label-width="150px"
        style="width: 700px; margin-left: 50px"
      >
        <el-form-item label="營運人員審核:">
          <el-card >模擬使用者匯款成功,銀行通知繳款完成</el-card>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="simulatePay()"> 模擬匯款 </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { fetchTransactionList, fetchTransactionById, verifyTransactionById, amlReviewById, completeById,simulatePaying } from '@/api/transaction'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const OTHER_ERROR = '其他錯誤'
const FALL_VERIFIED = '審核失敗'
const FALL_AML = 'AML未通過'
const OVER_TIME = '交易逾期'
const DRAFT = '草稿'
const WAITING_ARC_VERIFY = '待ARC審核'
const PASS_ARC_VERIFY = 'ARC審核成功'
const PASS_AML_VERIFY = 'AML審核成功'
const ADMIN_VERIFIED = '營運人員確認完成,待繳費'
const PAID = '已繳款完成,待匯款'
const COMPLETE = '交易完成'

const transactionStatusOptions = [{ value: -10, label: OTHER_ERROR, disabled: true }, { value: -9, label: FALL_VERIFIED }, { value: -8, label: FALL_AML }, { value: -7, label: OVER_TIME }, { value: 0, label: DRAFT, disabled: true },
  { value: 1, label: WAITING_ARC_VERIFY, disabled: true }, { value: 2, label: PASS_ARC_VERIFY }, { value: 3, label: PASS_AML_VERIFY }, { value: 4, label: ADMIN_VERIFIED },
  { value: 5, label: PAID, disabled: true }, { value: 9, label: COMPLETE }]

const transactionStatusKeyValue = transactionStatusOptions.reduce((acc, cur) => {
  acc[cur.value] = cur.label
  return acc
}, {})

const transactionStatusMapping = transactionStatusOptions.reduce((acc, cur) => {
  acc[cur.label] = cur.value
  return acc
}, {})

export default {
  name: 'TransactionsTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    transactionStatusFilter(type) {
      return transactionStatusKeyValue[type]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        id: undefined,
        sort: '+id'
      },
      changToTransactionStatus: transactionStatusOptions,
      transactionStatusTimeLine:　transactionStatusOptions.filter(status => status.value >= transactionStatusMapping[DRAFT]),
      sortOptions: [
        { label: 'ID Ascending', key: '+id' },
        { label: 'ID Descending', key: '-id' }
      ],
      temp: {
        id: undefined,
        userId: undefined,
        arcName: '',
        arcNo: '',
        fromAmount: '',
        fee: '',
        discountAmount: '',
        transactionExchangeRate: '',
        toAmount: '',
        bank: '',
        payeeAddress: '',
        payeeRelationTypeDescription: '',
        transactionStatus: '',
        formalApplyTime: ''
      },
      dialogStatus: '',
      titleMap: {
        verify: '營運人員審核:',
        complete: '匯款結果:'
      },
      adminPassAction:'',
      adminFailAction:'',
      passActionMap:{
        verifyPass: '審核通過',
        completePass: '匯款成功',
      },
      failActionMap:{
        verifyFail: '審核失敗',
        completeFail: '匯款失敗'
      },
      dialogFormVisible: false,
      dialogTransactionStatusVisible: false,
      downloadLoading: false,
      verifiedTransactionId: null,
      verifyPass: '',
      adminVerifyNote: '',
      toTransactionStatus: '',
      SimulateingPayShow: false,
      isSimulatingPay: false
    }
  },
  computed: {
    imageUrl() {
      return process.env.VUE_APP_ARC_IMAGE_URL+"remit/" + this.verifiedTransactionId
    },
    waitingAdminVerify() {
      return this.temp.transactionStatus != transactionStatusMapping[PASS_AML_VERIFY] && this.temp.transactionStatus != transactionStatusMapping[PAID]
      // for demo
      && this.temp.transactionStatus != transactionStatusMapping[ADMIN_VERIFIED]
    }
  },
  created() {
    this.getList()
  },
  methods: {
    showDialog(){
      this.dialogFormVisible=false;this.dialogTransactionStatusVisible=true
      if(this.isSimulatingPay){
        this.dialogFormVisible=false;this.dialogTransactionStatusVisible=false;this.SimulateingPayShow=true
      }
    },
    getList() {
      this.listLoading = true
      fetchTransactionList().then((response) => {
        this.list = response.data
        this.total = response.data.length
        this.listLoading = false
      })
    },
    getTransactionDetail(id) {
      this.listLoading = true
      fetchTransactionById(id).then((response) => {
        this.temp = Object.assign({}, response.data)
        this.listLoading = false
        if (this.temp.transactionStatus == transactionStatusMapping[PASS_AML_VERIFY]) {
          this.dialogStatus = 'verify'
          this.adminPassAction = 'verifyPass',
          this.adminFailAction = 'verifyFail'
        } else if (this.temp.transactionStatus == transactionStatusMapping[PAID]) {
          this.dialogStatus = 'complete'
          this.adminPassAction = 'completePass',
          this.adminFailAction = 'completeFail'
        } else if( this.temp.transactionStatus == transactionStatusMapping[ADMIN_VERIFIED]){
          // 模擬使用者繳款
          this.isSimulatingPay = true;
        } 
        else {
          this.dialogStatus = ''
        }

        const calculatedFee = this.temp.fee - this.temp.discountAmount < 0 ? 0 : this.temp.fee - this.temp.discountAmount
        this.temp.toAmount = (this.temp.fromAmount - calculatedFee) * this.temp.transactionExchangeRate
        this.transactionStatusTimeLine.find(status => status.value == transactionStatusMapping[ADMIN_VERIFIED]).note = response.data.adminVerifyNote
        this.transactionStatusTimeLine.forEach(status => {
          if (status.value <= this.temp.transactionStatus) {
            status.color = '#0bbd87'
          }else{
            status.color = ''
          }
        })
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    simulatePay(){
      // 模擬使用者付款
          const data = {"recordId":this.verifiedTransactionId,"isComplete":true,"comment":this.adminVerifyNote}
          simulatePaying(data).then((response) => {
        if (response.success) {
          this.$notify({
            title: 'Success',
            message: response.msg,
            type: 'success',
            duration: 2000
          })
        } else {
          this.$notify({
            title: 'Fail',
            message: response.msg,
            type: 'error',
            duration: 2000
          })
        }
        this.dialogFormVisible = false
        this.dialogTransactionStatusVisible = false
        this.SimulateingPayShow = false
        this.getList()
        })
    },
    changeTransactionStatus() {
      if (this.dialogStatus == 'verify') {
        let pass = false;
        if (this.verifyPass) {
          pass = true
          // this.toTransactionStatus = transactionStatusMapping[ADMIN_VERIFIED]
        } else {
          pass = false
          // this.toTransactionStatus = transactionStatusMapping[FALL_VERIFIED]
        }
        const data = {"recordId":this.verifiedTransactionId,"isAmlPass":pass,"comment":this.adminVerifyNote}
        amlReviewById(data).then((response) => {
        if (response.success) {
          this.$notify({
            title: 'Success',
            message: response.msg,
            type: 'success',
            duration: 2000
          })
        } else {
          this.$notify({
            title: 'Fail',
            message: response.msg,
            type: 'error',
            duration: 2000
          })
        }
        this.dialogFormVisible = false
        this.dialogTransactionStatusVisible = false
        this.getList()
        })
      } else if (this.dialogStatus == 'complete') {
        let pass = false;
        if (this.verifyPass) {
          pass = true

        } else {
          pass = false
        }
        const data = {"recordId":this.verifiedTransactionId,"isComplete":pass,"comment":this.adminVerifyNote}
        completeById(data).then((response) => {
        if (response.success) {
          this.$notify({
            title: 'Success',
            message: response.msg,
            type: 'success',
            duration: 2000
          })
        } else {
          this.$notify({
            title: 'Fail',
            message: response.msg,
            type: 'error',
            duration: 2000
          })
        }
        this.dialogFormVisible = false
        this.dialogTransactionStatusVisible = false
        this.getList()
        })
      }else {
        this.$notify({
          title: 'FAIL',
          message: 'Invalid Operation',
          type: 'fail',
          duration: 2000
        })
        this.dialogFormVisible = false
        this.dialogTransactionStatusVisible = false
        this.getList()
        return
      }
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    handleUpdate(row, index) {
      this.verifiedTransactionId = row.id
      this.getTransactionDetail(row.id)
      this.dialogTransactionStatusVisible = false
      this.dialogFormVisible = true
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then((excel) => {
        const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
        const filterVal = [
          'timestamp',
          'title',
          'type',
          'importance',
          'status'
        ]
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.list.map((v) =>
        filterVal.map((j) => {
          if (j === 'timestamp') {
            return parseTime(v[j])
          } else {
            return v[j]
          }
        })
      )
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
