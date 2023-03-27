/*
 * @Author: guankongjin
 * @Date: 2022-03-10 09:59:43
 * @LastEditors: guankongjin
 * @LastEditTime: 2022-06-28 14:36:08
 * @Description: file content
 * @FilePath: \iwms-web\src\pages\SJTms\LineSystem\LineShipAddress.js
 */
import { connect } from 'dva';
import { Modal, Button, Input, message, Form, Row, Col, Select, TreeSelect, Icon, Menu, Dropdown } from 'antd';
import OperateCol from '@/pages/Component/Form/OperateCol';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/Base/QuickFormSearchPage';
import CreatePageModal from '@/pages/Component/RapidDevelopment/OnlForm/QuickCreatePageModal';
import {
  deleteLineStoreAddressById,
  addToNewLine as addToNewLines,
  findChildLine,
  updateStoreNum,
  inScheduleStore,
  batchDeleteByUuids,
  batchAddScheduleStorePool,
  checkStoreExist,
  switchLineAddress,
  getMatchLine,
  updateNote,
  updateIsNewStore
} from '@/services/sjtms/LineSystemHis';
import { updateStoreAddressList } from '@/services/sjtms/LineSystemHis';
import { dynamicqueryById, dynamicDelete, dynamicQuery } from '@/services/quick/Quick';
import { commonLocale } from '@/utils/CommonLocale';
import TableTransfer from './TableTransfer';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import LineShipAddressPlan from './LineShipAddressPlan';
import AlcNumModal from '@/pages/Wcs/Dps/Job/AlcNumModal';
import { throttleSetter } from 'lodash-decorators';
import SelfTackShipSearchForm from '@/pages/Tms/SelfTackShip/SelfTackShipSearchForm';
import LineSystem from './LineSystem.less'
import {
  findLineSystemTreeByStoreCode,
} from '@/services/sjtms/LineSystemHis';
import { flushSync } from 'react-dom';
@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class LineShipAddress extends QuickFormSearchPage {
  state = {
    ...this.state,
    noActionCol: true,
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
    isModalVisible: false,
    noSettingColumns: true,
    //hasSettingColumns: false,
    canDragTable: true,
    rest: { className: LineSystem.contentWrapglobal }
  };
  constructor(props) {
    super(props);
  }

  //获取列配置
  queryCoulumns = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'quick/queryColumns',
      payload: {
        reportCode: this.state.reportCode,
        sysCode: 'tms',
      },
      callback: response => {
        if (response.result) {
          this.initConfig(response.result);
          //解决用户列展示失效问题 暂时解决方法（赋值两次）
          this.initConfig(response.result);
          //查询必填
          let queryRequired = response.result.columns.find(item => item.searchRequire);

          let companyuuid = response.result.columns.find(
            item => item.fieldName.toLowerCase() == 'companyuuid'
          );
          let orgName =
            loginOrg().type.toLowerCase() == 'dc'
              ? loginOrg().type.toLowerCase() + 'Uuid'
              : 'dispatchcenteruuid';
          let org = response.result.columns.find(item => item.fieldName.toLowerCase() == orgName);

          if (companyuuid) {
            this.state.isOrgQuery = [
              {
                field: 'companyuuid',
                type: 'VarChar',
                rule: 'eq',
                val: loginCompany().uuid,
              },
            ];
          }

          if (org) {
            this.setState({
              isOrgQuery: response.result.reportHead.organizationQuery
                ? [
                  {
                    field:
                      loginOrg().type.toLowerCase() == 'dc'
                        ? loginOrg().type.toLowerCase() + 'Uuid'
                        : 'dispatchCenterUuid',
                    type: 'VarChar',
                    rule: 'like',
                    val: loginOrg().uuid,
                  },
                  ...this.state.isOrgQuery,
                ]
                : [...this.state.isOrgQuery],
            });
          }

          // let defaultSortColumn = response.result.columns.find(item => item.orderType > 1);
          // if (defaultSortColumn) {
          //   let defaultSort =
          //     defaultSortColumn.orderType == 2
          //       ? defaultSortColumn.fieldName + ',ascend'
          //       : defaultSortColumn.fieldName + ',descend';
          //   this.setState({ defaultSort });
          // }

          //查询条件有必填时默认不查询
          //if (queryRequired) return;

          //配置查询成功后再去查询数据
          this.onSearch();

          //扩展State
          this.changeState();
        }
      },
    });
  };
  //遍历树
  getLineSystemTree = (data, itemData, lineData) => {
    let treeNode = [];
    let ef = [];
    if (Array.isArray(data)) {
      data.forEach(e => {
        let temp = {};
        temp.value = e.uuid;
        temp.key = e.uuid;
        temp.title = `[${e.code}]` + e.name;
        temp.icon = <Icon type="swap" rotate={90} />;
        // temp.system=true;
        treeNode.push(temp);
        ef.push(e);
        if (data.type == 'lineSystem') {
          //temp.disabled=true;
          temp.system = true;
          temp.selectable = false;
        }
        data.type = 'line' && lineData.push(e);
      });
      itemData.children = treeNode;
      ef.forEach((f, index) => {
        this.getLineSystemTree(f, treeNode[index], lineData);
      });
    } else {
      itemData.value = data.uuid;
      itemData.key = data.uuid;
      itemData.title = `[${data.code}]` + data.name;
      itemData.icon = <Icon type="swap" rotate={90} />;
      if (data.type == 'lineSystem') {
        itemData.system = true;
        // itemData.disabled=true;
        itemData.selectable = false;
      }
      data.type = 'line' && lineData.push(data);

      if (data.childLines) {
        this.getLineSystemTree(data.childLines, itemData, lineData);
      }
    }
  };
  queryLineSystem = async lineuuid => {
    const parmas = {
      company: loginCompany().uuid,
      dcUuid: loginOrg().uuid,
      code: '',
    };
    await findLineSystemTreeByStoreCode(parmas).then(response => {
      let lineTreeData = [];
      let lineData = [];
      if (response) {
        const data = response?.data;
        data?.forEach(element => {
          let itemData = {};
          this.getLineSystemTree(element, itemData, lineData);
          lineTreeData.push(itemData);
        });
        if (lineuuid == undefined) {
          lineuuid = lineTreeData ? lineTreeData[0].key : undefined;
          // lineuuid = lineTreeData
          //   ? lineTreeData[0]?.children
          //     ? lineTreeData[0].children[0]?.key
          //     : lineTreeData[0]?.key
          //   : undefined;
        }
        this.setState({ systemData: lineTreeData })

      }
    });
  };
  componentDidMount() {
    console.log("componentWillMount", this.props.lineTreeData, this.props);
    this.queryCoulumns();
    this.getCreateConfig();
    this.queryLineSystem();
    // this.setState({
    //   //canDragTable:false,
    //   lineuuid: this.props.lineuuid,
    //   systemLineFlag: this.props.systemLineFlag,
    //   systemData:this.props.lineTreeData
    // });
  }
  // componentWillMount() {
  //   this.setState({
  //     //canDragTable:false,
  //     lineuuid: this.props.lineuuid,
  //     systemLineFlag: this.props.systemLineFlag,
  //     systemData:this.props.lineTreeData
  //   });
  // }
  getLineShipAddress = () => {
    return this.state.data;
  };
  componentWillReceiveProps = async nextProps => {
    if (nextProps.lineuuid != this.props.lineuuid) {
      this.state.lineuuid = nextProps.lineuuid;
      this.state.systemLineFlag = nextProps.systemLineFlag;
      this.state.buttonDisable = false;
      this.state.canDragTable = nextProps.canDragTables;
      //this.state.systemData = nextProps.lineTreeData;
      // if(!this.state.systemData){
      //   this.state.systemData = nextProps.lineTreeData
      // }
      await this.onSearch();
    }
  };
  componentDidUpdate(prevProps, prevState) {
    if (prevState.data?.pagination?.total != this.state.data?.pagination?.total) {
      this.setState({ title: '门店总数：' + this.state.data?.pagination?.total });
    }
  }

  drawcell = event => {
    if (event.column.fieldName == 'ORDERNUM') {
      const component = (
        <span>{event.val}</span>
        // <Input
        //   defaultValue={event.val}
        //   value={event.val}
        //   style={{ width: 50, textAlign: 'center' }}
        //   disabled
        //   onChange={event => {}}
        // />
      );

      event.component = component;
    }

    if (event.column.fieldName == 'TYPE' && this.state.canDragTable) {
      const component = (
        <>
          <Button
            size="small"
            style={{ color: '#3b77e3' }}
            onClick={() => this.fetchOperateSheculeStore(event.record)}
          >
            {'移入待定池'}
          </Button>
          <Button
            size="small"
            style={{ color: '#ef2525' }}
            onClick={() =>
              Modal.confirm({
                title: '是否移除' + event.record.ADDRESSNAME + '门店?',
                onOk: () => {
                  this.handleDelete(event.record.UUID);
                },
              })
            }
          >
            {'移除'}
          </Button>
        </>
      );
      event.component = component;
    }

    if (event.column.fieldName == 'LINECODE') {
      let component = <></>;
      if (new Date(event.record['LASTMODIFIED']).getTime() > new Date().getTime() - 2 * 60 * 1000) {
        component = <span style={{ color: 'red' }}>{event.val}</span>;
      } else {
        component = <span>{event.val}</span>;
      }
      event.component = component;
    }
    if(event.column.fieldName =='ADDRESSNAME' && event.record['ISNEWSTORE'] == 1){
      event.component = <span style={{color:'red'}}>{event.val}</span>
    }
  };

  exSearchFilter = async () => {
    const { systemLineFlag, lineuuid } = this.state;
    if (!lineuuid) {
      return [];
    }
    let parmas = [];
    if (systemLineFlag) {
      parmas = [
        {
          field: 'SYSTEMUUID',
          type: 'VarChar',
          rule: 'eq',
          val: lineuuid,
        },
        // ,{
        //   field: 'DELFLAG',
        //   type: 'VarChar',
        //   rule: 'eq',
        //   val: '1',
        // }
      ];
      return parmas;
    }
    //updateStoreNum({"lineUuid":this.state.lineuuid});

    let e = await findChildLine({ uuid: lineuuid });
    if (e && e.success && e.data) {
      const uuids = e.data
        .map(d => {
          return d.uuid;
        })
        .join('||');
      parmas = [
        {
          field: 'LINEUUID',
          type: 'VarChar',
          rule: 'in',
          val: uuids,
        },
      ];
      // ,{
      //   field: 'DELFLAG',
      //   type: 'VarChar',
      //   rule: 'eq',
      //   val: '1',
      // }]
    }
    return parmas;
  };
  onSearch = async filter => {
    let exSearchFilter = await this.exSearchFilter();
    if (!exSearchFilter) exSearchFilter = [];

    let defaultSearch = this.defaultSearch();
    if (!defaultSearch) defaultSearch = [];
    if (typeof filter == 'undefined') {
      let queryParams = this.state.pageFilters.superQuery?.queryParams?.filter(item => {
        return (
          item.field != 'dispatchCenterUuid' &&
          item.field != 'dcUuid' &&
          item.field != 'companyuuid'
        );
      });
      let pageFilters = this.state.pageFilters;
      if (this.state.pageFilters.superQuery && exSearchFilter.length == 0) {
        pageFilters = {
          ...this.state.pageFilters,
          superQuery: {
            ...this.state.pageFilters.superQuery,
            queryParams: [...queryParams, ...this.state.isOrgQuery],
          },
        };
        this.getData(pageFilters);
      } else {
        this.state.pageFilters = {
          order: this.state.defaultSort,
          quickuuid: this.props.quickuuid,
          superQuery: {
            matchType: '',
            queryParams: [...this.state.isOrgQuery, ...exSearchFilter, ...defaultSearch],
          },
        }; //增加组织 公司id查询条件
        this.getData(this.state.pageFilters);
      }
    } else if (filter == 'reset') {
      //点击重置时，重置搜索条件
      this.state.pageFilters = {
        order: this.state.defaultSort,
        quickuuid: this.props.quickuuid,
        superQuery: {
          matchType: '',
          queryParams: [...this.state.isOrgQuery, ...exSearchFilter, ...defaultSearch],
        },
      }; //增加组织 公司id查询条件
      this.getData(this.state.pageFilters);
    } else {
      const { dispatch } = this.props;
      const { columns } = this.state;
      const pageFilters = {
        ...this.state.pageFilters,
        superQuery: {
          matchType: '',
          queryParams: [...filter.queryParams, ...this.state.isOrgQuery, ...exSearchFilter],
        },
      };
      this.state.pageFilters = pageFilters;
      this.refreshTable();
    }
  };
  drawExColumns = e => {
    // const c = {
    //   title: '移入待定池',
    //   //dataIndex: '移入待定池',
    //   //key: '移入待定池',
    //   sorter: true,
    //   width: colWidth.codeColWidth,
    //   render: (val, record) => {
    //     return (
    //       <a onClick={()=>this.fetchOperateSheculeStore(record)}>
    //         {"移入待定池"}
    //       </a>
    //     );
    //   },
    // };
    // return c;
  };
  //列删除操作
  // renderOperateCol = record => {
  //   return <>
  //   <OperateCol  menus={this.fetchOperatePropsCommon(record)} />
  //   </>

  // };
  fetchOperatePropsCommon = record => {
    return [
      {
        name: '移除',
        onClick: () => {
          Modal.confirm({
            title: '是否移除' + record.ADDRESSNAME + '门店?',
            onOk: () => {
              this.handleDelete(record.UUID);
            },
          });
        },
      },
      {
        name: '移入待定池',
        onClick: () => {
          Modal.confirm({
            title: record.ADDRESSNAME + '是否移入待定池?',
            onOk: () => {
              this.inScheduleStore(record.UUID);
            },
          });
        },
      },
    ];
  };
  fetchOperateSheculeStore = record => {
    Modal.confirm({
      title: record.ADDRESSNAME + '是否移入待定池?',
      onOk: () => {
        this.inScheduleStore(record.UUID);
      },
    });
  };
  //删除执行
  handleDelete = async shipAddressUuid => {
    const { pageFilters } = this.state;
    await deleteLineStoreAddressById(shipAddressUuid).then(result => {
      if (result.success) {
        message.success('删除成功！');
        this.getData(pageFilters);
      } else {
        // message.error('删除失败，请刷新后再操作');
      }
    });
  };
  //添加待排门店池
  inScheduleStore = async shipAddressUuid => {
    const { pageFilters } = this.state;
    await inScheduleStore(shipAddressUuid).then(result => {
      if (result.success) {
        message.success('操作成功');
        this.getData(pageFilters);
      }
    });
  };

  //添加门店
  handleAddStore = () => {
    this.setState({
      modalVisible: true,
      modalTitle: '添加门店',
      modalQuickuuid: 'sj_itms_ship_not_store',
      transferColumnsTitle: '门店',
    });
  };
  //保存
  handleStoreSave = async () => {
    const { targetKeys, transferDataSource, data } = this.state;
    const { lineuuid, linecode } = this.props;
    if (targetKeys.length == 0) {
      return;
    }
    const existdata = await checkStoreExist({ lineUuid: lineuuid, storeuuids: targetKeys });
    if (!existdata?.success) {
      return;
    }
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
          COMPANYUUID: loginCompany().uuid,
          DISPATCHCENTERUUID: loginOrg().uuid,
          LASTMODIFIED: new Date(),
        };
      });
    if (saveData.length > 0) {
      this.saveFormData2(saveData);
      this.setState({ targetKeys: [], transferDataSource: [] });
    } else {
      this.setState({ modalVisible: false });
    }
  };
  saveFormData = async saveData => {
    const { pageFilters } = this.state;
    await updateStoreAddressList({ addressList: saveData }).then(e => {
      if (e && e.success) {
        message.success('修改成功');
        this.setState({ modalVisible: false });
        this.getData(pageFilters);
      } else {
        this.getData(pageFilters);
      }
    });
  };
  saveFormData2 = saveData => {
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
  handleOk = () => { };
  handleCancel = () => {
    this.setState({ isModalVisible: false });
  };
  ofterClosePlan = () => {
    this.onSearch();
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
      systemLineFlag,
      systemData,
      updateNoteVisible
    } = this.state;
    const options = lineData.map(a => {
      return <Select.Option key={a.uuid}>{a.name}</Select.Option>;
    });
    return (
      <div>
        <Modal
          visible={this.state.isModalVisible}
          onOk={this.handleOk.bind()}
          onCancel={this.handleCancel.bind()}
          width={'80%'}
          bodyStyle={{ height: 'calc(80vh)', overflowY: 'auto' }}
          destroyOnClose={true}
          afterClose={this.ofterClosePlan}
          footer={null}
        >
          {/* <CostBillDtlSeacrhPage key={e.UUID} params={e} /> */}
          <LineShipAddressPlan
            //key={e.UUID}
            //showPageNow="query"
            quickuuid="sj_itms_line_shipAddress_plan"
            // location={{ pathname: '1' }}
            lineuuid={this.props.lineuuid}
          //pageFilters={{queryParams :[{field:"systemuuid", type:"VarChar", rule:"eq", val:"000000750000004"}]}}
          />
        </Modal>
        <Modal
          title={modalTitle}
          width={1290}
          visible={modalVisible}
          onOk={this.handleStoreSave}
          confirmLoading={false}
          onCancel={() => this.setState({ modalVisible: false })}
          destroyOnClose={true}
          afterClose={() => this.setState({ targetKeys: [], transferDataSource: [] })}
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
          destroyOnClose={true}
        >
          <Form ref="xlref">
            <Row>
              <Col>
                <Form.Item label="线路">
                  <TreeSelect
                    treeNodeFilterProp="title"
                    showSearch
                    allowClear={true}
                    optionFilterProp="children"
                    treeData={systemData}
                    labelInValue={true}
                    // 将value进行了一层包装，以方便日后扩展
                    value={this.state.lineValue}
                    onChange={this.handleChange}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
        <Modal
          title={modalTitle}
          width={800}
          visible={updateNoteVisible}
          onOk={this.updateNote}
          confirmLoading={false}
          onCancel={() => this.setState({ updateNoteVisible: false })}
          destroyOnClose={true}
        >
          <Row>
            <Col>
              <Form ref="updateNote">
                <Row>
                  <Col>
                    <Input defaultValue={this.state.note} onChange={(e) => this.setState({ note: e.target.value })}></Input>
                  </Col>
                </Row>
              </Form>
            </Col>
          </Row>
        </Modal>
        {this.state.canDragTable && (
          <Button
            type="primary"
            icon="plus"
            onClick={() => this.setState({ isModalVisible: true })}
          >
            待排门店
          </Button>
        )}
        {this.state.canDragTable && (
          <Button type="primary" icon="plus" onClick={this.handleAddStore}>
            添加门店
          </Button>
        )}
        {/* <Button type="primary" icon="plus" onClick={this.handleAddVendor}>
          添加供应商
        </Button> */}
        {<Button onClick={() => this.lineCreatePageModalRef.show()}>添加子路线</Button>}
        <CreatePageModal
          modal={{
            title: '添加子路线',
            width: 500,
            bodyStyle: { marginRight: '40px' },
            afterClose: this.props.showadfa,
          }}
          page={{ quickuuid: 'sj_itms_create_lines', noCategory: true }}
          onRef={node => (this.lineCreatePageModalRef = node)}
        />
      </div>
    );
  };

  // handleSearch = async value => {
  //   if (value) {
  //     await findLineByNameLike(value).then(result => {
  //       if (result && result.data) {
  //         this.setState({ lineData: result.data });
  //       } else {
  //         this.setState({});
  //       }
  //     });
  //   }
  // };
  handleChange = e => {
    this.setState({ lineValue: e });
  };
  updateNote = async () => {
    const { selectedRows, note, pageFilters } = this.state;
    await updateNote({ uuid: selectedRows[0].UUID, note: note }).then(result => {
      if (result.success) {
        message.success('修改成功');
        this.getData(pageFilters);
        this.setState({ updateNoteVisible: false })
      }
    })
  }
  updateIsNewStore = async (e) => {
   
    console.log("e", e);
    const { selectedRows, pageFilters } = this.state;
    if(selectedRows.length ==0){ 
      message.error("请至少选择一条记录")
      return;
    }
    const  uuids = selectedRows.map(e=>e.UUID);
    console.log(uuids);
    await updateIsNewStore({ uuids: uuids, flag: e.key }).then(result => {
      if (result.success) {
        message.success('修改成功');
        this.getData(pageFilters);
      }
    })
  }
  handleAddToNewLine = async () => {
    const { selectedRows, lineValue, pageFilters, lineuuid, addToNewLine } = this.state;
    //true 添加到新线路
    if (addToNewLine) {
      let params = {
        lineUuid: lineValue.value,
        addressIds: selectedRows.map(e => e.UUID),
      };
      await addToNewLines(params).then(result => {
        if (result.success) {
          message.success('添加成功');
          this.getData(pageFilters);
        } else {
          // message.error('添加失败');
        }
        this.setState({
          lineValue: undefined,
          lineData: [],
          selectedRows: [],
          lineModalVisible: false,
        });
      });
    } else {
      let params = {
        sourceLineUuid: lineuuid,
        targetLineUuid: lineValue.value,
      };
      await switchLineAddress(params).then(result => {
        if (result.success) {
          message.success('调换成功');
          this.getData(pageFilters);
        } else {
          // message.error('添加失败');
        }
        this.setState({
          lineValue: undefined,
          lineData: [],
          selectedRows: [],
          lineModalVisible: false,
        });
      });
    }
  };
  //批量删除
  onBatchStoreDelete = async () => {
    const { selectedRows, pageFilters } = this.state;
    if (selectedRows.length == 0) {
      message.info('请选择一条或多条数据');
      return;
    }
    await batchDeleteByUuids({ uuids: selectedRows.map(e => e.UUID) }).then(result => {
      if (result.success) {
        message.success('删除成功！');
        this.getData(pageFilters);
      }
    });
  };
  //批量移入待排池
  onBatchStorePool = async () => {
    const { selectedRows, pageFilters } = this.state;
    if (selectedRows.length == 0) {
      message.info('请选择一条或多条数据');
      return;
    }
    await batchAddScheduleStorePool({ uuids: selectedRows.map(e => e.UUID) }).then(result => {
      if (result.success) {
        message.success('移入成功！');
        this.getData(pageFilters);
      }
    });
  };

  //对调线路门店匹配
  getMatchLine = async () => {
    const { lineuuid } = this.state;
    let res = await getMatchLine(lineuuid);
    if (res.success) {
      this.setState({
        lineValue: { value: res.data.uuid },
      });
    } else {
      this.setState({
        lineValue: '',
      });
    }
    this.setState({
      lineModalVisible: true,
      addToNewLine: false,
    });
  };

  drawToolbarPanel = () => {
    const { buttonDisable } = this.state;
    const menu = <Menu onClick={ this.updateIsNewStore}>
      <Menu.Item key="1">标记</Menu.Item>
      <Menu.Item key="0">取消标记</Menu.Item>

    </Menu>
    return (
      <>
        {buttonDisable ? <Button onClick={this.tableSortSave}>排序并保存</Button> : <></>}
        {this.state.canDragTable && (
          <>
            <Button
              onClick={() =>
                Modal.confirm({
                  title: '确定批量删除这' + this.state.selectedRows.length + '条吗？',
                  onOk: () => {
                    this.onBatchStoreDelete();
                  },
                })
              }
            >
              批量移除
            </Button>
            <Button
              onClick={() =>
                Modal.confirm({
                  title: '确定移入这' + this.state.selectedRows.length + '条到待排池吗？',
                  onOk: () => {
                    this.onBatchStorePool();
                  },
                })
              }
            >
              批量移入待排池
            </Button>
            <Button onClick={this.getMatchLine}>对调线路</Button>
            <Button
              onClick={() => {
                if (this.state.selectedRows.length == 0) {
                  message.info('请选择记录');
                  return;
                }
                this.setState({ lineModalVisible: true, addToNewLine: true });
              }}
            >
              移入到新线路
            </Button>
            

          </>
        )}
        <Button
              onClick={() => {
                if (this.state.selectedRows.length == 0) {
                  message.info('请选择记录');
                  return;
                }
                this.setState({ updateNoteVisible: true, note: this.state.selectedRows[0].NOTE });
              }}
            >
              编辑备注
            </Button>
            <Dropdown overlay={menu}>
              <Button>
                标记新门店 <Icon type="down" />
              </Button>
            </Dropdown>
      </>
    );
  };

  //拖拽排序
  drapTableChange = list => {
    const { data } = this.state;
    data.list = list.map((record, index) => {
      record.ORDERNUM = index + 1;
      let linecode = record.LINECODE;
      linecode = linecode.substr(0, linecode.lastIndexOf('-'));
      linecode = linecode + '-' + this.addZero(record.ORDERNUM);
      record.LINECODE = linecode;
      return record;
    });
    this.saveFormData(data.list);
    //this.setState({ buttonDisable: true });
    //this.saveFormData(data.list);
  };

  addZero = num => {
    if (num < 10) {
      return '00' + num;
    } else if (num < 100) {
      return '0' + num;
    } else if (num < 1000) {
      return num;
    }
  };

  tableSortSave = () => {
    const { data } = this.state;
    this.saveFormData(data.list);
  };
}
