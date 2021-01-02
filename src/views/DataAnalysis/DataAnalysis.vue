
<template>
  <div class="container">
    <div class="content" v-if="showData">
      <el-card>
        <div class="selector">
          <el-select v-model="value" placeholder="请选择" style="width:100%" @change="select">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
              >
            </el-option>
          </el-select>
        </div>
        <el-collapse v-model="activeNames" @change="handleChange">
          <el-collapse-item
            v-for="(title, index) in titleList"
            :key="title"
            :name="index"
          >
            <template slot="title">
              <span class="title">{{ title }}</span>
            </template>
            <div class="Echarts">
              <div :id="title" style="width: 700px;height:600px;"></div>
            </div>            
          </el-collapse-item>
        </el-collapse>
        
        <!-- 不适用于统一生成数据的图标及数据 -->
        <el-collapse v-model="activeNames" @change="getSalaryPred">
          <el-collapse-item v-if="value==='jobAnalysis'">
            <template slot="title">
              <span class="title">后三年部分岗位薪资预测</span>
            </template>
            <div class="selector">
              <el-select v-model="jobNamePredValue" placeholder="请选择" style="width:100%" @change="getSalaryPred">
                <el-option
                  v-for="item in jobNamePredList"
                  :key="item"
                  :label="item"
                  :value="item"
                  >
                </el-option>
              </el-select>
            </div>
            <div class="Echarts">
              <div id="jobSalaryPred" style="width: 100%;height:550px;"></div>
            </div> 
          </el-collapse-item>
        </el-collapse>
        
        <div class="otherData" v-if="value==='companyAnalysis' && options[0].companyCount!=-1">
          企业总数：{{options[0].companyCount}}
        </div>
        <div v-if="value==='jobAnalysis'">
          <div class="otherData" v-if="options[1].jobCount!=-1">
            岗位总数：{{options[1].jobCount}}
          </div>
          <div class="otherData" v-if="options[1].sameLocationCompanyJobCount!=-1">
            岗位工作地点与企业所在位置相同（单位：市）的岗位总数：{{options[1].sameLocationCompanyJobCount}}
          </div>
        </div>

      </el-card>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DataAnalysis',
  components: {},
  data() {
    return {
      activeNames: [-1],
      initedEcharts: [],
      value: 'companyAnalysis',
      options:[
        {
          value: 'companyAnalysis',
          label: '企业数据分析',
          titleList: ['拥有2家及以上分公司的企业统计','热门行业排行（根据行业中企业数量）','城市 - 企业数量'], 
          companyCount: -1
        },
        {
          value: 'jobAnalysis',
          label: '岗位数据分析',
          titleList: [
            '发布了2个及以上岗位的企业（限前100）',
            '热门需求岗位top10（按发布数量）',
            '岗位数量前3的城市',
            '热门薪资水平top5（按岗位数量）',
            '每月发布的岗位数量及其比例',
          ],
          jobCount: -1,
          sameLocationCompanyJobCount: -1
        }
      ],
      numValue: -1,
      titleList: [],
      data: {},
      showData: false,
      jobNamePredValue: '',
      jobNamePredList: [],
      jobSalaryPredShow: false,
    }
  },
  computed: {},
  watch: {},
  mounted() {
    this.init(0);
    this.getData().then(res => {
      this.showData = true
      console.log(this.showData)
      this.options[0].companyCount = this.data.companyAnalyzedData.companyCount;
      this.options[1].jobCount = this.data.jobAnalyzedData.jobCount;
      this.options[1].sameLocationCompanyJobCount = this.data.jobAnalyzedData.sameLocationCompanyJobCount;
      this.jobNamePredList = this.data.jobAnalyzedData.jobNamePredList
      this.jobNamePredValue = this.data.jobAnalyzedData.jobNamePredList[0]
    })
  },
  methods: {
    init(idx){
      let option = this.options[idx]
      this.value = option.value;
      this.titleList = option.titleList;
    },
    handleChange(val) {
      let idx = val[val.length-1];
      if(typeof(idx)==='undefined' || idx === -1) return;
      let initedEcharts = this.initedEcharts;
      // 若加载过的图表中包含这个索引
      if (initedEcharts.indexOf(idx) != -1) {
        return;
      }
      this.initedEcharts.push(idx)
      this.echartInit(this.titleList[idx]);
    },
    getSalaryPred(){
      let jobName = this.jobNamePredValue
      let echarts = require('echarts');
      this.$api.dataAnalysis.getJobSalaryPredList(jobName).then(res => {
        var chart = echarts.init(document.getElementById("jobSalaryPred"));
        console.log(res.data.data)
        var params = res.data.data
        chart.setOption(this.stackAreaChartTemp(params));
        this.jobSalaryPredShow = true
      })
    },
    select(val) {
      console.log(val);
      let idx = this.valueIdxConvert(val);
      this.init(idx);
      // 清空状态
      this.activeNames = [-1]
      this.initedEcharts = []
    },
    getData(){
      return new Promise((resolve, reject) => {
        this.$api.dataAnalysis.getData().then(res => {
          console.log(res.data.data)
          this.data = res.data.data;
          resolve(res.data.msg)
        }).catch(err =>{
          reject(err)
        })
      })
    },
    echartInit(title){
      let echarts = require('echarts');
      var chart = echarts.init(document.getElementById(title));
      let option;
      switch(this.valueIdxConvert(this.value)){
        case 0: option = this.companyOptionSet(title);break;
        case 1: option = this.jobOptionSet(title);break;
        default: return;
      }
      if (typeof(option) === 'object') {
        chart.setOption(option);
      } else {
        this.numValue = option
      }
    },
    // echarts - 企业数据分析
    companyOptionSet(title) {
      var data = this.data.companyAnalyzedData
      let option = {}
      switch(title){
        case '拥有2家及以上分公司的企业统计': {
          let branchCompanyCountRankList = data.branchCompanyCountRankList
          let opData = JSON.parse(JSON.stringify(branchCompanyCountRankList).replace(/companyName/g,"name").replace(/count/g,"value"));
          console.log(opData)
          option = this.pieTemplate(opData)
          break;
        }
        case '热门行业排行（根据行业中企业数量）': {
          let industryRankList = data.industryRankList;
          let industryTypeList = []
          let countList = []
          for(let i=0;i<industryRankList.length;++i){
            industryTypeList.push(industryRankList[i].industryType);
            countList.push(industryRankList[i].count);
          }
          option = this.barTemplate(industryTypeList,countList,"企业个数")
          break;
        }
        case '城市 - 企业数量': {
          let cityCompanyCountList = data.cityCompanyCountList;
          let opData = JSON.parse(JSON.stringify(cityCompanyCountList).replace(/city/g,"name").replace(/comCount/g,"value"));
          console.log(opData)
          option = this.pieTemplate(opData)
          break;
        }
        default: return;
      }      
      return option;
    },
    // echarts - 岗位数据分析
    jobOptionSet(title) {
      var data = this.data.jobAnalyzedData
      let option = {}
      switch(title){
        case '发布了2个及以上岗位的企业（限前100）': {
          let doubleMoreJobCompanyRankList = data.doubleMoreJobCompanyRankList;
          let opData = JSON.parse(JSON.stringify(doubleMoreJobCompanyRankList).replace(/companyName/g,"name").replace(/jobCount/g,"value"));
          console.log(opData)
          option = this.pieTemplate(opData)
          break;
        }
        case '热门需求岗位top10（按发布数量）': {
          let hotJobTop10 = data.hotJobTop10;
          let jobNameList = []
          let countList = []
          for(let i=0;i<hotJobTop10.length;++i){
            jobNameList.push(hotJobTop10[i].jobName);
            countList.push(hotJobTop10[i].count);
          }
          option = this.barTemplate(jobNameList,countList,"发布数量")
          break;
        }
        case '岗位数量前3的城市': {
          let cityJobCountTop3 = data.cityJobCountTop3;
          let cityList = []
          let countList = []
          for(let i=0;i<cityJobCountTop3.length;++i){
            cityList.push(cityJobCountTop3[i].location);
            countList.push(cityJobCountTop3[i].count);
          }
          option = this.barTemplate(cityList,countList,"岗位数量")
          break;
        }
        case '热门薪资水平top5（按岗位数量）': {
          let salaryTop5 = data.salaryTop5;
          let salaryList = []
          let countList = []
          for(let i=0;i<salaryTop5.length;++i){
            salaryList.push(salaryTop5[i].salary);
            countList.push(salaryTop5[i].count);
          }
          option = this.barTemplate(salaryList,countList,"岗位数量")
          break;
        }
        case '每月发布的岗位数量及其比例': {
          let releaseJobByMonthList = data.releaseJobByMonthList;
          let opData = JSON.parse(JSON.stringify(releaseJobByMonthList).replace(/monthId/g,"name").replace(/count/g,"value"));
          option = this.pieTemplate(opData)
          break;
        }
        case '岗位工作地点与企业所在位置相同（单位：市）的岗位统计': {
          let sameLocationCompanyJobCount = data.sameLocationCompanyJobCount;
          return sameLocationCompanyJobCount;
        }
        default: return;
      }
      console.log(option)
      return option;
    },
    // 值 - 索引 转换
    valueIdxConvert(val) {
      switch(val){
        case 'companyAnalysis': return 0;
        case 'jobAnalysis': return 1;
      }
    },
    // 饼图模板
    pieTemplate(data){
      let option = {
        toolbox: {
            feature: {
                saveAsImage: {}
            }
        },
        series : [
            {
                type: 'pie',    // 设置图表类型为饼图
                radius: '55%',  // 饼图的半径，外半径为可视区尺寸（容器高宽中较小一项）的 55% 长度。
                data: data,
                label: {
                    normal: {
                        formatter: '{b}:{c}' + '\n\r' + '({d}%)',
                        show: true,
                        position: 'left'
                    },
                    emphasis: {
                        show: true,
                        textStyle: {
                            fontSize: '15',
                            fontWeight: 'bold'
                        }
                    }
                },
            }
        ]
      }
      return option;
    },
    barTemplate(xAxisData,seriesData,theme) {
      let option = {    
        grid: {
          y2: 140
        },
        toolbox: {
            feature: {
                saveAsImage: {}
            }
        },
        tooltip: {},
        legend: {
          data:[theme]
        },
        xAxis: {
          data: xAxisData,
          axisLabel:{
              interval:0,//横轴信息全部显示
              rotate:-30,//-30度角倾斜显示
          },
        },
        yAxis: {},
        series: [{
          name: theme,
          type: 'bar',
          data: seriesData
        }]
      }
      return option;
    },
    stackAreaChartTemp(params){
      let option = {
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: ["薪资上限","薪资下限"]
        },
        toolbox: {
            show: true,
            feature: {
                saveAsImage: {}
            }
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: params.xAxisData
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: '{value} k'
            }
        },
        series: [
            {
                name: '薪资下限',
                type: 'line',
                label: {
                    normal: {
                        show: true,
                        position: 'top'
                    },
                },
                data: params.minSalaryEachYear
            },
            {
                name: '薪资上限',
                type: 'line',
                label: {
                    normal: {
                        show: true,
                        position: 'top'
                    },
                },
                data: params.maxSalaryEachYear
            },
        ]
      };
      return option;
    }
  },


};
</script>

<style scoped lang="less">
.container {
  min-height: calc(~"100vh - 60px");
  max-height:calc(~"100vh - 60px");
  width: calc(~"100vw - 65px");
  overflow: auto;
  .content{
    width: 50%;
    margin: 20px auto;
    .selector {
      left: 50%;
      text-align: center;
      padding-bottom: 10px;
    }
    .title {
      text-align: center;
      font-size: 22px;
      font-weight: 400;
      color: #1f2d3d;
    }
    .chart {
      text-align: center;
    }
    .otherData {
      padding-top: 15px;
      padding-bottom: 15px;
    }
  }
}
</style>
