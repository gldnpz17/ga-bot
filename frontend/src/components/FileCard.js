import Card from "./Card"

const FileCard = ({ thumbnailSrc, title, timestamp }) => {
  return (
    <Card>
      <div className="w-full h-52">
        {thumbnailSrc 
          ? (
            <img 
              className="w-full h-full object-cover"
              src={thumbnailSrc}
            />
          )
          : (
            <div className="text-9xl flex justify-center items-center h-full">
              <ion-icon name="document-outline"></ion-icon>
            </div>
          )
        }
      </div>
      <div className="flex w-full p-2">
        <div className="flex items-start flex-col flex-grow overflow-hidden mr-2">
          <p className="text-ellipsis w-full font-semibold overflow-hidden">{title}</p>
          <p>{new Date(timestamp).toLocaleString()}</p>
        </div>
        <button>
          <ion-icon size="large" name="download-outline"></ion-icon>
        </button>
      </div>
    </Card>
  )
}

export default FileCard