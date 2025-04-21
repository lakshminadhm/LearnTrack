import React from 'react';
import PostForm from '../components/Community/PostForm';
import PostList from '../components/Community/PostList';
import { usePosts } from '../hooks/usePosts';

const CommunityPage: React.FC = () => {
  const { posts, isLoading, createPost, createReply } = usePosts();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Community</h1>
        <p className="text-gray-600 mt-1">
          Connect with other learners, share your progress, and get help with your learning journey.
        </p>
      </div>

      <div className="mb-8">
        <PostForm onSubmit={createPost} isLoading={isLoading} />
      </div>

      <PostList
        posts={posts}
        isLoading={isLoading}
        createPost={createPost}
        createReply={createReply}
      />
    </div>
  );
};

export default CommunityPage;