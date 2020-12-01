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
          <span>{{ new Date(row.formalApplyTime).toLocaleDateString() }}<span>
        </template>
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
    <el-dialog title="會員明細" :visible.sync="dialogFormVisible" width="60%">
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
          <el-form-item label="會員狀態">
            <span>{{ temp.kycStatus | kycStatusFilter }}</span>
            <el-button
              type="primary"
              size="mini"
              @click="dialogFormVisible=false;dialogKycStatusVisible=true"
            >
              變更
            </el-button>
          </el-form-item>
          <el-form-item label="會員等級">
            <span>{{ temp.level | levelFilter }}</span>
          </el-form-item>
          <div style="width: 100%; height: 40%; margin-top:70px" />
          <el-form-item label="基本資料">
            <el-button type="primary" size="mini"> 編輯 </el-button>
          </el-form-item>
          <el-form-item label="性別:">
            <span>{{ temp.gender | genderFilter }}</span>
          </el-form-item>
          <el-form-item label="國籍:">
            <span>{{ temp.country }}</span>
          </el-form-item>
          <el-form-item label="生日:">
            <span>{{ new Date(temp.birthday).toLocaleDateString() }}</span>
          </el-form-item>
          <el-form-item label="護照號碼:">
            <span>{{ temp.passportId }}</span>
          </el-form-item>
          <el-form-item label="核發日期:">
            <span>{{ new Date(temp.arcIssueDate).toLocaleDateString() }}</span>
          </el-form-item>
          <el-form-item label="居留期限:">
            <span>{{ new Date(temp.arcExpireDate).toLocaleDateString() }}</span>
          </el-form-item>
          <el-form-item label="背面序號:">
            <span>{{ temp.backSequence }}</span>
          </el-form-item>
          <el-form-item label="電話:">
            <span>{{ temp.phone }}</span>
          </el-form-item>
          <el-form-item label="最後上線時間:">
            <span>{{ temp.loginTime }}</span>
          </el-form-item>
          <el-form-item label="最近上線地點:">
            <span></span>
          </el-form-item>
        </div>
        <div class="right" style="float:left">
          <el-form-item label="證件正面照:">
            <img :src="imageUrl+'/2'" width="200" height="200">
          </el-form-item>
          <el-form-item label="證件反面照:">
            <img :src="imageUrl+'/3'" width="200" height="200">
          </el-form-item>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer" style="clear:both;">
        <el-button @click="dialogFormVisible = false"> Cancel </el-button>
      </div>
    </el-dialog>

    <!-- change member status dialog -->
    <el-dialog title="變更會員狀態" :visible.sync="dialogKycStatusVisible">
      <el-form
        ref="dataForm"
        :model="temp"
        label-position="left"
        label-width="150px"
        style="width: 600px; margin-left: 50px"
      >
        <el-form-item label="姓名">
          <span>{{ temp.name }}</span>
        </el-form-item>
        <el-form-item label="ARC">
          <span>{{ temp.arcNo }}</span>
        </el-form-item>
        <el-form-item label="核發日期:">
          <span>{{ new Date(temp.arcIssueDate).toLocaleDateString() }}</span>
        </el-form-item>
        <el-form-item label="居留期限:">
          <span>{{ new Date(temp.arcExpireDate).toLocaleDateString() }}</span>
        </el-form-item>
        <el-form-item label="背面序號:">
          <span>{{ temp.backSequence }}</span>
        </el-form-item>
        <el-form-item label="生日:">
          <span>{{ new Date(temp.birthday).toLocaleDateString() }}</span>
        </el-form-item>
        <el-form-item label="證件正面照:">
          <img :src="imageUrl+'/2'" width="200" height="200">
        </el-form-item>
        <el-form-item label="證件反面照:">
          <img :src="imageUrl+'/3'" width="200" height="200">
        </el-form-item>
        <el-form-item label="會員狀態">
          <el-select
            v-model="temp.kycStatus"
            style="width: 150px"
            class="filter-item"
            @change="selectKycStatus"
          >
            <el-option
              v-for="item in changTokycStatus"
              :key="item.value"
              :label="item.label"
              :value="item.value"
              :disabled="item.disabled"
            />
          </el-select>

        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogPvVisible = false;dialogFormVisible = true;dialogKycStatusVisible=false;"> Cancel </el-button>
        <el-button type="primary" @click="changeKycStatus()">
          Confirm
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { fetchTransactionList } from '@/api/transaction'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination


const transactionStatusOptions = [{value:-10,label:'其他錯誤',disabled: true},{value:-9,label:'審核失敗'}, {value:-8,label:'AML未通過'},{value:-7,label:'交易逾期'}, {value:0,label:'草稿',disabled: true},
      {value:1,label:'待ARC審核',disabled: true}, {value:2,label:'ARC審核成功'}, {value:3,label:'AML審核成功'}, {value:4,label:'營運人員確認完成,待繳費'},
       {value:5,label:'已繳款完成,待匯款',disabled: true}, {value:9,label:'交易完成'}]

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
        bank:'',
        payeeAddress: '',
        payeeRelationTypeDescription: '',
        transactionStatus: '',
        formalApplyTime: ''
      },
      dialogFormVisible: false,
      dialogKycStatusVisible: false,
      downloadLoading: false
    }
  },
  computed: {
    imageUrl() {
      return process.env.VUE_APP_ARC_IMAGE_URL + this.goingUpdateUserId
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
    getMemberDetail(id) {
      this.listLoading = true
      fetchMemberById(id).then((response) => {
        this.temp = Object.assign({}, response.data)
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作Success',
        type: 'success'
      })
      row.status = status
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
      this.goingUpdateUserId = row.id
      this.getMemberDetail(row.id)
      this.dialogKycStatusVisible = false
      this.dialogFormVisible = true
    },
    selectKycStatus(status) {
      this.selectedKycStatus = status
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
        this.dialogKycStatusVisible = false
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
