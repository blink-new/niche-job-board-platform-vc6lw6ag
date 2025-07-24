import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Plus, Bookmark, LogOut } from 'lucide-react'
import { blink } from '../blink/client'

interface HeaderProps {
  user: any
  onPostJob: () => void
  onShowSavedJobs: () => void
  savedJobsCount: number
}

export function Header({ user, onPostJob, onShowSavedJobs, savedJobsCount }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary">NicheJobs</h1>
            <span className="ml-2 text-sm text-gray-500">Discover specialized opportunities</span>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Button
              onClick={onShowSavedJobs}
              variant="outline"
              size="sm"
              className="relative"
            >
              <Bookmark className="h-4 w-4 mr-2" />
              Saved Jobs
              {savedJobsCount > 0 && (
                <Badge 
                  variant="secondary" 
                  className="ml-2 bg-primary text-white text-xs px-1.5 py-0.5"
                >
                  {savedJobsCount}
                </Badge>
              )}
            </Button>

            <Button
              onClick={onPostJob}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Post Job
            </Button>

            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
              <div className="text-sm">
                <p className="font-medium text-gray-900">{user.email}</p>
              </div>
              <Button
                onClick={() => blink.auth.logout()}
                variant="ghost"
                size="sm"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}