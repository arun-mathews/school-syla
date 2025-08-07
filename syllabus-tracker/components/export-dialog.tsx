"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Download, FileText, Table } from 'lucide-react'
import { Subject } from '@/lib/database'

interface ExportDialogProps {
  isOpen: boolean
  onClose: () => void
  subjects: Subject[]
}

export function ExportDialog({ isOpen, onClose, subjects }: ExportDialogProps) {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv'>('pdf')

  const handleSubjectToggle = (subjectId: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    )
  }

  const handleExport = () => {
    const selectedData = subjects.filter(s => selectedSubjects.includes(s.id))
    
    if (exportFormat === 'csv') {
      exportToCSV(selectedData)
    } else {
      exportToPDF(selectedData)
    }
    
    onClose()
  }

  const exportToCSV = (data: Subject[]) => {
    const csvContent = [
      ['Subject', 'Topic', 'Status', 'Due Date', 'Completed By', 'Completed At'].join(','),
      ...data.flatMap(subject =>
        subject.topics.map(topic =>
          [
            subject.name,
            topic.name,
            topic.completed ? 'Completed' : 'Pending',
            topic.dueDate,
            topic.completedBy || '',
            topic.completedAt || ''
          ].join(',')
        )
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `syllabus-progress-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportToPDF = (data: Subject[]) => {
    // Create a simple HTML report
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Syllabus Progress Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #3b82f6; }
            h2 { color: #374151; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f3f4f6; }
            .completed { color: #10b981; font-weight: bold; }
            .pending { color: #f59e0b; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Syllabus Progress Report</h1>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
          ${data.map(subject => `
            <h2>${subject.name}</h2>
            <table>
              <thead>
                <tr>
                  <th>Topic</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Completed By</th>
                  <th>Completed At</th>
                </tr>
              </thead>
              <tbody>
                ${subject.topics.map(topic => `
                  <tr>
                    <td>${topic.name}</td>
                    <td class="${topic.completed ? 'completed' : 'pending'}">
                      ${topic.completed ? 'Completed' : 'Pending'}
                    </td>
                    <td>${topic.dueDate}</td>
                    <td>${topic.completedBy || '-'}</td>
                    <td>${topic.completedAt || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `).join('')}
        </body>
      </html>
    `

    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `syllabus-progress-${new Date().toISOString().split('T')[0]}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Progress Report</DialogTitle>
          <DialogDescription>
            Select subjects and format to export your progress report.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Select Subjects:</Label>
            {subjects.map((subject) => (
              <div key={subject.id} className="flex items-center space-x-2">
                <Checkbox
                  id={subject.id}
                  checked={selectedSubjects.includes(subject.id)}
                  onCheckedChange={() => handleSubjectToggle(subject.id)}
                />
                <Label htmlFor={subject.id} className="text-sm">
                  {subject.name}
                </Label>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Format:</Label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pdf"
                  checked={exportFormat === 'pdf'}
                  onCheckedChange={() => setExportFormat('pdf')}
                />
                <Label htmlFor="pdf" className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4" />
                  HTML Report
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="csv"
                  checked={exportFormat === 'csv'}
                  onCheckedChange={() => setExportFormat('csv')}
                />
                <Label htmlFor="csv" className="flex items-center gap-2 text-sm">
                  <Table className="h-4 w-4" />
                  CSV Data
                </Label>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={selectedSubjects.length === 0}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
