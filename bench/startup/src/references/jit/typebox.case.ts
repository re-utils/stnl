import { Type } from '@sinclair/typebox';
import { TypeCompiler } from '@sinclair/typebox/compiler';

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

Function(TypeCompiler.Code(mod, []))();
