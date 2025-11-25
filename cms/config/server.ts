const DEFAULT_PORT = 1337

const serverConfig = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', DEFAULT_PORT),
  app: {
    keys: env.array('APP_KEYS'),
  },
})

export default serverConfig
