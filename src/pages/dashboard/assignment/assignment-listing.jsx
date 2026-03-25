// import React, { useState, useEffect, useMemo } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import Card from "@/components/ui/Card";
// import Icon from "@/components/ui/Icon";
// import Button from "@/components/ui/Button";
// import {
//   useTable,
//   useRowSelect,
//   useSortBy,
//   useGlobalFilter,
//   usePagination,
// } from "react-table";
// import GlobalFilter from "../../table/react-tables/GlobalFilter";
// import { toast } from "react-toastify";
// import Loader from "@/assets/images/logo/logo.png";
// import Modal from "@/components/ui/Modal";

// const IndeterminateCheckbox = React.forwardRef(
//   ({ indeterminate, ...rest }, ref) => {
//     const defaultRef = React.useRef();
//     const resolvedRef = ref || defaultRef;

//     React.useEffect(() => {
//       resolvedRef.current.indeterminate = indeterminate;
//     }, [resolvedRef, indeterminate]);

//     return (
//       <input
//         type="checkbox"
//         ref={resolvedRef}
//         {...rest}
//         className="table-checkbox"
//       />
//     );
//   }
// );

// const AssignmentListing = () => {
//   const navigate = useNavigate();
//   const [assignments, setAssignments] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
//   const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);

//   // Pagination states from API
//   const [currentPage, setCurrentPage] = useState(1);
//   const [limit] = useState(10);
//   const [totalAssignments, setTotalAssignments] = useState(0);
//   const [totalPages, setTotalPages] = useState(0);
//   const [hasNextPage, setHasNextPage] = useState(false);
//   const [pageFromApi, setPageFromApi] = useState(1);

//   // Global filter state
//   const [globalFilter, setGlobalFilter] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");

//   const confirmDelete = async () => {
//     if (!selectedAssignmentId) {
//       toast.error("Assignment ID is missing");
//       return;
//     }

//     try {
//       const token = localStorage.getItem("token");
      
//       // Step 1: Fetch the assignment details to get the filename
//       const getResponse = await axios.get(
//         `${import.meta.env.VITE_APP_BASE_URL}/assignments/GetById/${selectedAssignmentId}`,
//         {
//           headers: { Authorization: `${token}` },
//         }
//       );

//       // Extract filename from uploadAssignment URL
//       const assignmentData = getResponse.data.data;
//       let filename = "";
      
//       if (assignmentData.uploadAssignment) {
//         // Get the filename from the URL (everything after the last '/')
//         const urlParts = assignmentData.uploadAssignment.split('/');
//         filename = urlParts[urlParts.length - 1];
//       }

//       // Step 2: Call the notes DELETE API with filename and url in body + authorization header
//       if (filename) {
//         try {
//           // Using DELETE request with data in body
//           await axios.delete(
//             "http://13.51.230.148:8000/notes",
//             {
//               data: { 
//                 filename: filename,
//                 url: assignmentData.uploadAssignment // Add the full URL as required
//               },
//               headers: { 
//                 "Content-Type": "application/json",
//                 "Authorization": `Bearer ${token}` // Add authorization header
//               },
//             }
//           );
//           console.log("Notes API called successfully for filename:", filename);
//         } catch (notesError) {
//           console.error("Error calling notes API:", notesError.response?.data || notesError);
//           // You can decide whether to proceed with deletion or not
//           toast.error(`Notes API failed: ${notesError.response?.data?.detail?.[0]?.msg || 'Unknown error'}`);
          
//           // Uncomment the next line if you want to stop deletion when notes API fails
//           // throw new Error("Notes API failed");
//         }
//       }

//       // Step 3: Delete the assignment
//       await axios.delete(
//         `${import.meta.env.VITE_APP_BASE_URL}/assignments/delete/${selectedAssignmentId}`,
//         {
//           headers: { Authorization: `${token}` },
//         }
//       );

//       toast.success("Assignment deleted successfully");

//       // Refresh current page after deletion
//       fetchAssignments(currentPage, limit, searchTerm);
//     } catch (error) {
//       console.error("Error in delete process:", error);
//       toast.error(error.response?.data?.message || "Error deleting assignment");
//     } finally {
//       setDeleteModalOpen(false);
//       setSelectedAssignmentId(null);
//     }
//   };

