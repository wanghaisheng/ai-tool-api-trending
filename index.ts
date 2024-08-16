import axios from 'axios';

// Define a type for the commit log data
interface Commit {
  sha: string;
  commit: {
    message: string;
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

// Main function to fetch and parse commit logs
const main = async () => {
  const repo = 'huggingface.js';
  const owner = 'huggingface';

  try {
    const commits = await fetchCommitLogs(repo, owner);
    
    commits.forEach(commit => {
      const urls = extractUrls(commit.commit.message);
      if (urls.length > 0) {
        console.log(`Commit SHA: ${commit.sha}`);
        console.log(`Commit Message: ${commit.commit.message}`);
        console.log(`Extracted URLs: ${urls.join(', ')}`);
        console.log('---');
      }
    });
  } catch (error) {
    console.error('Error:', error);
  }
};

main();
