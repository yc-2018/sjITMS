/**
 * 门店预览界面
 * @author ChenGuangLong
 * @since 2024/12/30 下午4:38
*/
import React, { createRef } from 'react';
import { connect } from 'dva';
import QuickViewPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickViewPage';
import GdMap from '@/components/GdMap';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class StoreViewPage extends QuickViewPage {
  gdMapRef = createRef();

  /**
   * 底部扩展地图
   * @author ChenGuangLong
   * @since 2024/12/30 下午4:43
   */
  infoBottomExtra = () => {
    const lng = this.entity.v_sj_itms_ship_store[0].LONGITUDE;
    const lat = this.entity.v_sj_itms_ship_store[0].LATITUDE;
    if (!lng || !lat) return <></>;

    window.setTimeout(() => {
      this.gdMapRef.current.addStoreMarkers([{longitude: lng, latitude: lat,iconNum:1}]);
      this.gdMapRef.current.map.setFitView();
    }, 1000);

    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <GdMap ref={this.gdMapRef} style={{ height: 400,width: '50%' }}/>
        <div style={{height: 400 }}>
          暂无图片
        </div>
      </div>
    )
  };

}
