import { PureComponent } from "react";
import { Select } from 'antd';
import { connect } from 'dva';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
@connect(({ process }) => ({
  process,
}))
export default class ProcessArticleSelect extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      value: props.value
    }

    this.props.process.articles = [];
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value
    });

    if (nextProps.value && this.props.value !== nextProps.value) {
      this.onSearch(nextProps.value);
    }
  }

  componentDidMount() {
    const { value } = this.state;
    //if (value)
    this.onSearch(value);
  }

  buildOptions = () => {
    let options = [];

    if (!this.props.ownerUuid) {
      return options;
    }

    let data = this.props.process.articles;
    Array.isArray(data) && data.forEach(function (article) {
      options.push(
        <Select.Option key={article.articleUuid} value={JSON.stringify({
          uuid: article.articleUuid,
          code: article.articleCode,
          name: article.articleName,
          spec: article.articleSpec
        })}> {'[' + article.articleCode + ']' + article.articleName} </Select.Option>
      );
    });
    return options;
  }

  onSearch = (value) => {
    if (!this.props.ownerUuid) {
      return;
    }

    try {
      let article = JSON.parse(value);
      if (article.constructor === Object) {
        let articles = this.props.process.articles;
        if (Array.isArray(articles) && articles.length > 0) {
          let isExist = false;
          for (let x in articles) {
            if (articles[x].articleUuid === article.uuid) {
              isExist = true;
              break;
            }
          }
          if (isExist) {
            return;
          }
        } else {
          value = article.code;
        }
      }
    } catch (e) {
    }
    this.props.dispatch({
      type: 'process/queryProcessArticles',
      payload: {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        ownerUuid: this.props.ownerUuid,
        schemeUuid: this.props.schemeUuid ? this.props.schemeUuid : '',
        wrhUuid: this.props.wrhUuid,
        articleCode: value == undefined ? '' : value,
      }
    });
  }

  onChange = (selectValue) => {
    this.setState({
      value: selectValue,
    });

    // 用于form表单获取控件值
    if (this.props.onChange)
      this.props.onChange(selectValue);
  }

  render() {
    const { single } = this.props;
    const selectProps = {
      //showSearch: true,
      mode: single,
      onChange: this.onChange,
      //onSearch: this.onSearch,
      value: this.props.value,
    };
    return (
      <Select {...selectProps} placeholder={this.props.placeholder}>
        {this.buildOptions()}
      </Select>
    );
  }
}