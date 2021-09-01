import { Tree, Input, Select, Layout, message, Menu, Dropdown, Tabs, Button } from 'antd';
import { PureComponent, Fragment } from "react";
import { connect } from 'dva';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import ZoneCreateModal from './ZoneCreateModal';
import PathCreateModal from './PathCreateModal';
import ShelfCreateModal from './ShelfCreateModal';
import BinCreateModal from './BinCreateModal';
import AlterBinTypeModal from './AlterBinTypeModal';
import AlterBinUsageModal from './AlterBinUsageModal';
import RemoveBinModal from './RemoveBinModal';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Page from '@/components/MyComponent/Page';
import NavigatorPanel from '@/components/MyComponent/NavigatorPanel';
import { formatMessage } from 'umi/locale';
import styles from './Bin.less';
import ZoneTable from './ZoneTable';
import PathAndShelfTable from './PathAndShelfTable';
import BinTable from './BinTable';
import BinStockTable from './BinStockTable';
import { BIN_FACILITY, SERVICE_CAPTION } from '@/utils/constants';
import BinDetailInfo from './BinDetailInfo';
import { binFacility } from './BinContants';
import { BinLocale } from './BinLocale';
import { havePermission } from '@/utils/authority';
import { BIN_RES } from './BinPermission';
import { ORDER_RES } from '@/pages/In/Order/OrderPermission';
import { commonLocale } from '@/utils/CommonLocale';
import { orgType } from '@/utils/OrgType';
import SearchMoreAction from '@/pages/Component/Form/SearchMoreAction';
import { flow, flowRight } from 'lodash-decorators';
import { colWidth } from '@/utils/ColWidth';

const { TreeNode } = Tree;
const TabPane = Tabs.TabPane;
const Search = Input.Search;
const {
  Content, Sider,
} = Layout;

@connect(({ bin, loading }) => ({
  bin,
  loading: loading.models.bin,
}))
export default class Bin extends PureComponent {
  constructor(props) {
    super(props);

    let queryFilter = {
      pageFilter: {
        page: 0,
        pageSize: 10,
        sortFields: {
          code: true
        },
        searchKeyValues: {}
      }
    };

    if (sessionStorage.getItem(window.location.href)) {
      queryFilter = JSON.parse(sessionStorage.getItem(window.location.href));
    }

    this.state = {
      ...queryFilter,
      expandedKeys: [],
      selectedKeys: [],
      searchValue: '',
      autoExpandParent: true,
      treeData: this.props.bin.simBinList,

      record: {},
      createZoneModalVisible: false,
      createPathModalVisible: false,
      createShelfModalVisible: false,
      createBinModalVisible: false,
      confirmLoading: false,

      uuid: '',
      code: '',
      binFacilityType: '',
      alterTypeModalVisible: false,
      alterUsageModalVisible: false,
      isBatchAlterType:false,
      isBatchAlterUsage:false,

      upperUuid: '',
      reShow: false,

      binEntity: {},
      confirmRemoveVisible: false,
    };
  }


