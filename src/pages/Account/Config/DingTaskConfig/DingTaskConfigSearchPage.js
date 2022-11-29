/*
 * @Author: Liaorongchang
 * @Date: 2022-07-19 16:25:19
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-11-28 18:23:53
 * @version: 1.0
 */
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import CreatePageModal from '@/pages/Component/RapidDevelopment/OnlForm/QuickCreatePageModal';
import { message, Popconfirm, Button, Form, Modal, Input } from 'antd';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class DingTaskConfigSearchPage extends QuickFormSearchPage {
  state = {
    ...this.state,
    isNotHd: true,
    createModal: false,
  };

  addItem = data => {
    const param = {
      quickuuid: 'sj_itms_dingtaskConfige',
      params: data ? { entityUuid: data.record.UUID } : {},
      showPageNow: data ? 'update' : 'create',
    };
    this.setState({ param });
    this.newPretypeModalRef.show();
  };

  drawcell = e => {
    if (e.column.fieldName == 'DISPATCHCENTERNAME') {
      const component = <a onClick={() => this.addItem(e)}>{e.record.DISPATCHCENTERNAME}</a>;
      e.component = component;
    }
  };

  drawToolsButton = () => {
    return (
      <Popconfirm
        title="你确定要删除所选中的内容吗?"
        onConfirm={() => this.onBatchDelete()}
        okText="确定"
        cancelText="取消"
      >
        <Button>删除</Button>
      </Popconfirm>
    );
  };

  /**
   * 单一删除
   */
  deleteById = (record, paramsData) => {
    var val = record['UUID'];
    var params = {
      tableName: 'sj_itms_dingtaskConfige',
      condition: { params: [{ field: 'UUID', rule: 'eq', val: [val] }] },
      deleteAll: 'false',
    };
    paramsData.push(params);
  };

  /**
   * 绘制右上角按钮
   */
  drawActionButton = () => {
    //额外的菜单选项
    const menus = [];
    menus.push({
      // disabled: !havePermission(STORE_RES.CREATE), //权限认证
      name: '测试', //功能名称
      onClick: this.test, //功能实现
    });
    return (
      <div>
        <Button onClick={() => this.addItem()} type="primary" icon="plus">
          新建
        </Button>
        <CreatePageModal
          modal={{
            title: '钉钉推送配置',
            width: 500,
            bodyStyle: { marginRight: '40px' },
            afterClose: () => {
              this.onSearch();
            },
          }}
          page={this.state.param}
          onRef={node => (this.newPretypeModalRef = node)}
        />
      </div>
    );
  };
}
