import React, { useEffect, useState, useMemo } from "react";
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
import Loader from "@/assets/images/logo/logo.png";

const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, ...rest }, ref) => {
    const defaultRef = React.useRef();
    const resolvedRef = ref || defaultRef;

    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    return (
      <input type="checkbox" ref={resolvedRef} {...rest} className="table-checkbox" />
    );
  }
);

const DocTypeListing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [docTypes, setDocTypes] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pages, setPages] = useState(1);

  const handleAction = async (action, row) => {
    if (action === "edit") {
      navigate(`/add-doc-type/${row._id}`, { state: { mode: "edit" } });
    }
    if (action === "view") {
      navigate(`/add-doc-type/${row._id}`, { state: { mode: "view" } });
    }
    if (action === "delete") {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(
          `${import.meta.env.VITE_APP_BASE_URL}/document-types/delete/${row._id}`,
          { headers: { Authorization: `${token}` } }
        );
        toast.success("DocType deleted successfully");
        setDocTypes((prev) => prev.filter((d) => d._id !== row._id));
      } catch (err) {
        console.error("Error deleting doc type:", err);
      }
    }
  };

  useEffect(() => {
    const fetchDocTypes = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${import.meta.env.VITE_APP_BASE_URL}/document-types/GetAll?page=${page}&limit=${limit}`,
          { headers: { Authorization: `${token}` } }
        );

        if (Array.isArray(res.data?.data)) {
          setDocTypes(res.data.data);
          if (res.data.pagination) {
            setTotal(res.data.pagination.total);
            setPages(res.data.pagination.totalPages);
            setPage(res.data.pagination.page);
            setLimit(res.data.pagination.limit);
          }
        } else {
          console.warn("Unexpected API response:", res.data);
          setDocTypes([]);
        }
      } catch (error) {
        console.error("Error fetching document types:", error);
        setDocTypes([]);
      } finally {
        setLoading(false); //  stop loading after fetch
      }
    };
    fetchDocTypes();
  }, [page, limit]);

  const COLUMNS = useMemo(
    () => [
      {
        Header: "S.No",
        id: "serialNo",
        Cell: (row) => (
          <span>{row.row.index + 1 + (page - 1) * limit}</span>
        ),
      },
      { Header: "Type", accessor: "documentType" },
      { Header: "Abbreviation", accessor: "documentAbbreviation" },
      { Header: "Description", accessor: "description" },
      {
        Header: "Created At",
        accessor: "createdAt",
        Cell: (row) =>
          row.value ? new Date(row.value).toLocaleDateString("en-GB") : "-",
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

  const data = useMemo(() => docTypes, [docTypes]);

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
          <h4 className="card-title">Document Types</h4>
          <div className="flex items-center gap-3">
            <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
            <Button
              text="+ Create Doc Type"
              className="btn-primary"
              type="button"
              onClick={() => navigate("/add-doc-type/add")}
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
                <tbody {...getTableBodyProps()} className="text-center">
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
                  ) : tablePage.length > 0 ? (
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
                      <td colSpan={COLUMNS.length + 1} className="py-6 text-gray-500">
                        No students found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pagination */}
        <div className="md:flex justify-between items-center mt-6">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Page {page} of {pages} | Total {total} document types
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
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
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

export default DocTypeListing;
