
<template>
  <div class="page">
    <div class="content">
      <el-table
        :data="records"
        style="width: 100%"
        :default-sort = "{prop: 'date', order: 'descending'}"
        >
        <el-table-column
          prop="companyName"
          label="企业名"
          :formatter="formatter"
          sortable>
        </el-table-column>
        <el-table-column
          prop="industryType"
          label="行业"
          :formatter="formatter"
          sortable>
        </el-table-column>
        <el-table-column
          prop="location"
          label="地址"
          :formatter="formatter">
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
  name: 'CompanyInfoPage',
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
    currentChange(current){
      this.current = current;
      this.getData()
    },
    getData(){
      console.log("调用getData..")
      let companyName = this.$route.query.companyName;
      let industryType = this.$route.query.industryType;
      let location = this.$route.query.location;
      console.log(companyName)
      var data = {
        companyName: typeof(companyName) == 'undefined' ? '' : companyName,
        industryType: typeof(industryType) == 'undefined' ? '' : industryType,
        location: typeof(location) == 'undefined' ? '' : location,
      }
      console.log(data)
      console.log(JSON.stringify(data))
      this.$api.company.getData(this.current,this.size,data).then(res=>{
        this.records = res.data.data.records;
        this.total = res.data.data.total;
        this.size = res.data.data.size;
        this.current = res.data.data.current;
        this.orders = res.data.data.orders;
        this.searchCount = res.data.data.searchCount;
        this.pages = res.data.data.pages;
        console.log("total:" + this.total)
      });
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
</style>
