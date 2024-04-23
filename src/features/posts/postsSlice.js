import {
  createSelector,
  createEntityAdapter,
} from "@reduxjs/toolkit";
import { sub } from "date-fns";
import apiSlice from '../api/apiSlice';

// --> Previous code
// const POSTS_URL = "https://jsonplaceholder.typicode.com/posts";

const postsAdapter = createEntityAdapter({
  sortComparer: (a, b) => b.date.localeCompare(a.date),
});

// Before optimisation
// const initialState = {
//   posts: [],
//   status: "idle", //'idle' | 'loading' | 'succeeded' | 'failed'
//   error: null,
//   count: 0
// };

// --> Previous code
// // After optimisation
// const initialState = postsAdapter.getInitialState({
//   status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
//   error: null,
//   count: 0,
// });

// --> Previous code
// export const fetchPosts = createAsyncThunk("posts/fetchPosts", async () => {
//   try {
//     const response = await axios.get(POSTS_URL);
//     return [...response.data];
//   } catch (err) {
//     return err.message;
//   }
// });

// export const addNewPost = createAsyncThunk(
//   "posts/addNewPost",
//   async (initialPost) => {
//     try {
//       const response = await axios.post(POSTS_URL, initialPost);
//       return response.data;
//     } catch (err) {
//       return err.message;
//     }
//   }
// );

// export const updatePost = createAsyncThunk("posts/updatePost", async (initialPost) => {
//   const { id } = initialPost;
//   try {
//     const response = await axios.put(`${POSTS_URL}/${id}`, initialPost);
//     return response.data;
//   } catch (err) {
//     // return err.message;
//     return initialPost
//   }
// });

// export const deletePost = createAsyncThunk("posts/deletePost", async (initialPost) => {
//   const { id } = initialPost;
//   try {
//     const response = await axios.delete(`${POSTS_URL}/${id}`);
//     if (response?.status === 200) return initialPost;
//     return `${response?.status}: ${response?.statusText}`;
//   } catch (err) {
//     return err.message;
//   }
// })

const initialState = postsAdapter.getInitialState();

