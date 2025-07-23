import Ajv from 'ajv/dist/jtd';

new Ajv().compile({
  definitions: {
    uuid: {
      type: 'string',
    },
    user_role: {
      enum: ['admin', 'manager', 'developer', 'viewer'],
    },
    task_status: {
      enum: ['todo', 'in_progress', 'review', 'done'],
    },
    comment: {
      properties: {
        id: { type: 'string' },
        author_id: { type: 'string' },
        content: { type: 'string' },
        created_at: { type: 'string' },
      },
      optionalProperties: {
        updated_at: { type: 'string' },
      },
    },
    task: {
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        status: { ref: 'task_status' },
        assignees: {
          elements: { ref: 'uuid' },
        },
        comments: {
          elements: { ref: 'comment' },
        },
        created_at: { type: 'string' },
      },
      optionalProperties: {
        description: { type: 'string' },
        due_date: { type: 'string' },
      },
    },
    user: {
      properties: {
        id: { ref: 'uuid' },
        name: { type: 'string' },
        email: { type: 'string' },
        role: { ref: 'user_role' },
        is_active: { type: 'boolean' },
      },
      optionalProperties: {
        last_login: { type: 'string' },
      },
    },
    project: {
      properties: {
        id: { ref: 'uuid' },
        name: { type: 'string' },
        owner_id: { ref: 'uuid' },
        members: {
          elements: { ref: 'user' },
        },
        tasks: {
          elements: { ref: 'task' },
        },
        created_at: { type: 'string' },
      },
      optionalProperties: {
        description: { type: 'string' },
        tags: {
          elements: { type: 'string' },
        },
      },
    },
  },
  ref: 'project',
});
