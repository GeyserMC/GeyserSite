let id = window.location.href.split('?').pop()
if (id === '' || id === undefined) {
  id = window.location.hash.slice(1)
}

const url = 'https://dump.geysermc.org/raw/' + id

function capitalizeFirstLetter (string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

fetch(url).then((response) => response.json()).then((data) => {
  // Check for error
  if (data.message) {
    throw new Error(data.message)
  }

  // Versions
  document.querySelector('#geyserVersion').textContent = data.versionInfo.version
  document.querySelector('#javaVersion').textContent = data.versionInfo.javaVersion + ' (' + data.versionInfo.architecture + ')'
  document.querySelector('#osVersion').textContent = data.versionInfo.operatingSystem + ' ' + data.versionInfo.operatingSystemVersion

  // Geyser Versions
  document.querySelector('#buildNumber').textContent = data.gitInfo.buildNumber
  document.querySelector('#buildNumber').href = 'https://ci.opencollab.dev/job/GeyserMC/job/Geyser/job/master/' + data.gitInfo.buildNumber + '/'
  document.querySelector('#commit').textContent = data.gitInfo['git.commit.id.abbrev']
  document.querySelector('#commit').href = 'https://github.com/GeyserMC/Geyser/commit/' + data.gitInfo['git.commit.id']
  document.querySelector('#branch').textContent = data.gitInfo['git.branch']

  // Config
  document.querySelector('#config').textContent = JSON.stringify(data.config, null, 2)

  // Platform Info
  document.querySelector('#platformIdentifier').textContent = data.bootstrapInfo.platform
  document.querySelector('#platformName').textContent = data.bootstrapInfo.platformName ?? capitalizeFirstLetter(data.bootstrapInfo.platform.toLowerCase())
  document.querySelector('#platformVersion').textContent = data.bootstrapInfo.platformVersion ?? 'N/A'
  document.querySelector('#platformAPIVersion').textContent = data.bootstrapInfo.platformAPIVersion ?? 'N/A'
  document.querySelector('#onlineMode').textContent = data.bootstrapInfo.onlineMode ?? 'N/A'

  document.querySelector('#dumpBreakdown').classList.remove('d-none')
  document.querySelector('#statusMessage').classList.add('d-none')
}).catch((error) => {
  document.querySelector('#statusMessage').innerHTML = 'An error occurred while loading the dump. Please try again later.<br><br>' + error
})
