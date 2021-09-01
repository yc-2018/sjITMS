import React from 'react';
import { connect } from 'dva';
import { Menu, Tabs, Button, message, Empty, Input, Tree, Dropdown } from 'antd';
import emptySvg from '@/assets/common/img_empoty.svg';
import PageLoading from '@/components/PageLoading';
import { loginCompany, loginOrg, loginUser } from '@/utils/LoginContext';
import SiderPage from '@/pages/Component/Page/SiderPage';
import ConfirmProgress from '@/pages/Component/Progress/ConfirmProgress';
import { havePermission } from '@/utils/authority';
import { commonLocale } from '@/utils/CommonLocale';
import FacilitiesCreateModal from './FacilitiesCreateModal';
import TagCreateModal from './TagCreateModal';
import TagEditModal from './TagEditModal';
import RemoveFacilitiesModal from './RemoveFacilitiesModal';
import styles from './FacilitiesMaintenance.less';
import FacilitiesMaintenanceTable from './FacilitiesMaintenanceTable';
import FacilitiesMaintenanceTagTable from './FacilitiesMaintenanceTagTable';
import LightStepTable from './LightStepTable';
import facilitiesMaintenanceLocale from './FacilitiesMaintenanceLocale';
import LightStepCreateModal from './LightStepCreateModal';
import RemoveModal from './RemoveModal';
const { SubMenu } = Menu;
const TabPane = Tabs.TabPane;
const { TreeNode } = Tree;
const taskTypeMap = { delete: 'delete' };

@connect(({ facilitiesMaintenance, loading }) => ({
  facilitiesMaintenance,
  loading: loading.models.facilitiesMaintenance,
}))
export default class FacilitiesMaintenance extends SiderPage {
  constructor(props) {

    super(props);
    this.state = {
      title: facilitiesMaintenanceLocale.title,
      directory: [],
      selectedKeys: [],
      expandedKeys: [],
      selectedRows: [],
      tagData: {
        list: [],
        pagination: {},
      },
      controllerData: {
        list: [],
        pagination: {},
      },
      lightStepData: {
        list: [],
        pagination: {},
      },
      pageListFilter: {
        dcuuid: loginOrg().uuid,
        uuid: '',
      },
      pageFilter: {
        page: 0,
        pageSize: 10,
        sortFields: {
        },
        searchKeyValues: {
          companyUuid: loginCompany().uuid,
          dcUuid: loginOrg().uuid
        }
      },
      pageLightStepFilter: {
        page: 0,
        pageSize: 0,
        sortFields: {
        },
        searchKeyValues: {
          dcUuid: loginOrg().uuid,
        }
      },
      pageTagFilter: {
        page: 0,
        pageSize: 10,
        sortFields: {
          address: true
        },
        searchKeyValues: {
          companyUuid: loginCompany().uuid,
          dcUuid: loginOrg().uuid
        }
      },
      editController: {},
      editFacilitiesMaintenance: {},
      selectedLightStep: {},
      selectedFacilitiesMaintenance: {},
      selectedTag: {},
      facilitiesMaintenanceTags: [],
      facilitiesMaintenanceController: [],
      facilitiesLightStep: [],
      menuSelectedKeys: [],
      loadingLightStep: false,
      loadingController: false,
      loadingTag: false,
      createModalVisible: false,
      creatTagModalVisible: false,
      creatLightStepModalVisible: false,
      editTagModalVisible: false,
      deleteConfrimModalVisible: false,
      confirmRemoveVisible: false,
      batchProcessConfirmModalVisible: false,
      isCloseFailedResultModal: false,
      showTagView: false,
      depth: 0,
      taskInfo: {
        total: 0,
        type: '',
      },
      failedTasks: [],
    };
  }
  componentDidMount() {
    this.refreshLightStepView();
    this.refreshTree();
  }

