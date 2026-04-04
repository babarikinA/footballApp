import { Link } from 'react-router-dom'

const ContactsPage = () => (
  <section className="section">
    <div className="section-head">
      <h2>Контакты</h2>
      <p className="muted">Есть вопросы — пишите, поможем подключить команду.</p>
    </div>
    <div className="contact-card card">
      <div>
        <p className="muted">Почта</p>
        <h3>support@footbool.app</h3>
      </div>
      <div>
        <p className="muted">Соцсети</p>
        <p className="muted">Telegram · Instagram · X</p>
      </div>
      <div style={{ display: 'grid', gap: '8px' }}>
        <Link className="btn primary" to="/contacts">
          Написать нам
        </Link>
        <Link className="btn ghost" to="/">
          Вернуться на главную
        </Link>
      </div>
    </div>
  </section>
)

export default ContactsPage
