const plugins = ({ env }) => {
  // Configure cloud-cronjob-runner plugin
  // These environment variables should be automatically provided by Strapi Cloud
  // If not set, provide defaults to prevent validation errors
  const apiToken = env('CLOUD_CRONJOB_API_TOKEN')
  const apiUrl = env('CLOUD_CRONJOB_API_URL')
  const firstRunWindow = env('CLOUD_CRONJOB_FIRST_RUN_WINDOW', '0-23')

  // If required env vars are missing, disable the plugin
  if (!apiToken || !apiUrl) {
    return {
      'cloud-cronjob-runner': {
        enabled: false,
      },
    }
  }

  return {
    'cloud-cronjob-runner': {
      enabled: true,
      config: {
        apiToken,
        apiUrl,
        firstRunWindow,
      },
    },
  }
}

export default plugins
