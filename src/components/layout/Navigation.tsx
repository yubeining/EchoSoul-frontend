import React, { useState, useRef, useEffect } from 'react';
import '../../styles/components/Navigation.css';
import Avatar from '../common/Avatar';
import { useAuth } from '../../contexts/AuthContext';
import { translations, TranslationKeys } from '../../data/translations';

interface NavigationProps {
  currentPage: string;
  language: string;
  onNavigate: (page: string) => void;
  onLanguageChange: (language: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ 
  currentPage, 
  language, 
  onNavigate, 
  onLanguageChange 
}) => {
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, logout } = useAuth();

  const handleLanguageChange = (newLanguage: string) => {
    onLanguageChange(newLanguage);
    setShowLanguageMenu(false);
  };

  const handleLogin = () => {
    onNavigate('login');
  };

  const handleLogout = async () => {
    await logout();
    onNavigate('home');
  };

  const handleMyProfile = () => {
    onNavigate('dashboard');
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setShowLanguageMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 点击导航链接时关闭移动菜单
  const handleNavClick = (page: string) => {
    onNavigate(page);
    setShowMobileMenu(false);
  };

  // 获取当前语言的翻译
  const t = (key: TranslationKeys): string => translations[language][key] || key;

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <div className="ai-logo">AI</div>
          <div className="logo-text">EchoSoul AI Platform</div>
        </div>
        
        <div className="nav-right">
          {/* 桌面端导航链接 */}
          <button 
            className={`nav-link desktop-nav ${currentPage === 'home' ? 'active' : ''}`} 
            onClick={() => onNavigate('home')}
          >
            {t('home')}
          </button>
          <button 
            className={`nav-link desktop-nav ${currentPage === 'docs' ? 'active' : ''}`} 
            onClick={() => onNavigate('docs')}
          >
            {t('docs')}
          </button>
          <div className="language-selector" ref={languageMenuRef} onClick={() => setShowLanguageMenu(!showLanguageMenu)}>
            <span className="globe-icon">🌐</span>
            <span className="lang-text">
              {language === 'zh' ? '中文' : language === 'en' ? 'EN' : '日本語'}
            </span>
            <span className="chevron">▼</span>
            
            {showLanguageMenu && (
              <div className="language-menu">
                <div 
                  className={`language-option ${language === 'zh' ? 'active' : ''}`}
                  onClick={() => handleLanguageChange('zh')}
                >
                  中文
                </div>
                <div 
                  className={`language-option ${language === 'en' ? 'active' : ''}`}
                  onClick={() => handleLanguageChange('en')}
                >
                  English
                </div>
                <div 
                  className={`language-option ${language === 'ja' ? 'active' : ''}`}
                  onClick={() => handleLanguageChange('ja')}
                >
                  日本語
                </div>
              </div>
            )}
          </div>
          <button className="github-btn" onClick={() => window.open('https://github.com/yubeining/EchoSoul-frontend', '_blank')}>
            <svg className="github-icon" viewBox="0 0 24 24" fill="#333">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span>GitHub</span>
          </button>
          
          {/* 用户头像 */}
          <Avatar 
            size="medium"
            src={user?.avatar || undefined}
            username={user?.username || '用户名'}
            nickname={user?.nickname}
            uid={user?.uid}
            isAuthenticated={isAuthenticated}
            onLogin={handleLogin}
            onLogout={handleLogout}
            onMyProfile={handleMyProfile}
            className="nav-avatar"
          />
          
          {/* 移动端汉堡菜单按钮 */}
          <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
            <span className={`hamburger ${showMobileMenu ? 'active' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </div>
      
      {/* 移动端菜单 */}
      {showMobileMenu && (
        <div className="mobile-menu">
          <div className="mobile-menu-content">
            <button 
              className={`mobile-nav-link ${currentPage === 'home' ? 'active' : ''}`} 
              onClick={() => handleNavClick('home')}
            >
              {t('home')}
            </button>
            <button 
              className={`mobile-nav-link ${currentPage === 'docs' ? 'active' : ''}`} 
              onClick={() => handleNavClick('docs')}
            >
              {t('docs')}
            </button>
            <button 
              className="mobile-nav-link"
              onClick={() => window.open('https://github.com/yubeining/EchoSoul-frontend', '_blank')}
            >
              GitHub
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
