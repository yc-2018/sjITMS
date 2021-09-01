import React from 'react';
import { Avatar, List,Tooltip } from 'antd';
import classNames from 'classnames';
import styles from './NoticeList.less';
import { formatMessage } from 'umi/locale';
import configs from '@/utils/config';
import { isBlank } from '@/utils/utils';

export default function NoticeList({
  data = [],
  onClick,
  onClear,
  onAll,
  title,
  locale,
  emptyText,
  emptyImage,
  showClear = true,
}) {
  if (data.length === 0) {
    return (
      <div className={styles.notFound}>
        {emptyImage ? <img src={emptyImage} alt="not found" /> : null}
        <div>{emptyText || locale.emptyText}</div>
      </div>
    );
  }
  return (
    <div>
      <List className={styles.list}>
        {data.map((item, i) => {
          const itemCls = classNames(styles.item, {
            [styles.read]: item.read,
          });
          // eslint-disable-next-line no-nested-ternary
          const leftIcon = <Avatar size={20} className={styles.avatar} 
                                   src={!isBlank(item.avatar)?item.avatar:configs[API_ENV]['avatar.default.url']} />
          let tooltipContent= item.title;
          if(item.title&&item.title.length>=15){
            tooltipContent= item.title.substr(0,15)+'...';
          }
          return (
            <List.Item className={itemCls} key={item.key || i} onClick={() => onClick(item)}>
            {
              item.title ? (
                <List.Item.Meta
                  className={styles.meta}
                  avatar={<span className={styles.iconElement}>{leftIcon}</span>}
                  title={
                    <div className={styles.title} >
                      <Tooltip placement="topLeft" title={item.title}>
                          <span>
                              {tooltipContent}
                          </span>
                      </Tooltip>
                    </div>
                  }
                  description={
                    <div>
                      <div className={styles.description} >
                        {item.publisher.name}   {formatMessage({ id: 'notice.published' })} {item.publishTime}
                      </div>
                    </div>
                  }
                />
              ) :(
                <List.Item.Meta
                  className={styles.meta}
                  avatar={<span className={styles.iconElement}>{leftIcon}</span>}
                  title={
                    <div className={styles.title}>
                      {item.replyer.name}{formatMessage({ id: 'notice.responsed' })}
                    </div>
                  }
                  description={
                    <div>
                      <div className={styles.description} >
                      {item.replyTime}
                      </div>
                    </div>
                  }
                />
              )
            }

            </List.Item>
          );
        })}
      </List>
      {showClear ? (
        title==='Notification' ||title==='通知' ?(
          <div className={styles.clear}>
           <a style={{fontWeight: 700,fontStyle: 'normal',color: '#999999',textAlign: 'left' }} 
              onClick={onAll}>{formatMessage({ id: 'notice.viewAll' })}</a>        
           <a style={{ fontWeight: 700,fontStyle: 'normal',color: '#999999',marginLeft: 100 }} 
              onClick={onClear}>{locale.clear} {title}</a>
         </div>
          ):(
            <div className={styles.clear}>
              <a style={{ fontWeight: 700,fontStyle: 'normal',color: '#999999'}} 
                 onClick={onClear}>{locale.clear} {title}</a>
            </div>
          )
      ) : null}
    </div>
  );
}
