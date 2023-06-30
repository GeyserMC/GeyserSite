// Get the ID from the URL
let id = window.location.href.includes('?') ? window.location.href.split('?').pop() : ''
if (id === '' || id === undefined) {
  id = window.location.hash.slice(1)
}

const inputForm = document.querySelector('#inputForm')
const statusMessage = document.querySelector('#statusMessage')
const dumpBreakdown = document.querySelector('#dumpBreakdown')
const inputId = document.querySelector('#inputId')

inputId.value = id ?? ''

document.querySelector('#btnLoad').addEventListener('click', () => {
  inputForm.classList.add('d-none')
  statusMessage.classList.remove('d-none')

  // Get the ID from the input
  let id = inputId.value
  if (id.startsWith('https://dump.geysermc.org/')) {
    id = id.split('/').pop()
  }

  window.location.hash = '#' + id
  loadDump(id)
})

// If the ID is still empty give the user a form
if (id === '' || id === undefined) {
  inputForm.classList.remove('d-none')
  statusMessage.classList.add('d-none')
} else {
  loadDump(id)
}

function capitalizeFirstLetter (string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

function loadDump (id) {
  // Construct the raw dump URL
  const url = 'https://dump.geysermc.org/raw/' + id

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
    document.querySelector('#buildNumber').textContent = data.gitInfo['git.build.number'] ?? data.gitInfo.buildNumber
    document.querySelector('#commit').textContent = data.gitInfo['git.commit.id.abbrev']
    document.querySelector('#commit').href = 'https://github.com/GeyserMC/Geyser/commit/' + data.gitInfo['git.commit.id']
    document.querySelector('#branch').textContent = data.gitInfo['git.branch']

    // Config
    document.querySelector('#config').textContent = JSON.stringify(data.config, null, 2)

    // Platform Info
    document.querySelector('#platformIdentifier').textContent = data.bootstrapInfo.platform.platformName || data.bootstrapInfo.platform
    document.querySelector('#platformName').textContent = data.bootstrapInfo.platformName ?? capitalizeFirstLetter(data.bootstrapInfo.platform.toLowerCase())
    document.querySelector('#platformVersion').textContent = data.bootstrapInfo.platformVersion ?? 'N/A'
    document.querySelector('#platformAPIVersion').textContent = data.bootstrapInfo.platformAPIVersion ?? 'N/A'
    document.querySelector('#onlineMode').textContent = data.bootstrapInfo.onlineMode ?? 'N/A'

    dumpBreakdown.classList.remove('d-none')
    statusMessage.classList.add('d-none')
    inputForm.classList.add('d-none')
  }).catch((error) => {
    statusMessage.innerHTML = 'An error occurred while loading the dump. Please try again later.<br><br>' + error
    inputForm.classList.remove('d-none')
  })
}
