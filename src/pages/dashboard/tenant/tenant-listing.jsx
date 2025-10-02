import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import {
  useTable,
  useRowSelect,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from "react-table";
import GlobalFilter from "../../table/react-tables/GlobalFilter";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";

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

const TenantListing = () => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);

  const loggedInUser = JSON.parse(localStorage.getItem("user")); // 👈 logged-in user

  // Pagination states
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pages, setPages] = useState(1);

  // Handle row actions
  const handleAction = async (action, row) => {
    if (action === "edit") {
      navigate(`/add-tenant/${row._id}`, { state: { mode: "edit" } });
    }
    if (action === "view") {
      navigate(`/add-tenant/${row._id}`, { state: { mode: "view" } });
    }
    if (action === "delete") {
      try {
        const token = localStorage.getItem("token");

        await axios.delete(
          `${import.meta.env.VITE_APP_BASE_URL}/tenants/${row._id}`,
          { headers: { Authorization: `${token}` } }
        );

        toast.success("Tenant deleted successfully");

        setTenants((prev) => prev.filter((t) => t._id !== row._id));
      } catch (error) {
        console.error("Error deleting tenant:", error);
        toast.error("Failed to delete tenant");
      }
    }
  };

  // Fetch Tenants
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${import.meta.env.VITE_APP_BASE_URL}/tenants?page=${page}&limit=${limit}`,
          {
            headers: { Authorization: `${token}` },
          }
        );

        // Merge frontend "createdBy" & "updatedBy"
        const merged = (response.data.data || [])
          .filter((t) => !t.isDeleted)
          .map((t) => ({
            ...t,
            createdBy: t.createdBy || loggedInUser?.name,
            updatedBy: t.updatedBy || loggedInUser?.name,
          }));

        setTenants(merged);

        const pagination = response.data.pagination;
        setTotal(pagination.total);
        setPage(pagination.page);
        setPages(pagination.totalPages);
      } catch (error) {
        console.error("Error fetching tenants:", error);
      }
    };

    fetchTenants();
  }, [page, limit, loggedInUser?.name]);

  const COLUMNS = useMemo(
    () => [
      {
        Header: "S.No",
        id: "serialNo",
        Cell: (row) => (
          <span>{row.row.index + 1 + (page - 1) * limit}</span>
        ),
      },
      { Header: "Name", accessor: "name" },
      { Header: "Email", accessor: "email" },
      { Header: "Phone", accessor: "phone" },
      { Header: "Address", accessor: "address" },
      { Header: "Created By", accessor: "createdBy" }, 
      { Header: "Edited By", accessor: "updatedBy" }, 
      {
        Header: "Status",
        accessor: "isActive",
        Cell: (row) => (
          <span
            className={`inline-block px-3 min-w-[90px] text-center mx-auto py-1 rounded-full bg-opacity-25 ${
              row?.cell?.value
                ? "text-success-500 bg-success-500"
                : "text-danger-500 bg-danger-500"
            }`}
          >
            {row?.cell?.value ? "Active" : "Inactive"}
          </span>
        ),
      },
      {
        Header: "Created At",
        accessor: "createdAt",
        Cell: (row) => (
          <span>{new Date(row?.cell?.value).toLocaleDateString("en-GB")}</span>
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

  const data = useMemo(() => tenants, [tenants]);

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
          <h4 className="card-title">Tenants</h4>
          <div className="flex items-center gap-3">
            <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
            <Button
              text="+ Create Tenant"
              className="btn-primary"
              type="button"
              onClick={() => navigate("/add-tenant/add")}
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

        {/* Pagination */}
        <div className="md:flex justify-between items-center mt-6">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Page {page} of {pages} | Total {total} tenants
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

export default TenantListing;
