import { connect } from 'dva';
import { Fragment, PureComponent } from 'react';
import { Button, message, Modal, Form, Layout, Menu, Icon } from 'antd';
import { loginCompany, loginOrg, loginUser } from '@/utils/LoginContext';
import SearchPage from '@/pages/Component/Page/SearchPage';
import { commonLocale } from '@/utils/CommonLocale';
import { convertCodeName } from '@/utils/utils';
import styles from '@/pages/Component/Page/inner/SiderPage.less';
import { SerialArchLocale } from './SerialArchLocale';
import SerialArchLineCreateForm from './SerialArchLineCreateForm';
import SiderPage from '@/pages/Component/Page/SiderPage';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import SerialArchLineStoreTable from './SerialArchLineStoreTable';
import SerialArchCreatePage from './SerialArchCreatePage';

const {
    Content, Sider,
} = Layout;
const Item = Menu.Item;
const { SubMenu } = Menu;

@connect(({ dispatchSerialArch, loading }) => ({
    dispatchSerialArch,
    loading: loading.models.dispatchSerialArch,
}))
@Form.create()
export default class SerialArchSearchPage extends SiderPage {

    constructor(props) {
        super(props);

        this.state = {
            siderWidth: '348',
            style: {
                marginBottom: '-24px',
            },
            siderStyle: {
                boxShadow: '2px 0px 3px -1px rgba(59,119,227,0.24)',
                overflow: 'auto',
                minHeight: document.body.clientHeight,
                height: document.body.clientHeight - 210,
            },
            contentStyle: {
                marginLeft: '20px',
                borderRadius: '4px',
                height: document.body.clientHeight - 210,
                overflow: 'auto',
                minHeight: document.body.clientHeight,
            },
            serialArchList: [],
            selectedSerialArch: {},
            showStoreView: false,
            selectedSerialArchLine: {},
            createModalVisible: false, //新增 编辑顺序的modal
            operate: '',
            modalVisible: false, //确认删除提示框
            editSerialArchLine: {}, //编辑所选的顺序
            originalOrgs:{},
            pageFilter: {
              page: 0,
              pageSize: 0,
              sortFields: {}
            },
        };
    }

    componentDidMount() {
        this.querySerialArch();
        // this.fetchUserByUuid();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.dispatchSerialArch && nextProps.dispatchSerialArch.data && nextProps.dispatchSerialArch.data.length > 0) {
          // this.setState({
          //   originalOrgs: loginOrg()
          // })
            this.setState({
                serialArchList: nextProps.dispatchSerialArch.data,
                originalOrgs: loginOrg()
            });
            if (nextProps.dispatchSerialArch.data != this.props.dispatchSerialArch.data) {
                this.getSerialArchLineList(nextProps.dispatchSerialArch.data[0].uuid);
                this.setState({
                    firstSelectedSerialArch: nextProps.dispatchSerialArch.data[0]
                })
            }
        } else {
            this.setState({
                serialArchList: [],
              originalOrgs: loginOrg(),
              firstSelectedSerialArch: {},
            });
        }

