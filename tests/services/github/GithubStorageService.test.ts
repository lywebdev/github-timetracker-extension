import { GitHubStorageService } from '../../../src/services/github/GitHubStorageService';
import { STORAGE_KEYS } from '../../../src/utils/constants';
import { IStorageService, IHttpClientFactory, IHttpClient } from '../../../src/services/github/interfaces';
import { UserService } from '../../../src/services/github/UserService';
import {User} from "../../../src/types/github/users/User";

// Mock dependencies
jest.mock('../../../src/services/github/UserService');

const mockUser: User = {
  login: 'test-user',
  id: 1,
  node_id: 'MDQ6VXNlcjE=',
  avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
  gravatar_id: null,
  url: 'https://api.github.com/users/test-user',
  html_url: 'https://github.com/test-user',
  followers_url: 'https://api.github.com/users/test-user/followers',
  following_url: 'https://api.github.com/users/test-user/following{/other_user}',
  gists_url: 'https://api.github.com/users/test-user/gists{/gist_id}',
  starred_url: 'https://api.github.com/users/test-user/starred{/owner}{/repo}',
  subscriptions_url: 'https://api.github.com/users/test-user/subscriptions',
  organizations_url: 'https://api.github.com/users/test-user/orgs',
  repos_url: 'https://api.github.com/users/test-user/repos',
  events_url: 'https://api.github.com/users/test-user/events{/privacy}',
  received_events_url: 'https://api.github.com/users/test-user/received_events',
  type: 'User',
  site_admin: false,
  name: null,
  company: null,
  blog: null,
  location: null,
  email: null,
  hireable: null,
  bio: null,
  twitter_username: null,
  public_repos: 0,
  public_gists: 0,
  followers: 0,
  following: 0,
  created_at: '2020-01-01T00:00:00Z',
  updated_at: '2020-01-01T00:00:00Z',
  private_gists: 0,
  total_private_repos: 0,
  owned_private_repos: 0,
  disk_usage: 0,
  collaborators: 0,
  two_factor_authentication: false,
  plan: {
    name: 'free',
    space: 1000000,
    private_repos: 0,
    collaborators: 0,
  },
};

describe('GitHubStorageService', () => {
  let storageService: jest.Mocked<IStorageService>;
  let clientFactory: jest.Mocked<IHttpClientFactory>;
  let githubStorageService: GitHubStorageService;
  let mockClient: jest.Mocked<IHttpClient>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mocks
    storageService = {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      getMultiple: jest.fn(),
      removeMultiple: jest.fn(),
    } as jest.Mocked<IStorageService>;

    mockClient = {
      get: jest.fn(),
      post: jest.fn(),
    } as jest.Mocked<IHttpClient>;

    clientFactory = {
      create: jest.fn().mockReturnValue(mockClient),
    } as jest.Mocked<IHttpClientFactory>;

    githubStorageService = new GitHubStorageService(storageService, clientFactory);
  });

  describe('getGitHubToken', () => {
    it('should return token when storage returns a string', async () => {
      const expectedToken = 'valid-token';
      storageService.get.mockResolvedValue(expectedToken);

      const result = await githubStorageService.getGitHubToken();

      expect(storageService.get).toHaveBeenCalledWith(STORAGE_KEYS.GITHUB_TOKEN);
      expect(result).toBe(expectedToken);
    });

    it('should return null when storage returns non-string', async () => {
      storageService.get.mockResolvedValue(123);

      const result = await githubStorageService.getGitHubToken();

      expect(storageService.get).toHaveBeenCalledWith(STORAGE_KEYS.GITHUB_TOKEN);
      expect(result).toBeNull();
    });

    it('should return null when storage returns null', async () => {
      storageService.get.mockResolvedValue(null);

      const result = await githubStorageService.getGitHubToken();

      expect(storageService.get).toHaveBeenCalledWith(STORAGE_KEYS.GITHUB_TOKEN);
      expect(result).toBeNull();
    });
  });

  describe('setGitHubToken', () => {
    it('should call storageService.set with correct parameters', async () => {
      const token = 'new-token';

      await githubStorageService.setGitHubToken(token);

      expect(storageService.set).toHaveBeenCalledWith(STORAGE_KEYS.GITHUB_TOKEN, token);
    });
  });

  describe('removeGitHubToken', () => {
    it('should call storageService.remove with correct key', async () => {
      await githubStorageService.removeGitHubToken();

      expect(storageService.remove).toHaveBeenCalledWith(STORAGE_KEYS.GITHUB_TOKEN);
    });
  });

  describe('validateGitHubToken', () => {
    it('should return true when userService.getUser returns a user', async () => {
      const token = 'valid-token';
      jest.spyOn(UserService.prototype, 'getUser').mockResolvedValue(mockUser);

      const result = await githubStorageService.validateGitHubToken(token);

      expect(clientFactory.create).toHaveBeenCalledWith(token);
      expect(result).toBe(true);
    });

    it('should return false when userService.getUser throws an error', async () => {
      const token = 'invalid-token';
      jest.spyOn(UserService.prototype, 'getUser').mockRejectedValue(new Error('Invalid token'));

      const result = await githubStorageService.validateGitHubToken(token);

      expect(clientFactory.create).toHaveBeenCalledWith(token);
      expect(result).toBe(false);
    });
  });
});