  componentDidMount() {
    this.refreshTree();
    this.refreshZoneTable();
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      data: newProps.data
    });
  };

  refreshTree = () => {
    const { dispatch } = this.props;

    dispatch({
      type: 'bin/queryList',
      payload: {
        dcUuid: loginOrg().uuid
      },
      callback: (response) => {
        if (response && response.success) {
          this.setState({
            treeData: response.data
          })
        }
      }
    });
  }

  refreshZoneTable = (filter) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;

    pageFilter.searchKeyValues = {
      dcUuid: loginOrg().uuid,
      companyUuid: loginCompany().uuid
    }
    let queryFilter = { ...pageFilter };
    if (filter) {
      queryFilter = { ...pageFilter, ...filter };
    }

    dispatch({
      type: 'bin/queryZone',
      payload: queryFilter,
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

  onSelect = (selectedKeys, info) => {
    const { dispatch } = this.props;
    const { pageFilter } = this.state;

    const uuid = info.node.props.dataRef.uuid;
    pageFilter.searchKeyValues = {
      ...pageFilter.searchKeyValues,
      upperUuid: uuid,
      dcUuid: loginOrg().uuid,
      companyUuid: loginCompany().uuid
    }

    let queryFilter = { ...pageFilter };

    const binFacilityType = info.node.props.type;
    const code = info.node.props.dataRef.code;

    let show = this.state.reShow;
    this.setState({
      upperUuid: uuid,
      code: code,
      queryFilter: queryFilter,
      reShow: !show,
      binFacilityType: binFacilityType,
      selectedKeys: selectedKeys,
      isBatchAlterType: false,
      isBatchAlterUsage: false,

    })
  }

  onClickMune = (record, type, { key }) => {
    if (key === '1') {
      this.setState({
        createZoneModalVisible: true,
        record: {}
      })
    }
    else if (key === '2') {
      this.setState({ createPathModalVisible: true, })
    }
    else if (key === '3') {
      this.setState({ createShelfModalVisible: true, })
    }
    else if (key === '4') {
      this.setState({ createBinModalVisible: true, })
    }
    else if (key === '5') {
      //修改货位类型
      this.setState({
        alterTypeModalVisible: true,
        uuid: record.uuid,
        code: record.code,
        binFacilityType: type,
        isBatchAlterType: false,
        isBatchAlterUsage: false,
      })
    } else if (key === '6') {
      //修改或为yongtu
      this.setState({
        alterUsageModalVisible: true,
        isBatchAlterType: false,
        isBatchAlterUsage: false,
        uuid: record.uuid,
        code: record.code,
        binFacilityType: type
      })
    } else if (key === '7') {
      //删除货位设施
      this.setState({
        confirmRemoveVisible: true,
        isBatchAlterType: false,
        isBatchAlterUsage: false,
        code: record.code,
        binFacilityType: type
      })
    } else if (key === '8') {
      //修改货区
      this.props.dispatch({
        type: 'bin/getZoneByCode',
        payload: {
          code: record.code,
          dcUuid: loginOrg().uuid
        }
      })
      this.setState({
        createZoneModalVisible: true,
        record: record
      })
    }
  };

  handleZoneModalVisible = (record) => {
    if (record && record.uuid != undefined) {
      this.setState({
        createZoneModalVisible: !this.state.createZoneModalVisible,
        record: record,
      })
    } else {
      this.setState({
        createZoneModalVisible: !this.state.createZoneModalVisible,
        record: {}
      })
    }
  }

  handlePathModalVisible = () => {
    this.setState({
      createPathModalVisible: !this.state.createPathModalVisible,
    })
  }

  handleShelfModalVisible = () => {
    this.setState({
      createShelfModalVisible: !this.state.createShelfModalVisible,
    })
  }

  handleBinModalVisible = () => {
    this.setState({
      createBinModalVisible: !this.state.createBinModalVisible,
    })
  }

  handleTypeModalVisible = () => {
    this.setState({
      alterTypeModalVisible: !this.state.alterTypeModalVisible,
      isBatchAlterType: false,
      uuid: '',
      code: '',
      binFacilityType: ''
    })
  }

  handleUsageModalVisible = () => {
    this.setState({
      alterUsageModalVisible: !this.state.alterUsageModalVisible,
      isBatchAlterUsage: false,
      uuid: '',
      code: '',
      binFacilityType: ''
    })
  }
  handleRemoveModalVisible = () => {
    this.setState({
      confirmRemoveVisible: !this.state.confirmRemoveVisible,
    })
  }
  /**
   * 保存货区
   */
  handleSaveZone = (value) => {
    const { dispatch } = this.props;
    const { confirmLoading } = this.state;

    this.setState({
      confirmLoading: !confirmLoading,
    })

    dispatch({
      type: 'bin/addZone',
      payload: value,
      callback: (response) => {
        if (response && response.success) {
          message.success(formatMessage({ id: 'common.message.success.operate' }));

          this.onSearch("",this.state.expandedKeys);
          this.changeState();
        }
      },
    });

    this.setState({
      record: {},
      createZoneModalVisible: false,
      confirmLoading: false,
    });
  };

  calcAndGenCode = (value) => {
    const { dispatch } = this.props;
    const { confirmLoading } = this.state;

    this.setState({
      confirmLoading: !confirmLoading,
    })
    dispatch({
      type: 'bin/genPathCode',
      payload: value,
      callback: (response) => {
        if (response && response.success) {
          this.setState({
            confirmLoading: false,
            createPathModalVisible: !this.state.createPathModalVisible
          });
          message.info("批量生成`" + response.data + "`个货道");
          this.onSearch("",this.state.expandedKeys);
          this.changeState();
        } else {
          this.setState({
            confirmLoading: false,
          })
        }
      },
    });
  }

  calcAndGenShelfCode = (value) => {
    const { dispatch } = this.props;
    const { confirmLoading } = this.state;

    this.setState({
      confirmLoading: !confirmLoading,
    })
    dispatch({
      type: 'bin/genShelfCode',
      payload: value,
      callback: (response) => {
        if (response && response.success) {
          this.setState({
            confirmLoading: false,
            createShelfModalVisible: !this.state.createShelfModalVisible
          })
          message.info("批量生成`" + response.data + "`个货架");
          this.onSearch("",this.state.expandedKeys);
          this.changeState();
        } else {
          this.setState({
            confirmLoading: false,
          })
        }
      },
    });
  }

  calcAndGenBinCode = (value) => {
    const { dispatch } = this.props;
    const { confirmLoading } = this.state;

    this.setState({
      confirmLoading: !confirmLoading,
    })
    dispatch({
      type: 'bin/genBinCode',
      payload: value,
      callback: (response) => {
        if (response && response.success) {
          this.setState({
            createBinModalVisible: !this.state.createBinModalVisible,
            confirmLoading: false,
          })
          message.info("批量生成`" + response.data + "`个货位");
          this.onSearch("",this.state.expandedKeys);
          this.changeState();
        } else {
          this.setState({
            confirmLoading: false,
          })
        }
      },
    });
  }

  handleAlterType = (value) => {
    const { dispatch } = this.props;
    const { confirmLoading } = this.state;

    this.setState({
      confirmLoading: !confirmLoading,
    })
    dispatch({
      type: 'bin/alterBinType',
      payload: value,
      callback: (response) => {
        if (response && response.success) {
          this.setState({
            confirmLoading: false,
            alterTypeModalVisible: !this.state.alterTypeModalVisible,
          })
          message.success(formatMessage({ id: 'common.message.success.operate' }));
          this.onSearch("",this.state.expandedKeys);
          this.changeState();
        } else {
          this.setState({
            confirmLoading: false,
          })
        }
      },
    });
  }

  handleAlterUsage = (value) => {
    const { dispatch } = this.props;
    const { confirmLoading } = this.state;

    this.setState({
      confirmLoading: !confirmLoading,
    })
    dispatch({
      type: 'bin/alterBinUsage',
      payload: value,
      callback: (response) => {
        if (response && response.success) {
          this.setState({
            alterUsageModalVisible: !this.state.alterUsageModalVisible,
            confirmLoading: false,
          })
          message.success(formatMessage({ id: 'common.message.success.operate' }));

          this.onSearch("",this.state.expandedKeys);
          this.changeState();
        } else {
          this.setState({
            confirmLoading: false,
          })
        }
      },
    });
  }

  handleBacthSave= (value) => {
    const { dispatch } = this.props;
    const { confirmLoading } = this.state;

    this.setState({
      confirmLoading: !confirmLoading,
    })
    dispatch({
      type: 'bin/batchUpBin',
      payload: value,
      callback: (response) => {
        if (response && response.success) {
          this.setState({
            alterUsageModalVisible: false,
            alterTypeModalVisible: false,
            confirmLoading: false,
          })
          message.success(formatMessage({ id: 'common.message.success.operate' }));

          this.onSearch("",this.state.expandedKeys);
          this.changeState();
        } else {
          this.setState({
            confirmLoading: false,
          })
        }
      },
    });
  }

  handleRemove = (code, binFacilityType) => {
    const { dispatch } = this.props;
    const { confirmLoading } = this.state;

    this.setState({
      confirmLoading: !confirmLoading,
    })
    dispatch({
      type: 'bin/remove',
      payload: {
        code: code,
        dcUuid: loginOrg().uuid,
        type: binFacilityType
      },
      callback: (response) => {
        if (response && response.success) {
          this.setState({
            confirmRemoveVisible: !this.state.confirmRemoveVisible,
            confirmLoading: false
          })
          message.success(formatMessage({ id: 'common.message.success.operate' }));
          this.onSearch("",this.state.expandedKeys);
          this.changeState();
        } else {
          this.setState({
            confirmLoading: false,
          })
        }
      },
    });
  }

  alertBinUsage = () => {
    this.setState({
      alterUsageModalVisible:true,
      isBatchAlterUsage:true
    })
  }

  alertBinType = () => {
    this.setState({
      alterTypeModalVisible:true,
      isBatchAlterType:true
    })
  }

  changeState = () => {
    this.setState({
      binFacilityType: '',
      upperUuid: '',
      reShow: !this.state.reShow
    })
  }

  VisibleTable() {
    const { upperUuid, code, queryFilter, binFacilityType, reShow } = this.state;
    if (BIN_FACILITY['ZONE'] === binFacilityType || BIN_FACILITY['PATH'] === binFacilityType) {
      const title = BIN_FACILITY['ZONE'] === binFacilityType ? 'bin.facility.path' : 'bin.facility.shelf';
      if (reShow) {
        return (
          <PathAndShelfTable key='1'
                             loading={this.loading}
                             upperUuid={this.state.upperUuid}
                             title={formatMessage({ id: title })}
                             queryFilter={this.state.queryFilter}
                             binFacilityType={this.state.binFacilityType}
          />
        );
      }
      return (<PathAndShelfTable key='2'
                                 loading={this.loading}
                                 upperUuid={this.state.upperUuid}
                                 title={formatMessage({ id: title })}
                                 queryFilter={this.state.queryFilter}
                                 binFacilityType={this.state.binFacilityType}
      />);
    }
    else if (BIN_FACILITY['SHELF'] === binFacilityType) {
      if (reShow) {
        return (<BinTable key='1'
                          loading={this.loading}
                          upperUuid={this.state.upperUuid}
                          queryFilter={this.state.queryFilter}
        />)
      }
      return (<BinTable key='2'
                        loading={this.loading}
                        upperUuid={this.state.upperUuid}
                        queryFilter={this.state.queryFilter}
      />);
    } else if (BIN_FACILITY['BIN'] === binFacilityType) {
      if (reShow) {
        return (
          <BinDetailInfo key='1'
                         loading={this.loading}
                         upperUuid={this.state.upperUuid}
                         bincode={this.state.code}
                         queryFilter={this.state.queryFilter}
          />
        )
      }
      return (
        <BinDetailInfo key='2'
                       loading={this.loading}
                       upperUuid={this.state.upperUuid}
                       bincode={this.state.code}
                       queryFilter={this.state.queryFilter}
        />
      );
    } else {
      if (reShow) {
        return (<ZoneTable key='1'
                           loading={this.loading}
                           queryFilter={this.state.queryFilter}
        />);
      }
      return (<ZoneTable key='2'
                         loading={this.loading}
                         queryFilter={this.state.queryFilter}
      />);
    }
  }

  // drawActionButton = () => {
  //   const menus = [{
  //     name: commonLocale.importLocale,
  //     onClick: this.handleShowExcelImportPage
  //   }];
  //   if (loginOrg().type != orgType.vendor.name) {
  //     menus.push({
  //       name: '管理订单类型',
  //       onClick: this.onType
  //     });
  //     return (<Fragment>
  //       <Button id="createButton" icon="plus" type="primary" disabled={!havePermission(ORDER_RES.CREATE)}
  //               onClick={this.onCreate.bind(this, '')}>
  //         {commonLocale.createLocale}
  //       </Button>
  //       <SearchMoreAction menus={menus}/>
  //     </Fragment>);
  //   }
  // }

  render() {
    const { searchValue, expandedKeys, selectedKeys, autoExpandParent, data,
      createZoneModalVisible, createPathModalVisible,
      createShelfModalVisible, createBinModalVisible, record, loading,
      alterTypeModalVisible,isBatchAlterType,isBatchAlterUsage,
      alterUsageModalVisible, confirmRemoveVisible, uuid, code, binFacilityType
      , confirmLoading } = this.state;

    const loop = data => data.map((item) => {
      let id = item.uuid;

      let type = binFacility.ZONE.name;
      if (item.code.length === 4)
        type = binFacility.PATH.name;
      else if (item.code.length === 6) {
        type = binFacility.SHELF.name;
      } else if (item.code.length === 8) {
        type = binFacility.BIN.name;
      }
      let code = binFacility.ZONE.name === type ? '[' + item.code + ']' + item.name : item.code;

      const title = <Dropdown overlay={menu(item, type)} trigger={['contextMenu']}>
        <span style={{ userSelect: 'none' }}>{code}</span>
      </Dropdown>

      if (item.children) {
        return (
          <TreeNode title={title} dataRef={item} key={item.code} expanded={true}
                    type={type}>
            {loop(item.children)}
          </TreeNode>
        );
      };
      return <TreeNode dataRef={item} title={title} type={type} key={item.code} expanded={true}
                       isLeaf={binFacility.BIN.name === type} />;
    });

    const menu = (record, type) => (
      <Menu onClick={this.onClickMune.bind(this, record, type)} >
        <Menu.Item key="1" disabled={!havePermission(BIN_RES.CREATE)}>{formatMessage({ id: 'bin.modal.zone' })}</Menu.Item>
        <Menu.Item key="2" disabled={!havePermission(BIN_RES.CREATE)}>{formatMessage({ id: 'bin.modal.path' })}</Menu.Item>
        <Menu.Item key="3" disabled={!havePermission(BIN_RES.CREATE)}>{formatMessage({ id: 'bin.modal.shelf' })}</Menu.Item>
        <Menu.Item key="4" disabled={!havePermission(BIN_RES.CREATE)}>{formatMessage({ id: 'bin.modal.bin' })}</Menu.Item>
        <Menu.Divider />
        <Menu.Item key="5" disabled={!havePermission(BIN_RES.MODIFYBINTYPE)}>{formatMessage({ id: 'bin.modal.alterType' })}</Menu.Item>
        <Menu.Item key="6" disabled={!havePermission(BIN_RES.MODIFYBINUSAGE)}>{formatMessage({ id: 'bin.modal.alterUsage' })}</Menu.Item>
        <Menu.Divider />
        <Menu.Item key="7" disabled={!havePermission(BIN_RES.DELETE)}>{formatMessage({ id: 'bin.modal.remove' })}</Menu.Item>
        {
          binFacility.ZONE.name === type && havePermission(BIN_RES.EDIT) ?
            <Menu.Item key="8">{BinLocale.modifyZone}</Menu.Item> : undefined
        }
      </Menu>
    );

    const menuNew = (record, type) => (
      <Menu onClick={this.onClickMune.bind(this, record, type)} >
        <Menu.Item key="1">{formatMessage({ id: 'bin.modal.zone' })}</Menu.Item>
        <Menu.Item key="2">{formatMessage({ id: 'bin.modal.path' })}</Menu.Item>
        <Menu.Item key="3">{formatMessage({ id: 'bin.modal.shelf' })}</Menu.Item>
        <Menu.Item key="4">{formatMessage({ id: 'bin.modal.bin' })}</Menu.Item>
      </Menu>
    );

    const menus = [
      {
      name: "修改货位用途",
      onClick: this.alertBinUsage
      },
      {
        name: "修改货位类型",
        onClick: this.alertBinType
      }];

    const actionBtn = (
      <Fragment >
        <div className={styles.actionBtn}>
          <Dropdown  overlay={menuNew(null, null)} placement="bottomCenter" disabled={!havePermission(BIN_RES.CREATE)}>
            <Button icon="plus" type="primary"
            >{formatMessage({ id: 'common.action.create' })}</Button>
          </Dropdown>
          <SearchMoreAction menus={menus}/>
        </div>
      </Fragment>
  );

    return (
      <PageHeaderWrapper>
        <Page>
          <NavigatorPanel title={formatMessage({ id: 'bin.title' })} action={actionBtn} />
          <Content className={styles.contentWrapper}>
            <Layout>
              <Sider className={styles.leftWrapper}
                     style={{
                       height: '800px',
                       overflow: 'auto',
                     }}>
                <Search style={{ width: 180 }} placeholder={formatMessage({ id: 'bin.search' })}
                        onSearch={(e)=>this.onSearch(e,false)}
                />
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
              </Sider>
              <Content className={styles.rightWrapper}>
                {this.VisibleTable()}
              </Content>
            </Layout>
          </Content>

          <ZoneCreateModal
            ModalTitle={record && record.uuid ? '编辑货区' : formatMessage({ id: 'bin.modal.zone' })}
            createZoneModalVisible={createZoneModalVisible}
            handleCreateZoneModalVisible={this.handleZoneModalVisible}
            handleSave={this.handleSaveZone}
            confirmLoading={confirmLoading}
            record={record}
          />
          <PathCreateModal
            ModalTitle={formatMessage({ id: 'bin.modal.path' })}
            createPathModalVisible={createPathModalVisible}
            handleCreatePathModalVisible={this.handlePathModalVisible}
            handleCalcCode={this.calcAndGenCode}
            confirmLoading={confirmLoading}
          />
          <ShelfCreateModal
            ModalTitle={formatMessage({ id: 'bin.modal.shelf' })}
            createShelfModalVisible={createShelfModalVisible}
            handleCreateShelfModalVisible={this.handleShelfModalVisible}
            handleCalcCode={this.calcAndGenShelfCode}
            confirmLoading={confirmLoading}
          />
          <BinCreateModal
            ModalTitle={formatMessage({ id: 'bin.modal.bin' })}
            createBinModalVisible={createBinModalVisible}
            handleCreateBinModalVisible={this.handleBinModalVisible}
            handleCalcCode={this.calcAndGenBinCode}
            confirmLoading={confirmLoading}
          />
          <AlterBinTypeModal
            ModalTitle={formatMessage({ id: 'bin.modal.alterType' })}
            alterTypeModalVisible={alterTypeModalVisible}
            isBatchAlterType={isBatchAlterType}
            handleAlterTypeModalVisible={this.handleTypeModalVisible}
            handleSave={this.handleAlterType}
            handleBacthSave={this.handleBacthSave}
            uuid={uuid}
            code={code}
            binFacilityType={binFacilityType}
            confirmLoading={confirmLoading}
          />
          <AlterBinUsageModal
            ModalTitle={formatMessage({ id: 'bin.modal.alterUsage' })}
            alterUsageModalVisible={alterUsageModalVisible}
            isBatchAlterUsage={isBatchAlterUsage}
            handleAlterUsageModalVisible={this.handleUsageModalVisible}
            handleSave={this.handleAlterUsage}
            handleBacthSave={this.handleBacthSave}
            uuid={uuid}
            code={code}
            binFacilityType={binFacilityType}
            confirmLoading={confirmLoading}
          />
          <RemoveBinModal
            ModalTitle={formatMessage({ id: 'bin.modal.remove' })}
            code={code}
            binFacilityType={binFacilityType}
            confirmRemoveVisible={confirmRemoveVisible}
            handleRemove={this.handleRemove}
            handleRemoveModalVisible={this.handleRemoveModalVisible}
            confirmLoading={confirmLoading}
          />
        </Page>
      </PageHeaderWrapper>
    );
  }


  onLoadData = (treeNode) => {
    const { dispatch } = this.props;

    const binFacilityType = treeNode ? treeNode.props.type : null;
    const code = treeNode ? treeNode.props.dataRef.code : null;

    return new Promise((resolve) => {
      dispatch({
        type: 'bin/queryList',
        payload: {
          code: code,
          dcUuid: loginOrg().uuid,
          type: binFacilityType
        },
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

  onSearch = (value,expandedKeysList) => {
    const { dispatch } = this.props;


    if (value.length === 3)
      value = value.substring(0, 2);
    if (value.length === 5)
      value = value.substring(0, 4);
    if (value.length === 7)
      value = value.substring(0, 6);

    let expandedKeys = [];
    let selectedKeys = [];

    if(value==''&&expandedKeysList!=false){
      expandedKeys = expandedKeysList;
      selectedKeys = expandedKeysList;
      value = expandedKeysList[expandedKeysList.length-1]
    }else{
      expandedKeys[0] = value;
      selectedKeys[0] = value;
    }

    dispatch({
      type: 'bin/queryBinTree',
      payload: {
        code: value,
        dcUuid: loginOrg().uuid
      },
      callback: (response) => {
        if (response && response.success) {
          this.setState({
            treeData: this.props.bin.simBinList,
            expandedKeys,
            selectedKeys,
            autoExpandParent: true
          })
          this.select(value);
        }
      }
    })
  }

  select = (code) => {
    const { dispatch } = this.props;

    dispatch({
      type: 'bin/getSimBinByCode',
      payload: {
        code: code,
        dcUuid: loginOrg().uuid
      },
      callback: (response) => {
        if (response && response.success && response.data) {
          let show = this.state.reShow;
          this.setState({
            upperUuid: response.data.uuid,
            code: response.data.code,
            isBatchAlterType: false,
            isBatchAlterUsage: false,
            reShow: !show,
            binFacilityType: response.data.type
          })
        } else {
          let show = this.state.reShow;
          this.setState({
            upperUuid: '',
            reShow: !show,
            binFacilityType: '',

          })
        }
      }
    })
  }
}
