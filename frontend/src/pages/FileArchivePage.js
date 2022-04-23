import React from "react"
import { useInfiniteQuery } from "react-query"
import FileCard from "../components/FileCard"

const FILES_PER_FETCH = 32

const FileArchivePage = ({ groupChatId }) => {
  const fetchFiles = async ({ pageParam = 0 }) => 
    await (await fetch(`https://gabot.gldnpz.com/api/archive/files/${groupChatId}?start=${pageParam * FILES_PER_FETCH}&count=${FILES_PER_FETCH}`)).json()
 
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery('projects', fetchFiles, {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
 
  return status === 'loading' ? (
    <p>Loading...</p>
  ) : status === 'error' ? (
    <p>Error: {error.message}</p>
  ) : (
    <>
      {data.pages.map((files, i) => (
        <React.Fragment key={i}>
          {files.map(file => (
            <FileCard title={file.originalFilename} timestamp={file.timestamp} />
          ))}
        </React.Fragment>
      ))}
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