import PostButton from "@/components/post-button";
import createPost from "@/server/actions/create-post";
import getPosts from "@/server/actions/get-posts";

export default async function Home() {
  const posts = await getPosts();

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">Blog Posts</h1>
      <ul className="w-full">
        {posts.success &&
          posts.success.map((post) => (
            <li key={post.id} className="mb-4">
              <p className="text-xl">{post.title}</p>
            </li>
          ))}
      </ul>
      <form action={createPost} className="flex flex-col items-center w-full">
        <input
          type="text"
          name="title"
          placeholder="Title"
          className="bg-white border-2 border-gray-300 px-3 py-2 rounded-md mb-4"
        />
        <PostButton />
      </form>
    </div>
  );
}
