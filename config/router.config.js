export default [
  // user
  {
    path: '/user',
    component: '../layouts/UserLayout',
    routes: [
      { path: '/user', redirect: '/user/login' },
      { path: '/user/login', component: './SJTms/Login/Login' },
    ],
  },
  {
    path: '/driver',
    component: '../layouts/DriverLayout',
    routes: [
      { path: '/driver/swipe', component: './SJTms/Schedule/DriverSwipe' },
      { path: '/driver/swipeLoading', component: './SJTms/Schedule/DriverSwipeLoading' },
      { path: '/driver/swipeInAndOut', component: './SJTms/Schedule/DriverSwipeInAndOut' },
      { path: '/driver/DriverSwipePrint', component: './SJTms/Schedule/DriverSwipePrint' },
      { path: '/driver/DriverSwipeSign', component: './SJTms/Schedule/DriverSwipeSign' },
      { path: '/driver/sign', component: './SJTms/PreView/Sign/View' },
    ],
  },
  {
    path: '/',
    component: '../layouts/BasicLayout',
    Routes: ['src/pages/Authorized'],
    routes: [],
  },
];
