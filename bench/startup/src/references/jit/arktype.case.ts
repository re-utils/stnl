import { type } from 'arktype';

type.module({
  project: {
    id: 'uuid',
    name: 'string',
    owner_id: 'uuid',
    members: 'user[]',
    tasks: 'task[]',
    created_at: 'string',

    'description?': 'string',
    tags: 'string[]',
  },

  uuid: 'string',
  user_role: '"admin" | "manager" | "developer" | "viewer"',
  task_status: '"todo" | "in_progress" | "review" | "done"',

  comment: {
    id: 'string',
    author_id: 'string',
    content: 'string',
    created_at: 'string',

    'updated_at?': 'string',
  },

  task: {
    id: 'string',
    title: 'string',
    status: 'task_status',
    assignees: 'uuid[]',
    comments: 'comment[]',
    created_at: 'string',

    'description?': 'string',
    'due_date?': 'string',
  },

  user: {
    id: 'uuid',
    name: 'string',
    email: 'string',
    role: 'user_role',
    is_active: 'boolean',
    'last_login?': 'string',
  },
}).project;
