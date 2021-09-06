FROM nginx:alpine

ENV DEPLOY_MODE single
ENV API_SERVER_ADDR 192.168.111.82:8000/iwms
ENV REPORT_SERVER_ADDR = 00
ENV PROXY_PDS_HOST 192.168.111.82
ENV PROXY_ZUUL_HOST 192.168.111.82
ENV BALANCE_ZUUL_HOST1 = 00
ENV BALANCE_ZUUL_HOST2 = 00
ENV BALANCE_RABBIT_HOST1 = 00
ENV BALANCE_RABBIT_HOST2 = 00
ENV BALANCE_RABBIT_HOST3 = 00

WORKDIR /usr/share/nginx/html/
COPY dist  /usr/share/nginx/html/

# deploy mode
COPY docker/nginx.single.conf /etc/nginx/nginx.single.conf
COPY docker/nginx.cluster.conf /etc/nginx/nginx.cluster.conf

# entrypoing
COPY docker/nginx-entrypoint.sh /usr/local/bin/nginx-entrypoint.sh
RUN chmod +x /usr/local/bin/nginx-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["sh", "/usr/local/bin/nginx-entrypoint.sh"]
