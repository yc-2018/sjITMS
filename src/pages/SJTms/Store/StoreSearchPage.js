
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {Button} from 'antd'
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { havePermission } from '@/utils/authority';
import { routerRedux } from 'dva/router';
@connect(({ quick, loading }) => ({
    quick,
    loading: loading.models.quick,
}))
export default class StoreSearchPage extends QuickFormSearchPage {
    drawTopButton = () => {
       return  <Button
        hidden={!havePermission(this.state.authority + '.port')}
        onClick={
            ()=>this.props.dispatch(
                routerRedux.push({
                  pathname: '/tmsbasic/AddressArea',
                  state: {
                    tab: 'create',
                    param: { entityUuid: 'sj_itms_ship_address_area' },
                  },
                })
              )
        }
        type="primary"
      >
        配送区域
      </Button>
    }; //扩展最上层按钮
}