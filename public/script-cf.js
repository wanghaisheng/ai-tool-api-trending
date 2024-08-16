document.getElementById('repoForm').addEventListener('submit', async (e) => {
  e.preventDefault()

  const repo = document.getElementById('repo').value
  const owner = document.getElementById('owner').value
  const page = document.getElementById('page').value
  const perPage = document.getElementById('per_page').value

  try {
    const response = await fetch(`https://<YOUR_WORKER_SUBDOMAIN>.workers.dev/api/commits?repo=${repo}&owner=${owner}&page=${page}&per_page=${perPage}`)
    const commits = await response.json()
    displayCommits(commits)
  } catch (error) {
    console.error('Error fetching commits:', error)
  }
})

function displayCommits(commits) {
  const commitList = document.getElementById('commitList')
  commitList.innerHTML = ''

  if (commits.length === 0) {
    commitList.innerHTML = '<p>No commits found.</p>'
    return
  }

  commits.forEach(commit => {
    const commitDiv = document.createElement('div')
    commitDiv.className = 'commit'
    commitDiv.innerHTML = `
      <strong>SHA:</strong> ${commit.sha} <br>
      <strong>Message:</strong> ${commit.message} <br>
      <strong>Author:</strong> ${commit.authorName} <${commit.authorEmail}> <br>
      <strong>Date:</strong> ${commit.authorDate} <br>
      <strong>URLs:</strong> ${commit.urls.join(', ')}
    `
    commitList.appendChild(commitDiv)
  })
}
