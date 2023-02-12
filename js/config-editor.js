/* global FileReader Blob */

document.querySelector('#export').addEventListener('click', () => {
  let newConfig = window.config
  document.querySelectorAll('#config-options input, #config-options select').forEach(element => {
    if (element.id === '') return

    const id = element.id.split('.')
    if (id.length === 1) {
      id[1] = id[0]
      id[0] = ''
    }

    const prefix = id[0] === '' ? '' : '  '
    const previous = window.parsedConfig[id[0]][id[1]].value

    const quoteWrapped = previous.startsWith('"') && previous.endsWith('"')
    let value = element.value

    if (element.type === 'checkbox') {
      value = element.checked ? 'true' : 'false'
    }

    const current = quoteWrapped ? '"' + value + '"' : value

    const replaceOld = `${prefix}${id[1]}: ${previous}`
    const replaceNew = `${prefix}${id[1]}: ${current}`
    newConfig = newConfig.replace(replaceOld, replaceNew)
  })

  // Trigger a download of the final config
  downloadString(newConfig, 'text/plain', 'config.yml')
})

// Load the default config
document.querySelector('#default-load').addEventListener('click', () => {
  loaderVisible(true)
  window.fetch('https://raw.githubusercontent.com/GeyserMC/Geyser/master/core/src/main/resources/config.yml').then((res) => {
    return res.text()
  }).then((text) => {
    handleConfigLoad(text)
  })
})

// Load the config from a file
document.querySelector('#file-load').addEventListener('change', (e) => {
  configFromFile(e.srcElement.files[0])
})

// #region Drag and Drop
const dropArea = document.body
const fileOverlay = document.querySelector('#file-overlay')
let lastTarget = null

;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropArea.addEventListener(eventName, preventDefaults)
})

function preventDefaults (e) {
  e.preventDefault()
  e.stopPropagation()
}

['dragenter', 'dragover'].forEach(eventName => {
  dropArea.addEventListener(eventName, highlight)
})

['dragleave', 'drop'].forEach(eventName => {
  dropArea.addEventListener(eventName, unhighlight)
})

function highlight (e) {
  lastTarget = e.target
  fileOverlay.classList.add('highlight')
}

function unhighlight (e) {
  if (e.target === lastTarget || e.target === document) {
    fileOverlay.classList.remove('highlight')
  }
}

dropArea.addEventListener('drop', (e) => {
  const dt = e.dataTransfer
  const files = dt.files

  configFromFile(files[0])
})
// #endregion Drag and Drop

function configFromFile (fileName) {
  // Makse sure the file is a .yml file
  if (!fileName.name.endsWith('.yml')) {
    window.alert('Please select a .yml config file!')
    return
  }

  // Show the loader
  loaderVisible(true)

  // Read the file
  const fileReader = new FileReader()
  fileReader.onload = (e) => {
    handleConfigLoad(e.target.result)
  }
  fileReader.readAsText(fileName)
}

function handleConfigLoad (config) {
  // Save the config into the window and parse
  window.config = config
  window.parsedConfig = loadConfig(config)

  // Generate the HTML for the config options
  generateHTML(window.parsedConfig)

  // Hide the loader
  loaderVisible(false)
}

