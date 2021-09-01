import { connect } from 'dva';
import { Form, Button, Radio, message } from 'antd';
import SearchPage from './SearchPage';
import EllipsisCol from '@/pages/Component/Form/EllipsisCol';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import { colWidth } from '@/utils/ColWidth';
import { commonLocale } from '@/utils/CommonLocale';
import { havePermission } from '@/utils/authority';
import { convertCodeName } from '@/utils/utils';
import { loginOrg, loginCompany } from '@/utils/LoginContext';
import SelfTackShipSearchForm from './SelfTackShipSearchForm';
import { selfTackShipLocale } from './SelfTackShipLocale';
import OperateCol from '@/pages/Component/Form/OperateCol';
import { orgType } from '@/utils/OrgType';
import Empty from '@/pages/Component/Form/Empty';
import { SELFTACKSHIP_RES } from './SelfTackShipPermission';

@connect(({ selfTackShip, loading }) => ({
  selfTackShip,
  loading: loading.models.selfTackShip,
}))
@Form.create()
export default class SelfTackShipSearchPage extends SearchPage {
  constructor(props) {
    super(props);

    this.state = {
      ...this.state,
      title: selfTackShipLocale.title,
      data: props.selfTackShip.data,
      selectedRows: [],
      record: {},
      entityUuid: '',
      operate: '',
      modalVisibleAlc: false,
      modalVisibleContainer: false,
      showAlc: true,
      waveBillNumber: '',
      suspendLoading: false
    }

    this.state.pageFilter.searchKeyValues.companyUuid = loginCompany().uuid;
    this.state.pageFilter.searchKeyValues.dcUuid = loginOrg().uuid;
    this.state.pageFilter.sortFields = {
      waveBillNumber: true
    };
  }

  componentDidMount() {
    this.refreshAlcTable();
    if(this.state.showAlc) {
      this.columns = [
        {
          title: selfTackShipLocale.waveBillNumber,
          key: 'waveBillNumber',
          sorter: true,
          dataIndex: 'waveBillNumber',
          width: colWidth.billNumberColWidth + 50
        },
        {
          title: commonLocale.inStoreLocale,
          width: colWidth.codeNameColWidth,
          sorter: true,
          dataIndex: 'store',
          render: val => <EllipsisCol colValue={convertCodeName(val)} />
        },
        {
          title: selfTackShipLocale.alcBillNumber,
          width: colWidth.codeNameColWidth,
          sorter: true,
          dataIndex: 'alcNtcBillNumber'
        },
        {
          title: commonLocale.operateLocale,
          width: colWidth.operateColWidth,
          render: record => (
            this.renderOperateCol(record)
          ),
        }
      ];
    }
  }

  componentWillReceiveProps(nextProps) {
      if(nextProps.selfTackShip.data && nextProps.selfTackShip.data !== this.props.selfTackShip.data) {
        this.setState({
          data: nextProps.selfTackShip.data
        });
      }
      const that = this;
      if(this.state.showAlc) {
        that.columns = [
          {
            title: selfTackShipLocale.waveBillNumber,
            key: 'waveBillNumber',
            dataIndex: 'waveBillNumber',
            sorter:true,
            width: colWidth.billNumberColWidth + 50
          },
          {
            title: commonLocale.inStoreLocale,
            width: colWidth.codeNameColWidth,
            dataIndex: 'store',
            sorter:true,
            render: val => <EllipsisCol colValue={convertCodeName(val)} />
          },
          {
            title: selfTackShipLocale.alcBillNumber,
            width: colWidth.codeNameColWidth,
            sorter:true,
            dataIndex: 'alcNtcBillNumber',
            render:(val, record) => record.alcNtcBillNumber ? record.alcNtcBillNumber :<Empty/>
          },
          {
            title: commonLocale.operateLocale,
            width: colWidth.operateColWidth,
            render: record => (
              this.renderOperateCol(record)
            ),
          }
        ];
      } else {
        that.columns = [
          {
            title: selfTackShipLocale.waveBillNumber,
            key: 'waveBillNumber',
            dataIndex: 'waveBillNumber',
            sorter:true,
            width: colWidth.billNumberColWidth + 50
          },
          {
            title: commonLocale.inStoreLocale,
            width: colWidth.codeNameColWidth,
            dataIndex: 'store',
            sorter:true,
            render: val => <EllipsisCol colValue={convertCodeName(val)} />
          },
          {
            title: commonLocale.inContainerBarcodeLocale,
            width: colWidth.codeNameColWidth,
            sorter:true,
            dataIndex: 'contaienrBarcode',
            render:(val, record) => record.contaienrBarcode ? record.contaienrBarcode :<Empty/>
          },
          {
            title: commonLocale.operateLocale,
            width: colWidth.operateColWidth,
            render: record => (
              this.renderOperateCol(record)
            ),
          }
        ];
      }
  }

