import { Type } from '@sinclair/typebox';
import { TypeCompiler } from '@sinclair/typebox/compiler';
import { t, build } from 'stnl';
import Ajv from 'ajv/dist/jtd';

import { defineTest } from '@lib';
const f = defineTest();

await f.run('stnl', () =>
  build.json.assert.compile(
    t.scope(
      t.dict(
        {
          id: t.ref('uuid'),
          name: t.string,
          owner_id: t.ref('uuid'),
          members: t.list(t.ref('user')),
          tasks: t.list(t.ref('task')),
          created_at: t.string,
        },
        {
          description: t.string,
          tags: t.list(t.string),
        },
      ),
      {
        uuid: t.string,
        user_role: t.union(['admin', 'manager', 'developer', 'viewer']),
        task_status: t.union(['todo', 'in_progress', 'review', 'done']),

        comment: t.dict(
          {
            id: t.string,
            author_id: t.string,
            content: t.string,
            created_at: t.string,
          },
          {
            updated_at: t.string,
          },
        ),

        task: t.dict(
          {
            id: t.string,
            title: t.string,
            status: t.ref('task_status'),
            assignees: t.list(t.ref('uuid')),
            comments: t.list(t.ref('comment')),
            created_at: t.string,
          },
          {
            description: t.string,
            due_date: t.string,
          },
        ),

        user: t.dict(
          {
            id: t.ref('uuid'),
            name: t.string,
            email: t.string,
            role: t.ref('user_role'),
            is_active: t.bool,
          },
          {
            last_login: t.string,
          },
        ),
      },
    ),
  ),
);

await f.run('typebox', () => {
  const mod = Type.Module({
    project: Type.Object({
      id: Type.Ref('uuid'),
      name: Type.String(),
      owner_id: Type.Ref('uuid'),
      members: Type.Array(Type.Ref('user')),
      tasks: Type.Array(Type.Ref('task')),
      created_at: Type.String(),

      description: Type.Optional(Type.String()),
      tags: Type.Array(Type.String()),
    }),

    uuid: Type.String(),

    user_role: Type.Union([
      Type.Literal('admin'),
      Type.Literal('manager'),
      Type.Literal('developer'),
      Type.Literal('viewer'),
    ]),

    task_status: Type.Union([
      Type.Literal('todo'),
      Type.Literal('in_progress'),
      Type.Literal('review'),
      Type.Literal('done'),
    ]),

    comment: Type.Object({
      id: Type.String(),
      author_id: Type.String(),
      content: Type.String(),
      created_at: Type.String(),

      updated_at: Type.Optional(Type.String()),
    }),

    task: Type.Object({
      id: Type.String(),
      title: Type.String(),
      status: Type.Ref('task_status'),
      assignees: Type.Array(Type.Ref('uuid')),
      comments: Type.Array(Type.Ref('comment')),
      created_at: Type.String(),

      description: Type.Optional(Type.String()),
      due_date: Type.Optional(Type.String()),
    }),

    user: Type.Object({
      id: Type.Ref('uuid'),
      name: Type.String(),
      email: Type.String(),
      role: Type.Ref('user_role'),
      is_active: Type.Boolean(),
      last_login: Type.Optional(Type.String()),
    }),
  }).Import('project');

  return Function(TypeCompiler.Code(mod, []))();
});

await f.run('ajv', () =>
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
  }),
);

f.log();
