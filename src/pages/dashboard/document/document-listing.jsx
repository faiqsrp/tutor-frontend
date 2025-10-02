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
          `${process.env.REACT_APP_BASE_URL}/documents/delete/${row._id}`,
          {
            headers: { Authorization: `${token}` },
          }
        );

        // instantly update UI
        setDocuments((prev) => prev.filter((doc) => doc._id !== row._id));
      } catch (error) {
        console.error("Error deleting document:", error);
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
          `${process.env.REACT_APP_BASE_URL}/documents/GetAll`,
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
        Header: "Document",
        accessor: "documentFile", // <-- make sure your backend returns a file path or URL here
        Cell: ({ row }) => {
          const fileUrl = row.original?.documentFile; // Adjust key if different
          return fileUrl ? (
            <a
              href={fileUrl.startsWith("http") ? fileUrl : `${process.env.REACT_APP_BASE_URL}/${fileUrl}`}
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
          <Dropdown
            classMenuItems="right-0 w-[140px] top-[110%]"
            label={
              <span className="text-xl text-center block w-full">
                <Icon icon="heroicons-outline:dots-vertical" />
              </span>
            }
          >
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {actions.map((item, i) => (
                <Menu.Item key={i}>
                  <div
                    onClick={() => handleAction(item.name, row.original)}
                    className={`${item.name === "delete"
                      ? "bg-danger-500 text-danger-500 bg-opacity-30 hover:bg-opacity-100 hover:text-white"
                      : "hover:bg-slate-900 hover:text-white dark:hover:bg-slate-600 dark:hover:bg-opacity-50"
                      } w-full px-4 py-2 text-sm cursor-pointer flex space-x-2 items-center`}
                  >
                    <span className="text-base">
                      <Icon icon={item.icon} />
                    </span>
                    <span className="capitalize">{item.name}</span>
                  </div>
                </Menu.Item>
              ))}
            </div>
          </Dropdown>
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
      <div className="flex justify-end mb-4">
        <Button
          text="+ Create Document"
          className="btn-dark"
          type="button"
          onClick={() => navigate("/add-document/add")}
        />
      </div>
      <Card noborder>
        <div className="md:flex justify-between items-center mb-6">
          <h4 className="card-title">Documents</h4>

          <div className="flex items-center gap-4">
            <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
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
