export const demoMatches = [
  { opponent: 'Street United', date: '2026-04-10', time: '19:00', place: 'Манеж №2' },
  { opponent: 'City Five', date: '2026-04-14', time: '20:30', place: 'Двор А. Козлова' },
  { opponent: 'Metro FC', date: '2026-04-18', time: '18:00', place: 'Стадион Север' },
]

export const demoFriends = ['Андрей', 'Сергей', 'Дима', 'Лиза']

export const demoTeam = {
  name: 'Footbool Squad',
  role: 'Полузащита',
  number: 8,
  joined: '2025-09-12',
}

export const makeStatsForUser = (user) => {
  const seed = user?.id?.length || 7
  return {
    matches: 10 + (seed % 8),
    goals: 5 + (seed % 6),
    assists: 3 + (seed % 5),
  }
}
