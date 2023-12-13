#!/bin/sh

config_modify_file=/var/log/nginx/config_modify_file-`date +%Y%m%d`.log

line="------------------------------------------------------"

function modifyFEConfig() {
cat <<EOF
${line}
更改前端 umi 指向后台地址：

EOF

# 172.17.10.124/iwms
escapeApiServerAddr=$(echo $API_SERVER_ADDR | sed -e 's/\//\\\//g')
escapeReportServerAddr=$(echo $REPORT_SERVER_ADDR |sed -e 's/\//\\\//g')
escapeProEnvAddr=$(echo $PRO_ENV |sed -e 's/\//\\\//g')

echo "更改后端的 Api server addr: $escapeApiServerAddr"
sed -i "s/DOCKER_API_SERVER_ADDR/$escapeApiServerAddr/g" /usr/share/nginx/html/umi.*js

echo "更改后端的 Report server addr: $escapeReportServerAddr"
sed -i "s/DOCKER_RPORTER_SERVER_ADDR/$escapeReportServerAddr/g" /usr/share/nginx/html/umi.*js

sed -i "s/DOCKER_PRO_ENV/$escapeProEnvAddr/g" /usr/share/nginx/html/umi.*js

echo '更改结束, 更改后的 umi 位置: /var/log/nginx/umi'
}

function modifyProxyAndBalanceConfig() {
cat <<EOF
${line}
更改后端代理或负载均衡：


EOF

# single, cluster
deployMode=$DEPLOY_MODE
if [ $deployMode = "single" ]; then
  echo '选择单机部署'
  cp /etc/nginx/nginx.single.conf /etc/nginx/nginx.conf

  echo "更改 pds-server 代理地址: $PROXY_PDS_HOST"
  sed -i "s/PROXY_PDS_HOST/$PROXY_PDS_HOST/g" /etc/nginx/nginx.conf

  echo "更改 zuul 代理地址: $PROXY_ZUUL_HOST"
  sed -i "s/PROXY_ZUUL_HOST/$PROXY_ZUUL_HOST/g" /etc/nginx/nginx.conf

    echo "更改 zuul 端口号: $PROXY_ZUUL_PORT"
  sed -i "s/PROXY_ZUUL_PORT/$PROXY_ZUUL_PORT/g" /etc/nginx/nginx.conf

  echo '配置 single 结束...'
elif [ $deployMode = "cluster" ]; then
  echo '选择 cluster 部署'
  cp /etc/nginx/nginx.cluster.conf /etc/nginx/nginx.conf

  echo "更改 pds-server 代理地址: $PROXY_PDS_HOST"
  sed -i "s/PROXY_PDS_HOST/$PROXY_PDS_HOST/g" /etc/nginx/nginx.conf

  echo "更改 zuul balance 地址: $BALANCE_ZUUL_HOST1, $BALANCE_ZUUL_HOST2"
  sed -i "s/BALANCE_ZUUL_HOST1/$BALANCE_ZUUL_HOST1/g" /etc/nginx/nginx.conf
  sed -i "s/BALANCE_ZUUL_HOST2/$BALANCE_ZUUL_HOST2/g" /etc/nginx/nginx.conf

  echo "更改 rabbit balance 地址: $BALANCE_RABBIT_HOST1, $BALANCE_RABBIT_HOST2, $BALANCE_RABBIT_HOST3"
  sed -i "s/BALANCE_RABBIT_HOST1/$BALANCE_RABBIT_HOST1/g" /etc/nginx/nginx.conf
  sed -i "s/BALANCE_RABBIT_HOST2/$BALANCE_RABBIT_HOST2/g" /etc/nginx/nginx.conf
  sed -i "s/BALANCE_RABBIT_HOST3/$BALANCE_RABBIT_HOST3/g" /etc/nginx/nginx.conf

  echo '配置 cluster 结束...'
fi

cat <<EOF
${line}
更改后的配置：


EOF
cat /etc/nginx/nginx.conf
}


function runNoDaemonNginx() {
cat <<EOF
${line}

运行 nginx...
EOF

nginx -g 'daemon off;'
}

function runMain() {
modifyFEConfig
modifyProxyAndBalanceConfig
runNoDaemonNginx
}

runMain > $config_modify_file

