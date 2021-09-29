import avatarSvg from '@/assets/avatar.png';

const configs = {
  // 本地
  local: {
     API_SERVER: 'http://127.0.0.1:8081' ,
    //  API_SERVER: 'http://172.17.2.226:8080' ,//CHT
    //  API_SERVER: 'http://172.17.5.240:8080' ,  //WXB
    'avatar.default.url': 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png',
    RPORTER_SERVER:"http://app5.iwms.hd123.cn:8081/iwms-report/decision/view/report",
    PRINT_TYPE:0,
  },
  // 开发环境
  dev: {
    API_SERVER: 'http://172.17.10.102:8080',
    'avatar.default.url': 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png',
    RPORTER_SERVER:"http://app5.iwms.hd123.cn:8081/iwms-report/decision/view/report",
    PRINT_TYPE:0,
  },
  // 测试环境
  test: {
    API_SERVER: 'http://172.17.10.133:8080',
    'avatar.default.url': 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png',
    RPORTER_SERVER:"http://app5.iwms.hd123.cn:8081/iwms-report/decision/view/report",
    PRINT_TYPE:0,
  },
  // Docker 模拟部署环境
  docker: {
    API_SERVER: 'http://DOCKER_API_SERVER_ADDR',
    'avatar.default.url': avatarSvg,
    RPORTER_SERVER:"http://DOCKER_RPORTER_SERVER_ADDR/iwms-report/decision/view/report",
    PRINT_TYPE:0,
  }
};

export default configs;
