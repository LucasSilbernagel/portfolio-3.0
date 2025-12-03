const plugins = ({ env }) => {
  // Configure cloud-cronjob-runner plugin
  // These environment variables should be automatically provided by Strapi Cloud
  // If not set, provide defaults to prevent validation errors
  const apiToken = env('CLOUD_CRONJOB_API_TOKEN')
  const apiUrl = env('CLOUD_CRONJOB_API_URL')
  const firstRunWindow = env('CLOUD_CRONJOB_FIRST_RUN_WINDOW', '0-23')

  const pluginConfig: Record<string, unknown> = {}

  // Configure upload plugin to use local provider
  // The prestart script ensures the directory exists
  pluginConfig.upload = {
    config: {
      provider: 'local',
      providerOptions: {
        sizeLimit: 10000000, // 10MB
      },
    },
  }

  // If required env vars are missing, disable the plugin
  if (!apiToken || !apiUrl) {
    pluginConfig['cloud-cronjob-runner'] = {
      enabled: false,
    }
  } else {
    pluginConfig['cloud-cronjob-runner'] = {
      enabled: true,
      config: {
        apiToken,
        apiUrl,
        firstRunWindow,
      },
    }
  }

  return pluginConfig
}

export default plugins
