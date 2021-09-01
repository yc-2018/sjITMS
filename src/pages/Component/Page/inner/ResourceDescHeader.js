import React, { PureComponent } from 'react';
import ResourceDescPage from '@/pages/Component/Page/inner/ResourceDescPage';
import IconFont from '@/components/IconFont';

/**
 * 带有资源描述的头部
 */
export default class ResourceDescHeader extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      resourceDescDrawerVisible: false,
    };
  }

  handleResourceDescDrawerVisible = () => {
    this.setState({
      resourceDescDrawerVisible: !this.state.resourceDescDrawerVisible,
    });
  };

  render() {
    const { title, resourceKey } = this.props;
    const style = {
      fontSize: '14px',
      fontWeight: '600',
      color: 'rgba(54,62,75,1)',
      marginLeft: 24,
      marginTop: -16,
    };
    return (
      <div style={{ block: 'inline' }}>
        <span style={style}>{title}&nbsp;&nbsp;</span>
        <a onClick={this.handleResourceDescDrawerVisible}>
          <IconFont style={{ fontSize: '16px', position: 'relative', top: '1px' }} type='icon_help'/>
        </a>
        {
          this.state.resourceDescDrawerVisible &&
          <ResourceDescPage
            visible={this.state.resourceDescDrawerVisible}
            handleResourceDescDrawerVisible={this.handleResourceDescDrawerVisible}
            title={title}
            resourceKey={resourceKey}
          />
        }
      </div>
    );
  }
}
