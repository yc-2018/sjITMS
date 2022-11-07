/*
 * @Author: guankongjin
 * @Date: 2022-07-21 15:59:18
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-11-07 08:40:24
 * @Description: 排车单地图
 * @FilePath: \iwms-web\src\pages\SJTms\MapDispatching\schedule\ScheduleMap.js
 */
import React, { Component } from 'react';
import { Divider, Modal, Button } from 'antd';
import { Map, CustomOverlay } from 'react-bmapgl';
import { getDetailByBillUuids } from '@/services/sjitms/ScheduleBill';
import { queryDriverRoutes } from '@/services/sjitms/OrderBill';
import { queryDict } from '@/services/quick/Quick';
import { getAddressByUuids } from '@/services/sjitms/StoreTeam';
import { loginOrg } from '@/utils/LoginContext';
import ShopsIcon from '@/assets/common/shops.png';
import { uniqBy, orderBy } from 'lodash';

export default class DispatchMap extends Component {
  state = {
    visible: false,
    windowInfo: undefined,
    startPoint: '',
    rowKeys: [],
    orders: [],
  };
  componentDidMount = () => {
    this.props.onRef && this.props.onRef(this);
  };

  colors = [
    '#0069FF',
    '#EF233C',
    '#20BF55',
    '#07BEB8',
    '#FF715B',
    '#523F38',
    '#FF206E',
    '#086375',
    '#A9E5BB',
    '#8F2D56',
    '#004E98',
    '#5D576B',
    '#248232',
    '#9A031E',
    '#8E443D',
    '#F15152',
    '#F79256',
    '#640D14',
    '#3F88C5',
    '#0FA3B1',
  ];

  show = rowKeys => {
    queryDict('warehouse').then(res => {
      this.setState({
        startPoint: res.data.find(x => x.itemValue == loginOrg().uuid)?.description,
      });
    });
    this.contextMenu = undefined;
    this.initialize(rowKeys);
    this.setState({ visible: true, rowKeys });
  };

  //初始化
  initialize = async rowKeys => {
    if (rowKeys.length) {
      const response = await getDetailByBillUuids(rowKeys);
      if (response.success) {
        let orders = response.data;
        const deliveryPoints = uniqBy(orders.map(x => x.deliveryPoint), x => x.uuid).map(
          x => x.uuid
        );
        if (deliveryPoints.length > 0) {
          const storeRespones = await getAddressByUuids(deliveryPoints);
          const stores = storeRespones.data || [];
          orders = orders.map(order => {
            const index = rowKeys.findIndex(x => x == order.billUuid);
            const store = stores.find(point => point.uuid == order.deliveryPoint.uuid);
            if (store)
              return {
                ...order,
                longitude: store.longitude || 0,
                latitude: store.latitude || 0,
                scheduleNum: index + 1,
              };
          });
          orders = orderBy(orders.filter(res => res), x => x.scheduleNum);
          this.setState({ orders });
          setTimeout(() => {
            this.map?.clearOverlays();
            this.drawMarker(orders);
            this.drawMenu();
          }, 500);
        }
      }
    }
  };

  //送货点标注
  drawMarker = points => {
    points.forEach(pt => {
      const point = new BMapGL.Point(pt.longitude, pt.latitude);
      const marker = new BMapGL.Marker(point, {
        icon: this.drawIcon(pt.scheduleNum),
        shadow: true,
      });
      marker.addEventListener('mouseover', () => {
        this.setState({ windowInfo: { point, order: pt } });
      });
      marker.addEventListener('mouseout', () => {
        this.setState({ windowInfo: undefined });
      });

      this.map?.addOverlay(marker);
    });
  };

  //标注icon
  drawIcon = num => {
    const index = num % 20;
    const multiple = 5;
    const icon = new BMapGL.Icon(ShopsIcon, new BMapGL.Size(160 / multiple, 160 / multiple), {
      imageOffset: new BMapGL.Size(
        (160 / multiple) * ((index % 5) - 1),
        (160 / multiple) * (Math.ceil(index / 5) - 1)
      ),
      imageSize: new BMapGL.Size(800 / multiple, 1000 / multiple),
    });
    return icon;
  };

  //右键菜单
  drawMenu = () => {
    if (this.contextMenu) return;
    const menuItems = [
      {
        text: '显示驾车路线',
        callback: () => {
          this.showLine();
        },
      },
      {
        text: '隐藏驾车路线',
        callback: () => {
          this.hideLine();
        },
      },
    ];
    const menu = new BMapGL.ContextMenu();
    menuItems.forEach((item, index) => {
      menu.addItem(
        new BMapGL.MenuItem(item.text, item.callback, { width: 100, id: 'menu' + index })
      );
    });
    this.contextMenu = menu;
    this.map?.addContextMenu(menu);
  };

