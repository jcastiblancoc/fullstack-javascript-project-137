// Normalized data structure for feeds and posts
class DataStore {
  constructor() {
    this.feeds = new Map(); // feedId -> feed object
    this.posts = new Map(); // postId -> post object
    this.feedPosts = new Map(); // feedId -> Set of postIds
    this.feedUrls = new Set(); // Track added feed URLs for duplicates
    this.readPosts = new Set(); // Track read post IDs
  }

  // Add a new feed with its posts
  addFeed(feed, posts = []) {
    console.log('DataStore.addFeed called with:', { feed, posts });
    
    // Validate feed object
    if (!feed || typeof feed !== 'object') {
      throw new Error('Feed must be a valid object');
    }
    
    if (!feed.id) {
      throw new Error('Feed must have an id property');
    }
    
    // Store feed
    this.feeds.set(feed.id, feed);
    this.feedUrls.add(feed.originalUrl);
    
    // Store posts and create feed-posts relationship
    const postIds = new Set();
    posts.forEach(post => {
      const postWithFeedId = { ...post, feedId: feed.id };
      this.posts.set(post.id, postWithFeedId);
      postIds.add(post.id);
    });
    
    this.feedPosts.set(feed.id, postIds);
    
    return feed.id;
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
