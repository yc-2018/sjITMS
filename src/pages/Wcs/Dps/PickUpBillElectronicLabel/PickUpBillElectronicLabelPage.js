import { connect } from 'dva';
import { Fragment, PureComponent } from 'react';
import moment from 'moment';
import { Button, Modal, message, Input, Form, Spin, Icon, Select, Tooltip } from 'antd';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { convertCodeName, formatDate } from '@/utils/utils';
import { commonLocale, placeholderLocale, placeholderChooseLocale, notNullLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg, loginUser } from '@/utils/LoginContext';
import { pickUpBillLocale } from '@/pages/Out/PickUp/PickUpBillLocale';
import { PickupBillState, PickType, PickupBillItemState, OperateMethod } from '@/pages/Out/PickUp/PickUpBillContants';
import styles from '@/pages/Out/PickUp/PickUpBill.less';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Page from '@/pages/Component/Page/inner/Page';
import NavigatorPanel from '@/pages/Component/Page/inner/NavigatorPanel';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import PickareaSelect from '@/pages/Component/Select/PickareaSelect';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import BadgeUtil from '@/pages/Component/BadgeUtil';
import PickUpBillElectronicLabelForm from '@/pages/Out/PickUp/PickUpBillElectronicLabelForm';
import StandardTable from '@/components/StandardTable';
import { formatMessage } from 'umi/locale';
import Empty from '@/pages/Component/Form/Empty';
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants';
import PrintTemplateSelect from '@/pages/Component/Select/PrintTemplateSelect';
import { routerRedux } from 'dva/router';
import configs from '@/utils/config';
import { setPrintElectronic, getPrintElectronic } from '@/utils/PrintTemplateStorage';
const FormItem = Form.Item;
@connect(({ pickup, template, loading }) => ({
  pickup,
  template,
  loading: loading.models.pickup,
}))
@Form.create()
export default class PickUpBillElectronicLabelPage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      title: pickUpBillLocale.electronicLabel,
      visible: false,
      pageFilter: {
        searchKeyValues: {
          dcUuid: loginOrg().uuid,
          pickareaUuids: [],
          billNumber: '',
          waveBillNumber: ''
        }
      },
      selectedRowKeys: [],
      selectedRows: [],
      printTemplate:getPrintElectronic()
    }
  }
  componentDidMount() {
    this.props.dispatch({
      type: 'template/queryByTypeAndOrgUuid',
      payload: {
        printType: PrintTemplateType.DPSLABEL.name,
        orgUuid: loginCompany().uuid
      }
    });
    this.refreshTable();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.pickup.electronicList && nextProps.pickup.electronicList != this.props.pickup.electronicList) {
      this.setState({
        data: nextProps.pickup.electronicList
      })
    }
    let templateList = nextProps.template.menuList;
    let defaultValue=undefined;
    if (getPrintElectronic()=='null' && templateList && templateList.length > 0 && 
      nextProps.template.menuList[0].type === PrintTemplateType.DPSLABEL.name) {
      templateList.forEach(function (item, index) {
        if (item.def) {
          defaultValue = JSON.stringify({
            uuid: item.uuid,
            name: item.name,
            path: item.path
          });
        }
      });
      this.state.printTemplate=defaultValue;
    }
  }

  /**
   * 检查是否安装
   */
  checkPrint = () => {
    let hasLocalPrint = true;
    try {
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.open("GET", "http://localhost:9092/socket.io/?EIO=3&transport=polling", false);
      xmlHttp.send(null);
    } catch (error) {
      hasLocalPrint = false;
    }

    if (hasLocalPrint) {
      return true;
    }

    Modal.confirm({
      content: <div>
        {!hasLocalPrint ? <p>没有安装或启动本地打印服务，点击<a href={window.location.origin + '/FinePrint_windows_4_0.exe'} target="_blank">下载安装</a></p> : ''}
        <p>安装完成后，点击确定</p>
      </div>,
      onOk: () => {
        this.onshowModal();
      }
    });

    return false;
  }
  /**
   * 模态框显示/隐藏
   */
  onshowModal = () => {
    const checked = this.checkPrint();
    if (!this.state.visible) {
      if (checked) {
        this.setState({
          visible: !this.state.visible
        })
      }
    } else {
      this.setState({
        visible: !this.state.visible
      })
    }
  }
  /**
   * 模态框确认操作
   */
  onOk = (e) => {
    const { form } = this.props;
    e.preventDefault();
    form.validateFields((err, fieldsValue) => {
      if (err) {
        return;
      }
      setPrintElectronic(fieldsValue.printTemplate);
      this.setState({
        printTemplate: fieldsValue.printTemplate
      })
      this.onshowModal();
    });
  }
  /**
  * 绘制右上角按钮
  */
  drawActionButton = () => {
    return (
      <Fragment>
        <Tooltip title={this.state.printTemplate != null && JSON.parse(this.state.printTemplate) && JSON.parse(this.state.printTemplate).name}>
          <Button type='primary'
            onClick={() => this.onshowModal()}
          ><Icon type="printer" />{commonLocale.printTemplateConfigLocale}
          </Button>
        </Tooltip>
      </Fragment>
    );
  }
  /**
   * 搜索
   */
  onSearch = (data) => {
    const { pageFilter } = this.state;
    if (data) {
      let pickAreaUuids = [];
      if (data.pickArea) {
        pickAreaUuids = data.pickArea.map(item => { return JSON.parse(item).uuid });
      }
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ...data,
        pickareaUuids: pickAreaUuids,
      }
    } else {
      pageFilter.searchKeyValues = {
        dcUuid: loginOrg().uuid,
        pickareaUuids: [],
        billNumber: '',
        waveBillNumber: ''
      }
    }
    this.refreshTable();
  }
  /**
   * 打印
   */
  onPrint = () => {
    const { selectedRowKeys, selectedRows } = this.state;
    if (selectedRowKeys.length === 0) {
      message.warn('请勾选，再进行操作');
      return;
    }
    this.props.form.validateFields((err, fieldsValue) => {
      if (err && err.printTemplate && err.printTemplate.errors) {
        message.error(err.printTemplate.errors[0].message);
        return;
      }
      this.props.dispatch({
        type: 'pickup/printElectronicLabel',
        payload: {
          dcUuid: loginOrg().uuid,
          picker: {
            uuid: loginUser().uuid,
            code: loginUser().code,
            name: loginUser().name
          },
          billNumbers: selectedRowKeys,
        },
        callback: response => {
          if (response && response.success) {
            var reportlets = [];
            for (let i = 0; i < selectedRowKeys.length; i++) {
              reportlets.push({
                reportlet: JSON.parse(this.state.printTemplate).path,
                billNumber: selectedRowKeys,
                userUuid: loginUser().uuid,
                userCode: loginUser().code,
                userName: loginUser().name,
                dcUuid: loginOrg().uuid,
                dcCode: loginOrg().code,
                dcName: loginOrg().name,
                companyUuid: loginCompany().uuid,
                companyCode: loginCompany().code,
                companyName: loginCompany().name
              })
            }
            var config = {
              printUrl: configs[API_ENV].RPORTER_SERVER,
              isPopUp: false, // 是否弹出设置窗口，true为弹出，false为不弹出
              data: {
                reportlets: reportlets // 需要打印的模板列表
              }
            };
            FR.doURLPrint(config);
            message.success(commonLocale.printSuccessLocale);
          } else {
            message.error('打印失败：' + (response ? response.message : '原因未知'));
          }
        }
      })
    })
  }
  /**
   * 查询
   */
  refreshTable = () => {
    this.props.dispatch({
      type: 'pickup/queryElectronicRecord',
      payload: this.state.pageFilter.searchKeyValues
    })
  }
  /**
   * 重算
   */
  recalculate = () => {
    const { selectedRowKeys, selectedRows } = this.state;
    if (selectedRowKeys.length === 0) {
      message.warn('请勾选，再进行操作');
      return;
    }
    this.props.dispatch({
      type: 'pickup/recalculate',
      payload: {
        dcUuid: loginOrg().uuid,
        billNumbers: selectedRowKeys
      },
      callback: response => {
        if (response && response.success) {
          message.success('重算成功');
        }
      }
    })
  }

  onSelectChange = selectedRows => {
    this.setState({
      selectedRows: selectedRows,
      selectedRowKeys: selectedRows.map(item => { return item.billNumber })
    });
  };

  /**
   * 查看详情
   */
  onView = (record) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/out/pickup',
      payload: {
        showPage: 'view',
        entityUuid: record.uuid
      }
    }));
  }
  columns = [
    {
      title: commonLocale.billNumberLocal,
      dataIndex: 'billNumber',
      width: colWidth.billNumberColWidth,
      render: (val, record) => <a onClick={()=>this.onView(record)}>{record.billNumber}</a>
    },
    {
      title: commonLocale.inStoreLocale,
      dataIndex: 'store',
      width: colWidth.codeNameColWidth,
      render: (val, record) => <EllipsisCol colValue={convertCodeName(record.store)} />
    },
    {
      title: pickUpBillLocale.pickType,
      width: colWidth.enumColWidth,
      render: (val, record) => PickType[record.pickType].caption
    },
    {
      title: pickUpBillLocale.pickarea,
      width: colWidth.codeNameColWidth,
      render: (val, record) => !record.pickarea ? <Empty /> : <EllipsisCol colValue={convertCodeName(record.pickarea)} />
    },
    {
      title: pickUpBillLocale.picker,
      width: colWidth.codeNameColWidth,
      render: (val, record) => { return record.picker ? <EllipsisCol colValue={convertCodeName(record.picker)} /> : <Empty /> }
    },
    {
      title: pickUpBillLocale.waveBillNumber,
      dataIndex: 'waveBillNumber',
      width: colWidth.billNumberColWidth,
      render: (val, record) => record.waveBillNumber
    },
    {
      title: commonLocale.stateLocale,
      width: colWidth.enumColWidth,
      render: (val, record) => <BadgeUtil value={record.state} />
    },
    {
      title: pickUpBillLocale.qtyStr,
      width: itemColWidth.qpcStrColWidth + 100,
      dataIndex: 'totalQtyStr',
      align: 'center',
      render: (val, record) => record.totalQtyStr
    },
    {
      title: pickUpBillLocale.realQtyStr,
      width: itemColWidth.qpcStrColWidth + 100,
      dataIndex: 'realTotalQtyStr',
      align: 'center',
      render: (val, record) => record.realTotalQtyStr
    },
    {
      title: pickUpBillLocale.containerBarcodeQty,
      dataIndex: 'containerBarcodeQty',
      width: itemColWidth.qtyColWidth,
      align: 'center',
      render: (val, record) => record.containerBarcodes ? record.containerBarcodes.length : 0
    }
  ];
  render() {
    const { data, selectedRowKeys, selectedRows } = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 15 },
    };
    const { form: { getFieldDecorator }, loading } = this.props;
    const standardTableData = {
      list: data
    }
    return (
      <PageHeaderWrapper>
        <Spin indicator={LoadingIcon('default')} spinning={this.props.loading} >
          <Page>
            <NavigatorPanel title={this.state.title} action={this.drawActionButton()} />
            <PickUpBillElectronicLabelForm
              filterValue={this.state.pageFilter.searchKeyValues}
              refresh={this.onSearch}
            />
            <ViewPanel title={pickUpBillLocale.queryResult} children={
              <div>
                <div className={styles.tableListOperator}>
                  <Button type='primary' onClick={() => this.onPrint()}>{commonLocale.printLocale}{pickUpBillLocale.queryResult}({this.state.selectedRowKeys.length})</Button>
                  <Button onClick={() => this.recalculate()}>{pickUpBillLocale.recalculate}</Button>
                </div>
                <StandardTable
                  rowKey={record => record.uuid}
                  data={standardTableData}
                  columns={this.columns}
                  selectedRowKeys={selectedRowKeys}
                  selectedRows={selectedRows}
                  noPagination
                  onSelectRow={this.onSelectChange}
                  comId={'pickupBill.search.table'}
                />
              </div>
            } />
            <Modal
              title={commonLocale.printTemplateConfigLocale}
              visible={this.state.visible}
              onOk={this.onOk}
              onCancel={() => this.onshowModal()}
              destroyOnClose={true}>
              <Form {...formItemLayout}>
                <FormItem key='printTemplate' label={commonLocale.printTemplateLocale}>
                  {
                    getFieldDecorator('printTemplate', {
                      initialValue: this.state.printTemplate=='null' ? undefined : this.state.printTemplate,
                      rules: [
                        { required: true, message: notNullLocale(commonLocale.printTemplateLocale) }
                      ],
                    })(
                      <PrintTemplateSelect templateType={PrintTemplateType.DPSLABEL.name} />
                    )
                  }
                </FormItem>
              </Form>
            </Modal>
          </Page>
        </Spin>
      </PageHeaderWrapper>
    )
  }
}
