import { t, build } from 'stnl';

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
);
