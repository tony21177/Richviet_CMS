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
      <el-table-column label="註冊時間" width="150px" align="center">
        <template slot-scope="{ row }">
          <span>{{ new Date(row.registerTime).toLocaleDateString() }}</span>
        </template>
      </el-table-column>
      <el-table-column label="ArcNo" min-width="150px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.arcNo }}</span>
        </template>
      </el-table-column>
      <el-table-column label="姓名" width="110px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="狀態" width="110px" align="center">
        <template slot-scope="{ row }">
          <!-- <span>{{ row.kycStatus }}</span> -->
          <el-tag>{{ row.kycStatus | kycStatusFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="等級" width="110px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.level | levelFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="Actions"
        align="center"
        width="400"
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
          <el-button
            type="primary"
            size="mini"
            @click="handleDelete(row, $index)"
          >
            刪除(開發用)
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
            <span style="margin-right:10px">{{ temp.kycStatus | kycStatusFilter }}</span>
            <el-button
              type="primary"
              size="mini"
              @click="dialogFormVisible=false;dialogKycStatusVisible=true;editDialogFormVisible=false"
            >
              變更
            </el-button>
          </el-form-item>
          <el-form-item label="會員等級">
            <span>{{ temp.level | levelFilter }}</span>
          </el-form-item>
          <div style="width: 100%; height: 40%; margin-top:70px" />
          <el-form-item label="基本資料" label-width="100px">
            <el-button type="primary" size="mini" @click="dialogFormVisible=false;dialogKycStatusVisible=false;editDialogFormVisible=true"> 編輯 </el-button>
          </el-form-item>
          <el-form-item label="性別:">
            <span>{{ temp.gender | genderFilter }}</span>
          </el-form-item>
          <el-form-item label="國籍:">
            <span>{{ temp.country | nationalityFilter }}</span>
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
            <span>{{ new Date(temp.loginTime*1000).toLocaleDateString() +' '+ new Date(temp.loginTime*1000).toLocaleTimeString() }}</span>
          </el-form-item>
          <el-form-item label="最近上線地點:">
            <span />
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

    <!-- edit member dialog -->
    <el-dialog title="會員編輯" :visible.sync="editDialogFormVisible" width="70%">
      <el-form
        ref="editForm"
        :model="temp"
        label-position="left"
        label-width="150px"
        style="width: 40%; margin-left: 50px"
      >
        <div class="left">
          <el-form-item label="姓名">
            <el-input v-model="temp.name" />
          </el-form-item>
          <el-form-item label="ARC">
            <el-input v-model="temp.arcNo" />
          </el-form-item>
          <el-form-item label="性別:">
            <!-- <span>{{ temp.gender | genderFilter }}</span> -->
            <el-select v-model="temp.gender">
              <el-option
                v-for="item in genderOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="國籍:">
            <!-- <span>{{ temp.country }}</span> -->
            <el-select v-model="temp.country">
              <el-option
                v-for="item in nationalityOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="生日:">
            <el-date-picker
              v-model="temp.birthday"
              type="date"
              placeholder="Pick a day"
            />
          </el-form-item>
          <el-form-item label="護照號碼:">
            <el-input v-model="temp.passportId" />
          </el-form-item>
          <el-form-item label="核發日期:">
            <el-date-picker
              v-model="temp.arcIssueDate"
              type="date"
              placeholder="Pick a day"
            />
          </el-form-item>
          <el-form-item label="居留期限:">
            <el-date-picker
              v-model="temp.arcExpireDate"
              type="date"
              placeholder="Pick a day"
            />
          </el-form-item>
          <el-form-item label="背面序號:">
            <el-input v-model="temp.backSequence" />
          </el-form-item>
          <el-form-item label="電話:">
            <el-input v-model="temp.phone" />
          </el-form-item>
          <el-form-item label="居留證:">
            <img :src="imageUrl+'/2'" width="200" height="200">
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
          <el-form-item label="會員等級">
            <!-- <span>{{ temp.level | levelFilter }}</span> -->
            <el-select v-model="temp.level">
              <el-option
                v-for="item in levelOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible=true;dialogKycStatusVisible=false;editDialogFormVisible=false"> 取消 </el-button>
        <el-button type="primary" @click="updateMember()">
          確定變更
        </el-button>
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
        <el-button @click="dialogFormVisible=true;dialogKycStatusVisible=false;editDialogFormVisible=false"> Cancel </el-button>
        <el-button type="primary" @click="changeKycStatus()">
          Confirm
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { fetchMemberList, fetchMemberById, updateMemberKycStatus, updateMember, deleteMember } from '@/api/member'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const levelOptions = [{ value: 0, label: '一般會員' }, { value: 1, label: 'VIP' }, { value: 9, label: '高風險會員' }]
const genderOptions = [{ value: 0, label: '其他' }, { value: 1, label: '男' }, { value: 2, label: '女' }]

const nationalityOptions =
[{ value: 'VN', label: '越南' }, { value: 'TW', label: '台灣' }]

const kycStatusOptions = [{ value: -10, label: '停用' }, { value: -9, label: 'KYC未通過' }, { value: -8, label: 'AML未通過' }, { value: 0, label: '草稿會員', disabled: true },
  { value: 1, label: '待審核', disabled: true }, { value: 2, label: 'ARC驗證成功' }, { value: 3, label: 'AML通過' }, { value: 9, label: '正式會員' }]

const kycStatusKeyValue = kycStatusOptions.reduce((acc, cur) => {
  acc[cur.value] = cur.label
  return acc
}, {})

const genderMapping = genderOptions.reduce((acc, cur) => {
  acc[cur.value] = cur.label
  return acc
}, {})

const levelMapping = levelOptions.reduce((acc, cur) => {
  acc[cur.value] = cur.label
  return acc
}, {})

const nationalityMapping = nationalityOptions.reduce((acc, cur) => {
  acc[cur.value] = cur.label
  return acc
}, {})

export default {
  name: 'MemberListTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    kycStatusFilter(type) {
      return kycStatusKeyValue[type]
    },
    levelFilter(type) {
      return levelMapping[type]
    },
    genderFilter(type) {
      return genderMapping[type]
    },
    nationalityFilter(type) {
      return nationalityMapping[type]
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
      changTokycStatus: kycStatusOptions,
      sortOptions: [
        { label: 'ID Ascending', key: '+id' },
        { label: 'ID Descending', key: '-id' }
      ],
      genderOptions: genderOptions,
      nationalityOptions: nationalityOptions,
      levelOptions: levelOptions,
      temp: {
        id: undefined,
        name: '',
        arcNo: '',
        kycStatus: undefined,
        level: undefined,
        gender: undefined,
        country: '',
        birthday: '',
        passportId: '',
        arcIssueDate: '',
        arcExpireDate: '',
        backSequence: '',
        phone: '',
        loginTime: '',
        address: '',
        idImageA: '',
        idImageB: ''
      },
      goingUpdateUserId: undefined,
      dialogFormVisible: false,
      editDialogFormVisible: false,
      dialogKycStatusVisible: false,
      dialogPvVisible: false,
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
      fetchMemberList().then((response) => {
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
      this.editDialogFormVisible = false
    },
    handleDelete(row, index) {
      const userId = row.id
      deleteMember(userId).then((response) => {
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
        this.editDialogFormVisible = false
        this.dialogFormVisible = false
        this.dialogKycStatusVisible = false
        this.getList()
      })
    },
    selectKycStatus(status) {
      this.selectedKycStatus = status
    },
    updateMember() {
      const birthday = new Date(this.temp.birthday)
      this.temp.birthday = birthday.getFullYear() + '/' + (birthday.getMonth() + 1) + '/' + birthday.getDate()
      const arcIssueDate = new Date(this.temp.arcIssueDate)
      this.temp.arcIssueDate = arcIssueDate.getFullYear() + '/' + (arcIssueDate.getMonth() + 1) + '/' + arcIssueDate.getDate()
      const arcExpireDate = new Date(this.temp.arcExpireDate)
      this.temp.arcExpireDate = arcExpireDate.getFullYear() + '/' + (arcExpireDate.getMonth() + 1) + '/' + arcExpireDate.getDate()
      this.temp.arcName = this.temp.name
      updateMember(this.temp).then((response) => {
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
        this.editDialogFormVisible = false
        this.dialogFormVisible = false
        this.dialogKycStatusVisible = false
        this.getList()
      })
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
        this.editDialogFormVisible = false
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
