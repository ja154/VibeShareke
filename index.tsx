import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { supabase } from './supabaseClient';
import type { User, Project, Follow, Comment, Like } from './supabaseClient';


// --- Prop Types ---
interface FeedProps {
  projects: Project[];
  users: User[];
  onAuthorClick: (userId: string) => void;
  allComments: Comment[];
  allLikes: Like[];
  onAddComment: (projectId: string, content: string) => void;
  onLikeToggle: (projectId: string, isLiked: boolean) => void;
  currentUser: User | null;
}

interface ProfilePageProps {
  userId: string;
  currentUser: User | null;
  allProjects: Project[];
  allUsers: User[];
  allFollows: Follow[];
  allComments: Comment[];
  allLikes: Like[];
  onAuthorClick: (userId: string) => void;
  onFollowToggle: (profileUserId: string) => void;
  onAddComment: (projectId: string, content: string) => void;
  onLikeToggle: (projectId: string, isLiked: boolean) => void;
}

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddProject: (projectData: Omit<Project, 'id' | 'user_id' | 'created_at' | 'image_url'>, imageFile: File) => void;
}


// --- SVG Icons ---
const SearchIcon = () => (
    <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);

const HeartIcon = ({ filled }: { filled: boolean }) => (
    <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
);

const CommentIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
);

const GitHubIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
);

const CloseIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);


// --- React Components ---

const Header = ({ onOpenCreatePost, onLogoClick, currentUser, onProfileClick }: { onOpenCreatePost: () => void; onLogoClick: () => void; currentUser: User | null; onProfileClick: () => void; }) => {
  return (
    <header className="header">
        <div className="app-container header-content">
            <h1 className="logo" onClick={onLogoClick} role="button" tabIndex={0} aria-label="Go to homepage">CodeVibe</h1>
            <div className="search-bar">
                <SearchIcon />
                <input type="text" className="search-input" placeholder="Search projects..." aria-label="Search projects" />
            </div>
            <div className="header-actions">
              <button className="create-post-btn" onClick={onOpenCreatePost} disabled={!currentUser}>Create Post</button>
              {currentUser && (
                <img 
                  src={currentUser.profile_picture_url} 
                  alt="My Profile" 
                  className="header-profile-avatar"
                  onClick={onProfileClick}
                  role="button"
                  tabIndex={0}
                  aria-label="View my profile"
                  onKeyPress={e => (e.key === 'Enter' || e.key === ' ') && onProfileClick()}
                />
              )}
            </div>
        </div>
    </header>
  );
};

const ProjectCard = ({ project, author, onAuthorClick, allComments, allUsers, allLikes, onAddComment, onLikeToggle, currentUser }: { project: Project; author: User; onAuthorClick: () => void; allComments: Comment[]; allUsers: User[]; allLikes: Like[]; onAddComment: (projectId: string, content: string) => void; onLikeToggle: (projectId: string, isLiked: boolean) => void; currentUser: User | null; }) => {
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [newComment, setNewComment] = useState('');

  const isLiked = currentUser ? allLikes.some(like => like.project_id === project.id && like.user_id === currentUser.id) : false;
  const likeCount = allLikes.filter(like => like.project_id === project.id).length;

  const handleLike = () => {
    if (!currentUser) {
        alert("You need to be logged in to like a project.");
        return;
    }
    onLikeToggle(project.id, isLiked);
  };

  const handleAuthorClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    onAuthorClick();
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (newComment.trim() && currentUser) {
          onAddComment(project.id, newComment);
          setNewComment('');
      }
  };

  const projectComments = allComments.filter(c => c.project_id === project.id);

  return (
    <article className="project-card" aria-labelledby={`project-title-${project.id}`}>
      <div className="card-header" onClick={handleAuthorClick} role="button" tabIndex={0} onKeyPress={e => (e.key === 'Enter' || e.key === ' ') && handleAuthorClick(e)}>
        <img src={author.profile_picture_url} alt={`${author.username}'s avatar`} className="author-avatar" />
        <span className="author-name">{author.username}</span>
      </div>
      <div className="card-image-container">
        <img src={project.image_url} alt={project.title} className="card-image" />
      </div>
      <div className="card-content">
        <div className="card-actions">
          <button onClick={handleLike} className={`action-btn ${isLiked ? 'active' : ''}`} aria-label="Like this project" disabled={!currentUser}>
            <HeartIcon filled={isLiked} />
          </button>
          <button className="action-btn" aria-label="Comment on this project" onClick={() => setCommentsVisible(!commentsVisible)}>
            <CommentIcon />
          </button>
          <a href={project.project_url} target="_blank" rel="noopener noreferrer" className="action-btn github-btn" aria-label="View on GitHub">
            <GitHubIcon />
          </a>
        </div>
        <p className="likes-count">{likeCount.toLocaleString()} likes</p>
        <h2 id={`project-title-${project.id}`} className="card-title">{project.title}</h2>
        <p className="card-description">{project.description}</p>
      </div>
       {commentsVisible && (
        <div className="comments-section-wrapper">
            <div className="comments-list">
                {projectComments.length > 0 ? projectComments.map(comment => {
                    const commentAuthor = allUsers.find(u => u.id === comment.user_id);
                    if (!commentAuthor) return null;
                    return (
                        <div key={comment.id} className="comment-item">
                            <img src={commentAuthor.profile_picture_url} alt={commentAuthor.username} className="comment-author-avatar"/>
                            <div className="comment-body">
                                <span className="comment-author-name">{commentAuthor.username}</span>
                                <p className="comment-content">{comment.content}</p>
                            </div>
                        </div>
                    );
                }) : <p className="no-comments">No comments yet. Be the first!</p>}
            </div>
            {currentUser && (
                <form className="comment-form" onSubmit={handleCommentSubmit}>
                    <img src={currentUser.profile_picture_url} alt="Your avatar" className="comment-form-avatar" />
                    <input 
                        type="text" 
                        value={newComment} 
                        onChange={e => setNewComment(e.target.value)}
                        placeholder="Add a comment..." 
                        className="comment-input"
                        aria-label="Add a comment"
                    />
                    <button type="submit" className="comment-submit-btn" disabled={!newComment.trim()}>Post</button>
                </form>
            )}
        </div>
      )}
    </article>
  );
};

