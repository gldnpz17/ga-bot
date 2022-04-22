import Card from "./Card"

const FileCard = ({ src, title }) => {
  return (
    <Card>
      <div className="w-full h-52">
        <img 
          className="w-full h-full object-cover"
          src="https://images.unsplash.com/photo-1544396821-4dd40b938ad3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1173&q=80" 
        />
      </div>
      <div className="flex w-full p-2">
        <div className="flex items-start flex-col flex-grow overflow-hidden mr-2">
          <p className="text-ellipsis w-full font-semibold overflow-hidden">SomeReallyLongRandomAssNameForAFile.png</p>
          <p>00:35, 23 Apr 2022</p>
        </div>
        <button>
          <ion-icon size="large" name="download-outline"></ion-icon>
        </button>
      </div>
    </Card>
  )
}

export default FileCard