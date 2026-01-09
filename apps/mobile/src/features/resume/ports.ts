import { ResumeRepo } from '@/domain/resume/repo';

export type ResumePorts = { resumeRepo: ResumeRepo };

let resumePorts: ResumePorts | undefined;

export function setResumePorts(value: ResumePorts) {
  resumePorts = value;
}

export function getResumePorts(): ResumePorts {
  if (!resumePorts) throw new Error('ResumePorts not initialized');
  return resumePorts;
}
