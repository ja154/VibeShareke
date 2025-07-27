import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { User, Project, Follow, Comment, Like } from './supabaseClient';


// --- Mock Data ---
const mockUsers: User[] = [
  {
    id: 'user-1',
    username: 'alex_codes',
    profile_picture_url: `https://i.pravatar.cc/150?u=user-1`,
    bio: 'Frontend developer passionate about React and beautiful UIs. Coffee enthusiast.',
  },
  {
    id: 'user-2',
    username: 'bella_builds',
    profile_picture_url: `https://i.pravatar.cc/150?u=user-2`,
    bio: 'Full-stack engineer exploring the world of serverless and Jamstack.',
  },
  {
    id: 'user-3',
    username: 'chris_designs',
    profile_picture_url: `https://i.pravatar.cc/150?u=user-3`,
    bio: 'UI/UX Designer creating intuitive and engaging digital experiences.',
  },
];

const mockProjects: Project[] = [
  {
    id: 'proj-1',
    user_id: 'user-1',
    title: 'Personal Portfolio Website',
    description: 'A sleek, animated portfolio built with Next.js and Framer Motion. Showcases my latest work and skills.',
    project_url: 'https://github.com',
    image_url: 'https://images.unsplash.com/photo-1555066931-4365d1469c8b?q=80&w=870&auto=format&fit=crop',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 'proj-2',
    user_id: 'user-2',
    title: 'E-commerce Store API',
    description: 'A robust RESTful API for an e-commerce platform using Node.js, Express, and PostgreSQL.',
    project_url: 'https://github.com',
    image_url: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=870&auto=format&fit=crop',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
    {
    id: 'proj-4',
    user_id: 'user-1',
    title: 'GraphQL Weather App',
    description: 'A simple weather application that fetches data from a public GraphQL API. Built with Apollo Client.',
    project_url: 'https://github.com',
    image_url: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?q=80&w=774&auto=format&fit=crop',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
  {
    id: 'proj-3',
    user_id: 'user-3',
    title: 'Task Management App Design',
    description: 'A Figma design for a clean and user-friendly task management application. Focus on accessibility.',
    project_url: 'https://github.com',
    image_url: 'https://images.unsplash.com/photo-1522199755839-a2bacb67c546?q=80&w=872&auto=format&fit=crop',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  },
].sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());

const mockComments: Comment[] = [
  { id: 'comment-1', project_id: 'proj-1', user_id: 'user-2', content: 'This looks amazing! Love the animations.', created_at: new Date().toISOString() },
  { id: 'comment-2', project_id: 'proj-1', user_id: 'user-3', content: 'Great work on the UI, very clean.', created_at: new Date().toISOString() },
  { id: 'comment-3', project_id: 'proj-2', user_id: 'user-1', content: 'Awesome backend structure!', created_at: new Date().toISOString() },
];

const mockLikes: Like[] = [
  { user_id: 'user-1', project_id: 'proj-2' },
  { user_id: 'user-1', project_id: 'proj-3' },
  { user_id: 'user-2', project_id: 'proj-1' },
  { user_id: 'user-3', project_id: 'proj-1' },
  { user_id: 'user-3', project_id: 'proj-2' },
];

const mockFollows: Follow[] = [
  { follower_id: 'user-1', followee_id: 'user-2' },
  { follower_id: 'user-1', followee_id: 'user-3' },
  { follower_id: 'user-2', followee_id: 'user-1' },
  { follower_id: 'user-3', followee_id: 'user-1' },
];


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
    onAddProject: (projectData: Omit<Project, 'id' | 'user_id' | 'created_at'>) => void;
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

const CreatePostModal = ({ isOpen, onClose, onAddProject }: CreatePostModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Revoke the old URL if it exists to prevent memory leaks
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

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
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !projectUrl || !imageFile) {
      alert("Please fill all fields and upload an image.");
      return;
    }

    // Pass the previewUrl to the parent, but don't revoke it.
    // It's now "owned" by the App's state and will be used for rendering.
    onAddProject({ title, description, project_url: projectUrl, image_url: previewUrl });

    // Reset form state for the next time the modal opens, without revoking the just-used URL
    setTitle('');
    setDescription('');
    setProjectUrl('');
    setImageFile(null);
    setPreviewUrl('');

    onClose();
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
                    <label htmlFor="description">Description</label>
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
    const userProjects = allProjects.filter(p => p.user_id === userId);

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
  const [allProjects, setAllProjects] = useState<Project[]>(mockProjects);
  const [allUsers, setAllUsers] = useState<User[]>(mockUsers);
  const [allFollows, setAllFollows] = useState<Follow[]>(mockFollows);
  const [allComments, setAllComments] = useState<Comment[]>(mockComments);
  const [allLikes, setAllLikes] = useState<Like[]>(mockLikes);
  const [currentUser, setCurrentUser] = useState<User | null>(mockUsers[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState<{ page: 'feed' | 'profile'; data: string | null }>({ page: 'feed', data: null });

  const handleAddProject = (newProjectData: Omit<Project, 'id' | 'user_id' | 'created_at'>) => {
    if (!currentUser) return;
    const projectToAdd: Project = { 
        ...newProjectData, 
        user_id: currentUser.id,
        id: `proj-${Date.now()}`,
        created_at: new Date().toISOString()
    };
    setAllProjects([projectToAdd, ...allProjects]);
  };

  const handleAddComment = (projectId: string, content: string) => {
      if (!currentUser) return;
      const newCommentData: Comment = { 
          project_id: projectId, 
          user_id: currentUser.id, 
          content,
          id: `comment-${Date.now()}`,
          created_at: new Date().toISOString()
      };
      setAllComments([...allComments, newCommentData]);
  };
  
  const handleFollowToggle = (profileUserId: string) => {
    if (!currentUser) return;
    const isFollowing = allFollows.some(f => f.follower_id === currentUser.id && f.followee_id === profileUserId);
    if (isFollowing) {
        setAllFollows(allFollows.filter(f => !(f.follower_id === currentUser.id && f.followee_id === profileUserId)));
    } else {
        const newFollow: Follow = { follower_id: currentUser.id, followee_id: profileUserId };
        setAllFollows([...allFollows, newFollow]);
    }
  };

  const handleLikeToggle = (projectId: string, isLiked: boolean) => {
      if (!currentUser) return;
      if (isLiked) {
          setAllLikes(allLikes.filter(l => !(l.project_id === projectId && l.user_id === currentUser.id)));
      } else {
          const newLike: Like = { user_id: currentUser.id, project_id: projectId };
          setAllLikes([...allLikes, newLike]);
      }
  };

  const navigateToProfile = (userId: string) => setView({ page: 'profile', data: userId });
  const navigateToFeed = () => setView({ page: 'feed', data: null });

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