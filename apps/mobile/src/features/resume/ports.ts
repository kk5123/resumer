import { createPorts } from '@/shared/ports';
import { ResumeRepo } from '@/domain/resume/repo';

export type ResumePorts = { resumeRepo: ResumeRepo };

const { set, get } = createPorts<ResumePorts>('ResumePorts');
export const setResumePorts = set;
export const getResumePorts = get;
