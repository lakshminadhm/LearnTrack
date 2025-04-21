import React, { useState } from 'react';
import { PostCreate } from '../../../../shared/src/types';

interface PostFormProps {
  onSubmit: (data: PostCreate) => Promise<boolean>;
  parentId?: string;
  isReply?: boolean;
  isLoading: boolean;
  onCancel?: () => void;
}

const PostForm: React.FC<PostFormProps> = ({ 
  onSubmit, 
  parentId,
  isReply = false,
  isLoading,
  onCancel
}) => {
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    const postData: PostCreate = {
      content: content.trim(),
      ...(parentId && { parent_id: parentId })
    };
    
    const success = await onSubmit(postData);
    
    if (success) {
      setContent('');
    }
  };

  return (
    <div className={`${isReply ? 'bg-gray-50 p-4 rounded-lg mt-2' : 'bg-white p-6 rounded-lg shadow-md mb-6'}`}>
      {!isReply && (
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Share with the Community
        </h3>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          {!isReply && (
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              What's on your mind?
            </label>
          )}
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={isReply ? 2 : 3}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder={isReply ? "Write a reply..." : "Share your learning experience, ask a question, or give advice..."}
          ></textarea>
        </div>
        
        <div className="flex justify-end space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || !content.trim()}
            className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'Posting...' : isReply ? 'Reply' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;