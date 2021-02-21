/* global $ fetch */

let selectedSoftware = 'geyser'

// TODO: Restrucure how this is stored
let builds = []

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
  const response = await fetch('https://repo.opencollab.dev/api/plugins/execute/geyserArtifacts', { mode: 'cors', cache: 'no-cache' })
  const data = await response.json()

  builds = []
  for (const build of data[software]) {
    builds.push(build.build)

    for (const artifact of build.artifacts) {
      const platform = artifact.name

      if (!(platform in artifacts)) {
        artifacts[platform] = {}
      }

      artifacts[platform][build.build] = artifact
    }

    // Only collect 10 builds
    // TODO: Make this configurable?
    if (builds.length >= 10) {
      break
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
        const artifact = artifacts[elem.dataset.value][build.toString()]
        buttons += `<td><div class="d-grid"><a class="btn btn-primary" href="https://repo.opencollab.dev/${artifact.path}" download="${selectedSoftware}-${elem.dataset.value}"><i class="fas fa-cloud-download-alt"></i>&nbsp;&nbsp;#${build}</a></div></td>`
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

  await generateButtons(builds, artifacts)
}

getDownloads()