//   const handleAction = async (action, row) => {
//     if (action === "edit") {
//       navigate(`/add-assignment/${row._id}`, { state: { mode: "edit" } });
//     }
//     if (action === "view") {
//       navigate(`/add-assignment/${row._id}`, { state: { mode: "view" } });
//     }
//   };

//   // Fetch Assignments API with pagination and search
//   const fetchAssignments = async (page = 1, limit = 10, search = "") => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem("token");

//       // Build query params for tutor-assignments endpoint
//       let url = `${import.meta.env.VITE_APP_BASE_URL}/assignments/tutor-assignments?page=${page}&limit=${limit}`;

//       // Add search if present
//       if (search) {
//         url += `&search=${encodeURIComponent(search)}`;
//       }

//       const response = await axios.get(url, {
//         headers: { Authorization: `${token}` },
//       });

//       const assignmentsData = response.data.data || [];
//       setAssignments(assignmentsData);

//       // Set pagination metadata if available
//       if (response.data.meta) {
//         setTotalAssignments(response.data.meta.totalAssignments);
//         setTotalPages(response.data.meta.totalPages);
//         setHasNextPage(response.data.meta.hasNextPage);
//         setCurrentPage(response.data.meta.page);
//         setPageFromApi(response.data.meta.page);
//       } else {
//         // If API doesn't return pagination metadata, calculate from total count
//         setTotalAssignments(assignmentsData.length);
//         setTotalPages(Math.ceil(assignmentsData.length / limit));
//         setHasNextPage(assignmentsData.length === limit);
//         setCurrentPage(page);
//         setPageFromApi(page);
//       }
//     } catch (error) {
//       console.error("Error fetching assignments:", error);
//       toast.error("Error fetching assignments");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Initial fetch and fetch when page/search changes
//   useEffect(() => {
//     // Debounce search to avoid too many API calls
//     const timer = setTimeout(() => {
//       fetchAssignments(currentPage, limit, searchTerm);
//     }, 500);

//     return () => clearTimeout(timer);
//   }, [currentPage, limit, searchTerm]);

//   // Handle page change
//   const handlePageChange = (newPage) => {
//     if (newPage >= 1 && newPage <= totalPages) {
//       setCurrentPage(newPage);
//     }
//   };

//   // Handle global filter change
//   const handleGlobalFilterChange = (value) => {
//     setGlobalFilter(value);
//     setSearchTerm(value);
//     setCurrentPage(1); // Reset to first page on new search
//   };

//   const COLUMNS = useMemo(
//     () => [
//       {
//         Header: "S.No",
//         id: "serialNo",
//         Cell: (row) => (
//           <span>{(row.row.index + 1) + (pageFromApi - 1) * limit}</span>
//         ),
//       },
//       {
//         Header: "Title",
//         accessor: "title",
//         Cell: (row) => (
//           <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">
//             {row?.cell?.value || "-"}
//           </span>
//         ),
//       },
//       {
//         Header: "Description",
//         accessor: "description",
//         Cell: (row) => (
//           <span className="text-sm text-slate-600 dark:text-slate-300">
//             {row?.cell?.value?.length > 50 
//               ? `${row.cell.value.substring(0, 50)}...` 
//               : row?.cell?.value || "-"}
//           </span>
//         ),
//       },
//       {
//         Header: "Due Date",
//         accessor: "dueDate",
//         Cell: (row) => {
//           const dueDate = row?.cell?.value;
//           if (!dueDate) return "-";
          
//           const date = new Date(dueDate);
//           const today = new Date();
//           const isOverdue = date < today;
          
