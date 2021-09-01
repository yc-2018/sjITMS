import Prompt from 'umi/prompt';

/**
 * 确认离开提示 (路由级别)
 */
export default () => {

  return (
    <Prompt
      when={true}
      message={(location) => {
        return window.confirm(`确定离开当前页面前往 ${location.pathname}?`);
      }}
    />
  );
}
