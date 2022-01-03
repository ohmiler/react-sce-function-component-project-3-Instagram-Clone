import { useState, useEffect } from 'react'
import { auth, db } from './firebase/firebase'
import logo from './logo.svg';
import './App.css';
import { Button } from '@material-ui/core'
import Post from './components/Post'
import AuthModal from './components/Auth'
import PostUpload from './components/PostUpload'
import CircularProgress from '@material-ui/core/CircularProgress'

const App = () => {

  const IG_LOGO = "https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
  const [docs, setDocs] = useState([]);
  const [posts, setPosts] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [user, setUser] = useState(null);
  const [newPost, setNewPost] = useState({});
  const [morePost, setMorePost] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [openModalLogin, setOpenModalLogin] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        setUser(authUser)
      } else {
        setUser(null)
      }
    })
    return () => {
      unsubscribe();
    }
  }, [user])

  const fetchData = () => {
    let query = db.collection('posts')
                  .orderBy('timestamp', 'desc');

        if (posts.length !== 0) {
          const lastVisible = docs[docs.length-1];
          query = query.startAfter(lastVisible)
        }

        query.limit(10).get().then(snapshot => {
          if (snapshot.docs.length === 0) setMorePost(false);
          setDocs([...docs, ...snapshot.docs])
          setPosts([...posts, ...snapshot.docs.map(doc => (
            {
              id: doc.id,
              post: doc.data()
            }
          ))])
        })
        setTimeout(setFetching(false), 1000);
  }

  useEffect(() => {
    fetchData();
  }, [])

  useEffect(() => {
    if (fetching === false) return;
    fetchData();
  }, [fetching])

  useEffect(() => {
    if (Object.keys(newPost).length === 0) return;
    setPosts(posts => [newPost, ...posts])
  }, [newPost])

  const checkBottom = (e) => {
    const bottom = (
      (e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight) &
      (fetching === false) &
      (morePost === true))
      if (bottom) {
        setFetching(true)
      }
  }

  console.log(posts);

  return (
    <div className="app" onScroll={checkBottom}>
      <AuthModal igLogo={IG_LOGO} openModal={openModal} setOpenModal={setOpenModal} 
                  openModalLogin={openModalLogin} setOpenModalLogin={setOpenModalLogin} setUser={setUser}
      />
      <div className="app__header">
        <img className="app__headerImage" src={IG_LOGO} alt="instagram logo" />
        <div>
          { 
            user ? 
            <Button onClick={() => {
              auth.signOut();
            }}>Log Out</Button>
          : (
              <>
                <Button onClick={() => setOpenModal(true)}>SignUp</Button>
                <Button onClick={() => setOpenModalLogin(true)}>SignIn</Button>
              </>
            )
          }
        </div>
      </div>
      <div className="contents">
        {user ? 
          <PostUpload username={user.displayName} setNewPost={setNewPost} />
        :
        <h4 className="app__notify">
          <Button onClick={() => setOpenModalLogin(true)}>Login to post</Button>
        </h4>
        }

        <div className="app__post_view">
          <div className="app__post_wrapper">
            {
              posts.map(({id, post}) => (
                <Post 
                  key={id}
                  postID={id}
                  user={user}
                  username={post.username}
                  caption={post.caption}
                  imageURL={post.imageURL}
                />
              ))
            }

            {
              morePost ?
              <div className="app__loading">
                <CircularProgress />
              </div>
              :
              <h5 className="app__bottom">No more post!</h5>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
