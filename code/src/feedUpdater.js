import { dataStore } from './dataStore.js';
import { RSSService } from './rssService.js';
import { displayFeed } from './view.js';
import { t } from './i18n.js';

// Feed update manager using setTimeout for reliable network handling
class FeedUpdater {
  constructor() {
    this.rssService = new RSSService();
    this.updateInterval = 5000; // 5 seconds
    this.isRunning = false;
    this.timeoutId = null;
    this.updateCount = 0;
  }

  // Start the update cycle
  start() {
    if (this.isRunning) {
      console.log('Feed updater is already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting RSS feed update cycle...');
    this.scheduleNextUpdate();
  }

  // Stop the update cycle
  stop() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.isRunning = false;
    console.log('RSS feed update cycle stopped');
  }

  // Schedule the next update using setTimeout (not setInterval)
  // This ensures each update completes before the next one starts
  scheduleNextUpdate() {
    if (!this.isRunning) return;

    this.timeoutId = setTimeout(async () => {
      try {
        await this.checkAllFeeds();
      } catch (error) {
        console.error('Error during feed update cycle:', error);
      } finally {
        // Schedule next update regardless of success/failure
        // This handles the "network is unreliable" principle
        this.scheduleNextUpdate();
      }
    }, this.updateInterval);
  }

  // Check all feeds for updates
  async checkAllFeeds() {
    const feeds = dataStore.getAllFeeds();
    
    if (feeds.length === 0) {
      console.log('No feeds to update');
      return;
    }

    this.updateCount++;
    console.log(`Feed update cycle #${this.updateCount} - checking ${feeds.length} feeds`);

    // Process feeds sequentially to avoid overwhelming the network
    for (const feed of feeds) {
      if (!this.isRunning) break; // Allow graceful stopping

      try {
        await this.checkFeedForUpdates(feed);
      } catch (error) {
        console.error(`Error updating feed ${feed.title}:`, error.message);
        // Continue with other feeds even if one fails
      }
    }
  }

  // Check a single feed for new posts
  async checkFeedForUpdates(feed) {
    try {
      console.log(`Checking for updates: ${feed.title}`);
      
      // Update feed metadata with last check time
      dataStore.updateFeedMetadata(feed.id, {
        lastChecked: new Date().toISOString()
      });

      // Fetch latest feed data
      const result = await this.rssService.fetchAndParseFeed(feed.originalUrl);
      const latestPosts = result.posts || [];

      if (latestPosts.length === 0) {
        console.log(`No posts found in feed: ${feed.title}`);
        return;
      }

      // Add only new posts to the feed
      const newPosts = dataStore.addNewPosts(feed.id, latestPosts);

      if (newPosts.length > 0) {
        console.log(`Found ${newPosts.length} new posts in feed: ${feed.title}`);
        
        // Update feed metadata with last update time
        dataStore.updateFeedMetadata(feed.id, {
          lastUpdated: new Date().toISOString(),
          newPostsCount: (feed.newPostsCount || 0) + newPosts.length
        });

        // Notify about new posts
        this.notifyNewPosts(feed, newPosts);

        // Refresh the display if this feed is currently shown
        this.refreshFeedDisplay(feed.id);
      } else {
        console.log(`No new posts found in feed: ${feed.title}`);
      }

    } catch (error) {
      console.error(`Failed to update feed ${feed.title}:`, error.message);
      
      // Update feed metadata with error info
      dataStore.updateFeedMetadata(feed.id, {
        lastError: error.message,
        lastErrorTime: new Date().toISOString()
      });
    }
  }

  // Notify user about new posts
  notifyNewPosts(feed, newPosts) {
    
    // Create notification message
    const message = t('app.messages.newPosts', {
      count: newPosts.length,
      feedTitle: feed.title
    });

    // Show browser notification if supported
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(t('app.messages.newPostsTitle'), {
        body: message,
        icon: '/favicon.ico'
      });
    }

    // Show in-app notification
    this.showInAppNotification(message);
    
    console.log(`Notification: ${message}`);
  }

  // Show in-app notification
  showInAppNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'alert alert-info alert-dismissible fade show position-fixed';
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 1050; max-width: 300px;';
    
    notification.innerHTML = `
      <div class="d-flex align-items-center">
        <i class="bi bi-info-circle me-2"></i>
        <span>${message}</span>
        <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert"></button>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }

  // Refresh feed display if currently visible
  refreshFeedDisplay(feedId) {
    const feedContainer = document.querySelector('.feeds');
    if (feedContainer && feedContainer.children.length > 0) {
      // Get updated feed and posts
      const feed = dataStore.getFeed(feedId);
      const posts = dataStore.getFeedPosts(feedId);
      
      if (feed && posts) {
        // Re-render the feed display
        displayFeed(feed, posts);
      }
    }
  }

  // Request notification permission
  static async requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }

  // Get update statistics
  getStats() {
    return {
      isRunning: this.isRunning,
      updateCount: this.updateCount,
      updateInterval: this.updateInterval,
      nextUpdateIn: this.timeoutId ? this.updateInterval : null
    };
  }
}

// Create singleton instance
export const feedUpdater = new FeedUpdater();

// Export class for testing
export { FeedUpdater };
