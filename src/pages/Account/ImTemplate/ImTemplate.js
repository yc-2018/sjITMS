import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Form, Button, message, Icon, Empty, Menu } from 'antd';
import ConfirmModal from '@/pages/Component/Modal/ConfirmModal';
import SiderPage from '@/pages/Component/Page/SiderPage';
import { commonLocale } from '@/utils/CommonLocale';
import { formatMessage } from 'umi/locale';
import { imTemplateLocale } from './ImTemplateLocale';
import { ImportTemplateType } from './ImTemplateContants';
import ImTemplateCreatePage from './ImTemplateCreatePage';
import styles from './ImTemplate.less';

const typeList = [];
Object.keys(ImportTemplateType).forEach(function(key) {
  typeList.push({
    name: ImportTemplateType[key].name,
    caption: ImportTemplateType[key].caption,
  });
});

const FormItem = Form.Item;
const { SubMenu } = Menu;

@connect(({ imTemplate, loading }) => ({
  imTemplate,
  loading: loading.models.imTemplate,
}))
@Form.create()
export default class ImTemplate extends SiderPage {
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
        minHeight:
          document.body.clientHeight < 650
            ? document.body.clientHeight
            : document.body.clientHeight - 210,
        height:
          document.body.clientHeight < 650
            ? document.body.clientHeight
            : document.body.clientHeight - 210,
      },
      contentStyle: {
        marginLeft: '20px',
        borderRadius: '4px',
      },
      imTemplateList: [], // 所有的导入模板
      typeList: typeList,
      selectedImportTemplate: undefined, // 选中的一个模板
      selectedType: {}, // 选中的一个一级菜单
    };
  }

  componentDidMount() {
    this.queryImTemplateList();
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.imTemplate.allData &&
      nextProps.imTemplate.allData != this.props.imTemplate.allData
    ) {
      for (let i = 0; i < nextProps.imTemplate.allData.length; i++) {
        for (let t = 0; t < this.state.typeList.length; t++) {
          if (this.state.typeList[t].name === nextProps.imTemplate.allData[i].type) {
            this.state.typeList[t].template = [nextProps.imTemplate.allData[i]];
          }
        }
      }
      this.setState({
        imTemplateList: nextProps.imTemplate.allData,
        typeList: [...this.state.typeList],
        selectedImportTemplate: this.state.typeList[0].template
          ? this.state.typeList[0].template
          : undefined,
        selectedType: this.state.typeList[0],
      });
    }
  }

  /**
   * 查询报表的目录
   */
  queryImTemplateList = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'imTemplate/queryAll',
    });
  };

  /**
   * 下载模板
   * @param entity
   */
  downPrintTemplate = type => {
    let fileName = this.state.imTemplateList?.find(e => e.type == type).name;
    const { dispatch } = this.props;
    dispatch({
      type: 'imTemplate/getPath',
      payload: {
        type: type,
        isDataBase: true,
        fileName,
      },
      // callback: response => {
      //   if (response && response.success) {
      //     location.href = response.data;
      //   }
      // },
    });
  };
  /**
   * 新增模板
   */
  handleSave = param => {
    const { dispatch } = this.props;
    let type = 'imTemplate/onSave';
    if (param.uuid) {
      type = 'imTemplate/onModify';
    }
    this.props.dispatch({
      type: type,
      payload: param,
      callback: response => {
        if (response && response.success) {
          if (type === 'imTemplate/onSave') {
            message.success(commonLocale.saveSuccessLocale);
            this.queryImTemplateList();
          } else {
            message.success(commonLocale.modifySuccessLocale);
          }
        }
      },
    });
  };

  /**
   * 新建目录
   */
  handleCreateMenu = type => {
    this.setState({
      selectedType: type,
      selectedImportTemplate: undefined,
    });
  };

  // // 菜单相关---开始---

  /**
   * 选中左侧二级菜单栏
   */
  handleClickMenuItem = (e, item) => {
    this.setState({
      selectedImportTemplate: [item],
    });
  };

  /**
   * 当鼠标浮在目录时调用
   */
  handleMouseEnterMenuItem = (e, type) => {
    this.state.typeList.map(child => {
      if (child.name === e.key) {
        child.display = 'inline';
      }
    });
    this.setState({
      typeList: [...typeList],
    });
  };
  /**
   * 当鼠标离开目录时调用
   */
  handleMouseLeaveMenuItem = (e, type) => {
    this.state.typeList.map(child => {
      if (child.name === e.key) {
        child.display = 'none';
      }
    });
    this.setState({
      typeList: [...typeList],
    });
  };

  /**
   * 渲染左侧菜单内容
   */
  renderSilderMenu = () => {
    const { imTemplateList } = this.state;
    let menuItems = [];
    typeList.map(type => {
      menuItems.push(
        <SubMenu
          onMouseEnter={e => this.handleMouseEnterMenuItem(e, type)}
          onMouseLeave={e => this.handleMouseLeaveMenuItem(e, type)}
          key={type.name}
          title={
            <span>
              <Icon type="folder" style={{ color: '#3B77E3' }} />
              <span>{type.caption}</span>
              {type.display === 'inline' ? (
                <span style={{ float: 'right' }}>
                  <a
                    className={styles.menuItemA}
                    onClick={() => {
                      this.handleCreateMenu(type);
                    }}
                  >
                    {commonLocale.createLocale}
                  </a>
                </span>
              ) : null}
            </span>
          }
        >
          {type.template
            ? type.template.map(item => {
                return (
                  <Menu.Item key={item.uuid} onClick={e => this.handleClickMenuItem(e, item)}>
                    <Icon type="swap" rotate={90} style={{ color: '#3B77E3' }} />
                    <span>{item.name}</span>
                    {type.display === 'inline' ? (
                      <span style={{ float: 'right' }}>
                        <a
                          className={styles.menuItemA}
                          onClick={() => {
                            this.downPrintTemplate(type.name);
                          }}
                        >
                          {commonLocale.downloadLocale}
                        </a>
                      </span>
                    ) : null}
                  </Menu.Item>
                );
              })
            : null}
        </SubMenu>
      );
    });

    return menuItems;
  };

  // 菜单相关---结束---

  /**
   * 绘制左侧导航栏
   */
  drawSider = () => {
    return (
      <div>
        <div className={styles.navigatorPanelWrapper}>
          <span className={styles.title}>{imTemplateLocale.manageTitle}</span>
        </div>
        <Menu
          defaultSelectedKeys={[this.state.selectedType ? this.state.selectedType.uuid : '']}
          defaultOpenKeys={[this.state.selectedType ? this.state.selectedType.uuid : '']}
          forceSubMenuRender={true}
          mode="inline"
          theme="light"
          style={{ marginTop: '5%', height: '95%', marginLeft: '-24px', width: '107%' }}
        >
          {this.renderSilderMenu()}
        </Menu>
      </div>
    );
  };

  /**
   * 绘制右侧内容栏
   */
  drawContent = () => {
    const { selectedType, showReportView, selectedReport, selectedImportTemplate } = this.state;
    return (
      <div>
        <ImTemplateCreatePage
          selectedImportTemplate={selectedImportTemplate}
          handleSave={this.handleSave}
          selectedType={selectedType}
        />
      </div>
    );
  };
  // 重写部分 结束
}
