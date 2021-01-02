
<template>
  <div class="HeaderBar">
    <el-row
      align="middle"
      justify="space-around"
      style="width:100%;"
      type="flex"
    >
      <!-- 标题栏图标 -->
      <el-col>
        <a href="/">
          <img
            alt
            src="@/assets/images/icon.svg"
          >
        </a>
      </el-col>

      <!-- 标题栏搜索 -->
      <el-col>
        <el-input
          v-model="params.keyword"
          :debounce="300"
          :fetch-suggestions="querySearch"
          :maxlength="30"
          class="input-with-select"
          :placeholder="$t('search')"
          @keyup.enter.native="handleSearch"
          @select="handleSelect"
        >
          <el-select
            slot="prepend"
            v-model="params.searchType"
            @change="handleSelect"
          >
            <el-option
              v-for="item of typeList"
              :key="item.value"
              :label="item.name"
              :value="item.value"
            />
          </el-select>
        </el-input>
        <el-popover
          placement="bottom"
          style="margin-left:10px"
          trigger="hover"
        >
          <i
            slot="reference"
            class="el-icon-s-flag"
            style="color:#409EFF"
          />
          <ImgTags
            v-if="hotTags.length"
            :tagslist="hotTags"
            @on-click="handleClickTag"
          />
        </el-popover>
      </el-col>

      <!-- 语言设置 -->
      <!-- <el-select
        :value="$i18n.locale"
        @change="changeLocaleLang"
      >
        <el-option
          v-for="(lang, i) in langs"
          :key="`Lang${i}`"
          :value="lang"
        >
          {{
            lang
          }}
        </el-option>
      </el-select> -->


      <el-col class="header-info">
        <!-- <el-badge :value="3">
          <el-button size="small">消息</el-button>
        </el-badge>-->
        <div style="margin-left:20px;">
          <el-dropdown
            v-if="token"
            trigger="click"
            @command="clickMenu"
          >
            <span
              class="button-text"
            >{{ username }}</span>
            <!-- <el-avatar
              :src="user? `${staticUrl}${user.id}.jpg?t=${new Date().getTime()}`: ''"
              fit="cover"
              shape="square"
            /> -->
            <el-dropdown-menu slot="dropdown">
              <template>
                <el-dropdown-item
                  v-for="item of MenuList"
                  :key="item.handler"
                  :command="item.handler"
                  :divided="item.divided"
                >
                  {{ item.name }}
                </el-dropdown-item>
              </template>
            </el-dropdown-menu>
          </el-dropdown>
          <div
            v-else
          >
            <span
              class="button-text"
              @click="login"
            >{{ $t('login') }}</span>
            <span
              class="button-text"
              @click="signUp"
            >{{ $t('signUp') }}</span>
          </div>
        </div>
      </el-col>
    </el-row>
    <SetDialog
      v-if="settingVisible"
      :setting-visible.sync="settingVisible"
      :user="user"
    />
  </div>
</template>

