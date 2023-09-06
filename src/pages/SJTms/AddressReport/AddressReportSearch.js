import React from 'react';
import { Button, Popconfirm, message, Modal, Form } from 'antd';
import { connect } from 'dva';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import { cancellation, audits } from '@/services/sjitms/AddressReport';
import moment from 'moment';
import { Map, Marker } from 'react-bmapgl';
import QuickFormModal from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormModal';
//import whitestyle from '../static/whitestyle'
@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
//继承QuickFormSearchPage Search页面扩展
@Form.create()
export default class AddressReportSearch extends QuickFormSearchPage {
  state = {
    ...this.state,
    Mapvisible: false,
    isNotHd: true,
    isRadio: true,
  };

  handleRowClick = e => {
    this.props.showStoreByReview(e);
  };

  onUpload = () => {
    this.props.switchTab('import');
  };

  drawSearchPanel = () => {};

  drawExColumns = e => {
    if (e.column.fieldName == 'STATNAME') {
      return {
        title: '地图', //加个空格防止重名
        dataIndex: 'mapShow',
        key: 'mapShow',
        sorter: false,
        width: 120,
        render: (val, record, index) => {
          return (
            <Button
              onClick={() => {
                console.log('222', record);
              }}
            >
              地图显示
            </Button>
          );
        },
      };
    }
  };

  defaultSearchs = () => {
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

    return defaultSearch;
  };

  audits = async () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.error('请选中一条记录');
      return;
    }
    const reslut = await audits(selectedRows.map(e => e.UUID));
    if (reslut.success) {
      message.success('审核成功！');
      this.setState({ Mapvisible: false });

      this.onSearch();
    }
  };

  //作废
  cancellation = async () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0) {
      message.error('请选中一条记录');
      return;
    }
    const result = await cancellation(selectedRows.map(e => e.UUID));
    if (result.success) {
      message.success('作废成功！');
      this.onSearch();
    }
  };
  showMap = () => {
    const { selectedRows } = this.state;
    if (selectedRows.length == 0 || selectedRows.length > 1) {
      message.error('请选中一条记录');
      return;
    }
    this.setState({ Mapvisible: true });
  };
  // drawRightClickMenus = () => {
  //   return (
  //     <Menu>
  //       <Menu.Item key="1" onClick={() => this.showMap()}>
  //         地图审核
  //       </Menu.Item>
  //     </Menu>
  //   );
  // }; //右键菜单
  handleOk = () => {
    Modal.confirm({
      title: '确定审核？',
      onOk: () => this.audits,
    });
  };
  drawToolbarPanel = () => {
    var style_map = [
      {
        // 地图背景
        featureType: 'land',
        elementType: 'all',
        stylers: {
          color: '#dee8da',
          lightness: -1,
        },
      },
      {
        // 水路背景
        featureType: 'water',
        elementType: 'all',
        stylers: {
          color: '#a2c4c9ff',
          lightness: -1,
        },
      },
      {
        // 绿地背景
        featureType: 'green',
        elementType: 'all',
        stylers: {
          color: '#ffffccff',
          lightness: -1,
        },
      },
      {
        // 教育地区
        featureType: 'education',
        elementType: 'all',
        stylers: {
          color: '#d5a6bdff',
          lightness: -1,
        },
      },
    ];
    //将样式加载到地图中
    // map.setMapStyleV2({styleJson:eval("style_map")});
    const { selectedRows } = this.state;
    console.log(selectedRows[0]);
    const LONGITUDE = selectedRows[0]?.LONGITUDE;
    const LATITUDE = selectedRows[0]?.LATITUDE;
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
          title={'确认作废？'}
          onConfirm={() => this.cancellation()}
          okText="是"
          cancelText="否"
        >
          <Button type="danger">作废</Button>
        </Popconfirm>
        <Button type="primary" onClick={() => this.historyRef.show()}>
          历史记录
        </Button>
        <Button type="primary" onClick={() => this.refreshTable()}>
          刷新
        </Button>
        <QuickFormModal
          quickuuid={'v_itms_store_address_report'}
          onRef={e => (this.historyRef = e)}
        />
        <Modal
          title="地图审核"
          visible={this.state.Mapvisible}
          onOk={this.handleOk}
          width={'80%'}
          height={'80%'}
          onCancel={() => this.setState({ Mapvisible: false })}
          okText={'审核'}
        >
          <Map
            center={
              selectedRows && selectedRows.length > 0
                ? new BMapGL.Point(selectedRows[0].LONGITUDE, selectedRows[0].LATITUDE)
                : new BMapGL.Point(113.809388, 23.067107)
            }
            zoom={12}
            enableScrollWheelZoom
            // enableAutoResize
            enableRotate={false}
            enableTilt={false}
            style={{ height: 450 }}
            tilt={30}
            mapStyleV2={{ styleJson: eval(style_map) }}
          >
            {selectedRows &&
              selectedRows.length > 0 &&
              selectedRows.map(e => {
                return (
                  <Marker position={new BMapGL.Point(e.LONGITUDE, e.LATITUDE)} enableDragging />
                );
              })}
          </Map>
          {/* <Map
        style={{ height: 450 }}
        center={new BMapGL.Point(116.404449, 39.914889)}
        zoom={12}
        heading={0}
        tilt={40}
        onClick={e => console.log(e)}
        enableScrollWheelZoom
      /> */}
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
