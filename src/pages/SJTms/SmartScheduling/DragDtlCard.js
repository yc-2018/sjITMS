// //////////  智能调度明细卡片能拖拽的组件 //////////////////文件创建路径：D:\webCode\iwms-web\src\pages\SJTms\SmartScheduling\DragDtlCard.js  由`陈光龙`创建 时间：2024/11/25 上午11:42
import React from 'react';
import { useDrag, useDrop } from 'react-dnd';

const ItemType = 'IKUN'; // 定义拖拽的类型(就一个统一标识)
let currentIndex;               // 拖拽到指定位置的那个位置的索引

const DragDtlCard = ({ children, index, moveCard, onDragEnd }) => {

  // 定义拖拽行为
  const [, dragRef] = useDrag({
    type: ItemType,
    item: { index }, // 传递当前项的索引
    end: (item) => {
      if (onDragEnd) onDragEnd(item.index, currentIndex); // 调用拖动结束方法
    },
  });

  // 定义放置行为
  const [, dropRef] = useDrop({
    accept: ItemType,
    hover: (draggedItem) => {
      currentIndex = index;               // 这里index能改变，结束方法还是原来的所以记录一下很神奇
      moveCard(draggedItem.index, index);  // draggedItem.index=拖动的元素的索引，index=放置元素的索引
    },
  });

  /**
   * 鼠标移动到上下边缘时，自动滚动容器
   * @author ChenGuangLong
   * @since 2024/11/26 下午4:03
   */
  const handleMouseMove = (e) => {
    const container = dragRef.current.parentElement;
    if (container) {
      const { scrollTop, clientHeight } = container;
      const mouseY = e.clientY - container.getBoundingClientRect().top;
      if (mouseY < 100) {
        container.scrollTop = scrollTop - 10;
      } else if (mouseY > clientHeight - 100) {
        container.scrollTop = scrollTop + 10;
      }
    }
  };

  const handleDragStart = () => {
    window.addEventListener('mousemove', handleMouseMove);
  };

  const handleDragEnd = () => {
    window.removeEventListener('mousemove', handleMouseMove);
  };

  return (
    <div
      ref={(node) => {
        dragRef(dropRef(node));
        if (node) {
          node.addEventListener('dragstart', handleDragStart);
          node.addEventListener('dragend', handleDragEnd);
        }
      }}
    >
      {children}
    </div>
  );
};

export default DragDtlCard;
