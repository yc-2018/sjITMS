import { connect } from 'dva';
import { Fragment } from 'react';
import { Button, message, Modal, Form, Input, InputNumber } from 'antd';
import { formatMessage } from 'umi/locale';
import SearchPage from '@/pages/Component/Page/SearchPage';
import PalletBinTypeSelect from '@/pages/Component/Select/PalletBinTypeSelect';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import { commonLocale, placeholderLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { colWidth, itemColWidth } from '@/utils/ColWidth';
import { convertCodeName } from '@/utils/utils';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import { palletBinLocale } from './PalletBinLocale';
import PalletBinSearchForm from './PalletBinSearchForm';
import { BinUsage, getUsageCaption } from '@/utils/BinUsage';
import { CONTAINER_RES } from './PalletBinPermission';
import PrintButton from '@/pages/Component/Printer/PrintButton';
import { PrintTemplateType } from '@/pages/Account/PrintTemplate/PrintTemplateContants';
import { routerRedux } from 'dva/router';

const FormItem = Form.Item;

@connect(({ palletBin, loading }) => ({
  palletBin,
  loading: loading.models.palletBin,
}))
@Form.create()
export default class PalletBinSearchPage extends SearchPage {

  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: palletBinLocale.title,
      showModal: false,
      data: props.palletBin.data,
      palletBinTypeUuid: '',
      modalLoading: false,
      key: 'palletBin.search.table'
    };
    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
    this.state.pageFilter.sortFields = {
      barcode: false,
    };
  }

  componentDidMount() {
    if(this.props.palletBin.fromView) {
      return;
    } else {
      this.refreshTable();
    }
    // this.refreshTable();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.palletBin.data,
      entity: {},
    });
  }

  onCreate = () => {
    this.setState({
      showModal: true,
    });
  };

  onView = (record) => {

    this.props.dispatch({
      type: 'palletBin/showPage',
      payload: {
        showPage: 'view',
        entityUuid: record.barcode,
      },
    });
  };

  onViewPalletBinType = (palletBinTypeUuid) => {
    this.props.dispatch(routerRedux.push({
      pathname: '/facility/palletBinType',
      payload: {
        showPage: 'view',
        entityUuid: palletBinTypeUuid,
      },
    }));
  };

  onSearch = (data) => {
    const { pageFilter } = this.state;
    pageFilter.page = 0;
    if (data) {
      if (data.palletBinType) {
        data.palletBinTypeUuid = JSON.parse(data.palletBinType).uuid;
      }else {
        data.palletBinTypeUuid = '';
      }
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        ...data,
      };
      pageFilter.sortFields = {
        barcode: false,
      };
    } else {
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
      };
      pageFilter.sortFields = {
        barcode: false,
        palletBinTypeCode: false,
      };
    }
    this.refreshTable();
  };

  refreshTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;

    let queryFilter = { ...pageFilter };
    if (filter) {
      queryFilter = { ...pageFilter, ...filter };
    }

    dispatch({
      type: 'palletBin/query',
      payload: queryFilter,
    });
  };

  drawActionButton = () => {
    return (
      <Fragment>
        <Button icon="plus" type="primary" onClick={() => this.handleModalVisible(true)}>
          {commonLocale.createLocale}
        </Button>
      </Fragment>
    );
  };


  drawToolbarPanel() {
    const { selectedRows } = this.state;
    const batchPrintParams = [];
    selectedRows.forEach(function(e) {
      batchPrintParams.push({
        billNumber: e.barcode,
      });
    });

    return [
      <PrintButton
        key='printButton'
        reportParams={batchPrintParams}
        moduleId={PrintTemplateType.CONTAINER.name}/>,
    ];
  }

  drawSearchPanel = () => {
    return <PalletBinSearchForm filterValue={this.state.pageFilter.searchKeyValues} refresh={this.onSearch}/>;
  };

  handleCancel() {
    this.props.form.resetFields();
    this.refreshTable();
    this.setState({
      showModal: false,
      entity: {},
      palletBinTypeUuid: '',
    });
  }

  handleModalVisible = (flag) => {
    this.setState({
      showModal: !!flag,
      entity: {},
    });
  };


  palletBinTypeChange = (value) => {
    if (!value)
      return;
    var palletBinType = JSON.parse(value);
    this.setState({
      palletBinTypeUuid: palletBinType.uuid,
    });
  };

  handleOk() {
    this.setState({
      modalLoading: true,
    });

    const { form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) {
        this.setState({
          modalLoading: false,
        });
        return;
      }

      const data = {
        ...fieldsValue,
      };

      this.props.dispatch({
        type: 'palletBin/onSave',
        payload: {
          'dcUuid': loginOrg().uuid,
          'companyUuid': loginCompany().uuid,
          'palletBinTypeUuid': this.state.palletBinTypeUuid,
          'num': data.num,
        },
        callback: (response) => {
          if (response && response.success) {
            this.setState({
              showModal: false,
              modalLoading: false,
            });
            this.props.form.resetFields();
            message.success(commonLocale.saveSuccessLocale);
            this.refreshTable();
          } else {
            this.setState({
              modalLoading: false,
            });
          }
        },
      });
    });
  }

  drawOtherCom = () => {
    const baseFormItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 16 },
    };

    const { getFieldDecorator } = this.props.form;
    const { entity } = this.props;

    return (
      <Modal
        title={commonLocale.createLocale}
        visible={this.state.showModal}
        confirmLoading={this.state.modalLoading}
        destroyOnClose={true}
        onOk={() => this.handleOk()}
        onCancel={() => this.handleCancel()}
        okText={commonLocale.confirmLocale}
        cancelText={commonLocale.cancelLocale}
      >
        <Form>
          <FormItem
            {...baseFormItemLayout}
            label={palletBinLocale.palletBinType}>
            {getFieldDecorator('palletBinType', {
              rules: [{ required: true, message: palletBinLocale.palletBinTypeNotNull },
              ],
            })(
              <PalletBinTypeSelect
                placeholder={placeholderChooseLocale(palletBinLocale.palletBinType)}
                onChange={this.palletBinTypeChange}
              />,
            )}
          </FormItem>
          <FormItem
            {...baseFormItemLayout}
            label={palletBinLocale.genNum}>
            {getFieldDecorator('num', {
              rules: [{ required: true, message: palletBinLocale.genNum },
              ],
            })(
              <InputNumber placeholder={placeholderLocale(palletBinLocale.genNum)}
                           style={{ width: '100%' }} min={1} max={1000}/>,
            )}
          </FormItem>
        </Form>
      </Modal>
    );

  };

  columns = [
    {
      title: palletBinLocale.barcodeLocale,
      dataIndex: 'barcode',
      key:'barcode',
      sorter: true,
      width: colWidth.codeColWidth,
      render: (text, record) => {
        return (
          <a onClick={() => this.onView(record)}>
            {text}
          </a>
        );
      },
    },
    {
      title: palletBinLocale.palletBinType,
      dataIndex: 'palletBinTypeCode',
      key: 'palletBinTypeCode',
      sorter: true,
      width: colWidth.codeNameColWidth,
      render: (text, record) => <a onClick={this.onViewPalletBinType.bind(true, record.type.uuid)}
                                   disabled={!record.type}><EllipsisCol colValue={convertCodeName(record.type)}/></a>,
    },
    {
      title: commonLocale.operateLocale,
      width: colWidth.operateColWidth,
      render: record => (
        <Fragment>
          <a onClick={() => this.onView(record)}>
            {commonLocale.viewLocale}
          </a>
        </Fragment>
      ),
    },
  ];
}
