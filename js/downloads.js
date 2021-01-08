/* global $ fetch */

let selectedSoftware = 'Geyser'

let builds = []
let artifacts = {}

$('a[data-toggle="software-tab"]').on('click', function (e) {
  // Handle active switching
  $('a[data-toggle="software-tab"].active').removeClass('active')
  $(e.target).addClass('active')

  selectedSoftware = e.target.dataset.value

  // Handle special visibility
  $('table#downloads th[data-only]').each(function (index, elem) {
    $(elem).css('display', elem.dataset.only === selectedSoftware ? 'table-cell' : 'none')
  })

  $('table#downloads tbody').html('')

  getDownloads()
})

async function getBuilds (software) {
  const response = await fetch('https://repo.opencollab.dev/api/build/GeyserMC%20::%20' + software + '%20::%20master', { mode: 'cors', cache: 'no-cache' })
  const data = await response.json()

  builds = []
  for (const build of data.buildsNumbers) {
    builds.push(build.uri.substring(1))

    // Only collect 5 builds
    // TODO: Make this configurable?
    if (builds.length >= 10) {
      break
    }
  }
}

function getPlatform (uri) {
  let result = uri.match(/bootstrap-([a-z]+)/)
  if (result.length === 2) {
    return result[1]
  }

  result = uri.match(/floodgate-([a-z]+)/)
  if (result.length === 2) {
    return result[1]
  }

  return ''
}

async function getArtifacts (software, builds) {
  artifacts = []

  for (const build of builds) {
    const response = await fetch('https://repo.opencollab.dev/api/search/buildArtifacts', {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        buildName: 'GeyserMC :: ' + software + ' :: master',
        buildNumber: build.toString(),
        mappings: [
          {
            input: '(.+)bootstrap-((?!javadoc|sources).)+.jar'
          }
        ]
      })
    })

    const data = await response.json()

    for (const artifact of data.results) {
      const uri = artifact.downloadUri
      const platform = getPlatform(uri)

      if (platform !== '') {
        if (!(platform in artifacts)) {
          artifacts[platform] = {}
        }

        artifacts[platform][build] = uri
      }
    }
  }
}

async function generateButtons (builds, artifacts) {
  const headers = $('table#downloads th')
  let buttons = ''
  for (const build of builds) {
    buttons += '<tr>'
    headers.each((index, elem) => {
      if (elem.dataset.value in artifacts) {
        buttons += `<td><div class="d-grid"><a class="btn btn-primary" href="${artifacts[elem.dataset.value][build.toString()]}" download="${selectedSoftware}-${elem.dataset.value}"><i class="fas fa-cloud-download-alt"></i>&nbsp;&nbsp;#${build}</a></div></td>`
      } else {
        buttons += '<td>MISSING!</td>'
      }
    })
    buttons += '</tr>'
  }

  $('table#downloads tbody').html(buttons)
}

async function getDownloads () {
  await getBuilds(selectedSoftware)

  await getArtifacts(selectedSoftware, builds)

  await generateButtons(builds, artifacts)
}

getDownloads()
