import { useEffect, useState } from 'react'
import {
  findUser,
  updateUserPhoto,
  updateUserProfile,
  listUsers,
  deleteUser,
  addVote,
  latestVote,
  addVoteResponse,
  userResponded,
  listResponses,
  listVotes,
  addGameFromVote,
  listGames,
  deleteGameWithReason,
  listNotifications,
} from '../data/db'

const initialVote = {
  title: 'Футбольная игра',
  date: '',
  timeStart: '',
  timeEnd: '',
  price: '',
  players: '8x8',
  prize: '',
  location: '',
  field: '',
  light: 'Есть',
  locker: 'Есть душ',
}

const AdminPage = ({ onAuth }) => {
  const [firstName, setFirstName] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [uploadPreview, setUploadPreview] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [allUsers, setAllUsers] = useState([])
  const [voteForm, setVoteForm] = useState(initialVote)
  const [voteStatus, setVoteStatus] = useState('')
  const [votes, setVotes] = useState([])
  const [currentVote, setCurrentVote] = useState(null)
  const [responses, setResponses] = useState([])
  const [games, setGames] = useState([])
  const [notifications, setNotifications] = useState([])
  const [position, setPosition] = useState('')
  const [age, setAge] = useState('')

  // Восстановление сессии
  useEffect(() => {
    const raw = localStorage.getItem('footbool_session')
    if (raw) {
      try {
        const saved = JSON.parse(raw)
        const hydrate = () => {
          setUser(saved)
          setIsAdmin(saved.id === 'admin')
          setActiveTab(saved.id === 'admin' ? 'profile' : 'overview')
          if (saved.id === 'admin') {
            setAllUsers(listUsers())
            setVotes(listVotes())
          } else {
            const vote = latestVote()
            setCurrentVote(vote)
            if (vote) setResponses(listResponses(vote.id))
            setGames(listGames(saved.id))
            setNotifications(listNotifications(saved.id))
          }
        }
        // декферим в микротаску, чтобы не ругался eslint
        queueMicrotask(hydrate)
      } catch {
        localStorage.removeItem('footbool_session')
      }
    }
  }, [])

  useEffect(() => {
    if (user && onAuth) onAuth(user)
    if (user) localStorage.setItem('footbool_session', JSON.stringify(user))
  }, [user, onAuth])

  useEffect(() => {
    if (user) {
      queueMicrotask(() => {
        setPosition(user.position || '')
        setAge(user.age || '')
      })
    }
  }, [user])

  const yesCount = responses.filter((r) => r.decision === 'yes').length
  const noCount = responses.filter((r) => r.decision === 'no').length

  const handleLogin = (e) => {
    e.preventDefault()
    const adminCreds =
      firstName.trim().toLowerCase() === 'admin' && password.trim() === 'babasha'
    if (adminCreds) {
      const adminUser = {
        id: 'admin',
        firstName: 'admin',
        lastName: '',
        createdAt: new Date().toISOString(),
      }
      setIsAdmin(true)
      setUser(adminUser)
      setError('')
      setActiveTab('profile')
      setAllUsers(listUsers())
      setVotes(listVotes())
      if (onAuth) onAuth(adminUser)
      return
    }

    const found = findUser({ firstName, password })
    if (found) {
      setUser(found)
      setIsAdmin(false)
      setError('')
      setActiveTab('overview')
      const vote = latestVote()
      setCurrentVote(vote)
      if (vote) setResponses(listResponses(vote.id))
      setGames(listGames(found.id))
      setNotifications(listNotifications(found.id))
      if (onAuth) onAuth(found)
    } else {
      setError('Пользователь не найден или пароль неверный.')
    }
  }

  const handlePhotoSave = async (e) => {
    e.preventDefault()
    if (!uploadPreview) return
    const updated = updateUserPhoto(user.id, uploadPreview)
    if (updated) {
      setUser(updated)
      setUploadPreview('')
    }
  }

  const handleProfileSave = (e) => {
    e.preventDefault()
    if (!user) return
    const updated = updateUserProfile(user.id, {
      position: position || null,
      age: age ? Number(age) : null,
    })
    if (updated) setUser(updated)
  }

  const handleDeleteUser = (id) => {
    const rest = deleteUser(id)
    setAllUsers(rest)
  }

  const handleCreateVote = (e) => {
    e.preventDefault()
    const newVote = addVote(voteForm)
    setVotes(listVotes())
    setVoteStatus('Голосование отправлено пользователям.')
    setVoteForm(initialVote)
    setResponses(listResponses(newVote.id))
  }

  const handleUserDecision = (decision) => {
    if (!currentVote || !user) return
    addVoteResponse(currentVote.id, user, decision)
    const resp = listResponses(currentVote.id)
    setResponses(resp)
    if (decision === 'yes') {
      addGameFromVote(currentVote, user.id)
      setGames(listGames(user.id))
    }
  }

  const handleDeleteGameAdmin = (gameId) => {
    const reason = window.prompt('Укажите причину отмены игры') || 'Без причины'
    deleteGameWithReason(gameId, reason)
    setVotes(listVotes())
  }

  const hasResponded = currentVote && user ? userResponded(currentVote.id, user.id) : false

  if (!user) {
    return (
      <section className="section">
        <div className="section-head">
          <h2>Личный кабинет</h2>
          <p className="muted">Вход по имени и паролю, указанным при регистрации.</p>
        </div>
        <form className="card form" onSubmit={handleLogin}>
          <label>
            <span>Имя</span>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Иван"
              required
            />
          </label>
          <label>
            <span>Пароль</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ваш пароль"
              required
            />
          </label>
          <button className="btn primary" type="submit">
            Войти
          </button>
          {error && <p className="muted" style={{ color: '#c0392b' }}>{error}</p>}
        </form>
      </section>
    )
  }

  return (
    <section className="section">
      <div className="section-head">
        <h2>Привет, {user.firstName}!</h2>
        <p className="muted">
          {isAdmin ? 'Админка: управление и рассылка голосований.' : 'Это твой кабинет. Данные связаны с твоей регистрацией.'}
        </p>
      </div>

      <div className="tabs">
        {isAdmin ? (
          <>
            <button
              className={`btn ${activeTab === 'profile' ? 'primary' : 'ghost'} small`}
              onClick={() => setActiveTab('profile')}
            >
              Настройки профиля
            </button>
            <button
              className={`btn ${activeTab === 'users' ? 'primary' : 'ghost'} small`}
              onClick={() => {
                setActiveTab('users')
                setAllUsers(listUsers())
              }}
            >
              Пользователи
            </button>
            <button
              className={`btn ${activeTab === 'votes' ? 'primary' : 'ghost'} small`}
              onClick={() => {
                setActiveTab('votes')
                setVotes(listVotes())
              }}
            >
              Голосования
            </button>
            <button
              className={`btn ${activeTab === 'games' ? 'primary' : 'ghost'} small`}
              onClick={() => {
                setActiveTab('games')
                setVotes(listVotes())
              }}
            >
              Игры
            </button>
          </>
        ) : (
          <>
            <button
              className={`btn ${activeTab === 'overview' ? 'primary' : 'ghost'} small`}
              onClick={() => setActiveTab('overview')}
            >
              Обзор
            </button>
            <button
              className={`btn ${activeTab === 'settings' ? 'primary' : 'ghost'} small`}
              onClick={() => setActiveTab('settings')}
            >
              Настройки аккаунта
            </button>
          </>
        )}
      </div>

      {isAdmin && activeTab === 'profile' && (
        <div className="card form" style={{ marginTop: '16px' }}>
          <h3>Профиль администратора</h3>
          <p className="muted">Добавь аватар администратора (локально).</p>
          <div className="avatar large">
            {uploadPreview || user.photo ? (
              <img src={uploadPreview || user.photo} alt="Аватар превью" />
            ) : (
              <span>{user.firstName[0]}</span>
            )}
          </div>
          <label>
            <span>Фото профиля</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = (ev) => setUploadPreview(ev.target?.result || '')
                reader.readAsDataURL(file)
              }}
            />
          </label>
          <button className="btn primary" onClick={handlePhotoSave} disabled={!uploadPreview}>
            Сохранить фото
          </button>
        </div>
      )}

      {isAdmin && activeTab === 'users' && (
        <div className="card table-card" style={{ marginTop: '8px' }}>
          <div className="table-head">
            <span>Имя</span>
            <span>Фамилия</span>
            <span>Дата</span>
            <span></span>
          </div>
          {allUsers.length === 0 && <p className="muted">Пока пусто.</p>}
          {allUsers.map((u) => (
            <div key={u.id} className="table-row">
              <span>{u.firstName}</span>
              <span>{u.lastName}</span>
              <span>{new Date(u.createdAt).toLocaleString()}</span>
              <button className="btn ghost small" onClick={() => handleDeleteUser(u.id)}>
                Удалить
              </button>
            </div>
          ))}
        </div>
      )}

      {isAdmin && activeTab === 'votes' && (
        <form className="card form" style={{ marginTop: '12px' }} onSubmit={handleCreateVote}>
            <h3>Новое голосование</h3>
            <label>
              <span>Название</span>
              <input
                value={voteForm.title}
                onChange={(e) => setVoteForm({ ...voteForm, title: e.target.value })}
                placeholder="Футбольная игра"
                required
              />
            </label>
            <label>
              <span>Дата</span>
              <input
                type="date"
                value={voteForm.date}
                onChange={(e) => setVoteForm({ ...voteForm, date: e.target.value })}
                required
              />
            </label>
            <label>
              <span>Время (старт - конец)</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <input
                  type="time"
                  value={voteForm.timeStart}
                  onChange={(e) => setVoteForm({ ...voteForm, timeStart: e.target.value })}
                  required
                />
                <input
                  type="time"
                  value={voteForm.timeEnd}
                  onChange={(e) => setVoteForm({ ...voteForm, timeEnd: e.target.value })}
                  required
                />
              </div>
            </label>
            <label>
              <span>Цена</span>
              <input
                value={voteForm.price}
                onChange={(e) => setVoteForm({ ...voteForm, price: e.target.value })}
                placeholder="20 BYN"
              />
            </label>
            <label>
              <span>Количество игроков</span>
              <input
                value={voteForm.players}
                onChange={(e) => setVoteForm({ ...voteForm, players: e.target.value })}
                placeholder="8x8"
              />
            </label>
            <label>
              <span>Приз</span>
              <input
                value={voteForm.prize}
                onChange={(e) => setVoteForm({ ...voteForm, prize: e.target.value })}
                placeholder="Мяч/кубок"
              />
            </label>
            <label>
              <span>Локация</span>
              <input
                value={voteForm.location}
                onChange={(e) => setVoteForm({ ...voteForm, location: e.target.value })}
                placeholder="Манеж, ул. Спортивная 5"
                required
              />
            </label>
            <label>
              <span>Газон / площадка</span>
              <input
                value={voteForm.field}
                onChange={(e) => setVoteForm({ ...voteForm, field: e.target.value })}
                placeholder="Манеж №2"
              />
            </label>
            <label>
              <span>Освещение</span>
              <input
                value={voteForm.light}
                onChange={(e) => setVoteForm({ ...voteForm, light: e.target.value })}
                placeholder="Есть"
              />
            </label>
            <label>
              <span>Раздевалка/душ</span>
              <input
                value={voteForm.locker}
                onChange={(e) => setVoteForm({ ...voteForm, locker: e.target.value })}
                placeholder="Есть душ"
              />
            </label>
            <button className="btn primary" type="submit">
              Создать и отправить
            </button>
            {voteStatus && <p className="muted">{voteStatus}</p>}
          </form>
      )}

      {isAdmin && activeTab === 'games' && (
        <div className="card table-card" style={{ marginTop: '8px' }}>
          <div className="table-head">
            <span>Название</span>
            <span>Дата</span>
            <span>Локация</span>
            <span>Игроки</span>
            <span>Да/Нет</span>
            <span></span>
          </div>
          {votes.length === 0 && <p className="muted">Голосований пока нет.</p>}
          {votes.map((v) => {
            const resp = listResponses(v.id)
            const yes = resp.filter((r) => r.decision === 'yes').length
            const no = resp.filter((r) => r.decision === 'no').length
            return (
              <div key={v.id} className="table-row">
                <span>{v.title}</span>
                <span>{v.date}</span>
                <span>{v.location || '—'}</span>
                <span>{v.players}</span>
                <span>{yes}/{no}</span>
                <button className="btn ghost small" onClick={() => handleDeleteGameAdmin(v.id)}>
                  Отменить
                </button>
              </div>
            )
          })}
        </div>
      )}

      {!isAdmin && activeTab === 'overview' && (
        <>
          {currentVote && (
            <div className="card" style={{ marginBottom: '16px' }}>
              <h3>Новое голосование от админа</h3>
              <p className="muted">{currentVote.title}</p>
              <p className="muted">
                {currentVote.date} · {currentVote.timeStart} - {currentVote.timeEnd}
              </p>
              <p className="muted">
                Цена: {currentVote.price || '—'} · Игроки: {currentVote.players}
              </p>
              <p className="muted">
                Локация: {currentVote.location || '—'} · Газон: {currentVote.field || '—'}
              </p>
              <p className="muted">
                Освещение: {currentVote.light || '—'} · Раздевалка: {currentVote.locker || '—'}
              </p>
              <p className="muted">Приняли: {yesCount} · Отклонили: {noCount}</p>
              {!hasResponded ? (
                <div className="cta-inline">
                  <button className="btn primary" onClick={() => handleUserDecision('yes')}>
                    Принять
                  </button>
                  <button className="btn ghost" onClick={() => handleUserDecision('no')}>
                    Отклонить
                  </button>
                </div>
              ) : (
                <p className="muted">Ответ отправлен. Спасибо!</p>
              )}
            </div>
          )}

          {notifications.length > 0 && (
            <div className="card" style={{ marginBottom: '16px' }}>
              <h3>Уведомления</h3>
              <ul className="muted" style={{ paddingLeft: '18px' }}>
                {notifications.map((n) => (
                  <li key={n.id}>{n.message}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid-3">
            <div className="card profile-card">
              <div className="avatar">
                {user.photo ? <img src={user.photo} alt="Аватар" /> : <span>{user.firstName[0]}</span>}
              </div>
              <h3>Профиль</h3>
              <p className="muted">Имя: {user.firstName}</p>
              <p className="muted">Фамилия: {user.lastName}</p>
              <p className="muted">Регистрация: {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>

            <div className="card">
              <h3>Следующие матчи</h3>
              <p className="muted">Получай приглашения от админа и подтверждай участие.</p>
            </div>

            <div className="card">
              <h3>Статистика</h3>
              <p className="muted">Матчи: {games.filter((g) => g.status === 'archived').length}</p>
            </div>
          </div>

          <h3 style={{ marginTop: '16px' }}>Таблица игр</h3>
          <div className="card table-card">
            <div className="table-head">
              <span>Организатор</span>
              <span>Дата</span>
              <span>Локация</span>
              <span>Время</span>
              <span>Статус</span>
            </div>
            {games.length === 0 && <p className="muted">Пока нет принятых игр.</p>}
            {games.map((g) => (
              <div key={g.id} className="table-row">
                <span>{g.organizer}</span>
                <span>{g.date}</span>
                <span>{g.location}</span>
                <span>{g.time}</span>
                <span>{g.status}</span>
              </div>
            ))}
          </div>

        </>
      )}

      {!isAdmin && activeTab === 'settings' && (
        <div className="card form" style={{ marginTop: '16px' }}>
          <h3>Настройки аккаунта</h3>
          <p className="muted">Добавь фото профиля. Хранится локально в браузере.</p>
          <div className="avatar large">
            {uploadPreview || user.photo ? (
              <img src={uploadPreview || user.photo} alt="Аватар превью" />
            ) : (
              <span>{user.firstName[0]}</span>
            )}
          </div>
          <label>
            <span>Фото профиля</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = (ev) => setUploadPreview(ev.target?.result || '')
                reader.readAsDataURL(file)
              }}
            />
          </label>
          <button className="btn primary" onClick={handlePhotoSave} disabled={!uploadPreview}>
            Сохранить фото
          </button>

          <label>
            <span>Позиция</span>
            <select value={position} onChange={(e) => setPosition(e.target.value)}>
              <option value="">Не выбрано</option>
              <option value="Вратарь">Вратарь</option>
              <option value="Защитник">Защитник</option>
              <option value="Полузащитник">Полузащитник</option>
              <option value="Нападающий">Нападающий</option>
            </select>
          </label>

          <label>
            <span>Возраст</span>
            <input
              type="number"
              min="10"
              max="70"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Например, 25"
            />
          </label>

          <button className="btn primary" onClick={handleProfileSave}>
            Сохранить профиль
          </button>
        </div>
      )}
    </section>
  )
}

export default AdminPage
