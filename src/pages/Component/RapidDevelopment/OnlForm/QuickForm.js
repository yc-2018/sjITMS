import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Route, Switch } from 'react-router-dom';
import Create from '@/pages/Component/RapidDevelopment/OnlForm/QuickCreate';
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
      showPageNow: props.route.quickuuid + 'query',
      tableName: '',
      onlFormField: [],
    };
    this.toQueryPage();
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
      },
    });
  };

  componentWillReceiveProps(nextProps) {
    const { showPageMap, map } = nextProps.quick;
    this.setState({
      showPageNow: showPageMap.get(this.state.quickuuid),
    });
  }

  render() {
    const { showPageNow, quickuuid, tableName, onlFormField } = this.state;
    const { location } = this.props;
    switch (showPageNow) {
      case quickuuid + 'create':
        return <Create quickuuid={quickuuid} onlFormField={onlFormField} />;
      case quickuuid + 'update':
        return <Create quickuuid={quickuuid} onlFormField={onlFormField} />;
      case quickuuid + 'query':
        return (
          <QuickFormSearchPage
            quickuuid={quickuuid}
            pathname={location.pathname}
            tableName={tableName}
            onlFormField={onlFormField}
          />
        );
      case quickuuid + 'view':
        return (
          <QuickViewPage
            quickuuid={quickuuid}
            onlFormField={onlFormField}
            pathname={this.props.location.pathname}
          />
        );
      default:
        return null;
    }
  }
}
