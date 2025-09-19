import React, { useState, useRef, useEffect } from 'react';
import '../../styles/components/Avatar.css';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  username?: string;
  nickname?: string;
  uid?: string;
  isAuthenticated?: boolean;
  onLogin?: () => void;
  onLogout?: () => void;
  onMyProfile?: () => void;
}

const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  alt = '用户头像', 
  size = 'medium',
  className = '',
  username = '用户名',
  nickname,
  uid,
  isAuthenticated = false,
  onLogin,
  onLogout,
  onMyProfile
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sizeClass = `avatar-${size}`;

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAvatarClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogin = () => {
    setShowDropdown(false);
    onLogin?.();
  };

  const handleLogout = () => {
    setShowDropdown(false);
    onLogout?.();
  };

  const handleMyProfile = () => {
    setShowDropdown(false);
    onMyProfile?.();
  };
  
  return (
    <div className={`avatar-container ${className}`} ref={dropdownRef}>
      <div 
        className={`avatar ${sizeClass}`}
        onClick={handleAvatarClick}
      >
        {src ? (
          <img src={src} alt={alt} className="avatar-image" />
        ) : (
          <div className="avatar-placeholder">
            <svg 
              className="avatar-icon" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
        )}
      </div>
      
      {showDropdown && (
        <div className="avatar-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">
                      {src ? (
                        <img src={src} alt={alt} className="dropdown-avatar-image" />
                      ) : (
                        <div className="dropdown-avatar-placeholder">
                          <svg 
                            className="dropdown-avatar-icon" 
                            viewBox="0 0 24 24" 
                            fill="currentColor"
                          >
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="dropdown-user-info">
                      {uid ? (
                        <div className="dropdown-nickname">uid:{uid}</div>
                      ) : nickname ? (
                        <div className="dropdown-nickname">{nickname}</div>
                      ) : null}
                      <div className="dropdown-username">{username}</div>
                    </div>
                  </div>
          
                  <div className="dropdown-actions">
                    {isAuthenticated ? (
                      <>
                        <button className="dropdown-btn profile-btn" onClick={handleMyProfile}>
                          我的
                        </button>
                        <button className="dropdown-btn logout-btn" onClick={handleLogout}>
                          登出
                        </button>
                      </>
                    ) : (
                      <button className="dropdown-btn login-btn" onClick={handleLogin}>
                        登录
                      </button>
                    )}
                  </div>
        </div>
      )}
    </div>
  );
};

export default Avatar;
