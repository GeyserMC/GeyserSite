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
  }))
})

;['geyser', 'floodgate'].forEach(project => {
  fetch(`https://download.geysermc.org/v2/projects/${project}/versions/latest/builds/latest`).then((response) => response.json()).then((data) => {
    const releaseDate = new Date(data.time)
    document.querySelectorAll(`.btn-${project}-download`).forEach((element) => {
      element.innerHTML += `<br><span class="fs-small">Build #${data.build} &bull; ${releaseDate.toLocaleDateString()}</span>`
    })
  })
})
