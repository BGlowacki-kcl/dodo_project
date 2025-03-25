import React from "react";
import ReactPaginate from "react-paginate";

const Pagination = ({ pageCount, onPageChange }) => {
  if (pageCount <= 1) return null; // Hide pagination if only one page

  return (
    <div className="mt-6 flex justify-center">
      <ReactPaginate
        previousLabel={"← Prev"}
        nextLabel={"Next →"}
        pageCount={pageCount}
        onPageChange={onPageChange}
        containerClassName={"flex space-x-1"} // Reduced spacing between buttons
        pageClassName={"px-2 py-1 border rounded text-sm cursor-pointer hover:bg-gray-200"} // Smaller padding and text size
        activeClassName={"bg-blue-600 text-white"}
        previousClassName={"px-2 py-1 border rounded text-sm cursor-pointer hover:bg-gray-200"} // Adjusted padding
        nextClassName={"px-2 py-1 border rounded text-sm cursor-pointer hover:bg-gray-200"} // Adjusted padding
        breakLabel={"..."}
        breakClassName={"px-2 py-1 text-sm"} // Adjusted padding
        renderOnZeroPageCount={null}
      />
    </div>
  );
};

export default Pagination;
