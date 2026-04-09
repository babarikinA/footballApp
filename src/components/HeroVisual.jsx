import { stats } from '../data/content'

const HeroVisual = ({ showMetrics = true }) => (
  <div className="hero-visual" role="presentation" data-testid="hero-visual">
    <div className="device">
      <div className="device-top">
        <span className="pill" />
        <span className="dot small" />
      </div>
      {showMetrics && (
        <div className="device-metrics">
          {stats.map((item) => (
            <div key={item.label} className="metric">
              <p className="metric-label">{item.label}</p>
              <p className="metric-value">{item.value}</p>
            </div>
          ))}
        </div>
      )}
      <div className="device-field">
        <div className="player" />
        <div className="ball" />
      </div>
    </div>
  </div>
)

export default HeroVisual
