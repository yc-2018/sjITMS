import { PureComponent } from "react";
import { Select } from 'antd';
import { connect } from 'dva';
import { loginCompany, loginOrg } from '@/utils/LoginContext';
@connect(({ dec }) => ({
  dec,
}))
export default class DecArticleSelect extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      value: props.value
    }

    this.props.dec.articles = [];
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value
    });

    /*if (nextProps.value && this.props.value !== nextProps.value) {
      this.onSearch(nextProps.value);
    }*/
  }

 /* componentDidMount() {
    const { value } = this.state;
    if (value)
      this.onSearch(value);
  }*/

  buildOptions = () => {
    let options = [];

    if (!this.props.wrhUuid || !this.props.ownerUuid) {
      return options;
    }

    let data = this.props.dec.articles;

    Array.isArray(data) && data.forEach(function (article) {
      options.push(
        <Select.Option key={article.articleUuid} value={JSON.stringify({
          uuid: article.uuid,
          code: article.code,
          name: article.name,
          spec: article.spec
        })}> {'[' + article.code + ']' + article.name} </Select.Option>
      );
    });
    return options;
  }

  onSearch = (value) => {
    if (!this.props.wrhUuid || !this.props.ownerUuid) {
      return;
    }

    try {
      let article = JSON.parse(value);
      if (article.constructor === Object) {
        let articles = this.props.dec.articles;
        if (Array.isArray(articles) && articles.length > 0) {
          let isExist = false;
          for (let x in articles) {
            if (articles[x].uuid === article.uuid) {
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
      type: 'dec/queryDecArticles',
      payload: {
        companyUuid: loginCompany().uuid,
        dcUuid: loginOrg().uuid,
        wrhUuid: this.props.wrhUuid,
        binCode: this.props.binCode,
        ownerUuid: this.props.ownerUuid,
        articleCodeName: value,
        line: this.props.line,
        page: 0,
        pageSize: 1000
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
      showSearch: true,
      mode: single,
      onChange: this.onChange,
      onSearch: this.onSearch,
      value: this.props.value,
    };

    return (
      <Select {...selectProps} placeholder={this.props.placeholder}>
        {this.buildOptions()}
      </Select>
    );
  }
}
