import { connect } from 'dva';
import { Fragment, PureComponent } from 'react';
import { Button, message, Modal, Form, Layout, Menu, Icon } from 'antd';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import SearchPage from '@/pages/Component/Page/SearchPage';
import { commonLocale } from '@/utils/CommonLocale';
import { convertCodeName } from '@/utils/utils';
import styles from './SerialArch.less';
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

@connect(({ serialArch, loading }) => ({
    serialArch,
    loading: loading.models.serialArch,
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
            serialArchList: [],// 当前企业下的所有方案
            selectedSerialArch: {},//选中方案
            showStoreView: false,
            selectedSerialArchLine: {},// 选中的一个库存分配顺序
            createModalVisible: false, //新增 编辑顺序的modal
            operate: '',
            modalVisible: false, //确认删除提示框
            editSerialArchLine: {}, //编辑所选的顺序
        };
    }

    componentDidMount() {
        this.querySerialArch();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.serialArch.data && nextProps.serialArch.data.length > 0) {
            this.setState({
                serialArchList: nextProps.serialArch.data.length > 0 ? nextProps.serialArch.data : [],
            });
            if (nextProps.serialArch.data != this.props.serialArch.data) {
                this.getSerialArchLineList(nextProps.serialArch.data[0].uuid);
                this.setState({
                    selectedSerialArch: nextProps.serialArch.data[0]
                })
            }
        } else {
            this.setState({
                serialArchList: [],
                selectedSerialArch: {},
            });
        }

        // 查询出当前方案下的全部库存分配顺序
        if (nextProps.serialArch.archLines != this.props.serialArch.archLines) {
            let data = nextProps.serialArch.archLines;
            let firstEntity = data && data.length && data.length > 0 ? data[0] : data;
            //遍历方案 把顺序放入到方案里
            const serialArchList = nextProps.serialArch.data && nextProps.serialArch.data.length > 0 ? nextProps.serialArch.data : [];
            serialArchList.map(scheme => {
                if (!scheme.lines && scheme.uuid == (firstEntity && firstEntity.serialArch ? firstEntity.serialArch.uuid : '')) {
                    scheme.lines = data;
                  this.setState({
                    selectedSerialArch: scheme
                  })
                }
            });
            this.setState({
                serialArchList: [...this.state.serialArchList]
            })
        }
    }

    /**
    * 查询当前企业下全部的方案
    */
    querySerialArch = () => {
        this.props.dispatch({
            type: 'serialArch/query',
            payload: {
                companyUuid: loginCompany().uuid,
                dcUuid: loginOrg().uuid
            }
        });
    }

    /**
    * 查询当前方案下的所有库存分配顺序
    */
    getSerialArchLineList = (defSchemeUuid) => {
        const { dispatch } = this.props;
        dispatch({
            type: 'serialArch/getLinesByArchUuid',
            payload: {
                companyUuid: loginCompany().uuid,
                uuid: defSchemeUuid != '' ? defSchemeUuid : undefined
            }
        });
    }

    /**
    * 显示 库存分配顺序方案新增界面
    */
    handleCreateScheme = () => {
        this.setState({
            selectedSerialArch: {},
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

    /**
     * 删除库存分配顺序
     */
    handleRemoveLine = () => {
        const { dispatch } = this.props;
        const { selectedSerialArchLine } = this.state;
        dispatch({
            type: 'serialArch/removeLine',
            payload: {
                uuid: selectedSerialArchLine.uuid,
                version: selectedSerialArchLine.version,
            },
            callback: response => {
                if (response && response.success) {
                    message.success(commonLocale.removeSuccessLocale);
                    this.querySerialArch();
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
     * 保存库存分配顺序
     */
    handleSaveLine = value => {
        const { dispatch } = this.props;
        let type = 'serialArch/addLine';
        if (value.uuid) {
            type = 'serialArch/modifyLine';
        }
        value['companyUuid'] = loginCompany().uuid;
        dispatch({
            type: type,
            payload: value,
            callback: response => {
                if (response && response.success) {
                    message.success(commonLocale.saveSuccessLocale);
                    this.querySerialArch();
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
            if (!scheme.lines && scheme.uuid === e.key) {
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
        this.props.dispatch({
            type: 'serialArch/getStoresByArchLineUuid',
            payload: {
                lineEntity: stockOrder,
                lineUuid: stockOrder.uuid
            }
        })
        this.setState({
            showStoreView: true,
            selectedSerialArchLine: stockOrder
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
            if (scheme.uuid == stockOrder.serialArch.uuid) {
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
                                onMouseEnter={loginOrg().type === 'COMPANY' ? (e) => this.handleMouseEnterMenuItem(e, stockOrder) : null}
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
                    defaultOpenKeys={[this.state.selectedSerialArch ? this.state.selectedSerialArch.uuid : '']}
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
        return loginOrg().type === 'COMPANY' && (
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
        const { selectedSerialArch: selectedSerialArch, showStoreView, selectedSerialArchLine: selectedSerialArchLine,
            createModalVisible } = this.state
        return (
            <div>
                {
                    showStoreView ?
                        <SerialArchLineStoreTable
                            lineEntity={selectedSerialArchLine}
                            lineUuid={selectedSerialArchLine ? selectedSerialArchLine.uuid : ''}
                        />
                        : <SerialArchCreatePage
                            selectedSerialArch={selectedSerialArch.uuid ? selectedSerialArch : undefined}
                            reFreshSider={this.querySerialArch}
                            handleSaveLine={this.handleSaveLine}
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
