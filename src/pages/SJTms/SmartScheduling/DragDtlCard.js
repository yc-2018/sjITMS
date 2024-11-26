// //////////  智能调度明细卡片能拖拽的组件 //////////////////文件创建路径：D:\webCode\iwms-web\src\pages\SJTms\SmartScheduling\DragDtlCard.js  由`陈光龙`创建 时间：2024/11/25 上午11:42
import React, { useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';

const ItemType = 'CARD'; // 定义拖拽的类型
let beginIndex = 0;    // 为了判断拖动到最后是不是真实改变了还是还在原来的位置
let isChange = true;   // 为了判断拖动到最后是不是真实改变了还是还在原来的位置

const DragDtlCard = ({ children, index, moveCard, onDragEnd }) => {

  useEffect(() => {
    if (isChange) {
      beginIndex = index;
      isChange = false;
    }
  }, [index]);

  // 定义拖拽行为
  const [, dragRef] = useDrag({
    type: ItemType,
    item: { index }, // 传递当前项的索引
    end: (item, monitor) => {
      if (onDragEnd) onDragEnd(item.index !== beginIndex, item, monitor); // 调用拖动结束方法
      isChange = true;
    },
  });

  // 定义放置行为
  const [, dropRef] = useDrop({
    accept: ItemType,
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveCard(draggedItem.index, index); // 更新顺序
        draggedItem.index = index; // 更新拖拽项的索引
      }
    },
  });

  return (
    <div ref={(node) => dragRef(dropRef(node))}>
      {children}
    </div>
  );
};

export default DragDtlCard;
