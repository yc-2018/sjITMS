/*
 * @Author: Liaorongchang
 * @Date: 2022-07-19 16:25:19
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-12-14 15:37:32
 * @version: 1.0
 */
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { message } from 'antd';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class ETCSearchPage extends QuickFormSearchPage {
  state = {
    ...this.state,
    noActionCol: false,
  };

  /**
   * 编辑界面
   */
  onUpdate = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length !== 0) {
      if (selectedRows[0].STATE == 'Using') {
        message.error('该粤通卡已发卡，不可编辑');
        return;
      }
      const { onlFormField } = this.props;
      var field = onlFormField[0].onlFormFields.find(x => x.dbIsKey)?.dbFieldName;
      this.props.switchTab('update', {
        entityUuid: selectedRows[0][field],
      });
    } else {
      message.error('请至少选中一条数据！');
    }
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
