import React, { useState } from 'react'
import styled from 'styled-components/macro'
import { db } from '../firebase/firebase'
import firebase from 'firebase'

const Wrapper = styled.form`
    display: flex;
    align-items: center;
    border-top: 1px solid #cacaca;
`

const InputComment = styled.input`
    flex: 1;
    padding: 10px;
    border: none;
`

const InputButton = styled.button`
    flex: 0;
    border: none;
    color: #6082a3;
    padding: 10px;
    background-color: white;
`

const Propmt = styled.h4`
    text-align: center;
    padding: 10px;
    border-top: 1px solid #cacaca;
`

const CommentBox = ({ user, postID, setNewComment }) => {

    const [comment, setComment] = useState("");
    const submitHandler = (event) => {
        const newComment = {
            comment: comment,
            username: user.displayName,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }
        event.preventDefault();

        db.collection("posts")
          .doc(postID)
          .collection("comments")
          .add(newComment)
          setNewComment(newComment)
          setComment("")
    }

    return (
        <>
            {user ? 
                <Wrapper>
                    <InputComment
                        type="text"
                        placeholder="Add comment here..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                    <InputButton onClick={submitHandler}>Submit</InputButton>
                </Wrapper>
                :
                <Propmt>Login to comment</Propmt>
            }
        </>
    )
}

export default CommentBox
