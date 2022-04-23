import React from "react"
import { useInfiniteQuery } from "react-query"
import FileCard from "../components/FileCard"

const FILES_PER_FETCH = 32

const FileArchivePage = ({ groupChatId }) => {
  const fetchFiles = async ({ pageParam = 0 }) => 
    await (await fetch(`https://gabot.gldnpz.com/archive/files/${groupChatId}?start=${pageParam * FILES_PER_FETCH}&count=${FILES_PER_FETCH}`)).json()
 
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery(['archive', 'files'], fetchFiles, {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
 
  return status === 'loading' ? (
    <p>Loading...</p>
  ) : status === 'error' ? (
    <p>Error: {error.message}</p>
  ) : (
    <>
      <div className="grid grid-cols-4 gap-4 p-4">
        {data.pages.map((files, i) => (
          <React.Fragment key={i}>
            {files.map(file => (
              <FileCard title={file.originalFilename} timestamp={file.timestamp} />
            ))}
          </React.Fragment>
        ))}
      </div>
      <div>
        <button
          onClick={() => fetchNextPage()}
          disabled={!hasNextPage || isFetchingNextPage}
        >
          {isFetchingNextPage
            ? 'Loading more...'
            : hasNextPage
            ? 'Load More'
            : 'Nothing more to load'}
        </button>
      </div>
      <div>{isFetching && !isFetchingNextPage ? 'Fetching...' : null}</div>
    </>
  )
}

export default FileArchivePage