const Feed = ({ projects, users, onAuthorClick, allComments, allLikes, onAddComment, onLikeToggle, currentUser }: FeedProps) => {
  return (
    <section className="feed" aria-label="Projects Feed">
      {projects.map(project => {
          const author = users.find(u => u.id === project.user_id);
          if (!author) return null;
          return <ProjectCard 
                    key={project.id} 
                    project={project} 
                    author={author} 
                    onAuthorClick={() => onAuthorClick(author.id)}
                    allComments={allComments}
                    allUsers={users}
                    allLikes={allLikes}
                    onAddComment={onAddComment}
                    onLikeToggle={onLikeToggle}
                    currentUser={currentUser}
                />
        })}
    </section>
  );
};

import { generateDescription } from './geminiClient';

const CreatePostModal = ({ isOpen, onClose, onAddProject }: CreatePostModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Effect to revoke object URL on unmount or when previewUrl changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setPreviewUrl('');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setProjectUrl('');
    setImageFile(null);
    setPreviewUrl('');
    setIsGenerating(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !projectUrl || !imageFile) {
      alert("Please fill all fields and upload an image.");
      return;
    }
    await onAddProject({ title, description, project_url: projectUrl }, imageFile);
    handleClose();
  };

  const handleGenerateDescription = async () => {
      if (!title) {
          alert("Please enter a project title first.");
          return;
      }
      setIsGenerating(true);
      try {
          const generatedDesc = await generateDescription(title);
          setDescription(generatedDesc);
      } catch (error) {
          alert("Failed to generate description. Please check your API key and try again.");
      } finally {
          setIsGenerating(false);
      }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
                <h2>Create New Post</h2>
                <button onClick={handleClose} className="close-button" aria-label="Close modal"><CloseIcon /></button>
            </div>
            <form onSubmit={handleSubmit} className="create-post-form">
                <div className="form-group">
                    <label htmlFor="title">Project Title</label>
                    <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} className="form-input" required />
                </div>
                <div className="form-group">
                    <div className="label-with-action">
                        <label htmlFor="description">Description</label>
                        <button
                            type="button"
                            className="ai-generate-btn"
                            onClick={handleGenerateDescription}
                            disabled={isGenerating || !title}
                        >
                            {isGenerating ? 'Generating...' : 'Generate with AI'}
                        </button>
                    </div>
                    <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} className="form-textarea" rows={4} required></textarea>
                </div>
                 <div className="form-group">
                    <label htmlFor="projectUrl">Project URL</label>
                    <input id="projectUrl" type="url" value={projectUrl} onChange={e => setProjectUrl(e.target.value)} className="form-input" required />
                </div>
                <div className="form-group">
                    <label htmlFor="imageUpload">Project Image</label>
                    <div className="file-input-container">
                        <input 
                            id="imageUpload" 
                            type="file" 
                            onChange={handleImageChange} 
                            className="file-input" 
                            accept="image/png, image/jpeg, image/gif" 
                            required 
                        />
                        <label htmlFor="imageUpload" className="file-input-label" role="button" tabIndex={0}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                            <span>{imageFile ? imageFile.name : 'Click to upload an image'}</span>
                        </label>
                    </div>
                </div>
                {previewUrl && (
                  <div className="image-preview-container">
                    <img src={previewUrl} alt="Image preview" className="image-preview" />
                  </div>
                )}
                <div className="form-actions">
                    <button type="button" onClick={handleClose} className="btn-cancel">Cancel</button>
                    <button type="submit" className="btn-submit">Post</button>
                </div>
            </form>
        </div>
    </div>
  )
}

