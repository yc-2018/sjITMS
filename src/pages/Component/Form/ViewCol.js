import React, { PureComponent } from 'react';
import { Form } from 'antd';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { convertCodeName } from '@/utils/utils';
import { routerRedux } from 'dva/router';
import { func } from 'prop-types';

const FormItem = Form.Item;

/**
 * 列表数据展示
 * 默认
 *
 */
export const viewLink = {
  ARTICLE: {
    name: 'ARTICLE',
    caption: '商品',
  },
  STORE: {
    name: 'STORE',
    caption: '门店',
  },
  VENDOR: {
    name: 'VENDOR',
    caption: '供应商',
  },
};

/**
 * 件数/已X件数、数量/已X数量 未完成时高亮显示
 * 商品、门店... 超链接
 * @param {} dispatch:
 * @param {Object|string} colValue: 列值
 * @param {viewLink} link: 跳转查看
 */
export default class ViewCol extends PureComponent {

  onViewDC = (dcUuid) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/basic/dc',
      payload: {
        showPage: 'view',
        entityUuid: dcUuid,
      },
    }));
  };

  onViewArticle = (articleUuid) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/basic/article',
      payload: {
        showPage: 'view',
        entityUuid: articleUuid,
      },
    }));
  };

  onViewVendor = (vendorUuid) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/basic/vendor',
      payload: {
        showPage: 'view',
        entityUuid: vendorUuid,
      },
    }));
  };

  onViewStore = (storeUuid) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/basic/store',
      payload: {
        showPage: 'view',
        entityUuid: storeUuid,
      },
    }));
  };

  onViewOwner = (ownerUuid) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/basic/owner',
      payload: {
        showPage: 'view',
        entityUuid: ownerUuid,
      },
    }));
  };

  onViewContainer = (barcode) => {
    if (!barcode || '-' === barcode)
      return;
    this.props.dispatch(routerRedux.push({
      pathname: '/facility/container',
      payload: {
        showPage: 'view',
        entityUuid: barcode,
      },
    }));
  };

  onViewWrh = (wrhUuid) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/facility/wrh',
      payload: {
        showPage: 'view',
        entityUuid: wrhUuid,
      },
    }));
  };

  onViewCarrier = (carrierUuid) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/tms/carrier',
      payload: {
        showPage: 'view',
        entityUuid: carrierUuid,
      },
    }));
  };

  onViewVehicle = (vehicleUuid) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/tms/vehicle',
      payload: {
        showPage: 'view',
        uuid: vehicleUuid,
      },
    }));
  };

  render() {
    const { link, colValue, split} = this.props;
    let text = toText(colValue, split);
    if (split) {
      if (colValue[0] === colValue[1]) {
        return <EllipsisCol colValue={text}/>;
      } else {
        return <EllipsisCol colValue={text}/>;
        // return <EllipsisCol style={{fontColor: '#FF5400'}} colValue={text}/>;
      }
    }
    if (link) {
      return (
          <EllipsisCol colValue={text}/>
      );
    }
    return <EllipsisCol colValue={text}/>;
  }
}

function toText(obj, split) {
  if (!obj) {
    return null;
  }
  if (typeof obj === 'string') {
    return obj;
  }
  if (typeof obj === 'number') {
    return obj;
  }
  if (split) {
    return obj[0] + '/' + obj[1];
  }
  if (obj instanceof Array) {
    return obj.map(item => toText(item)).join(',');
  }
  const hasUcn = obj.hasOwnProperty('uuid') && obj.hasOwnProperty('code') && obj.hasOwnProperty('name');
  if (hasUcn) {
    return convertCodeName(obj);
  }
  return obj;
}
