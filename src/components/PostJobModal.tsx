import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { X } from 'lucide-react'
import { blink } from '../blink/client'
import { useToast } from '../hooks/use-toast'

interface PostJobModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onJobPosted: () => void
}

export function PostJobModal({ open, onOpenChange, onJobPosted }: PostJobModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    salaryMin: '',
    salaryMax: '',
    salaryCurrency: 'USD',
    description: '',
    requirements: '',
    benefits: '',
    employmentType: '',
    experienceLevel: '',
    applicationType: 'email' as 'email' | 'link',
    applicationEmail: '',
    applicationLink: ''
  })
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const { toast } = useToast()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags(prev => [...prev, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      company: '',
      location: '',
      salaryMin: '',
      salaryMax: '',
      salaryCurrency: 'USD',
      description: '',
      requirements: '',
      benefits: '',
      employmentType: '',
      experienceLevel: '',
      applicationType: 'email',
      applicationEmail: '',
      applicationLink: ''
    })
    setTags([])
    setTagInput('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.company || !formData.location || 
        !formData.description || !formData.employmentType || !formData.experienceLevel) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    if (formData.applicationType === 'email' && !formData.applicationEmail) {
      toast({
        title: "Error",
        description: "Please provide an application email",
        variant: "destructive"
      })
      return
    }

    if (formData.applicationType === 'link' && !formData.applicationLink) {
      toast({
        title: "Error",
        description: "Please provide an application link",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    
    try {
      const user = await blink.auth.me()
      
      await blink.db.jobs.create({
        id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: formData.title,
        company: formData.company,
        location: formData.location,
        salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : null,
        salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : null,
        salaryCurrency: formData.salaryCurrency,
        description: formData.description,
        requirements: formData.requirements || null,
        benefits: formData.benefits || null,
        employmentType: formData.employmentType,
        experienceLevel: formData.experienceLevel,
        applicationType: formData.applicationType,
        applicationEmail: formData.applicationType === 'email' ? formData.applicationEmail : null,
        applicationLink: formData.applicationType === 'link' ? formData.applicationLink : null,
        tags: JSON.stringify(tags),
        userId: user.id
      })

      resetForm()
      onJobPosted()
    } catch (error) {
      console.error('Error posting job:', error)
      toast({
        title: "Error",
        description: "Failed to post job. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post a New Job</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g. Senior React Developer"
                required
              />
            </div>
            <div>
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="e.g. TechCorp Inc."
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g. San Francisco, CA or Remote"
                required
              />
            </div>
            <div>
              <Label htmlFor="employmentType">Employment Type *</Label>
              <Select value={formData.employmentType} onValueChange={(value) => handleInputChange('employmentType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Freelance">Freelance</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Salary Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="salaryMin">Minimum Salary</Label>
              <Input
                id="salaryMin"
                type="number"
                value={formData.salaryMin}
                onChange={(e) => handleInputChange('salaryMin', e.target.value)}
                placeholder="50000"
              />
            </div>
            <div>
              <Label htmlFor="salaryMax">Maximum Salary</Label>
              <Input
                id="salaryMax"
                type="number"
                value={formData.salaryMax}
                onChange={(e) => handleInputChange('salaryMax', e.target.value)}
                placeholder="80000"
              />
            </div>
            <div>
              <Label htmlFor="salaryCurrency">Currency</Label>
              <Select value={formData.salaryCurrency} onValueChange={(value) => handleInputChange('salaryCurrency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="experienceLevel">Experience Level *</Label>
            <Select value={formData.experienceLevel} onValueChange={(value) => handleInputChange('experienceLevel', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Entry Level">Entry Level</SelectItem>
                <SelectItem value="Mid Level">Mid Level</SelectItem>
                <SelectItem value="Senior Level">Senior Level</SelectItem>
                <SelectItem value="Lead/Principal">Lead/Principal</SelectItem>
                <SelectItem value="Executive">Executive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Job Description */}
          <div>
            <Label htmlFor="description">Job Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the role, responsibilities, and what you're looking for..."
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="requirements">Requirements</Label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => handleInputChange('requirements', e.target.value)}
              placeholder="List the required skills, experience, and qualifications..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="benefits">Benefits</Label>
            <Textarea
              id="benefits"
              value={formData.benefits}
              onChange={(e) => handleInputChange('benefits', e.target.value)}
              placeholder="Health insurance, remote work, equity, etc..."
              rows={2}
            />
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="tags">Skills & Tags</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add skills like React, Python, etc."
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Application Method */}
          <div className="space-y-4">
            <Label>How should candidates apply? *</Label>
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant={formData.applicationType === 'email' ? 'default' : 'outline'}
                onClick={() => handleInputChange('applicationType', 'email')}
                className="w-full"
              >
                Email Application
              </Button>
              <Button
                type="button"
                variant={formData.applicationType === 'link' ? 'default' : 'outline'}
                onClick={() => handleInputChange('applicationType', 'link')}
                className="w-full"
              >
                External Link
              </Button>
            </div>

            {formData.applicationType === 'email' && (
              <div>
                <Label htmlFor="applicationEmail">Application Email *</Label>
                <Input
                  id="applicationEmail"
                  type="email"
                  value={formData.applicationEmail}
                  onChange={(e) => handleInputChange('applicationEmail', e.target.value)}
                  placeholder="jobs@company.com"
                  required
                />
              </div>
            )}

            {formData.applicationType === 'link' && (
              <div>
                <Label htmlFor="applicationLink">Application Link *</Label>
                <Input
                  id="applicationLink"
                  type="url"
                  value={formData.applicationLink}
                  onChange={(e) => handleInputChange('applicationLink', e.target.value)}
                  placeholder="https://company.com/careers/apply"
                  required
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Posting...' : 'Post Job'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}