import React, { useState } from 'react'
import { Button, Input } from '@material-ui/core'
import '../css/PostUpload.css'
import { db, storage, auth} from '../firebase/firebase'
import firebase from 'firebase'

const PostUpload = ({ setNewPost }) => {

    const username = auth.currentUser.displayName;
    const [file, setFile] = useState(null);
    const [caption, setCaption] = useState("");
    const [progress, setProgress] = useState(0);

    const chooseFile = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    }

    const uploadFile = () => {
        const imageName = file.name;
        const randomImageName = imageName + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
        const addPost = (caption, username, url) => {
            const newPost = {
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                caption: caption,
                username: username,
                imageURL: url
            }
            db.collection("posts").add(newPost).then((doc) => {
                setNewPost({ 
                    post: newPost,
                    id: doc.id
                })
            }).catch(reason => console.error(reason))
        }

        const uploadTask = storage.ref(`images/${randomImageName}`).put(file);

        uploadTask.on("state_changed", (snapshot) => {
            const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
            setProgress(progress)
        }, (error) => {
            console.log(error);
            alert(error.message);
        }, () => {
            storage.ref('images').child(randomImageName).getDownloadURL().then(url => {
                addPost(caption, username, url)
            })
            setProgress(0);
            setFile(null);
            setCaption('');
        })
    }

    return (
        <div className="postupload">
            <h1>Upload your image</h1>
            <Input id="fileinput" style={{ marginTop: "30px" }} className="child" type="file" name="upload-file" onChange={chooseFile} />
            <progress className="child" max={100} value={progress} />
            <Input className="child" type="text" name="upload-caption" placeholder="write your caption here" 
                    value={caption} onChange={(e) => setCaption(e.target.value)}
            />
            <Button
                variant="contained"
                style={{
                    backgroundColor: "#228B22",
                    padding: "10px 15px",
                    marginBottom: "30px",
                    color: "white"
                }}
                className="child"
                onClick={uploadFile}
            >
                Upload
            </Button>
        </div>
    )
}

export default PostUpload
