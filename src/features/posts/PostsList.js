import { useSelector } from "react-redux";
// import { selectAllPosts, getPostsStatus, getPostsError } from "./postsSlice";
import { selectPostIds } from "./postsSlice";
import PostsExcerpt from "./PostsExcerpt";
import { useGetPostsQuery } from "./postsSlice";

const PostsList = () => {

  const {
    isLoading,
    isSuccess,
    isError,
    error
  } = useGetPostsQuery();

  // const posts = useSelector(selectAllPosts);
  const orderedPostIds = useSelector(selectPostIds);
  

  let content;
  if (isLoading) {
    content = <p>Loading...</p>;
  } else if (isSuccess) {
    // const orderedPosts = posts.slice().sort((a, b) => b.date.localeCompare(a.date))
    // content = orderedPosts.map(post => <PostsExcerpt key={post.id} post={post} />)
    content = orderedPostIds.map(postId => <PostsExcerpt key={postId} postId={postId} />)
  } else if (isError) {
    content = <p> {error} </p>
  }

  return (
    <section>
      {content}
    </section>
  );
};

export default PostsList;
