// 自动翻译工具函数
// 支持中文到英文、日文的自动翻译

// 翻译映射表 - 可以根据需要扩展
const translationMap: Record<string, Record<string, string>> = {
  // 基础词汇翻译
  '首页': { en: 'Home', ja: 'ホーム' },
  '文档': { en: 'Documentation', ja: 'ドキュメント' },
  '教程': { en: 'Tutorial', ja: 'チュートリアル' },
  '登录': { en: 'Login', ja: 'ログイン' },
  '语言': { en: 'Language', ja: '言語' },
  '分享': { en: 'Share', ja: '共有' },
  '复制链接': { en: 'Copy Link', ja: 'リンクをコピー' },
  '分享到微信': { en: 'Share to WeChat', ja: 'WeChatで共有' },
  '分享到微博': { en: 'Share to Weibo', ja: 'Weiboで共有' },
  '本页目录': { en: 'On this page', ja: 'このページ' },
  '文档中心': { en: 'Documentation Center', ja: 'ドキュメントセンター' },
  '安装指南': { en: 'Installation Guide', ja: 'インストールガイド' },
  '使用手册': { en: 'User Manual', ja: 'ユーザーマニュアル' },
  'API 参考': { en: 'API Reference', ja: 'APIリファレンス' },
  '技术架构': { en: 'Technical Architecture', ja: '技術アーキテクチャ' },
  '发展路线': { en: 'Roadmap', ja: 'ロードマップ' },
  '概述': { en: 'Overview', ja: '概要' },
  '环境要求': { en: 'Environment Requirements', ja: '環境要件' },
  '部署步骤': { en: 'Deployment Steps', ja: 'デプロイ手順' },
  '验证方法': { en: 'Verification', ja: '検証' },
  '快速开始': { en: 'Quick Start', ja: 'クイックスタート' },
  '界面介绍': { en: 'Interface Introduction', ja: 'インターフェース紹介' },
  '功能模块': { en: 'Features', ja: '機能' },
  '常见问题': { en: 'FAQ', ja: 'FAQ' },
  '认证方式': { en: 'Authentication', ja: '認証方法' },
  '对话接口': { en: 'Chat API', ja: 'チャットAPI' },
  '角色配置接口': { en: 'Role Configuration', ja: 'ロール設定' },
  '多媒体接口': { en: 'Multimedia API', ja: 'マルチメディアAPI' },
  '系统架构图': { en: 'System Architecture', ja: 'システムアーキテクチャ' },
  '核心组件': { en: 'Core Components', ja: 'コアコンポーネント' },
  '技术栈': { en: 'Technology Stack', ja: '技術スタック' },
  '系统概述': { en: 'System Overview', ja: 'システム概要' },
  '核心功能': { en: 'Core Features', ja: 'コア機能' },
  '技术优势': { en: 'Technical Advantages', ja: '技術的優位性' },
  
  // 文档内容翻译
  'EchoSoul AI Platform 是一款多模态AI人格化系统，融合自然语言处理、计算机视觉、语音识别与情感计算技术，构建具有独特个性和情感理解能力的智能交互伙伴，为用户提供更加人性化、个性化的AI体验。': {
    en: 'EchoSoul AI Platform is a multimodal AI personality system that integrates natural language processing, computer vision, speech recognition, and emotion computing technologies to build intelligent interaction partners with unique personalities and emotional understanding capabilities, providing users with more humanized and personalized AI experiences.',
    ja: 'EchoSoul AI Platformは、自然言語処理、コンピュータビジョン、音声認識、感情計算技術を統合したマルチモーダルAI人格化システムで、独特な個性と感情理解能力を持つ知的インタラクションパートナーを構築し、ユーザーにより人間的で個別化されたAI体験を提供します。'
  },
  '系统采用先进的深度学习架构，支持多种模态的输入输出，能够理解用户的意图、情感和上下文，提供智能化的对话服务和个性化推荐。': {
    en: 'The system adopts advanced deep learning architecture, supports multiple modal input and output, can understand user intentions, emotions and context, and provides intelligent dialogue services and personalized recommendations.',
    ja: 'システムは先進的な深層学習アーキテクチャを採用し、複数のモーダル入出力をサポートし、ユーザーの意図、感情、コンテキストを理解し、知的対話サービスと個別化された推奨を提供できます。'
  },
  '高级自然语言处理': {
    en: 'Advanced Natural Language Processing',
    ja: '高度な自然言語処理'
  },
  '利用最先进的自然语言处理模型，实现上下文理解、情感分析和智能对话流，并支持多语言。': {
    en: 'Utilizing the most advanced natural language processing models to achieve contextual understanding, sentiment analysis and intelligent dialogue flow, with multi-language support.',
    ja: '最先端の自然言語処理モデルを活用し、コンテキスト理解、感情分析、知的対話フローを実現し、多言語をサポートします。'
  },
  '多模态交互': {
    en: 'Multimodal Interaction',
    ja: 'マルチモーダルインタラクション'
  },
  '支持文本、语音、图像和视频输入，实现不同通信渠道的无缝集成和实时处理能力。': {
    en: 'Supports text, voice, image and video input, achieving seamless integration of different communication channels and real-time processing capabilities.',
    ja: 'テキスト、音声、画像、動画入力をサポートし、異なる通信チャネルのシームレスな統合とリアルタイム処理能力を実現します。'
  },
  '主动式交互': {
    en: 'Proactive Interaction',
    ja: '能動的インタラクション'
  },
  '基于用户行为模式、上下文感知和智能调度，实现AI驱动的主动式沟通，提供最佳用户体验和参与度。': {
    en: 'Based on user behavior patterns, contextual awareness and intelligent scheduling, AI-driven proactive communication is achieved, providing the best user experience and engagement.',
    ja: 'ユーザーの行動パターン、コンテキスト認識、知的スケジューリングに基づいて、AI駆動の能動的コミュニケーションを実現し、最高のユーザー体験とエンゲージメントを提供します。'
  },
  '持久化记忆系统': {
    en: 'Persistent Memory System',
    ja: '永続化メモリシステム'
  },
  '先进的记忆架构，维护长期上下文、用户偏好和会话历史，实现个性化和持续的跨会话交互。': {
    en: 'Advanced memory architecture that maintains long-term context, user preferences and session history, enabling personalized and continuous cross-session interaction.',
    ja: '長期コンテキスト、ユーザー設定、セッション履歴を維持する先進的なメモリアーキテクチャで、個別化された継続的なセッション間インタラクションを実現します。'
  },
  '高性能': {
    en: 'High Performance',
    ja: '高性能'
  },
  '采用分布式架构，支持大规模并发处理，响应速度快，稳定性高。': {
    en: 'Adopts distributed architecture, supports large-scale concurrent processing, fast response speed and high stability.',
    ja: '分散アーキテクチャを採用し、大規模並行処理をサポートし、応答速度が速く、安定性が高いです。'
  },
  '安全可靠': {
    en: 'Secure and Reliable',
    ja: '安全で信頼性'
  },
  '企业级安全防护，数据加密传输，隐私保护机制完善。': {
    en: 'Enterprise-level security protection, encrypted data transmission, and comprehensive privacy protection mechanisms.',
    ja: 'エンタープライズレベルのセキュリティ保護、暗号化データ伝送、包括的なプライバシー保護メカニズム。'
  },
  '易于集成': {
    en: 'Easy Integration',
    ja: '簡単な統合'
  },
  '提供丰富的API接口，支持多种开发语言，快速集成到现有系统。': {
    en: 'Provides rich API interfaces, supports multiple development languages, and quickly integrates into existing systems.',
    ja: '豊富なAPIインターフェースを提供し、複数の開発言語をサポートし、既存システムに迅速に統合できます。'
  },
  '可扩展': {
    en: 'Scalable',
    ja: 'スケーラブル'
  },
  '模块化设计，支持水平扩展，可根据业务需求灵活调整。': {
    en: 'Modular design, supports horizontal scaling, and can be flexibly adjusted according to business needs.',
    ja: 'モジュラー設計、水平スケーリングをサポートし、ビジネスニーズに応じて柔軟に調整できます。'
  }
};

