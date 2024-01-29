/* global location bootstrap fetch */

window.addEventListener('load', () => {
  const hash = location.hash.replace(/^#/, '').toLowerCase() // Remove the # from the hash
  if (hash) {
    const tab = document.querySelector('.nav-tabs button[data-bs-target="#' + hash + '"]')
    if (tab) {
      bootstrap.Tab.getOrCreateInstance(tab).show()
    }
  }

  // Change hash for page-reload
  document.querySelectorAll('.nav-tabs button').forEach((element) => element.addEventListener('shown.bs.tab', (e) => {
    window.location.hash = e.target.dataset.bsTarget
    loadBuilds(e.target.dataset.bsTarget)
  }))

  const currentTabTarget = document.querySelectorAll('.nav-tabs button.active')[0].dataset.bsTarget
  if (currentTabTarget !== '#other') {
    loadBuilds(currentTabTarget)
  }
})

function loadBuilds (target) {
  const tab = document.querySelector(target)
  const project = target.substring(1)

  const statusSection = tab.querySelector('#' + project + 'StatusSection')
  const placeholder = statusSection.querySelector('.placeholder-glow')

  const buildsSection = tab.querySelector('#' + project + 'BuildsSection')
  const buildInfo = buildsSection.querySelector('.build-info')
  const downloadButtons = buildsSection.querySelector('.download-buttons')
  const commitLog = tab.querySelector('.commit-log')

  const processDownloadData = (data) => {
    if (data.error) {
      throw new Error(data.error)
    }

    // Reverse the builds so the latest build is first
    data.builds.reverse()

    // Build the changelog
    let count = 0
    for (const build of data.builds) {
      if (count >= 10) {
        break
      }
      for (const change of build.changes) {
        if (count >= 10) {
          break
        }

        commitLog.innerHTML += `<p><a href="https://github.com/GeyserMC/${project}/commit/${change.commit}">${change.commit.substring(0, 7)}</a> &bull; ${change.summary}</p>`
        count++
      }
    }

    // Grab the latest build
    const latestBuild = data.builds[0]

    const releaseDate = new Date(latestBuild.time)

    // Add the build number and release date if there is more than one download
    buildInfo.innerHTML = `<span>Build #${latestBuild.build} &bull; ${releaseDate.toLocaleDateString()}</span>`

    for (const platformId in latestBuild.downloads) {
      let title = platformId.charAt(0).toUpperCase() + platformId.slice(1)
      let icon = ''
      for (const platformInfo of window.platforms) {
        if (title.toLowerCase().includes(platformInfo.name)) {
          if (platformInfo.title) {
            title = platformInfo.title
          }

          icon = `<img src="${platformInfo.icon}" alt="${platformInfo.name}" class="me-1 icon">`
          break
        }
      }

      downloadButtons.innerHTML += `
          <div class="col-sm-12 col-lg-6 py-2">
            <div class="card h-100">
              <div class="card-body">
                  <h5 class="card-title d-flex align-items-center">${icon}${title}</h5>
              </div>
              <div class="card-footer d-grid">
                <a class="btn btn-success" href="https://download.geysermc.org/v2/projects/${latestBuild.project_id}/versions/latest/builds/latest/downloads/${platformId}">
                  <i class="bi bi-download pe-1"></i> Download
                </a>
              </div>
            </div>
          </div>`
    }

    // Hide the placeholder
    placeholder.style.display = 'none'
  }

  if (placeholder.style.display !== 'none') {
    fetch(`https://download.geysermc.org/v2/projects/${project}/versions/latest/builds`).then((response) => response.json()).then((data) => {
      processDownloadData(data)
    }).catch((e) => {
      console.error('Failed to fetch builds for ' + project, e)
      placeholder.style.display = 'none'
      statusSection.innerHTML += '<div class="alert alert-danger mb-0" role="alert">Failed to load builds</div>'
    })
  }
}