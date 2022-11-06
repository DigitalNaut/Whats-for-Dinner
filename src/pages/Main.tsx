import { useGoogleDrive } from "src/hooks/GoogleDriveContext";
import Spinner from "src/components/Spinner";
import ImageUpload from "src/components/ImageUpload";
import ImageList from "src/components/ImageList";

export default function Main() {
  const { isLoaded } = useGoogleDrive();

  if (!isLoaded)
    return (
      <div className="absolute inset-0 grid place-items-center">
        <Spinner />
      </div>
    );

  return (
    <div className="flex p-6">
      <div className="flex-1">
        <h2 className="text-xl mb-4">File upload</h2>
        <ImageUpload onUpload={() => console.log("Needs to refresh list")} />
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <h2 className="text-xl mb-4">Saved files</h2>
        <ImageList />
      </div>
    </div>
  );
}
