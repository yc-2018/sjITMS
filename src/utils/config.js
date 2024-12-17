import avatarSvg from '@/assets/avatar.png';

const configs = {
  // 本地
  local: {
    // API_SERVER: 'http://127.0.0.1:8081',            // 本地的后端环境
 API_SERVER: 'http://192.168.111.82:8000/iwms',  // 测试库后端环境
 // API_SERVER: 'http://172.29.30.104:8000/iwms',   // 正式库后端环境
    //  API_SERVER: 'http://172.17.2.226:8080' ,//CHT
    //  API_SERVER: 'http://172.17.5.240:8080' ,  //WXB
    'avatar.default.url': 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png',
    RPORTER_SERVER: 'http://app5.iwms.hd123.cn:8081/iwms-report/decision/view/report',
    PRINT_TYPE: 0,
    PRO_ENV: 0,
  },
  // 开发环境
  dev: {
    API_SERVER: 'http://172.17.10.102:8080',
    'avatar.default.url': 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png',
    RPORTER_SERVER: 'http://app5.iwms.hd123.cn:8081/iwms-report/decision/view/report',
    PRINT_TYPE: 0,
    PRO_ENV: 0
  },
  // 测试环境
  test: {
    API_SERVER: 'DOCKER_API_SERVER_ADDR',
    'avatar.default.url': avatarSvg,
    RPORTER_SERVER: 'http://DOCKER_RPORTER_SERVER_ADDR/iwms-report/decision/view/report',
    PRINT_TYPE: 0,
    PRO_ENV: 0
  },
  // Docker 模拟部署环境
  docker: {
    API_SERVER: 'DOCKER_API_SERVER_ADDR',
    'avatar.default.url': avatarSvg,
    RPORTER_SERVER: 'http://DOCKER_RPORTER_SERVER_ADDR/iwms-report/decision/view/report',
    PRINT_TYPE: 0,
    PRO_ENV: 'DOCKER_PRO_ENV'
  },
};

export default configs;
