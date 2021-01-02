
import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);
const routes = [
  {
    path: '/',
    name: 'home',
    component: require('./views/Company/InfoPage.vue').default
  },
  {
    path: '/company/infoPage',
    name: 'companyInfoPage',
    component: require('./views/Company/InfoPage.vue').default
  },
  {
    path: '/job/infoPage',
    name: 'jobInfoPage',
    component: require('./views/Job/InfoPage.vue').default
  },
  {
    path: '/data/analysis',
    name: 'dataAnalysis',
    component: require('./views/DataAnalysis/DataAnalysis.vue').default
  },
  {
    path: '/resetPassword',
    name: 'ResetPassword',
    component: require('./views/ResetPassword/index.vue').default,
    meta: {
      title: `重置密码`
    }
  },
  ...require('./views/User').default, // A 业务路由入口
];

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
});

export default router;
