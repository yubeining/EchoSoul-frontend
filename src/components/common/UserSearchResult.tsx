import React from 'react';
import { UserSearchResult as UserSearchResultType } from '../../hooks/useUserSearch';
import '../../styles/components/UserSearchResult.css';

interface UserSearchResultProps {
  user: UserSearchResultType;
  onStartChat?: (user: UserSearchResultType) => void;
}

const UserSearchResult: React.FC<UserSearchResultProps> = ({
  user,
  onStartChat
}) => {
  const handleStartChat = () => {
    onStartChat?.(user);
  };

  return (
    <div className="user-search-result">
      <div className="user-info">
        <div className="user-avatar">
          {user.avatar ? (
            <img src={user.avatar} alt={user.nickname} />
          ) : (
            <div className="avatar-placeholder">
              {user.nickname?.charAt(0) || '👤'}
            </div>
          )}
        </div>
        
        <div className="user-details">
          <div className="user-name">
            <span className="nickname">{user.nickname}</span>
            <span className="username">@{user.username}</span>
          </div>
          <div className="user-meta">
            <span className="uid">UID: {user.uid}</span>
            {user.intro && (
              <span className="intro">{user.intro}</span>
            )}
          </div>
          <div className="user-contact">
            {user.email && (
              <span className="email">📧 {user.email}</span>
            )}
            {user.mobile && (
              <span className="mobile">📱 {user.mobile}</span>
            )}
          </div>
          {user.lastActive && (
            <div className="last-active">
              ⏰ 最后活跃: {new Date(user.lastActive).toLocaleString()}
            </div>
          )}
        </div>
      </div>
      
      <div className="user-actions">
        <button 
          className="action-btn primary"
          onClick={handleStartChat}
          title="发起聊天"
        >
          💬 聊天
        </button>
      </div>
    </div>
  );
};

export default UserSearchResult;


