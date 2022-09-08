/*
 * @Author: Liaorongchang
 * @Date: 2022-07-19 16:25:19
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-09-08 15:56:16
 * @version: 1.0
 */
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { Button, Popconfirm, message, Steps } from 'antd';
import { approved } from '@/services/sjitms/TollFee';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class DriverFeeSearchPage extends QuickFormSearchPage {
  approved = () => {
    const { selectedRows } = this.state;
    console.log('selectedRows', selectedRows);
    if (selectedRows.length == 0) {
      message.error('至少选一条数据');
    }
    selectedRows.forEach(async data => {
      const result = await approved(data);
    });
  };

  //该方法用于写中间的功能按钮 多个按钮用<span>包裹
  drawToolsButton = () => {
    return (
      <span>
        <Popconfirm
          title="你确定要审核所选中的内容吗?"
          onConfirm={() => this.approved()}
          okText="确定"
          cancelText="取消"
        >
          <Button>审批</Button>
        </Popconfirm>
      </span>
    );
  };

  drawcell = e => {
    if (e.column.fieldName == 'PARKINGFEE') {
      const component = <a onClick={() => this.props.onClose(e.record.UUID)}>{e.val}</a>;
      e.component = component;
    }
  };
}
