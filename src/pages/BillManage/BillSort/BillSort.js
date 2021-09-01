import { connect } from 'dva';
import { Fragment, PureComponent } from 'react';
import { Button, message, Modal, Form, Layout, Menu, Icon } from 'antd';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
import SearchPage from '@/pages/Component/Page/SearchPage';
import { commonLocale } from '@/utils/CommonLocale';
import { convertCodeName } from '@/utils/utils';
import styles from './BillSort.less';
import { BillSort } from './BillSortLocal';
import BillSmallSortCreateForm from './BillSortCreateForm';
import SiderPage from '@/pages/Component/Page/SiderPage';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import BillSortDetailTable from './BillSortDetailTable';
import BillSortCreatePage from './BillSortCreatePage';

const {
    Content, Sider,
} = Layout;
const Item = Menu.Item;
const { SubMenu } = Menu;

@connect(({ billSort, loading }) => ({
    billSort,
    loading: loading.models.billSort,
}))
@Form.create()
export default class BillSortSearchPage extends SiderPage {

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
            sortList:[],// 当前企业下的所有分类
            bigSortList: [],// 当前企业下的所有大类
            selectedBigSort: {},//选中大类
            showStoreView: false,
            selectedSmallSort: {},// 选中的一个库存分配顺序
            createModalVisible: false, //新增 编辑顺序的modal
            operate: '',
            modalVisible: false, //确认删除提示框
            editSmallSort: {}, //编辑所选的顺序
            openKeys:[],
        };
    }

    componentDidMount() {
        this.querySorts();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.billSort.bigSorts && nextProps.billSort.bigSorts.length > 0) {
            this.setState({
                bigSortList: nextProps.billSort.bigSorts.length > 0 ? nextProps.billSort.bigSorts : [],
            });
            if (nextProps.billSort.bigSorts != this.props.billSort.bigSorts) {
                this.getSmallSortList(nextProps.billSort.bigSorts[0].uuid);
                this.setState({
                    selectedBigSort: nextProps.billSort.bigSorts[0],
                })
            }
        } else {
            this.setState({
                bigSortList: [],
                selectedBigSort: {},
            });
        }
        
        // 查询出当前大类下的全部小类
        if (nextProps.billSort.smallSorts != this.props.billSort.smallSorts) {
            let data = nextProps.billSort.smallSorts;
            let firstEntity = data && data.length && data.length > 0 ? data[0] : data;
            let {bigSortList} = this.state;
            if(firstEntity&&firstEntity.uuid){
                bigSortList.forEach(sort => {
                    if (!sort.smallSortList && sort.uuid === firstEntity.bigSortUuid) {
                        sort.smallSortList = data;
                      this.setState({
                        selectedBigSort: sort
                      })
                    }
                });
            }
            this.setState({
                smallSort:data,
                bigSortList:[...bigSortList]
            })
        }
    }

    /**
    * 查询当前企业下全部的大类
    */
    querySorts = () => {
        this.props.dispatch({
            type: 'billSort/page',
        });
    }

    /**
    * 查询当前大类下的所有小类
    */
    getSmallSortList = (bigSortUuid) => {
        
        const { dispatch } = this.props;
        dispatch({
            type: 'billSort/smallSortpage',
            payload: {
                uuid:bigSortUuid?bigSortUuid+'':'',
            }
        });
    }

    /**
    * 显示小类 新增界面
    */
    handleCreateBigsort = () => {
        this.setState({
            selectedBigSort: {},
           
            showStoreView: false
        })
    }

    /**
     * 编辑小类弹窗显示控制
     */
    handleCreateModalVisible = (flag, smallSort, bigSort) => {
        this.setState({
            createModalVisible: !!flag,
            editSmallSort: smallSort,
        });
        if (bigSort) {
            this.setState({
                selectedBigSort: bigSort
            })
        }
    };

    /**
    * 模态框显示/隐藏
    */
    handleModalVisible = (operate, smallSort) => {
        if (smallSort) {
            this.setState({
                selectedSmallSort: smallSort
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
            this.handleRemoveSmallSort();
        }
    }

    /**
     * 删除小类
     */
    handleRemoveSmallSort = () => {
        const { dispatch } = this.props;
        const { selectedSmallSort } = this.state;
        dispatch({
            type: 'billSort/smallSortremove',
            payload: {
                uuid: selectedSmallSort.uuid,
                version: selectedSmallSort.version,
            },
            callback: response => {
                if (response && response.success) {
                    message.success(commonLocale.removeSuccessLocale);
                    this.querySorts();
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
     * 保存小类
     */
    handleSaveSort = value => {
        const { dispatch } = this.props;
        let type = 'billSort/bigSort';
        if (value.uuid) {
            type = 'billSort/modify';
        }
        value['companyUuid'] = loginCompany().uuid;
        dispatch({
            type: type,
            payload: value,
            callback: response => {
                if (response && response.success) {
                    message.success(commonLocale.saveSuccessLocale);
                    this.querySorts();
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
        let {openKeys} = this.state;
        this.state.bigSortList.map(sort => {
            if (!sort.smallSortList && sort.uuid === e.key)  {
                this.getSmallSortList(e.key);
            }
            if (sort.uuid === e.key) {
                if(openKeys.includes(sort.uuid)){
                    openKeys = []
                }else{
                    openKeys = [sort.uuid]
                }
                this.setState({
                    showStoreView: false,
                    selectedBigSort: { ...sort },
                    openKeys
                })
            }
           
        });
    }

    /**
     * 选中左侧二级菜单栏
     */
    handleClickMenuItem = (e, smallSort) => {
        this.setState({
            showStoreView: true,
            selectedSmallSort: smallSort
        });
    }

    /**
     * 当鼠标浮在menu-item时调用
     */
    handleMouseEnterMenuItem = (e, smallSort) => {
        this.state.bigSortList.map(sort => {
            if (sort.uuid == smallSort.bigSortUuid) {
                sort.smallSortList.map(order => {
                    if (order.uuid === e.key) {
                        order.display = 'inline'
                    }
                })
            }
        });
        this.setState({
            bigSortList: [...this.state.bigSortList]
        })
    }
    /**
     * 当鼠标离开menu-item时调用
     */
    handleMouseLeaveMenuItem = (e, smallSort) => {
        this.state.bigSortList.map(sort => {
            if (sort.uuid == smallSort.bigSortUuid) {
                sort.smallSortList.map(order => {
                    if (order.uuid === e.key) {
                        order.display = 'none'
                    }
                })
            }
        });
        this.setState({
            bigSortList: [...this.state.bigSortList]
        })
    }

    /**
     * 渲染菜单列表
     */
    renderSilderMenu = () => {
        const {bigSortList} = this.state;
        let menuItems = [];
        bigSortList.map((sort) => {
            menuItems.push(
                <SubMenu
                    onTitleClick={this.handleClickSubMenuItem}
                    key={sort.uuid}
                    title={
                        <span>
                            <Icon type="folder" style={{ color: '#3B77E3' }} />
                            <span>{convertCodeName(sort)}</span>
                        </span>
                    }
                >
                    {
                        sort.smallSortList ? sort.smallSortList.map(smallSort => {
                            let entity = {
                                uuid: smallSort.uuid,
                                code: smallSort.code,
                                name: smallSort.name,
                            }
                            return <Menu.Item key={smallSort.uuid}
                                onMouseEnter={loginOrg().type === 'COMPANY' ? (e) => this.handleMouseEnterMenuItem(e, smallSort) : null}
                                onMouseLeave={(e) => this.handleMouseLeaveMenuItem(e, smallSort)}
                                onClick={(e) => this.handleClickMenuItem(e, smallSort)}
                            >
                                <Icon type="swap" rotate={90} style={{ color: '#3B77E3' }} />
                                <span>{convertCodeName(entity)}</span>
                                {
                                    smallSort.display === 'inline' ?
                                        <span style={{ float: 'right' }}>
                                            <a className={styles.menuItemA}
                                                onClick={() => { this.handleCreateModalVisible(true, smallSort, sort) }}
                                            >
                                                {commonLocale.editLocale}
                                            </a>
                                            &nbsp;
                              <a className={styles.menuItemA}
                                                onClick={() => { this.handleModalVisible(commonLocale.deleteLocale, smallSort) }}
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
                    <span className={styles.title}>{BillSort.siderTitle}</span>
                    <div className={styles.action}>{this.drawActionButton()}</div>
                </div>
                <Menu
                    defaultSelectedKeys={[this.state.selectedBigSort.smallSortList?this.state.selectedBigSort.smallSortList[0].uuid:'']}
                    defaultOpenKeys={[this.state.selectedBigSort ? this.state.selectedBigSort.uuid : '']}
                    mode='inline'
                    theme='light'
                    openKeys={this.state.openKeys}
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
                <Button type='primary' onClick={this.handleCreateBigsort}>
                    {BillSort.createBigsort}
                </Button>
            </Fragment>
        )
    }

    /**
     * 绘制右侧内容栏
     */
    drawContent = () => {
        const { selectedBigSort, showStoreView, selectedSmallSort,
            createModalVisible } = this.state
        return (
            <div>
                {
                    showStoreView ?
                        <BillSortDetailTable
                            smallEntity={selectedSmallSort}
                            smallSortUuid={selectedSmallSort ? selectedSmallSort.uuid : ''}
                            selectedBigSort={selectedBigSort}
                        />
                        : <BillSortCreatePage
                            selectedBigSort={selectedBigSort.uuid ? selectedBigSort : undefined}
                            reFreshSider={this.querySorts}
                            handleSaveSort={this.handleSaveSort}
                            createModalVisible={createModalVisible}
                            saveSmallSort={this.saveSmallSort}
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

    saveSmallSort = (type, payload) => {
        this.props.dispatch({
            type: type,
            payload: payload,
            callback: response => {
                if (response && response.success) {
                    message.success(commonLocale.saveSuccessLocale);
                    this.querySorts();
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
        const { createModalVisible, editSmallSort,
            selectedSmallSort, selectedBigSort
        } = this.state;
        const createParentMethods = {
            handleSaveSort: this.handleSaveSort,
            handleCreateModalVisible: this.handleCreateModalVisible,
        };
        return (
            <div>
                <BillSmallSortCreateForm
                    {...createParentMethods}
                    createModalVisible={createModalVisible}
                    confirmLoading={false}
                    smallEntity={editSmallSort}
                    selectedBigSort={selectedBigSort}
                    hideModal={this.hideModal}
                    saveSmallSort={this.saveSmallSort}
                />

                <div>
                    <ConfirmModal
                        visible={this.state.modalVisible}
                        operate={this.state.operate}
                        object={BillSort.smallSortTitle + ':' + '['+selectedSmallSort.code+']'+selectedSmallSort.name}
                        onOk={this.handleOk}
                        onCancel={this.handleModalVisible}
                    />
                </div>
            </div>
        )
    }

    // 重写部分---结束----
}
