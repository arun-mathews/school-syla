"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Topic, Subject } from '@/lib/database'

interface TopicFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (subjectId: string, topic: Omit<Topic, 'id'>) => void
  subjects: Subject[]
  editingTopic?: { subjectId: string; topic: Topic }
}

export function TopicForm({ isOpen, onClose, onSubmit, subjects, editingTopic }: TopicFormProps) {
  const [formData, setFormData] = useState({
    name: editingTopic?.topic.name || '',
    description: editingTopic?.topic.description || '',
    dueDate: editingTopic?.topic.dueDate || '',
    subjectId: editingTopic?.subjectId || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const topic: Omit<Topic, 'id'> = {
      name: formData.name,
      description: formData.description,
      dueDate: formData.dueDate,
      completed: editingTopic?.topic.completed || false,
      completedBy: editingTopic?.topic.completedBy,
      completedAt: editingTopic?.topic.completedAt
    }

    onSubmit(formData.subjectId, topic)
    handleClose()
  }

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      dueDate: '',
      subjectId: ''
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingTopic ? 'Edit Topic' : 'Add New Topic'}
          </DialogTitle>
          <DialogDescription>
            {editingTopic 
              ? 'Update the topic details below.' 
              : 'Add a new topic to the syllabus.'
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Select
                value={formData.subjectId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, subjectId: value }))}
                disabled={!!editingTopic}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Topic Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter topic name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter topic description"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.name || !formData.subjectId || !formData.dueDate}>
              {editingTopic ? 'Update Topic' : 'Add Topic'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
