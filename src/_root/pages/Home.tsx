import Loader from "@/components/shared/Loader";
import { useGetRecentsPosts } from "@/lib/react-query/queriesAndMutations";
import { Models } from "appwrite";
import PostCard from "@/components/shared/PostCard";
const Home = () => {
  const { data: posts, isPending: isPostLoading } = useGetRecentsPosts();
  return (
    <div className="flex flex-1">
      <div className="home-container">
        <div className="home-posts">
          <h1 className="he-bold md:h2-bold text-left w-full">Home Feed</h1>
          {isPostLoading && !posts ? (
            <Loader />
          ) : (
            <ul className="flex flex-col flex-1 gap-9 w-full">
              {posts?.documents.map((post: Models.Document) => {
                return <PostCard post={post} key={post?.$createdAt} />;
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
