import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Route, Switch } from 'react-router-dom';
import Create from '@/pages/Component/RapidDevelopment/OnlForm/QuickCreatePageDefault';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/QuickFormSearchPageDefault';
import QuickViewPage from '@/pages/Component/RapidDevelopment/OnlForm/QuickViewPageDefault';
import ExcelImport from '@/components/ExcelImport';

//目录跳转界面
export default class QuickForm extends PureComponent {
  drawTab = () => {}; //扩展标签页

  constructor(props) {
    super(props);
    this.state = {
      quickuuid: props.route?.quickuuid ? props.route.quickuuid : props.quickuuid,
      showPageNow: 'query',
      tableName: '',
      onlFormField: [],
      params: {},
    };
  }

  componentDidMount() {
    // console.log('props', this.props);
    this.getCreateConfig();
  }

  /**
   * 获取配置信息
   */
  getCreateConfig = () => {
    this.props.dispatch({
      type: 'quick/queryCreateConfig',
      payload: this.state.quickuuid,
      callback: response => {
        if (response.result) {
          this.setState({
            onlFormField: response.result,
            tableName: response.result[0].onlFormHead.tableName,
          });
        }
        //获取路由中的值
        if (this.props.location.state) {
          const { state } = this.props.location;
          this.setState({ params: state.param });
          this.setState({ showPageNow: state.tab });
        }
      },
    });
  };

  componentWillReceiveProps(nextProps) {}
  //页面切换
  switchTab = (tab, param) => {
    this.setState({ showPageNow: tab });
    this.setState({ params: param });
  };

  // 如果把函数参数在render中声明，则react会当成props发生改变从而导致子组件重新render
  fixedProps = { switchTab: (tab, param) => this.switchTab(tab, param) };

  render() {
    const { showPageNow, quickuuid, tableName, onlFormField, params } = this.state;
    const { location } = this.props;
    const props = {
      showPageNow: showPageNow,
      quickuuid: quickuuid,
      onlFormField: onlFormField,
      params: params,
      tableName: tableName,
      pathname: location.pathname,
      ...this.fixedProps,
      route: this.props.route,
      isNotHd: this.props.isModal ? this.props.isModal : false,
    };
    let component;
    let e;
    switch (showPageNow) {
      case 'create':
        component = <Create {...props} />;
        e = {
          component: component,
          showPageNow: showPageNow,
          props: props,
        };
        this.drawTab(e);
        return e.component;
      case 'update':
        component = <Create {...props} />;
        e = {
          component: component,
          showPageNow: showPageNow,
          props: props,
        };
        this.drawTab(e);
        return e.component;
      case 'query':
        component = <QuickFormSearchPage {...props} />;
        e = {
          component: component,
          showPageNow: showPageNow,
          props: props,
        };
        this.drawTab(e);
        return e.component;
      case 'view':
        component = <QuickViewPage {...props} />;
        e = {
          component: component,
          showPageNow: showPageNow,
          props: props,
        };
        this.drawTab(e);
        return e.component;
      case 'import':
        component = <ExcelImport {...props} cancelCallback={() => this.switchTab('query')} />;
        e = {
          component: component,
          showPageNow: showPageNow,
          props: props,
        };
        this.drawTab(e);
        return e.component;
      default:
        return null;
    }
  }
}
