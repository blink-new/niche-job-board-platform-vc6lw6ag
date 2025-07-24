import { useState, useEffect, useCallback } from 'react'
import { blink } from './blink/client'
import { JobBoard } from './components/JobBoard'
import { PostJobModal } from './components/PostJobModal'
import { JobDetailsModal } from './components/JobDetailsModal'
import { SavedJobsModal } from './components/SavedJobsModal'
import { Header } from './components/Header'
import { Toaster } from './components/ui/toaster'
import { useToast } from './hooks/use-toast'

export interface Job {
  id: string
  title: string
  company: string
  location: string
  salaryMin?: number
  salaryMax?: number
  salaryCurrency: string
  description: string
  requirements?: string
  benefits?: string
  employmentType: string
  experienceLevel: string
  applicationType: 'email' | 'link'
  applicationEmail?: string
  applicationLink?: string
  tags: string[]
  userId: string
  createdAt: string
  updatedAt: string
}

export interface SavedJob {
  id: string
  jobId: string
  userId: string
  createdAt: string
}

function App() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [jobs, setJobs] = useState<Job[]>([])
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [showPostJob, setShowPostJob] = useState(false)
  const [showJobDetails, setShowJobDetails] = useState(false)
  const [showSavedJobs, setShowSavedJobs] = useState(false)
  const { toast } = useToast()

  // Auth state management
  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const loadJobs = useCallback(async () => {
    try {
      const jobsData = await blink.db.jobs.list({
        orderBy: { createdAt: 'desc' },
        limit: 100
      })
      
      const formattedJobs = jobsData.map((job: any) => ({
        ...job,
        tags: job.tags ? JSON.parse(job.tags) : [],
        salaryMin: job.salary_min,
        salaryMax: job.salary_max,
        salaryCurrency: job.salary_currency || 'USD',
        employmentType: job.employment_type,
        experienceLevel: job.experience_level,
        applicationType: job.application_type,
        applicationEmail: job.application_email,
        applicationLink: job.application_link,
        userId: job.user_id,
        createdAt: job.created_at,
        updatedAt: job.updated_at
      }))
      
      setJobs(formattedJobs)
    } catch (error) {
      console.error('Error loading jobs:', error)
      toast({
        title: "Error",
        description: "Failed to load jobs",
        variant: "destructive"
      })
    }
  }, [toast])

  const loadSavedJobs = useCallback(async () => {
    try {
      const savedJobsData = await blink.db.savedJobs.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      })
      
      const formattedSavedJobs = savedJobsData.map((savedJob: any) => ({
        id: savedJob.id,
        jobId: savedJob.job_id,
        userId: savedJob.user_id,
        createdAt: savedJob.created_at
      }))
      
      setSavedJobs(formattedSavedJobs)
    } catch (error) {
      console.error('Error loading saved jobs:', error)
    }
  }, [user])

  // Load jobs and saved jobs when user is authenticated
  useEffect(() => {
    if (user) {
      loadJobs()
      loadSavedJobs()
    }
  }, [user, loadJobs, loadSavedJobs])

  const handleJobPosted = () => {
    loadJobs()
    setShowPostJob(false)
    toast({
      title: "Success",
      description: "Job posted successfully!"
    })
  }

  const handleJobClick = (job: Job) => {
    setSelectedJob(job)
    setShowJobDetails(true)
  }

  const handleSaveJob = async (jobId: string) => {
    if (!user) return
    
    try {
      const existingSave = savedJobs.find(save => save.jobId === jobId)
      
      if (existingSave) {
        await blink.db.savedJobs.delete(existingSave.id)
        setSavedJobs(prev => prev.filter(save => save.id !== existingSave.id))
        toast({
          title: "Job unsaved",
          description: "Job removed from saved jobs"
        })
      } else {
        const newSave = await blink.db.savedJobs.create({
          id: `save_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          jobId,
          userId: user.id
        })
        
        const formattedSave = {
          id: newSave.id,
          jobId: newSave.job_id,
          userId: newSave.user_id,
          createdAt: newSave.created_at
        }
        
        setSavedJobs(prev => [...prev, formattedSave])
        toast({
          title: "Job saved",
          description: "Job added to saved jobs"
        })
      }
    } catch (error) {
      console.error('Error saving job:', error)
      toast({
        title: "Error",
        description: "Failed to save job",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to NicheJobs</h1>
          <p className="text-gray-600 mb-8">Discover niche opportunities and connect with specialized roles</p>
          <button
            onClick={() => blink.auth.login()}
            className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Sign In to Continue
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        user={user}
        onPostJob={() => setShowPostJob(true)}
        onShowSavedJobs={() => setShowSavedJobs(true)}
        savedJobsCount={savedJobs.length}
      />
      
      <main className="pt-20">
        <JobBoard 
          jobs={jobs}
          savedJobs={savedJobs}
          onJobClick={handleJobClick}
          onSaveJob={handleSaveJob}
        />
      </main>

      <PostJobModal
        open={showPostJob}
        onOpenChange={setShowPostJob}
        onJobPosted={handleJobPosted}
      />

      <JobDetailsModal
        job={selectedJob}
        open={showJobDetails}
        onOpenChange={setShowJobDetails}
        isSaved={selectedJob ? savedJobs.some(save => save.jobId === selectedJob.id) : false}
        onSaveJob={selectedJob ? () => handleSaveJob(selectedJob.id) : undefined}
      />

      <SavedJobsModal
        open={showSavedJobs}
        onOpenChange={setShowSavedJobs}
        savedJobs={savedJobs}
        jobs={jobs}
        onJobClick={handleJobClick}
        onUnsaveJob={handleSaveJob}
      />

      <Toaster />
    </div>
  )
}

export default App