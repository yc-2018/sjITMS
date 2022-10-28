/*
 * @Author: guankongjin
 * @Date: 2022-07-21 15:59:18
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-10-28 08:37:03
 * @Description: 排车单地图
 * @FilePath: \iwms-web\src\pages\SJTms\MapDispatching\schedule\ScheduleMap.js
 */
import React, { Component } from 'react';
import { Divider, Modal, Button } from 'antd';
import { Map, Marker, CustomOverlay } from 'react-bmapgl';
import { getDetailByBillUuids } from '@/services/sjitms/ScheduleBill';
import { getAddressByUuids } from '@/services/sjitms/StoreTeam';
import StoreSVG from '@/assets/common/shop.svg';
import StoreIcon from './StoreIcon';
import { uniqBy } from 'lodash';

export default class DispatchMap extends Component {
  state = {
    visible: false,
    windowInfo: undefined,
    orders: [],
  };
  componentDidMount = () => {
    this.props.onRef && this.props.onRef(this);
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
            const store = stores.find(point => point.uuid == order.deliveryPoint.uuid);
            if (store) return { ...order, longitude: store.longitude, latitude: store.latitude };
          });
          const points = orders.map(point => {
            return new BMapGL.Point(point.longitude, point.latitude);
          });
          setTimeout(() => this.map?.setViewport(points), 500);
        }
        this.setState({ orders });
      }
    }
    this.setState({ visible: true });
  };

  drawIcon = color => {
    const icon = StoreIcon(color);
    // const svg = new XMLSerializer().serializeToString(icon);
    // const ImgBase64 = `data:image/svg+xml;base64,${window.btoa(svg)}`;
    const mapIcon = new BMapGL.Icon(StoreSVG, new BMapGL.Size(32, 32));
    return mapIcon;
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
              const icon = this.drawIcon('#0069ff');
              var point = new BMapGL.Point(order.longitude, order.latitude);
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
