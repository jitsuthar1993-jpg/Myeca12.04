import { useFieldArray } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, Calendar } from 'lucide-react'

interface ResumeFormProps {
  register: any
  errors: any
  control: any
  watch: any
}

export function ResumeForm({ register, errors, control, watch }: ResumeFormProps) {
  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({
    control,
    name: 'experience'
  })

  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
    control,
    name: 'education'
  })

  const { fields: certificationFields, append: appendCertification, remove: removeCertification } = useFieldArray({
    control,
    name: 'certifications'
  })

  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({
    control,
    name: 'skills'
  })

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="personalInfo.fullName">Full Name *</Label>
              <Input
                id="personalInfo.fullName"
                {...register('personalInfo.fullName')}
                placeholder="John Doe"
                className={errors.personalInfo?.fullName ? 'border-red-500' : ''}
              />
              {errors.personalInfo?.fullName && (
                <p className="text-sm text-red-600 mt-1">{errors.personalInfo.fullName.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="personalInfo.email">Email *</Label>
              <Input
                id="personalInfo.email"
                type="email"
                {...register('personalInfo.email')}
                placeholder="john.doe@example.com"
                className={errors.personalInfo?.email ? 'border-red-500' : ''}
              />
              {errors.personalInfo?.email && (
                <p className="text-sm text-red-600 mt-1">{errors.personalInfo.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="personalInfo.phone">Phone *</Label>
              <Input
                id="personalInfo.phone"
                {...register('personalInfo.phone')}
                placeholder="+1 (555) 123-4567"
                className={errors.personalInfo?.phone ? 'border-red-500' : ''}
              />
              {errors.personalInfo?.phone && (
                <p className="text-sm text-red-600 mt-1">{errors.personalInfo.phone.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="personalInfo.linkedin">LinkedIn (Optional)</Label>
              <Input
                id="personalInfo.linkedin"
                {...register('personalInfo.linkedin')}
                placeholder="https://linkedin.com/in/johndoe"
                className={errors.personalInfo?.linkedin ? 'border-red-500' : ''}
              />
              {errors.personalInfo?.linkedin && (
                <p className="text-sm text-red-600 mt-1">{errors.personalInfo.linkedin.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="personalInfo.address">Address *</Label>
            <Textarea
              id="personalInfo.address"
              {...register('personalInfo.address')}
              placeholder="123 Main St, City, State 12345"
              rows={2}
              className={errors.personalInfo?.address ? 'border-red-500' : ''}
            />
            {errors.personalInfo?.address && (
              <p className="text-sm text-red-600 mt-1">{errors.personalInfo.address.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="personalInfo.website">Website (Optional)</Label>
            <Input
              id="personalInfo.website"
              {...register('personalInfo.website')}
              placeholder="https://johndoe.com"
              className={errors.personalInfo?.website ? 'border-red-500' : ''}
            />
            {errors.personalInfo?.website && (
              <p className="text-sm text-red-600 mt-1">{errors.personalInfo.website.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Professional Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Summary *</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            id="summary"
            {...register('summary')}
            placeholder="Write a compelling professional summary that highlights your key skills, experience, and career objectives..."
            rows={4}
            className={errors.summary ? 'border-red-500' : ''}
          />
          {errors.summary && (
            <p className="text-sm text-red-600 mt-1">{errors.summary.message}</p>
          )}
          <p className="text-sm text-gray-600 mt-2">
            Minimum 50 characters. This should be a brief overview of your professional background.
          </p>
        </CardContent>
      </Card>

      {/* Work Experience */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Work Experience *</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendExperience({
              title: '',
              company: '',
              location: '',
              startDate: '',
              endDate: '',
              current: false,
              description: ''
            })}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Experience</span>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {experienceFields.map((field, index) => (
            <div key={field.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-gray-900">Experience {index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExperience(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`experience.${index}.title`}>Job Title *</Label>
                  <Input
                    id={`experience.${index}.title`}
                    {...register(`experience.${index}.title`)}
                    placeholder="Software Engineer"
                    className={errors.experience?.[index]?.title ? 'border-red-500' : ''}
                  />
                  {errors.experience?.[index]?.title && (
                    <p className="text-sm text-red-600 mt-1">{errors.experience[index].title.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`experience.${index}.company`}>Company *</Label>
                  <Input
                    id={`experience.${index}.company`}
                    {...register(`experience.${index}.company`)}
                    placeholder="Tech Corp"
                    className={errors.experience?.[index]?.company ? 'border-red-500' : ''}
                  />
                  {errors.experience?.[index]?.company && (
                    <p className="text-sm text-red-600 mt-1">{errors.experience[index].company.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`experience.${index}.location`}>Location *</Label>
                  <Input
                    id={`experience.${index}.location`}
                    {...register(`experience.${index}.location`)}
                    placeholder="San Francisco, CA"
                    className={errors.experience?.[index]?.location ? 'border-red-500' : ''}
                  />
                  {errors.experience?.[index]?.location && (
                    <p className="text-sm text-red-600 mt-1">{errors.experience[index].location.message}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <Label htmlFor={`experience.${index}.current`}>Current Position</Label>
                    <select
                      id={`experience.${index}.current`}
                      {...register(`experience.${index}.current`)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`experience.${index}.startDate`}>Start Date *</Label>
                  <Input
                    id={`experience.${index}.startDate`}
                    type="month"
                    {...register(`experience.${index}.startDate`)}
                    className={errors.experience?.[index]?.startDate ? 'border-red-500' : ''}
                  />
                  {errors.experience?.[index]?.startDate && (
                    <p className="text-sm text-red-600 mt-1">{errors.experience[index].startDate.message}</p>
                  )}
                </div>

                {!watch(`experience.${index}.current`) && (
                  <div>
                    <Label htmlFor={`experience.${index}.endDate`}>End Date</Label>
                    <Input
                      id={`experience.${index}.endDate`}
                      type="month"
                      {...register(`experience.${index}.endDate`)}
                      className={errors.experience?.[index]?.endDate ? 'border-red-500' : ''}
                    />
                    {errors.experience?.[index]?.endDate && (
                      <p className="text-sm text-red-600 mt-1">{errors.experience[index].endDate.message}</p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor={`experience.${index}.description`}>Description *</Label>
                <Textarea
                  id={`experience.${index}.description`}
                  {...register(`experience.${index}.description`)}
                  placeholder="Describe your responsibilities and achievements in this role..."
                  rows={3}
                  className={errors.experience?.[index]?.description ? 'border-red-500' : ''}
                />
                {errors.experience?.[index]?.description && (
                  <p className="text-sm text-red-600 mt-1">{errors.experience[index].description.message}</p>
                )}
                <p className="text-sm text-gray-600 mt-1">
                  Minimum 20 characters. Focus on achievements and quantifiable results.
                </p>
              </div>
            </div>
          ))}

          {errors.experience && (
            <p className="text-sm text-red-600">{errors.experience.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Education *</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendEducation({
              degree: '',
              institution: '',
              location: '',
              graduationDate: '',
              gpa: ''
            })}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Education</span>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {educationFields.map((field, index) => (
            <div key={field.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-gray-900">Education {index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEducation(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`education.${index}.degree`}>Degree *</Label>
                  <Input
                    id={`education.${index}.degree`}
                    {...register(`education.${index}.degree`)}
                    placeholder="Bachelor of Science in Computer Science"
                    className={errors.education?.[index]?.degree ? 'border-red-500' : ''}
                  />
                  {errors.education?.[index]?.degree && (
                    <p className="text-sm text-red-600 mt-1">{errors.education[index].degree.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`education.${index}.institution`}>Institution *</Label>
                  <Input
                    id={`education.${index}.institution`}
                    {...register(`education.${index}.institution`)}
                    placeholder="University of Technology"
                    className={errors.education?.[index]?.institution ? 'border-red-500' : ''}
                  />
                  {errors.education?.[index]?.institution && (
                    <p className="text-sm text-red-600 mt-1">{errors.education[index].institution.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`education.${index}.location`}>Location *</Label>
                  <Input
                    id={`education.${index}.location`}
                    {...register(`education.${index}.location`)}
                    placeholder="Boston, MA"
                    className={errors.education?.[index]?.location ? 'border-red-500' : ''}
                  />
                  {errors.education?.[index]?.location && (
                    <p className="text-sm text-red-600 mt-1">{errors.education[index].location.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`education.${index}.graduationDate`}>Graduation Date *</Label>
                  <Input
                    id={`education.${index}.graduationDate`}
                    type="month"
                    {...register(`education.${index}.graduationDate`)}
                    className={errors.education?.[index]?.graduationDate ? 'border-red-500' : ''}
                  />
                  {errors.education?.[index]?.graduationDate && (
                    <p className="text-sm text-red-600 mt-1">{errors.education[index].graduationDate.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor={`education.${index}.gpa`}>GPA (Optional)</Label>
                <Input
                  id={`education.${index}.gpa`}
                  {...register(`education.${index}.gpa`)}
                  placeholder="3.8/4.0"
                  className={errors.education?.[index]?.gpa ? 'border-red-500' : ''}
                />
                {errors.education?.[index]?.gpa && (
                  <p className="text-sm text-red-600 mt-1">{errors.education[index].gpa.message}</p>
                )}
              </div>
            </div>
          ))}

          {errors.education && (
            <p className="text-sm text-red-600">{errors.education.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Skills *</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendSkill('')}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Skill</span>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {skillFields.map((field, index) => (
            <div key={field.id} className="flex items-center space-x-2">
              <div className="flex-1">
                <Input
                  {...register(`skills.${index}`)}
                  placeholder="JavaScript, Project Management, Data Analysis..."
                  className={errors.skills?.[index] ? 'border-red-500' : ''}
                />
                {errors.skills?.[index] && (
                  <p className="text-sm text-red-600 mt-1">{errors.skills[index].message}</p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeSkill(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          {errors.skills && (
            <p className="text-sm text-red-600">{errors.skills.message}</p>
          )}

          <p className="text-sm text-gray-600">
            Add at least 3 skills that showcase your professional abilities.
          </p>
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Certifications (Optional)</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendCertification({
              name: '',
              issuer: '',
              date: '',
              url: ''
            })}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Certification</span>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {certificationFields.map((field, index) => (
            <div key={field.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-gray-900">Certification {index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCertification(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`certifications.${index}.name`}>Certification Name</Label>
                  <Input
                    id={`certifications.${index}.name`}
                    {...register(`certifications.${index}.name`)}
                    placeholder="AWS Certified Solutions Architect"
                    className={errors.certifications?.[index]?.name ? 'border-red-500' : ''}
                  />
                  {errors.certifications?.[index]?.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.certifications[index].name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`certifications.${index}.issuer`}>Issuer</Label>
                  <Input
                    id={`certifications.${index}.issuer`}
                    {...register(`certifications.${index}.issuer`)}
                    placeholder="Amazon Web Services"
                    className={errors.certifications?.[index]?.issuer ? 'border-red-500' : ''}
                  />
                  {errors.certifications?.[index]?.issuer && (
                    <p className="text-sm text-red-600 mt-1">{errors.certifications[index].issuer.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`certifications.${index}.date`}>Date</Label>
                  <Input
                    id={`certifications.${index}.date`}
                    type="month"
                    {...register(`certifications.${index}.date`)}
                    className={errors.certifications?.[index]?.date ? 'border-red-500' : ''}
                  />
                  {errors.certifications?.[index]?.date && (
                    <p className="text-sm text-red-600 mt-1">{errors.certifications[index].date.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`certifications.${index}.url`}>URL (Optional)</Label>
                  <Input
                    id={`certifications.${index}.url`}
                    {...register(`certifications.${index}.url`)}
                    placeholder="https://aws.amazon.com/certification/"
                    className={errors.certifications?.[index]?.url ? 'border-red-500' : ''}
                  />
                  {errors.certifications?.[index]?.url && (
                    <p className="text-sm text-red-600 mt-1">{errors.certifications[index].url.message}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}