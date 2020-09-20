import Vue from 'vue';
import Router from 'vue-router';
import Cookies from 'js-cookie';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  scrollBehavior: () => ({y: 0}),
  routes: [
    {
      path: '/',
      redirect: '/intro'
    },
    {
      path: '/',
      name: 'Home',
      component: () => import('../components/Home.vue'),
      meta: {icon: 'el-icon-s-home', index: '/', title: '自述文件'},
      children: [
        {
          path: '/intro',
          name: 'Intro',
          component: () => import('../views/intro.vue'),
          meta: {icon: 'el-icon-s-home', index: 'intro', title: '系统首页'}
        },
        {
          path: '/cate',
          mame: 'Cate',
          component: () => import('../views/cate.vue'),
          meta: {icon: 'el-icon-s-flag', index: 'cate', title: '分类管理'}
        },
        {
          path: '/link',
          mame: 'Link',
          component: () => import('../views/link.vue'),
          meta: {icon: 'el-icon-star-on', index: 'link', title: '链接管理'}
        },
        {
          path: '/auth',
          mame: 'Auth',
          component: () => import('../views/auth.vue'),
          meta: {icon: 'el-icon-s-tools', index: 'auth', title: '权限管理'}
        },
        {
          path: '/group',
          mame: 'Group',
          component: () => import('../views/group.vue'),
          meta: {icon: 'el-icon-s-order', index: 'group', title: '群组管理'}
        },
        {
          path: '/user',
          name: 'User',
          component: () => import('../views/user.vue'),
          meta: {
            icon: 'el-icon-user-solid',
            index: 'user',
            title: '用户管理'
          }
        }
      ],
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/login.vue')
    },
    {
      path: '*',
      redirect: '/404'
    }
  ],
});

// 解决ElementUI导航栏中的vue-router在3.0版本以上重复点菜单报错问题
const originalPush = Router.prototype.push;
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch((err) => err);
};

export default router;

//使用钩子函数对路由进行权限跳转
router.beforeEach((to, from, next) => {
  const token = Cookies.get('access-token');
  if (!token && to.path !== '/login') {
    next('/login');
  }
  next();
});
