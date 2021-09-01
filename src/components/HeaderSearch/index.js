import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Input, Icon, AutoComplete, Breadcrumb } from 'antd';
import classNames from 'classnames';
import Debounce from 'lodash-decorators/debounce';
import Bind from 'lodash-decorators/bind';
import styles from './index.less';
import { getSearchMenus, getUserBreadcrumb, getMenuLayout } from '@/utils/LoginContext';
import IconFont from '@/components/IconFont';

export default class HeaderSearch extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    placeholder: PropTypes.string,
    onSearch: PropTypes.func,
    onPressEnter: PropTypes.func,
    defaultActiveFirstOption: PropTypes.bool,
    dataSource: PropTypes.array,
    defaultOpen: PropTypes.bool,
    onVisibleChange: PropTypes.func,
  };

  static defaultProps = {
    defaultActiveFirstOption: false,
    onPressEnter: () => { },
    onSearch: () => { },
    className: '',
    placeholder: '',
    dataSource: [],
    defaultOpen: false,
    onVisibleChange: () => { },
  };

  static getDerivedStateFromProps(props) {
    if ('open' in props) {
      return {
        searchMode: props.open,
      };
    }
    return null;
  }

  constructor(props) {
    super(props);

    const breadcrumb = getUserBreadcrumb();
    const options = [];
    const searchedMenus = getSearchMenus();

    Object.keys(breadcrumb).forEach(function (key) {
      if (searchedMenus && searchedMenus.indexOf(key) > -1) {
        options.push(breadcrumb[key].name);
      }
    });
    this.state = {
      searchMode: props.defaultOpen,
      value: '',
      options: options
    };
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  onKeyDown = e => {
    if (e.key === 'Enter') {
      const { onPressEnter, onChange } = this.props;
      const { value } = this.state;
      this.timeout = setTimeout(() => {
        const breadcrumb = getUserBreadcrumb();
        Object.keys(breadcrumb).forEach(function (key) {
          if (breadcrumb[key].name === value) {
            onChange(key);
          }
        });
      }, 0);
    }
  };

  onChange = value => {
    const { onChange } = this.props;
    this.setState({ value });
    const { options } = this.state;
    if (onChange && options.indexOf(value) > -1) {
      const breadcrumb = getUserBreadcrumb();
      Object.keys(breadcrumb).forEach(function (key) {
        if (breadcrumb[key].name === value) {
          onChange(key);
        }
      });
    }
  };

  enterSearchMode = () => {
    const { onVisibleChange } = this.props;
    onVisibleChange(true);
    this.setState({ searchMode: true }, () => {
      const { searchMode } = this.state;
      if (searchMode) {
        this.input.focus();
      }
    });
    if (this.props.onMenuSearchChange) {
      this.props.onMenuSearchChange(true);
    }
  };

  leaveSearchMode = () => {
    const breadcrumb = getUserBreadcrumb();
    const options = [];
    const searchedMenus = getSearchMenus();

    Object.keys(breadcrumb).forEach(function (key) {
      if (searchedMenus && searchedMenus.indexOf(key) > -1) {
        options.push(breadcrumb[key].name);
      }
    });
    if (this.props.onMenuSearchChange) {
      this.props.onMenuSearchChange(false);
    }
    this.setState({
      searchMode: false,
      value: '',
      options: [...options]
    });
  };

  // NOTE: 不能小于500，如果长按某键，第一次触发auto repeat的间隔是500ms，小于500会导致触发2次
  @Bind()
  @Debounce(500, {
    leading: true,
    trailing: false,
  })
  debouncePressEnter() {
    const { onPressEnter } = this.props;
    const { value } = this.state;
    onPressEnter(value);
  }

  onSearch = value => {
    const breadcrumb = getUserBreadcrumb();
    const options = [];

    if (value) {
      Object.keys(breadcrumb).forEach(function (key) {
        if (!breadcrumb[key].children && breadcrumb[key].name.indexOf(value) > -1) {
          options.push(breadcrumb[key].name);
        }
      });
      if (options.length === 0) {
        options.push("无匹配结果");
      }
    }

    this.setState({ options: [...options] });
  }

  render() {
    const { className, placeholder, open, ...restProps } = this.props;
    const { searchMode, value } = this.state;
    delete restProps.defaultOpen; // for rc-select not affected
    const inputClass = classNames(styles.input, {
      [styles.show]: searchMode,
      [styles.dropdown]: true
    });

    return (
      <span
        className={classNames(className, styles.headerSearch)}
        onClick={this.enterSearchMode}
        onTransitionEnd={({ propertyName }) => {
          if (propertyName === 'width' && !searchMode) {
            const { onVisibleChange } = this.props;
            onVisibleChange(searchMode);
          }
        }}
      >
        <IconFont
          type='icon-search'
          style={{ fontSize: '20px', 'marginTop': '-5px', color: getMenuLayout() === 'topmenu' ? '#FFFFFF' : '#848C96' }} />
        <AutoComplete
          key="AutoComplete"
          {...restProps}
          className={inputClass}
          value={value}
          onChange={this.onChange}
          dataSource={this.state.options}
          onSearch={this.onSearch}
          style={{background: 'white'}}
          dropdownClassName={styles.dropdown}
        >
          <Input
            ref={node => {
              this.input = node;
            }}
            // aria-label={placeholder}
            placeholder="搜索菜单"
            onKeyDown={this.onKeyDown}
            onBlur={this.leaveSearchMode}
          />
        </AutoComplete>
      </span>
    );
  }
}
