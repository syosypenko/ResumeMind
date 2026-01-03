
import React from 'react';
import { ResumeData } from '../types';

interface ResumePreviewProps {
  data: ResumeData;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ data }) => {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const ModernTemplate = () => (
    <div className="p-8 lg:p-12">
      {/* Header */}
      <header className="text-center mb-10 border-b-2 border-slate-900 pb-8">
        <h1 className="text-4xl lg:text-5xl font-bold uppercase tracking-widest mb-4 leading-tight">
          {data.personal.fullName || 'Your Name'}
        </h1>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm font-sans tracking-wide text-slate-600">
          {data.personal.email && (
            <span className="flex items-center gap-1">{data.personal.email}</span>
          )}
          {data.personal.phone && <span className="hidden sm:inline">•</span>}
          {data.personal.phone && <span>{data.personal.phone}</span>}
          {data.personal.location && <span className="hidden sm:inline">•</span>}
          {data.personal.location && <span>{data.personal.location}</span>}
          {data.personal.website && <span className="hidden sm:inline">•</span>}
          {data.personal.website && (
            <span className="text-slate-800 font-medium">{data.personal.website}</span>
          )}
        </div>
      </header>

      {/* Summary */}
      {data.personal.summary && (
        <section className="mb-10">
          <p className="text-lg leading-relaxed text-justify italic font-light text-slate-800">
            {data.personal.summary}
          </p>
        </section>
      )}

      {/* Experience */}
      {data.experiences.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold uppercase tracking-[0.2em] border-b border-slate-300 mb-6 pb-1">Professional Experience</h2>
          <div className="space-y-8">
            {data.experiences.map((exp) => (
              <div key={exp.id} className="experience-item">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-xl font-bold">{exp.position}</h3>
                  <span className="text-sm font-sans text-slate-500 font-semibold whitespace-nowrap ml-4">
                    {formatDate(exp.startDate)} — {exp.current ? 'PRESENT' : formatDate(exp.endDate)}
                  </span>
                </div>
                <div className="text-lg font-semibold text-slate-700 mb-2">{exp.company}</div>
                <p className="text-base leading-relaxed whitespace-pre-wrap text-slate-800">
                  {exp.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold uppercase tracking-[0.2em] border-b border-slate-300 mb-6 pb-1">Education</h2>
          <div className="space-y-6">
            {data.education.map((edu) => (
              <div key={edu.id} className="education-item flex justify-between items-baseline">
                <div>
                  <h3 className="text-lg font-bold">{edu.institution}</h3>
                  <div className="text-base italic text-slate-700">{edu.degree} in {edu.field}</div>
                </div>
                <span className="text-sm font-sans text-slate-500 font-semibold ml-4">
                  {formatDate(edu.gradDate)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className={`grid grid-cols-1 ${data.projects.length > 0 ? 'md:grid-cols-2' : ''} gap-10`}>
        <div className="skill-group">
          {data.skills.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-bold uppercase tracking-[0.2em] border-b border-slate-300 mb-6 pb-1">Core Competencies</h2>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill) => (
                  <div key={skill.id} className="bg-slate-50 border border-slate-200 px-3 py-1 rounded text-sm font-sans font-semibold text-slate-800">
                    {skill.name} <span className="text-slate-500 text-[10px] ml-1 uppercase font-bold">{skill.level}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.languages.length > 0 && (
            <section>
              <h2 className="text-xl font-bold uppercase tracking-[0.2em] border-b border-slate-300 mb-6 pb-1">Languages</h2>
              <div className="flex flex-wrap gap-2">
                {data.languages.map((lang) => (
                  <div key={lang.id} className="bg-indigo-50 border border-indigo-100 px-3 py-1 rounded text-sm font-sans font-semibold text-indigo-900">
                    {lang.name} <span className="text-indigo-400 text-[10px] ml-1 uppercase font-bold">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {data.projects.length > 0 && (
          <section className="project-item">
            <h2 className="text-xl font-bold uppercase tracking-[0.2em] border-b border-slate-300 mb-6 pb-1">Key Projects</h2>
            <div className="space-y-4">
              {data.projects.map((proj) => (
                <div key={proj.id} className="mb-4">
                  <div className="font-bold text-lg">{proj.title}</div>
                  {proj.link && <div className="text-xs font-sans text-indigo-700 font-medium mb-1 break-all">{proj.link}</div>}
                  <p className="text-sm text-slate-700 italic leading-snug">{proj.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );

  const BalancedTemplate = () => (
    <div className="p-8 lg:p-12">
      <header className="mb-10 border-l-8 border-indigo-600 pl-8 py-2">
        <h1 className="text-4xl lg:text-5xl font-bold uppercase tracking-tighter mb-2 leading-tight text-slate-900">
          {data.personal.fullName || 'Your Name'}
        </h1>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-sans font-bold text-slate-500 uppercase tracking-widest">
          {data.personal.email && <span>{data.personal.email}</span>}
          {data.personal.phone && <span>|</span>}
          {data.personal.phone && <span>{data.personal.phone}</span>}
          {data.personal.location && <span>|</span>}
          {data.personal.location && <span>{data.personal.location}</span>}
          {data.personal.website && <span>|</span>}
          {data.personal.website && <span className="text-indigo-600">{data.personal.website}</span>}
        </div>
      </header>

      {data.personal.summary && (
        <section className="mb-10 bg-slate-50 p-6 rounded-lg border border-slate-200">
          <p className="text-lg leading-relaxed text-slate-700 font-serif italic">
            {data.personal.summary}
          </p>
        </section>
      )}

      {data.projects.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-bold uppercase tracking-widest text-indigo-600 mb-6 flex items-center gap-3">
             Open-Source Projects <span className="h-[1px] flex-1 bg-slate-200"></span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.projects.map((proj) => (
              <div key={proj.id} className="project-item border-b border-slate-100 pb-4">
                <div className="font-bold text-lg text-slate-800">{proj.title}</div>
                {proj.link && <div className="text-xs font-sans text-indigo-600 font-bold mb-2 break-all">{proj.link}</div>}
                <p className="text-sm text-slate-600 leading-snug">{proj.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.experiences.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-bold uppercase tracking-widest text-slate-900 mb-6 flex items-center gap-3">
             Experience <span className="h-[1px] flex-1 bg-slate-200"></span>
          </h2>
          <div className="space-y-10">
            {data.experiences.map((exp) => (
              <div key={exp.id} className="experience-item">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-xl font-bold text-slate-900">{exp.position}</h3>
                  <span className="text-xs font-sans text-slate-400 font-black uppercase">
                    {formatDate(exp.startDate)} — {exp.current ? 'Now' : formatDate(exp.endDate)}
                  </span>
                </div>
                <div className="text-md font-bold text-indigo-700 mb-3">{exp.company}</div>
                <p className="text-base leading-relaxed text-slate-700">
                  {exp.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className={`grid grid-cols-1 ${data.education.length > 0 && (data.skills.length > 0 || data.languages.length > 0) ? 'md:grid-cols-2' : ''} gap-12 pt-8 border-t border-slate-100`}>
        {data.education.length > 0 && (
          <section className="education-item">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Education</h2>
            <div className="space-y-4">
              {data.education.map((edu) => (
                <div key={edu.id} className="mb-4">
                  <h3 className="text-md font-bold text-slate-800">{edu.institution}</h3>
                  <div className="text-sm text-slate-500 font-medium">{edu.degree} in {edu.field}</div>
                  <div className="text-[10px] font-bold text-indigo-400 mt-0.5 uppercase">{formatDate(edu.gradDate)}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="skill-group">
          {data.skills.length > 0 && (
            <section className="mb-8">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Professional Skills</h2>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill) => (
                  <span key={skill.id} className="text-xs font-bold text-slate-600 border border-slate-200 px-2 py-0.5 rounded">
                    {skill.name}
                  </span>
                ))}
              </div>
            </section>
          )}

          {data.languages.length > 0 && (
            <section>
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Languages</h2>
              <div className="flex flex-wrap gap-4">
                {data.languages.map((lang) => (
                  <div key={lang.id} className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800">{lang.name}</span>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );

  const AlpineTemplate = () => (
    <div className="flex flex-col md:flex-row min-h-[1100px] alpine-layout">
      {/* Sidebar */}
      <aside className="w-full md:w-1/3 bg-slate-900 text-slate-200 p-8 lg:p-10 font-sans alpine-sidebar">
        <div className="mb-10">
           <h1 className="text-3xl font-bold text-white mb-2 leading-tight">
            {data.personal.fullName || 'Your Name'}
          </h1>
          <p className="text-indigo-400 font-bold uppercase tracking-widest text-xs">
            {data.experiences[0]?.position || 'Professional'}
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-700 pb-1">Contact</h2>
            <div className="space-y-2 text-sm">
              <p className="break-all">{data.personal.email}</p>
              <p>{data.personal.phone}</p>
              <p>{data.personal.location}</p>
              <p className="text-indigo-400">{data.personal.website}</p>
            </div>
          </section>

          {data.education.length > 0 && (
            <section className="education-item">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-700 pb-1">Education</h2>
              <div className="space-y-4">
                {data.education.map(edu => (
                  <div key={edu.id} className="mb-4">
                    <p className="font-bold text-white text-sm">{edu.institution}</p>
                    <p className="text-xs text-slate-400">{edu.degree}</p>
                    <p className="text-[10px] uppercase font-bold text-indigo-400 mt-1">{formatDate(edu.gradDate)}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.skills.length > 0 && (
            <section className="skill-group">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-700 pb-1">Key Expertise</h2>
              <div className="space-y-3">
                {data.skills.map(skill => (
                  <div key={skill.id} className="mb-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-slate-300">{skill.name}</span>
                      <span className="text-[10px] text-slate-500 uppercase">{skill.level}</span>
                    </div>
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 transition-all duration-500" 
                        style={{ width: skill.level === 'Expert' ? '100%' : skill.level === 'Intermediate' ? '65%' : '35%' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.languages.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-700 pb-1">Languages</h2>
              <div className="space-y-2">
                {data.languages.map(lang => (
                  <div key={lang.id} className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-medium">{lang.name}</span>
                    <span className="text-indigo-400 font-bold uppercase text-[9px]">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-12 bg-white text-slate-900 alpine-main">
        {data.personal.summary && (
          <section className="mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-4 flex items-center gap-2">
              <span className="w-8 h-[1px] bg-indigo-200"></span> Profile
            </h2>
            <p className="text-lg font-serif italic leading-relaxed text-slate-700">
              {data.personal.summary}
            </p>
          </section>
        )}

        {data.experiences.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-6 flex items-center gap-2">
              <span className="w-8 h-[1px] bg-indigo-200"></span> Career History
            </h2>
            <div className="space-y-10">
              {data.experiences.map((exp) => (
                <div key={exp.id} className="experience-item relative pl-6 border-l-2 border-slate-100">
                  <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-indigo-600"></div>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-xl font-bold">{exp.position}</h3>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                      {formatDate(exp.startDate)} — {exp.current ? 'Present' : formatDate(exp.endDate)}
                    </span>
                  </div>
                  <div className="text-md font-bold text-indigo-800 mb-3">{exp.company}</div>
                  <p className="text-base leading-relaxed text-slate-600 font-serif whitespace-pre-wrap">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {data.projects.length > 0 && (
          <section className="project-item">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-6 flex items-center gap-2">
              <span className="w-8 h-[1px] bg-indigo-200"></span> Featured Projects
            </h2>
            <div className="grid grid-cols-1 gap-6">
              {data.projects.map((proj) => (
                <div key={proj.id} className="bg-slate-50 p-4 rounded-lg border-l-4 border-indigo-500 mb-4">
                  <div className="font-bold text-md text-slate-900">{proj.title}</div>
                  {proj.link && <div className="text-xs font-sans text-indigo-600 mb-2">{proj.link}</div>}
                  <p className="text-sm text-slate-600 leading-snug italic">{proj.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );

  return (
    <div 
      id="resume-preview"
      className="bg-white mx-auto shadow-2xl min-h-[1100px] w-full max-w-[850px] border border-slate-100 overflow-hidden"
    >
      {data.template === 'alpine' ? (
        <AlpineTemplate />
      ) : data.template === 'balanced' ? (
        <BalancedTemplate />
      ) : (
        <ModernTemplate />
      )}
    </div>
  );
};

export default ResumePreview;
