import React, { useState } from 'react';
import '../../styles/pages/LoginPage.css';
import Navigation from '../../components/layout/Navigation';

interface LoginPageProps {
  onNavigate: (page: string) => void;
  language: string;
  onLanguageChange: (language: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ 
  onNavigate, 
  language, 
  onLanguageChange 
}) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 这里可以添加登录逻辑
    console.log('登录数据:', formData);
    onNavigate('dashboard');
  };


  const handleRegister = () => {
    onNavigate('register');
  };

  const handleThirdPartyLogin = (platform: string) => {
    console.log(`${platform} 登录`);
  };

  const handleGuestLogin = () => {
    onNavigate('dashboard');
  };

  // 翻译文本
  const translations = {
    zh: {
      title: '用户登录',
      username: '用户名/邮箱',
      password: '密码',
      login: '登录',
      guestLogin: '游客登录',
      noAccount: '还没有账号?',
      register: '立即注册'
    },
    en: {
      title: 'User Login',
      username: 'Username/Email',
      password: 'Password',
      login: 'Login',
      guestLogin: 'Guest Login',
      noAccount: "Don't have an account?",
      register: 'Register Now'
    },
    ja: {
      title: 'ユーザーログイン',
      username: 'ユーザー名/メール',
      password: 'パスワード',
      login: 'ログイン',
      guestLogin: 'ゲストログイン',
      noAccount: 'アカウントをお持ちでない方は?',
      register: '今すぐ登録'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.zh;

  return (
    <div className="login-page">
      {/* Navigation - 复用组件 */}
      <Navigation 
        currentPage="login"
        language={language}
        onNavigate={onNavigate}
        onLanguageChange={onLanguageChange}
      />
      
      <div className="login-container">
        <div className="login-card">
          <h1 className="login-title">{t.title}</h1>
          
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <div className="input-wrapper">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder={t.username}
                  className="login-input"
                  required
                />
                <div className="input-icon user-icon">👤</div>
              </div>
            </div>

            <div className="input-group">
              <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={t.password}
                  className="login-input"
                  required
                />
                <div className="input-icon password-icon">🔒</div>
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>


            <button type="submit" className="login-button">
              {t.login}
            </button>
          </form>

          <div className="guest-login-section">
            <button 
              type="button" 
              className="guest-login-button"
              onClick={handleGuestLogin}
            >
              {t.guestLogin}
            </button>
          </div>

          <div className="third-party-login">
            <div className="third-party-title">其他登录方式</div>
            <div className="third-party-buttons">
              <button
                className="third-party-btn wechat"
                onClick={() => handleThirdPartyLogin('微信')}
              >
                <span className="third-party-icon">💬</span>
              </button>
              <button
                className="third-party-btn qq"
                onClick={() => handleThirdPartyLogin('QQ')}
              >
                <span className="third-party-icon">🐧</span>
              </button>
              <button
                className="third-party-btn weibo"
                onClick={() => handleThirdPartyLogin('微博')}
              >
                <span className="third-party-icon">🎯</span>
              </button>
            </div>
          </div>

          <div className="register-link">
            <span className="register-text">{t.noAccount}</span>
            <button
              className="register-button"
              onClick={handleRegister}
            >
              {t.register}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
