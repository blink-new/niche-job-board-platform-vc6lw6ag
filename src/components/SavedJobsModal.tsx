import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Card, CardContent, CardHeader } from './ui/card'
import { MapPin, DollarSign, Clock, Trash2 } from 'lucide-react'
import { Job, SavedJob } from '../App'

interface SavedJobsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  savedJobs: SavedJob[]
  jobs: Job[]
  onJobClick: (job: Job) => void
  onUnsaveJob: (jobId: string) => void
}

export function SavedJobsModal({ 
  open, 
  onOpenChange, 
  savedJobs, 
  jobs, 
  onJobClick, 
  onUnsaveJob 
}: SavedJobsModalProps) {
  // Get the actual job data for saved jobs
  const savedJobsWithData = savedJobs
    .map(savedJob => {
      const job = jobs.find(j => j.id === savedJob.jobId)
      return job ? { ...savedJob, job } : null
    })
    .filter(Boolean) as (SavedJob & { job: Job })[]

  const formatSalary = (min?: number, max?: number, currency = 'USD') => {
    if (!min && !max) return 'Salary not specified'
    
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })

    if (min && max) {
      return `${formatter.format(min)} - ${formatter.format(max)}`
    } else if (min) {
      return `${formatter.format(min)}+`
    } else if (max) {
      return `Up to ${formatter.format(max)}`
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Saved Jobs ({savedJobsWithData.length})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {savedJobsWithData.length === 0 ? (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No saved jobs yet</h3>
                <p className="text-gray-600">
                  Start browsing jobs and save the ones you're interested in to see them here.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {savedJobsWithData.map(({ job, createdAt }) => (
                <Card 
                  key={job.id} 
                  className="hover:shadow-md transition-all duration-200 cursor-pointer border-gray-200 hover:border-primary/20"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => {
                          onOpenChange(false)
                          onJobClick(job)
                        }}
                      >
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-primary transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-primary font-medium mb-2">{job.company}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onUnsaveJob(job.id)
                        }}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent 
                    className="pt-0 cursor-pointer"
                    onClick={() => {
                      onOpenChange(false)
                      onJobClick(job)
                    }}
                  >
                    <div className="space-y-3">
                      {/* Location and Employment Type */}
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {job.location}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {job.employmentType}
                        </div>
                      </div>

                      {/* Salary */}
                      <div className="flex items-center text-sm">
                        <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                        <span className="font-medium text-green-600">
                          {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                        </span>
                      </div>

                      {/* Description Preview */}
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {job.description}
                      </p>

                      {/* Tags */}
                      {job.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {job.tags.slice(0, 4).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {job.tags.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{job.tags.length - 4} more
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Experience Level and Save Date */}
                      <div className="flex items-center justify-between pt-2">
                        <Badge variant="outline" className="text-xs">
                          {job.experienceLevel}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Saved on {new Date(createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}