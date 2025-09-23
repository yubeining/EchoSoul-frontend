import React, { useState, useEffect } from 'react';
import '../../styles/pages/DocsPage.css';
import Navigation from '../../components/layout/Navigation';

// 中文原文内容 - 只需要维护中文版本，其他语言自动翻译
const chineseContent = {
  home: "首页",
  docs: "文档",
  tutorial: "教程",
  login: "登录",
  language: "语言",
  share: "分享",
  copyLink: "复制链接",
  shareToWechat: "分享到微信",
  shareToWeibo: "分享到微博",
  onThisPage: "本页目录",
  docCenter: "文档中心",
  installGuide: "安装指南",
  userManual: "使用手册",
  techArchitecture: "技术架构",
  roadmap: "发展路线",
  overview: "概述",
  envRequirements: "环境要求",
  deploySteps: "部署步骤",
  verification: "验证方法",
  quickStart: "快速开始",
  interfaceIntro: "界面介绍",
  features: "功能模块",
  faq: "常见问题",
  systemArch: "系统架构图",
  coreComponents: "核心组件",
  techStack: "技术栈",
  systemOverview: "系统概述",
  coreFeatures: "核心功能",
  techAdvantages: "技术优势"
};

interface DocsPageProps {
  onNavigate: (page: string) => void;
  language: string;
  onLanguageChange: (language: string) => void;
}

