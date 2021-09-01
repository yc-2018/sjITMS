import React from 'react';
import { connect } from 'dva';
import { Tree, Menu, Tabs, Button, message, Empty, Select, Dropdown, Layout } from 'antd';
import emptySvg from '@/assets/common/img_empoty.svg';
import PageLoading from '@/components/PageLoading';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import SiderPage from '@/pages/Component/Page/SiderPage';
import ConfirmProgress from '@/pages/Component/Progress/ConfirmProgress';
import styles from './operationPoint.less';
import OperationPointTable from './OperationPointTable';
import OperationPointCreateModal from './OperationPointCreateModal';
import AreaCreateModal from './AreaCreateModal';
import AreaTable from './AreaTable';
import BinCreateModal from './BinCreateModal';
import BinEditModal from './BinEditModal';
import BinTable from './BinTable';
import GatewayCreateModal from './GatewayCreateModal';
import GatewayTable from './GatewayTable';
import NodeCreateModal from './NodeCreateModal';
import NodeTable from './NodeTable';
import SectionCreateModal from './SectionCreateModal';
import SectionTable from './SectionTable';
import { commonLocale } from '@/utils/CommonLocale';
import operationPointLocal from './OperationPointLocal';
import { formatMessage } from 'umi/locale';
import { operationPointFacility } from './OperationPointContants';
import RemoveModal from './RemoveModal';

const TabPane = Tabs.TabPane;
const { TreeNode } = Tree;
const taskTypeMap = { delete: 'delete' };

