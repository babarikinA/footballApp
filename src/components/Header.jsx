import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

const Header = ({ authed, user, onLogout }) => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const avatarRef = useRef(null)
  const avatarLetter = user?.firstName ? user.firstName[0] : '•'

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])
  return (
    <header className="header">
      <div className="brand">
        <div className="dot" aria-hidden />
        <span>Footbool</span>
      </div>
      <nav className="nav">
        <Link className={pathname === '/' ? 'active' : ''} to="/">
          Главная
        </Link>
        <Link className={pathname === '/about' ? 'active' : ''} to="/about">
          О платформе
        </Link>
        <Link className={pathname === '/contacts' ? 'active' : ''} to="/contacts">
          Контакты
        </Link>
        <Link className={pathname === '/register' ? 'active' : ''} to="/register">
          Регистрация
        </Link>
      </nav>
      <div className="header-actions">
        {authed ? (
          <div className="avatar-wrap" ref={avatarRef}>
            <button
              type="button"
              className="avatar-btn"
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="true"
              aria-expanded={menuOpen}
            >
              {user?.photo ? <img src={user.photo} alt="Профиль" /> : <span>{avatarLetter}</span>}
            </button>
            {menuOpen && (
              <div className="dropdown">
                <div className="mini-profile">
                  {user?.photo ? (
                    <img src={user.photo} alt="Мини-аватар" />
                  ) : (
                    <span>{avatarLetter}</span>
                  )}
                  <div>
                    <p className="muted">{user?.firstName}</p>
                    <p className="muted">{user?.lastName}</p>
                  </div>
                </div>
                <Link
                  to="/admin"
                  className="dropdown-link"
                  onClick={() => setMenuOpen(false)}
                >
                  Мой кабинет
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    onLogout?.()
                    navigate('/')
                  }}
                >
                  Выйти из аккаунта
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link className="nav-cta" to="/admin">
            Войти в кабинет
          </Link>
        )}
      </div>
    </header>
  )
}

export default Header
