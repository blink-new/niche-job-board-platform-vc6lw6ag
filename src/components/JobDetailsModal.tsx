import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { MapPin, DollarSign, Clock, Calendar, Mail, ExternalLink, Bookmark, BookmarkCheck } from 'lucide-react'
import { Job } from '../App'

interface JobDetailsModalProps {
  job: Job | null
  open: boolean
  onOpenChange: (open: boolean) => void
  isSaved: boolean
  onSaveJob?: () => void
}

export function JobDetailsModal({ job, open, onOpenChange, isSaved, onSaveJob }: JobDetailsModalProps) {
  if (!job) return null

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

  const handleApply = () => {
    if (job.applicationType === 'email' && job.applicationEmail) {
      window.location.href = `mailto:${job.applicationEmail}?subject=Application for ${job.title} at ${job.company}`
    } else if (job.applicationType === 'link' && job.applicationLink) {
      window.open(job.applicationLink, '_blank')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                {job.title}
              </DialogTitle>
              <p className="text-xl text-primary font-semibold mb-4">{job.company}</p>
            </div>
            {onSaveJob && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSaveJob}
                className="text-gray-400 hover:text-primary"
              >
                {isSaved ? (
                  <BookmarkCheck className="h-5 w-5 text-primary" />
                ) : (
                  <Bookmark className="h-5 w-5" />
                )}
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Job Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2 text-gray-600">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{job.location}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Clock className="h-4 w-4" />
              <span className="text-sm">{job.employmentType}</span>
            </div>
            <div className="flex items-center space-x-2 text-green-600">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm font-medium">
                {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">
                {new Date(job.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Badge variant="outline">{job.experienceLevel}</Badge>
            {job.tags.map((tag, index) => (
              <Badge key={index} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>

          <Separator />

          {/* Job Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h3>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {job.description}
              </p>
            </div>
          </div>

          {/* Requirements */}
          {job.requirements && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {job.requirements}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Benefits */}
          {job.benefits && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Benefits</h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {job.benefits}
                  </p>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Application Section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ready to Apply?</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-gray-600">
                {job.applicationType === 'email' ? (
                  <>
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">Apply via email</span>
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4" />
                    <span className="text-sm">Apply on company website</span>
                  </>
                )}
              </div>
              <Button onClick={handleApply} className="bg-primary hover:bg-primary/90">
                {job.applicationType === 'email' ? 'Send Email' : 'Apply Now'}
              </Button>
            </div>
            {job.applicationType === 'email' && job.applicationEmail && (
              <p className="text-xs text-gray-500 mt-2">
                This will open your email client with a pre-filled subject line
              </p>
            )}
          </div>

          {/* Job Meta */}
          <div className="text-xs text-gray-500 pt-4 border-t border-gray-200">
            <p>Job posted on {new Date(job.createdAt).toLocaleDateString()}</p>
            <p>Last updated on {new Date(job.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}