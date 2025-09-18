// 密码强度计算工具

export interface PasswordStrength {
  score: number; // 0-3
  label: string;
  color: string;
}

// 密码强度标签
const strengthLabels = {
  zh: ['弱', '中', '强'],
  en: ['Weak', 'Medium', 'Strong'],
  ja: ['弱い', '中程度', '強い']
};

// 密码强度颜色
const strengthColors = ['#ff4757', '#ffa502', '#2ed573'];

/**
 * 计算密码强度
 * @param password 密码
 * @returns 强度分数 (0-3)
 */
export const calculatePasswordStrength = (password: string): number => {
  let strength = 0;
  
  if (password.length >= 6) strength += 1;
  if (/[a-z]/.test(password)) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;
  
  return Math.min(strength, 3);
};

/**
 * 获取密码强度信息
 * @param password 密码
 * @param language 语言
 * @returns 密码强度信息
 */
export const getPasswordStrength = (password: string, language: 'zh' | 'en' | 'ja' = 'zh'): PasswordStrength => {
  const score = calculatePasswordStrength(password);
  const labelIndex = Math.max(0, score - 1);
  
  return {
    score,
    label: strengthLabels[language][labelIndex] || '',
    color: strengthColors[labelIndex] || '#e5e7eb'
  };
};

/**
 * 验证密码强度
 * @param password 密码
 * @param minStrength 最小强度要求
 * @returns 是否满足强度要求
 */
export const validatePasswordStrength = (password: string, minStrength: number = 2): boolean => {
  return calculatePasswordStrength(password) >= minStrength;
};

