const STORAGE_KEY = 'footbool_users'
const VOTES_KEY = 'footbool_votes'
const RESP_KEY = 'footbool_vote_responses'
const GAMES_KEY = 'footbool_games'
const NOTIFY_KEY = 'footbool_notifications'

const read = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    console.error('Failed to read users', e)
    return []
  }
}

const write = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to write users', e)
  }
}

const hashPassword = (password) => {
  // Простое client-side хеширование для демо (не использовать в продакшене)
  try {
    return btoa(encodeURIComponent(password))
  } catch {
    return password
  }
}

export const listUsers = () => read()

export const addUser = ({ firstName, lastName, password }) => {
  const users = read()
  const newUser = {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    firstName,
    lastName,
    password: hashPassword(password),
    photo: null,
    position: null,
    age: null,
    createdAt: new Date().toISOString(),
  }
  users.push(newUser)
  write(users)
  return newUser
}

export const deleteUser = (id) => {
  const users = read().filter((u) => u.id !== id)
  write(users)
  return users
}

export const findUser = ({ firstName, password }) => {
  const users = read()
  const hashed = hashPassword(password)
  return users.find(
    (u) =>
      u.firstName.toLowerCase() === firstName.toLowerCase().trim() &&
      u.password === hashed,
  )
}

export const updateUserPhoto = (id, dataUrl) => {
  const users = read()
  const idx = users.findIndex((u) => u.id === id)
  if (idx === -1) return null
  users[idx] = { ...users[idx], photo: dataUrl }
  write(users)
  return users[idx]
}

export const updateUserProfile = (id, payload) => {
  const users = read()
  const idx = users.findIndex((u) => u.id === id)
  if (idx === -1) return null
  users[idx] = { ...users[idx], ...payload }
  write(users)
  return users[idx]
}

// --- Голосования ---
const readVotes = () => {
  try {
    const raw = localStorage.getItem(VOTES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const writeVotes = (data) => {
  localStorage.setItem(VOTES_KEY, JSON.stringify(data))
}

const readResponses = () => {
  try {
    const raw = localStorage.getItem(RESP_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

const writeResponses = (data) => {
  localStorage.setItem(RESP_KEY, JSON.stringify(data))
}

export const listVotes = () => readVotes()

export const addVote = (vote) => {
  const votes = readVotes()
  const newVote = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...vote }
  votes.unshift(newVote)
  writeVotes(votes)
  return newVote
}

export const latestVote = () => readVotes()[0] || null

export const listResponses = (voteId) => {
  const all = readResponses()
  return all[voteId] || []
}

export const userResponded = (voteId, userId) => {
  const responses = listResponses(voteId)
  return responses.some((r) => r.userId === userId)
}

export const addVoteResponse = (voteId, user, decision) => {
  const all = readResponses()
  const list = all[voteId] || []
  const existingIdx = list.findIndex((r) => r.userId === user.id)
  const item = {
    userId: user.id,
    name: `${user.firstName} ${user.lastName}`.trim(),
    decision, // 'yes' | 'no'
    at: new Date().toISOString(),
  }
  if (existingIdx >= 0) {
    list[existingIdx] = item
  } else {
    list.push(item)
  }
  all[voteId] = list
  writeResponses(all)
  return list
}

export const deleteVoteWithReason = (voteId, reason) => {
  const votes = readVotes()
  const target = votes.find((v) => v.id === voteId)
  const restVotes = votes.filter((v) => v.id !== voteId)
  writeVotes(restVotes)

  const responses = readResponses()
  delete responses[voteId]
  writeResponses(responses)

  const games = readGames()
  const remainingGames = games.filter((g) => g.voteId !== voteId)
  const removedGames = games.filter((g) => g.voteId === voteId)
  writeGames(remainingGames)

  if (target) {
    const message = `Голосование «${target.title}» отменено: ${reason || 'без причины'}`
    const affected = [...new Set(removedGames.map((g) => g.userId))]
    affected.forEach((uid) => addNotification(uid, message))
  }

  return restVotes
}

// --- Игры (для истории) ---
const readGames = () => {
  try {
    const raw = localStorage.getItem(GAMES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const writeGames = (data) => {
  localStorage.setItem(GAMES_KEY, JSON.stringify(data))
}

export const listGames = (userId) => {
  const games = readGames()
  const now = new Date()
  let changed = false
  const updated = games.map((g) => {
    if (g.status === 'active' && g.date && new Date(g.date) < now) {
      changed = true
      return { ...g, status: 'archived' }
    }
    return g
  })
  if (changed) writeGames(updated)
  return updated.filter((g) => g.userId === userId)
}

export const addGameFromVote = (vote, userId) => {
  const games = readGames()
  const game = {
    id: crypto.randomUUID(),
    userId,
    organizer: 'Админ',
    date: vote.date,
    location: vote.location || vote.field || '—',
    time: `${vote.timeStart || ''}${vote.timeEnd ? ' - ' + vote.timeEnd : ''}`,
    status: 'active',
    createdAt: new Date().toISOString(),
    voteId: vote.id,
  }
  games.push(game)
  writeGames(games)
  return game
}

export const archiveGame = (gameId) => {
  const games = readGames().map((g) => (g.id === gameId ? { ...g, status: 'archived' } : g))
  writeGames(games)
}

// --- Уведомления ---
const readNotifications = () => {
  try {
    const raw = localStorage.getItem(NOTIFY_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

const writeNotifications = (data) => {
  localStorage.setItem(NOTIFY_KEY, JSON.stringify(data))
}

export const listNotifications = (userId) => {
  const all = readNotifications()
  return all[userId] || []
}

export const addNotification = (userId, message) => {
  const all = readNotifications()
  const list = all[userId] || []
  list.unshift({
    id: crypto.randomUUID(),
    message,
    createdAt: new Date().toISOString(),
  })
  all[userId] = list.slice(0, 20) // ограничим до 20
  writeNotifications(all)
  return all[userId]
}

export const deleteGameWithReason = (gameId, reason) => {
  const games = readGames()
  const target = games.find((g) => g.id === gameId)
  const rest = games.filter((g) => g.id !== gameId)
  writeGames(rest)
  if (target) {
    addNotification(
      target.userId,
      `Игра от ${target.date} в ${target.location || 'локации не указано'} отменена: ${reason || 'без причины'}`,
    )
  }
  return { removed: target, games: rest }
}
