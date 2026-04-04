import { useState } from 'react'
import { addUser } from '../data/db'

const RegisterPage = () => {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim() || !password.trim()) {
      setStatus('Заполните имя, фамилию и пароль.')
      return
    }
    if (password.length < 6) {
      setStatus('Пароль должен быть не короче 6 символов.')
      return
    }
    addUser({ firstName: firstName.trim(), lastName: lastName.trim(), password: password.trim() })
    setStatus('Успешно сохранено!')
    setFirstName('')
    setLastName('')
    setPassword('')
  }

  return (
    <section className="section">
      <div className="section-head">
        <h2>Регистрация игрока</h2>
        <p className="muted">Имя, фамилия и пароль сохраняются в локальной базе (localStorage).</p>
      </div>

      <form className="card form" onSubmit={handleSubmit}>
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
          <span>Фамилия</span>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Иванов"
            required
          />
        </label>
        <label>
          <span>Пароль</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="не короче 6 символов"
            required
          />
        </label>
        <button type="submit" className="btn primary">
          Сохранить
        </button>
        <p className="muted">{status}</p>
      </form>
    </section>
  )
}

export default RegisterPage
