<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.title"
        placeholder="Title"
        style="width: 200px"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <!-- <el-select v-model="listQuery.importance" placeholder="Imp" clearable style="width: 90px" class="filter-item">
        <el-option v-for="item in importanceOptions" :key="item" :label="item" :value="item" />
      </el-select> -->
      <!-- <el-select v-model="listQuery.type" placeholder="Type" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name+'('+item.key+')'" :value="item.key" />
      </el-select> -->
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
    <el-dialog title="會員明細" :visible.sync="dialogFormVisible">
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
        <div style="width: 100%; height: 40%"></div>
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
          <span>temp.</span>
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
          <span>{{ new Date(temp.birthday).toLocaleDateString() }}</span>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false"> Cancel </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table
        :data="pvData"
        border
        fit
        highlight-current-row
        style="width: 100%"
      >
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false"
          >Confirm</el-button
        >
      </span>
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
              :key="item"
              :label="item | kycStatusFilter"
              :value="item"
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

    <!-- <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table
        :data="pvData"
        border
        fit
        highlight-current-row
        style="width: 100%"
      >
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false;dialogFormVisible = true;dialogKycStatusVisible=false"
          >Confirm</el-button
        >
      </span>
    </el-dialog> -->
  </div>
</template>

<script>
import { fetchPv, createArticle, updateArticle } from "@/api/article";
import { fetchMemberList, fetchMemberById, updateMemberKycStatus } from "@/api/member";
import waves from "@/directive/waves"; // waves directive
import { parseTime } from "@/utils";
import Pagination from "@/components/Pagination"; // secondary package based on el-pagination

const levelMapping = {
  0: "一般會員",
  1: "VIP",
  9: "高風險會員",
};

const genderMapping = {
  0: "其他",
  1: "男",
  2: "女",
};

const kycStatusOptions = [
  { key: -10, display_name: "停用" },
  { key: -9, display_name: "KYC未通過" },
  { key: -8, display_name: "AML未通過" },
  { key: 0, display_name: "草稿會員" },
  { key: 1, display_name: "待審核" },
  { key: 2, display_name: "ARC驗證成功" },
  { key: 3, display_name: "AML通過" },
  { key: 9, display_name: "正式會員" },
];

const kycStatusKeyValue = kycStatusOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name;
  return acc;
}, {});