  //显示线路
  showLine = () => {
    const { rowKeys, orders } = this.state;
    rowKeys.forEach(key => {
      const points = orders.filter(res => res.billUuid == key);
      this.searchRoute(points);
    });
  };
  //隐藏线路
  hideLine = () => {
    const { orders } = this.state;
    this.map?.clearOverlays();
    this.drawMarker(orders);
  };

  //路线规划
  searchRoute = async selectPoints => {
    const pointArr = selectPoints.map(order => {
      return (order.latitude + ',' + order.longitude).trim();
    });
    const { startPoint } = this.state;
    const waypoints = pointArr.filter((_, index) => index < pointArr.length - 1);
    const response = await queryDriverRoutes(
      startPoint,
      pointArr[pointArr.length - 1],
      waypoints.join('|')
    );
    if (response.status == 0) {
      const routePaths = response.result.routes[0].steps.map(x => x.path);
      let pts = new Array();
      routePaths.forEach(path => {
        const points = path.split(';');
        points.forEach(point => {
          pts.push(new BMapGL.Point(point.split(',')[0], point.split(',')[1]));
        });
      });
      const color = this.colors[selectPoints[0].scheduleNum - 1];
      var polyline = new BMapGL.Polyline(pts, {
        strokeColor: color,
        strokeWeight: 6,
        strokeOpacity: 0.7,
      });
      this.map?.addOverlay(polyline);
      this.map?.addOverlay(
        this.drawRouteMarker(startPoint.split(',')[1], startPoint.split(',')[0], 50, 80, 400, 278)
      );
      this.map?.setViewport(pts);
    }
  };
  //路线规划标注
  drawRouteMarker = (lng, lat, width, hieght, x, y) => {
    const iconUrl = '//webmap1.bdimg.com/wolfman/static/common/images/markers_new2x_2960fb4.png';
    return new BMapGL.Marker(new BMapGL.Point(lng, lat), {
      icon: new BMapGL.Icon(iconUrl, new BMapGL.Size(width / 2, hieght / 2), {
        imageOffset: new BMapGL.Size(x / 2, y / 2),
        imageSize: new BMapGL.Size(600 / 2, 600 / 2),
      }),
    });
  };

  render() {
    const { visible, windowInfo, orders } = this.state;
    return (
      <Modal
        style={{ top: 0, height: '100vh', overflow: 'hidden', background: '#fff' }}
        width="100vw"
        bodyStyle={{ margin: -24, height: '100vh' }}
        visible={visible}
        footer={<Button onClick={() => this.setState({ visible: false })}>关闭</Button>}
        closable={false}
        destroyOnClose={true}
      >
        {orders.length > 0 ? (
          <Map
            center={{ lng: 113.809388, lat: 23.067107 }}
            zoom={10}
            minZoom={6}
            enableScrollWheelZoom
            enableRotate={false}
            enableTilt={false}
            ref={ref => (this.map = ref?.map)}
            style={{ height: '100%' }}
          >
            {windowInfo ? (
              <CustomOverlay position={windowInfo.point} offset={new BMapGL.Size(15, -15)}>
                <div style={{ width: 250, height: 100, padding: 5, background: '#FFF' }}>
                  <div style={{ fontWeight: 'bold', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {`[${windowInfo.order.deliveryPoint.code}]` +
                      windowInfo.order.deliveryPoint.name}
                  </div>
                  <Divider style={{ margin: 0, marginTop: 5 }} />
                  <div>
                    线路：
                    {windowInfo.order.archLine?.code}
                  </div>
                  <div style={{ display: 'flex', marginTop: 5 }}>
                    <div style={{ flex: 1 }}>整件数</div>
                    <div style={{ flex: 1 }}>周转箱数</div>
                    <div style={{ flex: 1 }}>体积</div>
                    <div style={{ flex: 1 }}>重量</div>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <div style={{ flex: 1 }}>{windowInfo.order.cartonCount}</div>
                    <div style={{ flex: 1 }}>{windowInfo.order.containerCount}</div>
                    <div style={{ flex: 1 }}>{windowInfo.order.volume}</div>
                    <div style={{ flex: 1 }}>{(windowInfo.order.weight / 1000).toFixed(3)}</div>
                  </div>
                </div>
              </CustomOverlay>
            ) : (
              <></>
            )}
          </Map>
        ) : (
          <Map
            center={{ lng: 113.809388, lat: 23.067107 }}
            zoom={18}
            enableScrollWheelZoom
            enableAutoResize
            enableRotate={false}
            enableTilt={false}
            style={{ height: '100%' }}
          />
        )}
      </Modal>
    );
  }
}
