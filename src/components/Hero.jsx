import React, { useEffect } from 'react'
import { initPage, soundManager } from './heroLogic'

const imgList = [
  'flame-glow-blur-001.jpg',
  'flame-glow-blur-002.jpg',
  'flame-glow-blur-003.jpg',
  'flame-glow-blur-004.jpg',
  'flame-glow-blur-005.jpg',
  'flame-glow-blur-006.jpg',
  'flame-glow-blur-007.jpg',
  'flame-glow-blur-008.jpg',
  'flame-glow-blur-009.jpg',
  'flame-glow-blur-010.jpg'
]

const remoteBase = 'https://assets.codepen.io/7558/'

export default function Hero(){
  useEffect(()=>{
    initPage().catch(e=>{
      console.error(e);
      const overlay = document.getElementById('loading-overlay');
      if(overlay) overlay.style.display = 'none';
    })
  }, [])

  const renderBackgrounds = () => imgList.map((name, i) => {
    const local = `/assets/${name}`
    const remote = `${remoteBase}${name}`
    return (
      <img
        key={i}
        src={local}
        alt={`Background ${i+1}`}
        className={`background-image ${i===0? 'active' : ''}`}
        id={`background-${i+1}`}
        onError={(e)=>{ e.currentTarget.onerror = null; e.currentTarget.src = remote }}
      />
    )
  })

  return (
    <div>
      <div className="loading-overlay" id="loading-overlay">Loading <span className="loading-counter" id="loading-counter">[00]</span></div>
      <div className="debug-info" id="debug-info">Current Section: 0</div>
      <button className="sound-toggle" id="sound-toggle" onClick={()=>{ soundManager.enableAudio(); document.getElementById('sound-toggle').classList.remove('disabled')}}>
        <div className="sound-dots">
          <div className="sound-dot animated"></div>
          <div className="sound-dot animated"></div>
          <div className="sound-dot animated"></div>
          <div className="sound-dot animated"></div>
        </div>
      </button>

      <div className="scroll-container" id="scroll-container">
        <div className="fixed-section" id="fixed-section">
          <div className="fixed-container" id="fixed-container">
            <div className="background-container" id="background-container">
              {renderBackgrounds()}
            </div>
            <div className="grid-container">
              <div className="header">
                <div className="header-row">The Creative</div>
                <div className="header-row">Process</div>
              </div>
              <div className="content">
                <div className="left-column" id="left-column">
                  <div className="artist active" id="artist-0" data-index="0">Silence</div>
                  <div className="artist" id="artist-1" data-index="1">Meditation</div>
                  <div className="artist" id="artist-2" data-index="2">Intuition</div>
                  <div className="artist" id="artist-3" data-index="3">Authenticity</div>
                  <div className="artist" id="artist-4" data-index="4">Presence</div>
                  <div className="artist" id="artist-5" data-index="5">Listening</div>
                  <div className="artist" id="artist-6" data-index="6">Curiosity</div>
                  <div className="artist" id="artist-7" data-index="7">Patience</div>
                  <div className="artist" id="artist-8" data-index="8">Surrender</div>
                  <div className="artist" id="artist-9" data-index="9">Simplicity</div>
                </div>
                <div className="featured" id="featured">
                  <div className="featured-content active" id="featured-0" data-index="0">
                    <h3>Creative Elements</h3>
                  </div>
                  <div className="featured-content" id="featured-1" data-index="1">
                    <h3>Inner Stillness</h3>
                  </div>
                  <div className="featured-content" id="featured-2" data-index="2">
                    <h3>Deep Knowing</h3>
                  </div>
                  <div className="featured-content" id="featured-3" data-index="3">
                    <h3>True Expression</h3>
                  </div>
                  <div className="featured-content" id="featured-4" data-index="4">
                    <h3>Now Moment</h3>
                  </div>
                  <div className="featured-content" id="featured-5" data-index="5">
                    <h3>Deep Attention</h3>
                  </div>
                  <div className="featured-content" id="featured-6" data-index="6">
                    <h3>Open Exploration</h3>
                  </div>
                  <div className="featured-content" id="featured-7" data-index="7">
                    <h3>Calm Waiting</h3>
                  </div>
                  <div className="featured-content" id="featured-8" data-index="8">
                    <h3>Let Go Control</h3>
                  </div>
                  <div className="featured-content" id="featured-9" data-index="9">
                    <h3>Pure Essence</h3>
                  </div>
                </div>
                <div className="right-column" id="right-column">
                  <div className="category active" id="category-0" data-index="0">Reduction</div>
                  <div className="category" id="category-1" data-index="1">Essence</div>
                  <div className="category" id="category-2" data-index="2">Space</div>
                  <div className="category" id="category-3" data-index="3">Resonance</div>
                  <div className="category" id="category-4" data-index="4">Truth</div>
                  <div className="category" id="category-5" data-index="5">Feeling</div>
                  <div className="category" id="category-6" data-index="6">Clarity</div>
                  <div className="category" id="category-7" data-index="7">Emptiness</div>
                  <div className="category" id="category-8" data-index="8">Awareness</div>
                  <div className="category" id="category-9" data-index="9">Minimalism</div>
                </div>
              </div>
              <div className="footer" id="footer">
                <div className="header-row">Beyond</div>
                <div className="header-row">Thinking</div>
                <div className="progress-indicator">
                  <div className="progress-numbers">
                    <span id="current-section">01</span>
                    <span id="total-sections">10</span>
                  </div>
                  <div className="progress-fill" id="progress-fill"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="end-section">
          <p className="fin">fin</p>
        </div>
      </div>
    </div>
  )
}
