// Normalized data structure for feeds and posts
// src/dataStore.js
class DataStore {
  constructor() {
    this.feeds = new Map();
    this.posts = new Map();
    this.feedPosts = new Map();
    this.feedUrls = new Map();
  }

  normalizeUrl(url) {
    if (!url) return '';
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`
        .replace(/\/+$/, '')
        .toLowerCase();
    } catch (e) {
      return url.toLowerCase().trim();
    }
  }

  hasUrl(url) {
    if (!url) return false;
    const normalizedUrl = this.normalizeUrl(url);
    return this.feedUrls.has(normalizedUrl);
  }

  addFeed(feed, posts = []) {
    if (!feed?.id) {
      throw new Error('Invalid feed object');
    }

    // Check for duplicates
    if (this.hasUrl(feed.url) || (feed.originalUrl && this.hasUrl(feed.originalUrl))) {
      throw new Error('DUPLICATE_URL');
    }

    // Store feed
    this.feeds.set(feed.id, feed);
    
    // Store normalized URLs
    const normalizedUrl = this.normalizeUrl(feed.url);
    this.feedUrls.set(normalizedUrl, feed.id);
    
    if (feed.originalUrl) {
      const normalizedOriginalUrl = this.normalizeUrl(feed.originalUrl);
      this.feedUrls.set(normalizedOriginalUrl, feed.id);
    }

    // Store posts
    const postIds = new Set();
    posts.forEach((post) => {
      const postWithFeedId = { ...post, feedId: feed.id };
      this.posts.set(post.id, postWithFeedId);
      postIds.add(post.id);
    });
    this.feedPosts.set(feed.id, postIds);

    return feed.id;
  }

  // ... rest of the methods
}

  // Get feed by ID
  getFeed(feedId) {
    return this.feeds.get(feedId);
  }

  // Get all feeds
  getAllFeeds() {
    return Array.from(this.feeds.values());
  }

  // Get posts for a specific feed
  getFeedPosts(feedId) {
    const postIds = this.feedPosts.get(feedId) || new Set();
    return Array.from(postIds).map(postId => this.posts.get(postId)).filter(Boolean);
  }

  // Get all posts
  getAllPosts() {
    return Array.from(this.posts.values());
  }

  // Check if feed URL already exists
  hasFeedUrl(url) {
    return this.feedUrls.has(url);
  }

  // Remove feed and its posts
  removeFeed(feedId) {
    const feed = this.feeds.get(feedId);
    if (!feed) return false;

    // Remove feed URL from tracking
    this.feedUrls.delete(feed.originalUrl);

    // Remove all posts for this feed
    const postIds = this.feedPosts.get(feedId) || new Set();
    postIds.forEach(postId => this.posts.delete(postId));

    // Remove feed-posts relationship
    this.feedPosts.delete(feedId);

    // Remove feed
    this.feeds.delete(feedId);

    return true;
  }

  // Get feed statistics
  getStats() {
    return {
      totalFeeds: this.feeds.size,
      totalPosts: this.posts.size,
      feedsWithPosts: Array.from(this.feedPosts.entries()).map(([feedId, postIds]) => ({
        feedId,
        feedTitle: this.feeds.get(feedId)?.title || 'Unknown',
        postCount: postIds.size
      }))
    };
  }

  // Add new posts to existing feed
  addNewPosts(feedId, newPosts) {
    if (!this.feeds.has(feedId)) {
      throw new Error(`Feed with ID ${feedId} not found`);
    }

    const existingPostIds = this.feedPosts.get(feedId) || new Set();
    const addedPosts = [];

    newPosts.forEach(post => {
      // Check if post already exists by comparing link or title+date
      const isDuplicate = Array.from(existingPostIds).some(postId => {
        const existingPost = this.posts.get(postId);
        return existingPost && (
          existingPost.link === post.link ||
          (existingPost.title === post.title && existingPost.pubDate === post.pubDate)
        );
      });

      if (!isDuplicate) {
        const postWithFeedId = { ...post, feedId };
        this.posts.set(post.id, postWithFeedId);
        existingPostIds.add(post.id);
        addedPosts.push(post);
      }
    });

    this.feedPosts.set(feedId, existingPostIds);
    return addedPosts;
  }

  // Update feed metadata (last checked time, etc.)
  updateFeedMetadata(feedId, metadata) {
    const feed = this.feeds.get(feedId);
    if (feed) {
      const updatedFeed = { ...feed, ...metadata };
      this.feeds.set(feedId, updatedFeed);
      return updatedFeed;
    }
    return null;
  }

  // Mark post as read
  markPostAsRead(postId) {
    this.readPosts.add(postId);
  }

  // Check if post is read
  isPostRead(postId) {
    return this.readPosts.has(postId);
  }

  // Get read posts count
  getReadPostsCount() {
    return this.readPosts.size;
  }

  // Get unread posts for a feed
  getUnreadFeedPosts(feedId) {
    const allPosts = this.getFeedPosts(feedId);
    return allPosts.filter(post => !this.isPostRead(post.id));
  }

  // Clear all data
  clear() {
    this.feeds.clear();
    this.posts.clear();
    this.feedPosts.clear();
    this.feedUrls.clear();
    this.readPosts.clear();
  }
}

// Create singleton instance
export const dataStore = new DataStore();

// Export class for testing
export { DataStore };