const ProfilePage = ({ userId, currentUser, allProjects, allUsers, allFollows, allComments, allLikes, onAuthorClick, onFollowToggle, onAddComment, onLikeToggle }: ProfilePageProps) => {
    const user = allUsers.find(u => u.id === userId);
    const userProjects = allProjects.filter(p => p.user_id === userId).sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());

    if (!user) {
        return <div className="centered-message">User not found!</div>;
    }

    const followersCount = allFollows.filter(f => f.followee_id === userId).length;
    const followingCount = allFollows.filter(f => f.follower_id === userId).length;
    const isFollowing = allFollows.some(f => f.follower_id === currentUser?.id && f.followee_id === userId);
    
    const isOwnProfile = currentUser?.id === userId;

    return (
        <section className="profile-page">
            <header className="profile-header">
                <img src={user.profile_picture_url} alt={user.username} className="profile-avatar" />
                <div className="profile-info">
                    <h2 className="profile-username">{user.username}</h2>
                    <div className="profile-stats">
                        <span><strong>{userProjects.length}</strong> posts</span>
                        <span><strong>{followersCount}</strong> followers</span>
                        <span><strong>{followingCount}</strong> following</span>
                    </div>
                    <p className="profile-bio">{user.bio}</p>
                </div>
                {!isOwnProfile && currentUser && (
                   <button 
                     className={`follow-btn ${isFollowing ? 'following' : ''}`}
                     onClick={() => onFollowToggle(userId)}
                   >
                     {isFollowing ? 'Following' : 'Follow'}
                   </button>
                )}
            </header>
            <hr className="profile-divider" />
            <h3 className="profile-posts-title">Projects</h3>
            <Feed 
                projects={userProjects} 
                users={allUsers} 
                onAuthorClick={onAuthorClick} 
                allComments={allComments}
                allLikes={allLikes}
                onAddComment={onAddComment}
                onLikeToggle={onLikeToggle}
                currentUser={currentUser}
            />
        </section>
    );
};