function loadConfig (config) {
  const lines = config.split('\n')
  let currentSection = ''
  let currentComment = ''

  const newConfig = {}

  // Parse each line of the config
  lines.forEach(line => {
    // Reset the section if we are no indented
    if (!line.startsWith('  ')) {
      currentSection = ''
    }

    // Ignore any empty lines
    line = line.trim()
    if (line === '') {
      currentComment = ''
      return
    }

    // Check if we are in a comment
    if (line.startsWith('#')) {
      currentComment += line.replace(/^# ?/i, '') + '<br>'
      return
    }

    // Ignore these lines since they will fail to parse
    if (!line.includes(':')) {
      return
    }

    // Get the key and value
    const splitLine = line.split(':')
    splitLine[0] = splitLine[0].trim()
    splitLine[1] = splitLine[1].trim()

    // Check if we are in a new section
    if (line.endsWith(':')) {
      currentSection = splitLine[0]
      currentComment = ''
      return
    }

    // Ignore user auths section
    if (currentSection === 'userAuths' || currentSection === 'saved-user-logins') {
      return
    }

    // Add the config option to the config object
    newConfig[currentSection] = newConfig[currentSection] || {}
    newConfig[currentSection][splitLine[0]] = {
      desc: currentComment,
      value: splitLine[1]
    }

    // Reset the comment
    currentComment = ''
  })

  return newConfig
}

function generateHTML (config) {
  // Clear the current HTML
  const configOptions = document.querySelector('#config-options')
  configOptions.innerHTML = ''

  // Create the root element
  const configOptionsContainer = document.createElement('div')
  configOptionsContainer.className = 'container'

  // Loop through each section
  Object.keys(config).forEach(configKey => {
    // Setup the section header
    const container = document.createElement('div')
    container.className = 'card mb-2'
    container.innerHTML = ''
    const prettyKey = configKey === '' ? '&nbsp;' : configKey
    container.innerHTML += `<div class="card-header">${prettyKey}</div>`

    let content = '<div class="card-body">'

    // Loop through each config option
    Object.keys(config[configKey]).forEach(configOption => {
      // Get the config option info
      const configOptionInfo = config[configKey][configOption]

      // Build the HTML for the config option
      content += `<h3>${configOption}</h3>`
      content += `<p>${configOptionInfo.desc}</p>`

      // Get the input type for the config option
      const configOptionKey = configKey === '' ? configOption : `${configKey}.${configOption}`
      content += getInput(configOptionKey, configOptionInfo.value)
    })

    // Close off the section
    content += '</div>'

    // Add the section to the root element
    container.innerHTML += content
    configOptionsContainer.appendChild(container)
  })

  // Add the new HTML to the page
  configOptions.appendChild(configOptionsContainer)
}

function getInput (name, value) {
  switch (name) {
    // Handle all the dropdowns
    case 'remote.auth-type':
      return `<select class="form-select" id="${name}"><option ${value === 'offline' ? 'selected' : ''}>offline</option><option ${value === 'online' ? 'selected' : ''}>online</option><option ${value === 'floodgate' ? 'selected' : ''}>floodgate</option></select>`
    case 'show-cooldown':
      return `<select class="form-select" id="${name}"><option ${value === 'title' ? 'selected' : ''}>title</option><option ${value === 'actionbar' ? 'selected' : ''}>actionbar</option><option ${value === 'false' ? 'selected' : ''}>false</option></select>`
    case 'emote-offhand-workaround':
      return `<select class="form-select" id="${name}"><option ${value === 'disabled' ? 'selected' : ''}>disabled</option><option ${value === 'no-emotes' ? 'selected' : ''}>no-emotes</option><option ${value === 'emotes-and-offhand' ? 'selected' : ''}>emotes-and-offhand</option></select>`
    case 'config-version':
      return `<input class="form-control" type="text" disabled value="${value.replace(/"/g, '')}">`
    case 'metrics.uuid':
      return `<input class="form-control" id="${name}" type="text" disabled value="${value === 'generateduuid' ? createUUID() : value}">`

    default:
      // Handle all the other inputs
      if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') { // Boolean
        return `<div class="form-check form-switch form-control-lg"><input class="form-check-input" type="checkbox" role="switch" id="${name}" ${value.toLowerCase() === 'true' ? 'checked="checked"' : ''}><label for="${name}"></label></div>`
      } else if (!isNaN(value)) { // Number
        return `<input class="form-control" type="number" value="${value}" id="${name}" >`
      } else { // String
        return `<input class="form-control" type="text" value="${value.replace(/"/g, '')}" id="${name}" >`
      }
  }
}

const headerSubtitle = document.querySelector('#subtitle')
const exportSection = document.querySelector('#export-section')
const importSection = document.querySelector('#import-section')

function loaderVisible (isVisible) {
  if (isVisible) {
    headerSubtitle.innerText = 'Loading...'
    exportSection.style.display = 'none'
    importSection.style.display = 'none'
  } else {
    headerSubtitle.innerText = 'Please edit the config below'
    exportSection.style.display = 'flex'
    importSection.style.display = 'flex'
  }
}

// From https://stackoverflow.com/a/873856/5299903
function createUUID () {
  // http://www.ietf.org/rfc/rfc4122.txt
  const s = []
  const hexDigits = '0123456789abcdef'
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
  }
  s[14] = '4' // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1) // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = '-'

  return s.join('')
}

// From https://gist.github.com/danallison/3ec9d5314788b337b682
function downloadString (text, fileType, fileName) {
  const blob = new Blob([text], { type: fileType })

  const a = document.createElement('a')
  a.download = fileName
  a.href = URL.createObjectURL(blob)
  a.dataset.downloadurl = [fileType, a.download, a.href].join(':')
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)

  setTimeout(() => { URL.revokeObjectURL(a.href) }, 1500)
}
