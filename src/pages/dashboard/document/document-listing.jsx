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

  // Pagination states (dummy for now — update if backend supports)
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const handleAction = async (action, row) => {
    if (action === "edit") {
      navigate(`/add-document/${row._id}`, { state: { mode: "edit" } });
    }
    if (action === "view") {
      navigate(`/add-document/${row._id}`, { state: { mode: "view" } });
    }
    if (action === "delete") {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(
          `${import.meta.env.VITE_APP_BASE_URL}/documents/delete/${row._id}`,
          {
            headers: { Authorization: `${token}` },
          }
        );
        toast.success("Document deleted successfully");
        // instantly update UI
        setDocuments((prev) => prev.filter((doc) => doc._id !== row._id));
      } catch (error) {
        toast.error("Error deleting document:", error);
      }
    }
  };
  const actions = [
    { name: "view", icon: "heroicons-outline:eye" },
    { name: "edit", icon: "heroicons:pencil-square" },
    { name: "delete", icon: "heroicons-outline:trash" },
  ];

  // Fetch Documents API
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${import.meta.env.VITE_APP_BASE_URL}/documents/GetAll`,
          {
            headers: { Authorization: `${token}` },
          }
        );

        setDocuments(response.data.data || []);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };

    fetchDocuments();
  }, []);

  const COLUMNS = useMemo(
    () => [
      {
        Header: "S.No",
        id: "serialNo",
        Cell: (row) => (
          <span>{row.row.index + 1 + (page - 1) * limit}</span>
        ),
      },
      {
        Header: "Tite",
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
        accessor: "documentPage", // comes directly from backend (Page1, Page2, NA)
        Cell: (row) => (
          <span className="text-sm text-slate-600 dark:text-slate-300">
            {row?.cell?.value || "NA"}
          </span>
        ),
      },
      {
        Header: "Document",
        accessor: "documentFile", // <-- make sure your backend returns a file path or URL here
        Cell: ({ row }) => {
          const fileUrl = row.original?.documentFile; // Adjust key if different
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
            {/* View */}
            <button
              className="action-btn"
              type="button"
              onClick={() => handleAction("view", row.original)}
            >
              <Icon icon="heroicons:eye" />
            </button>

            {/* Edit */}
            <button
              className="action-btn"
              type="button"
              onClick={() => handleAction("edit", row.original)}
            >
              <Icon icon="heroicons:pencil-square" />
            </button>

            {/* Delete */}
            <button
              className="action-btn"
              type="button"
              onClick={() => handleAction("delete", row.original)}
            >
              <Icon icon="heroicons:trash" />
            </button>
          </div>
        ),
      },
    ],
    [page, limit]
  );

  const data = useMemo(() => documents, [documents]);

  // react-table instance
  const tableInstance = useTable(
    { columns: COLUMNS, data },
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
    setGlobalFilter,
  } = tableInstance;

  const { globalFilter } = state;

  return (
    <div>
      <Card noborder>
        <div className="md:flex justify-between items-center mb-6">
          <h4 className="card-title">Documents</h4>

          <div className="flex items-center gap-4">
            <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
            <Button
              text="+ Create Document"
              className="btn-primary"
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

                <tbody
                  className="bg-white divide-y divide-slate-100 dark:bg-slate-800 dark:divide-slate-700"
                  {...getTableBodyProps()}
                >
                  {tablePage.map((row) => {
                    prepareRow(row);
                    return (
                      <tr {...row.getRowProps()}>
                        {row.cells.map((cell) => (
                          <td {...cell.getCellProps()} className="table-td">
                            {cell.render("Cell")}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Dummy pagination (replace if backend provides real pagination) */}
        <div className="md:flex justify-between items-center mt-6">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Page {page} | Total {documents.length} documents
          </span>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DocumentListing;
