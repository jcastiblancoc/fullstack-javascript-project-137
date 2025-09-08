import { v4 as uuidv4 } from 'uuid';

// Generate unique ID for entities
const generateId = () => uuidv4();

// Parse RSS feed XML content
export const parseRSSFeed = (xmlContent) => {
  try {
    console.log('Raw XML content received:', xmlContent.substring(0, 1000));
    
    // Clean the XML content
    let cleanedXml = xmlContent.trim();
    
    // Remove any HTML wrapper if present
    const xmlMatch = cleanedXml.match(/<\?xml[\s\S]*?<\/(?:rss|feed)>/i);
    if (xmlMatch) {
      cleanedXml = xmlMatch[0];
    }
    
    console.log('Cleaned XML content:', cleanedXml.substring(0, 500));
    
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(cleanedXml, 'text/xml');
    
    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      console.error('XML Parser Error:', parserError.textContent);
      throw new Error('Invalid XML format');
    }
    
    // Try to find RSS or Atom feed elements
    const rssElement = xmlDoc.querySelector('rss channel') || xmlDoc.querySelector('channel');
    const atomElement = xmlDoc.querySelector('feed');
    
    if (!rssElement && !atomElement) {
      throw new Error('No RSS or Atom feed found');
    }
    
    let feedData;
    let posts;
    
    if (rssElement) {
      // Parse RSS format
      feedData = parseRSSFormat(rssElement);
      posts = parseRSSPosts(rssElement);
    } else {
      // Parse Atom format
      feedData = parseAtomFormat(atomElement);
      posts = parseAtomPosts(atomElement);
    }
    
    const feedId = generateId();
    
    return {
      feed: {
        ...feedData,
        id: feedId,
        addedAt: new Date().toISOString()
      },
      posts: posts.map(post => ({
        ...post,
        id: generateId(),
        feedId: feedId
      }))
    };
    
  } catch (error) {
    console.error('RSS parsing error:', error);
    throw new Error(`RSS parsing failed: ${error.message}`);
  }
};

// Parse RSS 2.0 format
const parseRSSFormat = (channelElement) => {
  const getTextContent = (selector) => {
    const element = channelElement.querySelector(selector);
    return element ? element.textContent.trim() : '';
  };
  
  return {
    title: getTextContent('title') || 'Untitled Feed',
    description: getTextContent('description') || 'No description available',
    link: getTextContent('link') || '',
    language: getTextContent('language') || 'en',
    lastBuildDate: getTextContent('lastBuildDate') || getTextContent('pubDate') || ''
  };
};

// Parse Atom format
const parseAtomFormat = (feedElement) => {
  const getTextContent = (selector) => {
    const element = feedElement.querySelector(selector);
    return element ? element.textContent.trim() : '';
  };
  
  const getLinkHref = () => {
    const linkElement = feedElement.querySelector('link[rel="alternate"]') || 
                       feedElement.querySelector('link');
    return linkElement ? linkElement.getAttribute('href') || '' : '';
  };
  
  return {
    title: getTextContent('title') || 'Untitled Feed',
    description: getTextContent('subtitle') || getTextContent('summary') || 'No description available',
    link: getLinkHref(),
    language: feedElement.getAttribute('xml:lang') || 'en',
    lastBuildDate: getTextContent('updated') || ''
  };
};

// Parse RSS posts/items
const parseRSSPosts = (channelElement) => {
  const items = Array.from(channelElement.querySelectorAll('item'));
  
  return items.map(item => {
    const getTextContent = (selector) => {
      const element = item.querySelector(selector);
      return element ? element.textContent.trim() : '';
    };
    
    const getNamespacedContent = (localName) => {
      // Handle namespaced elements like dc:creator
      const elements = Array.from(item.getElementsByTagName('*'));
      const found = elements.find(el => el.localName === localName || el.tagName.endsWith(':' + localName));
      return found ? found.textContent.trim() : '';
    };
    
    return {
      title: getTextContent('title') || 'Untitled Post',
      description: getTextContent('description') || getTextContent('content') || '',
      link: getTextContent('link') || getTextContent('guid') || '',
      pubDate: getTextContent('pubDate') || '',
      author: getTextContent('author') || getNamespacedContent('creator') || '',
      category: getTextContent('category') || ''
    };
  });
};

// Parse Atom entries
const parseAtomPosts = (feedElement) => {
  const entries = Array.from(feedElement.querySelectorAll('entry'));
  
  return entries.map(entry => {
    const getTextContent = (selector) => {
      const element = entry.querySelector(selector);
      return element ? element.textContent.trim() : '';
    };
    
    const getLinkHref = () => {
      const linkElement = entry.querySelector('link[rel="alternate"]') || 
                         entry.querySelector('link');
      return linkElement ? linkElement.getAttribute('href') || '' : '';
    };
    
    const getAuthor = () => {
      const authorElement = entry.querySelector('author name');
      return authorElement ? authorElement.textContent.trim() : '';
    };
    
    return {
      title: getTextContent('title') || 'Untitled Post',
      description: getTextContent('summary') || getTextContent('content') || '',
      link: getLinkHref(),
      pubDate: getTextContent('published') || getTextContent('updated') || '',
      author: getAuthor(),
      category: getTextContent('category') || ''
    };
  });
};

// Validate RSS URL format
export const isValidRSSUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};
