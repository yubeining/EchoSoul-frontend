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
  apiReference: "API 参考",
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
  authMethod: "认证方式",
  chatApi: "对话接口",
  roleConfig: "角色配置接口",
  multimediaApi: "多媒体接口",
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
      id: 'apiReference',
      title: t('apiReference'),
      items: [
        { id: 'authMethod', title: t('authMethod') },
        { id: 'chatApi', title: t('chatApi') },
        { id: 'roleConfig', title: t('roleConfig') },
        { id: 'multimediaApi', title: t('multimediaApi') }
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
                {translateText('EchoSoul AI Platform 是一款多模态AI人格化系统，融合自然语言处理、计算机视觉、语音识别与情感计算技术，构建具有独特个性和情感理解能力的智能交互伙伴，为用户提供更加人性化、个性化的AI体验。')}
              </p>
              <p className="section-content">
                {translateText('系统采用先进的深度学习架构，支持多种模态的输入输出，能够理解用户的意图、情感和上下文，提供智能化的对话服务和个性化推荐。')}
              </p>
            </section>

            <section id="coreFeatures" className="content-section">
              <h2 className="section-title">{t('coreFeatures')}</h2>
              <div className="feature-list">
                <div className="feature-item">
                  <h3>{translateText('高级自然语言处理')}</h3>
                  <p>{translateText('利用最先进的自然语言处理模型，实现上下文理解、情感分析和智能对话流，并支持多语言。')}</p>
                </div>
                <div className="feature-item">
                  <h3>{translateText('多模态交互')}</h3>
                  <p>{translateText('支持文本、语音、图像和视频输入，实现不同通信渠道的无缝集成和实时处理能力。')}</p>
                </div>
                <div className="feature-item">
                  <h3>{translateText('主动式交互')}</h3>
                  <p>{translateText('基于用户行为模式、上下文感知和智能调度，实现AI驱动的主动式沟通，提供最佳用户体验和参与度。')}</p>
                </div>
                <div className="feature-item">
                  <h3>{translateText('持久化记忆系统')}</h3>
                  <p>{translateText('先进的记忆架构，维护长期上下文、用户偏好和会话历史，实现个性化和持续的跨会话交互。')}</p>
                </div>
              </div>
            </section>

            <section id="techAdvantages" className="content-section">
              <h2 className="section-title">{t('techAdvantages')}</h2>
              <div className="advantages-grid">
                <div className="advantage-card">
                  <div className="advantage-icon">🚀</div>
                  <h3>{translateText('高性能')}</h3>
                  <p>{translateText('采用分布式架构，支持大规模并发处理，响应速度快，稳定性高。')}</p>
                </div>
                <div className="advantage-card">
                  <div className="advantage-icon">🔒</div>
                  <h3>{translateText('安全可靠')}</h3>
                  <p>{translateText('企业级安全防护，数据加密传输，隐私保护机制完善。')}</p>
                </div>
                <div className="advantage-card">
                  <div className="advantage-icon">🔧</div>
                  <h3>{translateText('易于集成')}</h3>
                  <p>{translateText('提供丰富的API接口，支持多种开发语言，快速集成到现有系统。')}</p>
                </div>
                <div className="advantage-card">
                  <div className="advantage-icon">📈</div>
                  <h3>{translateText('可扩展')}</h3>
                  <p>{translateText('模块化设计，支持水平扩展，可根据业务需求灵活调整。')}</p>
                </div>
              </div>
            </section>
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
