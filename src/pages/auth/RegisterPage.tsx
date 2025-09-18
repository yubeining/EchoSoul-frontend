import React, { useState } from 'react';
import '../../styles/pages/RegisterPage.css';
import Navigation from '../../components/layout/Navigation';
import { useTranslation } from '../../contexts/TranslationContext';
import { getPasswordStrength } from '../../utils/passwordUtils';

interface RegisterPageProps {
  onNavigate: (page: string) => void;
  language: string;
  onLanguageChange: (language: string) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ 
  onNavigate, 
  language, 
  onLanguageChange 
}) => {
  const [formData, setFormData] = useState({
    mobileOrEmail: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      alert('请先同意用户服务协议和隐私政策');
      return;
    }
    console.log('注册数据:', formData);
  };


  const handleLogin = () => {
    onNavigate('login');
  };

  const handleAgreementClick = (type: 'terms' | 'privacy') => {
    console.log(`打开${type === 'terms' ? '用户服务协议' : '隐私政策'}`);
  };

  const { t } = useTranslation();
  const passwordStrengthInfo = getPasswordStrength(formData.password, language as 'zh' | 'en' | 'ja');


  return (
    <div className="register-page">
      {/* Navigation - 复用组件 */}
      <Navigation 
        currentPage="register"
        language={language}
        onNavigate={onNavigate}
        onLanguageChange={onLanguageChange}
      />
      
      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <div className="register-logo">
              <div className="logo-icon">Z</div>
            </div>
            <h1 className="register-title">{t('title')}</h1>
            <p className="register-subtitle">{t('subtitle')}</p>
          </div>
          
          <form className="register-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <div className="input-wrapper">
                <input
                  type="text"
                  name="mobileOrEmail"
                  value={formData.mobileOrEmail}
                  onChange={handleInputChange}
                  placeholder={t('mobileOrEmail')}
                  className="register-input"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={t('password')}
                  className="register-input"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              
              {formData.password && (
                <div className="password-strength">
                  <div className="strength-label">{t('passwordStrength')}</div>
                  <div className="strength-bar">
                    <div 
                      className={`strength-segment ${passwordStrengthInfo.score >= 1 ? 'active' : ''}`}
                      style={{ backgroundColor: passwordStrengthInfo.score >= 1 ? '#ff4757' : '#e5e7eb' }}
                    ></div>
                    <div 
                      className={`strength-segment ${passwordStrengthInfo.score >= 2 ? 'active' : ''}`}
                      style={{ backgroundColor: passwordStrengthInfo.score >= 2 ? '#ffa502' : '#e5e7eb' }}
                    ></div>
                    <div 
                      className={`strength-segment ${passwordStrengthInfo.score >= 3 ? 'active' : ''}`}
                      style={{ backgroundColor: passwordStrengthInfo.score >= 3 ? '#2ed573' : '#e5e7eb' }}
                    ></div>
                  </div>
                  <div className="strength-text">
                    {passwordStrengthInfo.label}
                  </div>
                </div>
              )}
            </div>

            <div className="input-group">
              <div className="input-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder={t('confirmPassword')}
                  className="register-input"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div className="agreement-section">
              <label className="agreement-checkbox">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                />
                <span className="agreement-text">
                  {t('agreement')}
                  <button
                    type="button"
                    className="agreement-link"
                    onClick={() => handleAgreementClick('terms')}
                  >
                    {t('termsOfService')}
                  </button>
                  {t('and')}
                  <button
                    type="button"
                    className="agreement-link"
                    onClick={() => handleAgreementClick('privacy')}
                  >
                    {t('privacyPolicy')}
                  </button>
                </span>
              </label>
            </div>

            <button 
              type="submit" 
              className="register-button"
              disabled={!agreedToTerms}
            >
              {t('register')}
            </button>
          </form>

          <div className="login-link">
            <span className="login-text">{t('hasAccount')}</span>
            <button
              className="login-button"
              onClick={handleLogin}
            >
              {t('loginNow')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
