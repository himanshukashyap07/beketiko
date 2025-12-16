import Image from "next/image";

type FileData = {
  url: string;
  type:string;
  name: string;
  size: number;
  fileType: string;
};

export default function MediaRenderer({ file }: { file: FileData }) {
  if (!file) return null;
  const isGif = file.fileType === "image/gif"
  switch (file.type) {
    case "image":
      return (
        <div className="max-w-xs rounded overflow-hidden">
          <Image
            src={file.url}
            alt={file.name}
            width={150}
            height={150}
            className="rounded"
            unoptimized={isGif}
          />
        </div>
      );

    case "video":
      return (
        <video
          src={file.url}
          controls
          width={200}
          className="max-w-xs rounded"
        />
      );

    case "audio":
      return (
        <audio
          src={file.url}
          controls
          className="w-full"
        />
      );

    case "document":
      return (
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 p-2 border rounded"
        >
          📄 <span className="truncate">{file.name}</span>
        </a>
      );

    default:
      return null;
  }
}
