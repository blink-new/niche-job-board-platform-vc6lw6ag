import { useState, useMemo } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Card, CardContent, CardHeader } from './ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Search, MapPin, DollarSign, Clock, Bookmark, BookmarkCheck } from 'lucide-react'
import { Job, SavedJob } from '../App'

interface JobBoardProps {
  jobs: Job[]
  savedJobs: SavedJob[]
  onJobClick: (job: Job) => void
  onSaveJob: (jobId: string) => void
}

export function JobBoard({ jobs, savedJobs, onJobClick, onSaveJob }: JobBoardProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState('')
  const [experienceLevelFilter, setExperienceLevelFilter] = useState('')
  const [salaryMinFilter, setSalaryMinFilter] = useState('')

  // Get unique values for filters
  const locations = useMemo(() => {
    const uniqueLocations = [...new Set(jobs.map(job => job.location))]
    return uniqueLocations.sort()
  }, [jobs])

  const employmentTypes = useMemo(() => {
    const uniqueTypes = [...new Set(jobs.map(job => job.employmentType))]
    return uniqueTypes.sort()
  }, [jobs])

  const experienceLevels = useMemo(() => {
    const uniqueLevels = [...new Set(jobs.map(job => job.experienceLevel))]
    return uniqueLevels.sort()
  }, [jobs])

  // Filter jobs based on search and filters
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = !searchQuery || 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesLocation = !locationFilter || job.location === locationFilter
      const matchesEmploymentType = !employmentTypeFilter || job.employmentType === employmentTypeFilter
      const matchesExperienceLevel = !experienceLevelFilter || job.experienceLevel === experienceLevelFilter
      
      const matchesSalary = !salaryMinFilter || 
        (job.salaryMin && job.salaryMin >= parseInt(salaryMinFilter))

      return matchesSearch && matchesLocation && matchesEmploymentType && 
             matchesExperienceLevel && matchesSalary
    })
  }, [jobs, searchQuery, locationFilter, employmentTypeFilter, experienceLevelFilter, salaryMinFilter])

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

  const clearFilters = () => {
    setSearchQuery('')
    setLocationFilter('')
    setEmploymentTypeFilter('')
    setExperienceLevelFilter('')
    setSalaryMinFilter('')
  }

  const isJobSaved = (jobId: string) => {
    return savedJobs.some(save => save.jobId === jobId)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search and Filters */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search jobs, companies, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Location Filter */}
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Locations</SelectItem>
                {locations.map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Employment Type Filter */}
            <Select value={employmentTypeFilter} onValueChange={setEmploymentTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                {employmentTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Experience Level Filter */}
            <Select value={experienceLevelFilter} onValueChange={setExperienceLevelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Levels</SelectItem>
                {experienceLevels.map(level => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>

          {/* Salary Filter */}
          <div className="mt-4">
            <Select value={salaryMinFilter} onValueChange={setSalaryMinFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Minimum Salary" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any Salary</SelectItem>
                <SelectItem value="30000">$30,000+</SelectItem>
                <SelectItem value="50000">$50,000+</SelectItem>
                <SelectItem value="70000">$70,000+</SelectItem>
                <SelectItem value="100000">$100,000+</SelectItem>
                <SelectItem value="150000">$150,000+</SelectItem>
                <SelectItem value="200000">$200,000+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {filteredJobs.length} Job{filteredJobs.length !== 1 ? 's' : ''} Found
        </h2>
        <p className="text-gray-600">
          Showing {filteredJobs.length} of {jobs.length} total jobs
        </p>
      </div>

      {/* Job Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredJobs.map(job => (
          <Card 
            key={job.id} 
            className="hover:shadow-lg transition-all duration-200 cursor-pointer border-gray-200 hover:border-primary/20"
            onClick={() => onJobClick(job)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
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
                    onSaveJob(job.id)
                  }}
                  className="text-gray-400 hover:text-primary"
                >
                  {isJobSaved(job.id) ? (
                    <BookmarkCheck className="h-5 w-5 text-primary" />
                  ) : (
                    <Bookmark className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
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

                {/* Experience Level */}
                <div className="flex items-center justify-between pt-2">
                  <Badge variant="outline" className="text-xs">
                    {job.experienceLevel}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or clearing some filters.
            </p>
            <Button onClick={clearFilters} variant="outline">
              Clear All Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}