//           return (
//             <span className={`text-sm ${isOverdue ? 'text-red-600 font-semibold' : 'text-slate-600 dark:text-slate-300'}`}>
//               {date.toLocaleDateString("en-GB")}
//               {isOverdue && " (Overdue)"}
//             </span>
//           );
//         },
//       },
//       {
//         Header: "Assignment",
//         accessor: "uploadAssignment",
//         Cell: ({ row }) => {
//           const fileUrl = row.original?.uploadAssignment;
//           return fileUrl ? (
//             <a
//               href={fileUrl}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="text-blue-600 hover:text-blue-800 underline text-sm flex items-center gap-1"
//             >
//               <Icon icon="heroicons:document-text" className="w-4 h-4" />
//               View Assignment
//             </a>
//           ) : (
//             <span className="text-sm text-gray-400">-</span>
//           );
//         },
//       },
//       {
//         Header: "Submissions",
//         accessor: "submissions",
//         Cell: ({ row }) => {
//           const submissions = row.original?.submissions || [];
//           const count = submissions.length;
//           return (
//             <span className="text-sm text-slate-600 dark:text-slate-300">
//               {count} {count === 1 ? 'submission' : 'submissions'}
//             </span>
//           );
//         },
//       },
//       {
//         Header: "Created At",
//         accessor: "createdAt",
//         Cell: (row) => (
//           <span className="text-sm text-slate-600 dark:text-slate-300">
//             {row?.cell?.value
//               ? new Date(row?.cell?.value).toLocaleDateString("en-GB")
//               : "-"}
//           </span>
//         ),
//       },
//       {
//         Header: "Action",
//         accessor: "action",
//         Cell: ({ row }) => (
//           <div className="flex space-x-3 rtl:space-x-reverse">
//             <button
//               className="action-btn"
//               type="button"
//               onClick={() => handleAction("view", row.original)}
//               title="View Assignment"
//             >
//               <Icon icon="heroicons:eye" />
//             </button>
//             {/* <button
//               className="action-btn"
//               type="button"
//               onClick={() => handleAction("edit", row.original)}
//               title="Edit Assignment"
//             >
//               <Icon icon="heroicons:pencil-square" />
//             </button> */}
//             {/* <button
//               className="action-btn"
//               onClick={() => {
//                 setSelectedAssignmentId(row.original._id);
//                 setDeleteModalOpen(true);
//               }}
//               title="Delete Assignment"
//             >
//               <Icon icon="heroicons:trash" className="text-red-600" />
//             </button> */}
//           </div>
//         ),
//       },
//     ],
//     [pageFromApi, limit]
//   );

//   const data = useMemo(() => assignments, [assignments]);

//   // react-table instance
//   const tableInstance = useTable(
//     {
//       columns: COLUMNS,
//       data,
//       manualPagination: true,
//       pageCount: totalPages,
//       initialState: {
//         pageIndex: 0,
//         pageSize: limit,
//       },
//     },
//     useGlobalFilter,
//     useSortBy,
//     usePagination,
//     useRowSelect,
//     (hooks) => {
//       hooks.visibleColumns.push((columns) => [
//         {
//           id: "selection",
//           Header: ({ getToggleAllRowsSelectedProps }) => (
//             <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
//           ),
//           Cell: ({ row }) => (
//             <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
//           ),
//         },
//         ...columns,
//       ]);
//     }
//   );

//   const {
//     getTableProps,
//     getTableBodyProps,
//     headerGroups,
//     page: tablePage,
//     prepareRow,
//     state,
//   } = tableInstance;

//   return (
//     <div>
//       <Card noborder>
//         <div className="md:flex justify-between items-center mb-6">
//           <h4 className="text-xl text-black-600">Assignment Listing</h4>
//           <div className="flex items-center gap-4">
//             <GlobalFilter
//               filter={globalFilter}
//               setFilter={handleGlobalFilterChange}
//             />
//             <Button
//               text={
//                 <>
//                   <span className="hidden sm:inline">+ Create Assignment</span>
//                   <span className="inline sm:hidden">+ Create</span>
//                 </>
//               }
//               className="btn-primary py-2 px-3"
//               type="button"
//               onClick={() => navigate("/add-assignment/add")}
//             />
//           </div>
//         </div>

//         {/* Table */}
//         <div className="overflow-x-auto -mx-6">
//           <div className="inline-block min-w-full align-middle">
//             <div className="overflow-hidden">
//               <table
//                 className="min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700 table-no-wrap"
//                 {...getTableProps()}
//               >
//                 <thead className="border-t border-slate-100 dark:border-slate-800">
//                   {headerGroups.map((headerGroup) => (
//                     <tr {...headerGroup.getHeaderGroupProps()}>
//                       {headerGroup.headers.map((column) => (
//                         <th
//                           {...column.getHeaderProps(column.getSortByToggleProps())}
//                           className="table-th"
//                         >
//                           {column.render("Header")}
//                           <span>
//                             {column.isSorted
//                               ? column.isSortedDesc
//                                 ? " 🔽"
//                                 : " 🔼"
//                               : ""}
//                           </span>
//                         </th>
//                       ))}
//                     </tr>
//                   ))}
//                 </thead>