        if (nextProps.dispatchSerialArch && nextProps.dispatchSerialArch.archLines.archLines != this.props.dispatchSerialArch.archLines.archLines) {
            let data = nextProps.dispatchSerialArch.archLines.archLines;
            // let serialArchUuid = this.state.serialArchUuid;
          let firstEntity = data && data.length && data.length > 0 ? data[0] : data;
            const serialArchList = nextProps.dispatchSerialArch && nextProps.dispatchSerialArch.data && nextProps.dispatchSerialArch.data.length > 0 ? nextProps.dispatchSerialArch.data : [];
            serialArchList.map(scheme => {
              if(!scheme.lines && scheme.uuid === (firstEntity && firstEntity.serialArch ? firstEntity.serialArch.uuid : '')) {
                scheme.lines = data;
              }
            });
            this.setState({
                serialArchList: [...this.state.serialArchList],
              originalOrgs: loginOrg(),
            })
        }
    }

    /**
    * 查询当前企业下全部的线路体系
    */
    querySerialArch = () => {
        this.props.dispatch({
            type: 'dispatchSerialArch/query',
            payload: {
                companyUuid: loginCompany().uuid,
                dispatchCenterUuid : loginOrg().uuid
            },
          callback: response => {
            if (response && response.success) {
              if (response.data) {
                this.setState({
                  serialArchList: response.data
                })
              }
            }
          }
        });
    }

  /**
   * 删除后查询当前企业下全部的线路体系
   */
  querySerialArchAfterDelete = () => {
    this.props.dispatch({
      type: 'dispatchSerialArch/query',
      payload: {
        companyUuid: loginCompany().uuid,
        dispatchCenterUuid : loginOrg().uuid
      },
      callback: response => {
        if (response && response.success) {
          if (response.data) {
            this.setState({
              serialArchList: response.data
            })
            if(response.data && response.data.length > 0) {
              this.setState({
                selectedSerialArch: response.data[0]
              })
            }
          }
        }
      }
    });
  }

  queryAfterRemoveSerialArch = () => {
    this.props.dispatch({
      type: 'dispatchSerialArch/query',
      payload: {
        companyUuid: loginCompany().uuid,
        dispatchCenterUuid : loginOrg().uuid
      },
      callback: response => {
        if (response && response.success) {
          if (response.data) {
            this.setState({
              serialArchList: response.data,
            })
            if(response.data && response.data.length > 0) {
              this.setState({
                selectedSerialArch: response.data[0]
              })
            }
          }
        }
      }
    });
  }

  /**
   * 获取用户信息
   */
  fetchUserByUuid = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/get',
      payload: loginUser().uuid,
      callback: response => {
        if (response && response.success) {
          if (response.data) {
            let orgs = response.data.orgs;
            for (let i = 0; i < orgs.length; i++) {
              if(orgs[i].orgType === 'DISPATCH_CENTER') {
                this.setState({
                  originalOrgs: orgs[i],
                })
              }
            }
          }
        }
      }
    });
  }

  // 获取线路明细
    getSerialArchLineList = (defSchemeUuid) => {
        const { dispatch } = this.props;
        dispatch({
            type: 'dispatchSerialArch/getLinesByArchUuid',
            payload: {
                dispatchCenterUuid: loginOrg().uuid,
                serialArchUuid: defSchemeUuid ? defSchemeUuid : undefined
            },
            callback: response => {
              if (response && response.success) {
                if (response.data) {
                  this.setState({
                    serialArchUuid: defSchemeUuid,
                    archLines: response.data
                  })
                }
              }
            }
        });
    }
    // 获取线路体系明细

    getSerialArch = (defSchemeUuid) => {
      const { dispatch } = this.props;
      dispatch({
        type: 'dispatchSerialArch/getSerialArchByUuid',
        payload: {
          uuid: defSchemeUuid ? defSchemeUuid : ''
        },
        callback: response => {
          if (response && response.success) {
            if (response.data) {
              this.setState({
                selectedSerialArch: response.data
              })
            }
          }
        }
      });

    }

    /**
    * 显示 库存分配顺序方案新增界面
    */
    handleCreateScheme = () => {
        this.setState({
            selectedSerialArch: {},
            firstSelectedSerialArch: {},
            showStoreView: false
        })
    }

    /**
     * 编辑库存分配顺序的弹窗显示控制
     */
    handleCreateModalVisible = (flag, stockOrder, scheme) => {
        this.setState({
            createModalVisible: !!flag,
            editSerialArchLine: stockOrder,
        });
        if (scheme) {
            this.setState({
                selectedSerialArch: scheme
            })
        }
    };

    /**
    * 模态框显示/隐藏
    */
    handleModalVisible = (operate, stockOrder) => {
        if (stockOrder) {
            this.setState({
                selectedSerialArchLine: stockOrder
            })
        }
        if (operate) {
            this.setState({
                operate: operate
            })
        }
        this.setState({
            modalVisible: !this.state.modalVisible
        });
    }
    /**
    * 模态框确认操作
    */
    handleOk = () => {
        const { operate } = this.state;
        if (operate === commonLocale.deleteLocale) {
            this.handleRemoveLine();
        }
    }

    handleRemoveLine = () => {
        const { dispatch } = this.props;
        const { selectedSerialArchLine, selectedSerialArch } = this.state;
        dispatch({
            type: 'dispatchSerialArch/removeLine',
            payload: {
                uuid: selectedSerialArchLine.uuid,
                version: selectedSerialArchLine.version,
            },
            callback: response => {
                if (response && response.success) {
                    message.success(commonLocale.removeSuccessLocale);
                    this.queryAfterRemoveSerialArch();
                    this.getSerialArchLineList(selectedSerialArch.uuid);
                    this.setState({
                        showStoreView: false
                    })
                }
                this.setState({
                    modalVisible: !this.state.modalVisible
                })
            },
        });
    }

    /**
     * 保存线路
     */
    handleSaveLine = value => {
        const { dispatch } = this.props;
        const { originalOrgs, selectedSerialArch } = this.state;
        let type = 'dispatchSerialArch/addLine';
        if (value.uuid) {
            type = 'dispatchSerialArch/modifyLine';
        }
        value['companyUuid'] = loginCompany().uuid;
        value['dispatchCenterUuid'] = loginOrg().uuid;
        dispatch({
            type: type,
            payload: value,
            callback: response => {
                if (response && response.success) {
                    message.success(commonLocale.saveSuccessLocale);
                    this.querySerialArch();
                    this.getSerialArchLineList(selectedSerialArch.uuid);
                    this.setState({
                        createModalVisible: false,

                    });
                }
            },
        });
    };

    // 菜单相关---开始---

    /**
     * 选中左侧一级菜单栏
     */
    handleClickSubMenuItem = (e) => {
        this.state.serialArchList.map(scheme => {
          if (scheme.uuid === e.key) {
            this.getSerialArch(e.key);
            this.getSerialArchLineList(e.key);
          }
            if (scheme.uuid === e.key) {
                this.setState({
                    showStoreView: false,
                    selectedSerialArch: { ...scheme }
                })
            }
        });
    }

    /**
     * 选中左侧二级菜单栏
     */
    handleClickMenuItem = (e, stockOrder) => {
      const { pageFilter } = this.state;
      pageFilter.searchKeyValues = {
        companyUuid: loginCompany().uuid,
        archLineUuid: stockOrder.uuid,
        dispatchCenterUuid: loginOrg().uuid
      };
        this.props.dispatch({
            type: 'dispatchSerialArch/queryLines',
            payload: {
              ...pageFilter
            },
            callback: response => {
              if (response && response.success && response.data) {
               this.setState({
                 tableList: response.data && response.data.records ? response.data.records : null
               })
              }
            }
        })
        this.setState({
            showStoreView: true,
            selectedSerialArchLine: stockOrder,
            searchFilter: pageFilter
        });
    }

    /**
     * 当鼠标浮在menu-item时调用
     */
    handleMouseEnterMenuItem = (e, stockOrder) => {
        this.state.serialArchList.map(scheme => {
            if (scheme.uuid == stockOrder.serialArch.uuid) {
                scheme.lines.map(order => {
                    if (order.uuid === e.key) {
                        order.display = 'inline'
                    }
                })
            }
        });
        this.setState({
            serialArchList: [...this.state.serialArchList]
        })
    }
    /**
     * 当鼠标离开menu-item时调用
     */
    handleMouseLeaveMenuItem = (e, stockOrder) => {
        this.state.serialArchList.map(scheme => {
            if (scheme && scheme.uuid == stockOrder.serialArch.uuid) {
                scheme.lines.map(order => {
                    if (order.uuid === e.key) {
                        order.display = 'none'
                    }
                })
            }
        });
        this.setState({
            serialArchList: [...this.state.serialArchList]
        })
    }

    /**
     * 渲染菜单列表
     */
    renderSilderMenu = () => {
        const { serialArchList } = this.state;
        let menuItems = [];
        serialArchList.map((scheme) => {
            menuItems.push(
                <SubMenu
                    onTitleClick={this.handleClickSubMenuItem}
                    key={scheme.uuid}
                    title={
                        <span>
                            <Icon type="folder" style={{ color: '#3B77E3' }} />
                            <span>{convertCodeName(scheme)}</span>
                        </span>
                    }
                >
                    {
                        scheme.lines ? scheme.lines.map(stockOrder => {
                            let entity = {
                                uuid: stockOrder.uuid,
                                code: stockOrder.code,
                                name: stockOrder.name,
                            }
                            return <Menu.Item key={stockOrder.uuid}
                                onMouseEnter={(e) => this.handleMouseEnterMenuItem(e, stockOrder)}
                                onMouseLeave={(e) => this.handleMouseLeaveMenuItem(e, stockOrder)}
                                onClick={(e) => this.handleClickMenuItem(e, stockOrder)}
                            >
                                <Icon type="swap" rotate={90} style={{ color: '#3B77E3' }} />
                                <span>{convertCodeName(entity)}</span>
                                {
                                    stockOrder.display === 'inline' ?
                                        <span style={{ float: 'right' }}>
                                            <a className={styles.menuItemA}
                                                onClick={() => { this.handleCreateModalVisible(true, stockOrder, scheme) }}
                                            >
                                                {commonLocale.editLocale}
                                            </a>
                                            &nbsp;
                              <a className={styles.menuItemA}
                                                onClick={() => { this.handleModalVisible(commonLocale.deleteLocale, stockOrder) }}
                                            >
                                                {commonLocale.deleteLocale}
                                            </a>
                                        </span> : null
                                }
                            </Menu.Item>
                        }) : null
                    }
                </SubMenu>
            )
        });

        return menuItems;
    }
    // 菜单相关---结束---

    // 重写部分---开始----
    /**
     * 绘制左侧菜单栏
     */
    drawSider = () => {
        return (
            <div>
                <div className={styles.navigatorPanelWrapper}>
                    <span className={styles.title}>{SerialArchLocale.serialArchTitle}</span>
                    <div className={styles.action}>{this.drawActionButton()}</div>
                </div>
                <Menu
                    defaultSelectedKeys={[this.state.serialArchList.length > 0 ? this.state.serialArchList[0].uuid : '']}
                    defaultOpenKeys={[this.state.serialArchList.length > 0 ? this.state.serialArchList[0].uuid : '']}
                    mode='inline'
                    theme='light'
                    style={{ marginTop: '5%', height: '95%', marginLeft: '-24px', width: '107%' }}
                >
                    {this.renderSilderMenu()}
                </Menu>
            </div>
        );
    }

    /**
     * 绘制菜单的右上角按钮
     */
    drawActionButton = () => {
        return (
            <Fragment>
                <Button type='primary' onClick={this.handleCreateScheme}>
                    {SerialArchLocale.createSerialArch}
                </Button>
            </Fragment>
        )
    }

    /**
     * 绘制右侧内容栏
     */
    drawContent = () => {
        const { selectedSerialArch, showStoreView, selectedSerialArchLine,
            createModalVisible, originalOrgs, tableList, searchFilter, firstSelectedSerialArch } = this.state;
        return (
            <div>
                {
                    showStoreView ?
                        <SerialArchLineStoreTable
                            lineEntity={selectedSerialArchLine}
                            selectedSerialArch={ selectedSerialArch ? selectedSerialArch : firstSelectedSerialArch}
                            tableList={tableList}
                            lineUuid={selectedSerialArchLine ? selectedSerialArchLine.uuid : ''}
                            searchFilter={searchFilter}
                        />
                        : <SerialArchCreatePage
                            selectedSerialArch={selectedSerialArch.uuid ? selectedSerialArch : firstSelectedSerialArch}
                            reFreshSider={this.querySerialArchAfterDelete}
                            handleSaveLine={this.handleSaveLine}
                            originalOrgs={originalOrgs}
                            createModalVisible={createModalVisible}
                        />
                }
            </div>
        );
    }

    hideModal = () => {
        this.setState({
            createModalVisible: !this.state.createModalVisible
        })
    }

    saveLine = (type, payload) => {
        this.props.dispatch({
            type: type,
            payload: payload,
            callback: response => {
                if (response && response.success) {
                    message.success(commonLocale.saveSuccessLocale);
                    this.querySerialArch();
                    this.setState({
                        createModalVisible: false,
                    });
                }
            },
        })
    }

    /**
     * 绘制其他组件
     */
    drawOtherCom = () => {
        const { createModalVisible, editSerialArchLine,
            selectedSerialArchLine, selectedSerialArch
        } = this.state;
        const createParentMethods = {
            handleSaveLine: this.handleSaveLine,
            handleCreateModalVisible: this.handleCreateModalVisible,
        };

        return (
            <div>
                <SerialArchLineCreateForm
                    {...createParentMethods}
                    createModalVisible={createModalVisible}
                    confirmLoading={false}
                    serialArchLine={editSerialArchLine}
                    selectedSerialArch={selectedSerialArch}
                    hideModal={this.hideModal}
                    saveLine={this.saveLine}
                />

                <div>
                    <ConfirmModal
                        visible={this.state.modalVisible}
                        operate={this.state.operate}
                        object={SerialArchLocale.serialArchLine + ':' + selectedSerialArchLine.code}
                        onOk={this.handleOk}
                        onCancel={this.handleModalVisible}
                    />
                </div>
            </div>
        )
    }

    // 重写部分---结束----
}
