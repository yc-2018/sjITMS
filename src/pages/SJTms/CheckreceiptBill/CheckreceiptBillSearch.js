/*
 * @Author: Liaorongchang
 * @Date: 2022-04-01 15:58:47
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2022-04-19 09:32:57
 * @version: 1.0
 */
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import OperateCol from '@/pages/Component/Form/OperateCol';
import { Checkbox, Select, Input, Button, Popconfirm, message } from 'antd';
import { loginCompany } from '@/utils/LoginContext';
import { dynamicQuery, saveFormData } from '@/services/quick/Quick';
import { confirm } from '@/services/sjitms/Checkreceipt';

const { Option } = Select;
@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
export default class CheckreceiptBillSearch extends QuickFormSearchPage {
  //需要操作列的显示 将noActionCol设置为false
  state = { ...this.state, noActionCol: false, isShow: false, sourceData: [] };

  componentDidMount() {
    this.queryCoulumns();
    this.getCreateConfig();
    this.initOptionsData();
  }

  onType = () => {
    this.props.switchTab('view');
  };

  onCheckreceiptSave = async () => {
    const { selectedRows } = this.state;
    if (selectedRows.length !== 0) {
      let list = [];
      selectedRows.forEach(row => {
        let data = {
          receipted: row.RECEIPTED == '0' ? false : true,
          uuid: row.UUID,
          dealMethod: row.DEALMETHOD,
          note: row.NOTE,
        };
        list.push(data);
      });
      const result = await confirm(list);
      if (result.success) {
        message.success('保存成功');
        this.refreshTable();
      }
    } else {
      message.error('请至少选中一条数据！');
    }
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
        <Button onClick={() => this.onType()}>管理回单处理方式</Button>
      </div>
    );
  };

  initOptionsData = async () => {
    let queryParamsJson = {
      tableName: 'SJ_ITMS_PRETYPE',
      condition: {
        params: [
          { field: 'PRETYPE', rule: 'eq', val: ['DEALMETHOD'] },
          { field: 'COMPANYUUID', rule: 'eq', val: [loginCompany().uuid] },
        ],
      },
    };
    await dynamicQuery(queryParamsJson).then(datas => {
      this.setState({ sourceData: datas.result.records });
    });
  };

  buildOptions = () => {
    const { sourceData } = this.state;
    return sourceData.map(data => {
      return <Select.Option value={data.NAME}>{data.NAME}</Select.Option>;
    });
  };

  //扩展render
  drawcell = e => {
    if (e.column.fieldName == 'RECEIPTED') {
      e.component = (
        <Checkbox
          defaultChecked={e.val == '0' ? false : true}
          key={e.record.UUID}
          onChange={v => (e.record.RECEIPTED = v.target.checked ? 1 : 0)}
        >
          回单
        </Checkbox>
      );
    } else if (e.column.fieldName == 'DEALMETHOD') {
      e.component = (
        <Select style={{ width: 120 }} onChange={v => (e.record.DEALMETHOD = v)}>
          {this.buildOptions()}
        </Select>
      );
    } else if (e.column.fieldName == 'NOTE') {
      e.component = (
        <Input placeholder="请输入备注" onChange={v => (e.record.NOTE = v.target.value)} />
      );
    }
  };

  //该方法用于写中间的功能按钮 多个按钮用<span>包裹
  drawToolsButton = () => {
    return (
      <span>
        <Popconfirm
          title="你确定要保存所选中的内容吗?"
          onConfirm={() => this.onCheckreceiptSave()}
          okText="确定"
          cancelText="取消"
        >
          <Button>保存</Button>
        </Popconfirm>
      </span>
    );
  };

  //该方法用于写操作列的render
  renderOperateCol = record => {
    return <OperateCol menus={this.fetchOperatePropsCommon(record)} />;
  };
  //操作列举例 具体看OperateCol内介绍
  fetchOperatePropsCommon = record => {
    return [
      {
        name: '查看历史',
        onClick: () => this.props.onClose(record),
      },
    ];
  };
}
