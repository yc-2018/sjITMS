import { connect } from 'dva';
import moment from 'moment';
import { Form, Input, Select, InputNumber, message, Radio, Checkbox, Modal, DatePicker, Popconfirm } from 'antd';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import CreatePage from '@/pages/Component/Page/CreatePage';
import FormPanel from '@/pages/Component/Form/FormPanel';
import CFormItem from '@/pages/Component/Form/CFormItem';
import { commonLocale, notNullLocale, tooLongLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { codePattern } from '@/utils/PatternContants';
import { convertCodeName } from '@/utils/utils';
import { billImportLocale } from './BillImportLocale';
import { CONFIRM_LEAVE_ACTION } from '@/utils/constants';
import OwnerSelect from '@/pages/Component/Select/OwnerSelect';
import { BillType } from './BillType';
import BillImportMouldItemEditTable from './BillImportMouldItemEditTable';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import ItemEditTable from './ItemEditTable';

const RadioGroup = Radio.Group;
const Option = Select.Option;
const billTypeOptions = [];
Object.keys(BillType).forEach(function (key) {
    billTypeOptions.push(<Option key={BillType[key].name} value={BillType[key].name}>{BillType[key].caption}</Option>);
});
@connect(({ billImport, loading }) => ({
    billImport,
    loading: loading.models.billImport,
}))
@Form.create()
export default class BillImportMouldCreatePage extends CreatePage {
    constructor(props) {
        super(props);

        this.state = {//设置初始值
            title: commonLocale.createLocale + billImportLocale.title,
            currentView: CONFIRM_LEAVE_ACTION.NEW,
            entity: {
                companyUuid: loginCompany().uuid,
                dcUuid: loginOrg().uuid,
                items: []
            },
            unAddfieldItems: [],
            spinning: false,
            index: 0,
            isRefreshItems: true,
            changeBillType: false,
            selectedRows:[]
        }
    }

    componentDidMount() {
        this.refresh();
    }

    componentWillReceiveProps(nextProps) {
        let entity = nextProps.billImport.data.entity ? nextProps.billImport.data.entity : this.state.entity;
        if (nextProps.billImport.data.entity && this.props.billImport.entityUuid) {
            if (!this.state.entity.billType || (this.state.entity.billType != entity.billType)) {
                this.refreshBillFieldItems(entity.billType);
            }
            this.setState({
                title: convertCodeName(entity)
            });
        }

        if (!this.state.isRefreshItems)
            return;
        this.state.unAddfieldItems = [];
        const { unAddfieldItems } = this.state;
        let fieldItems = nextProps.billImport.fieldItems;
        let mouldItems = [];

        if (fieldItems) {
            fieldItems.forEach(function (item, index) {
                if (!item.notNull && unAddfieldItems.find(function (addItem) {
                    return addItem.billFieldName === item.fieldName;
                }) == undefined) {
                    unAddfieldItems.push({
                        "billFieldName": item.fieldName,
                        "notNull": item.notNull,
                        "fieldType": item.fieldType,
                        "defaultValue": item.defaultValue,
                        "remove": true
                    });
                }
            });

            if (!this.state.changeBillType && nextProps.billImport.data.entity && this.props.billImport.entityUuid &&
                nextProps.billImport.data.entity.items) {
                nextProps.billImport.data.entity.items.forEach(function (entityItem) {
                    entityItem.remove = !entityItem.notNull;
                    mouldItems.push(entityItem);
                });
            } else {
                fieldItems.forEach(function (item, index) {
                    mouldItems.push({
                        "line": index + 1,
                        "billFieldName": item.fieldName,
                        "fileFieldName": item.fieldName,
                        "fieldType": item.fieldType,
                        "defaultValue": item.defaultValue,
                        "notNull": item.notNull,
                        "remove": !item.notNull,
                    });
                });
            }
        }

        entity.items = mouldItems;
        this.setState({
            entity: entity,
            unAddfieldItems: unAddfieldItems
        });
    }

    rowSelection = (selectedRowKeys, selectedRows) => {
      this.setState({
        selectedRows: [...selectedRows],
        selectedRowKeys: [...selectedRowKeys]
      });
    }

    refresh = () => {
        let entityUuid = this.props.billImport.entityUuid;
        if (entityUuid) {
            this.setState({
                currentView: CONFIRM_LEAVE_ACTION.EDIT
            })
            this.props.dispatch({
                type: 'billImport/get',
                payload: entityUuid
            });
        }
    }

    refreshBillFieldItems = (billType) => {
        this.props.dispatch({
            type: 'billImport/getBillFieldItems',
            payload: billType
        });
    }

    onCancel = () => {
        const payload = {
            showPage: 'query'
        }
        this.props.dispatch({
            type: 'billImport/clearFieldItems',
        });
        this.props.dispatch({
            type: 'billImport/showPage',
            payload: {
                ...payload
            }
        });
    }

    onBillTypeChange = (value) => {
        const { entity } = this.state;
        if (!entity.billType || entity.items.length === 0) {
            entity.billType = value;
            this.setState({
                isRefreshItems: true,
                changeBillType: true
            });
            this.refreshBillFieldItems(value);
            return;
        }

        if (entity.billType != value) {

            Modal.confirm({
                title: billImportLocale.billTypeChangeModalMessage,
                okText: commonLocale.confirmLocale,
                cancelText: commonLocale.cancelLocale,
                onOk: () => {
                    entity.billType = value;
                    entity.items = [];
                    this.props.form.setFieldsValue({
                        billType: value
                    });
                    this.setState({
                        entity: { ...entity },
                        isRefreshItems: true,
                        changeBillType: true
                    });
                    this.refreshBillFieldItems(value);
                },
                onCancel: () => {
                    this.props.form.setFieldsValue({
                        billType: entity.billType
                    });
                    this.setState({
                        entity: { ...entity },
                        isRefreshItems: false,
                        changeBillType: false
                    });
                }
            });
        }
    }

    drawBasicInfoCols = () => {
        const { getFieldDecorator } = this.props.form;
        const { entity } = this.state;
        return [
            <CFormItem key='code' label={commonLocale.codeLocale}>
                {getFieldDecorator('code', {
                    initialValue: entity.code,
                    rules: [
                        { required: true, message: notNullLocale(commonLocale.codeLocale) },
                        {
                            pattern: codePattern.pattern,
                            message: codePattern.message,
                        },
                    ]
                })(<Input disabled={entity.uuid ? true : false} placeholder={placeholderLocale(commonLocale.codeLocale)} />)}
            </CFormItem>,

            <CFormItem key='name' label={commonLocale.nameLocale}>
                {getFieldDecorator('name', {
                    initialValue: entity.name,
                    rules: [
                        { required: true, message: notNullLocale(commonLocale.nameLocale) },
                        {
                            max: 30,
                            message: tooLongLocale(commonLocale.nameLocale, 30),
                        },
                    ]
                })(<Input placeholder={placeholderLocale(commonLocale.nameLocale)} />)}
            </CFormItem>,

            <CFormItem label={commonLocale.inOwnerLocale} key='owner'>
                {getFieldDecorator('owner', {
                    initialValue: entity.owner ? JSON.stringify(entity.owner) : undefined,
                    rules: [
                        { required: true, message: notNullLocale(commonLocale.inOwnerLocale) }
                    ],
                })(<OwnerSelect onlyOnline placeholder={placeholderChooseLocale(commonLocale.inOwnerLocale)} />)}
            </CFormItem>,

            <CFormItem label={billImportLocale.billType} key='billType'>
                {getFieldDecorator('billType', {
                    initialValue: entity.billType ? entity.billType : undefined,
                    rules: [
                        { required: true, message: notNullLocale(billImportLocale.billType) }
                    ],
                })(<Select placeholder={placeholderChooseLocale(billImportLocale.billType)} onChange={this.onBillTypeChange} >
                    {billTypeOptions}
                </Select>
                )}
            </CFormItem>

        ];
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

        const newData = this.validData(data);
        if (!newData) {
            return;
        }

        let type = 'billImport/add';
        if (entity.uuid) {
            type = 'billImport/modify';
        }

        this.props.dispatch({
            type: type,
            payload: newData,
            callback: (response) => {
                if (response && response.success) {
                    let uuid;
                    if (entity.uuid) {
                        message.success(commonLocale.modifySuccessLocale);
                        uuid = entity.uuid;
                    } else {
                        message.success(commonLocale.saveSuccessLocale);
                        uuid = response.data;
                    }
                    this.setState({
                        entity: {
                            companyUuid: loginCompany().uuid,
                            dcUuid: loginOrg().uuid,
                            items: [],
                            isRefreshItems: true
                        }
                    });
                    this.props.form.resetFields();
                    if (isGoDetail) {
                        this.onView(uuid);
                    }
                }
            },
        });
    }

    validData = (data) => {
        const { entity } = this.state;

        const newData = { ...entity };
        newData.companyUuid = loginCompany().uuid;
        newData.dcUuid = loginOrg().uuid;
        newData.code = data.code;
        newData.name = data.name;
        newData.owner = JSON.parse(data.owner);
        newData.billType = data.billType;
        newData.note = data.note;

        if (newData.items.length === 0) {
            message.error(notNullLocale(commonLocale.itemsLineLocale));
            return false;
        }

        for (let i = newData.items.length - 1; i >= 0; i--) {
            if (!newData.items[i].billFieldName) {
                message.error(`明细第${newData.items[i].line}行单据字段不能为空！`);
                return false;
            }
        }

        for (let i = 0; i < newData.items.length; i++) {
            if(newData.items[i].fileFieldName===undefined || newData.items[i].fileFieldName.trim()===""){
                message.error(`明细第${newData.items[i].line}行不允许为空！`);
                return false;
            }else{
                for (let j = i + 1; j < newData.items.length; j++) {
                    if (newData.items[i].billFieldName === newData.items[j].billFieldName) {
                        message.error(`明细第${newData.items[i].line}行与第${newData.items[j].line}行单据字段重复！`);
                        return false;
                    }
                    if (newData.items[i].fileFieldName === newData.items[j].fileFieldName) {
                        message.error(`明细第${newData.items[i].line}行与第${newData.items[j].line}行文件列名重复！`);
                        return false;
                    }
                }
            }
        }

        // newData.items.forEach(item=>{
        //     if(item.fieldType === 'date'&&item.defaultValue!=undefined&&item.addDate!=undefined){
        //         item.defaultValue = moment(item.defaultValue).add(item.addDate, 'days').format("YYYY-MM-DD")
        //     }
        // })

        return newData;
    }

    onView = (uuid) => {
        this.props.dispatch({
            type: 'billImport/showPage',
            payload: {
                showPage: 'view',
                entityUuid: uuid
            }
        });
    }

    drawFormItems = () => {

        const { entity } = this.state;
        let panels = [
            <FormPanel key="basicInfo" title={commonLocale.basicInfoLocale} cols={this.drawBasicInfoCols()} />,
        ];

        return panels;
    }

    onFieldChange = (value, field, index) => {
        const { entity, unAddfieldItems } = this.state;
        if (field === 'billFieldName') {
            entity.items[index - 1].billFieldName = value;
            unAddfieldItems.forEach(e => {
                if (value === e.billFieldName) {
                    entity.items[index - 1].notNull;
                }
            });
        } else if (field === 'fileFieldName') {
            entity.items[index - 1].fileFieldName = value;
        } else if (field === 'defaultValue'){
            entity.items[index - 1].defaultValue = value;
        } else if(field === 'addDate'){
            entity.items[index - 1].defaultValue = value;
        }

        this.setState({
            isRefreshItems: false,
            entity: { ...entity }
        });
    };

    getBillFieldNameOptions = () => {
        const options = [];
        const { unAddfieldItems } = this.state;

        unAddfieldItems.forEach(e => {
            options.push(
                <Select.Option key={e.billFieldName} value={e.billFieldName}>
                    {e.billFieldName}
                </Select.Option>
            );
        });
        return options;
    }

    onTableChange=()=>{
        this.setState({
            isRefreshItems: false
        });
    }

    remove = (line) => {
      const { entity, index } = this.state;
      let data = entity.items;
      for (let i = data.length - 1; i >= 0; i--) {
        if (data[i].line === line) {
          data.splice(i, 1);
        }
      }

      for (let i = 0; i < data.length; i++) {
        data[i].line = i + 1;
      }
      entity.items = data;
      this.setState({
        entity: { ...entity },
        index: index + 1
      });
      this.onTableChange();
    };


    drawTable = () => {
        const { entity } = this.state;
        let columns = [
            {
                title: billImportLocale.billFieldName,
                dataIndex: 'billFieldName',
                width: 200,
                render: (text, record) => {
                    if (record.unAdd) {
                        return (
                            <Select
                                value={text}
                                placeholder={placeholderLocale(billImportLocale.billFieldName)}
                                onChange={e => this.onFieldChange(e, 'billFieldName', record.line)}>
                                {
                                    this.getBillFieldNameOptions()
                                }
                            </Select>
                        );
                    } else {
                        return (
                          <div>{text}</div>
                        );
                    }
                }
            },
            {
                title: billImportLocale.notNull,
                dataIndex: 'notNull',
                width: 200,
                render: (text) => {
                    return (
                        <Checkbox disabled={true} checked={text} />
                    );
                }
            },
            {
                title:  '默认值',
                dataIndex: 'defaultValue',
                width: colWidth.codeColWidth,
                render: (text, record) => {
                    if(record.fieldType =='date'){
                        return <div>
                            {/* <DatePicker
                                style={{width:'70%'}}
                                value={text?moment(text, 'YYYY-MM-DD'):undefined}
                                onChange={e => this.onFieldChange(e, 'defaultValue', record.line)}
                            /> */}
                            <InputNumber
                                placeholder={'设置间隔长度'}
                                style={{width:'100%'}}
                                value={record.defaultValue?record.defaultValue:0}
                                min={0}
                                precision={0}
                                onChange={e => this.onFieldChange(e, 'addDate', record.line)}
                            />
                        </div>
                    }else if(record.billFieldName =='商品代码'){
                        return <Input
                            disabled={true}
                            value={text}
                            placeholder={'请设置默认值'}
                        />;
                    }else{
                        return <Input
                            value={text}
                            placeholder={'请设置默认值'}
                            onChange={e => this.onFieldChange(e.target.value, 'defaultValue', record.line)}
                        />;
                    }
                }
            },
            {
                title: billImportLocale.fileFieldName,
                key: 'fileFieldName',
                dataIndex: 'fileFieldName',
                width: colWidth.codeColWidth,
                render: (text, record) => {
                    return (
                        <Input
                            maxLength={255}
                            value={record.fileFieldName}
                            onChange={e => this.onFieldChange(e.target.value, 'fileFieldName', record.line)}
                            placeholder={placeholderLocale(billImportLocale.fileFieldName)}
                        />
                    );
                }
            },
            {
              title: '操作',
              key: 'action',
              // width: itemColWidth.operateColWidth,
              render: (text, record) => {
                if (record.remove) {
                  return (
                    <span>
                                  <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.line)}>
                                      <a>{commonLocale.deleteLocale}</a>
                                  </Popconfirm>
                              </span>
                  );
                }
              },
            }
        ]
        return (
          <div>
            <ItemEditTable
              title={commonLocale.inArticleInfoLocale}
              columns={columns}
              notNote={true}
              data={this.state.entity.items}
              // batchRemove = {this.batchRemove}
              onTableChange={this.onTableChange}
              rowSelection={this.rowSelection}
            />
          </div>
        )
    }

}
