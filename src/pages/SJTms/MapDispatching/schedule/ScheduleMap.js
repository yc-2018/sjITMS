/*
 * @Author: guankongjin
 * @Date: 2022-07-21 15:59:18
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-10-31 17:49:20
 * @Description: 排车单地图
 * @FilePath: \iwms-web\src\pages\SJTms\MapDispatching\schedule\ScheduleMap.js
 */
import React, { Component } from 'react';
import { Divider, Modal, Button } from 'antd';
import { Map, Marker, CustomOverlay } from 'react-bmapgl';
import { getDetailByBillUuids } from '@/services/sjitms/ScheduleBill';
import { getAddressByUuids } from '@/services/sjitms/StoreTeam';
import ShopsIcon from '@/assets/common/shops.png';
import { uniqBy, orderBy } from 'lodash';

export default class DispatchMap extends Component {
  state = {
    visible: false,
    windowInfo: undefined,
    orders: [],
  };
  componentDidMount = () => {
    this.props.onRef && this.props.onRef(this);
  };

  drawIcon = num => {
    const index = num % 20;
    const multiple = 4;
    const icon = new BMapGL.Icon(ShopsIcon, new BMapGL.Size(160 / multiple, 160 / multiple), {
      imageOffset: new BMapGL.Size(
        (160 / multiple) * (Math.ceil(index / 5) - 1),
        (160 / multiple) * ((index % 5) - 1)
      ),
      imageSize: new BMapGL.Size(800 / multiple, 1000 / multiple),
    });
    return icon;
  };

  show = async rowKeys => {
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
          orders = orders.filter(res => res);
          orders = orderBy(orders, x => x.scheduleNum);
          this.setState({ orders });
          const points = orders.map(point => {
            return new BMapGL.Point(point.longitude, point.latitude);
          });
          setTimeout(() => this.map?.setViewport(points), 500);
        }
      }
    }
    this.setState({ visible: true });
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
            zoom={10}
            minZoom={6}
            enableScrollWheelZoom
            enableRotate={false}
            enableTilt={false}
            ref={ref => (this.map = ref?.map)}
            style={{ height: '100%' }}
          >
            {orders.map(order => {
              const point = new BMapGL.Point(order.longitude, order.latitude);
              const icon = this.drawIcon(order.scheduleNum);
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
