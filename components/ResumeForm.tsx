
import React, { useState } from 'react';
import { ResumeData, Experience, Education, Skill, Language, Project, TemplateType } from '../types';
import { ICONS } from '../constants';
import { improveText, generateSummary, suggestSkills } from '../services/geminiService';

interface ResumeFormProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

const ResumeForm: React.FC<ResumeFormProps> = ({ data, onChange }) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'experience' | 'education' | 'skills' | 'languages' | 'projects'>('personal');
  const [loading, setLoading] = useState<string | null>(null);

  const updatePersonal = (field: string, value: string) => {
    onChange({
      ...data,
      personal: { ...data.personal, [field]: value }
    });
  };

  const setTemplate = (template: TemplateType) => {
    onChange({ ...data, template });
  };

  const handleImproveSummary = async () => {
    setLoading('summary');
    const improved = await improveText(data.personal.summary, "Professional Summary Section");
    updatePersonal('summary', improved);
    setLoading(null);
  };

  const handleGenerateSummary = async () => {
    setLoading('summary');
    const details = `Experience: ${data.experiences.map(e => `${e.position} at ${e.company}`).join(', ')}. Skills: ${data.skills.map(s => s.name).join(', ')}`;
    const summary = await generateSummary(details);
    updatePersonal('summary', summary);
    setLoading(null);
  };

  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
      current: false
    };
    onChange({ ...data, experiences: [newExp, ...data.experiences] });
  };

  const updateExperience = (id: string, field: keyof Experience, value: any) => {
    onChange({
      ...data,
      experiences: data.experiences.map(exp => exp.id === id ? { ...exp, [field]: value } : exp)
    });
  };

  const handleImproveExp = async (id: string, text: string) => {
    setLoading(`exp-${id}`);
    const improved = await improveText(text, "Job Experience Description");
    updateExperience(id, 'description', improved);
    setLoading(null);
  };

  const removeExperience = (id: string) => {
    onChange({ ...data, experiences: data.experiences.filter(exp => exp.id !== id) });
  };

  const addEducation = () => {
    const newEdu: Education = {
        id: Date.now().toString(),
        institution: '',
        degree: '',
        field: '',
        gradDate: ''
    };
    onChange({ ...data, education: [...data.education, newEdu] });
  };

  const removeEducation = (id: string) => {
    onChange({ ...data, education: data.education.filter(e => e.id !== id) });
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    onChange({
      ...data,
      education: data.education.map(e => e.id === id ? { ...e, [field]: value } : e)
    });
  };

  const addSkill = (name: string = '') => {
      const newSkill: Skill = { id: Date.now().toString(), name, level: 'Intermediate' };
      onChange({ ...data, skills: [...data.skills, newSkill] });
  };

  const addLanguage = () => {
      const newLang: Language = { id: Date.now().toString(), name: '', proficiency: 'Fluent' };
      onChange({ ...data, languages: [...data.languages, newLang] });
  };

  const handleSuggestSkills = async () => {
    setLoading('skills');
    const expText = data.experiences.map(e => `${e.position}: ${e.description}`).join('; ');
    const suggestions = await suggestSkills(expText);
    const newSkills = suggestions.map((s, i) => ({ id: `sug-${Date.now()}-${i}`, name: s, level: 'Intermediate' as const }));
    onChange({ ...data, skills: [...data.skills, ...newSkills] });
    setLoading(null);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
      {/* Template Switcher */}
      <div className="p-4 bg-slate-100 border-b flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs uppercase tracking-wider">
          <ICONS.Layout /> Layout Template
        </div>
        <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-inner">
          <button 
            onClick={() => setTemplate('elite')}
            className={`px-3 py-1 rounded-l-md text-[10px] font-bold transition-all ${data.template === 'elite' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Modern
          </button>
          <button 
            onClick={() => setTemplate('balanced')}
            className={`px-3 py-1 text-[10px] font-bold transition-all ${data.template === 'balanced' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 border-x'}`}
          >
            Balanced
          </button>
          <button 
            onClick={() => setTemplate('alpine')}
            className={`px-3 py-1 rounded-r-md text-[10px] font-bold transition-all ${data.template === 'alpine' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Alpine
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-slate-50 border-b overflow-x-auto">
        {(['personal', 'experience', 'education', 'skills', 'languages', 'projects'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab 
              ? 'border-indigo-600 text-indigo-600 bg-white' 
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'personal' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input 
                  type="text" value={data.personal.fullName} 
                  onChange={e => updatePersonal('fullName', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input 
                  type="email" value={data.personal.email} 
                  onChange={e => updatePersonal('email', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input 
                  type="text" value={data.personal.phone} 
                  onChange={e => updatePersonal('phone', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                <input 
                  type="text" value={data.personal.location} 
                  onChange={e => updatePersonal('location', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Website/LinkedIn</label>
                <input 
                  type="text" value={data.personal.website} 
                  onChange={e => updatePersonal('website', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="col-span-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-slate-700">Professional Summary</label>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleGenerateSummary}
                      disabled={loading === 'summary'}
                      className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                    >
                      <ICONS.Magic /> {loading === 'summary' ? 'Thinking...' : 'AI Generate'}
                    </button>
                    <button 
                      onClick={handleImproveSummary}
                      disabled={loading === 'summary'}
                      className="text-xs flex items-center gap-1 text-teal-600 hover:text-teal-800 disabled:opacity-50"
                    >
                      <ICONS.Magic /> {loading === 'summary' ? 'Improving...' : 'AI Enhance'}
                    </button>
                  </div>
                </div>
                <textarea 
                  rows={4}
                  value={data.personal.summary} 
                  onChange={e => updatePersonal('summary', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Summarize your professional background..."
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'experience' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800">Work Experience</h3>
              <button 
                onClick={addExperience}
                className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-indigo-700 transition-colors"
              >
                <ICONS.Plus /> Add Experience
              </button>
            </div>
            {data.experiences.map((exp) => (
              <div key={exp.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50 space-y-4 relative group">
                <button 
                  onClick={() => removeExperience(exp.id)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <ICONS.Trash />
                </button>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Job Title</label>
                    <input 
                      type="text" value={exp.position} 
                      onChange={e => updateExperience(exp.id, 'position', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Company</label>
                    <input 
                      type="text" value={exp.company} 
                      onChange={e => updateExperience(exp.id, 'company', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Start Date</label>
                    <input 
                      type="month" value={exp.startDate} 
                      onChange={e => updateExperience(exp.id, 'startDate', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">End Date</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="month" value={exp.current ? '' : exp.endDate} 
                        disabled={exp.current}
                        onChange={e => updateExperience(exp.id, 'endDate', e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-md bg-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-200"
                      />
                      <label className="flex items-center gap-1 text-xs cursor-pointer">
                        <input 
                            type="checkbox" checked={exp.current} 
                            onChange={e => updateExperience(exp.id, 'current', e.target.checked)} 
                        />
                        Current
                      </label>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-semibold text-slate-500 uppercase">Description & Key Achievements</label>
                      <button 
                        onClick={() => handleImproveExp(exp.id, exp.description)}
                        disabled={loading === `exp-${exp.id}`}
                        className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                      >
                        <ICONS.Magic /> {loading === `exp-${exp.id}` ? 'Enhancing...' : 'AI Enhance'}
                      </button>
                    </div>
                    <textarea 
                      rows={3}
                      value={exp.description} 
                      onChange={e => updateExperience(exp.id, 'description', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="List your responsibilities and impact..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'education' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800">Education</h3>
              <button 
                onClick={addEducation}
                className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-indigo-700 transition-colors"
              >
                <ICONS.Plus /> Add Education
              </button>
            </div>
            {data.education.map((edu) => (
              <div key={edu.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50 space-y-4 relative">
                <button 
                  onClick={() => removeEducation(edu.id)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <ICONS.Trash />
                </button>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Institution</label>
                    <input 
                      type="text" value={edu.institution} 
                      onChange={e => updateEducation(edu.id, 'institution', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Degree</label>
                    <input 
                      type="text" value={edu.degree} 
                      onChange={e => updateEducation(edu.id, 'degree', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Field of Study</label>
                    <input 
                      type="text" value={edu.field} 
                      onChange={e => updateEducation(edu.id, 'field', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Graduation Date</label>
                    <input 
                      type="month" value={edu.gradDate} 
                      onChange={e => updateEducation(edu.id, 'gradDate', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800">Skills</h3>
              <div className="flex gap-2">
                <button 
                  onClick={handleSuggestSkills}
                  disabled={loading === 'skills'}
                  className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-md text-sm hover:bg-indigo-100 transition-colors disabled:opacity-50"
                >
                  <ICONS.Magic /> {loading === 'skills' ? 'Analyzing...' : 'AI Suggest Skills'}
                </button>
                <button 
                    onClick={() => addSkill()}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-indigo-700 transition-colors"
                >
                    <ICONS.Plus /> Add Skill
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.skills.map((skill) => (
                <div key={skill.id} className="flex items-center gap-2 p-2 border rounded-md bg-slate-50">
                  <input 
                    type="text" value={skill.name} 
                    onChange={e => onChange({ ...data, skills: data.skills.map(s => s.id === skill.id ? { ...s, name: e.target.value } : s) })}
                    className="flex-1 bg-transparent outline-none text-sm px-1 border-b border-transparent focus:border-indigo-400"
                    placeholder="Skill name"
                  />
                  <select 
                    value={skill.level}
                    onChange={e => onChange({ ...data, skills: data.skills.map(s => s.id === skill.id ? { ...s, level: e.target.value as any } : s) })}
                    className="text-xs bg-white border rounded px-1 outline-none"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Expert</option>
                  </select>
                  <button 
                    onClick={() => onChange({ ...data, skills: data.skills.filter(s => s.id !== skill.id) })}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <ICONS.Trash />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'languages' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800">Language Skills</h3>
              <button 
                onClick={addLanguage}
                className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-indigo-700 transition-colors"
              >
                <ICONS.Plus /> Add Language
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.languages.map((lang) => (
                <div key={lang.id} className="flex items-center gap-2 p-2 border rounded-md bg-slate-50">
                  <input 
                    type="text" value={lang.name} 
                    onChange={e => onChange({ ...data, languages: data.languages.map(l => l.id === lang.id ? { ...l, name: e.target.value } : l) })}
                    className="flex-1 bg-transparent outline-none text-sm px-1 border-b border-transparent focus:border-indigo-400"
                    placeholder="Language name"
                  />
                  <select 
                    value={lang.proficiency}
                    onChange={e => onChange({ ...data, languages: data.languages.map(l => l.id === lang.id ? { ...l, proficiency: e.target.value as any } : l) })}
                    className="text-xs bg-white border rounded px-1 outline-none"
                  >
                    <option>Native</option>
                    <option>Fluent</option>
                    <option>Professional</option>
                    <option>Intermediate</option>
                    <option>Basic</option>
                  </select>
                  <button 
                    onClick={() => onChange({ ...data, languages: data.languages.filter(l => l.id !== lang.id) })}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <ICONS.Trash />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800">Projects</h3>
              <button 
                onClick={() => onChange({ ...data, projects: [...data.projects, { id: Date.now().toString(), title: '', description: '', link: '' }] })}
                className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-indigo-700 transition-colors"
              >
                <ICONS.Plus /> Add Project
              </button>
            </div>
            {data.projects.map((proj) => (
              <div key={proj.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50 space-y-3 relative">
                 <button 
                  onClick={() => onChange({ ...data, projects: data.projects.filter(p => p.id !== proj.id) })}
                  className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <ICONS.Trash />
                </button>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Project Title</label>
                  <input 
                    type="text" value={proj.title} 
                    onChange={e => onChange({ ...data, projects: data.projects.map(p => p.id === proj.id ? { ...p, title: e.target.value } : p) })}
                    className="w-full px-3 py-2 border rounded-md bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Link (Optional)</label>
                  <input 
                    type="text" value={proj.link} 
                    onChange={e => onChange({ ...data, projects: data.projects.map(p => p.id === proj.id ? { ...p, link: e.target.value } : p) })}
                    className="w-full px-3 py-2 border rounded-md bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Description</label>
                  <textarea 
                    rows={2}
                    value={proj.description} 
                    onChange={e => onChange({ ...data, projects: data.projects.map(p => p.id === proj.id ? { ...p, description: e.target.value } : p) })}
                    className="w-full px-3 py-2 border rounded-md bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeForm;