  /**
   * 左侧导航栏数据
   */
  refreshTree = () => {
    const { dispatch } = this.props;
    const { pageListFilter } = this.state;
    pageListFilter.uuid = '';
    dispatch({
      type: 'facilitiesMaintenance/queryList',
      payload: pageListFilter,
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
   * 初始化网关服务页面
   */
  refreshLightStepView = () => {
    const { dispatch } = this.props;
    const { pageLightStepFilter, lightStepData } = this.state;
    pageLightStepFilter.sortFields = {
      code: true
    };
    dispatch({
      type: 'facilitiesMaintenance/queryLightStep',
      payload: pageLightStepFilter,
      callback: response => {
        if (response && response.success && response.data) {
          let list = response.data.records;
          let pagination = {
            total: response.data.paging.recordCount,
            pageSize: response.data.paging.pageSize,
            current: response.data.page + 1,
          };
          lightStepData.list = list;
          lightStepData.pagination = pagination;
          if (list && list.length > 0) {
            this.setState({
              facilitiesLightStep: list,
              lightStepData: lightStepData,
              loadingLightStep: false
            })
          }
        } else {
          this.setState({
            noData: true,
            showTagView: false
          })
        }
      }
    });
  }

  /**
   * 初始化网关页面
   */
  refreshView = () => {
    const { dispatch } = this.props;
    const { pageFilter, controllerData } = this.state;
    pageFilter.sortFields = {
      code: true
    };
    dispatch({
      type: 'facilitiesMaintenance/query',
      payload: pageFilter,
      callback: response => {
        if (response && response.success && response.data) {
          let list = response.data.records;
          let pagination = {
            total: response.data.paging.recordCount,
            pageSize: response.data.paging.pageSize,
            current: response.data.page + 1,
          };
          controllerData.list = list;
          controllerData.pagination = pagination;
          if (list && list.length > 0) {
            this.setState({
              facilitiesMaintenanceController: list,
              controllerData: controllerData,
              loadingController: false
            })
          }
        }
      }
    });
  }

  getOneLightStep = (uuid) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'facilitiesMaintenance/getLightStep',
      payload: uuid,
      callback: response => {
        if (response && response.success) {
          if (response.data) {
            this.setState({
              selectedLightStep: response.data,
            })
          }
        } else {
          message.error(response.message);
        }
      }
    });
  }

