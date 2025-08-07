"use client"

import { useState, useEffect } from "react"
import { BookOpen, Calculator, Atom, FlaskConical, Globe, PenTool, Bell, Settings, LogOut, Plus, FolderSyncIcon as Sync, CheckCircle2, Clock, AlertTriangle, Users, GraduationCap, ChevronDown, ChevronRight, Edit, Trash2, Download, Home } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

import { LoginForm } from "@/components/login-form"
import { TopicForm } from "@/components/topic-form"
import { ExportDialog } from "@/components/export-dialog"
import { AlertsPage } from "@/components/alerts-page"
import { SettingsPage } from "@/components/settings-page"
import { NotificationSystem, Notification } from "@/components/notification-system"
import { authService, User } from "@/lib/auth"
import { database, Subject, Topic, Activity, Alert } from "@/lib/database"

const iconMap = {
  Calculator,
  Atom,
  FlaskConical,
  PenTool,
  BookOpen
}

type CurrentPage = 'dashboard' | 'alerts' | 'settings'

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [currentPage, setCurrentPage] = useState<CurrentPage>('dashboard')
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isFacultyView, setIsFacultyView] = useState(true)
  const [expandedSubjects, setExpandedSubjects] = useState<string[]>(["math"])
  const [isTopicFormOpen, setIsTopicFormOpen] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [editingTopic, setEditingTopic] = useState<{ subjectId: string; topic: Topic } | undefined>()
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      setIsFacultyView(currentUser.role === 'faculty')
      loadData()
    }
  }, [])

  const loadData = () => {
    setSubjects(database.getSubjects())
    setActivities(database.getActivities())
    setAlerts(database.getAlerts())
  }

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const newNotification = {
      ...notification,
      id: Date.now().toString(),
      duration: notification.duration || 5000
    }
    setNotifications(prev => [...prev, newNotification])
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser)
    setIsFacultyView(loggedInUser.role === 'faculty')
    loadData()
    addNotification({
      type: 'success',
      title: 'Welcome!',
      message: `Logged in as ${loggedInUser.name}`
    })
  }

  const handleLogout = () => {
    authService.logout()
    setUser(null)
    setCurrentPage('dashboard')
    addNotification({
      type: 'info',
      title: 'Logged out',
      message: 'You have been successfully logged out'
    })
  }

  const toggleSubject = (subjectId: string) => {
    setExpandedSubjects(prev => 
      prev.includes(subjectId) 
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    )
  }

  const handleTopicToggle = (subjectId: string, topicId: string, completed: boolean) => {
    if (!user) return

    const updates: Partial<Topic> = {
      completed,
      completedBy: completed ? user.name : undefined,
      completedAt: completed ? new Date().toISOString().split('T')[0] : undefined
    }

    database.updateTopic(subjectId, topicId, updates)
    loadData()

    const subject = subjects.find(s => s.id === subjectId)
    const topic = subject?.topics.find(t => t.id === topicId)

    if (topic) {
      addNotification({
        type: completed ? 'success' : 'info',
        title: completed ? 'Topic Completed!' : 'Topic Unmarked',
        message: `${topic.name} has been ${completed ? 'marked as complete' : 'unmarked'}`
      })
    }
  }

  const handleAddTopic = (subjectId: string, topic: Omit<Topic, 'id'>) => {
    database.addTopic(subjectId, topic)
    loadData()
    addNotification({
      type: 'success',
      title: 'Topic Added',
      message: `${topic.name} has been added to the syllabus`
    })
  }

  const handleEditTopic = (subjectId: string, topic: Topic) => {
    setEditingTopic({ subjectId, topic })
    setIsTopicFormOpen(true)
  }

  const handleUpdateTopic = (subjectId: string, updatedTopic: Omit<Topic, 'id'>) => {
    if (editingTopic) {
      database.updateTopic(subjectId, editingTopic.topic.id, updatedTopic)
      loadData()
      setEditingTopic(undefined)
      addNotification({
        type: 'success',
        title: 'Topic Updated',
        message: `${updatedTopic.name} has been updated`
      })
    }
  }

  const handleDeleteTopic = (subjectId: string, topicId: string) => {
    const subject = subjects.find(s => s.id === subjectId)
    const topic = subject?.topics.find(t => t.id === topicId)
    
    database.deleteTopic(subjectId, topicId)
    loadData()
    
    if (topic) {
      addNotification({
        type: 'warning',
        title: 'Topic Deleted',
        message: `${topic.name} has been removed from the syllabus`
      })
    }
  }

  const handleSync = () => {
    addNotification({
      type: 'info',
      title: 'Syncing...',
      message: 'Synchronizing with class data'
    })

    setTimeout(() => {
      loadData()
      addNotification({
        type: 'success',
        title: 'Sync Complete',
        message: 'Successfully synchronized with class data'
      })
    }, 2000)
  }

  const handleMarkAllComplete = () => {
    let completedCount = 0
    subjects.forEach(subject => {
      subject.topics.forEach(topic => {
        if (!topic.completed) {
          database.updateTopic(subject.id, topic.id, {
            completed: true,
            completedBy: user?.name,
            completedAt: new Date().toISOString().split('T')[0]
          })
          completedCount++
        }
      })
    })
    
    if (completedCount > 0) {
      loadData()
      addNotification({
        type: 'success',
        title: 'Bulk Update Complete',
        message: `Marked ${completedCount} topics as complete`
      })
    } else {
      addNotification({
        type: 'info',
        title: 'No Updates Needed',
        message: 'All topics are already completed'
      })
    }
  }

  const handleResolveAlert = (alertId: string) => {
    // Find the alert and mark corresponding topic as complete
    const alert = alerts.find(a => a.id === alertId)
    if (alert && user) {
      const subject = subjects.find(s => s.name === alert.subject)
      if (subject) {
        const topic = subject.topics.find(t => t.name === alert.topic)
        if (topic) {
          database.updateTopic(subject.id, topic.id, {
            completed: true,
            completedBy: user.name,
            completedAt: new Date().toISOString().split('T')[0]
          })
          loadData()
          addNotification({
            type: 'success',
            title: 'Alert Resolved',
            message: `${alert.topic} has been marked as complete`
          })
        }
      }
    }
  }

  const handleDismissAlert = (alertId: string) => {
    // In a real app, you'd update the database to dismiss the alert
    addNotification({
      type: 'info',
      title: 'Alert Dismissed',
      message: 'Alert has been dismissed'
    })
  }

  const handleUpdateProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      // In a real app, you'd save this to the database
      localStorage.setItem('syllabus_auth', JSON.stringify(updatedUser))
    }
  }

  if (!user) {
    return <LoginForm onLogin={handleLogin} />
  }

  const overallProgress = Math.round(subjects.reduce((acc, subject) => {
    const completedTopics = subject.topics.filter(topic => topic.completed).length
    const progress = subject.topics.length > 0 ? (completedTopics / subject.topics.length) * 100 : 0
    return acc + progress
  }, 0) / subjects.length)

  const chartData = subjects.map(subject => {
    const completedTopics = subject.topics.filter(topic => topic.completed).length
    const progress = subject.topics.length > 0 ? (completedTopics / subject.topics.length) * 100 : 0
    return {
      name: subject.name,
      value: progress,
      color: subject.color
    }
  })

  const chartConfig = {
    value: {
      label: "Progress",
    },
  } satisfies ChartConfig

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'alerts':
        return (
          <AlertsPage 
            alerts={alerts} 
            onResolveAlert={handleResolveAlert}
            onDismissAlert={handleDismissAlert}
          />
        )
      case 'settings':
        return (
          <SettingsPage 
            user={user} 
            onUpdateProfile={handleUpdateProfile}
            onShowNotification={(message, type) => addNotification({ title: type === 'success' ? 'Success' : 'Error', message, type })}
          />
        )
      default:
        return (
          <>
            {/* View Toggle and Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-4 w-4 text-gray-500" />
                  <Label htmlFor="view-toggle" className="text-sm font-medium">
                    Student View
                  </Label>
                  <Switch
                    id="view-toggle"
                    checked={isFacultyView}
                    onCheckedChange={setIsFacultyView}
                    disabled={user.role === 'student'}
                  />
                  <Users className="h-4 w-4 text-gray-500" />
                  <Label htmlFor="view-toggle" className="text-sm font-medium">
                    Faculty View
                  </Label>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setIsExportDialogOpen(true)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
                {isFacultyView && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setIsTopicFormOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Topic
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={handleSync}>
                  <Sync className="h-4 w-4 mr-2" />
                  Sync with Class
                </Button>
                <Button size="sm" onClick={handleMarkAllComplete}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark All Complete
                </Button>
              </div>
            </div>

            {/* Alerts Section */}
            {alerts.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="h-5 w-5" />
                    Syllabus Alerts ({alerts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {alerts.slice(0, 3).map((alert) => (
                      <div key={alert.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                        <div className="flex items-center gap-3">
                          <div className={`h-2 w-2 rounded-full ${alert.severity === 'high' ? 'bg-red-500' : alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-orange-500'}`} />
                          <div>
                            <p className="font-medium text-gray-900">{alert.topic}</p>
                            <p className="text-sm text-gray-600">{alert.subject}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'}>
                            {alert.daysOverdue} days overdue
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResolveAlert(alert.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            Resolve
                          </Button>
                        </div>
                      </div>
                    ))}
                    {alerts.length > 3 && (
                      <div className="text-center pt-2">
                        <Button 
                          variant="link" 
                          onClick={() => setCurrentPage('alerts')}
                          className="text-red-600 hover:text-red-700"
                        >
                          View all {alerts.length} alerts →
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Progress Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Overall Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Overall Progress</CardTitle>
                  <CardDescription>Total syllabus completion</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{overallProgress}%</div>
                      <p className="text-sm text-gray-600">Complete</p>
                    </div>
                    <Progress value={overallProgress} className="h-3" />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>0%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Subject-wise Breakdown Chart */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Subject-wise Progress</CardTitle>
                  <CardDescription>Completion breakdown by subject</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-8">
                    <div className="flex-1">
                      <ChartContainer config={chartConfig} className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={chartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                    <div className="space-y-3">
                      {subjects.map((subject) => {
                        const completedTopics = subject.topics.filter(topic => topic.completed).length
                        const progress = subject.topics.length > 0 ? Math.round((completedTopics / subject.topics.length) * 100) : 0
                        
                        return (
                          <div key={subject.id} className="flex items-center gap-3">
                            <div 
                              className="h-3 w-3 rounded-full" 
                              style={{ backgroundColor: subject.color }}
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{subject.name}</p>
                              <p className="text-xs text-gray-600">{progress}% complete</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest topic completions and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.topic}</p>
                        <p className="text-sm text-gray-600">
                          {activity.subject} • {activity.type === 'completed' ? 'Completed' : activity.type === 'added' ? 'Added' : 'Updated'} by {activity.completedBy}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{activity.date}</p>
                      </div>
                    </div>
                  ))}
                  {activities.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Subject Progress Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {subjects.map((subject) => {
                const IconComponent = iconMap[subject.icon as keyof typeof iconMap] || BookOpen
                const completedTopics = subject.topics.filter(topic => topic.completed).length
                const totalTopics = subject.topics.length
                const progress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0
                
                return (
                  <Card key={subject.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <div 
                          className="flex h-8 w-8 items-center justify-center rounded-lg"
                          style={{ backgroundColor: `${subject.color}20` }}
                        >
                          <IconComponent className="h-4 w-4" style={{ color: subject.color }} />
                        </div>
                        <div>
                          <CardTitle className="text-sm">{subject.name}</CardTitle>
                          <CardDescription className="text-xs">
                            {completedTopics}/{totalTopics} topics
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>{progress}% complete</span>
                          <span>{totalTopics - completedTopics} remaining</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </>
        )
    }
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50">
        <NotificationSystem 
          notifications={notifications} 
          onRemove={removeNotification} 
        />

        {/* Sidebar */}
        <Sidebar className="border-r border-gray-200">
          <SidebarHeader className="border-b border-gray-200 p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Syllabus Tracker</h2>
                <p className="text-xs text-gray-500">Progress Monitor</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-2">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subjects
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {subjects.map((subject) => {
                    const IconComponent = iconMap[subject.icon as keyof typeof iconMap] || BookOpen
                    const isExpanded = expandedSubjects.includes(subject.id)
                    const completedTopics = subject.topics.filter(topic => topic.completed).length
                    const progress = subject.topics.length > 0 ? Math.round((completedTopics / subject.topics.length) * 100) : 0
                    
                    return (
                      <SidebarMenuItem key={subject.id}>
                        <Collapsible open={isExpanded} onOpenChange={() => toggleSubject(subject.id)}>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton className="w-full justify-between">
                              <div className="flex items-center gap-2">
                                <IconComponent className="h-4 w-4" style={{ color: subject.color }} />
                                <span className="text-sm">{subject.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {progress}%
                                </Badge>
                                {isExpanded ? (
                                  <ChevronDown className="h-3 w-3" />
                                ) : (
                                  <ChevronRight className="h-3 w-3" />
                                )}
                              </div>
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="ml-6 mt-2 space-y-2">
                              {subject.topics.map((topic) => (
                                <div key={topic.id} className="flex items-center justify-between py-1 group">
                                  <div className="flex items-center gap-2 flex-1">
                                    <Checkbox 
                                      checked={topic.completed}
                                      onCheckedChange={(checked) => 
                                        handleTopicToggle(subject.id, topic.id, checked as boolean)
                                      }
                                      className="h-3 w-3"
                                      disabled={!isFacultyView && user.role === 'student'}
                                    />
                                    <span className={`text-xs ${topic.completed ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                                      {topic.name}
                                    </span>
                                    {!topic.completed && new Date(topic.dueDate) < new Date() && (
                                      <AlertTriangle className="h-3 w-3 text-red-500" />
                                    )}
                                  </div>
                                  {isFacultyView && (
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 w-6 p-0"
                                        onClick={() => handleEditTopic(subject.id, topic)}
                                      >
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                        onClick={() => handleDeleteTopic(subject.id, topic.id)}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarRail />
        </Sidebar>

        {/* Main Content */}
        <SidebarInset>
          {/* Navbar */}
          <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
            <div className="flex h-16 items-center justify-between px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">Smart Syllabus Tracker</span>
                </div>
              </div>
              
              <nav className="flex items-center gap-6">
                <Button 
                  variant="ghost" 
                  className={`${currentPage === 'dashboard' ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
                  onClick={() => setCurrentPage('dashboard')}
                >
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button 
                  variant="ghost" 
                  className={`relative ${currentPage === 'alerts' ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
                  onClick={() => setCurrentPage('alerts')}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Alerts
                  {alerts.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                      {alerts.length}
                    </Badge>
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  className={`${currentPage === 'settings' ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
                  onClick={() => setCurrentPage('settings')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{user.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <span className="text-xs text-gray-500">{user.email}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Badge variant="outline" className="text-xs">
                        {user.role === 'faculty' ? 'Faculty' : 'Student'}
                      </Badge>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </nav>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="p-6 space-y-6">
            {renderCurrentPage()}
          </main>
        </SidebarInset>

        {/* Modals */}
        <TopicForm
          isOpen={isTopicFormOpen}
          onClose={() => {
            setIsTopicFormOpen(false)
            setEditingTopic(undefined)
          }}
          onSubmit={editingTopic ? handleUpdateTopic : handleAddTopic}
          subjects={subjects}
          editingTopic={editingTopic}
        />

        <ExportDialog
          isOpen={isExportDialogOpen}
          onClose={() => setIsExportDialogOpen(false)}
          subjects={subjects}
        />
      </div>
    </SidebarProvider>
  )
}
