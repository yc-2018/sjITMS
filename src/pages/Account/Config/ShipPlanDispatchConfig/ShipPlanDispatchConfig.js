import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import {
  Table,
  message,
  Switch,
  Tabs,
  Form,
  Button,
  Checkbox,
} from 'antd';
import DescriptionList from '@/components/DescriptionList';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import NavigatorPanel from '@/pages/Component/Page/inner/NavigatorPanel';
import Page from '@/pages/Component/Page/inner/Page';
import moment from 'moment';
import { loginCompany } from '@/utils/LoginContext';
import { binUsage } from './ShipPlanDispatchConfigBinUsage';
import styles from './ShipPlanDispatchConfig.less';
import { commonLocale } from '@/utils/CommonLocale';


const { Description } = DescriptionList;
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;

@connect(({ shipplandispatchconfig, loading }) => ({
  shipplandispatchconfig,
  loading: loading.models.shipplandispatchconfig,
}))
@Form.create()
export default class CompanyDetail extends Component {
  state = {
    checkedBinUsage: ["CollectBin"],
  };

  componentDidMount() {
    const { currentCompany } = this.state;
    this.fetchBinUsages();
  }

  /**
   * 获取该企业的货位用途
   */
  fetchBinUsages = () => {
    const { dispatch } = this.props;
    const { checkedBinUsage } = this.state;

    dispatch({
      type: 'shipplandispatchconfig/get',
      callback: response => {
        if (response && response.success) {
          let data = response.data;
          if (Array.isArray(data) && data.length > 0) {
            data.map(item => {
              if (checkedBinUsage.indexOf(item) === -1) {
                checkedBinUsage.push(item);
              }
            });
            this.setState({
              checkedBinUsage: checkedBinUsage,
            });
          }
        }
      },
    });
  };

  /**
   * 保存
   */
  save = binUsages => {
    const { dispatch } = this.props;
    return new Promise(function (resolve, reject) {
      dispatch({
        type: 'shipplandispatchconfig/save',
        payload: binUsages,
        callback: response => {
          if (response && response.success) {
            message.success(commonLocale.modifySuccessLocale);
            resolve({ success: true });
            return;
          }
        },
      });
    })

  };

  /** 判断货位是否被选中*/
  refreshPermChecked = (key) => {
    let { checkedBinUsage } = this.state;

    if (!checkedBinUsage)
      return false;

    for (let i = 0; i < checkedBinUsage.length; i++) {
      if (checkedBinUsage[i] === key)
        return true;
    }
    return false;
  }

  /** 操作货位被选中或者取消时触发*/
  onChange = (key, e) => {
    let { checkedBinUsage } = this.state;

    if (key == binUsage.CollectBin.name) {
      return;
    }

    if (e.target.checked) {
      if (checkedBinUsage.indexOf(key) === -1) {
        checkedBinUsage.push(key);
      }
    } else {
      let index = checkedBinUsage.indexOf(key);
      if (index > -1) {
        checkedBinUsage.splice(index, 1);
      }
    }

    this.save(checkedBinUsage)
      .then(res => {
        if (res.success) {
          this.setState({
            checkedBinUsage: checkedBinUsage
          });
        }
      })
      .catch(e => console.error(e));
  }

  getUsageOptions = () => {
    let options = [];
    let onChange = this.onChange;
    let that = this;
    let refreshPermChecked = this.refreshPermChecked;
    Object.keys(binUsage).forEach(function (key) {
      options.push(
        <div>
          <Checkbox
            disabled={binUsage.CollectBin.name === key}
            onChange={that.onChange.bind(that, binUsage[key].name)}
            key={binUsage[key].name}
            checked={binUsage[key].disableChecked ? true : refreshPermChecked(binUsage[key].name)}>
            {binUsage[key].caption}
          </Checkbox>
          <br />
          <br />
          <span style={{ marginLeft: '24px' }}>{binUsage[key].describe}</span>
        </div>
      );
    });
    return options;
  }


  render() {
    const {
      shipplandispatchconfig: { data },
      loading,
      form,
    } = this.props;

    const {
      checkedBinUsage,
    } = this.state;

    return (
      <div className={styles.shipplandispatchconfig}>
        {this.getUsageOptions()}
      </div>
    );
  }
}
