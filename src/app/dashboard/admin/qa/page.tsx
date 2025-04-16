// ... existing imports
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Montserrat } from 'next/font/google';
import { supabase } from 'src/app/utils/supabase';

const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '500', '700'] });

type Post = {
  id: number;
  content: string;
  createdAt: Date;
  studentId?: number;
  adminId?: number;
  parentId?: number | null;
  replies?: Post[];
};

export default function QA() {
  const [userRecordId, setUserRecordId] = useState<number | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<'student' | 'admin'>('student');
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [replyInputs, setReplyInputs] = useState<Record<number, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({});
  const router = useRouter();

  const handleAbout = () => router.push('/dashboard/admin/about');
  const handleAssignments = () => router.push('/dashboard/admin/assignment');
  const handleQandA = () => router.push('/dashboard/admin/qa');
  const handleResources = () => router.push('/dashboard/admin/resources');
  const handleLeaderboard = () => router.push('/dashboard/admin/leaderboard');
  const handleStudent = () => router.push('/dashboard/admin/student');
  const handleLogOut = () => router.push('/logout');

  const fetchUserId = async () => {
    const username = localStorage.getItem('username');
    if (!username) {
      console.log('No username found in localStorage');
      return;
    }

    const { data: studentData } = await supabase
      .from('algoshpe_student')
      .select('id')
      .eq('username', username)
      .single();

    if (studentData?.id) {
      setUserRecordId(studentData.id);
      setCurrentUserRole('student');
      return;
    }

    const { data: adminData } = await supabase
      .from('algoshpe_admin')
      .select('id')
      .eq('username', username)
      .single();

    if (adminData?.id) {
      setUserRecordId(adminData.id);
      setCurrentUserRole('admin');
      return;
    }

    console.log(`No matching student or admin found for username: ${username}`);
  };

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('algoshpe_comment')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && data) {
      const map: Record<number, Post> = {};
      const rootComments: Post[] = [];

      data.forEach((d) => {
        const comment: Post = {
          id: d.id,
          content: d.message,
          createdAt: new Date(d.created_at),
          studentId: d.student_id,
          adminId: d.admin_id,
          parentId: d.parent_id,
          replies: [],
        };
        map[comment.id] = comment;
        if (comment.parentId) {
          map[comment.parentId]?.replies?.push(comment);
        } else {
          rootComments.push(comment);
        }
      });
      setPosts(rootComments);
    } else {
      console.error('Failed to load posts:', error?.message);
    }
  };

  useEffect(() => {
    fetchUserId();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (parentId: number | null = null) => {
    const content = parentId ? replyInputs[parentId]?.trim() : newPost.trim();
    if (!content) return;
    if (!userRecordId) {
      console.log('User ID not found — cannot post');
      return;
    }

    const insertData = {
      student_id: currentUserRole === 'student' ? userRecordId : null,
      admin_id: currentUserRole === 'admin' ? userRecordId : null,
      parent_id: parentId,
      message: content,
      is_private: false,
      created_at: new Date(),
    };

    const { error } = await supabase.from('algoshpe_comment').insert(insertData);
    if (!error) {
      if (parentId) {
      setReplyInputs((prev) => ({ ...prev, [parentId]: '' }));
      setExpandedComments((prev) => ({ ...prev, [parentId]: true }));
    }
      else setNewPost('');
      fetchPosts();
    } else {
      console.error('Error creating comment:', error.message);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    const confirmDelete = confirm('Are you sure you want to delete this comment and its replies?');
    if (!confirmDelete) return;

    const { data: comment, error: fetchError } = await supabase
      .from('algoshpe_comment')
      .select('id, student_id, admin_id')
      .eq('id', commentId)
      .single();

    if (fetchError || !comment) {
      console.error('Failed to fetch comment for deletion:', fetchError?.message);
      return;
    }

    if (currentUserRole !== 'admin') {
      alert("Only admins can delete comments.");
      return;
    }

    await supabase.from('algoshpe_comment').delete().eq('parent_id', commentId);
    const { error: deleteError } = await supabase.from('algoshpe_comment').delete().eq('id', commentId);
    if (!deleteError) {
      console.log('Comment and replies deleted');
      fetchPosts();
    } else {
      console.error('Failed to delete comment:', deleteError.message);
    }
  };

  const toggleReplies = (id: number) => {
    setExpandedComments((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderComments = (comments: Post[], depth = 0) =>
    comments.map((comment) => (
      <div key={comment.id} style={{ marginLeft: depth * 20 }} className="mt-4">
        <div className="bg-[#f0f4f3] p-4 rounded shadow">
          <div className="text-sm text-gray-500">{comment.createdAt.toLocaleString()}</div>
          <p className="mt-1">{comment.content}</p>
          <div className="text-xs italic text-gray-600 mt-1">
            Posted by {comment.studentId ? 'Student' : 'Admin'} #{comment.studentId || comment.adminId}
          </div>
        </div>
        <div className="flex gap-2 mt-2 items-center">
          <input
            type="text"
            placeholder="Reply..."
            value={replyInputs[comment.id] || ''}
            onChange={(e) =>
              setReplyInputs((prev) => ({ ...prev, [comment.id]: e.target.value }))
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleCreatePost(comment.id);
              }
            }}
            className="flex-1 p-2 border border-gray-300 rounded text-black bg-white"
          />
          <button
            onClick={() => handleCreatePost(comment.id)}
            className="bg-[#354F52] text-white px-3 py-1 rounded hover:bg-[#2f4447]"
          >
            Reply
          </button>

          {currentUserRole === 'admin' && (
            <button
              onClick={() => handleDeleteComment(comment.id)}
              className="text-red-600 hover:text-red-800"
              title="Delete Comment"
            >
              🗑️
            </button>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <button
              onClick={() => toggleReplies(comment.id)}
              className="text-sm text-[#354F52] hover:underline"
            >
              {expandedComments[comment.id] ? 'Hide Replies' : 'View Replies'}
            </button>
          )}
        </div>

        {expandedComments[comment.id] && (comment.replies ?? []).length > 0 && (
          <div className="ml-4 border-l-2 border-gray-300 pl-4">
            {renderComments(comment.replies ?? [], depth + 1)}
          </div>
        )}
      </div>
    ));

  return (
    <div className={montserrat.className}>
      <div className="bg-[#CAD2C5] min-h-screen">
        <header className="bg-[#354F52] p-2">
                  <div className="flex justify-between items-center w-full px-6">
                    {/* Logo on the left */}
                    <div className="flex items-center">
                      <Image
                        src="/algoshpelogo.png"
                        alt="AlgoSHPE Logo"
                        width={160}
                        height={160}
                        className="rounded-lg w-24 h-auto"
                      />
                    </div>
        
                    {/* Navigation links on the right */}
                    <div className="flex gap-6">
                      <div onClick={handleAbout} className="text-white cursor-pointer hover:text-[#A1B0A6] transition duration-200">
                        About
                      </div>
                      <div onClick={handleStudent} className="text-white cursor-pointer hover:text-[#A1B0A6] transition duration-200">
                        Students
                      </div>
                      <div onClick={handleAssignments} className="text-white cursor-pointer hover:text-[#A1B0A6] transition duration-200">
                        Assignments
                      </div>
                      <div onClick={handleQandA} className="text-white cursor-pointer hover:text-[#A1B0A6] transition duration-200">
                        Q & A
                      </div>
                      <div onClick={handleResources} className="text-white cursor-pointer hover:text-[#A1B0A6] transition duration-200">
                        Resources
                      </div>
                      <div onClick={handleLeaderboard} className="text-white cursor-pointer hover:text-[#A1B0A6] transition duration-200">
                        Leaderboard
                      </div>
                      <div onClick={handleLogOut} className="text-white cursor-pointer hover:text-[#A1B0A6] transition duration-200">
                        Log Out
                      </div>
                    </div>
                  </div>
                </header>

        <main className="max-w-2xl mx-auto py-8 px-4">
          {!userRecordId && (
            <p className="text-red-600 text-sm mb-4">
              Loading user info... Make sure you're logged in.
            </p>
          )}

          <div className="bg-white p-4 rounded-lg shadow-md">
            <textarea
              placeholder="What's on your mind?"
              className="w-full border border-gray-300 p-2 rounded resize-none"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleCreatePost(null);
                }
              }}
              rows={3}
            />
            <button
              onClick={() => handleCreatePost(null)}
              className="bg-[#354F52] text-white px-4 py-2 mt-2 rounded hover:bg-[#2f4447]"
            >
              Post
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {renderComments(posts)}
          </div>
        </main>
      </div>
    </div>
  );
}