  changeSelectedRows = (selectedRows) => {
    let param = [];
    for (let i = 0; i < selectedRows.length; i++) {
      param.push({
        waveBillNumber: selectedRows[i].waveBillNumber
      })
    }
  }

  /**
   * 刷新/重置
   */
  refreshAlcTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;

    if (!filter || !filter.changePage) {
      this.setState({
        selectedRows: []
      });
    }

    let queryFilter = { ...pageFilter };
    if (filter) {
      queryFilter = { ...pageFilter, ...filter };
    }
    dispatch({
      type: 'selfTackShip/queryAlcntc',
      payload: queryFilter,
      callback: response => {
        if (response && response.data ) {
          this.setState({
            data:{
              list: response.data.records? response.data.records : [],
              pagination: {
                total: response.data.paging.recordCount,
                pageSize: response.data.paging.pageSize,
                current: response.data.page + 1,
                showTotal: total => `共 ${total} 条`,
              },
            }
          })
        }
      }
    });
  };
  /**
   * 刷新/重置
   */
  refreshContainerTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;

    if (!filter || !filter.changePage) {
      this.setState({
        selectedRows: []
      });
    }

    let queryFilter = { ...pageFilter };
    if (filter) {
      queryFilter = { ...pageFilter, ...filter };
    }
    dispatch({
      type: 'selfTackShip/queryContainer',
      payload: queryFilter,
      callback: response => {
        if (response && response.data ) {
          this.setState({
            data:{
              list: response.data.records? response.data.records : [],
              pagination: {
                total: response.data.paging.recordCount,
                pageSize: response.data.paging.pageSize,
                current: response.data.page + 1,
                showTotal: total => `共 ${total} 条`,
              },
            }
          })
        }
      }
    });
  };
  /**
   * 搜索
   */
  onSearch = (data) => {
    const {
      pageFilter
    } = this.state;
    pageFilter.page = 0;
    if (data) {
      let codes = [];
      if(data.codeName && data.codeName.length>0) {
        for(let i=0;i<data.codeName.length;i++){
          let codeNames = JSON.parse(data.codeName[i]);
          codes.push(codeNames.code)
        }
      }
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        storeCodes: codes ? codes : null,
        waveBillNumbers: data.billNumber
      }
    } else {
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid
      }
    }
    if(this.state.showAlc) {
      this.refreshAlcTable();
    } else {
      this.refreshContainerTable();
    }


  }

  /**
   * 批量装车
   */
  onBatchFinish = () => {
    this.setState({
      batchAction: selfTackShipLocale.batchTackShip,
      content: undefined
    })
    this.handleBatchProcessConfirmModalVisible(true);
  }

  // 批量操作
  onBatchProcess = () => {
    this.setState({
      suspendLoading: true
    })
    const { selectedRows, batchAction } = this.state;

    const that = this;
    let bacth = (i) => {
      if (i < selectedRows.length) {
        if (batchAction === selfTackShipLocale.batchTackShip) {
          if(this.state.showAlc) {
            that.onSelfHandoverAlcNtc(selectedRows[i], true).then(res => {
              bacth(i + 1);
            });
          } else {
            that.onSelfHandoverContainer(selectedRows[i], true).then(res => {
              bacth(i + 1);
            });
          }
        }
      } else {
        this.setState({
          suspendLoading: false
        })
      }
    }
    bacth(0);
  }

  /**
   * 模态框显示/隐藏
   */
  handleModalVisible = (operate, waveBillNumber) => {
    if (operate && waveBillNumber) {
      this.setState({
        operate: operate,
        waveBillNumber: waveBillNumber
      })
    }
    if(this.state.showAlc) {
      this.setState({
        modalVisibleAlc: !this.state.modalVisibleAlc
      });
    } else {
      this.setState({
        modalVisibleContainer: !this.state.modalVisibleContainer
      });
    }

  }


  /**
   * 模态框确认操作
   */
  handleOkAlc = () => {
    const { operate, record } = this.state;
    if (operate === selfTackShipLocale.tackShip) {
      this.onSelfHandoverAlcNtc(record);
    }
    this.setState({
      modalVisibleAlc: !this.state.modalVisibleAlc
    });
  }

  /**
   * 模态框确认操作
   */
  handleOkContainer = () => {
    const { operate, record } = this.state;
    if (operate === selfTackShipLocale.tackShip) {
      this.onSelfHandoverContainer(record);
    }
    this.setState({
      modalVisibleContainer: !this.state.modalVisibleContainer
    });
  }

  /**
   * 单一装车
   */
  onSelfHandoverAlcNtc = (record, batch) => {
    const that = this;
    let upParams = [];
    if(record) {
      upParams.push(record);
    }
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'selfTackShip/confirmSelfHandoverAlcNtc',
        payload: upParams,
        callback: response => {
          if (batch) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            return;
          }
          if (response && response.success) {
            that.refreshAlcTable();
            message.success(selfTackShipLocale.tackShipSuccess)
          }
        }
      })
    })
  }


  /**
   * 单一装车
   */
  onSelfHandoverContainer = (record, batch) => {
    const that = this;
    let upParams = [];
    if(record) {
      upParams.push(record);
    }
    return new Promise(function (resolve, reject) {
      that.props.dispatch({
        type: 'selfTackShip/confirmSelfHandoverContainer',
        payload: upParams,
        callback: response => {
          if (batch) {
            that.batchCallback(response, record);
            resolve({ success: response.success });
            return;
          }
          if (response && response.success) {
            that.refreshContainerTable();
            message.success(selfTackShipLocale.tackShipSuccess)
          }
        }
      })
    })
  }

  onChange = (e) => {
    this.setState({
      showAlc: e.target.value,
      selectedRows: []
    });
    if(e.target.value) {
      this.refreshAlcTable();
      // this.columns = [
      //   {
      //     title: selfTackShipLocale.waveBillNumber,
      //     key: 'waveBillNumber',
      //     sorter: true,
      //     dataIndex: 'waveBillNumber',
      //     width: colWidth.billNumberColWidth + 50
      //   },
      //   {
      //     title: commonLocale.inStoreLocale,
      //     width: colWidth.codeNameColWidth,
      //     sorter: true,
      //     dataIndex: 'store',
      //     render: val => <EllipsisCol colValue={convertCodeName(val)} />
      //   },
      //   {
      //     title: selfTackShipLocale.alcBillNumber,
      //     width: colWidth.codeNameColWidth,
      //     sorter: true,
      //     dataIndex: 'alcNtcBillNumber'
      //   },
      //   {
      //     title: commonLocale.operateLocale,
      //     width: colWidth.operateColWidth,
      //     render: record => (
      //       this.renderOperateCol(record)
      //     ),
      //   }
      // ];
    } else {
      this.refreshContainerTable();
      // this.columns = [
      //   {
      //     title: selfTackShipLocale.waveBillNumber,
      //     key: 'waveBillNumber',
      //     sorter: true,
      //     dataIndex: 'waveBillNumber',
      //     width: colWidth.billNumberColWidth + 50
      //   },
      //   {
      //     title: commonLocale.inStoreLocale,
      //     width: colWidth.codeNameColWidth,
      //     dataIndex: 'store',
      //     sorter: true,
      //     render: val => <EllipsisCol colValue={convertCodeName(val)} />
      //   },
      //   {
      //     title: commonLocale.inContainerBarcodeLocale,
      //     width: colWidth.codeNameColWidth,
      //     sorter: true,
      //     dataIndex: 'contaienrBarcode'
      //   },
      //   {
      //     title: commonLocale.operateLocale,
      //     width: colWidth.operateColWidth,
      //     render: record => (
      //       this.renderOperateCol(record)
      //     ),
      //   }
      // ];
    }
  };

  fetchOperatePropsOne = (record) => {
    if(this.state.showAlc) {
      return [{
        name: selfTackShipLocale.tackShip,
        confirm: true,
        confirmCaption: selfTackShipLocale.title,
        disabled: !havePermission(SELFTACKSHIP_RES.SHIP),
        onClick: this.onSelfHandoverAlcNtc.bind(this, record, false)
      }];
    } else {
      return [{
        name: selfTackShipLocale.tackShip,
        confirm: true,
        confirmCaption: selfTackShipLocale.title,
        disabled: !havePermission(SELFTACKSHIP_RES.SHIP),
        onClick: this.onSelfHandoverContainer.bind(this, record, false)
      }];
    }

  }

  renderOperateCol = (record) => {
    return <OperateCol menus={this.fetchOperatePropsOne(record)} />
  }

  /**
   * 表格列
   */
  columns = [
    {
      title: selfTackShipLocale.waveBillNumber,
      key: 'waveBillNumber',
      dataIndex: 'waveBillNumber',
      sorter:true,
      width: colWidth.billNumberColWidth + 50
    },
    {
      title: commonLocale.inStoreLocale,
      width: colWidth.codeNameColWidth,
      dataIndex: 'store',
      sorter:true,
      render: val => <EllipsisCol colValue={convertCodeName(val)} />
    },
    {
      title: selfTackShipLocale.alcBillNumber,
      width: colWidth.codeNameColWidth,
      sorter:true,
      dataIndex: 'alcNtcBillNumber',
      render:(val, record) => record.alcNtcBillNumber ? record.alcNtcBillNumber :<Empty/>
    },
    {
      title: commonLocale.operateLocale,
      width: colWidth.operateColWidth,
      render: record => (
        this.renderOperateCol(record)
      ),
    }
  ];
  /**
   * 绘制批量工具栏
   */
  drawToolbarPanel() {
    return [
      <div>
        <div>
          <Radio.Group
            onChange={this.onChange}
            value={this.state.showAlc}
          >
            <Radio value={true}>{selfTackShipLocale.alcBillNumber}</Radio>
            <Radio value={false}>{commonLocale.inContainerBarcodeLocale}</Radio>
          </Radio.Group>
        </div>
        <br />
        <div>
          <Button key={1}
                  onClick={() => this.onBatchFinish()}
                  disabled={!havePermission(SELFTACKSHIP_RES.BATCHSHIP)}
          >
            {selfTackShipLocale.batchTackShip}
          </Button>
        </div>
      </div>
    ];
  }

  /**
   * 绘制搜索表格
   */
  drawSearchPanel = () => {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    return (
      <div>
        <SelfTackShipSearchForm
          filterValue={this.state.pageFilter.searchKeyValues}
          refresh={this.onSearch}
        />
        <ConfirmModal
          visible={this.state.modalVisibleAlc}
          operate={this.state.operate}
          onOk={this.handleOkAlc}
          onCancel={this.handleModalVisible}
        />
        <ConfirmModal
          visible={this.state.modalVisibleContainer}
          operate={this.state.operate}
          onOk={this.handleOkContainer}
          onCancel={this.handleModalVisible}
        />
      </div>

    );
  }
}
