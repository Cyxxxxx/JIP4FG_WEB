
<template>
  <div class="page">
    <div class="content">
      <el-table
        :data="records"
        style="width: 100%"
        :default-sort = "{prop: 'date', order: 'descending'}"
        @row-click = "toJobDetail"
        >
        <el-table-column
          prop="jobName"
          label="岗位名"
          :formatter="formatter"
          sortable>
        </el-table-column>
        <el-table-column
          prop="companyName"
          label="企业名"
          :formatter="formatter"
          sortable>
        </el-table-column>
        <!-- <el-table-column
          prop="jobType"
          label="岗位类别"
          :formatter="formatter"
          sortable>
        </el-table-column> -->
        <el-table-column
          prop="location"
          label="地址"
          :formatter="formatter">
        </el-table-column>
        <el-table-column
          prop="workNatureDesc"
          label="工作性质"
          :formatter="formatter">
        </el-table-column>
        <el-table-column
          prop="salary"
          label="薪资"
          :formatter="formatter">
        </el-table-column>
        <el-table-column
          prop="origin"
          label="消息来源"
          :formatter="formatter">
        </el-table-column>
        <el-table-column
          prop="createDt"
          label="发布时间"
          :formatter="dateFormatter">
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页插件 -->
    <div class="pagination">
      <el-pagination v-show="total>0" :total="total" :page.sync="current" :limit.sync="size"
         @current-change="currentChange"
         @pagination="getData" />
    </div>
  </div>
</template>

<script>
import Pagination from '../../../node_modules/element-ui/lib/pagination.js';

export default {
  name: 'JobInfoPage',
  components: {
    Pagination 
  },
  data() {
    return {
      records: [],
      total: 0,
      size: 10, // 默认显示10条
      current: 1, // 默认显示第一页
      orders: [],
      searchCount: true,
      pages: 0
    };
  },
  
  created() {
    this.getData()
  },

  methods: {
    dateFormatter:function(row,column,val){
      const time = new Date(val);
      const y = time.getFullYear();
      const m = time.getMonth() + 1;
      const d = time.getDate();
      return `${y}-${m < 10 ? '0' + m : m}-${d < 10 ? '0' + d : d}`;
    },
    currentChange(current){
      this.current = current;
      this.getData()
    },
    getData(){
      console.log("调用getData..")
      let that = this;
      let companyName = that.$route.query.companyName;
      let jobName = that.$route.query.jobName;
      let jobType = that.$route.query.jobType;
      let location = that.$route.query.location;
      let workNature = that.$route.query.workNature;
      let salary = that.$route.query.salary;
      let createDt = that.$route.query.createDt;
      console.log(that.jobName)
      var data = {
        companyName: typeof(companyName) == 'undefined' ? '' : companyName,
        jobName: typeof(jobName) == 'undefined' ? '' : jobName,
        jobType: typeof(jobType) == 'undefined' ? '' : jobType,       
        location: typeof(location) == 'undefined' ? '' : location,
        workNature: typeof(workNature) == 'undefined' ? '' : workNature,
        salary: typeof(salary) == 'undefined' ? '' : salary,
        createDt: typeof(createDt) == 'undefined' ? '' : createDt,
      }
      console.log(data)
      console.log(JSON.stringify(data))
      this.$api.job.getData(this.current,this.size,data).then(res=>{
        this.records = res.data.data.records;
        this.total = res.data.data.total;
        this.size = res.data.data.size;
        this.current = res.data.data.current;
        this.orders = res.data.data.orders;
        this.searchCount = res.data.data.searchCount;
        this.pages = res.data.data.pages;
        console.log("total:" + this.total)
      });
    },
    toJobDetail(obj){
      window.open(obj.originUrl)
    }
  }
};
</script>

<style scoped lang="less">
.page{
  overflow: auto;
  justify-content: center;
  margin: auto 0;
  text-align: center; 
}
.content{
  padding: 3%;
  margin: 0 auto;
}
.pagination{
  margin-bottom: 3%;
}
</style>
