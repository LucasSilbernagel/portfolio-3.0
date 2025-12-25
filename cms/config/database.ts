import path from 'node:path'

const DEFAULT_MYSQL_PORT = 3306
const DEFAULT_POSTGRES_PORT = 5432
const DEFAULT_POOL_MIN = 2
const DEFAULT_POOL_MAX = 10
const DEFAULT_CONNECTION_TIMEOUT = 60_000

const getDatabaseConfig = ({ env }) => {
  const client = env('DATABASE_CLIENT', 'sqlite')

  const connections = {
    mysql: {
      connection: {
        client: 'mysql2',
        connection: {
          port: env.int('DATABASE_PORT', DEFAULT_MYSQL_PORT),
          host: env('DATABASE_HOST', 'localhost'),
          database: env('DATABASE_NAME', 'strapi'),
          user: env('DATABASE_USERNAME', 'strapi'),
          password: env('DATABASE_PASSWORD', 'strapi'),
          ssl: env.bool('DATABASE_SSL', false) && {
            key: env('DATABASE_SSL_KEY'),
            cert: env('DATABASE_SSL_CERT'),
            ca: env('DATABASE_SSL_CA'),
            capath: env('DATABASE_SSL_CAPATH'),
            cipher: env('DATABASE_SSL_CIPHER'),
            rejectUnauthorized: env.bool(
              'DATABASE_SSL_REJECT_UNAUTHORIZED',
              true
            ),
          },
        },
        pool: {
          min: env.int('DATABASE_POOL_MIN', DEFAULT_POOL_MIN),
          max: env.int('DATABASE_POOL_MAX', DEFAULT_POOL_MAX),
        },
      },
    },
    postgres: {
      connection: {
        client: 'postgres',
        connection: {
          connectionString: env('DATABASE_URL'),
          port: env.int('DATABASE_PORT', DEFAULT_POSTGRES_PORT),
          database: env('DATABASE_NAME', 'strapi'),
          user: env('DATABASE_USERNAME', 'strapi'),
          password: env('DATABASE_PASSWORD', 'strapi'),
          ssl: env.bool('DATABASE_SSL', false) && {
            key: env('DATABASE_SSL_KEY'),
            cert: env('DATABASE_SSL_CERT'),
            ca: env('DATABASE_SSL_CA'),
            capath: env('DATABASE_SSL_CAPATH'),
            cipher: env('DATABASE_SSL_CIPHER'),
            rejectUnauthorized: env.bool(
              'DATABASE_SSL_REJECT_UNAUTHORIZED',
              true
            ),
          },
          schema: env('DATABASE_SCHEMA', 'public'),
        },
        pool: {
          min: env.int('DATABASE_POOL_MIN', DEFAULT_POOL_MIN),
          max: env.int('DATABASE_POOL_MAX', DEFAULT_POOL_MAX),
        },
      },
    },
    sqlite: {
      connection: {
        client: 'sqlite',
        connection: {
          filename: path.join(
            __dirname,
            '..',
            '..',
            env('DATABASE_FILENAME', '.tmp/data.db')
          ),
        },
        useNullAsDefault: true,
      },
    },
  }
  const selectedConnection = connections[client]

  if (!selectedConnection) {
    throw new Error(`Unsupported database client: ${client}`)
  }

  // Add acquireConnectionTimeout to the connection config
  if (selectedConnection.connection?.connection) {
    selectedConnection.connection.connection.acquireConnectionTimeout = env.int(
      'DATABASE_CONNECTION_TIMEOUT',
      DEFAULT_CONNECTION_TIMEOUT
    )
  }

  return selectedConnection
}

export default getDatabaseConfig
