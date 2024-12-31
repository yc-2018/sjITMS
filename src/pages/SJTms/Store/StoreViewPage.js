/**
 * 门店预览界面
 * @author ChenGuangLong
 * @since 2024/12/30 下午4:38
*/
import React, { createRef } from 'react';
import { connect } from 'dva';
import { Empty } from 'antd';
import QuickViewPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickViewPage';
import GdMap from '@/components/GdMap';
import { dynamicQuery } from '@/services/quick/Quick';
import configs from '@/utils/config';
import MyImg from '@/components/MyImg';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class StoreViewPage extends QuickViewPage {
  initMapAndImg = true;   // 初始化地图和图片一次就好 避免状态变化导致重复初始化地图和图片
  gdMapRef = createRef();

  constructor (props) {
    super(props);

    this.state = {
      ...this.state,
      imgList: []
    };
  }

  /**
   * 底部扩展地图
   * @author ChenGuangLong
   * @since 2024/12/30 下午4:43
   */
  infoBottomExtra = () => {
    const lng = this.entity.v_sj_itms_ship_store[0].LONGITUDE;
    const lat = this.entity.v_sj_itms_ship_store[0].LATITUDE;
    if (!lng || !lat) return <></>;

    this.initMapAndImg && window.setTimeout(() => {
      this.gdMapRef.current?.addStoreMarkers([{longitude: lng, latitude: lat,iconNum:1}]);
      this.gdMapRef.current?.map.setFitView();
      this.initMapAndImg = false;

      let param = {
        tableName: 'v_sj_itms_store_img',
        condition: {
          params: [{ field: 'DELIVERYPOINTUUID', rule: 'eq', val: [this.entity.v_sj_itms_ship_store[0].UUID] }],
        },
      };
      dynamicQuery(param).then(res => {
        if (!res.success || res.result.records === 'false') return;
        const imgList = res.result.records.map(i => `${configs[API_ENV].API_SERVER}/itms-schedule/itms-schedule/addressReport/seeImg/${i.IMGURL}`);
        this.setState({ imgList });
      });
    }, 1000);

    return (
      <div style={{ display: 'grid', gridTemplateColumns: '50% 49%', gap: 12, paddingBottom: 12 }}>
        <GdMap ref={this.gdMapRef} style={{ height: 400,width: '50%' }}/>
        <div style={{ height: 400 }}>
          {this.state.imgList.length === 0 ?
            <Empty description="暂无图片"/> :
            <MyImg
              images={this.state.imgList}
              listStyle={{ display: 'block', whiteSpace: 'nowrap', overflowX: 'auto' }}
              imgCardStyle={{ display: 'inline-block', margin: '0 5px 0 0' }}
              imgListStyle={{ width: 'unset', height: 400 }}
            />
          }
        </div>
      </div>
    )
  };

}
