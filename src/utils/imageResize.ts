export function resizeImage(
  file: File,
  { maxWidth, maxHeight }: { maxWidth: number; maxHeight: number }
) {
  return new Promise((resolve: (value: File) => void, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = maxWidth;
        canvas.height = maxHeight;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject("Could not obtain canvas context");
        } else {
          const ratio = Math.max(maxWidth / img.width, maxHeight / img.height);
          const width = img.width * ratio;
          const height = img.height * ratio;
          const xOffset = (maxWidth - width) / 2;
          const yOffset = (maxHeight - height) / 2;

          ctx.drawImage(
            img,
            0,
            0,
            img.width,
            img.height,
            width > maxWidth ? xOffset : 0,
            height > maxHeight ? yOffset : 0,
            width,
            height
          );

          ctx.canvas.toBlob(
            (blob) => {
              if (blob) {
                const newFile = new File([blob], file.name, {
                  type: "image/png",
                  lastModified: Date.now(),
                });
                resolve(newFile);
              } else {
                reject("Could not obtain blob");
              }
            },
            "image/png",
            1
          );
        }
      };
      img.onerror = (error) => reject(error);
      img.src = event.target?.result as string;
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
