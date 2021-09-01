import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Form, Button, message, Icon, Empty, Menu } from 'antd';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import SiderPage from '@/pages/Component/Page/SiderPage';
import { commonLocale } from '@/utils/CommonLocale';
import { formatMessage } from 'umi/locale';
import { printTemplateLocale } from './PrintTemplateLocale';
import { PrintTemplateType } from './PrintTemplateContants';
import PrintTemplateCreatePage from './PrintTemplateCreatePage';
import styles from '@/pages/Component/Page/inner/SiderPage.less';
import { loginOrg } from '@/utils/LoginContext';
import { PRINT_RES } from './PrintTemplatePermission';
import { havePermission } from '@/utils/authority';
const typeList = [];
Object.keys(PrintTemplateType).forEach(function (key) {
  typeList.push({
    name: PrintTemplateType[key].name,
    caption: PrintTemplateType[key].caption,
    template: []
  });
});

const FormItem = Form.Item;
const { SubMenu } = Menu;

@connect(({ template, loading }) => ({
  template,
  loading: loading.models.template,
}))
@Form.create()
export default class PrintTemplate extends SiderPage {
  constructor(props) {
    super(props);

    this.state = {
      printTemplateList: [],// 所有的模板
      typeList: typeList,
      selectedPrintTemplate: undefined,// 选中的一个模板
      selectedType: {},// 选中的一个一级菜单
      currentTemplateUuid: '',
    };
  }

  componentDidMount() {
    this.queryPrintTemplateList();
  }

  componentWillReceiveProps(nextProps) {

    if (nextProps.template.menuList && nextProps.template.menuList != this.props.template.menuList) {
      this.state.typeList.forEach(item => {
        item.template = [];
      })
      for (let i = 0; i < nextProps.template.menuList.length; i++) {
        for (let t = 0; t < this.state.typeList.length; t++) {
          if (this.state.typeList[t].name === nextProps.template.menuList[i].type) {
            this.state.typeList[t].template.push(nextProps.template.menuList[i])
          }
        }
      }
      this.setState({
        printTemplateList: nextProps.template.menuList,
        typeList: this.state.typeList,
        selectedPrintTemplate: this.state.typeList[0].template ? this.state.typeList[0].template : undefined,
        selectedType: this.state.typeList[0],
      })
    }
  }

  /**
   * 查询打印模板的目录
   */
  queryPrintTemplateList = () => {
    const { dispatch } = this.props;
    this.props.dispatch({
      type: 'template/queryAll',
      payload: {
        orgUuid: loginOrg().uuid
      },
    })
  }

  /**
   * 新增模板
   */
  handleSave = (param) => {
    const { dispatch } = this.props;
    let type = 'template/onSave';
    if (param.uuid) {
      type = 'template/onModify';
    }
    this.props.dispatch({
      type: type,
      payload: param,
      callback: (response) => {
        if (response && response.success) {
          if (type === 'template/onSave') {
            message.success(commonLocale.saveSuccessLocale);
          } else {
            message.success(commonLocale.modifySuccessLocale);
          }
          this.setState({
            currentTemplateUuid: param.uuid ? param.uuid : response.data
          })
          this.queryPrintTemplateList();
        }
      }
    })
  }

  /**
   * 删除
   */
  handleRemove = (entity) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'template/onRemove',
      payload: {
        uuid: entity.uuid,
        version: entity.version
      },
      callback: response => {
        if (response && response.success) {
          message.success(commonLocale.removeSuccessLocale);
          this.queryPrintTemplateList();
        }
      },
    });

  }

  /**
   * 新建目录
   */
  handleCreateMenu = (type) => {
    this.setState({
      selectedType: type,
      selectedPrintTemplate: undefined
    })
  }


  // 菜单相关---开始---

  /**
   * 选中左侧二级菜单栏
   */
  handleClickMenuItem = (e, item) => {
    this.setState({
      selectedPrintTemplate: [item]
    });
  }

  /**
   * 当鼠标浮在目录时调用
   */
  handleMouseEnterMenu = (e, type) => {
    this.state.typeList.map(child => {
      if (child.name === e.key) {
        child.display = 'inline'
      }
    })
    this.setState({
      typeList: [...typeList]
    })
  }
  /**
   * 当鼠标离开目录时调用
   */
  handleMouseLeaveMenu = (e, type) => {
    this.state.typeList.map(child => {
      if (child.name === e.key) {
        child.display = 'none'
      }
    })
    this.setState({
      typeList: [...typeList]
    })
  }

  /**
   * 渲染左侧菜单内容
   */
  renderSilderMenu = () => {
    const { printTemplateList } = this.state;
    let menuItems = [];
    typeList.map((type) => {
      menuItems.push(
        <SubMenu
          onMouseEnter={(e) => this.handleMouseEnterMenu(e, type)}
          onMouseLeave={(e) => this.handleMouseLeaveMenu(e, type)}
          key={type.name}
          title={
            <span>
              <Icon type="folder" style={{ color: '#3B77E3' }} />
              <span>{type.caption}</span>
              {
                type.display === 'inline' ?
                  <span style={{ float: 'right' }}>
                    <a className={styles.menuItemA} disabled={!havePermission(PRINT_RES.CREATE)}
                       onClick={() => { this.handleCreateMenu(type) }}
                    >
                      {commonLocale.createLocale}
                    </a>
                  </span> : null
              }
            </span>
          }
        >
          {
            type.template ? type.template.map(item => {
              return <Menu.Item key={item.uuid}
                                onClick={(e) => this.handleClickMenuItem(e, item)}
              >
                <Icon type="swap" rotate={90} style={{ color: '#3B77E3' }} />
                <span>{item.name + (item.def ? '  [当前默认]' : '')}</span>
              </Menu.Item>

            }) : null
          }
        </SubMenu>
      )
    })

    return menuItems;
  }

  // 菜单相关---结束---


  /**
   * 绘制左侧导航栏
   */
  drawSider = () => {

    return (
      <div>
        <div className={styles.navigatorPanelWrapper}>
          <span className={styles.title}>{printTemplateLocale.manageTitle}</span>
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
    const { selectedPrintTemplate, selectedType, currentTemplateUuid } = this.state
    return (
      <div>
        <PrintTemplateCreatePage
          selectedPrintTemplate={selectedPrintTemplate}
          currentTemplateUuid={currentTemplateUuid}
          handleSave={this.handleSave}
          selectedType={selectedType}
          handleRemove={this.handleRemove}
        />
      </div>
    );
  }
  // 重写部分 结束

}
