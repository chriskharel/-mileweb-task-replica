import React from 'react'
import './hero.css'

export default function Hero(){
  return (
    <div className="hero-wrap">
      <div className="center-card">
        <h1 className="title">Wind &amp; Waves</h1>
        <p className="subtitle">An ambient loop by Filip Z</p>
        <div className="controls">
          <button className="play">Play</button>
          <div className="slider" />
        </div>
      </div>
      <audio loop src="/assets/ambient.mp3" />
    </div>
  )
}
