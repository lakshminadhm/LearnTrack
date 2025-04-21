import { useState, useEffect, useCallback } from 'react';
import { Post, PostCreate } from '../../../shared/src/types';
import { communityApi } from '../services/api';
import toast from 'react-hot-toast';

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await communityApi.getPosts();
      
      if (response.success && response.data) {
        setPosts(response.data);
      } else {
        setError(response.error || 'Failed to fetch posts');
        toast.error(response.error || 'Failed to fetch posts');
      }
    } catch (err) {
      setError('An error occurred while fetching posts');
      toast.error('An error occurred while fetching posts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const createPost = useCallback(async (postData: PostCreate) => {
    setIsLoading(true);
    
    try {
      const response = await communityApi.createPost(postData);
      
      if (response.success && response.data) {
        setPosts(prevPosts => [response.data!, ...prevPosts]);
        toast.success('Post created successfully');
        return true;
      } else {
        toast.error(response.error || 'Failed to create post');
        return false;
      }
    } catch (err) {
      toast.error('An error occurred while creating the post');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createReply = useCallback(async (postId: string, replyData: PostCreate) => {
    setIsLoading(true);
    
    try {
      const response = await communityApi.createReply(postId, replyData);
      
      if (response.success && response.data) {
        fetchPosts(); // Refetch to get updated thread structure
        toast.success('Reply added successfully');
        return true;
      } else {
        toast.error(response.error || 'Failed to create reply');
        return false;
      }
    } catch (err) {
      toast.error('An error occurred while creating the reply');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchPosts]);

  return {
    posts,
    isLoading,
    error,
    fetchPosts,
    createPost,
    createReply
  };
};