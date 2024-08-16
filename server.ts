import express from 'express';
import axios from 'axios';
import path from 'path';

// Define a type for the commit log data
interface Commit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
}

// Function to fetch commit logs with pagination
const fetchCommitLogs = async (repo: string, owner: string, page: number, perPage: number): Promise<Commit[]> => {
  const url = `https://api.github.com/repos/${owner}/${repo}/commits`;
  
  try {
    const response = await axios.get(url, {
      params: {
        page,
        per_page: perPage
      }
    });
    return response.data as Commit[];
  } catch (error) {
    console.error('Error fetching commit logs:', error);
    throw error;
  }
};

// Function to extract URLs from commit messages
const extractUrls = (message: string): string[] => {
  const urlRegex = /https?:\/\/[^\s]+/g;
  return message.match(urlRegex) || [];
};

// Function to format and extract detailed commit information
const extractCommitDetails = (commit: Commit) => {
  const { sha, commit: { message, author } } = commit;
  const urls = extractUrls(message);

  return {
    sha,
    message,
    authorName: author.name,
    authorEmail: author.email,
    authorDate: author.date,
    urls
  };
};

// Create an Express app
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public'

// API endpoint to get commit details with pagination
app.get('/api/commits', async (req, res) => {
  const { repo, owner, page = 1, per_page = 30 } = req.query;

  if (typeof repo !== 'string' || typeof owner !== 'string') {
    return res.status(400).json({ error: 'Invalid query parameters. Both "repo" and "owner" are required.' });
  }

  const pageNumber = parseInt(page as string, 10);
  const perPageNumber = parseInt(per_page as string, 10);

  if (isNaN(pageNumber) || isNaN(perPageNumber) || pageNumber <= 0 || perPageNumber <= 0) {
    return res.status(400).json({ error: 'Invalid pagination parameters. "page" and "per_page" must be positive integers.' });
  }

  try {
    const commits = await fetchCommitLogs(repo, owner, pageNumber, perPageNumber);
    const detailedCommits = commits.map(extractCommitDetails);
    res.json(detailedCommits);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch commit logs.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
