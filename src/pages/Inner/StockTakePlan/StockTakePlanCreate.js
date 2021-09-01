import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import {
  message, Form, Input, Col, DatePicker, InputNumber, Radio, Select, Row, Checkbox
} from 'antd';
import { CONFIRM_LEAVE_ACTION } from '@/utils/constants';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import PickareaSelect from '@/pages/Component/Select/PickareaSelect';
import BinUsageSelect from './BinUsageSelect';
import { binScopePattern } from '@/utils/PatternContants';
import CreatePage from '@/pages/Component/Page/CreatePage';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import { commonLocale, notNullLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { StockTakePlanLocale, StockTakePlanSchema, Type } from './StockTakePlanLocale';
import moment from 'moment';
import { parse } from 'qs';
import BinSelect from '@/pages/Component/Select/BinSelect';
import { binUsage } from '@/utils/BinUsage';

const FormItem = Form.Item;

const Option = Select.Option;
const typeOptions = [];
Object.keys(Type).forEach(function (key) {
  typeOptions.push(<Option value={Type[key].name} key={Type[key].name}>{Type[key].caption}</Option>);
});

@connect(({ stockTakePlanBill, loading }) => ({
  stockTakePlanBill,
  loading: loading.models.stockTakePlanBill,
}))
@Form.create()
export default class StockTakePlanCreate extends CreatePage {
  constructor(props) {
    super(props);

    this.state = {
      title: commonLocale.createLocale + StockTakePlanLocale.title,
      currentView: CONFIRM_LEAVE_ACTION.NEW,
      entity: {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid
      },
      existStockChecked: false,
      spinning: false,
      conditionDisabled: props && props.stockTakePlanBill && props.stockTakePlanBill.entity && props.stockTakePlanBill.billNumber ? props.stockTakePlanBill.entity.splitBasic === 'MAX_BILL_COUNT' : false,
    }
    this.refreshConditionInfo.bind(this);
  }

  componentDidMount() {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.stockTakePlanBill.entity && nextProps.stockTakePlanBill.billNumber) {
      this.setState({
        entity: nextProps.stockTakePlanBill.entity,
        title: nextProps.stockTakePlanBill.entity.billNumber,
        existStockChecked: nextProps.stockTakePlanBill.entity.existStock
      });
    }
    if (nextProps.stockTakePlanBill.entity && this.props.stockTakePlanBill && this.props.stockTakePlanBill.billNumber && !this.props.stockTakePlanBill.entity.uuid) {
      this.setState({
        conditionDisabled: nextProps.stockTakePlanBill.entity.splitBasic === 'MAX_BILL_COUNT',
      })
    }
  }

  refresh = () => {
    let billNumber = this.props.stockTakePlanBill.billNumber;
    if (billNumber) {
      this.setState({
        currentView: CONFIRM_LEAVE_ACTION.EDIT
      })

      this.props.dispatch({
        type: 'stockTakePlanBill/getByBillNumber',
        payload: {
          billNumber: billNumber,
          dcUuid: loginOrg().uuid,
        }
      });
    }
  }

  onSave = (data) => {
    this.onCreate(data, true)
  }

  onSaveAndCreate = (data) => {
    this.onCreate(data, false);
  }

  onCreate = (data, isGoDetail) => {
    const { entity } = this.state;
    const { form, dispatch } = this.props;
    const param = { ...entity };
    param.companyUuid = loginCompany().uuid;
    param.dcUuid = loginOrg().uuid;
    param.owner = JSON.parse(data.owner);
    param.type = data.type;
    param.virtualityBin = data.virtualityBin;
    param.stockTakeMethod = data.stockTakeMethod;
    param.stockTakeSchema = data.stockTakeSchema;
    param.binScope = data.binScope;
    param.changeTimes = data.changeTimes;
    param.articleScope = data.articleScope;
    if (param.articleScope && param.articleScope.length > 100) {
      message.error("商品范围最大长度100");
      return;
    }
    param.maxCount = data.maxCount;
    param.splitBasic = data.splitBasic;
    param.existStock = this.state.existStockChecked;
    param.pickAreas = [];
    if (data.pickAreas) {
      data.pickAreas.forEach(pickArea => {
        param.pickAreas.push(JSON.parse(pickArea));
      });
    }
    param.binUsages = data.binUsages;
    param.note = data.note;

    if (data.conditionParam) {
      param.byBinUsage = data.conditionParam.indexOf("byBinUsage") > -1;
      param.byPickArea = data.conditionParam.indexOf("byPickArea") > -1;
      param.byZone = data.conditionParam.indexOf("byZone") > -1;
      param.byPath = data.conditionParam.indexOf("byPath") > -1;
    }
    param.startDate = data.startDate ? moment(moment(data.startDate).format('YYYY-MM-DD')).format('YYYY-MM-DD HH:mm:ss') : null;
    if (!param.binScope && !param.startDate && !param.binUsages && (!param.pickAreas || param.pickAreas.length === 0) && !param.articleScope) {
      message.warning("货位范围、起始日期、货位用途、拣货分区和商品范围不能同时为空");
      return;
    }

    let type = 'stockTakePlanBill/add';
    if (entity.uuid) {
      type = 'stockTakePlanBill/modify';
    }
    dispatch({
      type: type,
      payload: param,
      callback: response => {
        if (response && response.success) {
          let billNumber;
          if (entity.billNumber) {
            message.success(commonLocale.modifySuccessLocale);
            billNumber = entity.billNumber;
          } else {
            message.success(commonLocale.saveSuccessLocale);
            billNumber = response.data;
          }
          this.setState({
            entity: {
              companyUuid: loginCompany().uuid,
              dcUuid: loginOrg().uuid
            },
            index: 0
          });
          this.props.form.resetFields();
          if (isGoDetail) {
            this.onView(billNumber);
          }
        }
      },
    });
  }

  onView = (billNumber) => {
    this.props.dispatch({
      type: 'stockTakePlanBill/showPage',
      payload: {
        showPage: 'view',
        billNumber: billNumber
      }
    });
  }

  onCancel = () => {
    const payload = {
      showPage: 'query'
    }
    this.props.dispatch({
      type: 'stockTakePlanBill/showPage',
      payload: {
        ...payload
      }
    });
  }

  drawBasicInfoCols = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity } = this.state;

    return [
      <CFormItem key='stockTakeSchema' label={StockTakePlanLocale.schema}>
        {getFieldDecorator('stockTakeSchema', {
          initialValue: entity && entity.uuid ? entity.stockTakeSchema : StockTakePlanLocale.BRIGHT_TAKE
        })(<Radio.Group>
          <Radio value={StockTakePlanLocale.BRIGHT_TAKE}>{StockTakePlanLocale.brightTake}</Radio>
          <Radio value={StockTakePlanLocale.BLIND_TAKE}>{StockTakePlanLocale.blindTake}</Radio>
        </Radio.Group>
        )}
      </CFormItem>,
      <CFormItem key='stockTakeMethod' label={StockTakePlanLocale.operateMehthod}>
        {getFieldDecorator('stockTakeMethod', {
          initialValue: entity && entity.uuid ? entity.stockTakeMethod : 'RF'
        })(
          <Radio.Group >
            <Radio value={'RF'}>{StockTakePlanLocale.handTerminal}</Radio>
            <Radio value={'MANUAL'}>{StockTakePlanLocale.manualBill}</Radio>
          </Radio.Group>
        )}
      </CFormItem>,
      <CFormItem key='owner' label={StockTakePlanLocale.owner}>
        {getFieldDecorator('owner', {
          initialValue: entity && entity.owner ? JSON.stringify(entity.owner) : undefined,
          rules: [{
            required: true,
            message: '' + formatMessage({ id: 'stockTakePlan.owner.message.notNull' })
          }],
        })(<OwnerSelect onlyOnline placeholder={placeholderChooseLocale(commonLocale.inOwnerLocale)} />)}
      </CFormItem>,
      <CFormItem key='type' label={StockTakePlanLocale.type} labelSpan={10}>
        {getFieldDecorator('type', {
          initialValue: entity && entity.type ? entity.type : undefined,
          rules: [{
            required: true, message: notNullLocale(StockTakePlanLocale.type)
          }],
        })(<Select onChange={this.handleType} placeholder={placeholderChooseLocale(StockTakePlanLocale.type)}>{typeOptions}</Select>)}
      </CFormItem>,
      entity.type && Type.VIRTUALITY_STOCK.name === Type[entity.type].name && <CFormItem key='virtualityBin' label={StockTakePlanLocale.virtualityBin}>
        {getFieldDecorator('virtualityBin', {
          initialValue: entity.virtualityBin,
          rules: [{
            required: true, message: notNullLocale(StockTakePlanLocale.virtualityBin)
          }],
        })(<BinSelect
          placeholder={placeholderChooseLocale(StockTakePlanLocale.virtualityBin)}
          usage={binUsage.Virtuality.name}
        />)}
      </CFormItem>
    ];
  }

  handleType = (value) => {
    const { entity } = this.state;

    entity.type = value;

    this.setState({
      entity: entity
    })
  }

  existStockChange = () => {
    this.setState({
      existStockChecked: !this.state.existStockChecked
    })
  }

  drawScopeCols = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity } = this.state;

    function convertPickArea(entity) {
      let result = [];
      entity.pickAreas.forEach(pickArea => {
        result.push(JSON.stringify(pickArea));
      });
      return result;
    }

    return [
      <CFormItem key='pickAreaScope' label={formatMessage({ id: 'stockTakePlan.conditionInfo.byPickArea' })}>
        {getFieldDecorator('pickAreas', {
          initialValue: entity && entity.uuid ? (() => {
            let result = [];
            if (entity.pickAreas) {
              entity.pickAreas.forEach(pickArea => {
                result.push(JSON.stringify(pickArea));
              });
              return result;
            }
          })() : []
        })
          (<PickareaSelect multiple={true} placeholder={placeholderChooseLocale(StockTakePlanLocale.pickArea)} />)}
      </CFormItem>,
      <CFormItem key='binUsages' label={'' + formatMessage({ id: 'common.binUsage' })}>
        {getFieldDecorator('binUsages', {
          initialValue: entity && entity.uuid ? entity.binUsages : []
        })
          (<BinUsageSelect mode="multiple" placeholder={placeholderChooseLocale(StockTakePlanLocale.binUsage)} />)}
      </CFormItem>,
      <CFormItem
        key='binScope'
        label={formatMessage({ id: 'common.binScope' })}

      >
        {getFieldDecorator('binScope', {
          initialValue: entity && entity.uuid ? entity.binScope : '',
          rules: [{
            pattern: binScopePattern.pattern,
            message: binScopePattern.message
          }, {
            max: 100
          }
          ]
        })(<Input placeholder={placeholderLocale(StockTakePlanLocale.binScope)} />)}
      </CFormItem>,
      <CFormItem
        key='changeTimes'
        label={'' + formatMessage({ id: 'stockTakePlan.change' })}
        labelSpan={10}
      >
        {getFieldDecorator('changeTimes',
          {
            initialValue: entity ? entity.changeTimes : ''
          })(<InputNumber precision={0} min={0} max={2147483647} style={{width:'40%'}} placeholder={formatMessage({ id: 'stockTakePlan.changeTimes' })} />
          )}
        {getFieldDecorator('startDate',
          {
            initialValue: entity && entity.startDate ? moment(entity.startDate) : undefined
          })(
            <DatePicker placeholder={formatMessage({ id: 'stockTakePlan.startDate' })} style={{width:'60%'}} disabledDate={(current) => { return current && current.valueOf() > Date.now() }} />
          )}
      </CFormItem>,
      <CFormItem
        key='articleScope'
        label={formatMessage({ id: 'stockTakePlan.articleScope' })}
      >
        {
          getFieldDecorator('articleScope', {
            initialValue: entity && entity.uuid ? entity.articleScope : '',
            rules: [{
              pattern: StockTakePlanLocale.pattern,
              message: StockTakePlanLocale.message
            }]
          })(<Input placeholder={placeholderLocale(StockTakePlanLocale.articleScope)} />)
        }
      </CFormItem >,
      <CFormItem
        key='existStock'
        label={formatMessage({ id: 'stockTakePlan.existStock' })}
      >
        <Checkbox checked={this.state.existStockChecked} onChange={this.existStockChange} />
      </CFormItem >
    ];
  }


  refreshConditionInfo = (value) => {
    let b = (value == "MAX_BILL_COUNT");
    let entity = this.state.entity;
    this.props.form.setFieldsValue({ conditionParam: [] });
    this.setState({
      conditionDisabled: b,
      entity: {
        ...entity,
        byBinUsage: !b,
        byPath: !b,
        byPickArea: !b,
        byZone: !b
      },
    })
  }
  drawConditionCols = () => {
    const { getFieldDecorator } = this.props.form;
    const { entity } = this.state;


    return [
      <CFormItem key='splitBasic' label={'' + formatMessage({ id: 'stockTakePlan.splitCondition' })}>
        <Row gutter={0}>
          <Col span={14}>
            {getFieldDecorator('splitBasic', {
              initialValue: entity && entity.splitBasic ? entity.splitBasic : 'MAX_BIN_COUNT',
              rules: [{
                required: true,
                message: '' + formatMessage({ id: 'stockTakePlan.splitCondition.message.notNull' })
              }],
            })(<Select style={{
              width: '100%'
            }} onChange={this.refreshConditionInfo}>
              <Select.Option value="MAX_BILL_COUNT"> {formatMessage({ id: 'stockTakePlan.maxBillCount' })}</Select.Option>
              <Select.Option value="MAX_BIN_COUNT">{formatMessage({ id: 'stockTakePlan.maxBinCount' })}</Select.Option>
            </Select>
            )}
          </Col>
          <Col span={10}>
            <FormItem>
              {
                getFieldDecorator('maxCount', {
                  initialValue: entity && entity.maxCount ? entity.maxCount : 50,
                  rules: [{
                    required: true,
                    message: '' + formatMessage({ id: 'stockTakePlan.maxBinCount.message.notNull' })
                  }],
                })(<InputNumber style={{ width: '100%' }} precision={0} min={1} max={2147483647} />
                )
              }
            </FormItem>
          </Col>
        </Row>
      </CFormItem >,

      <CFormItem key='conditionInfo' label={StockTakePlanLocale.conditionInfo}>
        {getFieldDecorator('conditionParam', {
          initialValue: entity && entity.uuid ? (() => {
            let result = [];
            if (entity.byBinUsage)
              result.push("byBinUsage");
            if (entity.byPickArea)
              result.push("byPickArea");
            if (entity.byPath)
              result.push("byPath");
            if (entity.byZone)
              result.push("byZone");
            return result;
          })() : [],
          rules: [{
            required: !this.state.conditionDisabled,
            message: '' + formatMessage({ id: 'stockTakePlan.conditionInfo.message.notNull' })
          }],
        })(<Select mode="multiple" disabled={this.state.conditionDisabled} placeholder={placeholderChooseLocale(StockTakePlanLocale.conditionInfo)}>
          <Select.Option value="byBinUsage">{formatMessage({ id: 'stockTakePlan.conditionInfo.byBinUsage' })}</Select.Option>
          <Select.Option value="byPickArea">{formatMessage({ id: 'stockTakePlan.conditionInfo.byPickArea' })}</Select.Option>
          <Select.Option value="byZone">{formatMessage({ id: 'stockTakePlan.conditionInfo.byZone' })}</Select.Option>
          <Select.Option value="byPath">{formatMessage({ id: 'stockTakePlan.conditionInfo.byPath' })}</Select.Option>
        </Select>
        )}
      </CFormItem>]
  }

  drawFormItems = () => {

    const { entity } = this.state;
    let panels = [
      <FormPanel key="basicInfo" title={commonLocale.basicInfoLocale} cols={this.drawBasicInfoCols()} noteCol={this.drawNotePanel()} noteLabelSpan={4} />,
      <FormPanel key="scopeInfo" title={StockTakePlanLocale.scopeInfo} cols={this.drawScopeCols()} />,
      <FormPanel key="conditionInfo" title={StockTakePlanLocale.conditionInfo} cols={this.drawConditionCols()} />,
    ];

    return panels;
  }
}
