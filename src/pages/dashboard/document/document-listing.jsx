import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import Dropdown from "@/components/ui/Dropdown";
import { Menu } from "@headlessui/react";
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

const DocumentListing = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);

  // Pagination states from API
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [pageFromApi, setPageFromApi] = useState(1);

  // Global filter state
  const [globalFilter, setGlobalFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const confirmDelete = async () => {
    if (!selectedDocumentId) {
      toast.error("Document ID is missing");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${import.meta.env.VITE_APP_BASE_URL}/documents/delete/${selectedDocumentId}`,
        {
          headers: { Authorization: `${token}` },
        }
      );

      toast.success("Document deleted successfully");

      // Refresh current page after deletion
      fetchDocuments(currentPage, limit, searchTerm);
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Error deleting document");
    } finally {
      setDeleteModalOpen(false);
      setSelectedDocumentId(null);
    }
  };

  const handleAction = async (action, row) => {
    if (action === "edit") {
      navigate(`/add-document/${row._id}`, { state: { mode: "edit" } });
    }
    if (action === "view") {
      navigate(`/add-document/${row._id}`, { state: { mode: "view" } });
    }
  };

  // Fetch Documents API with pagination and search
  const fetchDocuments = async (page = 1, limit = 10, search = "") => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Build query params
      let url = `${import.meta.env.VITE_APP_BASE_URL}/documents/GetAll?page=${page}&limit=${limit}`;

      // Add search if present
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `${token}` },
      });

      setDocuments(response.data.data || []);

      // Set pagination metadata
      if (response.data.meta) {
        setTotalDocuments(response.data.meta.totalDocuments);
        setTotalPages(response.data.meta.totalPages);
        setHasNextPage(response.data.meta.hasNextPage);
        setCurrentPage(response.data.meta.page);
        setPageFromApi(response.data.meta.page);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Error fetching documents");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and fetch when page/search changes
  useEffect(() => {
    // Debounce search to avoid too many API calls
    const timer = setTimeout(() => {
      fetchDocuments(currentPage, limit, searchTerm);
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
        accessor: (row) => row?.title || row?.description,
        Cell: (row) => (
          <span className="text-sm text-slate-600 dark:text-slate-300">
            {row?.cell?.value || "-"}
          </span>
        ),
      },
      {
        Header: "Doc Type",
        accessor: "documentType.documentType",
        Cell: (row) => (
          <span className="text-sm text-slate-600 dark:text-slate-300">
            {row?.cell?.value || "-"}
          </span>
        ),
      },
      {
        Header: "Paper",
        accessor: "documentPage",
        Cell: (row) => (
          <span className="text-sm text-slate-600 dark:text-slate-300">
            {row?.cell?.value || "NA"}
          </span>
        ),
      },
      {
        Header: "Document",
        accessor: "documentFile",
        Cell: ({ row }) => {
          const fileUrl = row.original?.documentUpload || row.original?.documentURL;
          return fileUrl ? (
            <a
              href={fileUrl.startsWith("http") ? fileUrl : `${import.meta.env.VITE_APP_BASE_URL}/${fileUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              View Document
            </a>
          ) : (
            <span>-</span>
          );
        },
      },
      {
        Header: "Doc Brief",
        accessor: (row) => row?.documnetBrief || row?.description,
        Cell: (row) => (
          <span className="text-sm text-slate-600 dark:text-slate-300">
            {row?.cell?.value || "-"}
          </span>
        ),
      },
      {
        Header: "Created At",
        accessor: "createdAt",
        Cell: (row) => (
          <span>
            {row?.cell?.value
              ? new Date(row?.cell?.value).toLocaleDateString("en-GB")
              : "-"}
          </span>
        ),
      },
      {
        Header: "Updated At",
        accessor: "updatedAt",
        Cell: (row) => (
          <span>
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
            >
              <Icon icon="heroicons:eye" />
            </button>
            <button
              className="action-btn"
              type="button"
              onClick={() => handleAction("edit", row.original)}
            >
              <Icon icon="heroicons:pencil-square" />
            </button>
            <button
              className="action-btn"
              onClick={() => {
                setSelectedDocumentId(row.original._id);
                setDeleteModalOpen(true);
              }}
            >
              <Icon icon="heroicons:trash" className="text-red-600" />
            </button>
          </div>
        ),
      },
    ],
    [pageFromApi, limit]
  );

  const data = useMemo(() => documents, [documents]);

  // react-table instance
  const tableInstance = useTable(
    {
      columns: COLUMNS,
      data,
      manualPagination: true,
      pageCount: totalPages
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

  return (
    <div>
      <Card noborder>
        <div className="md:flex justify-between items-center mb-6">
          <h4 className="text-xl text-black-600">Document Listing</h4>
          <div className="flex items-center gap-4">
            <GlobalFilter
              filter={globalFilter}
              setFilter={handleGlobalFilterChange}
            />
            <Button
              text={
                <>
                  <span className="hidden sm:inline">+ Create Document </span>
                  <span className="inline sm:hidden">+ Create</span>
                </>
              }
              className="btn-primary py-2 px-3"
              type="button"
              onClick={() => navigate("/add-document/add")}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-6">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden">
              <table
                className="min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700"
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
                      <td colSpan={COLUMNS.length + 1} className="py-10">
                        <div className="flex justify-center items-center">
                          <img
                            src={Loader}
                            alt="Loading..."
                            className="w-100 h-32"
                          />
                        </div>
                      </td>
                    </tr>
                  ) : documents.length > 0 ? (
                    tablePage.map((row) => {
                      prepareRow(row);
                      return (
                        <tr {...row.getRowProps()}>
                          {row.cells.map((cell) => (
                            <td {...cell.getCellProps()} className="table-td border-b">
                              {cell.render("Cell")}
                            </td>
                          ))}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={COLUMNS.length + 1} className="py-6 text-center text-gray-500">
                        No documents found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Simple Pagination - Exactly as requested */}
        <div className="md:flex justify-between items-center mt-6">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Page {currentPage} of {totalPages || 1} | Total {totalDocuments} documents
          </span>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!hasNextPage}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </Card>

      <Modal
        activeModal={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Document"
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
          Are you sure you want to delete this document? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default DocumentListing;