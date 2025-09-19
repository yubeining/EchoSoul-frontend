import React, { useState } from 'react';
import '../../styles/components/ChangePasswordModal.css';
import { authApi } from '../../services/api';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 清除错误信息
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    if (!formData.oldPassword) {
      setError('请输入原密码');
      return false;
    }
    if (!formData.newPassword) {
      setError('请输入新密码');
      return false;
    }
    if (formData.newPassword.length < 6 || formData.newPassword.length > 20) {
      setError('新密码长度必须在6-20位之间');
      return false;
    }
    if (formData.newPassword === formData.oldPassword) {
      setError('新密码不能与原密码相同');
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('两次输入的新密码不一致');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');


    try {
      const response = await authApi.changePassword(formData);
      
      if (response.code === 1) {
        setSuccess('密码修改成功！');
        // 清空表单
        setFormData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        // 延迟关闭弹窗
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1500);
      } else {
        setError(response.msg || '密码修改失败');
      }
    } catch (error: any) {
      console.error('修改密码失败:', error);
      console.error('错误详情:', {
        message: error.message,
        response: error.response,
        stack: error.stack
      });
      
      if (error.response?.data?.msg) {
        setError(error.response.data.msg);
      } else if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('网络请求失败，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setError('');
    setSuccess('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">修改密码</h2>
          <button className="modal-close" onClick={handleCancel}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="oldPassword" className="form-label">
              原密码
            </label>
            <input
              type="password"
              id="oldPassword"
              name="oldPassword"
              className="form-input"
              value={formData.oldPassword}
              onChange={handleInputChange}
              placeholder="请输入原密码"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword" className="form-label">
              新密码
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              className="form-input"
              value={formData.newPassword}
              onChange={handleInputChange}
              placeholder="请输入新密码（6-20位）"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              确认新密码
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="form-input"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="请再次输入新密码"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="form-message error">
              <svg className="message-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              {error}
            </div>
          )}

          {success && (
            <div className="form-message success">
              <svg className="message-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
              {success}
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={handleCancel}
              disabled={loading}
            >
              取消
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? '修改中...' : '确定'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
