import createPost from "@/server/actions/create-post";
import getPosts from "@/server/actions/get-posts";

export default async function Home() {
  const posts = await getPosts();

  return (
    <div>
      <h1>Home</h1>
      {posts.success &&
        posts.success.map((post) => <p key={post.id}>{post.title}</p>)}

      <form action={createPost}>
        <input type="text" name="title" />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
