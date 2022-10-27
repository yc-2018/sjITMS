/*
 * @Author: guankongjin
 * @Date: 2022-07-21 15:59:18
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-10-25 18:00:28
 * @Description: 排车单地图
 * @FilePath: \iwms-web\src\pages\SJTms\MapDispatching\dispatching\DispatchingMap.js
 */
import React, { Component } from 'react';
import { Divider, Modal, Button, Row, Col } from 'antd';
import { Map, Marker, CustomOverlay, DrawingManager } from 'react-bmapgl';
import style from './DispatchingMap.less';
import SearchForm from './SearchForm';
import { queryAuditedOrder } from '@/services/sjitms/OrderBill';
import StoreIcon from '@/assets/common/store.svg';
import StoreClickIcon from '@/assets/common/storeClick.svg';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { groupBy, sumBy } from 'lodash';

export default class DispatchMap extends Component {
  state = {
    visible: false,
    windowInfo: undefined,
    loading: false,
    pageFilter: [],
    orders: [],
  };
  componentDidMount = () => {
    this.props.onRef && this.props.onRef(this);
  };
  show = () => {
    this.setState({ visible: true });
  };

  //查询
  refresh = params => {
    this.setState({ loading: true });
    let { pageFilter } = this.state;
    let filter = { pageSize: 200, superQuery: { matchType: 'and', queryParams: [] } };
    if (params) {
      pageFilter = params;
    }
    const isOrgQuery = [
      { field: 'COMPANYUUID', type: 'VarChar', rule: 'eq', val: loginCompany().uuid },
      { field: 'DISPATCHCENTERUUID', type: 'VarChar', rule: 'eq', val: loginOrg().uuid },
    ];
    filter.superQuery.queryParams = [
      ...pageFilter,
      ...isOrgQuery,
      { field: 'STAT', type: 'VarChar', rule: 'in', val: 'Audited||PartScheduled' },
      { field: 'PENDINGTAG', type: 'VarChar', rule: 'eq', val: 'Normal' },
    ];
    queryAuditedOrder(filter).then(response => {
      if (response.success) {
        const data = response.data.records ? response.data.records : [];
        this.setState({ orders: data });
        this.map.setViewport(
          data.map(point => {
            return new BMapGL.Point(point.longitude, point.latitude);
          })
        );
      }
      this.setState({ loading: false, pageFilter });
    });
  };

  //画框选取marker
  drawSelete = event => {
    let { orders } = this.state;
    let overlays = [];
    overlays.push(event.overlay);
    let pStart = event.overlay.getPath()[3]; //矩形左上角坐标
    let pEnd = event.overlay.getPath()[1]; //矩形右上角坐标
    var pt1 = new BMapGL.Point(pStart.lng, pStart.lat); //3象限
    var pt2 = new BMapGL.Point(pEnd.lng, pEnd.lat); //1象限
    var bds = new BMapGL.Bounds(pt1, pt2); //范围

    for (const order of orders) {
      var pt = new BMapGL.Point(order.longitude, order.latitude);
      var result = this.isPointInRect(pt, bds); //判断一个点是否在某个矩形中
      if (result == true) {
        order.isSelect = true;
      }
    }
    this.map.removeOverlay(event.overlay);
    this.setState({ orders });
    this.props.dispatchingByMap(orders.filter(x => x.isSelect));
  };
  //判断一个点是否在某个矩形中
  isPointInRect = (point, bounds) => {
    var sw = bounds.getSouthWest(); //西南脚点
    var ne = bounds.getNorthEast(); //东北脚点
    return point.lng >= sw.lng && point.lng <= ne.lng && point.lat >= sw.lat && point.lat <= ne.lat;
  };