const DocsPage: React.FC<DocsPageProps> = ({ onNavigate, language, onLanguageChange }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['installGuide', 'userManual']));
  const [activeSection, setActiveSection] = useState('overview');
  const [activeAnchor, setActiveAnchor] = useState('systemOverview');


  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
  };

  const handleAnchorClick = (anchorId: string) => {
    setActiveAnchor(anchorId);
    const element = document.getElementById(anchorId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };


  // 滚动监听，更新锚点高亮
  useEffect(() => {
    const handleScroll = () => {
      const anchors = ['systemOverview', 'coreFeatures', 'techAdvantages'];
      for (const anchor of anchors) {
        const element = document.getElementById(anchor);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveAnchor(anchor);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 简单的翻译函数 - 直接返回中文内容
  const t = (key: keyof typeof chineseContent): string => {
    return chineseContent[key];
  };

  // 简单的文本翻译函数
  const translateText = (text: string): string => {
    // 直接返回原文，如果需要翻译可以集成第三方服务
    return text;
  };

  const docSections = [
    {
      id: 'installGuide',
      title: t('installGuide'),
      items: [
        { id: 'overview', title: t('overview') },
        { id: 'envRequirements', title: t('envRequirements') },
        { id: 'deploySteps', title: t('deploySteps') },
        { id: 'verification', title: t('verification') }
      ]
    },
    {
      id: 'userManual',
      title: t('userManual'),
      items: [
        { id: 'quickStart', title: t('quickStart') },
        { id: 'interfaceIntro', title: t('interfaceIntro') },
        { id: 'features', title: t('features') },
        { id: 'faq', title: t('faq') }
      ]
    },
    {
      id: 'techArchitecture',
      title: t('techArchitecture'),
      items: [
        { id: 'systemArch', title: t('systemArch') },
        { id: 'coreComponents', title: t('coreComponents') },
        { id: 'techStack', title: t('techStack') }
      ]
    },
    {
      id: 'roadmap',
      title: t('roadmap'),
      items: []
    }
  ];

  const anchors = [
    { id: 'systemOverview', title: t('systemOverview') },
    { id: 'coreFeatures', title: t('coreFeatures') },
    { id: 'techAdvantages', title: t('techAdvantages') }
  ];

  return (
    <div className="docs-page">
      {/* Navigation - 复用组件 */}
      <Navigation 
        currentPage="docs"
        language={language}
        onNavigate={onNavigate}
        onLanguageChange={onLanguageChange}
      />


      <div className="docs-content">
        {/* 左侧文档导航 */}
        <div className="docs-sidebar">
          <h3 className="sidebar-title">{t('docCenter')}</h3>
          <div className="sidebar-nav">
            {docSections.map(section => (
              <div key={section.id} className="nav-section">
                <div 
                  className={`section-header ${expandedSections.has(section.id) ? 'expanded' : ''}`}
                  onClick={() => toggleSection(section.id)}
                >
                  <span className="section-title">{section.title}</span>
                  <span className="expand-icon">
                    {expandedSections.has(section.id) ? '▼' : '▶'}
                  </span>
                </div>
                {expandedSections.has(section.id) && section.items.length > 0 && (
                  <div className="section-items">
                    {section.items.map(item => (
                      <div 
                        key={item.id}
                        className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                        onClick={() => handleSectionClick(item.id)}
                      >
                        {item.title}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 中间文档内容 */}
        <div className="docs-main">
          <div className="docs-content-area">
            <h1 className="docs-title">EchoSoul AI Platform {t('docCenter')}</h1>
            
            <section id="systemOverview" className="content-section">
              <h2 className="section-title">{t('systemOverview')}</h2>
              <p className="section-content">
                {translateText('EchoSoul AI Platform 是一个基于React + TypeScript构建的现代化智能聊天平台，专注于提供AI人格化交互体验。平台集成了实时通信、用户管理、AI角色创建等核心功能，为用户打造个性化的智能对话环境。')}
              </p>
              <p className="section-content">
                {translateText('系统采用前后端分离架构，前端使用React 18和TypeScript确保类型安全，后端提供RESTful API和WebSocket实时通信支持。平台支持多语言界面（中文、英文、日文），具备完整的用户认证系统和响应式设计，适配各种设备尺寸。')}
              </p>
              <p className="section-content">
                {translateText('核心功能包括：智能聊天系统、AI角色创建与管理、用户社交网络、实时消息传递、会话历史管理、Live2D角色展示等，为用户提供丰富的交互体验。')}
              </p>
            </section>

            <section id="coreFeatures" className="content-section">
              <h2 className="section-title">{t('coreFeatures')}</h2>
              <div className="feature-list">
                <div className="feature-item">
                  <h3>{translateText('智能聊天系统')}</h3>
                  <p>{translateText('支持实时消息传递和会话管理，基于WebSocket技术实现低延迟的即时通信。提供完整的聊天历史记录、消息状态管理和会话持久化功能。')}</p>
                </div>
                <div className="feature-item">
                  <h3>{translateText('AI角色创建与管理')}</h3>
                  <p>{translateText('用户可以创建个性化的AI角色，包括角色名称、昵称、头像、性格描述、背景故事等。支持公开和私有角色设置，提供AI角色库供用户浏览和收藏。')}</p>
                </div>
                <div className="feature-item">
                  <h3>{translateText('用户社交网络')}</h3>
                  <p>{translateText('完整的用户认证系统，支持用户注册、登录、个人资料管理。提供用户搜索功能，支持用户间的社交互动和好友关系管理。')}</p>
                </div>
                <div className="feature-item">
                  <h3>{translateText('多语言支持')}</h3>
                  <p>{translateText('支持中文、英文、日文三种语言界面，提供完整的国际化解决方案。用户可以根据需要切换界面语言，获得本地化的使用体验。')}</p>
                </div>
                <div className="feature-item">
                  <h3>{translateText('响应式设计')}</h3>
                  <p>{translateText('采用现代化的响应式设计，完美适配桌面端、平板和移动设备。提供移动端优化的导航菜单和交互体验。')}</p>
                </div>
                <div className="feature-item">
                  <h3>{translateText('Live2D角色展示')}</h3>
                  <p>{translateText('集成Live2D技术，支持动态角色展示和交互。为用户提供更加生动和沉浸式的AI角色交互体验。')}</p>
                </div>
              </div>
            </section>

            <section id="techAdvantages" className="content-section">
              <h2 className="section-title">{t('techAdvantages')}</h2>
              <div className="advantages-grid">
                <div className="advantage-card">
                  <div className="advantage-icon">⚡</div>
                  <h3>{translateText('现代化技术栈')}</h3>
                  <p>{translateText('基于React 18 + TypeScript构建，提供完整的类型安全保障。使用Context API进行状态管理，Custom Hooks实现逻辑复用，确保代码质量和可维护性。')}</p>
                </div>
                <div className="advantage-card">
                  <div className="advantage-icon">🌐</div>
                  <h3>{translateText('实时通信')}</h3>
                  <p>{translateText('集成WebSocket技术，实现低延迟的实时消息传递。支持消息状态管理、会话持久化和断线重连机制，确保通信的可靠性。')}</p>
                </div>
                <div className="advantage-card">
                  <div className="advantage-icon">📱</div>
                  <h3>{translateText('响应式设计')}</h3>
                  <p>{translateText('采用CSS3和现代布局技术，完美适配各种设备尺寸。提供移动端优化的汉堡菜单和触摸友好的交互体验。')}</p>
                </div>
                <div className="advantage-card">
                  <div className="advantage-icon">🔧</div>
                  <h3>{translateText('模块化架构')}</h3>
                  <p>{translateText('前后端分离架构，RESTful API设计。组件化开发模式，支持功能模块的独立开发和部署，便于维护和扩展。')}</p>
                </div>
                <div className="advantage-card">
                  <div className="advantage-icon">🌍</div>
                  <h3>{translateText('国际化支持')}</h3>
                  <p>{translateText('完整的i18n解决方案，支持中文、英文、日文三种语言。提供语言切换功能和本地化的用户界面。')}</p>
                </div>
                <div className="advantage-card">
                  <div className="advantage-icon">🎨</div>
                  <h3>{translateText('优雅的用户体验')}</h3>
                  <p>{translateText('现代化的UI设计，流畅的动画效果和交互反馈。提供直观的操作界面和友好的错误处理机制。')}</p>
                </div>
              </div>
            </section>

            {/* 安装指南内容 */}
            {activeSection === 'overview' && (
              <section className="content-section">
                <h2 className="section-title">{t('overview')}</h2>
                <p className="section-content">
                  {translateText('EchoSoul AI Platform 是一个现代化的智能聊天平台，提供完整的AI角色创建、用户管理和实时通信功能。')}
                </p>
                <p className="section-content">
                  {translateText('平台采用前后端分离架构，前端基于React 18 + TypeScript构建，后端提供RESTful API和WebSocket实时通信支持。')}
                </p>
              </section>
            )}

            {activeSection === 'envRequirements' && (
              <section className="content-section">
                <h2 className="section-title">{t('envRequirements')}</h2>
                <div className="section-content">
                  <h3>{translateText('前端环境要求')}</h3>
                  <ul>
                    <li>{translateText('Node.js 16.0 或更高版本')}</li>
                    <li>{translateText('npm 8.0 或更高版本')}</li>
                    <li>{translateText('现代浏览器支持（Chrome 90+, Firefox 88+, Safari 14+）')}</li>
                  </ul>
                  
                  <h3>{translateText('开发工具')}</h3>
                  <ul>
                    <li>{translateText('Visual Studio Code（推荐）')}</li>
                    <li>{translateText('TypeScript 4.9+')}</li>
                    <li>{translateText('React Developer Tools')}</li>
                  </ul>
                </div>
              </section>
            )}

            {activeSection === 'deploySteps' && (
              <section className="content-section">
                <h2 className="section-title">{t('deploySteps')}</h2>
                <div className="section-content">
                  <h3>{translateText('1. 克隆项目')}</h3>
                  <pre className="code-block">
{`git clone https://github.com/yubeining/EchoSoul-frontend.git
cd EchoSoul-frontend`}
                  </pre>
                  
                  <h3>{translateText('2. 安装依赖')}</h3>
                  <pre className="code-block">
{`npm install`}
                  </pre>
                  
                  <h3>{translateText('3. 启动开发服务器')}</h3>
                  <pre className="code-block">
{`# 推荐：稳定启动
npm run start:stable

# 开发环境
npm run start:dev`}
                  </pre>
                  
                  <h3>{translateText('4. 构建生产版本')}</h3>
                  <pre className="code-block">
{`npm run build`}
                  </pre>
                </div>
              </section>
            )}

            {activeSection === 'verification' && (
              <section className="content-section">
                <h2 className="section-title">{t('verification')}</h2>
                <div className="section-content">
                  <h3>{translateText('验证安装')}</h3>
                  <p>{translateText('启动成功后，访问 http://localhost:3000 查看应用界面。')}</p>
                  
                  <h3>{translateText('功能测试')}</h3>
                  <ul>
                    <li>{translateText('用户注册和登录功能')}</li>
                    <li>{translateText('AI角色创建功能')}</li>
                    <li>{translateText('实时聊天功能')}</li>
                    <li>{translateText('多语言切换功能')}</li>
                    <li>{translateText('响应式设计测试')}</li>
                  </ul>
                </div>
              </section>
            )}

            {/* 使用手册内容 */}
            {activeSection === 'quickStart' && (
              <section className="content-section">
                <h2 className="section-title">{t('quickStart')}</h2>
                <div className="section-content">
                  <h3>{translateText('1. 用户注册')}</h3>
                  <p>{translateText('点击导航栏右上角的用户头像，选择"登录"进入登录页面，然后点击"注册"创建新账户。')}</p>
                  
                  <h3>{translateText('2. 创建AI角色')}</h3>
                  <p>{translateText('登录后进入仪表板，点击"创建AI角色"开始创建你的个性化AI角色。')}</p>
                  
                  <h3>{translateText('3. 开始聊天')}</h3>
                  <p>{translateText('在AI角色库中选择角色，或与其他用户开始对话，体验实时聊天功能。')}</p>
                </div>
              </section>
            )}

            {activeSection === 'interfaceIntro' && (
              <section className="content-section">
                <h2 className="section-title">{t('interfaceIntro')}</h2>
                <div className="section-content">
                  <h3>{translateText('主要界面')}</h3>
                  <ul>
                    <li><strong>{translateText('首页')}</strong>：{translateText('展示平台介绍和核心功能')}</li>
                    <li><strong>{translateText('仪表板')}</strong>：{translateText('用户管理中心，包含个人资料、消息、AI角色等功能')}</li>
                    <li><strong>{translateText('聊天页面')}</strong>：{translateText('实时聊天界面，支持与AI角色和用户对话')}</li>
                    <li><strong>{translateText('文档中心')}</strong>：{translateText('平台使用说明和技术文档')}</li>
                  </ul>
                  
                  <h3>{translateText('导航功能')}</h3>
                  <ul>
                    <li>{translateText('语言切换：支持中文、英文、日文')}</li>
                    <li>{translateText('GitHub链接：查看项目源码')}</li>
                    <li>{translateText('用户头像：登录、个人资料、退出')}</li>
                  </ul>
                </div>
              </section>
            )}

            {activeSection === 'features' && (
              <section className="content-section">
                <h2 className="section-title">{t('features')}</h2>
                <div className="section-content">
                  <h3>{translateText('用户管理')}</h3>
                  <ul>
                    <li>{translateText('用户注册、登录、个人资料管理')}</li>
                    <li>{translateText('密码修改、头像上传')}</li>
                    <li>{translateText('用户搜索和社交功能')}</li>
                  </ul>
                  
                  <h3>{translateText('AI角色系统')}</h3>
                  <ul>
                    <li>{translateText('创建个性化AI角色')}</li>
                    <li>{translateText('角色库浏览和收藏')}</li>
                    <li>{translateText('Live2D角色展示')}</li>
                  </ul>
                  
                  <h3>{translateText('聊天功能')}</h3>
                  <ul>
                    <li>{translateText('实时消息传递')}</li>
                    <li>{translateText('会话历史管理')}</li>
                    <li>{translateText('消息状态显示')}</li>
                  </ul>
                </div>
              </section>
            )}

            {activeSection === 'faq' && (
              <section className="content-section">
                <h2 className="section-title">{t('faq')}</h2>
                <div className="section-content">
                  <h3>{translateText('常见问题')}</h3>
                  
                  <div className="faq-item">
                    <h4>{translateText('Q: 如何创建AI角色？')}</h4>
                    <p>{translateText('A: 登录后进入仪表板，点击"创建AI角色"按钮，填写角色信息即可创建。')}</p>
                  </div>
                  
                  <div className="faq-item">
                    <h4>{translateText('Q: 支持哪些设备？')}</h4>
                    <p>{translateText('A: 支持桌面端、平板和移动设备，采用响应式设计适配各种屏幕尺寸。')}</p>
                  </div>
                  
                  <div className="faq-item">
                    <h4>{translateText('Q: 如何切换语言？')}</h4>
                    <p>{translateText('A: 点击导航栏的语言选择器，选择中文、英文或日文即可切换界面语言。')}</p>
                  </div>
                  
                  <div className="faq-item">
                    <h4>{translateText('Q: 聊天记录会保存吗？')}</h4>
                    <p>{translateText('A: 是的，所有聊天记录都会保存，用户可以在聊天历史中查看之前的对话。')}</p>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>

        {/* 右侧锚点导航 */}
        <div className="docs-anchor">
          <h4 className="anchor-title">{t('onThisPage')}</h4>
          <div className="anchor-list">
            {anchors.map(anchor => (
              <div 
                key={anchor.id}
                className={`anchor-item ${activeAnchor === anchor.id ? 'active' : ''}`}
                onClick={() => handleAnchorClick(anchor.id)}
              >
                {anchor.title}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocsPage;
