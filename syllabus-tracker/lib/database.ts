export interface Topic {
  id: string
  name: string
  completed: boolean
  dueDate: string
  completedBy?: string
  completedAt?: string
  description?: string
}

export interface Subject {
  id: string
  name: string
  icon: string
  color: string
  topics: Topic[]
}

export interface Activity {
  id: string
  topic: string
  subject: string
  completedBy: string
  date: string
  type: 'completed' | 'added' | 'updated'
}

export interface Alert {
  id: string
  topic: string
  subject: string
  daysOverdue: number
  severity: 'high' | 'medium' | 'low'
}

const SUBJECTS_KEY = 'syllabus_subjects'
const ACTIVITIES_KEY = 'syllabus_activities'

const defaultSubjects: Subject[] = [
  {
    id: "math",
    name: "Mathematics",
    icon: "Calculator",
    color: "#3b82f6",
    topics: [
      { id: "calc1", name: "Differential Calculus", completed: true, dueDate: "2024-01-15", completedBy: "John Doe", completedAt: "2024-01-15" },
      { id: "calc2", name: "Integral Calculus", completed: true, dueDate: "2024-01-20", completedBy: "Jane Smith", completedAt: "2024-01-18" },
      { id: "algebra", name: "Linear Algebra", completed: false, dueDate: "2024-01-25" },
      { id: "stats", name: "Statistics", completed: false, dueDate: "2024-02-01" },
    ]
  },
  {
    id: "physics",
    name: "Physics",
    icon: "Atom",
    color: "#10b981",
    topics: [
      { id: "mechanics", name: "Classical Mechanics", completed: true, dueDate: "2024-01-18", completedBy: "Mike Johnson", completedAt: "2024-01-18" },
      { id: "thermo", name: "Thermodynamics", completed: false, dueDate: "2024-01-28" },
      { id: "waves", name: "Wave Optics", completed: false, dueDate: "2024-02-05" },
    ]
  },
  {
    id: "chemistry",
    name: "Chemistry",
    icon: "FlaskConical",
    color: "#f59e0b",
    topics: [
      { id: "organic", name: "Organic Chemistry", completed: true, dueDate: "2024-01-22", completedBy: "Sarah Wilson", completedAt: "2024-01-22" },
      { id: "inorganic", name: "Inorganic Chemistry", completed: false, dueDate: "2024-01-30" },
      { id: "physical", name: "Physical Chemistry", completed: false, dueDate: "2024-02-08" },
    ]
  },
  {
    id: "english",
    name: "English Literature",
    icon: "PenTool",
    color: "#8b5cf6",
    topics: [
      { id: "shakespeare", name: "Shakespeare Studies", completed: true, dueDate: "2024-01-12", completedBy: "Emily Davis", completedAt: "2024-01-12" },
      { id: "poetry", name: "Modern Poetry", completed: true, dueDate: "2024-01-19", completedBy: "Robert Brown", completedAt: "2024-01-19" },
      { id: "prose", name: "Contemporary Prose", completed: false, dueDate: "2024-02-02" },
    ]
  }
]

export const database = {
  getSubjects: (): Subject[] => {
    const stored = localStorage.getItem(SUBJECTS_KEY)
    if (!stored) {
      localStorage.setItem(SUBJECTS_KEY, JSON.stringify(defaultSubjects))
      return defaultSubjects
    }
    return JSON.parse(stored)
  },

  saveSubjects: (subjects: Subject[]) => {
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects))
  },

  addTopic: (subjectId: string, topic: Omit<Topic, 'id'>) => {
    const subjects = database.getSubjects()
    const subject = subjects.find(s => s.id === subjectId)
    if (subject) {
      const newTopic = { ...topic, id: Date.now().toString() }
      subject.topics.push(newTopic)
      database.saveSubjects(subjects)
      database.addActivity({
        topic: topic.name,
        subject: subject.name,
        completedBy: 'System',
        type: 'added'
      })
    }
  },

  updateTopic: (subjectId: string, topicId: string, updates: Partial<Topic>) => {
    const subjects = database.getSubjects()
    const subject = subjects.find(s => s.id === subjectId)
    if (subject) {
      const topic = subject.topics.find(t => t.id === topicId)
      if (topic) {
        Object.assign(topic, updates)
        database.saveSubjects(subjects)
        
        if (updates.completed) {
          database.addActivity({
            topic: topic.name,
            subject: subject.name,
            completedBy: updates.completedBy || 'Unknown',
            type: 'completed'
          })
        }
      }
    }
  },

  deleteTopic: (subjectId: string, topicId: string) => {
    const subjects = database.getSubjects()
    const subject = subjects.find(s => s.id === subjectId)
    if (subject) {
      subject.topics = subject.topics.filter(t => t.id !== topicId)
      database.saveSubjects(subjects)
    }
  },

  getActivities: (): Activity[] => {
    const stored = localStorage.getItem(ACTIVITIES_KEY)
    return stored ? JSON.parse(stored) : []
  },

  addActivity: (activity: Omit<Activity, 'id' | 'date'>) => {
    const activities = database.getActivities()
    const newActivity: Activity = {
      ...activity,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0]
    }
    activities.unshift(newActivity)
    // Keep only last 50 activities
    if (activities.length > 50) {
      activities.splice(50)
    }
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities))
  },

  getAlerts: (): Alert[] => {
    const subjects = database.getSubjects()
    const alerts: Alert[] = []
    const today = new Date()

    subjects.forEach(subject => {
      subject.topics.forEach(topic => {
        if (!topic.completed) {
          const dueDate = new Date(topic.dueDate)
          const diffTime = today.getTime() - dueDate.getTime()
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          
          if (diffDays > 0) {
            alerts.push({
              id: `${subject.id}-${topic.id}`,
              topic: topic.name,
              subject: subject.name,
              daysOverdue: diffDays,
              severity: diffDays > 5 ? 'high' : diffDays > 2 ? 'medium' : 'low'
            })
          }
        }
      })
    })

    return alerts.sort((a, b) => b.daysOverdue - a.daysOverdue)
  }
}