/**
 * 自动翻译函数
 * @param text 要翻译的文本（通常是中文）
 * @param targetLanguage 目标语言 ('zh' | 'en' | 'ja')
 * @returns 翻译后的文本，如果没有找到翻译则返回原文
 */
export function autoTranslate(text: string, targetLanguage: 'zh' | 'en' | 'ja'): string {
  // 如果是中文，直接返回
  if (targetLanguage === 'zh') {
    return text;
  }
  
  // 查找翻译
  const translation = translationMap[text];
  if (translation && translation[targetLanguage]) {
    return translation[targetLanguage];
  }
  
  // 如果没有找到精确匹配，尝试部分匹配
  for (const [key, value] of Object.entries(translationMap)) {
    if (text.includes(key) && value[targetLanguage]) {
      return text.replace(key, value[targetLanguage]);
    }
  }
  
  // 如果都没有找到，返回原文
  return text;
}

/**
 * 批量翻译函数
 * @param texts 要翻译的文本数组
 * @param targetLanguage 目标语言
 * @returns 翻译后的文本数组
 */
export function batchTranslate(texts: string[], targetLanguage: 'zh' | 'en' | 'ja'): string[] {
  return texts.map(text => autoTranslate(text, targetLanguage));
}

/**
 * 智能翻译函数 - 支持更复杂的翻译逻辑
 * @param text 要翻译的文本
 * @param targetLanguage 目标语言
 * @returns 翻译后的文本
 */
export function smartTranslate(text: string, targetLanguage: 'zh' | 'en' | 'ja'): string {
  if (targetLanguage === 'zh') {
    return text;
  }
  
  // 先尝试精确匹配
  let translated = autoTranslate(text, targetLanguage);
  
  // 如果精确匹配失败，尝试逐词翻译
  if (translated === text) {
    const words = text.split(/(\s+|[，。！？；：])/);
    translated = words.map(word => autoTranslate(word.trim(), targetLanguage)).join('');
  }
  
  return translated;
}