//                 <tbody {...getTableBodyProps()} className="text-left">
//                   {loading ? (
//                     <tr>
//                       <td colSpan={COLUMNS.length + 1} className="py-10 ">
//                         <div className="flex justify-center items-center">
//                           <img
//                             src={Loader}
//                             alt="Loading..."
//                             className="w-100 h-32"
//                           />
//                         </div>
//                       </td>
//                     </tr>
//                   ) : assignments.length > 0 ? (
//                     tablePage.map((row) => {
//                       prepareRow(row);
//                       return (
//                         <tr {...row.getRowProps()}>
//                           {row.cells.map((cell) => (
//                             <td {...cell.getCellProps()} className="table-td border-b whitespace-nowrap">
//                               {cell.render("Cell")}
//                             </td>
//                           ))}
//                         </tr>
//                       );
//                     })
//                   ) : (
//                     <tr>
//                       <td colSpan={COLUMNS.length + 1} className="py-6 text-center text-gray-500">
//                         No assignments found
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>

//         {/* Simple Pagination */}
//         <div className="md:flex justify-between items-center mt-6">
//           <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
//             Page {currentPage} of {totalPages || 1} | Total {totalAssignments} assignments
//           </span>

//           <div className="flex items-center space-x-3">
//             <button
//               onClick={() => handlePageChange(currentPage - 1)}
//               disabled={currentPage === 1}
//               className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition-colors"
//             >
//               Prev
//             </button>
//             <button
//               onClick={() => handlePageChange(currentPage + 1)}
//               disabled={!hasNextPage}
//               className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition-colors"
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       </Card>

//       <Modal
//         activeModal={deleteModalOpen}
//         onClose={() => setDeleteModalOpen(false)}
//         title="Delete Assignment"
//         themeClass="bg-gradient-to-r from-[#3AB89D] to-[#3A90B8]"
//         centered
//         footerContent={
//           <div className="flex justify-between w-full">
//             <Button
//               text="Cancel"
//               className="btn-light"
//               onClick={() => setDeleteModalOpen(false)}
//             />
//             <Button
//               text="Delete"
//               className="btn-danger"
//               onClick={confirmDelete}
//             />
//           </div>
//         }
//       >
//         <p className="text-slate-700 dark:text-slate-300">
//           Are you sure you want to delete this assignment? This action cannot be undone and will also remove all associated submissions.
//         </p>
//       </Modal>
//     </div>
//   );
// };

// export default AssignmentListing;



import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import {
  useTable,
  useRowSelect,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from "react-table";
import GlobalFilter from "../../table/react-tables/GlobalFilter";
import { toast } from "react-toastify";
import Loader from "@/assets/images/logo/logo.png";
import Modal from "@/components/ui/Modal";

const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, ...rest }, ref) => {
    const defaultRef = React.useRef();
    const resolvedRef = ref || defaultRef;

    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    return (
      <input
        type="checkbox"
        ref={resolvedRef}
        {...rest}
        className="table-checkbox"
      />
    );
  }
);

