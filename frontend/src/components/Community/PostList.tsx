import React, { useState } from 'react';
import { Post, PostCreate } from '../../../../shared/src/types';
import { MessageSquare, User, Clock } from 'lucide-react';
import PostForm from './PostForm';

interface PostListProps {
  posts: Post[];
  isLoading: boolean;
  createPost: (data: PostCreate) => Promise<boolean>;
  createReply: (postId: string, data: PostCreate) => Promise<boolean>;
}

const PostList: React.FC<PostListProps> = ({ 
  posts, 
  isLoading, 
  createPost,
  createReply 
}) => {
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  
  // Filter top-level posts (no parent_id)
  const topLevelPosts = posts.filter(post => !post.parent_id);
  
  // Group replies by parent_id
  const repliesByParent: Record<string, Post[]> = {};
  posts
    .filter(post => post.parent_id)
    .forEach(reply => {
      if (!repliesByParent[reply.parent_id!]) {
        repliesByParent[reply.parent_id!] = [];
      }
      repliesByParent[reply.parent_id!].push(reply);
    });
  
  const toggleReplies = (postId: string) => {
    setExpandedReplies(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };
  
  const toggleReplyForm = (postId: string | null) => {
    setReplyingTo(replyingTo === postId ? null : postId);
  };
  
  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  if (isLoading) {
    return (
      <div className="bg-white/90 dark:bg-gray-900/90 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-8 dark:bg-gray-800"></div>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl dark:bg-gray-800"></div>
          ))}
        </div>
      </div>
    );
  }
  
  const handleReply = async (postId: string, data: PostCreate) => {
    const success = await createReply(postId, data);
    if (success) {
      toggleReplyForm(null);
      setExpandedReplies(prev => ({
        ...prev,
        [postId]: true
      }));
    }
    return success;
  };
  
  const renderPost = (post: Post, isReply = false) => {
    const hasReplies = repliesByParent[post.id] && repliesByParent[post.id].length > 0;
    const isExpanded = expandedReplies[post.id];
    return (
      <div key={post.id} className={`${isReply ? 'ml-8 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800' : 'mb-6 border border-gray-100 dark:border-gray-800 rounded-2xl'} p-6 ${isReply ? '' : 'bg-white/90 dark:bg-gray-900/90 shadow-xl hover:shadow-2xl'} transition-all duration-300`}> 
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div className="bg-indigo-100 rounded-full p-2 mr-3">
              <User className="w-5 h-5 text-indigo-700" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{post.username || 'Anonymous User'}</p>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <Clock className="w-3 h-3 mr-1" />
                <span>{formatDate(post.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 text-gray-700 dark:text-gray-200 text-base">{post.content}</div>
        <div className="mt-4 flex items-center space-x-6">
          <button onClick={() => toggleReplyForm(post.id)} className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"><MessageSquare className="w-4 h-4 mr-1" />{replyingTo === post.id ? 'Cancel' : 'Reply'}</button>
          {hasReplies && (
            <button onClick={() => toggleReplies(post.id)} className="inline-flex items-center text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">{isExpanded ? `Hide ${repliesByParent[post.id].length} replies` : `View ${repliesByParent[post.id].length} replies`}</button>
          )}
        </div>
        {replyingTo === post.id && (
          <PostForm onSubmit={(data) => handleReply(post.id, data)} parentId={post.id} isReply={true} isLoading={isLoading} onCancel={() => toggleReplyForm(null)} />
        )}
        {hasReplies && isExpanded && (
          <div className="mt-2">
            {repliesByParent[post.id].map(reply => renderPost(reply, true))}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="mb-10">
      <h3 className="text-2xl font-bold text-gray-800 mb-8 dark:text-gray-100 tracking-tight">Community Discussions</h3>
      {topLevelPosts.length > 0 ? (
        <div className="space-y-8">
          {topLevelPosts.map(post => renderPost(post))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white/90 dark:bg-gray-900/90 border-2 border-dashed border-gray-200 rounded-2xl shadow-xl dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No posts yet</p>
          <p className="text-sm text-gray-400 mt-1 dark:text-gray-500">Be the first to start a discussion!</p>
        </div>
      )}
    </div>
  );
};

export default React.memo(PostList);