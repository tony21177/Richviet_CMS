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
          <span>{{ row.name }}</span>
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
      <el-table-column label="交易狀態" width="110px" align="center">
        <template slot-scope="{ row }">
          <el-tag>{{ row.transactionStatus | transactionStatusFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="申請時間" width="110px" align="center">
        <template slot-scope="{ row }">
          <span>{{ new Date(row.formalApplyTime).toLocaleDateString() }}<span /></span></template>
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
            <span>{{ temp.name }}</span>
          </el-form-item>
          <el-form-item label="ARC">
            <span>{{ temp.arcNo }}</span>
          </el-form-item>
          <el-form-item label="交易狀態">
            <span style="margin-right:10px">{{ temp.transactionStatus | transactionStatusFilter }}</span>
            <el-button
              type="primary"
              size="mini"
              v-bind:disabled="waitingAdminVerify"
              @click="dialogFormVisible=false;dialogTransactionStatusVisible=true"
            >
              變更
            </el-button>
          </el-form-item>
          <div style="width: 100%; height: 40%; margin-top:70px" />
          <el-form-item label="交易金額">
            <span>{{ temp.fromAmount }}</span>
          </el-form-item>
          <el-form-item label="手續費">
            <span>{{ temp.fee }}</span>
          </el-form-item>
          <el-form-item label="優惠">
            <span>{{ temp.discountAmount }}</span>
          </el-form-item>
          <el-form-item label="匯率">
            <span>{{ temp.exchangeRate }}</span>
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

    <!-- change member status dialog -->
    <el-dialog title="交易審核" :visible.sync="dialogTransactionStatusVisible">
      <el-form
        label-position="left"
        label-width="150px"
        style="width: 400px; margin-left: 50px"
      >
        <el-form-item label="營運人員審核:">
          <template>
            <el-radio v-model="verifyPass" label="true">審核通過</el-radio>
            <el-radio v-model="verifyPass" label="false">審核失敗</el-radio>
          </template>
        </el-form-item>
        <el-form-item label="備註:">
          <el-input type="textarea" v-model="adminVerifyNote" :rows="3" maxlength="50" placeholder="請輸入審核原因請輸入審核原因"></el-input>
        </el-form-item>
        
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = true;dialogTransactionStatusVisible=false;"> Cancel </el-button>
        <el-button type="primary" @click="changeTransactionStatus()"> Confirm </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { fetchTransactionList, fetchTransactionById,verifyTransactionById } from '@/api/transaction'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const transactionStatusOptions = [{ value: -10, label: '其他錯誤', disabled: true }, { value: -9, label: '審核失敗' }, { value: -8, label: 'AML未通過' }, { value: -7, label: '交易逾期' }, { value: 0, label: '草稿', disabled: true },
  { value: 1, label: '待ARC審核', disabled: true }, { value: 2, label: 'ARC審核成功' }, { value: 3, label: 'AML審核成功' }, { value: 4, label: '營運人員確認完成,待繳費' },
  { value: 5, label: '已繳款完成,待匯款', disabled: true }, { value: 9, label: '交易完成' }]

const transactionStatusKeyValue = transactionStatusOptions.reduce((acc, cur) => {
  acc[cur.value] = cur.label
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
      transactionStatusTimeLine:　transactionStatusOptions.filter(status => status.value >= 0),
      sortOptions: [
        { label: 'ID Ascending', key: '+id' },
        { label: 'ID Descending', key: '-id' }
      ],
      temp: {
        id: undefined,
        userId: undefined,
        name: '',
        arcNo: '',
        fromAmount: '',
        fee: '',
        discountAmount: '',
        exchangeRate: '',
        toAmount: '',
        bank: '',
        payeeAddress: '',
        payeeRelationTypeDescription: '',
        transactionStatus: '',
        formalApplyTime: ''
      },
      dialogFormVisible: false,
      dialogTransactionStatusVisible: false,
      downloadLoading: false,
      verifiedTransactionId:null,
      verifyPass:null,
      adminVerifyNote:''
    }
  },
  computed: {
    imageUrl() {
      return process.env.VUE_APP_ARC_IMAGE_URL + this.goingUpdateUserId
    },
    waitingAdminVerify(){
      console.log("button")
      console.log(this.temp.transactionStatus)
      return this.temp.transactionStatus != 3
    }
  },
  created() {
    this.getList()
  },
  methods: {
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
        this.temp.adminVerifyNote
        this.listLoading = false
        let calculatedFee = this.temp.fee-this.temp.discountAmount<0?0:this.temp.fee-this.temp.discountAmount
        this.temp.toAmount = (this.temp.fromAmount - calculatedFee)*this.temp.exchangeRate;
        this.transactionStatusTimeLine.find(status => status.value == 4).note = response.data.adminVerifyNote
        this.transactionStatusTimeLine.forEach(status => {
          if (status.value <= this.temp.transactionStatus) {
            status.color = '#0bbd87'
          }
        })
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    changeTransactionStatus() {
      let data = {"adminVerifyNote":this.adminVerifyNote,"verifyPass":this.verifyPass}
      verifyTransactionById(this.verifiedTransactionId,data).then((response) => {
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
    changeKycStatus() {
      var data = { 'kycStatus': this.selectedKycStatus }
      updateMemberKycStatus(this.goingUpdateUserId, data).then((response) => {
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
        this.dialogPvVisible = false
        this.dialogFormVisible = false
        this.dialogTransactionStatusVisible = false
        this.getList()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateArticle(tempData).then(() => {
            const index = this.list.findIndex((v) => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Update Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row, index) {
      this.$notify({
        title: 'Success',
        message: 'Delete Successfully',
        type: 'success',
        duration: 2000
      })
      this.list.splice(index, 1)
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