const AssignmentListing = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  const [submissionsModalOpen, setSubmissionsModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Pagination states from API
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [totalAssignments, setTotalAssignments] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [pageFromApi, setPageFromApi] = useState(1);

  // Global filter state
  const [globalFilter, setGlobalFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const confirmDelete = async () => {
    if (!selectedAssignmentId) {
      toast.error("Assignment ID is missing");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      
      // Step 1: Fetch the assignment details to get the filename
      const getResponse = await axios.get(
        `${import.meta.env.VITE_APP_BASE_URL}/assignments/GetById/${selectedAssignmentId}`,
        {
          headers: { Authorization: `${token}` },
        }
      );

      // Extract filename from uploadAssignment URL
      const assignmentData = getResponse.data.data;
      let filename = "";
      
      if (assignmentData.uploadAssignment) {
        // Get the filename from the URL (everything after the last '/')
        const urlParts = assignmentData.uploadAssignment.split('/');
        filename = urlParts[urlParts.length - 1];
      }

      // Step 2: Call the notes DELETE API with filename and url in body + authorization header
      if (filename) {
        try {
          // Using DELETE request with data in body
          await axios.delete(
            "http://13.51.230.148:8000/notes",
            {
              data: { 
                filename: filename,
                url: assignmentData.uploadAssignment // Add the full URL as required
              },
              headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` // Add authorization header
              },
            }
          );
          console.log("Notes API called successfully for filename:", filename);
        } catch (notesError) {
          console.error("Error calling notes API:", notesError.response?.data || notesError);
          // You can decide whether to proceed with deletion or not
          toast.error(`Notes API failed: ${notesError.response?.data?.detail?.[0]?.msg || 'Unknown error'}`);
          
          // Uncomment the next line if you want to stop deletion when notes API fails
          // throw new Error("Notes API failed");
        }
      }

      // Step 3: Delete the assignment
      await axios.delete(
        `${import.meta.env.VITE_APP_BASE_URL}/assignments/delete/${selectedAssignmentId}`,
        {
          headers: { Authorization: `${token}` },
        }
      );

      toast.success("Assignment deleted successfully");

      // Refresh current page after deletion
      fetchAssignments(currentPage, limit, searchTerm);
    } catch (error) {
      console.error("Error in delete process:", error);
      toast.error(error.response?.data?.message || "Error deleting assignment");
    } finally {
      setDeleteModalOpen(false);
      setSelectedAssignmentId(null);
    }
  };

  const handleAction = async (action, row) => {
    if (action === "edit") {
      navigate(`/add-assignment/${row._id}`, { state: { mode: "edit" } });
    }
    if (action === "view") {
      navigate(`/add-assignment/${row._id}`, { state: { mode: "view" } });
    }
    if (action === "submissions") {
      setSelectedAssignment(row);
      setSubmissionsModalOpen(true);
    }
  };

  // Handle marking submission as complete
  const handleMarkComplete = async (assignmentId, studentId) => {
    if (!assignmentId || !studentId) {
      toast.error("Missing assignment or student ID");
      return;
    }

    try {
      setUpdatingStatus(true);
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/assignments/complete/${assignmentId}/${studentId}`,
        {},
        {
          headers: { Authorization: `${token}` },
        }
      );

      toast.success("Submission marked as completed successfully!");
      
      // Update the local state to reflect the change
      setSelectedAssignment(prev => {
        if (!prev) return prev;
        const updatedSubmissions = prev.submissions.map(sub => 
          sub.studentId === studentId 
            ? { ...sub, status: "completed", updatedAt: new Date().toISOString() }
            : sub
        );
        return { ...prev, submissions: updatedSubmissions };
      });

      // Also refresh the main assignments list
      fetchAssignments(currentPage, limit, searchTerm);
      
    } catch (error) {
      console.error("Error marking submission as complete:", error);
      toast.error(error.response?.data?.message || "Error updating submission status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Fetch Assignments API with pagination and search
  const fetchAssignments = async (page = 1, limit = 10, search = "") => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Build query params for tutor-assignments endpoint
      let url = `${import.meta.env.VITE_APP_BASE_URL}/assignments/tutor-assignments?page=${page}&limit=${limit}`;

      // Add search if present
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `${token}` },
      });

      const assignmentsData = response.data.data || [];
      setAssignments(assignmentsData);

      // Set pagination metadata if available
      if (response.data.meta) {
        setTotalAssignments(response.data.meta.totalAssignments);
        setTotalPages(response.data.meta.totalPages);
        setHasNextPage(response.data.meta.hasNextPage);
        setCurrentPage(response.data.meta.page);
        setPageFromApi(response.data.meta.page);
      } else {
        // If API doesn't return pagination metadata, calculate from total count
        setTotalAssignments(assignmentsData.length);
        setTotalPages(Math.ceil(assignmentsData.length / limit));
        setHasNextPage(assignmentsData.length === limit);
        setCurrentPage(page);
        setPageFromApi(page);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
      toast.error("Error fetching assignments");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and fetch when page/search changes
  useEffect(() => {
    // Debounce search to avoid too many API calls
    const timer = setTimeout(() => {
      fetchAssignments(currentPage, limit, searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [currentPage, limit, searchTerm]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Handle global filter change
  const handleGlobalFilterChange = (value) => {
    setGlobalFilter(value);
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const COLUMNS = useMemo(
    () => [
      {
        Header: "S.No",
        id: "serialNo",
        Cell: (row) => (
          <span>{(row.row.index + 1) + (pageFromApi - 1) * limit}</span>
        ),
      },
      {
        Header: "Title",
        accessor: "title",
        Cell: (row) => (
          <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">
            {row?.cell?.value || "-"}
          </span>
        ),
      },
      {
        Header: "Description",
        accessor: "description",
        Cell: (row) => (
          <span className="text-sm text-slate-600 dark:text-slate-300">
            {row?.cell?.value?.length > 50 
              ? `${row.cell.value.substring(0, 50)}...` 
              : row?.cell?.value || "-"}
          </span>
        ),
      },
      {
        Header: "Due Date",
        accessor: "dueDate",
        Cell: (row) => {
          const dueDate = row?.cell?.value;
          if (!dueDate) return "-";
          
          const date = new Date(dueDate);
          const today = new Date();
          const isOverdue = date < today;
          
          return (
            <span className={`text-sm ${isOverdue ? 'text-red-600 font-semibold' : 'text-slate-600 dark:text-slate-300'}`}>
              {date.toLocaleDateString("en-GB")}
              {isOverdue && " (Overdue)"}
            </span>
          );
        },
      },
      {
        Header: "Assignment",
        accessor: "uploadAssignment",
        Cell: ({ row }) => {
          const fileUrl = row.original?.uploadAssignment;
          return fileUrl ? (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline text-sm flex items-center gap-1"
            >
              <Icon icon="heroicons:document-text" className="w-4 h-4" />
              View Assignment
            </a>
          ) : (
            <span className="text-sm text-gray-400">-</span>
          );
        },
      },
      {
        Header: "Submissions",
        accessor: "submissions",
        Cell: ({ row }) => {
          const submissions = row.original?.submissions || [];
          const count = submissions.length;
          return (
            <span className="text-sm text-slate-600 dark:text-slate-300">
              {count} {count === 1 ? 'submission' : 'submissions'}
            </span>
          );
        },
      },
      {
        Header: "Created At",
        accessor: "createdAt",
        Cell: (row) => (
          <span className="text-sm text-slate-600 dark:text-slate-300">
            {row?.cell?.value
              ? new Date(row?.cell?.value).toLocaleDateString("en-GB")
              : "-"}
          </span>
        ),
      },
      {
        Header: "Action",
        accessor: "action",
        Cell: ({ row }) => (
          <div className="flex space-x-3 rtl:space-x-reverse">
            <button
              className="action-btn"
              type="button"
              onClick={() => handleAction("view", row.original)}
              title="View Assignment"
            >
              <Icon icon="heroicons:eye" />
            </button>
            <button
              className="action-btn"
              type="button"
              onClick={() => handleAction("submissions", row.original)}
              title="View Submissions"
            >
              <Icon icon="heroicons:users" />
            </button>
            {/* <button
              className="action-btn"
              type="button"
              onClick={() => handleAction("edit", row.original)}
              title="Edit Assignment"
            >
              <Icon icon="heroicons:pencil-square" />
            </button> */}
            {/* <button
              className="action-btn"
              onClick={() => {
                setSelectedAssignmentId(row.original._id);
                setDeleteModalOpen(true);
              }}
              title="Delete Assignment"
            >
              <Icon icon="heroicons:trash" className="text-red-600" />
            </button> */}
          </div>
        ),
      },
    ],
    [pageFromApi, limit]
  );

  const data = useMemo(() => assignments, [assignments]);

  // react-table instance
  const tableInstance = useTable(
    {
      columns: COLUMNS,
      data,
      manualPagination: true,
      pageCount: totalPages,
      initialState: {
        pageIndex: 0,
        pageSize: limit,
      },
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        {
          id: "selection",
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
          ),
          Cell: ({ row }) => (
            <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
          ),
        },
        ...columns,
      ]);
    }
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page: tablePage,
    prepareRow,
    state,
  } = tableInstance;

  // Function to get status badge color
  const getStatusBadgeColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <Card noborder>
        <div className="md:flex justify-between items-center mb-6">
          <h4 className="text-xl text-black-600">Assignment Listing</h4>
          <div className="flex items-center gap-4">
            <GlobalFilter
              filter={globalFilter}
              setFilter={handleGlobalFilterChange}
            />
            <Button
              text={
                <>
                  <span className="hidden sm:inline">+ Create Assignment</span>
                  <span className="inline sm:hidden">+ Create</span>
                </>
              }
              className="btn-primary py-2 px-3"
              type="button"
              onClick={() => navigate("/add-assignment/add")}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-6">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden">
              <table
                className="min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700 table-no-wrap"
                {...getTableProps()}
              >
                <thead className="border-t border-slate-100 dark:border-slate-800">
                  {headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column) => (
                        <th
                          {...column.getHeaderProps(column.getSortByToggleProps())}
                          className="table-th"
                        >
                          {column.render("Header")}
                          <span>
                            {column.isSorted
                              ? column.isSortedDesc
                                ? " 🔽"
                                : " 🔼"
                              : ""}
                          </span>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>

                <tbody {...getTableBodyProps()} className="text-left">
                  {loading ? (
                    <tr>
                      <td colSpan={COLUMNS.length + 1} className="py-10 ">
                        <div className="flex justify-center items-center">
                          <img
                            src={Loader}
                            alt="Loading..."
                            className="w-100 h-32"
                          />
                        </div>
                      </td>
                    </tr>
                  ) : assignments.length > 0 ? (
                    tablePage.map((row) => {
                      prepareRow(row);
                      return (
                        <tr {...row.getRowProps()}>
                          {row.cells.map((cell) => (
                            <td {...cell.getCellProps()} className="table-td border-b whitespace-nowrap">
                              {cell.render("Cell")}
                            </td>
                          ))}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={COLUMNS.length + 1} className="py-6 text-center text-gray-500">
                        No assignments found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Simple Pagination */}
        <div className="md:flex justify-between items-center mt-6">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Page {currentPage} of {totalPages || 1} | Total {totalAssignments} assignments
          </span>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition-colors"
            >
              Prev
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!hasNextPage}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </Card>

      {/* Submissions Modal */}
      <Modal
        activeModal={submissionsModalOpen}
        onClose={() => {
          setSubmissionsModalOpen(false);
          setSelectedAssignment(null);
        }}
        title={`Submissions - ${selectedAssignment?.title || ''}`}
        size="large"
        centered
        footerContent={
          <div className="flex justify-end w-full">
            <Button
              text="Close"
              className="btn-light"
              onClick={() => {
                setSubmissionsModalOpen(false);
                setSelectedAssignment(null);
              }}
            />
          </div>
        }
      >
        <div className="space-y-4">
          {selectedAssignment?.submissions && selectedAssignment.submissions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      S.No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submission File
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {selectedAssignment.submissions.map((submission, index) => (
                    <tr key={submission._id || index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {submission.studentId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(submission.status)}`}>
                          {submission.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {submission.uploadAssignment ? (
                          <a
                            href={submission.uploadAssignment}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                          >
                            <Icon icon="heroicons:document-text" className="w-4 h-4" />
                            View Submission
                          </a>
                        ) : (
                          <span className="text-gray-400">No file</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {submission.updatedAt ? new Date(submission.updatedAt).toLocaleString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {submission.status !== 'completed' && (
                          <Button
                            text={updatingStatus ? "Processing..." : "Mark Complete"}
                            className="btn-primary py-1 px-3 text-sm"
                            onClick={() => handleMarkComplete(selectedAssignment._id, submission.studentId)}
                            disabled={updatingStatus}
                          />
                        )}
                        {submission.status === 'completed' && (
                          <span className="text-green-600 text-sm font-medium">✓ Completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No submissions found for this assignment.
            </div>
          )}
        </div>
      </Modal>

      <Modal
        activeModal={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Assignment"
        themeClass="bg-gradient-to-r from-[#3AB89D] to-[#3A90B8]"
        centered
        footerContent={
          <div className="flex justify-between w-full">
            <Button
              text="Cancel"
              className="btn-light"
              onClick={() => setDeleteModalOpen(false)}
            />
            <Button
              text="Delete"
              className="btn-danger"
              onClick={confirmDelete}
            />
          </div>
        }
      >
        <p className="text-slate-700 dark:text-slate-300">
          Are you sure you want to delete this assignment? This action cannot be undone and will also remove all associated submissions.
        </p>
      </Modal>
    </div>
  );
};

export default AssignmentListing;


