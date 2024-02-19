/* global fetch */

window.otherDownloadsCache = {}

const otherModal = document.getElementById('otherModal')
if (otherModal) {
  otherModal.addEventListener('show.bs.modal', (event) => {
    const button = event.relatedTarget

    const downloadKey = button.getAttribute('data-bs-download')
    const download = window.otherDownloads[downloadKey]

    window.location.hash = 'other-' + downloadKey

    const title = otherModal.querySelector('#otherModalLabel')
    title.textContent = download.title

    const info = otherModal.querySelector('#otherModalInfo')
    info.innerHTML = download.info

    const setup = otherModal.querySelector('#otherModalSetup')
    if (download.setup_url) {
      otherModal.querySelector('#otherModalSetupTitle').style.display = 'none'
      setup.innerHTML = `
        <a class="btn btn-block btn-info" href="${download.setup_url}">
          <i class="bi bi-book pe-1"></i> Setup instructions
        </a>`
    } else {
      otherModal.querySelector('#otherModalSetupTitle').style.display = 'block'
      setup.innerHTML = download.setup
    }

    const placeholder = otherModal.querySelector('.placeholder-glow')
    placeholder.style.display = 'block'

    const downloadButtons = otherModal.querySelector('#otherModalDownloadBtns')
    downloadButtons.innerHTML = ''

    const processDownloadData = (data) => {
      const releaseDate = new Date(data.time)
      const downloadsCount = Object.keys(data.downloads).length

      // Add the build number and release date if there is more than one download
      if (downloadsCount > 1) {
        downloadButtons.innerHTML += `<span>Build #${data.build} &bull; ${releaseDate.toLocaleDateString()}</span>`
      }

      for (const platformId in data.downloads) {
        let title = data.project_name

        // If there are multiple downloads, use the name of the download
        if (downloadsCount > 1) {
          title = data.downloads[platformId].name
        }

        downloadButtons.innerHTML += `
          <a class="btn btn-block btn-success" href="https://download.geysermc.org/v2/projects/${data.project_id}/versions/latest/builds/latest/downloads/${platformId}">
            <i class="bi bi-download pe-1"></i> Download ${title}`

        // Add the build number and release date if there is only one download
        if (downloadsCount === 1) {
          downloadButtons.innerHTML += `<br><span class="fs-small">Build #${data.build} &bull; ${releaseDate.toLocaleDateString()}</span>`
        }

        downloadButtons.innerHTML += '</a>'
      }

      // Hide the placeholder
      placeholder.style.display = 'none'
    }

    if (window.otherDownloadsCache[downloadKey]) {
      processDownloadData(window.otherDownloadsCache[downloadKey])
    } else {
      fetch(`https://download.geysermc.org/v2/projects/${downloadKey}/versions/latest/builds/latest`).then((response) => response.json()).then((data) => {
        processDownloadData(data)
        window.otherDownloadsCache[downloadKey] = data // Store to cache after to prevent caching errors
      }).catch(() => {
        placeholder.style.display = 'none'
        downloadButtons.innerHTML = '<div class="alert alert-danger mb-0" role="alert">Failed to load downloads</div>'
      })
    }
  })
}
