export interface User {
  id: string
  name: string
  email: string
  role: 'faculty' | 'student'
  avatar?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

const STORAGE_KEY = 'syllabus_auth'

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock users
    const users: Record<string, User> = {
      'faculty@example.com': {
        id: '1',
        name: 'Dr. Sarah Johnson',
        email: 'faculty@example.com',
        role: 'faculty',
        avatar: '/placeholder.svg?height=32&width=32'
      },
      'student@example.com': {
        id: '2',
        name: 'John Smith',
        email: 'student@example.com',
        role: 'student',
        avatar: '/placeholder.svg?height=32&width=32'
      }
    }

    const user = users[email]
    if (!user || password !== 'password') {
      throw new Error('Invalid credentials')
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    return user
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY)
  },

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  }
}
