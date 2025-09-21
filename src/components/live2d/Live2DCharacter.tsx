import React, { useEffect, useRef, useState } from 'react';
import './Live2DCharacter.css';

interface Live2DCharacterProps {
  className?: string;
}

const Live2DCharacter: React.FC<Live2DCharacterProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // const [isLoaded, setIsLoaded] = useState(false);
  const [currentExpression, setCurrentExpression] = useState('idle');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // 御坂美琴的Live2D模型数据（精美二次元风格）
  const misakaData = {
    name: '御坂美琴',
    expressions: ['idle', 'happy', 'angry', 'surprised', 'sad'],
    animations: ['idle', 'blink', 'look_left', 'look_right', 'look_up', 'look_down'],
    textures: {
      idle: generateMisakaSVG('idle'),
      happy: generateMisakaSVG('happy'),
      angry: generateMisakaSVG('angry'),
      surprised: generateMisakaSVG('surprised'),
      sad: generateMisakaSVG('sad')
    }
  };

  // 生成御坂美琴SVG图像
  function generateMisakaSVG(expression: string) {
    const svg = `<svg width="400" height="600" viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="600" fill="#F8F9FA"/>
        <ellipse cx="200" cy="520" rx="80" ry="20" fill="rgba(0,0,0,0.1)"/>
        <path d="M160 300 L240 300 L235 480 L165 480 Z" fill="#0088FF"/>
        <path d="M180 300 L220 300 L220 350 L180 350 Z" fill="#FFFFFF"/>
        <path d="M190 320 L210 320 L205 360 L195 360 Z" fill="#FFD700"/>
        <ellipse cx="150" cy="350" rx="25" ry="80" fill="#FFE4B5" transform="rotate(-20 150 350)"/>
        <ellipse cx="250" cy="350" rx="25" ry="80" fill="#FFE4B5" transform="rotate(20 250 350)"/>
        <circle cx="130" cy="420" r="15" fill="#FFE4B5"/>
        <circle cx="270" cy="420" r="15" fill="#FFE4B5"/>
        <circle cx="280" cy="415" r="8" fill="#C0C0C0" stroke="#999" stroke-width="1"/>
        <path d="M140 120 Q200 80 260 120 L250 200 L150 200 Z" fill="#D4A574"/>
        <path d="M145 125 Q200 85 255 125 L250 195 L150 195 Z" fill="#C49660"/>
        <circle cx="170" cy="140" r="6" fill="#FFFFFF"/>
        <circle cx="230" cy="140" r="6" fill="#FFFFFF"/>
        <ellipse cx="200" cy="180" rx="45" ry="50" fill="#FFE4B5"/>
        ${generateEyes(expression)}
        ${generateEyebrows(expression)}
        ${generateMouth(expression)}
        <path d="M160 480 L240 480 L230 520 L170 520 Z" fill="#4A4A4A"/>
        <path d="M165 485 L235 485 L230 515 L170 515 Z" fill="#666666"/>
        <ellipse cx="185" cy="550" rx="12" ry="40" fill="#FFE4B5"/>
        <ellipse cx="215" cy="550" rx="12" ry="40" fill="#FFE4B5"/>
        <ellipse cx="185" cy="520" rx="15" ry="25" fill="#FFFFFF"/>
        <ellipse cx="215" cy="520" rx="15" ry="25" fill="#FFFFFF"/>
        <ellipse cx="185" cy="585" rx="20" ry="8" fill="#8B4513"/>
        <ellipse cx="215" cy="585" rx="20" ry="8" fill="#8B4513"/>
        ${expression === 'happy' || expression === 'angry' ? generateElectricity() : ''}
      </svg>`;
    
    // 使用 encodeURIComponent 代替 btoa 来处理 Unicode 字符
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  // 生成眼睛
  function generateEyes(expression: string) {
    switch (expression) {
      case 'happy':
        return `
          <ellipse cx="185" cy="175" rx="8" ry="12" fill="#4A4A4A"/>
          <ellipse cx="215" cy="175" rx="8" ry="12" fill="#4A4A4A"/>
          <circle cx="185" cy="172" r="3" fill="#FFFFFF"/>
          <circle cx="215" cy="172" r="3" fill="#FFFFFF"/>
        `;
      case 'angry':
        return `
          <ellipse cx="185" cy="175" rx="8" ry="10" fill="#4A4A4A"/>
          <ellipse cx="215" cy="175" rx="8" ry="10" fill="#4A4A4A"/>
          <circle cx="185" cy="172" r="3" fill="#FFFFFF"/>
          <circle cx="215" cy="172" r="3" fill="#FFFFFF"/>
        `;
      case 'surprised':
        return `
          <ellipse cx="185" cy="175" rx="10" ry="15" fill="#4A4A4A"/>
          <ellipse cx="215" cy="175" rx="10" ry="15" fill="#4A4A4A"/>
          <circle cx="185" cy="170" r="4" fill="#FFFFFF"/>
          <circle cx="215" cy="170" r="4" fill="#FFFFFF"/>
        `;
      case 'sad':
        return `
          <ellipse cx="185" cy="175" rx="8" ry="8" fill="#4A4A4A"/>
          <ellipse cx="215" cy="175" rx="8" ry="8" fill="#4A4A4A"/>
          <circle cx="185" cy="172" r="3" fill="#FFFFFF"/>
          <circle cx="215" cy="172" r="3" fill="#FFFFFF"/>
        `;
      default: // idle
        return `
          <ellipse cx="185" cy="175" rx="8" ry="12" fill="#4A4A4A"/>
          <ellipse cx="215" cy="175" rx="8" ry="12" fill="#4A4A4A"/>
          <circle cx="185" cy="172" r="3" fill="#FFFFFF"/>
          <circle cx="215" cy="172" r="3" fill="#FFFFFF"/>
        `;
    }
  }

  // 生成眉毛
  function generateEyebrows(expression: string) {
    switch (expression) {
      case 'angry':
        return `
          <path d="M175 160 Q185 155 195 160" stroke="#8B4513" stroke-width="3" fill="none"/>
          <path d="M205 160 Q215 155 225 160" stroke="#8B4513" stroke-width="3" fill="none"/>
        `;
      case 'surprised':
        return `
          <path d="M175 160 Q185 150 195 160" stroke="#8B4513" stroke-width="3" fill="none"/>
          <path d="M205 160 Q215 150 225 160" stroke="#8B4513" stroke-width="3" fill="none"/>
        `;
      default:
        return `
          <path d="M175 160 Q185 162 195 160" stroke="#8B4513" stroke-width="3" fill="none"/>
          <path d="M205 160 Q215 162 225 160" stroke="#8B4513" stroke-width="3" fill="none"/>
        `;
    }
  }

  // 生成嘴巴
  function generateMouth(expression: string) {
    switch (expression) {
      case 'happy':
        return `<path d="M185 200 Q200 210 215 200" stroke="#FF69B4" stroke-width="3" fill="none"/>`;
      case 'angry':
        return `<path d="M185 200 Q200 195 215 200" stroke="#FF69B4" stroke-width="3" fill="none"/>`;
      case 'surprised':
        return `<ellipse cx="200" cy="200" rx="8" ry="12" fill="#FF69B4"/>`;
      case 'sad':
        return `<path d="M185 200 Q200 205 215 200" stroke="#FF69B4" stroke-width="3" fill="none"/>`;
      default: // idle
        return `<path d="M185 200 Q200 202 215 200" stroke="#FF69B4" stroke-width="2" fill="none"/>`;
    }
  }

  // 生成电气效果
  function generateElectricity() {
    return `
      <g opacity="0.8">
        <path d="M270 400 Q280 380 290 400 Q300 420 310 400" stroke="#00BFFF" stroke-width="3" fill="none">
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="0.5s" repeatCount="indefinite"/>
        </path>
        <path d="M280 390 Q290 370 300 390 Q310 410 320 390" stroke="#FFFFFF" stroke-width="2" fill="none">
          <animate attributeName="opacity" values="0.6;0.2;0.6" dur="0.3s" repeatCount="indefinite"/>
        </path>
        <path d="M275 410 Q285 390 295 410 Q305 430 315 410" stroke="#87CEEB" stroke-width="2" fill="none">
          <animate attributeName="opacity" values="0.7;0.1;0.7" dur="0.4s" repeatCount="indefinite"/>
        </path>
      </g>
    `;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布尺寸
    canvas.width = 400;
    canvas.height = 600;

    // 加载角色
    const loadCharacter = () => {
      drawCharacter(ctx, misakaData.textures.idle);
      // setIsLoaded(true);
    };

    loadCharacter();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const drawCharacter = (ctx: CanvasRenderingContext2D, textureData: string) => {
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, 400, 600);
      ctx.drawImage(img, 0, 0, 400, 600);
    };
    img.src = textureData;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePosition({ x, y });

    // 根据鼠标位置触发眼神跟随
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    if (x < centerX - 50) {
      triggerAnimation('look_left');
    } else if (x > centerX + 50) {
      triggerAnimation('look_right');
    } else if (y < centerY - 100) {
      triggerAnimation('look_up');
    } else if (y > centerY + 100) {
      triggerAnimation('look_down');
    } else {
      triggerAnimation('idle');
    }
  };

  const handleMouseEnter = () => {
    triggerExpression('happy');
  };

  const handleMouseLeave = () => {
    triggerExpression('idle');
    triggerAnimation('idle');
  };

  const triggerExpression = (expression: string) => {
    setCurrentExpression(expression);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const textureData = misakaData.textures[expression as keyof typeof misakaData.textures] || misakaData.textures.idle;
    drawCharacter(ctx, textureData);
  };

  const triggerAnimation = (animation: string) => {
    // 这里可以实现更复杂的动画逻辑
    console.log(`Playing animation: ${animation}`);
  };

  const startSpeaking = () => {
    setIsSpeaking(true);
    // 模拟口型同步
    const speakingInterval = setInterval(() => {
      const randomExpression = misakaData.expressions[Math.floor(Math.random() * misakaData.expressions.length)];
      triggerExpression(randomExpression);
    }, 200);

    // 3秒后停止说话
    setTimeout(() => {
      clearInterval(speakingInterval);
      setIsSpeaking(false);
      triggerExpression('idle');
    }, 3000);
  };

  const speakText = (text: string) => {
    if (isSpeaking) return;
    
    startSpeaking();
    
    // 使用Web Speech API进行语音合成
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP'; // 日语语音
      utterance.rate = 0.8;
      utterance.pitch = 1.2;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className={`live2d-character ${className || ''}`}>
      <div className="character-container">
        <canvas
          ref={canvasRef}
          className="character-canvas"
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
        
        <div className="character-info">
          <h3 className="character-name">{misakaData.name}</h3>
          <p className="character-status">测试用户 已就绪</p>
        </div>
      </div>

      <div className="character-controls">
        <div className="expression-controls">
          <h4>表情控制</h4>
          <div className="expression-buttons">
            {misakaData.expressions.map(expression => (
              <button
                key={expression}
                className={`expression-btn ${currentExpression === expression ? 'active' : ''}`}
                onClick={() => triggerExpression(expression)}
              >
                {expression === 'idle' && '😐'}
                {expression === 'happy' && '😊'}
                {expression === 'angry' && '😠'}
                {expression === 'surprised' && '😲'}
                {expression === 'sad' && '😢'}
              </button>
            ))}
          </div>
        </div>

        <div className="interaction-controls">
          <h4>交互控制</h4>
          <button 
            className="speak-btn"
            onClick={() => speakText('こんにちは！私は御坂美琴です。よろしくお願いします！')}
            disabled={isSpeaking}
          >
            {isSpeaking ? '🗣️ 说话中...' : '🗣️ 说话'}
          </button>
          
          <button 
            className="blink-btn"
            onClick={() => triggerAnimation('blink')}
          >
            👁️ 眨眼
          </button>
        </div>

        <div className="status-info">
          <p className="mouse-info">
            鼠标位置: ({mousePosition.x}, {mousePosition.y})
          </p>
          <p className="current-expression">
            当前表情: {currentExpression}
          </p>
          <p className="speaking-status">
            说话状态: {isSpeaking ? '说话中' : '安静'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Live2DCharacter;

