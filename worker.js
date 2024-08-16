addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const repo = url.searchParams.get('repo')
  const owner = url.searchParams.get('owner')
  const page = url.searchParams.get('page') || 1
  const perPage = url.searchParams.get('per_page') || 30

  if (!repo || !owner) {
    return new Response('Invalid query parameters. Both "repo" and "owner" are required.', { status: 400 })
  }

  const pageNumber = parseInt(page, 10)
  const perPageNumber = parseInt(perPage, 10)

  if (isNaN(pageNumber) || isNaN(perPageNumber) || pageNumber <= 0 || perPageNumber <= 0) {
    return new Response('Invalid pagination parameters. "page" and "per_page" must be positive integers.', { status: 400 })
  }

  try {
    const commits = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?page=${pageNumber}&per_page=${perPageNumber}`)
    const data = await commits.json()
    const detailedCommits = data.map(commit => ({
      sha: commit.sha,
      message: commit.commit.message,
      authorName: commit.commit.author.name,
      authorEmail: commit.commit.author.email,
      authorDate: commit.commit.author.date,
      urls: (commit.commit.message.match(/https?:\/\/[^\s]+/g) || [])
    }))
    return new Response(JSON.stringify(detailedCommits), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response('Failed to fetch commit logs.', { status: 500 })
  }
}
