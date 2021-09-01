import React, {PureComponent} from 'react';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import E from 'wangeditor';
/**
 * 富文本控件
 * 1，引入该控件 import Editor from '@/components/MyComponent/Editor';
 * 2，定义控件属性：
 const editorProps = {
      html: '', //原值一般为空
      onEditerChange: this.onEditerChange 内容发生变化时可以通过该事件获取html
    };
 3，事件定义：
 onEditerChange = (html) => {
    message.error(html); // html即富文本内容，包括base64后的图片内容
  }
 *
 */
@connect(({ oss }) => ({
  oss
}))
export default class Editor extends PureComponent {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    var editor = new E('#editor');
    //editor.customConfig.uploadImgShowBase64 = true;
    editor.customConfig.onchange = this.onchange;
    editor.customConfig.zIndex = 100;
    editor.customConfig.customUploadImg = this.uploadImg;
    editor.customConfig.withCredentials = true;
    editor.create();
    editor.txt.html(this.props.html);
  }
  uploadImg = (files, insert) => {
    const { dispatch } = this.props;
    let formData = new FormData();
    formData.append('file', files[0]);
    dispatch({
      type: 'oss/upload',
      payload: formData,
      callback: (response) => {
        if (response && response.success) {
          dispatch({
            type: 'oss/get',
            payload: response.data,
            callback: response1 => {
              if (response1 && response1.success) {
                insert(response1.data)
              }
            }
          })
        }
      }
    });
  }
  onchange = (html) => {
    if (this.props.onEditerChange)
      this.props.onEditerChange(html);
  }
  render() {
    return (
      <div id="editor" />
    );
  }
}
