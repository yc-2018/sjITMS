/*
 * @Author: Liaorongchang
 * @Date: 2022-04-16 11:36:01
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-10-20 14:32:56
 * @version: 1.0
 */

import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { dynamicDelete } from '@/services/quick/Quick';
import { Button, Popconfirm, message } from 'antd';
import CreatePageModal from '@/pages/Component/RapidDevelopment/OnlForm/QuickCreatePageModal';
import HighWayAreaCreatePage from './HighWayAreaCreatePage';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
export default class HighWagAreaSearchPage extends QuickFormSearchPage {
  //需要操作列的显示 将noActionCol设置为false
  state = { ...this.state, noActionCol: false, isShow: false, canDragTable: true };

  onCreate = () => {
    this.newPretypeModalRef.show();
  };

  onPretypeUpdate = record => {
    this.setState({
      params: { entityUuid: record.UUID, title: '1' },
    });
    this.updatePretypeModalRef.show();
  };

  onPretypeDelete = async record => {
    const { onlFormFields, onlFormHead } = this.state.formConfig[0];
    var tableName = onlFormHead.tableName;
    var field = onlFormFields.find(x => x.dbIsKey)?.dbFieldName;
    var val = record.UUID;
    const params = [
      {
        tableName,
        condition: { params: [{ field, rule: 'eq', val: [val] }] },
        deleteAll: 'false',
      },
    ];
    await dynamicDelete({ params: params }).then(result => {
      if (result.success) {
        message.success('删除成功！');
        this.queryCoulumns();
      } else {
        message.error('删除失败，请刷新后再操作');
      }
    });
  };

  //该方法用于写操作列的render
  renderOperateCol = record => {
    return (
      <span style={{ marginLeft: '-12px' }}>
        <a style={{ marginRight: 15 }} onClick={() => this.onPretypeUpdate(record)}>
          编辑
        </a>
        <Popconfirm
          title="你确定要删除所选中的内容吗?"
          onConfirm={() => this.onPretypeDelete(record)}
          okText="确定"
          cancelText="取消"
        >
          <a>删除</a>
        </Popconfirm>
      </span>
    );
  };

  /**
   * 绘制右上角按钮
   */
  drawActionButton = () => {
    const { params } = this.state;
    return (
      <div>
        <CreatePageModal
          modal={{
            title: '新建高速区域',
            width: 500,
            bodyStyle: { marginRight: '40px' },
            afterClose: () => {
              this.refreshTable();
            },
          }}
          page={{ quickuuid: this.props.quickuuid, noCategory: true }}
          onRef={node => (this.newPretypeModalRef = node)}
        />
        <CreatePageModal
          modal={{
            title: '编辑高速区域',
            width: 500,
            bodyStyle: { marginRight: '40px' },
            afterClose: () => {
              this.refreshTable();
            },
          }}
          customPage={HighWayAreaCreatePage}
          page={{ quickuuid: this.props.quickuuid, params: params }}
          onRef={node => (this.updatePretypeModalRef = node)}
        />
        <Button onClick={this.onCreate.bind()} type="primary" icon="plus">
          新建
        </Button>
      </div>
    );
  };
}