export default {
  name: "MemberListTable",
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: "success",
        draft: "info",
        deleted: "danger",
      };
      return statusMap[status];
    },
    kycStatusFilter(type) {
      return kycStatusKeyValue[type];
    },
    levelFilter(type) {
      return levelMapping[type];
    },
    genderFilter(type) {
      return genderMapping[type];
    },
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
        importance: undefined,
        title: undefined,
        type: undefined,
        sort: "+id",
      },
      changTokycStatus: [-10,-9,-8,0,1,2,3,9],
      sortOptions: [
        { label: "ID Ascending", key: "+id" },
        { label: "ID Descending", key: "-id" },
      ],
      statusOptions: ["published", "draft", "deleted"],
      showReviewer: false,
      temp: {
        id: undefined,
        name: "",
        arcNo: "",
        kycStatus: undefined,
        level: undefined,
        gender: undefined,
        country: "",
        birthday: "",
        passportId: "",
        arcIssueDate: "",
        arcExpireDate: "",
        backSequence: "",
        phone: "",
        loginTime: "",
        address: "",
        idImageA: "",
        idImageB: "",
      },
      goingUpdateUserId: undefined,
      dialogFormVisible: false,
      dialogKycStatusVisible: false,
      dialogStatus: "",
      textMap: {
        update: "Edit",
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [
          { required: true, message: "type is required", trigger: "change" },
        ],
        timestamp: [
          {
            type: "date",
            required: true,
            message: "timestamp is required",
            trigger: "change",
          },
        ],
        title: [
          { required: true, message: "title is required", trigger: "blur" },
        ],
      },
      downloadLoading: false,
    };
  },
  computed: {
    imageUrl() {
      return process.env.VUE_APP_ARC_IMAGE_URL+this.goingUpdateUserId
    }
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      this.listLoading = true;
      fetchMemberList().then((response) => {
        this.list = response.data;
        this.total = response.data.length;
        this.listLoading = false;
      });
    },
    getMemberDetail(id) {
      this.listLoading = true;
      fetchMemberById(id).then((response) => {
        this.temp = Object.assign({}, response.data);
        this.listLoading = false;
      });
    },
    handleFilter() {
      this.listQuery.page = 1;
      this.getList();
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: "操作Success",
        type: "success",
      });
      row.status = status;
    },
    sortChange(data) {
      const { prop, order } = data;
      if (prop === "id") {
        this.sortByID(order);
      }
    },
    sortByID(order) {
      if (order === "ascending") {
        this.listQuery.sort = "+id";
      } else {
        this.listQuery.sort = "-id";
      }
      this.handleFilter();
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        importance: 1,
        remark: "",
        timestamp: new Date(),
        title: "",
        status: "published",
        type: "",
      };
    },
    handleCreate() {
      this.resetTemp();
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs["dataForm"].clearValidate();
      });
    },
    createData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          this.temp.id = parseInt(Math.random() * 100) + 1024; // mock a id
          this.temp.author = "vue-element-admin";
          createArticle(this.temp).then(() => {
            this.list.unshift(this.temp);
            this.dialogFormVisible = false;
            this.$notify({
              title: "Success",
              message: "Created Successfully",
              type: "success",
              duration: 2000,
            });
          });
        }
      });
    },
    handleUpdate(row, index) {
      this.goingUpdateUserId = row.id;
      this.getMemberDetail(row.id);
      this.dialogKycStatusVisible = false;
      this.dialogFormVisible = true;
    },
    selectKycStatus(status){
      this.selectedKycStatus = status;
    },
    changeKycStatus() {

      var data = {"kycStatus": this.selectedKycStatus};
      updateMemberKycStatus(this.goingUpdateUserId,data).then((response)=>{

        if(response.success){
          this.$notify({
              title: "Success",
              message: response.msg,
              type: "success",
              duration: 2000,
            });
        }else{
          this.$notify({
              title: "Fail",
              message: response.msg,
              type: "error",
              duration: 2000,
            });
        }
        this.dialogPvVisible = false;
        this.dialogFormVisible = false;
        this.dialogKycStatusVisible=false;
        this.getList();
      })
    },
    updateData() {
      this.$refs["dataForm"].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp);
          tempData.timestamp = +new Date(tempData.timestamp); // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateArticle(tempData).then(() => {
            const index = this.list.findIndex((v) => v.id === this.temp.id);
            this.list.splice(index, 1, this.temp);
            this.dialogFormVisible = false;
            this.$notify({
              title: "Success",
              message: "Update Successfully",
              type: "success",
              duration: 2000,
            });
          });
        }
      });
    },
    handleDelete(row, index) {
      this.$notify({
        title: "Success",
        message: "Delete Successfully",
        type: "success",
        duration: 2000,
      });
      this.list.splice(index, 1);
    },
    handleFetchPv(pv) {
      fetchPv(pv).then((response) => {
        this.pvData = response.data.pvData;
        this.dialogPvVisible = true;
      });
    },
    handleDownload() {
      this.downloadLoading = true;
      import("@/vendor/Export2Excel").then((excel) => {
        const tHeader = ["timestamp", "title", "type", "importance", "status"];
        const filterVal = [
          "timestamp",
          "title",
          "type",
          "importance",
          "status",
        ];
        const data = this.formatJson(filterVal);
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: "table-list",
        });
        this.downloadLoading = false;
      });
    },
    formatJson(filterVal) {
      return this.list.map((v) =>
        filterVal.map((j) => {
          if (j === "timestamp") {
            return parseTime(v[j]);
          } else {
            return v[j];
          }
        })
      );
    },
    getSortClass: function (key) {
      const sort = this.listQuery.sort;
      return sort === `+${key}` ? "ascending" : "descending";
    },
  },
};
</script>
