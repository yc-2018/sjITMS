/*
 * @Author: guankongjin
 * @Date: 2022-03-10 09:59:43
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-04-22 14:36:26
 * @Description: file content
 * @FilePath: \iwms-web\src\pages\SJTms\LineSystem\LineShipAddress.js
 */
import { connect } from 'dva';
import { Table, Modal, Button, Input, message, Form, Row, Col, Select, TreeSelect } from 'antd';
import OperateCol from '@/pages/Component/Form/OperateCol';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import CreatePageModal from '@/pages/Component/RapidDevelopment/OnlForm/QuickCreatePageModal';
import {
  deleteLineStoreAddressById,
  findLineByNameLike,
  addToNewLine,
} from '@/services/quick/Quick';
import { commonLocale } from '@/utils/CommonLocale';
import TableTransfer from './TableTransfer';
import { disable } from '@/services/account/Company';
import {
  SimpleTreeSelect,
  SimpleSelect,
  SimpleRadio,
  SimpleAutoComplete,
} from '@/pages/Component/RapidDevelopment/CommonComponent';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class LineShipAddress extends QuickFormSearchPage {
  state = {
    ...this.state,
    canDragTable: true,
    noActionCol: false,
    unShowRow: false,
    isNotHd: true,
    modalVisible: false,
    modalTitle: '',
    modalQuickuuid: '',
    transferColumnsTitle: '',
    transferDataSource: [],
    targetKeys: [],
    buttonDisable: false,
    lineModalVisible: false,
    lineData: [],
    lineValue: undefined,
  };
  constructor(props) {
    super(props);
  }

  getLineShipAddress = () => {
    return this.state.data;
  };

  drawcell = event => {
    if (event.column.fieldName == 'ORDERNUM') {
      const component = (
        <Input
          defaultValue={event.val}
          value={event.val}
          style={{ width: 80, textAlign: 'center' }}
          onChange={event => {}}
        />
      );
      event.component = component;
    }
  };

  exSearchFilter = () => {
    return [
      {
        field: 'LINEUUID',
        type: 'VarChar',
        rule: 'eq',
        val: this.props.lineuuid,
      },
    ];
  };

  //列删除操作
  renderOperateCol = record => {
    return <OperateCol menus={this.fetchOperatePropsCommon(record)} />;
  };
  fetchOperatePropsCommon = record => {
    return [
      {
        name: '删除',
        onClick: () => {
          Modal.confirm({
            title: '是否删除' + record.ADDRESSNAME + '门店?',
            onOk: () => {
              this.handleDelete(record.UUID);
            },
          });
        },
      },
    ];
  };
  //删除执行
  handleDelete = async shipAddressUuid => {
    const { pageFilters } = this.state;
    await deleteLineStoreAddressById(shipAddressUuid).then(result => {
      if (result.success) {
        message.success('删除成功！');
        this.getData(pageFilters);
      } else {
        message.error('删除失败，请刷新后再操作');
      }
    });
  };

  //添加门店
  handleAddStore = () => {
    this.setState({
      modalVisible: true,
      modalTitle: '添加门店',
      modalQuickuuid: 'sj_itms_store',
      transferColumnsTitle: '门店',
    });
  };
  //添加供应商
  handleAddVendor = () => {
    this.setState({
      modalVisible: true,
      modalTitle: '添加供应商',
      modalQuickuuid: 'sj_itms_vendor',
      transferColumnsTitle: '供应商',
    });
  };
  //保存
  handleStoreSave = () => {
    const { targetKeys, transferDataSource, data } = this.state;
    const { lineuuid, linecode } = this.props;
    const saveData = transferDataSource
      .filter(
        x =>
          targetKeys.indexOf(x.UUID) != -1 &&
          (data.list ? data.list.findIndex(d => d.ADDRESSUUID == x.UUID) == -1 : true)
      )
      .map((address, index) => {
        const orderNum = this.state.data.pagination.total + index + 1;
        return {
          LINEUUID: lineuuid,
          LINECODE: linecode + '-' + orderNum.toString().padStart(3, '0'),
          ADDRESSUUID: address.UUID,
          ADDRESSCODE: address.CODE,
          ADDRESSNAME: address.NAME,
          LONGITUDE: address.LONGITUDE,
          LATITUDE: address.LATITUDE,
          TYPE: address.TYPE,
          ORDERNUM: orderNum,
        };
      });
    if (saveData.length > 0) {
      this.saveFormData(saveData);
    } else {
      this.setState({ modalVisible: false });
    }
  };
  saveFormData = saveData => {
    const { pageFilters } = this.state;
    const param = {
      code: 'sj_itms_line_shipaddress',
      entity: { SJ_ITMS_LINE_SHIPADDRESS: saveData },
    };
    this.props.dispatch({
      type: 'quick/saveFormData',
      payload: { param },
      callback: response => {
        if (response.success) {
          message.success(commonLocale.saveSuccessLocale);
          this.setState({ modalVisible: false });
          this.getData(pageFilters);
        }
      },
    });
  };

  onTransferChange = targetKeys => {
    this.setState({ targetKeys });
  };
  onTranferFetch = dataSource => {
    this.setState({ transferDataSource: dataSource });
  };

  drawActionButton = () => {
    // const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props;
    const {
      modalVisible,
      modalTitle,
      modalQuickuuid,
      transferColumnsTitle,
      targetKeys,
      lineModalVisible,
      lineData,
    } = this.state;
    const options = lineData.map(a => {
      return <Select.Option key={a.uuid}>{a.name}</Select.Option>;
    });
    return (
      <div>
        <Modal
          title={modalTitle}
          width={800}
          visible={modalVisible}
          onOk={this.handleStoreSave}
          confirmLoading={false}
          onCancel={() => this.setState({ modalVisible: false })}
          destroyOnClose
        >
          <TableTransfer
            targetKeys={targetKeys}
            columnsTitle={transferColumnsTitle}
            onChange={this.onTransferChange}
            handleFetch={this.onTranferFetch}
            quickuuid={modalQuickuuid}
          />
        </Modal>
        <Modal
          title={modalTitle}
          width={800}
          visible={lineModalVisible}
          onOk={this.handleAddToNewLine}
          confirmLoading={false}
          onCancel={() => this.setState({ lineModalVisible: false })}
          destroyOnClose
        >
          <Form ref="xlref">
            <Row>
              <Col>
                <Form.Item label="线路">
                  {/* <Select
        showSearch
        value={this.state.lineValue}
        placeholder={this.props.placeholder}
        style={this.props.style}
        defaultActiveFirstOption={false}
        showArrow={false}
        filterOption={false}
        onSearch={this.handleSearch}
        onChange={this.handleChange}
        notFoundContent={null}
      >
        {options}
      </Select> */}
                  <TreeSelect
                    allowClear={true}
                    optionFilterProp="children"
                    treeData={this.props.lineTreeData}
                    // 将value进行了一层包装，以方便日后扩展
                    value={this.state.lineValue}
                    onChange={this.handleChange}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>

        <Button type="primary" icon="plus" onClick={this.handleAddStore}>
          添加门店
        </Button>
        <Button type="primary" icon="plus" onClick={this.handleAddVendor}>
          添加供应商
        </Button>
        <Button onClick={() => this.lineCreatePageModalRef.show()}>添加子路线</Button>
        <CreatePageModal
          modal={{
            title: '添加子路线',
            width: 500,
            bodyStyle: { marginRight: '40px' },
          }}
          page={{ quickuuid: 'sj_itms_create_lines', noCategory: true }}
          onRef={node => (this.lineCreatePageModalRef = node)}
        />
      </div>
    );
  };

  handleSearch = async value => {
    if (value) {
      await findLineByNameLike(value).then(result => {
        if (result && result.data) {
          this.setState({ lineData: result.data });
        } else {
          this.setState({});
        }
      });
    }
  };
  handleChange = value => {
    this.setState({ lineValue: value });
  };
  handleAddToNewLine = async () => {
    const { selectedRows, lineValue } = this.state;
    let params = {
      lineuuid: lineValue,
      addressIds: selectedRows.map(e => e.UUID),
    };
    await addToNewLine(params).then(result => {
      if (result) {
        message.success('添加成功');
      } else {
        message.error('添加失败');
      }
      this.setState({
        lineValue: undefined,
        lineData: [],
        selectedRows: [],
        lineModalVisible: false,
      });
    });
  };
  drawToolbarPanel = () => {
    const { buttonDisable } = this.state;
    return (
      <div style={{ marginBottom: 15 }}>
        {buttonDisable ? <Button onClick={this.tableSortSave}>排序并保存</Button> : <></>}
        <Button onClick={this.addToNewLine}>添加到新线路</Button>
      </div>
    );
  };

  //拖拽排序
  drapTableChange = list => {
    const { data } = this.state;
    data.list = list.map((record, index) => {
      record.ORDERNUM = index + 1;
      return record;
    });
    this.setState({ buttonDisable: true });
    //this.saveFormData(data.list);
  };

  tableSortSave = () => {
    const { data } = this.state;
    this.saveFormData(data.list);
  };

  addToNewLine = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length > 0) {
      this.setState({ lineModalVisible: true, modalTitle: '添加到新的线路' });
    } else {
      message.warn('至少选择一条记录');
    }
  };
}