  render() {
    const { visible, windowInfo, orders } = this.state;
    return (
      <Modal
        style={{ top: 0, height: '100vh', overflow: 'hidden', background: '#fff' }}
        width="100vw"
        className={style.dispatchingMap}
        bodyStyle={{ margin: -24, height: '99vh' }}
        visible={visible}
        title={
          <Row type="flex" justify="space-between">
            <Col span={22}>
              <SearchForm refresh={this.refresh} />
            </Col>
            <Col span={1}>
              <Button onClick={() => this.setState({ visible: false })}>关闭</Button>
            </Col>
          </Row>
        }
        closable={false}
        destroyOnClose={true}
      >
        <Row type="flex" style={{ height: '100%' }}>
          <Col span={6} style={{ height: '100%', background: '#fff', overflow: 'auto' }}>
            {orders.length > 0 ? (
              orders.map(order => {
                return (
                  <div className={style.storeCard}>
                    <div> {`[${order.deliveryPoint.code}]` + order.deliveryPoint.name}</div>
                    <Divider style={{ margin: 0, marginTop: 5 }} />
                    <div style={{ display: 'flex', marginTop: 5 }}>
                      <div style={{ flex: 1 }}>体积</div>
                      <div style={{ flex: 1 }}>重量</div>
                      <div style={{ flex: 1 }}>总件数</div>
                    </div>
                    <div style={{ display: 'flex' }}>
                      <div style={{ flex: 1 }}>{order.volume}</div>
                      <div style={{ flex: 1 }}>{order.weight}</div>
                      <div style={{ flex: 1 }}>{order.realCartonCount}</div>
                    </div>
                  </div>
                );
              })
            ) : (
              <></>
            )}
          </Col>
          <Col span={18}>
            {orders.length > 0 ? (
              <Map
                zoom={10}
                minZoom={6}
                enableScrollWheelZoom
                enableRotate={false}
                enableTilt={false}
                ref={ref => (this.map = ref?.map)}
                style={{ height: '100%' }}
              >
                <DrawingManager
                  enableLimit
                  enableCalculate
                  onOverlaycomplete={event => this.drawSelete(event)}
                  limitOptions={{ area: 9999999999999, distance: 9999999999999 }}
                  drawingToolOptions={{
                    drawingModes: ['rectangle'],
                  }}
                  rectangleOptions={{
                    strokeColor: '#d9534f', //边线颜色。
                    fillColor: '#f4cdcc', //填充颜色。当参数为空时，圆形将没有填充效果。
                    strokeWeight: 2, //边线的宽度，以像素为单位。         ");
                    strokeOpacity: 0.6, //边线透明度，取值范围0 - 1。
                    fillOpacity: 0.3, //填充的透明度，取值范围0 - 1。
                    strokeStyle: 'dashed', //边线的样式，solid或dashed。
                  }}
                />
                {orders.map(order => {
                  var point = new BMapGL.Point(order.longitude, order.latitude);
                  const icon = new BMapGL.Icon(
                    order.isSelect ? StoreClickIcon : StoreIcon,
                    new BMapGL.Size(32, 32)
                  );
                  return (
                    <Marker
                      position={point}
                      icon={icon}
                      shadow={true}
                      onMouseover={() => this.setState({ windowInfo: { point, order } })}
                      onMouseout={() => this.setState({ windowInfo: undefined })}
                    />
                  );
                })}
                {windowInfo ? (
                  <CustomOverlay position={windowInfo.point} offset={new BMapGL.Size(15, -15)}>
                    <div style={{ width: 250, height: 80, padding: 5, background: '#FFF' }}>
                      <div style={{ fontWeight: 'bold', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {`[${windowInfo.order.deliveryPoint.code}]` +
                          windowInfo.order.deliveryPoint.name}
                      </div>
                      <Divider style={{ margin: 0, marginTop: 5 }} />
                      <div style={{ display: 'flex', marginTop: 5 }}>
                        <div style={{ flex: 1 }}>体积</div>
                        <div style={{ flex: 1 }}>重量</div>
                        <div style={{ flex: 1 }}>总件数</div>
                      </div>
                      <div style={{ display: 'flex' }}>
                        <div style={{ flex: 1 }}>{windowInfo.order.volume}</div>
                        <div style={{ flex: 1 }}>{windowInfo.order.weight}</div>
                        <div style={{ flex: 1 }}>{windowInfo.order.realCartonCount}</div>
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
                zoom={14}
                enableScrollWheelZoom
                enableAutoResize
                enableRotate={false}
                enableTilt={false}
                style={{ height: '100%' }}
              />
            )}
          </Col>
        </Row>
      </Modal>
    );
  }
}