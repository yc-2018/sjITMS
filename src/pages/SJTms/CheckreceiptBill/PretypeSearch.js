/*
 * @Author: Liaorongchang
 * @Date: 2022-04-16 11:36:01
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-04-16 17:16:06
 * @version: 1.0
 */

import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { dynamicDelete } from '@/services/quick/Quick';
import { Button, Popconfirm, message } from 'antd';
import { log } from 'lodash-decorators/utils';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
export default class PretypeSearch extends QuickFormSearchPage {
  //需要操作列的显示 将noActionCol设置为false
  state = { ...this.state, noActionCol: false, isShow: false, canDragTable: true };

  onCreate = () => {
    this.props.memberModalClick();
  };

  onBack = () => {
    this.props.switchTab('query');
  };

  onPretypeUpdate = record => {
    this.props.updatePretypeModalClick(record);
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
      <span>
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
    //额外的菜单选项
    const menus = [];
    menus.push({
      // disabled: !havePermission(STORE_RES.CREATE), //权限认证
      name: '测试', //功能名称
      onClick: this.test, //功能实现
    });
    return (
      <div>
        <Button onClick={this.onCreate.bind()} type="primary" icon="plus">
          新建
        </Button>
        <Button onClick={this.onBack.bind()}>返回</Button>
      </div>
    );
  };
}
