import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <h2>EchoSoul</h2>
          </div>
          <div className="nav-menu">
            <a href="#home" className="nav-link">Home</a>
            <a href="#features" className="nav-link">Features</a>
            <a href="#about" className="nav-link">About</a>
            <a href="#contact" className="nav-link">Contact</a>
          </div>
          <div className="nav-cta">
            <button className="btn-primary">Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Welcome to <span className="highlight">EchoSoul</span>
            </h1>
            <p className="hero-subtitle">
              Experience the future of digital interaction with our innovative platform
              that connects minds and souls through cutting-edge technology.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary btn-large">Start Your Journey</button>
              <button className="btn-secondary btn-large">Learn More</button>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-placeholder">
              <div className="floating-card card-1">
                <div className="card-icon">🚀</div>
                <h3>Innovation</h3>
              </div>
              <div className="floating-card card-2">
                <div className="card-icon">💡</div>
                <h3>Creativity</h3>
              </div>
              <div className="floating-card card-3">
                <div className="card-icon">🌟</div>
                <h3>Excellence</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Why Choose EchoSoul?</h2>
            <p className="section-subtitle">
              Discover the features that make us stand out from the crowd
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Lightning Fast</h3>
              <p>Experience blazing fast performance with our optimized infrastructure</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure & Reliable</h3>
              <p>Your data is protected with enterprise-grade security measures</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎨</div>
              <h3>Beautiful Design</h3>
              <p>Enjoy a stunning user interface crafted with attention to detail</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Mobile Ready</h3>
              <p>Access your content seamlessly across all devices</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌐</div>
              <h3>Global Reach</h3>
              <p>Connect with users worldwide through our global network</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛠️</div>
              <h3>Easy Integration</h3>
              <p>Simple APIs and documentation for quick implementation</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>EchoSoul</h3>
              <p>Connecting minds, inspiring souls, creating the future.</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#features">Features</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li><a href="#">Documentation</a></li>
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Community</a></li>
                <li><a href="#">Status</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Connect</h4>
              <div className="social-links">
                <a href="#" className="social-link">📧</a>
                <a href="#" className="social-link">🐦</a>
                <a href="#" className="social-link">💼</a>
                <a href="#" className="social-link">📘</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 EchoSoul. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
