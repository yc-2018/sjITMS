/*
 * @Author: Liaorongchang
 * @Date: 2022-03-10 11:29:17
 * @LastEditors: Liaorongchang
 * @LastEditTime: 2023-06-27 09:00:19
 * @version: 1.0
 */
import React from 'react';
import { Button, Popconfirm, message, Modal, Form } from 'antd';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { addNearStore, audits, cancelAudits } from '@/services/sjitms/Jmlcost';
import { SimpleAutoComplete } from '@/pages/Component/RapidDevelopment/CommonComponent';
import moment from 'moment';
import { loginOrg, loginUser, loginCompany } from '@/utils/LoginContext';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
@Form.create()
export default class JmlCostOrderSearch extends QuickFormSearchPage {
  state = {
    ...this.state,
    showAuditPop: false,
    showCancelPop: false,
    uploadModal: false,
    showRemovePop: false,
    dispatchCenter: '',
    showUpdateWaven: false,
    handUpdateReview: false,
    changeData: [],
  };

  onUpload = () => {
    this.props.switchTab('import');
  };

  defaultSearch = () => {
    //默认查询
    let ex = this.state.queryConfigColumns.filter(item => {
      return item.searchDefVal != null && item.searchDefVal != '';
    });
    let defaultSearch = [];
    let exSearchFilter;
    for (const item of ex) {
      if (item.fieldType == 'Date') {
        let days = parseInt(item.searchDefVal);
        if (days != days) days = 0;
        let endDate = moment(new Date()).format('YYYY-MM-DD');
        let startDate = moment(new Date())
          .add(-item.searchDefVal, 'days')
          .format('YYYY-MM-DD');
        exSearchFilter = {
          field: item.fieldName,
          type: item.fieldType,
          rule: item.searchCondition,
          val: `${startDate}||${endDate}`,
        };
      } else if (item.fieldType == 'DateTime') {
        let days = parseInt(item.searchDefVal);
        if (days != days) days = 0;
        let endDate = moment(new Date()).format('YYYY-MM-DD 23:59:59');
        let startDate = moment(new Date())
          .add(-item.searchDefVal, 'days')
          .format('YYYY-MM-DD 00:00:00');
        exSearchFilter = {
          field: item.fieldName,
          type: item.fieldType,
          rule: item.searchCondition,
          val: `${startDate}||${endDate}`,
        };
      } else {
        exSearchFilter = {
          field: item.fieldName,
          type: item.fieldType,
          rule: item.searchCondition,
          val: item.searchDefVal,
        };
      }
      defaultSearch.push(exSearchFilter);
    }
    //暂时通过这种方式赋予默认值
    // defaultSearch.push({
    //   field: 'WAVENUM',
    //   type: 'VARCHAR',
    //   rule: 'eq',
    //   val: moment(new Date()).format('YYMMDD') + '0001',
    // });
    return defaultSearch;
  };
  // drawcell = e => {
  //   debugger;
  //   console.log("a",e);
  //   const column = e.column;
  //   const record = e.record;
  //   const fieldName = column.fieldName;

  //   if (fieldName == 'REALCARTONCOUNT') {
  //     const component = (
  //       <Input
  //         className={e.record.ROW_ID + 'REALCARTONCOUNT'}
  //         step={0.01}
  //         style={{ width: 100 }}
  //         onFocus={() => {
  //           document.getElementsByClassName(e.record.ROW_ID + 'REALCARTONCOUNT')[0].select();
  //         }}
  //         onChange={event => this.onChange(record, column.fieldName, event.target.value)}
  //         min={0}
  //         defaultValue={record.REALCARTONCOUNT}
  //       />
  //     );
  //     e.component = component;
  //   }
  //   if (fieldName == 'REALCONTAINERCOUNT') {
  //     const component = (
  //       <Input
  //         className={e.record.ROW_ID + 'REALCONTAINERCOUNT'}
  //         onFocus={() => {
  //           document.getElementsByClassName(e.record.ROW_ID + 'REALCONTAINERCOUNT')[0].select();
  //         }}
  //         min={0}
  //         defaultValue={record.REALCONTAINERCOUNT}
  //         style={{ width: 100 }}
  //         onChange={event => this.onChange(record, column.fieldName, Number(event.target.value))}
  //       />
  //     );
  //     e.component = component;
  //   }
  // };

