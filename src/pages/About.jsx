import { Link } from 'react-router-dom'
import HeroVisual from '../components/HeroVisual'

const AboutPage = () => (
  <section className="section">
    <div className="section-head">
      <h2>О платформе</h2>
      <p className="muted">
        Footbool создана игроками для игроков: от поиска матчей до детальной аналитики после игры.
      </p>
    </div>
    <div className="about-grid">
      <div className="card about-card">
        <h3>Зачем это нужно</h3>
        <p className="muted">Быстро собирать состав, видеть кто идёт, и вести статистику без таблиц и чатов.</p>
      </div>
      <div className="card about-card">
        <h3>Что внутри</h3>
        <ul className="list">
          <li>Поиск и бронирование локальных игр</li>
          <li>Личный профиль игрока</li>
          <li>Голы, передачи, матчи — автоматически</li>
          <li>Командные рейтинги и сравнения</li>
        </ul>
      </div>
      <div className="card about-card">
        <h3>Для кого</h3>
        <p className="muted">
          Любители, корпоративные лиги, дворовые команды и все, кто хочет прозрачных цифр по игре.
        </p>
      </div>
    </div>

    <div style={{ marginTop: '32px', display: 'grid', gap: '20px' }}>
      <HeroVisual showMetrics={false} />
      <div className="cta-inline">
        <Link className="btn primary" to="/contacts">
          Связаться
        </Link>
        <Link className="btn ghost" to="/">
          На главную
        </Link>
      </div>
    </div>
  </section>
)

export default AboutPage
