import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Drawer, Form } from 'antd';
import { cacheResourceDescription, getResourceDescription } from '@/utils/LoginContext';
import { getDom } from '@/components/NewPageHeaderWrapper/FullScreenPageWrapper';
import { isNotEmpty } from '@/utils/utils';

/**
 * 资源描述 Drawer
 *
 * @param {boolean} visible:
 * @param {function} handleResourceDescDrawerVisible:
 * @param {boolean|Spin} loading:
 * @param {String} resourceKey: 资源键
 * @param {String} title: 资源名称
 */
@connect(({ onlinehelp, loading }) => ({
  onlinehelp,
  loading: loading.models.stock,
}))
@Form.create()
export default class ResourceDescPage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: props.visible,
      data: [],
      resourceKey: props.resourceKey,
    };
  }

  componentDidMount() {
    this.queryResourceDesc(this.state.resourceKey);
  }

  /**
   * 查询资源说明
   */
  queryResourceDesc = (resourceKey) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'onlinehelp/query',
      payload: {},
      callback: res => {
        if (res && res.success) {
          cacheResourceDescription(res.data);
          let desc = '';
          if (resourceKey) {
            desc = getResourceDescription(resourceKey);
          } else {
            desc = this.getResourceDescriptionByTitle(res.data, this.props.title);
          }
          this.setState({
            desc: desc,
          });
        }
      },
    });
  };

  getResourceDescriptionByTitle = (helpInfos, title) => {
    if (isNotEmpty(helpInfos)) {
      for (let i = 0; i < helpInfos.length; i++) {
        const helpInfo = helpInfos[i];
        if (helpInfo.name === title) {
          return helpInfo.description;
        }
      }
    }
    return '--空--';
  };

  /**
   * 关闭抽屉
   */
  handleResourceDescDrawerVisible = () => {
    this.setState({
      visible: false,
    });
    this.props.handleResourceDescDrawerVisible();
  };

  render() {
    const { desc } = this.state;
    return <Drawer
      title={'帮助说明'}
      placement="right"
      onClose={this.handleResourceDescDrawerVisible}
      visible={this.props.visible}
      width={'30%'}
      destroyOnClose
      getContainer={getDom()}
      maskClosable={true}
    >
      <div>
        <div dangerouslySetInnerHTML={{ __html: desc }}></div>
      </div>
    </Drawer>;
  }
}
