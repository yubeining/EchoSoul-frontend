import React, { createContext, useContext, useState, ReactNode } from 'react';

// 翻译键类型定义
export type TranslationKeys = 
  | 'home' | 'docs' | 'share' | 'copyLink' | 'shareToWechat' | 'shareToWeibo'
  | 'getStarted' | 'contactSales' | 'liveDemo' | 'heroDescription'
  | 'innovation' | 'excellence' | 'creativity'
  | 'advancedNlp' | 'advancedNlpDesc' | 'multimodalInteraction' | 'multimodalInteractionDesc'
  | 'proactiveEngagement' | 'proactiveEngagementDesc' | 'persistentMemory' | 'persistentMemoryDesc'
  | 'title' | 'subtitle' | 'mobileOrEmail' | 'password' | 'confirmPassword'
  | 'passwordStrength' | 'strengthLabels' | 'agreement' | 'termsOfService' | 'and' | 'privacyPolicy'
  | 'register' | 'hasAccount' | 'loginNow' | 'username' | 'login' | 'guestLogin' | 'noAccount'
  | 'docCenter' | 'installGuide' | 'userManual' | 'techArchitecture' | 'roadmap'
  | 'overview' | 'envRequirements' | 'deploySteps' | 'verification' | 'quickStart'
  | 'interfaceIntro' | 'features' | 'faq' | 'systemArch' | 'coreComponents' | 'techStack' | 'systemOverview'
  | 'coreFeatures' | 'techAdvantages' | 'onThisPage';

// 翻译上下文类型
interface TranslationContextType {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: TranslationKeys) => string;
  translateText: (text: string) => string;
}

// 创建翻译上下文
const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// 翻译提供者组件
interface TranslationProviderProps {
  children: ReactNode;
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState('zh');

