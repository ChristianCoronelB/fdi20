import { defineConfig } from 'prisma/config'

export default defineConfig({
  earlyAccess: true,
  schema: 'prisma/schema.prisma',
  db: {
    url: 'file:./db/custom.db',
  },
  migrate: {
    datasources: {
      db: {
        url: 'file:./db/custom.db',
      },
    },
  },
})
