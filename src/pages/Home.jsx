import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import HeroVisual from '../components/HeroVisual'
import { features, steps, stats } from '../data/content'
import { listUsers } from '../data/db'

const HomePage = () => (
  <> 
    <section className="hero" id="home" data-testid="hero">
      <div className="hero-copy" data-testid="hero-copy">
        <p className="overline">Футбол · Результаты</p>
        <h1>Присоединяйся к игре. Следи за статистикой.</h1>
        <p className="lead">Находи матчи, играй в футбол и отслеживай свой прогресс.</p>
        <div className="hero-actions">
          <Link className="btn primary" to="/contacts" data-testid="hero-primary">
            Начать
          </Link>
          <Link className="btn ghost" to="/about" data-testid="hero-secondary">
            Смотреть игры
          </Link>
        </div>
      </div>
      <HeroVisual />
    </section>

    <FeaturedPlayers />

    <section className="section" id="features" data-testid="features">
      <div className="section-head">
        <h2>Играй осознанно с Footbool</h2>
        <p className="muted">
          Простые инструменты, чтобы планировать, играть и расти — в минималистичном, премиальном
          стиле.
        </p>
      </div>
      <div className="grid-3">
        {features.map((item) => (
          <div key={item.title} className="card feature" data-testid={`feature-${item.title}`}>
            <div className="icon">{item.icon}</div>
            <h3>{item.title}</h3>
            <p className="muted">{item.description}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="section" id="how" data-testid="how-it-works">
      <div className="section-head">
        <h2>Как это работает</h2>
        <p className="muted">Три шага, чтобы выйти на поле.</p>
      </div>
      <div className="steps">
        {steps.map((item, index) => (
          <div key={item.title} className="card step" data-testid={`step-${index + 1}`}>
            <span className="step-number">{index + 1}</span>
            <div>
              <h3>{item.title}</h3>
              <p className="muted">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>

    <section className="section" id="stats" data-testid="stats">
      <div className="section-head">
        <h2>Превью статистики игрока</h2>
        <p className="muted">Чистые карточки с важными цифрами.</p>
      </div>
      <div className="stats-cards">
        {stats.map((item) => (
          <div key={item.label} className="card stat-card" data-testid={`stat-${item.label}`}>
            <p className="muted">{item.label}</p>
            <p className="stat-value">{item.value}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="cta" data-testid="cta">
      <div className="cta-card">
        <h2>Начни играть уже сегодня</h2>
        <p className="muted">Присоединяйся к тысячам игроков, которые растут с Footbool.</p>
        <Link className="btn primary large" to="/contacts" data-testid="cta-primary">
          Зарегистрироваться
        </Link>
      </div>
    </section>
  </>
)

const positions = [
  { key: 'Вратарь', label: 'Лучший вратарь сезона' },
  { key: 'Защитник', label: 'Лучший защитник сезона' },
  { key: 'Полузащитник', label: 'Лучший полузащитник сезона' },
  { key: 'Нападающий', label: 'Лучший нападающий сезона' },
]

const FeaturedPlayers = () => {
  const [tick, setTick] = useState(0)

  const playersByRole = useMemo(() => {
    const all = listUsers()
    const grouped = {}
    positions.forEach((p) => {
      grouped[p.key] = all.filter((u) => u.position === p.key)
    })
    return grouped
  }, [])

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 10 * 60 * 1000) // каждые 10 минут
    return () => clearInterval(id)
  }, [])

  return (
    <section className="section" data-testid="featured-players">
      <div className="section-head">
        <h2>Игроки сезона</h2>
        <p className="muted">Карточки обновляются каждые 10 минут из списка зарегистрированных.</p>
      </div>
      <div className="grid-4">
        {positions.map((pos, idx) => {
          const list = playersByRole[pos.key] || []
          const player = list.length ? list[(tick + idx) % list.length] : null
          return (
            <div key={pos.key} className="card player-card" data-testid={`player-${pos.key}`}>
              <p className="muted">{pos.label}</p>
              {player ? (
                <>
                  <div className="player-photo">
                    {player.photo ? (
                      <img src={player.photo} alt={player.firstName} />
                    ) : (
                      <span>{player.firstName[0]}</span>
                    )}
                  </div>
                  <h3>{player.firstName} {player.lastName}</h3>
                  <p className="muted">{player.position}</p>
                </>
              ) : (
                <p className="muted">Пока нет игроков с этой позицией.</p>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default HomePage