@connect(({ operationPoint, facilitiesMaintenance, loading }) => ({
  operationPoint,
  facilitiesMaintenance,
  loading: loading.models.operationPoint,
}))
export default class OperationPoint extends SiderPage {
  constructor(props) {

    super(props);
    this.state = {
      title: operationPointLocal.title,
      selectedKeys: [],
      expandedKeys: [],
      record: {},
      AreaCreateModalVisible: false,
      BinCreateModalVisible: false,
      BinEditModalVisible: false,
      GatewayCreateModalVisible: false,
      NodeCreateModalVisible: false,
      SectionCreateModalVisible: false,
      OperationPointCreateModalVisible: false,

      selectedRows: [],
      operationPointData: {
        list: [],
        pagination: {},
      },
      areaData: {
        list: [],
        pagination: {},
      },
      binData: {
        list: [],
        pagination: {},
      },
      gatewayData: {
        list: [],
        pagination: {},
      },
      nodeData: {
        list: [],
        pagination: {},
      },
      sectionData: {
        list: [],
        pagination: {},
      },
      pageFilter: {
        companyuuid: loginCompany().uuid,
        dcuuid: loginOrg().uuid,
        facilitycls: '',
        facilityuuid: ''
      },
      pageFilter1: {
        page: 0,
        pageSize: 10,
        sortFields: {
          code: true
        },
        searchKeyValues: {
          companyUuid: loginCompany().uuid,
          dcUuid: loginOrg().uuid
        },
      },
      pageFilter2: {
        page: 0,
        pageSize: 10,
        sortFields: {},
        searchKeyValues: {
          companyUuid: loginCompany().uuid,
          dcUuid: loginOrg().uuid
        },
      },
      pageFilter3: {
        page: 0,
        pageSize: 10,
        sortFields: {},
        searchKeyValues: {
          companyUuid: loginCompany().uuid,
          dcUuid: loginOrg().uuid
        },
      },
      pageFilter4: {
        page: 0,
        pageSize: 0,
        sortFields: {},
        searchKeyValues: {
          companyUuid: loginCompany().uuid,
          dcUuid: loginOrg().uuid
        },
      },
      autoExpandParent: true,
      treeData: this.props.operationPoint.data.list,
      code: '',
      operationPointFacilityType: '',
      reShow: false,

      loadingOperationPoint: false,
      loadingArea: false,
      loadingBin: false,
      loadingNode: false,
      loadingSection: false,
      loadingGateway: false,

      // selectedOperationPoint: {},
      // selectedArea: {},
      // selectedBin: {},
      // selectedNode: {},
      // selectedSection: {},
      // selectedGateway: {},
      key: '0',

      operationPointList: [],
      areaList: [],
      binList: [],
      nodeList: [],
      sectionList: [],
      gatewayList: [],

      menuSelectedKeys: [],
      deleteConfirmModalVisible: false,
      batchProcessConfirmModalVisible: false,
      isCloseFailedResultModal: false,
      confirmRemoveVisible: false,
      taskInfo: {
        total: 0,
        type: '',
      },
      failedTasks: [],
    };
  }
  componentDidMount() {
    this.refreshView();
    this.refreshTree();
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      data: newProps.data
    });
  };

  /**
   * 左侧导航栏数据
   */
  refreshTree = () => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;
    pageFilter.facilitycls = 'JOBPOINT';
    dispatch({
      type: 'operationPoint/queryList',
      payload: pageFilter,
      callback: (response) => {
        if (response && response.success) {
          this.setState({
            treeData: response.data
          })
        }
      }
    });
  }

  /**
   * 刷新作业点主界面
   */
  refreshView = () => {
    const { dispatch } = this.props;
    const { pageFilter1, operationPointData } = this.state;
    dispatch({
      type: 'operationPoint/queryOperationPoint',
      payload: pageFilter1,
      callback: response => {
        if (response && response.success && response.data) {
          let data = response.data.records;
          let pagination = {
            total: response.data.paging.recordCount,
            pageSize: response.data.paging.pageSize,
            current: response.data.page + 1,
          };
          operationPointData.list = data;
          operationPointData.pagination = pagination;
          if (data && data.length > 0) {
            this.setState({
              operationPointList: data,
              operationPointData: operationPointData,
              loadingOperationPoint: false,
              // treeData: data
            })
          }
        }
      }
    });
  }

  /**
   * 分区列表数据
   */
  refreshAreaData = () => {
    const { dispatch } = this.props;
    const { pageFilter1, areaData } = this.state;
    dispatch({
      type: 'operationPoint/queryArea',
      payload: pageFilter1,
      callback: response => {
        if (response && response.success && response.data) {
          let data = response.data.records;
          let pagination = {
            total: response.data.paging.recordCount,
            pageSize: response.data.paging.pageSize,
            current: response.data.page + 1,
          };
          areaData.list = data;
          areaData.pagination = pagination;
          if (data && data.length > 0) {
            this.setState({
              areaList: data,
              areaData: areaData,
              loadingArea: false
            })
          }
        }
      }
    });
  }

  /**
   * 结点列表数据
   */
  refreshNodeData = () => {
    const { dispatch } = this.props;
    const { pageFilter3, nodeData } = this.state;
    dispatch({
      type: 'operationPoint/queryNode',
      payload: pageFilter3,
      callback: response => {
        if (response && response.success && response.data) {
          let data = response.data.records;
          let pagination = {
            total: response.data.paging.recordCount,
            pageSize: response.data.paging.pageSize,
            current: response.data.page + 1,
          };
          nodeData.list = data;
          nodeData.pagination = pagination;
          if (data && data.length > 0) {
            this.setState({
              nodeList: data,
              nodeData: nodeData,
              loadingNode: false
            })
          }
        }
      }
    });
  }

  /**
   * 网关列表数据
   */
  refreshGatewayData = () => {
    const { dispatch } = this.props;
    const { pageFilter2, gatewayData } = this.state;
    dispatch({
      type: 'operationPoint/queryGateway',
      payload: pageFilter2,
      callback: response => {
        if (response && response.success && response.data) {
          let data = response.data.records;
          let pagination = {
            total: response.data.paging.recordCount,
            pageSize: response.data.paging.pageSize,
            current: response.data.page + 1,
          };
          gatewayData.list = data;
          gatewayData.pagination = pagination;
          if (data && data.length > 0) {
            this.setState({
              gatewayList: data,
              gatewayData: gatewayData,
              loadingGateway: false
            })
          }
        }
      }
    });
  }

  /**
   * 区段列表数据
   */
  refreshSectionData = () => {
    const { dispatch } = this.props;
    const { pageFilter1, sectionData } = this.state;
    dispatch({
      type: 'operationPoint/querySection',
      payload: pageFilter1,
      callback: response => {
        if (response && response.success && response.data) {
          let data = response.data.records;
          let pagination = {
            total: response.data.paging.recordCount,
            pageSize: response.data.paging.pageSize,
            current: response.data.page + 1,
          };
          sectionData.list = data;
          sectionData.pagination = pagination;
          if (data && data.length > 0) {
            this.setState({
              sectionList: data,
              sectionData: sectionData,
              loadingSection: false
            })
          }
        }
      }
    });
  }

  /**
   * 货位列表数据
   */
  refreshBinData = () => {
    const { dispatch } = this.props;
    const { pageFilter1, binData } = this.state;
    dispatch({
      type: 'operationPoint/queryBin',
      payload: pageFilter1,
      callback: response => {
        if (response && response.success && response.data) {
          let data = response.data.records;
          let pagination = {
            total: response.data.paging.recordCount,
            pageSize: response.data.paging.pageSize,
            current: response.data.page + 1,
          };
          binData.list = data;
          binData.pagination = pagination;
          if (data && data.length > 0) {
            this.setState({
              binList: data,
              binData: binData,
              loadingBin: false
            })
          }
        }
      }
    });
  }

  onExpand = (expandedKeys, treeNode) => {
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });

    if (treeNode.expanded)
      this.onLoadData(treeNode.node);
  };

  onLoadData = (treeNode) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;
    const operationPointFacilityType = treeNode ? treeNode.props.dataRef.cls : null;
    const uuid = treeNode ? treeNode.props.dataRef.uuid : null;
    if(operationPointFacilityType === 'JOBPOINT'){
      pageFilter.facilitycls = 'AREA'
      this.setState({
        selectedOperationPointUuid: uuid,
      });
    } else if (operationPointFacilityType === 'AREA') {
      this.setState({
        selectedAreaUuid: uuid,
      });
      pageFilter.facilitycls = 'SECTION'
    } else if (operationPointFacilityType === 'SECTION') {
      this.setState({
        selectedSectionUuid: uuid,
      });
      pageFilter.facilitycls = 'JOBPOINT'
    }
    pageFilter.facilityuuid = uuid ? uuid : null;
    return new Promise((resolve) => {
      dispatch({
        type: 'operationPoint/queryList',
        payload: pageFilter,
        callback: (response) => {
          if (response && response.success) {
            treeNode.props.dataRef.children = response.data;
            this.setState({
              treeData: [...this.state.treeData],
            });
          }
        }
      });
      resolve();
    })
  }

  onSelect = (selectedKeys, info) => {
    const { dispatch } = this.props;
    const { pageFilter1, pageFilter2, pageFilter3, selectedOperationPointUuid } = this.state;
    const operationPointFacilityType = info.node.props.dataRef.cls;
    const record = info.node.props.dataRef
    const uuid = info.node.props.dataRef.uuid;
    pageFilter1.searchKeyValues = {
      ...pageFilter1.searchKeyValues,
      parentUuid: uuid
    };
    pageFilter2.searchKeyValues = {
      ...pageFilter2.searchKeyValues,
      jobpointUuid: selectedOperationPointUuid ? selectedOperationPointUuid : null
    };
    pageFilter3.searchKeyValues = {
      ...pageFilter3.searchKeyValues,
      facilityUuid: uuid
    };
    let show = this.state.reShow;
    this.setState({
      parentUuid: uuid,
      record: record,
      reShow: !show,
      operationPointFacilityType: operationPointFacilityType,
      selectedKeys: selectedKeys
    })
    this.refreshNodeData();
    if(operationPointFacilityType === 'JOBPOINT') {
      pageFilter2.searchKeyValues = {
        ...pageFilter2.searchKeyValues,
        jobpointUuid: uuid
      };
      this.setState({
        selectedOperationPointUuid: uuid
      })
      this.refreshAreaData();
      this.refreshGatewayData();
    }
    if(operationPointFacilityType === 'AREA') {
      this.refreshSectionData();
      this.refreshGatewayData();
    }
    if(operationPointFacilityType === 'SECTION') {
      this.refreshBinData();
      this.refreshGatewayData();
    }
  };

  /**
   * 获取结点和对应网关信息
   */
  fetchTag = () => {
    const { dispatch } = this.props;
    const { pageFilter4, gatewayData } = this.state;
    const upUuidList = [''];
    if(gatewayData && gatewayData.list && gatewayData.list.length>0) {
      for(let i=0;i<gatewayData.list.length;i++) {
        if(gatewayData.list[i] && gatewayData.list[i].uuid) {
          upUuidList.push(gatewayData.list[i].uuid)
        }
        // upUuidList.push(gatewayData.list[i].uuid)
      }
    }
    if(upUuidList.length >0) {
      pageFilter4.searchKeyValues = {
        ...pageFilter4.searchKeyValues,
        controllerUuid: upUuidList
      }
    }
    dispatch({
      type: 'facilitiesMaintenance/getTag',
      payload: pageFilter4,
      callback: (response) => {
        if (response && response.success) {
          const controllerTagValue = response.data.records;
          const addressList = [];
          if (controllerTagValue && controllerTagValue.length > 0) {
            controllerTagValue.map(item => {
              addressList.push(
                <Select.Option value={item.address} key={item.address}>
                  {item.address}
                </Select.Option>)
            });
          }
          this.setState({
            controllerTagValue: controllerTagValue,
            addressList: addressList
          });
        }
      },
    });
  }

  /**
   * 作业点编辑处理
   * @param record
   */
  handleOperationPointEdit = (record) => {
    this.handleOperationPointModalVisible(true,record)
  }

  handleOperationPointModalVisible = (flag, selectedOperationPoint) => {

    this.setState({
      OperationPointCreateModalVisible: !!flag,
      editOperationPointModal: {
        ...selectedOperationPoint
      },
    });
  }
  /**
   * 分区编辑处理
   * @param record
   */
  handleAreaEdit = (record) => {
    this.handleAreaModalVisible(true,record)
  }

  handleAreaModalVisible = (flag, selectedArea) => {
    this.setState({
      AreaCreateModalVisible: !!flag,
      editAreaModal: {
        ...selectedArea
      },
    });
  }
  /**
   * 区段编辑处理
   * @param record
   */
  handleSectionEdit = (record) => {
    this.handleSectionModalVisible(true,record)
  }

  handleSectionModalVisible = (flag, selectedSection) => {
    this.setState({
      SectionCreateModalVisible: !!flag,
      editSectionModal: {
        ...selectedSection
      },
    });
  }

  /**
   * 结点编辑处理
   * @param record
   */

  handleNodeEdit = (record) => {
    this.handleNodeModalVisible(true,record)
  }

  handleNodeModalVisible = (flag, selectedNode) => {
    this.refreshGatewayData();
    this.fetchTag();
    this.setState({
      NodeCreateModalVisible: !!flag,
      editNodeModal: {
        ...selectedNode
      },
    });
  }

  /**
   * 网关新增
   * @param flag
   */

  handleGatewayModalVisible = (flag) => {
    this.setState({
      GatewayCreateModalVisible: !!flag,
    });
  }

  /**
   * 网关新增 - 取消
   */
  handleAddGatewayCancel = () => {
    this.handleGatewayModalVisible(false);
  }
  /**
   * 货位新增处理
   * @param record
   */
  handleBinAdd = (record) => {
    this.handleBinAddModalVisible(true,record)
  }

  handleBinAddModalVisible = (flag, selectedBin) => {
    this.setState({
      BinCreateModalVisible: !!flag,
      addBinModal: {
        ...selectedBin
      },
    });
  }

  /**
   * 货位编辑处理
   * @param record
   */
  handleBinEdit = (record) => {
    this.handleBinEditModalVisible(true,record)
  }

  handleBinEditModalVisible = (flag, selectedEditBin) => {
    this.refreshGatewayData();
    this.fetchTag();
    this.setState({
      BinEditModalVisible: !!flag,
      editBinModal: {
        ...selectedEditBin
      },
    });
  }

  /**
   * 保存作业点
   */
  handleSaveOperationPoint = (value) => {
    const { dispatch } = this.props;
    value['companyUuid'] = loginCompany().uuid;
    value['dcUuid'] = loginOrg().uuid;
    value['cls'] = 'JOBPOINT';
    dispatch({
      type: 'operationPoint/addOperationPoint',
      payload: value,
      callback: response => {
        if (response && response.success) {
          message.success(formatMessage({ id: 'common.message.success.operate' }));
          this.refreshTree();
          this.refreshView();
          this.setState({
            OperationPointCreateModalVisible: false
          });
        }
      },
    });
  };

  handleSaveArea = (value) => {
    const { dispatch } = this.props;
    const { confirmLoading, parentUuid } = this.state;
    value['companyUuid'] = loginCompany().uuid;
    value['dcUuid'] = loginOrg().uuid;
    value['cls'] = 'AREA';
    value['parentUuid'] = parentUuid;
    this.setState({
      confirmLoading: !confirmLoading,
    })
    dispatch({
      type: 'operationPoint/addArea',
      payload: value,
      callback: (response) => {
        if (response && response.success) {
          message.success(formatMessage({ id: 'common.message.success.operate' }));
          this.refreshTree();
          this.refreshAreaData();
          this.setState({
            AreaCreateModalVisible: false
          });
        }
      },
    });
  }

  handleSaveSection = (value) => {
    const { dispatch } = this.props;
    const { confirmLoading, parentUuid } = this.state;
    value['companyUuid'] = loginCompany().uuid;
    value['dcUuid'] = loginOrg().uuid;
    value['cls'] = 'SECTION';
    value['parentUuid'] = parentUuid;
    this.setState({
      confirmLoading: !confirmLoading,
    })
    dispatch({
      type: 'operationPoint/addSection',
      payload: value,
      callback: (response) => {
        if (response && response.success) {
          message.success(formatMessage({ id: 'common.message.success.operate' }));
          this.refreshTree();
          this.refreshSectionData();
          this.setState({
            SectionCreateModalVisible: false
          });
        }
      },
    });
  }

  handleSaveNode = (value) => {
    const { dispatch } = this.props;
    const { confirmLoading } = this.state;
    this.setState({
      confirmLoading: !confirmLoading,
    })
    dispatch({
      type: 'operationPoint/addNode',
      payload: value,
      callback: (response) => {
        if (response && response.success) {
          message.success(formatMessage({ id: 'common.message.success.operate' }));
          this.refreshTree();
          this.refreshNodeData();
          this.setState({
            NodeCreateModalVisible: false
          });
        }
      },
    });
  }
  /**
   * 作业点添加网关
   * @param list
   */
  handleSaveGateway = (list) => {
    const { dispatch } = this.props;
    const { selectedOperationPointUuid } = this.state;
    dispatch({
      type: 'operationPoint/addGateway',
      payload: {
        uuid: selectedOperationPointUuid,
        controlleruuids: list,
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid
      },
      callback: (response) => {
        if (response && response.success) {
          message.success(commonLocale.saveSuccessLocale);
          this.handleGatewayModalVisible(false);
          this.refreshGatewayData();
        } else {
          message.error(response.message);
        }
      },
    });
  }
  /**
   * 新建货位保存
   * @param value
   */
  handleSaveBin = (value) => {
    const { dispatch } = this.props;
    const { confirmLoading, parentUuid } = this.state;
    value['companyUuid'] = loginCompany().uuid;
    value['dcUuid'] = loginOrg().uuid;
    value['cls'] = 'BIN';
    value['sectionUuid'] = parentUuid;
    value['binPre'] = '';
    this.setState({
      confirmLoading: !confirmLoading,
    })
    dispatch({
      type: 'operationPoint/addBin',
      payload: value,
      callback: (response) => {
        if (response && response.success) {
          message.success(formatMessage({ id: 'common.message.success.operate' }));
          this.refreshTree();
          this.refreshBinData();
          this.setState({
            BinCreateModalVisible: false
          });
        }
      },
    });
  }
  /**
   * 编辑货位保存
   * @param value
   */
  handleEditBin = (value) => {
    const { dispatch } = this.props;
    const { confirmLoading, parentUuid } = this.state;
    value['companyUuid'] = loginCompany().uuid;
    value['dcUuid'] = loginOrg().uuid;
    value['cls'] = 'BIN';
    value['parentUuid'] = parentUuid;
    value['uuid'] = value.uuid;
    this.setState({
      confirmLoading: !confirmLoading,
    })
    dispatch({
      type: 'operationPoint/editBin',
      payload: value,
      callback: (response) => {
        if (response && response.success) {
          message.success(formatMessage({ id: 'common.message.success.operate' }));
          this.refreshTree();
          this.refreshBinData();
          this.setState({
            BinEditModalVisible: false
          });
        }
      },
    });
  }

  handleOperationPointTableChange = (pagination, filtersArg, sorter) => {
    const { pageFilter1 } = this.state;
    this.setState({
      loadingOperationPoint: true
    })
    pageFilter1.page = pagination.current - 1;
    pageFilter1.pageSize = pagination.pageSize;

    if (sorter.field) {
      pageFilter1.sortFields = {};
      var sortField = `${sorter.field}`;
      var sortType = sorter.order === 'descend' ? true : false;
      pageFilter1.sortFields[sortField] = sortType;
    }

    this.setState({
      pageFilter1: pageFilter1
    });

    this.refreshView();
  }

  handleAreaTableChange = (pagination, filtersArg, sorter) => {
    const { pageFilter1 } = this.state;
    this.setState({
      loadingOperationPoint: true
    })
    pageFilter1.page = pagination.current - 1;
    pageFilter1.pageSize = pagination.pageSize;

    if (sorter.field) {
      pageFilter1.sortFields = {};
      var sortField = `${sorter.field}`;
      var sortType = sorter.order === 'descend' ? true : false;
      pageFilter1.sortFields[sortField] = sortType;
    }

    this.setState({
      pageFilter1: pageFilter1
    });

    this.refreshAreaData();
  }

  handleNodeTableChange = (pagination, filtersArg, sorter) => {
    const { pageFilter3 } = this.state;
    this.setState({
      loadingOperationPoint: true
    })
    pageFilter3.page = pagination.current - 1;
    pageFilter3.pageSize = pagination.pageSize;

    if (sorter.field) {
      pageFilter3.sortFields = {};
      var sortField = `${sorter.field}`;
      var sortType = sorter.order === 'descend' ? true : false;
      pageFilter3.sortFields[sortField] = sortType;
    }

    this.setState({
      pageFilter3: pageFilter3
    });

    this.refreshNodeData();
  }

  handleGatewayTableChange = (pagination, filtersArg, sorter) => {
    const { pageFilter2 } = this.state;
    this.setState({
      loadingOperationPoint: true
    })
    pageFilter2.page = pagination.current - 1;
    pageFilter2.pageSize = pagination.pageSize;

    if (sorter.field) {
      var sortField = `${sorter.field}`;
      var sortType = sorter.order === 'descend' ? true : false;
      pageFilter2.sortFields[sortField] = sortType;
    }

    this.setState({
      pageFilter2: pageFilter2
    });

    this.refreshGatewayData();
  }

  handleSectionTableChange = (pagination, filtersArg, sorter) => {
    const { pageFilter1 } = this.state;
    this.setState({
      loadingSection: true
    })
    pageFilter1.page = pagination.current - 1;
    pageFilter1.pageSize = pagination.pageSize;

    if (sorter.field) {
      pageFilter1.sortFields = {};
      var sortField = `${sorter.field}`;
      var sortType = sorter.order === 'descend' ? true : false;
      pageFilter1.sortFields[sortField] = sortType;
    }

    this.setState({
      pageFilter1: pageFilter1
    });

    this.refreshSectionData();
  }

  handleBinTableChange = (pagination, filtersArg, sorter) => {
    const { pageFilter1 } = this.state;
    this.setState({
      loadingBin: true
    })
    pageFilter1.page = pagination.current - 1;
    pageFilter1.pageSize = pagination.pageSize;

    if (sorter.field) {
      pageFilter1.sortFields = {};
      var sortField = `${sorter.field}`;
      var sortType = sorter.order === 'descend' ? true : false;
      pageFilter1.sortFields[sortField] = sortType;
    }

    this.setState({
      pageFilter1: pageFilter1
    });

    this.refreshBinData();
  }

  /**
   * 处理选择
   */
  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  /**
   * 删除处理 - 弹窗显示控制
   */
  handleDeleteModalVisible = (flag) => {
    this.setState({
      deleteConfirmModalVisible: !!flag,
    })
  }

  /**
   * 删除作业点
   * @param record
   * @param isRefreshView
   * @param isRecordCompletion
   */
  handleRemoveOperationPoint = (record, isRefreshView, isRecordCompletion) => {
    const { dispatch } = this.props;

    dispatch({
      type: 'operationPoint/removeOperationPoint',
      payload: {
        uuid: record.uuid,
      },
      callback: response => {
        if (response && response.success) {
          this.setState({
            confirmRemoveVisible: !this.state.confirmRemoveVisible
          })
          if (isRecordCompletion) {
            this.refs.batchHandle.calculateTaskSuccessed();
          }
          if (isRefreshView) {
            this.refreshTree();
            this.refreshView();
          }
        } else {
          if (isRecordCompletion) {
            this.refs.batchHandle.calculateTaskFailed();
            this.collectFaildedTask(record);
          }

          if (isRefreshView) {
            message.error(response.message);
          }
        }
      },
    });
  }

  removeOperationPointForTable = (record, isRefreshView, isRecordCompletion) => {
    const { dispatch } = this.props;

    dispatch({
      type: 'operationPoint/removeOperationPoint',
      payload: {
        uuid: record.uuid,
      },
      callback: response => {
        if (response && response.success) {
          this.setState({
            selectedRows: []
          })
          if (isRecordCompletion) {
            this.refs.batchHandle.calculateTaskSuccessed();
          }
          if (isRefreshView) {
            this.refreshTree();
            this.refreshView();
          }
        } else {
          if (isRecordCompletion) {
            this.refs.batchHandle.calculateTaskFailed();
            this.collectFaildedTask(record);
          }

          if (isRefreshView) {
            message.error(response.message);
          }
        }
      },
    });
  }

  /**
   * 删除分区
   * @param record
   * @param isRefreshView
   * @param isRecordCompletion
   */
  handleRemoveArea = (record, isRefreshView, isRecordCompletion) => {
    const { dispatch } = this.props;

    dispatch({
      type: 'operationPoint/removeArea',
      payload: {
        uuid: record.uuid
      },
      callback: response => {
        if (response && response.success) {
          this.setState({
            record:record,
            operationPointFacilityType: record.cls,
            confirmRemoveVisible: !this.state.confirmRemoveVisible,
            selectedRows: []
          })
          if (isRecordCompletion) {
            this.refs.batchHandle.calculateTaskSuccessed();
          }
          if (isRefreshView) {
            this.refreshTree();
            this.refreshAreaData();
          }
        } else {
          if (isRecordCompletion) {
            this.refs.batchHandle.calculateTaskFailed();
            this.collectFaildedTask(record);
          }

          if (isRefreshView) {
            message.error(response.message);
          }
        }
      },
    });
  }

  removeAreaForTable = (record, isRefreshView, isRecordCompletion) => {
    const { dispatch } = this.props;

    dispatch({
      type: 'operationPoint/removeArea',
      payload: {
        uuid: record.uuid
      },
      callback: response => {
        if (response && response.success) {
          this.setState({
            record:record,
            operationPointFacilityType: record.cls
          })
          if (isRecordCompletion) {
            this.refs.batchHandle.calculateTaskSuccessed();
          }
          if (isRefreshView) {
            this.refreshTree();
            this.refreshAreaData();
          }
        } else {
          if (isRecordCompletion) {
            this.refs.batchHandle.calculateTaskFailed();
            this.collectFaildedTask(record);
          }

          if (isRefreshView) {
            message.error(response.message);
          }
        }
      },
    });
  }

  /**
   * 删除结点
   * @param record
   * @param isRefreshView
   * @param isRecordCompletion
   */
  handleRemoveNode = (record, isRefreshView, isRecordCompletion) => {
    const { dispatch } = this.props;

    dispatch({
      type: 'operationPoint/removeNode',
      payload: {
        uuid: record.equipment.uuid,
      },
      callback: response => {
        if (response && response.success) {
          if (isRecordCompletion) {
            this.refs.batchHandle.calculateTaskSuccessed();
          }
          if (isRefreshView) {
            this.refreshTree();
            this.refreshNodeData();
          }
        } else {
          if (isRecordCompletion) {
            this.refs.batchHandle.calculateTaskFailed();
            this.collectFaildedTask(record);
          }

          if (isRefreshView) {
            message.error(response.message);
          }
        }
      },
    });
  }

  /**
   * 批量删除
   */
  handleBatchDelete = () => {
    const { selectedRows } = this.state;
    if (selectedRows) {
      if(selectedRows[0].cls && selectedRows[0].cls === 'AREA') {
        this.setState({
          key: '1'
        });
        selectedRows.map(item => {
          this.handleRemoveArea(item, false, true);
        });
      }
      if(selectedRows[0].cls && selectedRows[0].cls === 'SECTION') {
        this.setState({
          key: '4'
        });
        selectedRows.map(item => {
          this.handleRemoveSection(item, false, true);
        });
      }
      if(selectedRows[0].port) {
        this.setState({
          key: '3'
        });
        selectedRows.map(item => {
          this.handleRemoveGateway(item, false, true);
        });
      }
      if(selectedRows[0].equipment) {
        this.setState({
          key: '2'
        });
        selectedRows.map(item => {
          this.handleRemoveNode(item, false, true);
        });
      }
      if(selectedRows[0].bin) {
        this.setState({
          key: '5'
        });
        selectedRows.map(item => {
          this.handleRemoveBin(item, false, true);
        });
      }
    }
  }

  /**
   * 删除网关
   * @param record
   * @param isRefreshView
   * @param isRecordCompletion
   */
  handleRemoveGateway = (record, isRefreshView, isRecordCompletion) => {
    const { dispatch } = this.props;
    const { parentUuid } = this.state;

    dispatch({
      type: 'operationPoint/removeGateway',
      payload: {
        jobpointuuid: parentUuid,
        uuid: record.uuid
      },
      callback: response => {
        if (response && response.success) {
          this.setState({
            selectedRows: []
          })
          if (isRecordCompletion) {
            this.refs.batchHandle.calculateTaskSuccessed();
          }
          if (isRefreshView) {
            this.refreshTree();
            this.refreshGatewayData();
          }
        } else {
          if (isRecordCompletion) {
            this.refs.batchHandle.calculateTaskFailed();
            this.collectFaildedTask(record);
          }

          if (isRefreshView) {
            message.error(response.message);
          }
        }
      },
    });
  }

  /**
   * 删除区段
   * @param record
   * @param isRefreshView
   * @param isRecordCompletion
   */
  handleRemoveSection = (record, isRefreshView, isRecordCompletion) => {
    const { dispatch } = this.props;

    dispatch({
      type: 'operationPoint/removeSection',
      payload: {
        uuid: record.uuid,
      },
      callback: response => {
        if (response && response.success) {
          this.setState({
            record:record,
            operationPointFacilityType: record.cls,
            confirmRemoveVisible: !this.state.confirmRemoveVisible
          })
          if (isRecordCompletion) {
            this.refs.batchHandle.calculateTaskSuccessed();
          }
          if (isRefreshView) {
            this.refreshTree();
            this.refreshSectionData();
          }
        } else {
          if (isRecordCompletion) {
            this.refs.batchHandle.calculateTaskFailed();
            this.collectFaildedTask(record);
          }

          if (isRefreshView) {
            message.error(response.message);
          }
        }
      },
    });
  }

  removeSectionForTab = (record, isRefreshView, isRecordCompletion) => {
    const { dispatch } = this.props;

    dispatch({
      type: 'operationPoint/removeSection',
      payload: {
        uuid: record.uuid,
      },
      callback: response => {
        if (response && response.success) {
          this.setState({
            record:record,
            operationPointFacilityType: record.cls
          })
          if (isRecordCompletion) {
            this.refs.batchHandle.calculateTaskSuccessed();
          }
          if (isRefreshView) {
            this.refreshTree();
            this.refreshSectionData();
          }
        } else {
          if (isRecordCompletion) {
            this.refs.batchHandle.calculateTaskFailed();
            this.collectFaildedTask(record);
          }

          if (isRefreshView) {
            message.error(response.message);
          }
        }
      },
    });
  }
  /**
   * 删除货位
   * @param record
   * @param isRefreshView
   * @param isRecordCompletion
   */
  handleRemoveBin = (record, isRefreshView, isRecordCompletion) => {
    const { dispatch } = this.props;

    dispatch({
      type: 'operationPoint/removeBin',
      payload: {
        uuid: record.bin.uuid,
      },
      callback: response => {
        if (response && response.success) {
          this.setState({
            selectedRows: []
          })
          if (isRecordCompletion) {
            this.refs.batchHandle.calculateTaskSuccessed();
          }
          if (isRefreshView) {
            this.refreshTree();
            this.refreshBinData();
          }
        } else {
          if (isRecordCompletion) {
            this.refs.batchHandle.calculateTaskFailed();
            this.collectFaildedTask(record);
          }

          if (isRefreshView) {
            message.error(response.message);
          }
        }
      },
    });
  }

  //  // -----进度条相关计算  开始-----

  /**
   * 收集批量处理产生的失败任务
   */
  collectFaildedTask = (record) => {
    const { failedTasks } = this.state;
    if (failedTasks.indexOf(record) == -1) {
      failedTasks.push(record);
      this.setState({
        failedTasks: failedTasks,
      })
    }
  }

  /**
   * 确认执行任务之前回调
   */
  taskConfirmCallback = () => {
    this.setState({
      batchProcessConfirmModalVisible: false,
    })
  }

  /**
   * 重试取消
   */
  retryCancelCallback = () => {
    this.terminateProgress();
  };

  /**
   * progress流程结束
   */
  terminateProgress = () => {
    const { key } = this.state;
    if (key === '1') {
      this.refreshTree();
      this.refreshAreaData();
    } else if(key === '2') {
      this.refreshTree();
      this.refreshNodeData();
    } else if(key === '3') {
      this.refreshTree();
      this.refreshGatewayData();
    } else if(key === '4') {
      this.refreshTree();
      this.refreshSectionData();
    } else if(key === '5') {
      this.refreshTree();
      this.refreshBinData();
    }
    this.setState({
      batchProcessConfirmModalVisible: false,
      selectedRows: [],
    });
  }

  /**
   * 批量处理弹出框显示处理
   */
  handleBatchProcessConfirmModalVisible = (flag, taskType) => {
    const { selectedRows } = this.state;

    if (selectedRows.length == 0) {
      message.warn(operationPointLocal.progressWarn);
      return;
    }
    if (flag) {
      const { taskInfo } = this.state;
      taskInfo.total = selectedRows.length;
      taskInfo.type = taskType;

      this.setState({
        taskInfo: taskInfo,
      });
    }

    this.setState({
      batchProcessConfirmModalVisible: !!flag,
    });
  };

  handleRemove = (record, operationPointFacilityType) => {
    const { dispatch } = this.props;
    const { confirmLoading } = this.state;

    this.setState({
      confirmLoading: !confirmLoading,
    })
    if(operationPointFacilityType === 'JOBPOINT') {
      this.handleRemoveOperationPoint(record, true)
    } else if(operationPointFacilityType === 'AREA') {
      this.handleRemoveArea(record, true)
    } else if(operationPointFacilityType === 'SECTION') {
      this.handleRemoveSection(record, true)
    }
  }

  handleRemoveModalVisible = () => {
    this.setState({
      confirmRemoveVisible: !this.state.confirmRemoveVisible,
    })
  }

  /**
   * 批量执行具体函数包装
   */
  taskExecutionFuncWrapper = (taskType) => {
    if (taskType === taskTypeMap['delete']) {
      return this.handleBatchDelete;
    }
  }

  /**
   * 任务执行出错时回调，用于重试
   */
  taskFailedCallback = () => {
    const { taskInfo, key, failedTasks } = this.state;

    // 关掉错误提示
    this.setState({
      isCloseFailedResultModal: false,
      batchProcessConfirmModalVisible: false,
    })

    if (failedTasks.length == 1) {
      if (key === '1') {
        switch (taskInfo.type) {
          case taskTypeMap['delete']:
            this.handleRemoveArea(failedTasks[0], true, false);
            break;
          default:
            console.error('错误执行类型');
        }
      } else if(key === '2') {
        switch (taskInfo.type) {
          case taskTypeMap['delete']:
            this.handleRemoveNode(failedTasks[0], true, false);
            break;
          default:
            console.error('错误执行类型');
        }
      } else if(key === '3') {
        switch (taskInfo.type) {
          case taskTypeMap['delete']:
            this.handleRemoveGateway(failedTasks[0], true, false);
            break;
          default:
            console.error('错误执行类型');
        }
      } else if(key === '4') {
        switch (taskInfo.type) {
          case taskTypeMap['delete']:
            this.handleRemoveSection(failedTasks[0], true, false);
            break;
          default:
            console.error('错误执行类型');
        }
      } else if(key === '5') {
        switch (taskInfo.type) {
          case taskTypeMap['delete']:
            this.handleRemoveBin(failedTasks[0], true, false);
            break;
          default:
            console.error('错误执行类型');
        }
      }
    } else if (failedTasks.length > 1) {
      // 将执行失败的任务加入到selectedRows
      this.setState({
        selectedRows: failedTasks,
      })
      // 继续进行批处理
      this.handleBatchProcessConfirmModalVisible(true, taskInfo.type);
    }
  };

  /**
   * 任务全部执行成功时回调
   */
  taskSuccessedCallback = () => {
    this.terminateProgress();
  }

  /**
   * 任务取消执行
   */
  taskCancelCallback = () => {
    this.setState({
      batchProcessConfirmModalVisible: false,
    })
  }

  // -----进度条相关计算  结束-----

  /**
   * 删除处理 - 取消
   */
  handleDeleteCancel = () => {
    this.handleDeleteModalVisible(false);
  }

  /**
   * 删除处理 - 确认
   */
  handleDeleteConfirm = () => {
    // this.handleGatewayRemove(this.state.selectedOperationPoint);
  }

  /**重写部分 开始 */

  onClickMenu = (record, type, { key }) => {
    if (key === '1' && type === 'JOBPOINT') {
      this.props.dispatch({
        type: 'operationPoint/getOperationPoint',
        payload: {
          uuid: record.uuid
        },
        callback: response => {
          if (response && response.success) {
            if (response.data) {
              this.setState({
                record: record
              });
              this.handleOperationPointModalVisible(true, response.data)
            }
          } else {
            message.error(response.message);
          }
        }
      })
      this.setState({
        record: record
      });
      // this.handleOperationPointModalVisible(true, record)
    } else if (key === '1' && type === 'AREA') {
      this.props.dispatch({
        type: 'operationPoint/getArea',
        payload: {
          uuid: record.uuid
        },
        callback: response => {
          if (response && response.success) {
            if (response.data) {
              this.handleAreaModalVisible(true, response.data)
            }
          } else {
            message.error(response.message);
          }
        }
      })
      this.setState({
        record: record
      });
      // this.handleAreaModalVisible(true, record)
    } else if (key === '1' && type === 'SECTION') {
      this.props.dispatch({
        type: 'operationPoint/getSection',
        payload: {
          uuid: record.uuid
        },
        callback: response => {
          if (response && response.success) {
            if (response.data) {
              this.handleSectionModalVisible(true, response.data)
            }
          } else {
            message.error(response.message);
          }
        }
      })
      this.setState({
        record: record
      });
      // this.handleSectionModalVisible(true, record)
    } else if (key === '2') {
      this.setState({
        confirmRemoveVisible: true,
        record: record,
        operationPointFacilityType: type
      })
    }
  };

  /**
   * 绘制左侧导航栏
   */
  drawSider = () => {
    const { expandedKeys, selectedKeys, autoExpandParent, operationPointFacilityType } = this.state;
    const loop = data => data.map((item) => {
      // let type = '';
      let code = '';
      // if (operationPointFacilityType === operationPointFacility.JOBPOINT.name) {
      //   type = operationPointFacility.JOBPOINT.name;
      // } else if (operationPointFacilityType === operationPointFacility.AREA.name) {
      //   type = operationPointFacility.AREA.name;
      // } else if (operationPointFacilityType === operationPointFacility.SECTION.name) {
      //   type = operationPointFacility.SECTION.name;
      // }
      if (item.cls === operationPointFacility.JOBPOINT.name) {
        code = '作业点'+'[' + item.code + ']';
      } else if (item.cls === operationPointFacility.AREA.name) {
        code = '分区'+'[' + item.code + ']';
      } else if (item.cls === operationPointFacility.SECTION.name) {
        code = '区段'+'[' + item.code + ']';
      }
      // let code = '[' + item.code + ']' + item.name;
      const title = <Dropdown overlay={menu(item, item.cls)} trigger={['contextMenu']}>
        <span style={{ userSelect: 'none' }}>{code}</span>
      </Dropdown>
      if (item.children) {
        return (
          <TreeNode title={title} dataRef={item} key={item.code} expanded={true} type={item.cls}>
            {loop(item.children)}
          </TreeNode>
        );
      };
      return <TreeNode dataRef={item} title={title} key={item.code} expanded={true} type={item.cls}
                       isLeaf={item.cls === 'SECTION'} />;
    });
    const menu = (record, type) => (
      <Menu onClick={this.onClickMenu.bind(this, record, type)} >
        <Menu.Item key="1">{'编辑'}</Menu.Item>
        <Menu.Item key="2">{'删除'}</Menu.Item>
      </Menu>
    );
    return (
      <div>
        <div className={styles.createBtnWrapper}>
          <Button className={styles.createBtn} type="primary" ghost
                  onClick={() => this.handleOperationPointModalVisible(true)}>
            {'新建作业点'}
          </Button>
        </div>
        <div className={styles.leftWrapper} style={{
          height: '800px',
          overflow: 'auto',
        }}>
          <Tree
            showLine
            onExpand={this.onExpand}
            expandedKeys={expandedKeys}
            selectedKeys={selectedKeys}
            autoExpandParent={autoExpandParent}
            onSelect={this.onSelect}
          >
            {!this.state.treeData || this.state.treeData.length == 0 ? [] : loop(this.state.treeData)}
          </Tree>
        </div>
      </div>
    );
  }

  /**
   * 绘制其他组件
   */
  drawOtherCom = () => {
    const { deleteConfirmModalVisible, operationPointData, areaData, nodeData, gatewayData,
      batchProcessConfirmModalVisible, taskInfo, OperationPointCreateModalVisible,
      isCloseFailedResultModal, editOperationPointModal, AreaCreateModalVisible, GatewayCreateModalVisible,
      NodeCreateModalVisible, editAreaModal, editNodeModal, editGatewayModal, selectedOperationPoint,
      sectionData, binData, SectionCreateModalVisible, editSectionModal, BinCreateModalVisible,
      editBinModal, record, parentUuid, controllerTagValue, addBinModal, BinEditModalVisible, addressList,
      operationPointFacilityType, confirmRemoveVisible
    } = this.state;
    const createOperationPointMethods = {
      handleOperationPointEdit: this.handleOperationPointEdit,
      handleOperationPointModalVisible: this.handleOperationPointModalVisible,
      defaultSelectedOperationPoint: operationPointData.list,
      handleSaveOperationPoint: this.handleSaveOperationPoint
    };
    const createAreaMethods = {
      parentUuid: parentUuid,
      handleAreaEdit: this.handleAreaEdit,
      handleAreaModalVisible: this.handleAreaModalVisible,
      defaultSelectedArea: areaData.list,
      handleSaveArea: this.handleSaveArea
    };
    const createSectionMethods = {
      parentUuid: parentUuid,
      handleSectionEdit: this.handleSectionEdit,
      handleSectionModalVisible: this.handleSectionModalVisible,
      defaultSelectedSection: sectionData.list,
      handleSaveSection: this.handleSaveSection
    };
    const createNodeMethods = {
      parentUuid: parentUuid,
      dispatch: this.props.dispatch,
      handleNodeEdit: this.handleNodeEdit,
      handleNodeModalVisible: this.handleNodeModalVisible,
      controllerTagValue: controllerTagValue,
      addressList: addressList,
      defaultSelectedNode: nodeData.list,
      handleSaveNode: this.handleSaveNode
    };
    const createGatewayMethods = {
      parentUuid: parentUuid,
      entity: selectedOperationPoint,
      confirmLoading: this.props.loading,
      GatewayCreateModalVisible: GatewayCreateModalVisible,
      dispatch: this.props.dispatch,
      handleAddGatewayCancel: this.handleAddGatewayCancel,
      defaultSelectedGateway: gatewayData.list,
      handleSaveGateway: this.handleSaveGateway
    };
    const createBinMethods = {
      handleSaveBin: this.handleSaveBin,
      handleBinAddModalVisible: this.handleBinAddModalVisible,
    };
    const EditBinMethods = {
      parentUuid: parentUuid,
      handleBinEdit: this.handleBinEdit,
      controllerTagValue: controllerTagValue,
      addressList: addressList,
      handleBinEditModalVisible: this.handleBinEditModalVisible,
      defaultSelectedBin: binData.list,
      handleEditBin: this.handleEditBin,
      handleSaveNode: this.handleSaveNode
    };
    const progressProps = {
      taskInfo: taskInfo,
      entity: operationPointLocal.progressTitle,
      action: operationPointLocal.progressTitle,
      batchProcessConfirmModalVisible: batchProcessConfirmModalVisible,
      isCloseFailedResultModal: isCloseFailedResultModal,
    }
    const progressMethods = {
      taskConfirmCallback: this.taskConfirmCallback,
      taskCancelCallback: this.taskCancelCallback,
      taskFailedCallback: this.taskFailedCallback,
      taskSuccessedCallback: this.taskSuccessedCallback,
      retryCancelCallback: this.retryCancelCallback,
      taskExecutionFunc: this.taskExecutionFuncWrapper(taskInfo.type),
    }
    return (
      <div>
        <OperationPointCreateModal
          {...createOperationPointMethods}
          OperationPointCreateModalVisible={OperationPointCreateModalVisible}
          confirmLoading={this.props.loading}
          editOperationPointModal={editOperationPointModal}
        />
        <AreaCreateModal
          {...createAreaMethods}
          AreaCreateModalVisible={AreaCreateModalVisible}
          confirmLoading={this.props.loading}
          editAreaModal={editAreaModal}
        />
        <SectionCreateModal
          {...createSectionMethods}
          SectionCreateModalVisible={SectionCreateModalVisible}
          confirmLoading={this.props.loading}
          editSectionModal={editSectionModal}
        />
        <NodeCreateModal
          {...createNodeMethods}
          NodeCreateModalVisible={NodeCreateModalVisible}
          confirmLoading={this.props.loading}
          editNodeModal={editNodeModal}
        />
        {GatewayCreateModalVisible && <GatewayCreateModal {...createGatewayMethods} />}
        <BinCreateModal
          {...createBinMethods}
          BinCreateModalVisible={BinCreateModalVisible}
          confirmLoading={this.props.loading}
          addBinModal={addBinModal}
        />
        <BinEditModal
          {...EditBinMethods}
          BinEditModalVisible={BinEditModalVisible}
          confirmLoading={this.props.loading}
          editBinModal={editBinModal}
        />
        <RemoveModal
          ModalTitle={'删除'}
          record={record}
          operationPointFacilityType={operationPointFacilityType}
          confirmRemoveVisible={confirmRemoveVisible}
          handleRemove={this.handleRemove}
          handleRemoveModalVisible={this.handleRemoveModalVisible}
          confirmLoading={this.props.loading}
        />
        <ConfirmProgress {...progressProps} {...progressMethods} ref="batchHandle" />
      </div>
    )
  }

  /**
   * 绘制右侧内容栏
   */
  drawContent = () => {
    /**
     * 右侧内容工具栏
     */
    const { operationPointFacilityType, reShow } = this.state;
    const operationPointProps = {
      handleOperationPointTableChange: this.handleOperationPointTableChange,
      handleSelectRows: this.handleSelectRows,
      handleOperationPointEdit: this.handleOperationPointEdit,
      handleOperationPointModalVisible: this.handleOperationPointModalVisible,
      handleBatchProcessConfirmModalVisible: this.handleBatchProcessConfirmModalVisible,
      loading: this.state.loadingOperationPoint,
      data: this.state.operationPointData,
      selectedRows: this.state.selectedRows,
      handleRemoveOperationPoint: this.handleRemoveOperationPoint,
      removeOperationPointForTable: this.removeOperationPointForTable
    }
    const areaProps = {
      handleAreaTableChange: this.handleAreaTableChange,
      handleSelectRows: this.handleSelectRows,
      handleAreaEdit: this.handleAreaEdit,
      handleAreaModalVisible: this.handleAreaModalVisible,
      handleBatchProcessConfirmModalVisible: this.handleBatchProcessConfirmModalVisible,
      loading: this.state.loadingArea,
      data: this.state.areaData,
      selectedRows: this.state.selectedRows,
      handleRemoveArea: this.handleRemoveArea,
      removeAreaForTable: this.removeAreaForTable
    }
    const sectionProps = {
      handleSectionTableChange: this.handleSectionTableChange,
      handleSelectRows: this.handleSelectRows,
      handleSectionEdit: this.handleSectionEdit,
      handleSectionModalVisible: this.handleSectionModalVisible,
      handleBatchProcessConfirmModalVisible: this.handleBatchProcessConfirmModalVisible,
      loading: this.state.loadingSection,
      data: this.state.sectionData,
      selectedRows: this.state.selectedRows,
      handleRemoveSection: this.handleRemoveSection,
      removeSectionForTab: this.removeSectionForTab
    }
    const nodeProps = {
      handleNodeTableChange: this.handleNodeTableChange,
      handleSelectRows: this.handleSelectRows,
      handleNodeEdit: this.handleNodeEdit,
      handleNodeModalVisible: this.handleNodeModalVisible,
      handleBatchProcessConfirmModalVisible: this.handleBatchProcessConfirmModalVisible,
      loading: this.state.loadingNode,
      data: this.state.nodeData,
      selectedRows: this.state.selectedRows,
      handleRemoveNode: this.handleRemoveNode
    }
    const gatewayProps = {
      handleGatewayTableChange: this.handleGatewayTableChange,
      handleSelectRows: this.handleSelectRows,
      handleGatewayModalVisible: this.handleGatewayModalVisible,
      handleBatchProcessConfirmModalVisible: this.handleBatchProcessConfirmModalVisible,
      loading: this.state.loadingGateway,
      data: this.state.gatewayData,
      selectedRows: this.state.selectedRows,
      handleRemoveGateway: this.handleRemoveGateway
    }
    const binProps = {
      handleBinTableChange: this.handleBinTableChange,
      handleSelectRows: this.handleSelectRows,
      handleBinEdit: this.handleBinEdit,
      handleBinAddModalVisible: this.handleBinAddModalVisible,
      handleBatchProcessConfirmModalVisible: this.handleBatchProcessConfirmModalVisible,
      loading: this.state.loadingBin,
      data: this.state.binData,
      selectedRows: this.state.selectedRows,
      handleRemoveBin: this.handleRemoveBin
    }
    return (
      <div>
        <div className={styles.rightContentWrapper}>
          {operationPointFacilityType==='JOBPOINT' ? <Tabs className={styles.tabsWrapper} defaultActiveKey="1">
            <TabPane tab={operationPointLocal.area} key="1">
              <AreaTable {...areaProps} />
            </TabPane>
            <TabPane tab={operationPointLocal.node} key="2">
              <NodeTable {...nodeProps} />
            </TabPane>
            <TabPane tab={operationPointLocal.gateway} key="3">
              <GatewayTable {...gatewayProps} />
            </TabPane>
          </Tabs> : operationPointFacilityType === 'AREA' ? <Tabs className={styles.tabsWrapper} defaultActiveKey="1">
            <TabPane tab={operationPointLocal.section} key="1">
              <SectionTable {...sectionProps} />
            </TabPane>
            <TabPane tab={operationPointLocal.node} key="2">
              <NodeTable {...nodeProps} />
            </TabPane>
          </Tabs> : operationPointFacilityType === 'SECTION' ?
            <Tabs className={styles.tabsWrapper} defaultActiveKey="1">
              <TabPane tab={operationPointLocal.bin} key="1">
                <BinTable {...binProps} />
              </TabPane>
              <TabPane tab={operationPointLocal.node} key="2">
                <NodeTable {...nodeProps} />
              </TabPane>
            </Tabs> : <Tabs className={styles.tabsWrapper} defaultActiveKey="1">
              <TabPane tab={operationPointLocal.operationPoint} key="1">
                <OperationPointTable {...operationPointProps} />
              </TabPane>
            </Tabs>
          }
        </div>
      </div>
    );
  }

  /**重写部分 结束 */
}
