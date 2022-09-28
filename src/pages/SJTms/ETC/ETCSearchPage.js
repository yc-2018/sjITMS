/*
 * @Author: Liaorongchang
 * @Date: 2022-07-19 16:25:19
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-09-28 15:10:57
 * @version: 1.0
 */
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { Button, Popconfirm, message, Steps } from 'antd';
import { approved } from '@/services/sjitms/TollFee';
import BatchProcessConfirm from '../Dispatching/BatchProcessConfirm';
import { havePermission } from '@/utils/authority';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class ETCSearchPage extends QuickFormSearchPage {
  state = {
    ...this.state,
    noActionCol: false,
  };

  //该方法用于写操作列的render
  renderOperateCol = record => {
    return (
      <span>
        <a style={{ marginRight: 15 }} onClick={() => this.props.onClose(record.CARDNO)}>
          操作历史
        </a>
      </span>
    );
  };
}
