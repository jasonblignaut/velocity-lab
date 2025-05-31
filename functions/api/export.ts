// functions/api/export.ts

import { Env } from '@cloudflare/workers-types';
import { authenticate, requireAdmin, jsonResponse, logActivity } from './utils';

interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  role: 'user' | 'admin';
  createdAt: string;
  lastLogin?: string;
}

export async function handleExport(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'GET') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const user = await authenticate(request, env);
  const adminCheck = requireAdmin(user);
  if (adminCheck) return adminCheck;

  try {
    const users = await env.USERS.list({ prefix: 'user:' });
    const csvData = ['Name,Email,Role,Progress,Completed Tasks,Week 1,Week 2,Week 3,Week 4,Last Activity'];

    for (const { name: userKey } of users.keys) {
      if (!userKey.startsWith('user:email:') && !userKey.startsWith('user:session:')) {
        const user: User = await env.USERS.get(userKey, { type: 'json' });
        const progressData = (await env.PROGRESS.get(`progress:${user.id}`, { type: 'json' })) || {};
        let completedTasks = 0;
        const weekProgress: number[] = [];

        ['week1', 'week2', 'week3', 'week4'].forEach(week => {
          const weekTasks = progressData[week] || {};
          const completed = Object.values(weekTasks).filter(Boolean).length;
          weekProgress.push(completed);
          completedTasks += completed;
        });

        const progress = Math.round((completedTasks / 14) * 100); // 14 total tasks
        const lastActivity = user.lastLogin || user.createdAt || 'Never';

        csvData.push(
          `"${user.name.replace(/"/g, '""')}","${user.email.replace(/"/g, '""')}","${user.role}",${progress}%,${completedTasks}/14,${weekProgress.join(',')},${lastActivity}`
        );
      }
    }

    await logActivity(env, user.id, 'progress_export');
    return new Response(csvData.join('\n'), {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="velocity-lab-progress-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}