  getOneGateWay = (uuid) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'facilitiesMaintenance/get',
      payload: uuid,
      callback: response => {
        if (response && response.success) {
          if (response.data) {
            this.setState({
              selectedFacilitiesMaintenance: response.data,
            })
          }
        } else {
          message.error(response.message);
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
    const { pageListFilter } = this.state;
    const uuid = treeNode ? treeNode.props.dataRef.uuid : null;
    const depth = treeNode ? treeNode.props.depth : null;
    pageListFilter.uuid = uuid ? uuid : null;
    if (depth && depth===1) {
      this.setState({
        selectedLightStepUuid: uuid
      })
    }
    return new Promise((resolve) => {
      dispatch({
        type: 'facilitiesMaintenance/queryList',
        payload: pageListFilter,
        callback: (response) => {
          if (response && response.success) {
            treeNode.props.dataRef.children = response.data;
            this.setState({
              treeData: [...this.state.treeData]
            });
          }
        }
      });
      resolve();
    })
  }


  onSelect = (selectedKeys, info) => {
    const uuid = info.node.props.dataRef.uuid;
    const pos = info.node.props.pos;
    const depth = info.node.props.depth;
    const record = info.node.props.dataRef;
    const { pageFilter } = this.state;
    this.setState({
      selectedKeys: selectedKeys
    })
    if (depth && depth === 1) {
      pageFilter.searchKeyValues = {
        ...pageFilter.searchKeyValues,
        lightStepUuid: uuid
      };
      this.setState({
        selectedLightStepUuid: uuid,
        record: record,
        depth: depth
      })
      this.refreshView();
      this.getOneLightStep(uuid);
    } else if(depth && depth === 2) {
      this.setState({
        selectedFacilitiesMaintenanceUuid: uuid,
        depth: depth
      });
      this.getOneGateWay(uuid);
      this.fetchTagByFacilitiesMaintenanceUuid(uuid)
    }
  }

  fetchTagByFacilitiesMaintenanceUuid = (controllerUuid) => {
    const { dispatch } = this.props;
    const { tagData, pageTagFilter } = this.state;
    this.setState({
      loadingTag: true,
    })
    pageTagFilter.searchKeyValues['controllerUuid'] = [controllerUuid];
    dispatch({
      type: 'facilitiesMaintenance/getTag',
      payload: pageTagFilter,
      callback: response => {
        if (response && response.success) {
          let list = response.data.records;
          let pagination = {
            total: response.data.paging.recordCount,
            pageSize: response.data.paging.pageSize,
            current: response.data.page + 1,
          };

          tagData.list = list;
          tagData.pagination = pagination

          this.setState({
            showTagView: true,
            tagData: tagData,
            loadingTag: false
          });
        }
      }
    });
  }

  handleTagTableChange = (pagination, filtersArg, sorter) => {
    const { pageTagFilter, selectedFacilitiesMaintenance } = this.state;
    this.setState({
      loadingTag: true
    })
    pageTagFilter.page = pagination.current - 1;
    pageTagFilter.pageSize = pagination.pageSize;

    if (sorter.field) {
      pageTagFilter.sortFields = {};
      var sortField = `${sorter.field}`;
      var sortType = sorter.order === 'descend' ? true : false;
      pageTagFilter.sortFields[sortField] = sortType;
    }

    this.setState({
      pageTagFilter: pageTagFilter,
    });
    this.fetchTagByFacilitiesMaintenanceUuid(selectedFacilitiesMaintenance.uuid);
  }

  handleControllerTableChange = (pagination, filtersArg, sorter) => {
    const { pageFilter } = this.state;
    this.setState({
      loadingController: true
    })
    pageFilter.page = pagination.current - 1;
    pageFilter.pageSize = pagination.pageSize;

    if (sorter.field) {
      var sortField = `${sorter.field}`;
      var sortType = sorter.order === 'descend' ? true : false;
      pageFilter.sortFields[sortField] = sortType;
    }

    this.setState({
      pageFilter: pageFilter,
    });

    this.refreshView();
  }

  handleLightStepTableChange = (pagination, filtersArg, sorter) => {
    const { pageLightStepFilter } = this.state;
    this.setState({
      loadingLightStep: true
    })
    pageLightStepFilter.page = pagination.current - 1;
    pageLightStepFilter.pageSize = pagination.pageSize;

    if (sorter.field) {
      var sortField = `${sorter.field}`;
      var sortType = sorter.order === 'descend' ? true : false;
      pageLightStepFilter.sortFields[sortField] = sortType;
    }

    this.setState({
      pageLightStepFilter: pageLightStepFilter,
    });

    this.refreshLightStepView();
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
      deleteConfrimModalVisible: !!flag,
    })
  }

  /**
   * 批量删除
   */
  handleBatchRemove = () => {
    const { selectedRows } = this.state;
    if (selectedRows) {
      if(selectedRows[0].port) {
        this.setState({
          key: '1'
        });
        selectedRows.map(item => {
          this.handleControllerRemove(item, false, true);
        });
      }
      if(selectedRows[0].cls) {
        this.setState({
          key: '2'
        });
        selectedRows.map(item => {
          this.handleRemoveTag(item, false, true);
        });
      }
    }
  }

  /**
   * 删除标签
   * @param {Object} record 要删除的当前对象
   * @param {Boolean} isRefreshTable 是否刷新表格
   * @param {Boolean} isRecordCompletion 是否记录该任务已经完成
   */
  handleRemoveTag = (record, isRefreshView, isRecordCompletion) => {
    const { dispatch } = this.props;
    const { selectedFacilitiesMaintenance } = this.state;
    dispatch({
      type: 'facilitiesMaintenance/removeTag',
      payload: {
        uuid: record.uuid
      },
      callback: response => {
        if (response && response.success) {
          if (isRecordCompletion) {
            this.refs.batchHandle.calculateTaskSuccessed();
          }
          if (isRefreshView) {
            this.fetchTagByFacilitiesMaintenanceUuid(selectedFacilitiesMaintenance.uuid);
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
   * 编辑网关服务处理
   */
  handleEditLightStep = value => {
    this.handleCreateLightStepModalVisible(true, value);
  };

  /**
   * 网关服务新增编辑弹窗显示控制
   */
  handleCreateLightStepModalVisible = (flag, lightStep) => {
    this.setState({
      creatLightStepModalVisible: !!flag,
      editLightStep: {
        ...lightStep
      },
    });
  };

  /**
   * 编辑控制器处理
   */
  handleEdit = value => {
    this.handleCreateModalVisible(true, value);
  };

  /**
   * 控制器新增编辑弹窗显示控制
   */
  handleCreateModalVisible = (flag, facilitiesMaintenance) => {
    this.setState({
      createModalVisible: !!flag,
      editController: {
        ...facilitiesMaintenance
      },
    });
  };
  /**
   * 标签编辑处理
   */
  handleTagEdit = (record) => {
    this.handleTagEditModalVisible(true, record);
  };

  /**
   * 标签编辑弹窗显示控制
   */
  handleTagEditModalVisible = (flag, selectedTag) => {
    this.setState({
      editTagModalVisible: !!flag,
      editTagModal: {
        ...selectedTag
      },
    });
  };
  /**
   * 标签新增处理
   */
  handleTagAdd = value => {
    this.handleTagCreateModalVisible(true, value);
  };

  /**
   * 标签新增弹窗显示控制
   */
  handleTagCreateModalVisible = (flag, addTagModal) => {
    this.setState({
      creatTagModalVisible: !!flag,
      addTagModal: {
        ...addTagModal
      },
    });
  };

  /**
   * 保存控制器
   */
  handleSave = value => {
    const { dispatch } = this.props;
    const { selectedLightStepUuid, pageListFilter } = this.state;
    value['companyUuid'] = loginCompany().uuid;
    value['dcUuid'] = loginOrg().uuid;
    value['lightStepUuid'] = selectedLightStepUuid;
    dispatch({
      type: 'facilitiesMaintenance/saveController',
      payload: value,
      callback: response => {
        if (response && response.success) {
          this.refreshTree();
          this.refreshView();
          this.setState({
            createModalVisible: false,
          });
        }
      },
    });
  };

  /**
   * 保存网关服务
   */
  handleSaveLightStep = value => {
    const { dispatch } = this.props;
    const { pageListFilter } = this.state;
    value['companyUuid'] = loginCompany().uuid;
    value['dcUuid'] = loginOrg().uuid;
    dispatch({
      type: 'facilitiesMaintenance/saveLightStep',
      payload: value,
      callback: response => {
        if (response && response.success) {
          this.refreshTree();
          this.refreshLightStepView();
          this.setState({
            creatLightStepModalVisible: false,
          });
        }
      },
    });
  };

  /**
   * 新建标签保存
   */
  handleSaveTag = value => {
    const { dispatch } = this.props;
    const { selectedFacilitiesMaintenance } = this.state;
    value['companyUuid'] = loginCompany().uuid;
    value['dcUuid'] = loginOrg().uuid;
    value['controllerUuid'] = selectedFacilitiesMaintenance.uuid;
    dispatch({
      type: 'facilitiesMaintenance/addTag',
      payload: value,
      callback: response => {
        if (response && response.success) {
          this.fetchTagByFacilitiesMaintenanceUuid(selectedFacilitiesMaintenance.uuid);
          this.setState({
            creatTagModalVisible: false,
            showTagView: true
          });
        }
      },
    });
  };
  /**
   * 编辑标签保存
   */
  handleEditTag = value => {
    const { dispatch } = this.props;
    const { selectedFacilitiesMaintenance } = this.state;
    value['companyUuid'] = loginCompany().uuid;
    value['uuid'] = value.uuid;
    value['dcUuid'] = loginOrg().uuid;
    value['controllerUuid'] = selectedFacilitiesMaintenance.uuid;
    dispatch({
        type: 'facilitiesMaintenance/saveTag',
        payload: value,
        callback: response => {
          if (response && response.success) {
            this.fetchTagByFacilitiesMaintenanceUuid(selectedFacilitiesMaintenance.uuid);
            this.setState({
              editTagModalVisible: false,
              showTagView: true
            });
          }
        },
    });
  };

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
    const { depth, selectedFacilitiesMaintenanceUuid } = this.state;
    if (depth && depth === 1) {
      this.refreshTree();
      this.refreshView();
    } else if (depth && depth === 2) {
      this.refreshTree();
      this.fetchTagByFacilitiesMaintenanceUuid(selectedFacilitiesMaintenanceUuid);
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
      message.warn(facilitiesMaintenanceLocale.progressWarn);
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

  /**
   * 批量执行具体函数包装
   */
  taskExecutionFuncWrapper = (taskType) => {
    if (taskType === taskTypeMap['delete']) {
      return this.handleBatchRemove;
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
            this.handleControllerRemove(failedTasks[0], true, false);
            break;
          default:
            console.error('错误执行类型');
        }
      } else if(key === '2') {
        switch (taskInfo.type) {
          case taskTypeMap['delete']:
            this.handleRemoveTag(failedTasks[0], true, false);
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
    // this.handleControllerRemove(this.state.selectedFacilitiesMaintenance);
  }

  /**
   * 控制器删除处理
   */
  handleControllerRemove = (record, isRefreshView, isRecordCompletion) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'facilitiesMaintenance/remove',
      payload: {
        uuid: record.uuid
      },
      callback: response => {
        if (response && response.success) {
          if(record.depth) {
            this.setState({
              confirmRemoveVisible: !this.state.confirmRemoveVisible
            })
          }
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
   * 网关服务删除处理
   */
  handleLightStepRemove = (record, isRefreshView, isRecordCompletion) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'facilitiesMaintenance/removeLightStep',
      payload: {
        uuid: record.uuid
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
            this.refreshLightStepView();
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

  handleRemove = (record, depth) => {
    const { confirmLoading } = this.state;

    this.setState({
      confirmLoading: !confirmLoading,
    })
    if(depth === 1) {
      this.handleLightStepRemove(record, true)
    } else if(depth === 2) {
      this.handleControllerRemove(record, true)
    }
  };

  handleRemoveModalVisible = () => {
    this.setState({
      confirmRemoveVisible: !this.state.confirmRemoveVisible,
    })
  };

  drawOtherCom = () => {
    const { createModalVisible, editController, selectedFacilitiesMaintenance, deleteConfrimModalVisible, tagData,
      batchProcessConfirmModalVisible, taskInfo, action, isCloseFailedResultModal, creatLightStepModalVisible,
      creatTagModalVisible, editTagModalVisible, addTagModal, editTagModal, editLightStep, record, depth,
      confirmRemoveVisible, selectedLightStep, lightStepUuid
    } = this.state;
    const createParentMethods = {
      entity: selectedFacilitiesMaintenance,
      handleSave: this.handleSave,
      handleCreateModalVisible: this.handleCreateModalVisible,
    };
    const lightStepCreateParentMethods = {
      entity: selectedLightStep,
      handleSaveLightStep: this.handleSaveLightStep,
      handleCreateLightStepModalVisible: this.handleCreateLightStepModalVisible,
    };
    const tagCreateParentMethods = {
      handleSaveTag: this.handleSaveTag,
      handleTagCreateModalVisible: this.handleTagCreateModalVisible,
    };
    const tagEditParentMethods = {
      entity: selectedFacilitiesMaintenance,
      handleTagEdit: this.handleTagEdit,
      handleEditTag: this.handleEditTag,
      handleTagEditModalVisible: this.handleTagEditModalVisible,
      defaultSelectedTag: tagData.list
    };
    const deleteConfrimModalProps = {
      entity: selectedFacilitiesMaintenance,
      confirmLoading: this.props.loading,
      deleteConfrimModalVisible: deleteConfrimModalVisible,
      handleDeleteConfirm: this.handleDeleteConfirm,
      handleDeleteCancel: this.handleDeleteCancel,
    };
    const progressProps = {
      taskInfo: taskInfo,
      entity: facilitiesMaintenanceLocale.progressTitle,
      action: facilitiesMaintenanceLocale.progressTitle,
      batchProcessConfirmModalVisible: batchProcessConfirmModalVisible,
      isCloseFailedResultModal: isCloseFailedResultModal,
    };
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
        <FacilitiesCreateModal
          {...createParentMethods}
          createModalVisible={createModalVisible}
          confirmLoading={this.props.loading}
          controller={editController}
        />
        <TagCreateModal
          {...tagCreateParentMethods}
          creatTagModalVisible={creatTagModalVisible}
          confirmLoading={this.props.loading}
          addTagModal={addTagModal}
        />
        <TagEditModal
          {...tagEditParentMethods}
          editTagModalVisible={editTagModalVisible}
          confirmLoading={this.props.loading}
          editTagModal={editTagModal}
        />
        <LightStepCreateModal
          {...lightStepCreateParentMethods}
          creatLightStepModalVisible={creatLightStepModalVisible}
          confirmLoading={this.props.loading}
          editLightStep={editLightStep}
        />
        <RemoveModal
          ModalTitle={'删除'}
          record={record}
          depth={depth}
          confirmRemoveVisible={confirmRemoveVisible}
          handleRemove={this.handleRemove}
          handleRemoveModalVisible={this.handleRemoveModalVisible}
          confirmLoading={this.props.loading}
        />
        {/*<RemoveFacilitiesModal {...deleteConfrimModalProps} />*/}
        <ConfirmProgress {...progressProps} {...progressMethods} ref="batchHandle" />
      </div>
    )
  }

  /**
   * 绘制空数据界面
   */
  drawNoData = () => {
    if (this.props.loading) {
      return <PageLoading />;
    } else {
      return <Empty
        image={emptySvg}
        style={{ position: 'absolute', top: '30%', left: '45%' }}
        description={
          <span>
            {facilitiesMaintenanceLocale.noData}
          </span>
        }
      >
        <Button
          type="primary"
          icon="plus"
          onClick={() => this.handleCreateModalVisible(true)}>
          {facilitiesMaintenanceLocale.createTag}
        </Button>
      </Empty>
    }
  }

  onClickMenu = (record, depth, { key }) => {
    if (key === '1' && depth === 1) {
      this.props.dispatch({
        type: 'facilitiesMaintenance/getLightStep',
        payload: record.uuid,
        callback: response => {
          if (response && response.success) {
            if (response.data) {
              this.setState({
                selectedLightStep: response.data,
              })
              this.handleCreateLightStepModalVisible(true, response.data)
            }
          } else {
            message.error(response.message);
          }
        }
      })
      this.setState({
        record: record
      })
    } else if (key === '1' && depth === 2) {
      this.props.dispatch({
        type: 'facilitiesMaintenance/get',
        payload: record.uuid,
        callback: response => {
          if (response && response.success) {
            if (response.data) {
              this.setState({
                selectedFacilitiesMaintenance: response.data,
              })
              this.handleCreateModalVisible(true, response.data)
            }
          } else {
            message.error(response.message);
          }
        }
      });
      this.setState({
        createModalVisible: true,
        record: record
      })
    } else if (key === '2') {
      this.setState({
        confirmRemoveVisible: true,
        record: record,
        depth: depth
      })
    }
  };

  /**
   * 绘制左侧导航栏
   */
  drawSider = () => {
    const { expandedKeys, selectedKeys, autoExpandParent } = this.state;
    const loop = data => data.map((item) => {
      let code = '';
      let record = {};
      if (item.depth === 1) {
        code = '网关服务'+'[' + item.code + ']'
      } else if (item.depth === 2) {
        code = '网关'+'[' + item.code + ']'
      }
      const title = <Dropdown overlay={menu(item, item.depth)} trigger={['contextMenu']}>
        <span style={{ userSelect: 'none' }}>{code}</span>
      </Dropdown>
      if (item.children) {
        return (
          <TreeNode title={title} dataRef={item} key={item.code} expanded={true} depth={item.depth}>
            {loop(item.children)}
          </TreeNode>
        );
      };
      return <TreeNode dataRef={item} title={title} key={item.code} expanded={true} depth={item.depth}
                       isLeaf={item.depth === 2} />;
    });
    const menu = (record, depth) => (
      <Menu onClick={this.onClickMenu.bind(this, record, depth)} >
        <Menu.Item key="1">{'编辑'}</Menu.Item>
        <Menu.Item key="2">{'删除'}</Menu.Item>
      </Menu>
    );
    return (
      <div>
        <div className={styles.createBtnWrapper}>
          <Button className={styles.createBtn} type="primary" ghost
                  onClick={() => this.handleCreateLightStepModalVisible(true)}>
            {'新建网关服务'}
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
   * 绘制右侧内容栏
   */
  drawContent = () => {
    const { depth } = this.state;
    const tagAddProps = {
      entity: this.state.selectedFacilitiesMaintenance,
      handleTagTableChange: this.handleTagTableChange,
      handleSelectRows: this.handleSelectRows,
      handleTagEditModalVisible: this.handleTagEditModalVisible,
      handleTagCreateModalVisible: this.handleTagCreateModalVisible,
      handleRemoveTag: this.handleRemoveTag,
      handOneTag: this.handOneTag,
      handleTagAdd: this.handleTagAdd,
      handleTagEdit: this.handleTagEdit,
      handleBatchProcessConfirmModalVisible: this.handleBatchProcessConfirmModalVisible,
      loading: this.state.loadingTag,
      data: this.state.tagData,
      selectedRows: this.state.selectedRows
    }
    const controllerProps = {
      handleSelectRows: this.handleSelectRows,
      handleEdit: this.handleEdit,
      handleControllerRemove: this.handleControllerRemove,
      handleCreateModalVisible: this.handleCreateModalVisible,
      handleControllerTableChange: this.handleControllerTableChange,
      handleBatchProcessConfirmModalVisible: this.handleBatchProcessConfirmModalVisible,
      loading: this.state.loadingController,
      data: this.state.controllerData,
      selectedRows: this.state.selectedRows
    }
    const lightStepProps = {
      handleSelectRows: this.handleSelectRows,
      handleCreateLightStepModalVisible: this.handleCreateLightStepModalVisible,
      handleLightStepTableChange: this.handleLightStepTableChange,
      handleBatchProcessConfirmModalVisible: this.handleBatchProcessConfirmModalVisible,
      loading: this.state.loadingLightStep,
      data: this.state.lightStepData,
      selectedRows: this.state.selectedRows
    }
    return (
      <div>
        <div className={styles.rightContentWrapper}>
          <Tabs className={styles.tabsWrapper} defaultActiveKey="1">
            {depth === 1 ?
              <TabPane tab={facilitiesMaintenanceLocale.controller} key="1">
               <FacilitiesMaintenanceTable {...controllerProps} />
              </TabPane> : depth === 2 ?
              <TabPane tab={facilitiesMaintenanceLocale.tag} key="1">
                <FacilitiesMaintenanceTagTable {...tagAddProps} />
              </TabPane> : <TabPane tab={facilitiesMaintenanceLocale.lightStep} key="1">
                <LightStepTable {...lightStepProps} />
              </TabPane>
            }
          </Tabs>
        </div>
      </div>
    );
  }

  /**重写部分 结束 */
}
