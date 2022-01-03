import React, { useState, useEffect } from 'react'
import styled from 'styled-components/macro'
import { db } from '../firebase/firebase'

const Comments = ({ postID, newComment }) => {

    const [comments, setComments] = useState([]);
    const [moreComments, setMorecomments] = useState(true);
    const [docs, setDocs] = useState([]);

    const loadComment = () => {
        let query;
        if (postID) {
            query = db.collection("posts")
                      .doc(postID)
                      .collection("comments")
                      .orderBy('timestamp', 'desc')

            if (comments.length !== 0) {
                const lastVisible = docs[docs.length-1];
                query = query.startAfter(lastVisible).limit(10)
            } else {
                query = query.limit(3);
            }
            
            query.get().then((snapshot) => {
                if (snapshot.docs.length === 0) setMorecomments(false);
                setComments([...comments, ...snapshot.docs.map((doc) => doc.data())]);
                setDocs([...docs, ...snapshot.docs])
            })
        }
    }

    useEffect(() => {
        loadComment();
    }, [postID]);

    useEffect(() => {
       setComments(comments => [newComment, ...comments])
    }, [newComment])

    return (
        <div>
            {comments.map((comment, id) => (
                <Comment key={id} username={comment.username} comment={comment.comment} />
            ))}

            {
                moreComments ?
                <MoreComment onClick={loadComment}>Load more comments...</MoreComment>
                :
                null
            }
        </div>
    )
}

const MoreComment = styled.p`
    margin: 0px 20px 10px;
    font-size: 0.8em;
    color: grey;
    cursor: pointer;
`

const Comment = ({username, comment}) => {
    return (
        <StyledCommentContainer>
            <StyledUsername>{username}</StyledUsername>
            <StyledComment>{comment}</StyledComment>
        </StyledCommentContainer>
    )
}

const StyledCommentContainer = styled.div`
    display: flex;
    align-items: center;
    margin: 0px 20px 10px;
`

const StyledUsername = styled.h5``
const StyledComment = styled.p`
    margin-left: 10px;
    font-size: 0.8em;
`

export default Comments
