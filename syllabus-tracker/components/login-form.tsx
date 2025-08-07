"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookOpen, Loader2, Eye, EyeOff, GraduationCap, Users, CheckCircle, ArrowRight } from 'lucide-react'
import { authService, User } from '@/lib/auth'

interface LoginFormProps {
  onLogin: (user: User) => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [selectedDemo, setSelectedDemo] = useState<'faculty' | 'student' | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    setIsAnimating(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const user = await authService.login(email, password)
      onLogin(user)
    } catch (err) {
      setError('Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async (type: 'faculty' | 'student') => {
    setSelectedDemo(type)
    setIsLoading(true)
    setError('')

    const demoCredentials = {
      faculty: { email: 'faculty@example.com', password: 'password' },
      student: { email: 'student@example.com', password: 'password' }
    }

    try {
      const user = await authService.login(
        demoCredentials[type].email, 
        demoCredentials[type].password
      )
      onLogin(user)
    } catch (err) {
      setError('Demo login failed')
    } finally {
      setIsLoading(false)
      setSelectedDemo(null)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <BookOpen className="absolute top-20 left-20 h-6 w-6 text-blue-300 animate-float" />
        <GraduationCap className="absolute top-40 right-32 h-8 w-8 text-purple-300 animate-float animation-delay-1000" />
        <Users className="absolute bottom-32 left-32 h-7 w-7 text-indigo-300 animate-float animation-delay-2000" />
        <CheckCircle className="absolute bottom-20 right-20 h-6 w-6 text-green-300 animate-float animation-delay-3000" />
      </div>

      <div className={`w-full max-w-md transition-all duration-1000 ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg transform hover:scale-105 transition-transform duration-300">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 h-6 w-6 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-3 w-3 text-white" />
                </div>
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Smart Syllabus Tracker
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Track your academic progress with ease
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Demo Login Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="relative overflow-hidden group hover:shadow-lg transition-all duration-300"
                onClick={() => handleDemoLogin('faculty')}
                disabled={isLoading}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                <div className="relative flex items-center gap-2 group-hover:text-white transition-colors duration-300">
                  {isLoading && selectedDemo === 'faculty' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Users className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">Faculty Demo</span>
                </div>
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="relative overflow-hidden group hover:shadow-lg transition-all duration-300"
                onClick={() => handleDemoLogin('student')}
                disabled={isLoading}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                <div className="relative flex items-center gap-2 group-hover:text-white transition-colors duration-300">
                  {isLoading && selectedDemo === 'student' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <GraduationCap className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">Student Demo</span>
                </div>
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-4 pr-4 py-3 border-2 border-gray-200 focus:border-blue-500 focus:ring-0 transition-colors duration-300 rounded-lg"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-4 pr-12 py-3 border-2 border-gray-200 focus:border-blue-500 focus:ring-0 transition-colors duration-300 rounded-lg"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm animate-shake">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group"
                disabled={isLoading}
              >
                {isLoading && !selectedDemo ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Sign In</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                )}
              </Button>
            </form>

            {/* Features Preview */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center mb-4">What you'll get:</p>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="flex items-center gap-2 text-gray-600">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Progress Tracking</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Smart Alerts</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Export Reports</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Team Collaboration</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-2px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(2px);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        
        .animation-delay-3000 {
          animation-delay: 3s;
        }
      `}</style>
    </div>
  )
}
