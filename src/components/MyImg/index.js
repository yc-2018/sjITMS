import React, { Component } from 'react';
import { Button } from 'antd';

/**
 * 图片列表展示+预览组件
 * @component
 * @param {Object} props - 组件参数
 * @param {string[]} props.images    - 必填。图片 URL 数组。如果未提供或为空，会直接报错。建议在使用组件前使用三元表达式进行判断。
 * @param {string} [props.className]                  - 可选。列表图片的样式类名。
 * @param {React.CSSProperties} [props.listStyle]     - 可选。列表的样式对象。
 * @param {React.CSSProperties} [props.imgCardStyle]  - 可选。图片卡片（img 上的 div）的样式对象。
 * @param {React.CSSProperties} [props.imgListStyle]  - 可选。列表中每张图片的样式对象。
 * @author ChenGuangLong
 * @since 2024/5/24 8:36
 */
class MyImg extends Component {
  state = {
    isFullscreen: false,    // 是否全屏预览
    currentIndex: 0,        // 当前预览的图片索引
    zoom: 1,                // 图片缩放比例
    isDragging: false,      // 是否正在拖动图片
    startX: 0,              // 鼠标按下时的X坐标
    startY: 0,              // 鼠标按下时的Y坐标
    offsetX: 0,             // 图片偏移量（X轴）
    offsetY: 0,             // 图片偏移量（Y轴）
    lastOffsetX: 0,         // 上一次的偏移量（X轴）
    lastOffsetY: 0,         // 上一次的偏移量（Y轴）
  };

  /**
   * 显示全屏预览
   * @param index 图片索引
   * @author ChenGuangLong
   * @since 2024/5/24 8:42
   */
  showFullscreen = (index) => {
    this.setState({
      isFullscreen: true,
      currentIndex: index,
    });
  };

  /**
   * 退出全屏预览
   * @author ChenGuangLong
   * @since 2024/5/24 9:44
   */
  exitFullscreen = () => {
    this.setState({
      isFullscreen: false,
      zoom: 1, // 关闭时重置缩放
      offsetX: 0,
      offsetY: 0,
      lastOffsetX: 0,
      lastOffsetY: 0,
    });
  };

  /**
   * 切换到上一张图片
   * @author ChenGuangLong
   * @since 2024/5/24 10:04
   */
  prevImage = () => {
    this.setState((prevState, props) => ({
      currentIndex: (prevState.currentIndex - 1 + props.images.length) % props.images.length,
      zoom: 1, // 切换图片时重置缩放
      offsetX: 0,
      offsetY: 0,
      lastOffsetX: 0,
      lastOffsetY: 0,
    }));
  };

  /**
   * 切换到下一张图片
   * @author ChenGuangLong
   * @since 2024/5/24 10:24
   */
  nextImage = () => {
    this.setState((prevState, props) => ({
      currentIndex: (prevState.currentIndex + 1) % props.images.length,
      zoom: 1, // 切换图片时重置缩放
      offsetX: 0,
      offsetY: 0,
      lastOffsetX: 0,
      lastOffsetY: 0,
    }));
  };

  /**
   * 处理鼠标滚轮事件，用于放大和缩小图片
   * @param event 事件对象
   * @author ChenGuangLong
   * @since 2024/5/24 10:55
   */
  handleWheel = (event) => {
    if (event.deltaY < 0) {
      this.setState((prevState) => ({
        zoom: Math.min(prevState.zoom + 0.1, 3), // 放大，最大到3倍
      }));
    } else {
      this.setState((prevState) => ({
        zoom: Math.max(prevState.zoom - 0.1, 0.1), // 缩小，最小到1倍
      }));
    }
  };

  /**
   * 鼠标按下事件，用于开始拖动
   * @author ChenGuangLong
   * @since 2024/5/24 11:24
   */
  handleMouseDown = (event) => {
    event.preventDefault(); // 防止浏览器默认拖动行为
    this.setState({
      isDragging: true,
      startX: event.clientX,
      startY: event.clientY,
    });
  };

  /**
   * 鼠标移动事件，用于拖动图片
   * @param event 事件对象
   * @author ChenGuangLong
   * @since 2024/5/24 12:33
   */
  handleMouseMove = (event) => {
    const { isDragging, startX, startY, lastOffsetX, lastOffsetY } = this.state;
    if (isDragging) {
      this.setState({
        offsetX: lastOffsetX + (event.clientX - startX),
        offsetY: lastOffsetY + (event.clientY - startY),
      });
    }
  };

  /**
   * 鼠标松开事件，结束拖动
   * @author ChenGuangLong
   * @since 2024/5/24 13:02
   */
  handleMouseUp = () => {
    this.setState((prevState) => ({
      isDragging: false,
      lastOffsetX: prevState.offsetX,
      lastOffsetY: prevState.offsetY,
    }));
  };

  render () {
    const { isDragging, isFullscreen, currentIndex, zoom, offsetX, offsetY } = this.state;
    const { images, className, imgListStyle, listStyle = {}, imgCardStyle = {} } = this.props;

    return (
      <div>
        {/* ---------------------———————————图片列表———————————------------------- */}
        <div
          className={className}
          style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', ...listStyle }}
        >
          {images.map((src, index) => (
            <div key={src} style={{ margin: 5, ...imgCardStyle }}>
              <img
                src={src}
                loading="lazy"
                alt={`img-${index}`}
                onClick={() => this.showFullscreen(index)}
                style={{ width: '100%', cursor: 'pointer', ...imgListStyle ?? {} }}
              />
            </div>
          ))}
        </div>
        {/* ---------————————————————————图片预览————————————————————————------- */}
        {isFullscreen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden',
              zIndex: 1000,
            }}
            onWheel={this.handleWheel}
            onMouseDown={this.handleMouseDown}
            onMouseMove={this.handleMouseMove}
            onMouseUp={this.handleMouseUp}
            onMouseLeave={this.handleMouseUp} // 鼠标离开时也结束拖动
          >
            {/* 上一张按钮 */}
            <Button
              onClick={this.prevImage}
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 1001
              }}
            >
              &lt;
            </Button>

            <div
              style={{
                transform: `scale(${zoom}) translate(${offsetX}px, ${offsetY}px)`,
                transition: isDragging ? 'none' : 'transform 0.2s',
                cursor: isDragging ? 'grabbing' : 'grab',
                zIndex: 1000, // 确保图片在按钮下方
              }}
            >
              <img
                src={images[currentIndex]}
                alt={`img-${currentIndex}`}
                style={{ maxWidth: ' 100%', maxHeight: '100vh', width: 'auto', height: 'auto' }}
              />
            </div>

            {/* 下一张按钮 */}
            <Button
              onClick={this.nextImage}
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 1001
              }}
            >
              &gt;
            </Button>

            {/* 关闭按钮 */}
            <Button
              type="danger"
              onClick={this.exitFullscreen}
              style={{ position: 'absolute', top: 10, right: 10, zIndex: 1001 }}
            >
              X
            </Button>
          </div>
        )}
      </div>
    );
  }
}

export default MyImg;
