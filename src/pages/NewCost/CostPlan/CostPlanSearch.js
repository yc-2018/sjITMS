import React, { PureComponent } from 'react';
import { Form, Button, Modal, message, Checkbox } from 'antd';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import { SimpleAutoComplete } from '@/pages/Component/RapidDevelopment/CommonComponent';
import { dynamicQuery } from '@/services/quick/Quick';
import CostProjectCreate from '../CostProject/CostProjectCreate';
import CreatePageModal from '@/pages/Component/RapidDevelopment/OnlForm/QuickCreatePageModal';
@connect(({ quick, deliveredConfirm, loading }) => ({
  quick,
  deliveredConfirm,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
@Form.create()
export default class CostPlanSearch extends QuickFormSearchPage {
  constructor(props) {
    super(props);
    props.onRef && props.onRef(this);
  }
  state = {
    ...this.state,
    isNotHd: true,
    visible: false,
    itemValue: '',
    itemValues: [],
    canDragTable: true,
    scrollValue: {
      y: 'calc(400vh)',
    },
    tableHeight: '80%',
    addItemVisible: false,
    param: {},
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.param?.code !== nextProps.param?.code) {
      this.handleOks(nextProps.param.code);
    }
  }

  delItem = () => {
    const { selectedRows, data } = this.state;
    if (selectedRows.length == 0) {
      message.info('请选择数据');
    }
    data.list.forEach((element, index) => {
      selectedRows.forEach(e => {
        if (e.UUID == element.UUID) {
          data.list.splice(index, 1);
        }
      });
      //排序
      data.list.forEach((element, index) => {
        element.CALC_SORT = index + 1;
      });
    });
    this.setState({ data });
  };

  addItem = data => {
    const param = {
      quickuuid: 'cost_project',
      params: data ? { entityUuid: data.record.UUID } : {},
      showPageNow: data ? 'update' : 'create',
    };
    this.setState({ param });
    this.createPageModalRef.show();
  };

  saveItem = data => {
    this.handleOks(data.CODE);
    this.createPageModalRef.hide();
  };

  drawcell = e => {
    //找到fieldName为CODE这一列 更改它的component
    if (e.column.fieldName == 'ITEM_NAME') {
      const component = <a onClick={() => this.addItem(e)}>{e.record.ITEM_NAME}</a>;
      e.component = component;
    }
    if (e.column.fieldName == 'UNSHOW_IN_BILL') {
      const component = (
        <Checkbox
          defaultChecked={e.val == '<空>' ? false : e.val}
          onChange={v => {
            e.record.UNSHOW_IN_BILL = v.target.checked ? 1 : 0;
          }}
        />
      );
      e.component = component;
    }
    if (e.column.fieldName == 'ALLOW_UPDATE') {
      const component = (
        <Checkbox
          defaultChecked={e.val == '<空>' ? false : e.val}
          onChange={v => {
            e.record.ALLOW_UPDATE = v.target.checked ? 1 : 0;
          }}
        />
      );
      e.component = component;
    }
  };

  handleOks = async code => {
    const params = {
      tableName: 'COST_PROJECT',
      condition: {
        params: [{ field: 'UUID', rule: 'in', val: this.state.itemValue.split(',') }],
      },
    };
    if (code) {
      params.condition.params[0] = { field: 'CODE', rule: 'eq', val: [code] };
    }
    let result = await dynamicQuery(params, 'tsbms');
    let { data } = this.state;
    result = result.result?.records;
    for (const e of result) {
      const item = data?.list?.filter(f => f.UUID == e.UUID);
      if (!code || (code && item.length == 0)) {
        if (item?.length > 0) {
          message.info('项目已经存在!,请勿重复添加');
          return;
        }
      }
    }
    result.reverse().forEach(e => {
      if (data.list == undefined || data.list.length == 0) {
        e.CALC_SORT = 1;
        data.list = [e];
      } else {
        const item = data?.list?.filter(f => f.UUID == e.UUID);
        if (code && item && item.length > 0) {
          e.CALC_SORT = item[0].CALC_SORT;
          data.list.splice(item[0].CALC_SORT - 1, 1, e);
        } else {
          e.CALC_SORT =
            data.list.map(g => g.CALC_SORT).sort((a, b) => {
              return b - a;
            })[0] + 1;
          data.list.push(e);
        }
      }
    });
    this.setState({ data, visible: false });
  };

  //拖拽
  drapTableChange = e => {
    let { data } = this.state;
    let i = 1;
    e.forEach(itme => {
      itme.CALC_SORT = i++;
    });
    data.list = e;
    this.setState({ data });
  };
  //扩展最上层按钮
  //该方法会覆盖所有的上层按钮
  drawActionButton = () => {
    const { getFieldDecorator } = this.props.form;
    return (
      <>
        <Modal
          title="添加项目"
          visible={this.state.visible}
          onOk={() => this.handleOks()}
          onCancel={() => this.setState({ visible: false })}
          destroyOnClose
        >
          <Form>
            <Form.Item label="分类">
              {getFieldDecorator('CLASSIFY', {})(
                <SimpleAutoComplete
                  showSearch
                  placeholder=""
                  dictCode="CLASSIFY"
                  onChange={e => this.setState({ classify: e.value })}
                />
              )}
            </Form.Item>
            <Form.Item label="项目名称">
              {getFieldDecorator('UUID', {})(
                <SimpleAutoComplete
                  showSearch
                  placeholder=""
                  textField="[%CLASSIFY%]%ITEM_NAME%"
                  valueField="UUID"
                  searchField="ITEM_NAME"
                  mode="multiple"
                  DataSource="tsbms"
                  queryParams={{
                    tableName: 'COST_PROJECT',
                    condition: {
                      params: [
                        { field: 'COMPANYUUID', rule: 'eq', val: [loginCompany().uuid] },
                        { field: 'DISPATCHCENTERUUID', rule: 'like', val: [loginOrg().uuid] },
                        { field: 'CLASSIFY', rule: 'eq', val: [this.state.classify] },
                      ],
                    },
                  }}
                  onChange={e => this.setState({ itemValue: e })}
                  noRecord
                  // autoComplete
                  allowClear={true}
                />
              )}
            </Form.Item>
          </Form>
        </Modal>
        <CreatePageModal
          modal={{ title: '新建/编辑计费项目', width: '90%' }}
          page={this.state.param}
          onSaved={this.saveItem}
          customPage={CostProjectCreate}
          onRef={node => (this.createPageModalRef = node)}
        />
      </>
    );
  };

  //该方法会覆盖所有的中间功能按钮
  drawToolbarPanel = () => {
    //console.log("props",this.props);
    return (
      <div style={{ margin: '10px 0 10px 0' }}>
        <Button type="primary" onClick={() => this.setState({ visible: !this.state.visible })}>
          添加项目
        </Button>
        <Button type="primary" onClick={() => this.addItem()} style={{ marginLeft: 10 }}>
          新建并添加项目
        </Button>
        <Button onClick={() => this.delItem()} style={{ marginLeft: 10 }}>
          删除
        </Button>
      </div>
    );
  };

  // 该方法会覆盖所有的搜索查询;
  drawSearchPanel = () => {};

  drawTopButton = () => {};

  exSearchFilter = () => {
    const { planUuid } = this.props;
    return [
      {
        field: 'PLAN_UUID',
        type: 'VarChar',
        rule: 'eq',
        val: planUuid,
      },
    ];
  };
}