  handleRemove = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length <= 0) {
      message.error('请先选择排车单！');
      return;
    }
    this.setState({ showRemovePop: true });
  };
  handleUpdate = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length <= 0) {
      message.error('至少选择一条数据！');
      return;
    }
    this.setState({ showUpdateWaven: true });
  };

  handUpdateReview = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length != 1) {
      message.error('请选择一条数据！');
      return;
    }
    this.setState({
      handUpdateReview: true,
      Carton: selectedRows[0].REALCARTONCOUNT,
      Container: selectedRows[0].REALCONTAINERCOUNT,
      scattered: selectedRows[0].REALSCATTEREDCOUNT,
    });
  };

  // drawRightClickMenus = () => {
  //   return (
  //     <Menu>
  //       <Menu.Item
  //         key="1"
  //         hidden={!havePermission(this.state.authority + '.remove')}
  //         onClick={() => this.handleRemove()}
  //       >
  //         转仓
  //       </Menu.Item>
  //     </Menu>
  //   );
  // };

  audits = async () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.error('请选中一条记录');
      return;
    }
    let flag = false;
    const errordata = [];
    selectedRows.map(e => {
      if (e.ADJOININGSTORECODENAME == '' || e.ADJOININGSTORECODENAME == '[]') {
        errordata.push(
          '排车单：' + e.BILLNUMBER + ' 门店：' + e.DELIVERYPOINTCODENAME + ' 没有设置邻近门店！'
        );
        flag = true;
        return;
      }
    });
    if (flag) {
      message.error(errordata[0]);
      return;
    }
    const reslut = await audits(selectedRows.map(e => e.COSTUUID));
    if (reslut.success) {
      message.success('审核成功！');
      this.setState({ uploadModal: false });
      this.onSearch();
    }
  };

  cancelAudits = async () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.error('请选中一条记录');
      return;
    }
    const reslut = await cancelAudits(selectedRows.map(e => e.COSTUUID));

    if (reslut.success) {
      message.success('取消审核成功！');
      this.setState({ uploadModal: false });
      this.onSearch();
    }
  };
  addNearStore = async () => {
    const { selectedRows, NearStore } = this.state;
    if (!NearStore) {
      message.error('请选择门店');
      return;
    }

    const params = selectedRows.map(e => {
      return {
        orderUuid: e.UUID,
        scheduleBillnumber: e.BILLNUMBER,
      };
    });
    const result = await addNearStore(loginCompany().uuid, loginOrg().uuid, NearStore, params);
    if (result.success) {
      message.success('保存成功！');
      this.setState({ uploadModal: false });
      this.onSearch();
    }
  };
  handChanges = e => {
    this.setState({ NearStore: e.target.value });
  };

  handNearStore = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.error('请选中条记录');
      return;
    }
    this.setState({ uploadModal: true });
  };
  drawToolsButton = () => {
    const { getFieldDecorator } = this.props.form;
    const { uploadModal } = this.state;
    return (
      <>
        <Popconfirm
          placement="top"
          title={'确认审核？'}
          onConfirm={() => this.audits()}
          okText="是"
          cancelText="否"
        >
          <Button type="primary">审核</Button>
        </Popconfirm>
        <Popconfirm
          placement="top"
          title={'确认取消审核？'}
          onConfirm={() => this.cancelAudits()}
          okText="是"
          cancelText="否"
        >
          <Button type="primary">取消审核</Button>
        </Popconfirm>
        <Button onClick={() => this.handNearStore()} type="primary">
          添加邻近门店
        </Button>
        <Button
          onClick={() => {
            this.props.switchTab('import');
          }}
        >
          导入邻近门店
        </Button>
        <Modal
          visible={uploadModal}
          onOk={() => this.addNearStore()}
          onCancel={() => this.setState({ uploadModal: false })}
        >
          <Form>
            <Form.Item label="门店：" labelCol={{ span: 6 }} wrapperCol={{ span: 15 }}>
              {getFieldDecorator('NearStore', {
                rules: [{ required: true, message: '请选择门店' }],
              })(
                <SimpleAutoComplete
                  autoComplete
                  showSearch
                  placeholder=""
                  textField="[%CODE%]%NAME%"
                  valueField="CODE"
                  searchField="CODE"
                  //value={this.state.lineSystemValue}
                  queryParams={{
                    tableName: 'SJ_ITMS_SHIP_ADDRESS',
                    isCache: 'false',
                    condition: {
                      params: [
                        { field: 'COMPANYUUID', rule: 'eq', val: [loginCompany().uuid] },
                        { field: 'DISPATCHCENTERUUID', rule: 'eq', val: [loginOrg().uuid] },
                      ],
                    },
                  }}
                  onChange={e => this.setState({ NearStore: e })}
                  noRecord
                  style={{ width: 200 }}
                  allowClear={true}
                />
              )}
            </Form.Item>
          </Form>
        </Modal>
      </>
    );
  };

  //该方法用于写最上层的按钮 多个按钮用<span>包裹
  // drawTopButton = () => {
  //   return (
  //     <span>
  //       <Button
  //         hidden={!havePermission(this.state.authority + '.import')}
  //         type="primary"
  //         onClick={this.onUpload}
  //       >
  //         导入
  //       </Button>
  //     </span>
  //   );
  // };

  /**
   * 编辑界面
   */
  onUpdate = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length !== 0 && selectedRows[0].STAT === 'Saved') {
      const { onlFormField } = this.props;
      var field = onlFormField[0].onlFormFields.find(x => x.dbIsKey)?.dbFieldName;
      this.props.switchTab('update', {
        entityUuid: selectedRows[0][field],
      });
    } else {
      message.error('请至少选中一条数据或该单据状态不是保存状态，不能修改');
    }
  };

  drawcell = e => {};
}
