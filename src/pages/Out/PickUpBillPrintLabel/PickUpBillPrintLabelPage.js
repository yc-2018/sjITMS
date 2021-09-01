import { connect } from 'dva';
import { Fragment, PureComponent } from 'react';
import moment from 'moment';
import { Button, Modal, message, Input, Form, Row, Col, Spin, Card, Icon, Select, Checkbox, Table, Tooltip } from 'antd';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { convertCodeName, formatDate } from '@/utils/utils';
import { commonLocale, placeholderLocale, placeholderChooseLocale, notNullLocale } from '@/utils/CommonLocale';
import { loginCompany, loginOrg, loginUser } from '@/utils/LoginContext';
import { pickUpBillLocale } from '../PickUp/PickUpBillLocale';
import { PickupBillState, PickType, PickupBillItemState, OperateMethod } from '../PickUp/PickUpBillContants';
import printSvg from '@/assets/common/ic_print.svg';
import SearchPanel from '@/pages/Component/Page/inner/SearchPanel';
import styles from '../PickUp/PickUpBill.less';
import LoadingIcon from '@/pages/Component/Loading/LoadingIcon';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Page from '@/pages/Component/Page/inner/Page';
import NavigatorPanel from '@/pages/Component/Page/inner/NavigatorPanel';
import ViewPanel from '@/pages/Component/Form/ViewPanel';
import StandardTable from '@/components/StandardTable';
import PickareaSelect from '@/pages/Component/Select/PickareaSelect';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import BadgeUtil from '@/pages/Component/BadgeUtil';
import IPopconfirm from '@/pages/Component/Modal/IPopconfirm';
import Empty from '@/pages/Component/Form/Empty';
import { routerRedux } from 'dva/router';
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants';
import PrintTemplateSelect from '@/pages/Component/Select/PrintTemplateSelect';
import configs from '@/utils/config';
import { setPrintLabel, getPrintLabel } from '@/utils/PrintTemplateStorage';
import { havePermission } from '@/utils/authority';
import { PRINTLABEL_RES } from './PickUpBillPrintLabelPermission';
import { WAVEBILL_RES } from '@/pages/Out/Wave/WaveBillPermission';
const FormItem = Form.Item;
@connect(({ pickup, template, loading }) => ({
  pickup,
  template,
  loading: loading.models.pickup,
}))
@Form.create()
export default class PickUpBillPrintLabelPage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      entityUuid: props.pickup.entityUuid,
      title: pickUpBillLocale.printLabel,
      visible: false,
      timeOpenedPage: moment().format('YYYY-MM-DD HH:mm') + ":00",
      filterValue: {
        audit: true,
        printTemplate: getPrintLabel()
      },
    }
  }
  componentDidMount() {
    this.props.dispatch({
      type: 'pickup/getServerDate',
      callback: response => {
        if (response && response.success && response.data) {
          this.setState({
            timeOpenedPage: response.data
          })
        }
      }
    })
    this.props.dispatch({
      type: 'template/queryByTypeAndOrgUuid',
      payload: {
        printType: PrintTemplateType.LABELPICK.name,
        orgUuid: loginCompany().uuid
      }
    });
    this.props.dispatch({
      type: 'pickup/query',
      payload: {}
    })
  }
  componentDidUpdate() {
    if (document.getElementById('billNumber') != null && (document.activeElement.tagName == 'A' || document.activeElement.tagName == 'BODY' || document.activeElement.id == 'billNumber')) {
      document.getElementById('billNumber').focus();
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.pickup.printList && nextProps.pickup.printList != this.props.pickup.printList) {
      this.setState({
        data: nextProps.pickup.printList
      })
    }
    let templateList = nextProps.template.menuList;
    let defaultValue = undefined;
    if (getPrintLabel() == 'null' && templateList && templateList.length > 0 &&
      nextProps.template.menuList[0].type === PrintTemplateType.LABELPICK.name) {
      templateList.forEach(function (item, index) {
        if (item.def) {
          defaultValue = JSON.stringify({
            uuid: item.uuid,
            name: item.name,
            path: item.path
          });
        }
      });
      this.state.filterValue.printTemplate = defaultValue;
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

  printFR = (billNumbers) => {
    var reportlets = [];
    for (let i = 0; i < billNumbers.length; i++) {
      reportlets.push({
        reportlet: JSON.parse(this.state.filterValue.printTemplate).path,
        billNumber: billNumbers[i],
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
  }

  /**
   * 模态框确认操作
   */
  onOk = (e) => {
    const { form } = this.props;
    const { filterValue } = this.state;
    e.preventDefault();
    form.validateFields((err, fieldsValue) => {
      if (err) {
        return;
      }
      setPrintLabel(fieldsValue.printTemplate);
      filterValue.printTemplate = fieldsValue.printTemplate;
      this.onshowModal();
    });
  }
  /**
  * 绘制右上角按钮
  */
  drawActionButton = () => {
    return (
      <Fragment>
        <Tooltip title={this.state.filterValue.printTemplate != null && JSON.parse(this.state.filterValue.printTemplate) && JSON.parse(this.state.filterValue.printTemplate).name}>
          <Button type='primary'
            disabled={!havePermission(PRINTLABEL_RES.TEMPLATE)}
            onClick={() => this.onshowModal()}
          ><Icon type="printer" />{commonLocale.printTemplateConfigLocale}
          </Button>
        </Tooltip>
      </Fragment>
    );
  }
  /**
   * 回车确认
   */
  onSubmit = (e) => {
    const checked = this.checkPrint();
    if (checked == false) {
      return;
    }
    const { form } = this.props;
    let { filterValue } = this.state;
    e.preventDefault();
    form.validateFields((err, fieldsValue) => {
      if (err && err.printTemplate && err.printTemplate.errors) {
        message.error(err.printTemplate.errors[0].message);
        return;
      }
      filterValue = {
        ...filterValue,
        ...fieldsValue
      }
      this.setState({
        filterValue: filterValue
      })
      if (filterValue.pickerCode) {
        this.onPrint({ ...filterValue });
      }
    });
  }
  /**
   * 打印
   */
  onPrint = (filterValue) => {
    let pickAreaUuids = [];
    if (filterValue.pickArea) {
      pickAreaUuids = filterValue.pickArea.map(item => { return JSON.parse(item).uuid });
    }else {
      message.warning('请输入拣货分区')
      return;
    }
    if (!filterValue.waveBillNumber){
      message.warning('请输入波次号')
      return;
    }
    if (!filterValue.pickerCode){
      message.warning('请输入拣货员')
      return;
    }
    delete filterValue.pickArea;
    if (filterValue.printTemplate) {
      delete filterValue.printTemplate;
    }
    let queryParam = {
      ...filterValue,
      dcUuid: loginOrg().uuid,
      companyUuid: loginCompany().uuid
    }
    localStorage.setItem("showMessage", "0");

    this.props.dispatch({
      type: 'pickup/printLabel',
      payload: {
        ...queryParam,
        pickareaUuids: pickAreaUuids,
      },
      callback: response => {
        localStorage.setItem("showMessage", "1");

        if (response && response.success) {
          this.printFR(response.data);
          this.onSearch(queryParam);
          message.success(commonLocale.printSuccessLocale);
          //TODO:清空打印员工
          this.props.form.setFieldsValue({
            pickerCode: undefined,
          });
        } else {
          Modal.error({
            title: '打印失败',
            content: response.message,
          });
        }
        // else {
        //   message.error('打印失败：' + (response && response.message ? response.message : '原因未知'));
        // }
      }
    });

  }
  /** 
   * 查询
   */
  onSearch = (queryParam) => {
    this.props.dispatch({
      type: 'pickup/queryPrintRecord',
      payload: {
        page: 0,
        pageSize: 1000,
        searchKeyValues: {
          ...queryParam,
          printTime: this.state.timeOpenedPage,
        }
      }
    })
  }
  /**
   * 表格中单个打印
   */
  onSinglePrint = (record) => {
    let audit = this.props.form.getFieldValue('audit');
    let pickerCode = this.props.form.getFieldValue('pickerCode');
    if (!pickerCode) {
      message.warning('请输入员工代码或员工卡号')
      return;
    }
    let filterValue = {
      billNumber: record.billNumber,
      wavebillNumber: record.wavebillNumber,
      pickArea: [JSON.stringify(record.pickarea)],
      audit: audit,
      pickerCode: pickerCode,
      onSinglePrint: true
    };
    this.printFR([record.billNumber]);
    this.onPrint(filterValue);
  }
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

  /**
  * 跳转到波次单详情页面
  */
  onWaveView = (record) => {
    this.props.dispatch({
      type: 'wave/getByNumber',
      payload: record.waveBillNumber,

      callback: (response) => {
        if (response && response.success) {
          this.props.dispatch(routerRedux.push({
            pathname: '/out/wave',
            payload: {
              showPage: 'view',
              entityUuid: response.data ? response.data.uuid : undefined
            }
          }));
        }
      }
    });
  }

  columns = [
    {
      title: commonLocale.billNumberLocal,
      dataIndex: 'billNumber',
      width: colWidth.billNumberColWidth,
      render: (val, record) => <a onClick={this.onView.bind(this, record)}>{val}</a>
    },
    {
      title: commonLocale.inStoreLocale,
      dataIndex: 'store',
      width: colWidth.codeNameColWidth,
      render: val => <EllipsisCol colValue={convertCodeName(val)} />
    },
    {
      title: pickUpBillLocale.pickType,
      width: colWidth.enumColWidth,
      render: record => PickType[record.pickType].caption
    },
    {
      title: pickUpBillLocale.pickarea,
      width: colWidth.codeNameColWidth,
      render: record => !record.pickarea ? <Empty /> : <EllipsisCol colValue={convertCodeName(record.pickarea)} />
    },
    {
      title: pickUpBillLocale.picker,
      width: colWidth.codeNameColWidth,
      render: record => { return record.picker ? <EllipsisCol colValue={convertCodeName(record.picker)} /> : <Empty /> }
    },
    {
      title: pickUpBillLocale.waveBillNumber,
      dataIndex: 'waveBillNumber',
      width: colWidth.billNumberColWidth,
      render: (val, record) => {
        return val ? <span>
          <a onClick={this.onWaveView.bind(this, record)}
            disabled={!havePermission(WAVEBILL_RES.VIEW)}>{val}</a>
        </span> : <Empty />;
      }
    },
    {
      title: commonLocale.stateLocale,
      width: colWidth.enumColWidth,
      render: record => <BadgeUtil value={record.state} />
    },
    {
      title: pickUpBillLocale.qtyStr,
      width: itemColWidth.qpcStrColWidth + 100,
      dataIndex: 'totalQtyStr',
      align: 'center',
    },
    {
      title: pickUpBillLocale.realQtyStr,
      width: itemColWidth.qpcStrColWidth + 100,
      dataIndex: 'realTotalQtyStr',
      align: 'center',
    },
    {
      title: commonLocale.operateLocale,
      width: colWidth.operateColWidth,
      render: record => (
        <IPopconfirm onConfirm={() => this.onSinglePrint(record)}
          operate={commonLocale.printLocale}
          object={pickUpBillLocale.title}
        >
          <a>{commonLocale.printLocale}</a>
        </IPopconfirm>
      ),
    },
  ];
  render() {
    const { data, filterValue } = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 15 },
    };
    const layout = {
      labelCol: { span: 15 },
      wrapperCol: { span: 10 },
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
            <SearchPanel>
              <Form className={styles.searchForm}>
                <Row>
                  <Col md={6} sm={24}>
                    <FormItem label={commonLocale.billNumberLocal}>
                      {getFieldDecorator('billNumber', { initialValue: filterValue.billNumber })(
                        <Input placeholder={placeholderLocale(commonLocale.billNumberLocal)} />)}
                    </FormItem>
                  </Col>
                  <Col md={6} sm={24}>
                    <FormItem label={pickUpBillLocale.waveBillNumber}>
                      {getFieldDecorator('waveBillNumber', {
                        rules: [
                          { required: true, message: notNullLocale(pickUpBillLocale.waveBillNumber) },
                        ], initialValue: filterValue.waveBillNumber
                      })(
                        <Input placeholder={placeholderLocale(pickUpBillLocale.waveBillNumber)} />)}
                    </FormItem>
                  </Col>
                  <Col md={6} sm={24}>
                    <FormItem label={pickUpBillLocale.pickarea}>
                      {getFieldDecorator('pickArea', { 
                        rules: [
                          { required: true, message: notNullLocale(pickUpBillLocale.pickarea) },
                        ], initialValue: filterValue.pickArea })(
                        <PickareaSelect multiple placeholder={placeholderChooseLocale(pickUpBillLocale.pickarea)} />)}
                    </FormItem>
                  </Col></Row>
                <Row>
                  <Col md={18} sm={24}>
                    <FormItem label={pickUpBillLocale.picker}>
                      {getFieldDecorator('pickerCode', { 
                        rules: [
                          { required: true, message: notNullLocale(pickUpBillLocale.picker) },
                        ], initialValue: filterValue.pickerCode })(
                        <Input onPressEnter={this.onSubmit} placeholder={pickUpBillLocale.pickerCodeEnter} />)}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col md={6} sm={24}>
                    <FormItem label={pickUpBillLocale.isAudit}>
                      {getFieldDecorator('audit', { valuePropName: 'checked', initialValue: filterValue.audit })(
                        <Checkbox disabled={!havePermission(PRINTLABEL_RES.AUDIT)} />)}
                    </FormItem>
                  </Col>
                </Row>
              </Form>
            </SearchPanel>
            <ViewPanel title={pickUpBillLocale.printRecord} children={
              <div>
                <div className={styles.header}></div>
                <StandardTable
                  rowKey={record => record.uuid}
                  data={standardTableData}
                  columns={this.columns}
                  selectedRows={[]}
                  comId={'pickUpPrint.view.table'}
                  unShowRow
                  noPagination
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
                      initialValue: filterValue.printTemplate == 'null' ? undefined : filterValue.printTemplate,
                      rules: [
                        { required: true, message: notNullLocale(commonLocale.printTemplateLocale) }
                      ],
                    })(
                      <PrintTemplateSelect templateType={PrintTemplateType.LABELPICK.name} />
                    )
                  }
                </FormItem>
              </Form >
            </Modal>
          </Page>
        </Spin>
      </PageHeaderWrapper>
    )
  }
}