<script>
import cookie from 'js-cookie';
import { mapGetters } from 'vuex';
import SetDialog from './Setting/index';
import ImgTags from './ImgTags';
export default {
  name: 'HeaderBar',
  components: {
    SetDialog,
    ImgTags
  },
  data() {
    return {
      staticUrl:process.env.VUE_APP_STATIC_API,
      langs: ['zh', 'en'],
      // 设置控制显示
      settingVisible: false,
      // 搜索时延
      timeout: null,
      params: {
        keyword: '',
        searchType: 'company'
      },
      keywords: [],
      squareUrl:
        'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
      // 热门搜索模块
      hotTags: [],
      token: '',
      username: ''
    };
  },
  computed: {
    // 辅助函数取出x内用户信息
    MenuList() {
      return [
        {
          name: this.$t('logout'), // 退出登录
          handler: 'logout',
        }
      ];
    },
    typeList() {
      return [
        {
          name: this.$t('company'),
          value: 'company'
        },
        {
          name: this.$t('job'),
          value: 'job'
        }
      ];
    }
  },
  watch: {
    // 'params.keyword': {
    //   handler: 'getKeywords'
    // }
  },
  mounted() {
    this.params.searchType = this.$route.query.searchType || 'company';
    this.params.keyword = this.$route.query.tag;
    // this.getHotTag();
    this.$data.token = cookie.get('token');
    this.$data.username = cookie.get('username');
  },
  methods: {
    changeLocaleLang(val) {
      this.$i18n.locale = val;
      cookie.set('lang', val, {
        expires: 365
      });
    },
    // 点击 用户模块
    clickMenu(type) {
      switch (type) {
        case 'followed':
          this.toFollowed();
          break;
        case 'bookmarked':
          this.toBookmarked();
          break;
        case 'setting':
          this.setModal();
          break;
        case 'mycollect':
          this.toMycollect();
          break;
        case 'logout':
          this.logout();
          break;
        case 'spotLight':
          this.toSpotLight();
          break;
        default:
          break;
      }
    },
    // 获取标签数据
    getHotTag() {
      this.$api.search.getHotTag().then(res => {
        this.hotTags = res.data.data.splice(0, 9);
      });
    },
    // 跳转关注页
    toFollowed() {
      this.$router.push({
        path: '/users/followed',
        query: {
          userId: this.user.id
        }
      });
    },
    toMycollect() {
      this.$router.push({
        path: '/collect/mycollection',
        query: {
          userId: this.user.id
        }
      });
    },
    // 跳转书签页
    toBookmarked() {
      this.$router.push({
        path: '/users/bookmarked'
      });
    },
    toSpotLight() {
      this.$router.push({
        path: '/spot-light/index'
      });
    },
    // 设置弹窗
    setModal() {
      this.settingVisible = !this.settingVisible;
    },
    // 退出登录
    logout() {
      this.$confirm(this.$t('user.logoutMessage'))
        .then(_ => {
          let token = cookie.get('token')
          if(token){
            this.$api.user.logout(token).then(res => {
              if(res.status === 200){
                this.$message.info("登出成功")
              } else {
                this.$message.error(res.data.msg)
              }
            })
          }            
          cookie.remove('token');
          this.$store.dispatch('clearCurrentState');
          window.location.href = '/';          
        })
        .catch(err => {
          console.error(err)
        });
    },
    // 获取关键词
    getKeywords() {
      this.$api.search
        .getKeyword(this.params.keyword)
        .then(({ data: { data }}) => {
          if (data && data.keywordList) {
            this.keywords = data.keywordList || [];
          }
        });
    },
    // 搜索相关信息
    // querySearch(queryString, cb) {
    //   const result = this.keywords.map(e => {
    //     return { value: e };
    //   });
    //   clearTimeout(this.timeout);
    //   this.timeout = setTimeout(() => {
    //     cb(result);
    //   }, 1000);
    // },
    // 选择
    handleSelect(e) {
      this.handleSearch();
    },
    // 搜索跳转
    handleSearch() {
      const keyword = this.params.keyword;
      const searchType = this.params.searchType
      if (typeof(keyword) == "undefined"){
        keyword = '';
      }
      switch (searchType) {
        case 'company': {
          this.$router.push({
            path: `/company/infoPage?companyName=` + keyword,
          });
          break;
        }
        case 'job': {
          this.$router.push({
            path: `/job/infoPage?jobName=` + keyword,
          });
          break;
        }
        default: break;
      }
    },
    // 点击tag
    handleClickTag(d) {
      this.$router.push({
        path: `/keywords`,
        query: {
          tag: d.name,
          searchType: this.params.searchType
        }
      });
    },
    // 用户系统
    // 注册
    signUp() {
      if (!cookie.get('token')) {
        this.$store.dispatch('setLoginBoolean', false);
      }
    },
    // 登录
    login() {
      if (!cookie.get('token')) {
        this.$store.dispatch('setLoginBoolean');
      }
    }
  }
};
</script>

<style scoped lang="less">
.HeaderBar {
  background-color: #fff;
  height: 100%;
  width: 100%;
  display: flex;
  overflow: hidden;
  /deep/.el-select .el-input {
    width: 80px;
  }
  /deep/.input-with-select {
    width: 25vw;
    background-color: #fff;
  }

  .input-with-select:hover {
    background-color: rgba(0, 0, 0, 0.08);
  }
  .header-info {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
}
.user-tools {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
  margin-bottom: 20px;
  .tool {
    height: 2rem;
    width: 2rem;
    border-radius: 2px;
    border: 1px solid #dcdfe6;
    text-align: center;
  }
}
.button-text{
    user-select: none;
    transition: background 20ms ease-in 0s;
    cursor: pointer;
    padding: 4px 10px;
    border-radius: 3px;
    flex-shrink: 0;
    font-size: 15px;
    margin-left: 2px;
    margin-right: 2px;
    font-weight: 500;
    width: auto;
    &:hover{
      background: rgba(55, 53, 47, 0.16);
    }
}
</style>
