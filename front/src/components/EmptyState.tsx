import React from 'react';
import { Typography } from 'antd';

interface EmptyStateProps {
  message?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message = '暂无数据' }) => {
  return (
    <div className="py-16 flex flex-col items-center justify-center">
      <div className="mb-3">
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 20V45C50 47.7614 47.7614 50 45 50H15C12.2386 50 10 47.7614 10 45V15C10 12.2386 12.2386 10 15 10H40" stroke="#D9D9D9" strokeWidth="2" />
          <path d="M30 30H30.01" stroke="#D9D9D9" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <Typography.Text type="secondary">{message}</Typography.Text>
    </div>
  );
};

export default EmptyState; 