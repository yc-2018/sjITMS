/*
 * @Author: guankongjin
 * @Date: 2022-03-10 09:59:43
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-03-28 17:28:52
 * @Description: file content
 * @FilePath: \iwms-web\src\pages\Tms\LineSystem\LineShipAddress.js
 */
import { connect } from 'dva';
import { Table, Modal, Button, Input, message } from 'antd';
import OperateCol from '@/pages/Component/Form/OperateCol';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import CreatePageModal from '@/pages/Component/RapidDevelopment/OnlForm/QuickCreatePageModal';
import { dynamicDelete } from '@/services/quick/Quick';
import { commonLocale } from '@/utils/CommonLocale';
import TableTransfer from './TableTransfer';

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
  };

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
          onChange={event => {
            console.log(event);
          }}
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
    const params = [
      {
        tableName: 'SJ_ITMS_LINE_SHIPADDRESS',
        condition: {
          params: [{ field: 'UUID', rule: 'eq', val: [shipAddressUuid] }],
        },
        deleteAll: 'false',
      },
    ];
    await dynamicDelete(params).then(result => {
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
      modalQuickuuid: 'itms-store',
      transferColumnsTitle: '门店',
    });
  };
  //添加供应商
  handleAddVendor = () => {
    this.setState({
      modalVisible: true,
      modalTitle: '添加供应商',
      modalQuickuuid: 'itms-vendor',
      transferColumnsTitle: '供应商',
    });
  };
  //保存
  handleStoreSave = () => {
    const { targetKeys, transferDataSource, data } = this.state;
    const { lineuuid } = this.props;
    const saveData = transferDataSource
      .filter(
        x =>
          targetKeys.indexOf(x.UUID) != -1 &&
          data.list.findIndex(d => d.ADDRESSUUID == x.UUID) == -1
      )
      .map((address, index) => {
        return {
          LINEUUID: lineuuid,
          ADDRESSUUID: address.UUID,
          ADDRESSCODE: address.CODE,
          ADDRESSNAME: address.NAME,
          LONGITUDE: address.LONGITUDE,
          LATITUDE: address.LATITUDE,
          TYPE: address.TYPE,
          ORDERNUM: this.state.data.pagination.total + index + 1,
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
    const {
      modalVisible,
      modalTitle,
      modalQuickuuid,
      transferColumnsTitle,
      targetKeys,
    } = this.state;
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
          page={{ quickuuid: 'itms_create_lines', noCategory: true }}
          onRef={node => (this.lineCreatePageModalRef = node)}
        />
      </div>
    );
  };

  drawToolbarPanel = () => {};

  //拖拽排序
  drapTableChange = list => {
    const { data } = this.state;
    data.list = list.map((record, index) => {
      record.ORDERNUM = index + 1;
      return record;
    });
    this.saveFormData(data.list);
  };
}
