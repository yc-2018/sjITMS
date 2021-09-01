import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Form, Button, message, Icon, Empty, Menu, Modal, Select } from 'antd';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import PageLoading from '@/components/PageLoading';
import SiderPage from '@/pages/Component/Page/SiderPage';
import emptySvg from '@/assets/common/img_empoty.svg';
import { commonLocale, placeholderChooseLocale } from '@/utils/CommonLocale';
import { reportLocale } from './ReportLocale';
import { formatMessage } from 'umi/locale';
import ReportPage from './ReportPage';
import MenuPage from './MenuPage';
import styles from '@/pages/Component/Page/inner/SiderPage.less';
import { loginOrg } from '@/utils/LoginContext';
import { REPORT_RES } from './ReportPermission';
import { havePermission } from '@/utils/authority';
import { copyFileSync } from 'fs';
const FormItem = Form.Item;
const { SubMenu } = Menu;

@connect(({ report, loading }) => ({
  report,
  loading: loading.models.report,
}))
@Form.create()
export default class Report extends SiderPage {
  constructor(props) {
    super(props);

    this.state = {
      menuList: [],// 所有的报表
      selectedMenu: {},// 选中的菜单
      selectedReport: {},// 选中的报表
      showReportView: false,
      operate: '',
      modalVisible: false, //确认删除提示框

      entity: {},// 子组件传递值 -- 统一删除提示框
      target: '',

      isLoading: false,
      folderVisible: false, //移动时展示新目录的弹窗
    };
  }