export const extendedApiSlice = apiSlice.injectEndPoints({
  endpoints: builder => ({
    getPosts: builder.query({
      query: () => '/posts',
      transformResponse: responseData => {
        let min = 1;
        const loadedPosts = responseData.map(post => {
          if (!post?.date) post.date = sub(new Date(), { minutes: min++ }).toISOString();
          if (!post?.reactions) post.reactions = {
            thumbsup: 0,
            wow: 0,
            heart: 0,
            rocket: 0,
            coffee: 0
          }
          return post
        });
        return postsAdapter.setAll(initialState, loadedPosts);
      },
      providesTags: (result, error, arg) => [
        { type: 'Post', id: "List"},
        ...result.ids.map(id => ({ type: 'Post', id }))
      ]
    }),
    getPostsByUserId: builder.query({
      query: id => `/posts/?userId=${id}`,
      transformResponse: responseData => {
        let min = 1;
        const loadedPosts = responseData.map(post => {
          if (!post?.data) post.date = sub(new Date(), { minutes: min++ }).toISOString();
          if (!post?.reactions) post.reactions = {
            thumbsup: 0,
            wow: 0,
            heart: 0,
            rocket: 0,
            coffee: 0
          }
          return post
        });
        return postsAdapter.setAll(initialState, loadedPosts)
      },
      providesTags: (result, error, arg) => {
        console.log(result);
        return [
          ...result.ids.map(id => ({ type: 'POST', id }))
        ]
      }
    }),
    addNewPost: builder.mutation({
      query: initialPost => ({
        url: '/posts',
        method: 'POST',
        body: {
          ...initialPost,
          userId: Number(initialPost.userId),
          date: new Date().toISOString(),
          reactions: {
            thumbsup: 0,
            wow: 0,
            heart: 0,
            rocket: 0,
            coffee: 0
          }
        }
      }),
      invalidatesTags: [
        { type: 'Post', id: "List" }
      ]
    }),
    updatePost: builder.mutation({
      query: initialPost => ({
        url: `/posts/${initialPost.id}`,
        method: 'PUT',
        body: {
          ...initialPost,
          date: new Date().toISOString()
        }
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Post', id: arg.id }
      ]
    }),
    deletePost: builder.mutation({
      query: ({ id }) => ({
        url: `/posts/${id}`,
        method: 'DELETE',
        body: { id }
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Post', id: arg.id}
      ]
    })
  })
});

export const {
  useGetPostsQuery,
  useGetPostsByUserIdQuery,
  useAddNewPostMutation,
  useUpdatePostMutation,
  useDeletePostMutation
} = extendedApiSlice;

// returns the query result object
export const selectPostsResult = extendedApiSlice.endpoints.getPosts.select();

// Creates memoized selector
const selectPostsData = createSelector(
  selectPostsResult,
  postsResult => postsResult.data // normalized state object with ids & entities
)

// Previous code
// const postsSlice = createSlice({
//   name: "posts",
//   initialState,
//   reducers: {
//     reactionAdded(state, action) {
//       const { postId, reaction } = action.payload;
//       // const existingPost = state.posts.find((post) => post.id === postId);
//       const existingPost = state.entities[postId];
//       if (existingPost) {
//         existingPost.reactions[reaction]++;
//       }
//     },
//     increaseCount(state, action) {
//       state.count += 1;
//     },
//   },
//   extraReducers(builder) {
//     builder
//       .addCase(fetchPosts.pending, (state, action) => {
//         state.status = "loading";
//       })
//       .addCase(fetchPosts.fulfilled, (state, action) => {
//         state.status = "succeeded";
//         // Adding date and reactions
//         let min = 1;
//         const loadedPosts = action.payload.map((post) => {
//           post.date = sub(new Date(), { minutes: min++ }).toISOString();
//           post.reactions = {
//             thumbsup: 0,
//             wow: 0,
//             heart: 0,
//             rocket: 0,
//             coffee: 0,
//           };
//           return post;
//         });

//         // Add any fetched posts to the array
//         // state.posts = state.posts.concat(loadedPosts);
//         postsAdapter.upsertMany(state, loadedPosts);
//       })
//       .addCase(fetchPosts.rejected, (state, action) => {
//         state.status = "failed";
//         state.error = action.error.message;
//       })
//       .addCase(addNewPost.fulfilled, (state, action) => {
//         action.payload.userId = Number(action.payload.userId);
//         action.payload.data = new Date().toISOString();
//         action.payload.reactions = {
//           thumbsup: 0,
//           wow: 0,
//           heart: 0,
//           rocket: 0,
//           coffee: 0,
//         };
//         console.log(action.payload);
//         // state.posts.push(action.payload);
//         postsAdapter.addOne(state, action.payload);
//       })
//       .addCase(updatePost.fulfilled, (state, action) => {
//         if (!action.payload?.id) {
//           console.log("Update could not complete");
//           console.log(action.payload);
//           return;
//         }
//         const { id } = action.payload;
//         action.payload.date = new Date().toISOString();
//         const posts = state.posts.filter((post) => post.id !== id);
//         // state.posts = [...posts, action.payload];
//         postsAdapter.upsertOne(state, action.payload);
//       })
//       .addCase(deletePost.fulfilled, (state, action) => {
//         if (!action.payload?.id) {
//           console.log("Delete could not complete");
//           console.log(action.payload);
//           return;
//         }
//         const { id } = action.payload;

//         // Before optmisation
//         // const posts = state.posts.filter(post => post.id !== id);
//         // state.posts = posts;

//         // After optimisation
//         postsAdapter.removeOne(state, id);
//       });
//   },
// });

// After optimisation
// getSelectors creates these selectors and we rename them with aliases using destructuring
export const {
  selectAll: selectAllPosts,
  selectById: selectPostById,
  selectIds: selectPostIds,
  // Pass in a selector that returns the posts slice of state
} = postsAdapter.getSelectors(state => selectPostsData(state) ?? initialState); 
// ??: This is the nullish coalescing operator (??), introduced in ECMAScript 2020. It is used for handling null or undefined values. If the expression on its left-hand side evaluates to null or undefined, it returns the expression on its right-hand side. Otherwise, it returns the value on its left-hand side.