  // 统一的翻译函数
  const t = (key: TranslationKeys): string => {
    // 基础翻译映射
    const translations: Record<string, Record<string, string>> = {
      zh: {
        home: "首页",
        docs: "文档",
        share: "分享",
        copyLink: "复制链接",
        shareToWechat: "分享到微信",
        shareToWeibo: "分享到微博",
        getStarted: "开始使用",
        contactSales: "发展规划",
        liveDemo: "在线试用",
        heroDescription: "融合自然语言处理、计算机视觉、语音识别与情感计算技术，构建具有独特个性和情感理解能力的智能交互伙伴，为用户提供更加人性化、个性化的AI体验",
        innovation: "创新",
        excellence: "卓越",
        creativity: "创造力",
        advancedNlp: "高级自然语言处理",
        advancedNlpDesc: "利用最先进的自然语言处理模型，实现上下文理解、情感分析和智能对话流，并支持多语言。",
        multimodalInteraction: "多模态交互",
        multimodalInteractionDesc: "支持文本、语音、图像和视频输入，实现不同通信渠道的无缝集成和实时处理能力。",
        proactiveEngagement: "主动式交互",
        proactiveEngagementDesc: "基于用户行为模式、上下文感知和智能调度，实现AI驱动的主动式沟通，提供最佳用户体验和参与度。",
        persistentMemory: "持久化记忆系统",
        persistentMemoryDesc: "先进的记忆架构，维护长期上下文、用户偏好和会话历史，实现个性化和持续的跨会话交互。",
        title: "用户注册",
        subtitle: "填写以下信息，创建您的账号",
        mobileOrEmail: "手机号/邮箱",
        password: "密码",
        confirmPassword: "确认密码",
        passwordStrength: "密码强度",
        strengthLabels: "弱,中,强",
        agreement: "我已阅读并同意",
        termsOfService: "《用户服务协议》",
        and: "和",
        privacyPolicy: "《隐私政策》",
        register: "注册",
        hasAccount: "已有账号?",
        loginNow: "立即登录",
        username: "用户名/邮箱",
        login: "登录",
        guestLogin: "游客登录",
        noAccount: "还没有账号?",
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
        techAdvantages: "技术优势",
        onThisPage: "本页目录"
      },
      en: {
        home: "Home",
        docs: "Documentation",
        share: "Share",
        copyLink: "Copy Link",
        shareToWechat: "Share to WeChat",
        shareToWeibo: "Share to Weibo",
        getStarted: "Get Started",
        contactSales: "Development Plan",
        liveDemo: "Live Trial",
        heroDescription: "Integrate natural language processing, computer vision, speech recognition, and emotional computing technologies to build intelligent interactive partners with unique personalities and emotional understanding capabilities, providing users with a more humanized and personalized AI experience.",
        innovation: "Innovation",
        excellence: "Excellence",
        creativity: "Creativity",
        advancedNlp: "Advanced NLP Processing",
        advancedNlpDesc: "Utilize state-of-the-art natural language processing models for contextual understanding, sentiment analysis, and intelligent conversation flow with multi-language support.",
        multimodalInteraction: "Multimodal Interaction",
        multimodalInteractionDesc: "Support for text, voice, image, and video inputs with seamless integration across different communication channels and real-time processing capabilities.",
        proactiveEngagement: "Proactive Engagement",
        proactiveEngagementDesc: "AI-driven proactive communication based on user behavior patterns, contextual awareness, and intelligent scheduling for optimal user experience and engagement.",
        persistentMemory: "Persistent Memory System",
        persistentMemoryDesc: "Advanced memory architecture that maintains long-term context, user preferences, and conversation history for personalized and continuous interactions across sessions.",
        title: "User Registration",
        subtitle: "Fill in the following information to create your account",
        mobileOrEmail: "Mobile/Email",
        password: "Password",
        confirmPassword: "Confirm Password",
        passwordStrength: "Password Strength",
        strengthLabels: "Weak,Medium,Strong",
        agreement: "I have read and agree to",
        termsOfService: "Terms of Service",
        and: "and",
        privacyPolicy: "Privacy Policy",
        register: "Register",
        hasAccount: "Already have an account?",
        loginNow: "Log in now",
        username: "Username/Email",
        login: "Login",
        guestLogin: "Guest Login",
        noAccount: "Don't have an account?",
        docCenter: "Documentation Center",
        installGuide: "Installation Guide",
        userManual: "User Manual",
        techArchitecture: "Technical Architecture",
        roadmap: "Roadmap",
        overview: "Overview",
        envRequirements: "Environment Requirements",
        deploySteps: "Deployment Steps",
        verification: "Verification",
        quickStart: "Quick Start",
        interfaceIntro: "Interface Introduction",
        features: "Features",
        faq: "FAQ",
        systemArch: "System Architecture",
        coreComponents: "Core Components",
        techStack: "Technology Stack",
        systemOverview: "System Overview",
        coreFeatures: "Core Features",
        techAdvantages: "Technical Advantages",
        onThisPage: "On this page"
      },
      ja: {
        home: "ホーム",
        docs: "ドキュメント",
        share: "共有",
        copyLink: "リンクをコピー",
        shareToWechat: "WeChatで共有",
        shareToWeibo: "Weiboで共有",
        getStarted: "始める",
        contactSales: "開発計画",
        liveDemo: "オンライントライアル",
        heroDescription: "自然言語処理、コンピュータビジョン、音声認識、感情計算技術を統合し、独特な個性と感情理解能力を持つ知的インタラクティブパートナーを構築し、ユーザーにより人間的で個性的なAI体験を提供します。",
        innovation: "革新",
        excellence: "卓越",
        creativity: "創造性",
        advancedNlp: "高度な自然言語処理",
        advancedNlpDesc: "最先端の自然言語処理モデルを活用し、文脈理解、感情分析、知的会話フローを実現し、多言語をサポートします。",
        multimodalInteraction: "マルチモーダルインタラクション",
        multimodalInteractionDesc: "テキスト、音声、画像、動画の入力をサポートし、異なる通信チャネル間のシームレスな統合とリアルタイム処理能力を実現します。",
        proactiveEngagement: "積極的エンゲージメント",
        proactiveEngagementDesc: "ユーザーの行動パターン、文脈認識、知的スケジューリングに基づくAI駆動の積極的コミュニケーションにより、最適なユーザー体験とエンゲージメントを提供します。",
        persistentMemory: "永続メモリシステム",
        persistentMemoryDesc: "長期文脈、ユーザー設定、会話履歴を維持する先進的なメモリアーキテクチャにより、セッション間での個性化された継続的なインタラクションを実現します。",
        title: "ユーザー登録",
        subtitle: "以下の情報を入力してアカウントを作成してください",
        mobileOrEmail: "携帯電話/メール",
        password: "パスワード",
        confirmPassword: "パスワード確認",
        passwordStrength: "パスワード強度",
        strengthLabels: "弱い,中程度,強い",
        agreement: "私は以下に同意します",
        termsOfService: "利用規約",
        and: "と",
        privacyPolicy: "プライバシーポリシー",
        register: "登録",
        hasAccount: "アカウントをお持ちの方は?",
        loginNow: "今すぐログイン",
        username: "ユーザー名/メール",
        login: "ログイン",
        guestLogin: "ゲストログイン",
        noAccount: "アカウントをお持ちでない方は?",
        docCenter: "ドキュメントセンター",
        installGuide: "インストールガイド",
        userManual: "ユーザーマニュアル",
        techArchitecture: "技術アーキテクチャ",
        roadmap: "ロードマップ",
        overview: "概要",
        envRequirements: "環境要件",
        deploySteps: "デプロイ手順",
        verification: "検証",
        quickStart: "クイックスタート",
        interfaceIntro: "インターフェース紹介",
        features: "機能",
        faq: "FAQ",
        systemArch: "システムアーキテクチャ",
        coreComponents: "コアコンポーネント",
        techStack: "技術スタック",
        systemOverview: "システム概要",
        coreFeatures: "コア機能",
        techAdvantages: "技術的優位性",
        onThisPage: "このページ"
      }
    };

    return translations[language]?.[key] || key;
  };

  // 智能翻译函数
  const translateText = (text: string): string => {
    // 简单的翻译实现，直接返回原文
    // 如果需要更复杂的翻译，可以集成第三方翻译服务
    return text;
  };

  const value: TranslationContextType = {
    language,
    setLanguage,
    t,
    translateText
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

// 使用翻译上下文的Hook
export const useTranslation = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