  componentDidMount() {
    this.queryMenu();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.report.menuList && nextProps.report.menuList != this.props.report.menuList) {
      nextProps.report.menuList.map(menu => {
        menu.showName = menu.name
        if (menu.children && menu.children.length > 0) {
          for (let child of menu.children) {
            child.showName = child.name
          }
        }
      });
      this.setState({
        menuList: nextProps.report.menuList,
        selectedMenu: nextProps.report.menuList[0]
      })
    }
  }

  /**
   * 查询报表的目录
   */
  queryMenu = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'report/queryMenu',
    });
    if (this.state.showReportView) {
      this.setState({
        showReportView: false
      })
    }
  }

  /**
   * 模态框显示/隐藏
   */
  handleModalVisible = (operate, entity, target) => {
    if (operate) {
      this.setState({
        operate: operate
      })
    }
    if (entity && target) {
      this.setState({
        entity: entity,
        target: target
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
    const { operate, selectedReport } = this.state;
    if (operate === commonLocale.deleteLocale && (this.state.target != 'menu' && this.state.target != 'report')) {
      this.handleRemove(selectedReport);
    } else if (operate === commonLocale.deleteLocale && (this.state.target === 'menu' || this.state.target === 'report')) {
      this.handleRemove(this.state.entity);
    }
  }

  /**
   * 删除
   */
  handleRemove = (entity) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'report/remove',
      payload: entity.uuid,
      callback: response => {
        if (response && response.success) {
          message.success(formatMessage({ id: 'common.message.success.delete' }));
          this.queryMenu();
        }
      },
    });
    this.setState({
      modalVisible: !this.state.modalVisible,
      entity: {},
      target: ''
    })
  }

  /**
   * 控制报表组件显示
   */
  handleReportVisible = () => {
    this.setState({
      showReportView: true,
      selectedReport: {}
    })
  }

  /**
   * 新建目录
   */
  handleCreateMenu = () => {
    this.setState({
      selectedMenu: {},
      showReportView: false,
    })
  }

  /**
   * 新增或修改
   */
  handleSave = (param) => {
    let type = 'report/add';
    if (param.uuid) {
      type = 'report/update';
    }
    this.props.dispatch({
      type: type,
      payload: param,
      callback: (response) => {
        if (response && response.success) {
          if (type === 'report/add') {
            message.success(commonLocale.saveSuccessLocale);
          } else {
            message.success(commonLocale.modifySuccessLocale);
          }
          this.queryMenu();
          this.setState({
            showReportView: false
          })
        }
      }
    })
  };


  // 菜单相关---开始---

  /**
   * 选中左侧一级菜单栏
   */
  handleClickSubMenuItem = (e) => {
    this.state.menuList.map(menu => {
      if (menu.uuid === e.key) {
        this.setState({
          showReportView: false,
          selectedMenu: { ...menu }
        })
      }
    });
  }

  /**
   * 选中左侧二级菜单栏
   */
  handleClickMenuItem = (e, item, menu) => {
    this.setState({
      showReportView: true,
      selectedReport: {...item,upperUuid:menu.uuid}
    });
  }

  /**
   * 当鼠标浮在menu-item时调用
   */
  handleMouseEnterMenuItem = (e, item, menu) => {
    menu.children.map(child => {
      if (child.uuid === item.uuid) {
        child.display = 'inline'
        if (child.name.length > 10) {
          child.showName = child.name.substr(0, 9) + '...'
        }
      }
    })
    this.setState({
      menuList: [...this.state.menuList]
    })
  }
  /**
   * 当鼠标离开menu-item时调用
   */
  handleMouseLeaveMenuItem = (e, item, menu) => {
    menu.children.map(child => {
      if (child.uuid === item.uuid) {
        child.display = 'none'
        child.showName = child.name;
      }
    })
    this.setState({
      menuList: [...this.state.menuList]
    })
  }
  handleMouseEnterSubMenu = (e, item) => {
    item.display = 'inline';
    if (item.name.length > 10) {
      item.showName = item.name.substr(0, 9) + '...'
    }
    this.setState({
      menuList: [...this.state.menuList]
    })
  }
  handleMouseLeaveSubMenu = (e, item) => {
    item.display = 'none';
    item.showName = item.name;
    this.setState({
      menuList: [...this.state.menuList]
    })
  }
  /**
   *  调整报表或者目录的序号，向上挪一位或者向下挪一位
   */
  changeOrder = (e, uuid, direction) => {
    e.stopPropagation();
    this.props.dispatch({
      type: 'report/changeOrder',
      payload: {
        uuid: uuid,
        dir: direction
      },
      callback: (response) => {
        if (response && response.success) {
          this.props.dispatch({
            type: 'report/getReportMenu'
          });
          this.queryMenu();
        }
      }
    })
  }

  /**
   * 渲染左侧菜单内容
   */
  renderSilderMenu = () => {
    const { menuList } = this.state;
    let menuItems = [];
    menuList.map((menu, index) => {
      menuItems.push(
        <SubMenu
          onTitleClick={this.handleClickSubMenuItem}
          key={menu.uuid}
          onMouseEnter={(e) => this.handleMouseEnterSubMenu(e, menu)}
          onMouseLeave={(e) => this.handleMouseLeaveSubMenu(e, menu)}
          title={
            <span>
              <Icon type="folder" style={{ color: '#3B77E3' }} />
              <span>{menu.showName}</span>
              {menu.display === 'inline' && menu.orgId === loginOrg().uuid && <span style={{ float: 'right' }}>
                {index > 0 && menuList[index-1].orgId === loginOrg().uuid && <a className={styles.menuItemA}
                                                                                onClick={(e) => { this.changeOrder(e, menu.uuid, 'UP') }}
                                                                                disabled={!havePermission(REPORT_RES.CREATE)}
                >
                  <Icon type="arrow-up" />
                </a>}
                &nbsp;
                {index < menuList.length - 1 && <a className={styles.menuItemA}
                                                   onClick={(e) => { this.changeOrder(e, menu.uuid, 'DOWN') }}
                                                   disabled={!havePermission(REPORT_RES.CREATE)}
                >
                  <Icon type="arrow-down" />
                </a>}
              </span>}
            </span>
          }
        >
          {
            menu.children ? menu.children.map((item, index) => {
              return <Menu.Item key={item.uuid}
                                onMouseEnter={(e) => this.handleMouseEnterMenuItem(e, item, menu)}
                                onMouseLeave={(e) => this.handleMouseLeaveMenuItem(e, item, menu)}
                                onClick={(e) => this.handleClickMenuItem(e, item, menu)}
              >
                <span style={{whiteSpace: 'nowrap',
                  float:'left',
                  display: 'inlineBlock',
                  width: '120px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',cursor:'pointer'}} title={item.name}><Icon type="swap" rotate={90} style={{ color: '#3B77E3' }} />{item.name}</span>
                {
                  item.display === 'inline' && item.orgId === loginOrg().uuid ?
                    <span style={{ float: 'right'}}>
                      {/* <a className={styles.menuItemA}
                        onClick={() => { this.showFolderModal(item.uuid) }}
                      >
                        移动
                      </a>
                      &nbsp; */}
                      {index > 0 && <a className={styles.menuItemA}
                                       onClick={(e) => { this.changeOrder(e, item.uuid, 'UP') }}
                                       disabled={!havePermission(REPORT_RES.CREATE)}
                      >
                        <Icon type="arrow-up" />
                      </a>}
                      &nbsp;
                      {index < menu.children.length - 1 && <a className={styles.menuItemA}
                                                              onClick={(e) => { this.changeOrder(e, item.uuid, 'DOWN') }}
                                                              disabled={!havePermission(REPORT_RES.CREATE)}
                      >
                        <Icon type="arrow-down" />
                      </a>}
                      &nbsp;
                      <a className={styles.menuItemA}
                         onClick={() => { this.handleReportVisible() }}
                         disabled={!havePermission(REPORT_RES.CREATE)}
                      >
                        <Icon type="edit" />
                      </a>
                      &nbsp;
                      <a className={styles.menuItemA}
                         onClick={() => { this.handleModalVisible(commonLocale.deleteLocale, item) }}
                         disabled={!havePermission(REPORT_RES.REMOVE)}
                      >
                        <Icon type="delete" />
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

  // 重写部分 开始

  /**
   * 绘制菜单的右上角按钮
   */
  drawActionButton = () => {
    return (
      <Fragment>
        <Button type='primary' onClick={this.handleCreateMenu} disabled={!havePermission(REPORT_RES.CREATE)}>
          {reportLocale.newDirectory}
        </Button>
      </Fragment>
    )
  }

  changeFolder = () => {
    const { folderUuid, selectedReport, menuUuid } = this.state;
    if (!folderUuid) {
      this.showFolderModal();
      return;
    }
    let uuid = selectedReport.uuid ? selectedReport.uuid : menuUuid;
    this.props.dispatch({
      type: 'report/changeFolder',
      payload: {
        uuid: uuid,
        folderUuid: folderUuid
      },
      callback: res => {
        if (res && res.success) {
          message.success('移动成功');
          this.showFolderModal();
          this.queryMenu();
        }
      }
    })
  }

  handleChange = (value) => {
    this.setState({
      folderUuid: value
    })
  }

  showFolderModal = (menuUuid) => {
    let { folderVisible } = this.state;
    this.setState({
      menuUuid: menuUuid,
      folderVisible: !folderVisible,
      folderUuid: undefined
    })
  }

  /**
   * 绘制其它组件
   */
  drawOtherCom = () => {
    let object = undefined;
    let { menuList, selectedReport, folderUuid } = this.state;
    let folderList = [];
    menuList.filter(i => i.uuid !== selectedReport.upperUuid).forEach(menu => {
      folderList.push(<Select.Option key={menu.uuid} value={menu.uuid}>
        {menu.name}
      </Select.Option>);
    })
    if (this.state.target === 'menu') {
      object = reportLocale.directoryDeleteFirst + this.state.selectedMenu.name + reportLocale.directoryDeleteLast
    } else {
      object = reportLocale.reportDeleteFirst + this.state.selectedReport.name + ']'
    }
    return (
      <div>
        <ConfirmModal
          visible={this.state.modalVisible}
          operate={this.state.operate}
          object={object}
          onOk={this.handleOk}
          onCancel={this.handleModalVisible}
        />
        <Modal
          visible={this.state.folderVisible}
          title="移动"
          onOk={() => this.changeFolder()}
          onCancel={() => this.showFolderModal()}
          destroyOnClose
        >
          <Select onChange={this.handleChange} value={folderUuid} style={{ width: '100%' }} placeholder={placeholderChooseLocale('新的目录')}>
            {folderList}
          </Select>
        </Modal>
      </div>
    );
  }

  /**
   * 绘制空组件
   */
  drawNoData = () => {
    const { isLoading } = this.state;

    if (isLoading) {
      return <PageLoading />;
    } else {
      return <Empty
        image={emptySvg}
        style={{ position: 'absolute', top: '30%', left: '45%' }}
        description={
          <span>
            {commonLocale.emptyLocale}
          </span>
        }
      >
        <Button
          type="primary"
          icon="plus"
          disabled={!havePermission(REPORT_RES.CREATE)}
          onClick={() => this.handleCreateMenu()}>
          {reportLocale.newDirectory}
        </Button>
      </Empty>
    }
  }

  /**
   * 绘制左侧导航栏
   */
  drawSider = () => {
    return (
      <div>
        <div className={styles.navigatorPanelWrapper}>
          <span className={styles.title}>{reportLocale.title}</span>
          <div className={styles.action}>{this.drawActionButton()}</div>
        </div>
        <div style={{ height: 'calc(100vh - 200px)', overflowY: 'scroll' }}>
          <Menu
            defaultSelectedKeys={[this.state.selectedMenu ? this.state.selectedMenu.uuid : '']}
            defaultOpenKeys={[this.state.selectedMenu ? this.state.selectedMenu.uuid : '']}
            forceSubMenuRender={true}
            mode='inline'
            theme='light'
            style={{ marginTop: '5%', height: '95%', marginLeft: '-24px', width: '107%' }}
          >
            {this.renderSilderMenu()}
          </Menu>
        </div>
      </div>
    );
  }

  /**
   * 绘制右侧内容栏
   */
  drawContent = () => {
    const { selectedMenu, showReportView, selectedReport } = this.state
    return (
      <div>
        {showReportView ?
          <ReportPage
            selectedReport={selectedReport.uuid ? selectedReport : undefined}
            selectedMenu={selectedMenu.uuid ? selectedMenu : undefined}
            handleAdd={this.handleSave}
            reFreshSider={this.queryMenu}
            that={this}
            showFolderModal={this.showFolderModal}
          />
          : <MenuPage
            menu={selectedMenu.uuid ? selectedMenu : undefined}
            reFreshSider={this.queryMenu}
            handleReportVisible={this.handleReportVisible}
            that={this}
          />
        }
      </div>
    );
  }
  // 重写部分 结束

}