const App = () => {
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allFollows, setAllFollows] = useState<Follow[]>([]);
  const [allComments, setAllComments] = useState<Comment[]>([]);
  const [allLikes, setAllLikes] = useState<Like[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState<{ page: 'feed' | 'profile'; data: string | null }>({ page: 'feed', data: null });
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    setLoading(true);
    try {
        const [
            { data: users, error: usersError },
            { data: projects, error: projectsError },
            { data: comments, error: commentsError },
            { data: likes, error: likesError },
            { data: follows, error: followsError },
        ] = await Promise.all([
            supabase.from('users').select('*'),
            supabase.from('projects').select('*').order('created_at', { ascending: false }),
            supabase.from('comments').select('*'),
            supabase.from('likes').select('*'),
            supabase.from('follows').select('*'),
        ]);

        if (usersError) throw usersError;
        if (projectsError) throw projectsError;
        if (commentsError) throw commentsError;
        if (likesError) throw likesError;
        if (followsError) throw followsError;

        setAllUsers(users || []);
        setAllProjects(projects || []);
        setAllComments(comments || []);
        setAllLikes(likes || []);
        setAllFollows(follows || []);

        if (users && users.length > 0) {
            // In a real app, you'd get the logged-in user.
            // For now, we'll just pick the first user as the "current" one.
            setCurrentUser(users[0]);
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to fetch data from Supabase. Make sure your database is set up and credentials are correct.");
    } finally {
        setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddProject = async (projectData: Omit<Project, 'id' | 'user_id' | 'created_at' | 'image_url'>, imageFile: File) => {
    if (!currentUser) {
        alert("You must be logged in to create a project.");
        return;
    }

    try {
        // 1. Upload image to Supabase Storage
        const filePath = `${currentUser.id}/${Date.now()}-${imageFile.name}`;
        const { error: uploadError } = await supabase.storage
            .from('project-images')
            .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        // 2. Get public URL of the uploaded image
        const { data: { publicUrl } } = supabase.storage
            .from('project-images')
            .getPublicUrl(filePath);

        if (!publicUrl) throw new Error("Could not get public URL for the image.");

        // 3. Insert project data into the 'projects' table
        const projectToAdd = {
            ...projectData,
            user_id: currentUser.id,
            image_url: publicUrl,
        };

        const { data: newProject, error: insertError } = await supabase
            .from('projects')
            .insert(projectToAdd)
            .select()
            .single();

        if (insertError) throw insertError;

        // 4. Optimistically update UI
        if (newProject) {
            setAllProjects([newProject, ...allProjects]);
        }

    } catch (error) {
        console.error("Error creating project: ", error);
        alert("There was an error creating your project. Please try again.");
    }
  };

  const handleAddComment = async (projectId: string, content: string) => {
      if (!currentUser) return;
      const newCommentData = {
          project_id: projectId, 
          user_id: currentUser.id, 
          content,
      };

      const { data: newComment, error } = await supabase.from('comments').insert(newCommentData).select().single();

      if (error) {
          console.error("Error adding comment:", error);
          alert("Could not post comment.");
      } else if (newComment) {
          setAllComments([...allComments, newComment]);
      }
  };
  
  const handleFollowToggle = async (profileUserId: string) => {
    if (!currentUser) return;
    const isFollowing = allFollows.some(f => f.follower_id === currentUser.id && f.followee_id === profileUserId);

    try {
        if (isFollowing) {
            const { error } = await supabase.from('follows').delete().match({ follower_id: currentUser.id, followee_id: profileUserId });
            if (error) throw error;
            setAllFollows(allFollows.filter(f => !(f.follower_id === currentUser.id && f.followee_id === profileUserId)));
        } else {
            const newFollow = { follower_id: currentUser.id, followee_id: profileUserId };
            const { error } = await supabase.from('follows').insert(newFollow);
            if (error) throw error;
            setAllFollows([...allFollows, newFollow]);
        }
    } catch (error) {
        console.error("Error toggling follow:", error);
        alert("There was an error updating follow status.");
    }
  };

  const handleLikeToggle = async (projectId: string, isLiked: boolean) => {
      if (!currentUser) return;
      try {
          if (isLiked) {
              const { error } = await supabase.from('likes').delete().match({ project_id: projectId, user_id: currentUser.id });
              if (error) throw error;
              setAllLikes(allLikes.filter(l => !(l.project_id === projectId && l.user_id === currentUser.id)));
          } else {
              const newLike = { user_id: currentUser.id, project_id: projectId };
              const { error } = await supabase.from('likes').insert(newLike);
              if (error) throw error;
              setAllLikes([...allLikes, newLike]);
          }
      } catch (error) {
          console.error("Error toggling like:", error);
          alert("There was an error updating like status.");
      }
  };

  const navigateToProfile = (userId: string) => setView({ page: 'profile', data: userId });
  const navigateToFeed = () => setView({ page: 'feed', data: null });

  if (loading) {
      return <div className="centered-message">Loading Vibe...</div>
  }

  return (
    <>
      <Header 
        onOpenCreatePost={() => setIsModalOpen(true)} 
        onLogoClick={navigateToFeed}
        currentUser={currentUser}
        onProfileClick={() => currentUser && navigateToProfile(currentUser.id)}
      />
      <main className="main-content">
        <div className="app-container">
            {view.page === 'feed' ? (
                <Feed 
                    projects={allProjects} 
                    users={allUsers} 
                    onAuthorClick={navigateToProfile}
                    allComments={allComments}
                    allLikes={allLikes}
                    onAddComment={handleAddComment}
                    onLikeToggle={handleLikeToggle}
                    currentUser={currentUser}
                />
            ) : (
                view.data && <ProfilePage 
                    userId={view.data}
                    currentUser={currentUser}
                    allProjects={allProjects} 
                    allUsers={allUsers}
                    allFollows={allFollows}
                    allComments={allComments}
                    allLikes={allLikes}
                    onAuthorClick={navigateToProfile}
                    onFollowToggle={handleFollowToggle}
                    onAddComment={handleAddComment}
                    onLikeToggle={handleLikeToggle}
                />
            )}
        </div>
      </main>
      <CreatePostModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddProject={handleAddProject}
      />
    </>
  );
};

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}