import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Route, Switch } from 'react-router-dom';
import Create from '@/pages/Component/RapidDevelopment/OnlForm/QuickCreateExpand';
import QuickFormSearchPage from '@/pages/Component/RapidDevelopment/OnlForm/QuickFormSearchPage';
import QuickViewPage from '@/pages/Component/RapidDevelopment/OnlForm/QuickViewPage';

@connect(({ quick, loading }) => ({
  quick,
  loading: loading.models.quick,
}))
export default class QuickForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      quickuuid: props.route.quickuuid,
      showPageNow: 'query',
      tableName: '',
      onlFormField: [],
      params: {},
    };
    //this.toQueryPage();
  }

  /**
   * 进入时进入query
   */
  toQueryPage = () => {
    this.props.dispatch({
      type: 'quick/showPageMap',
      payload: {
        showPageK: this.state.quickuuid,
        showPageV: this.state.quickuuid + 'query',
      },
    });
  };

  componentDidMount() {
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

  componentWillReceiveProps(nextProps) {
    // const { showPageMap, map } = nextProps.quick;
    // this.setState({
    //   showPageNow: showPageMap.get(this.state.quickuuid),
    // });
  }

  //页面切换
  switchTab = (tab, param) => {
    this.setState({ showPageNow: tab });
    this.setState({ params: param });
  };

  render() {
    //console.log('this.state', this.state);
    const { showPageNow, quickuuid, tableName, onlFormField } = this.state;
    const { location } = this.props;
    switch (showPageNow) {
      case 'create':
        return (
          <Create quickuuid={quickuuid} onlFormField={onlFormField} switchTab={this.switchTab} />
        );
      case 'update':
        return (
          <Create
            quickuuid={quickuuid}
            onlFormField={onlFormField}
            switchTab={this.switchTab}
            params={this.state.params}
            showPageNow={this.state.showPageNow}
          />
        );
      case 'query':
        return (
          <QuickFormSearchPage
            quickuuid={quickuuid}
            pathname={location.pathname}
            tableName={tableName}
            onlFormField={onlFormField}
            switchTab={this.switchTab}
          />
        );
      case 'view':
        return (
          <QuickViewPage
            quickuuid={quickuuid}
            onlFormField={onlFormField}
            pathname={this.props.location.pathname}
            switchTab={this.switchTab}
            params={this.state.params}
          />
        );
      default:
        return null;
    }
  }
}
