import express from 'express';
import axios from 'axios';

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

// Function to fetch commit logs
const fetchCommitLogs = async (repo: string, owner: string): Promise<Commit[]> => {
  const url = `https://api.github.com/repos/${owner}/${repo}/commits`;

  try {
    const response = await axios.get(url);
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

// API endpoint to get commit details
app.get('/commits', async (req, res) => {
  const { repo, owner } = req.query;

  if (typeof repo !== 'string' || typeof owner !== 'string') {
    return res.status(400).json({ error: 'Invalid query parameters. Both "repo" and "owner" are required.' });
  }

  try {
    const commits = await fetchCommitLogs(repo, owner);
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
