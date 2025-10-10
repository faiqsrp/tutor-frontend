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

const TenantListing = () => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  const loggedInUser = JSON.parse(localStorage.getItem("user")); //  logged-in user

  // Pagination states
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
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
        setLoading(true);
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

        if (response.data.pagination) {
          const { total, page: currentPage, limit: apiLimit, totalPages } = response.data.pagination;
          setTotal(total || 0);
          setPage(currentPage || 1);
          setLimit(apiLimit || 10);
          setPages(totalPages || 1);
        }
      } catch (error) {
        console.error("Error fetching tenants:", error);
      } finally {
        setLoading(false); //  stop loading after fetch
      }
    };

    fetchTenants();
  }, [page, limit, loggedInUser?.name]);

  const COLUMNS = useMemo(
    () => [
      {
        Header: "S.No",
        id: "serialNo",
       Cell: (row) => <span>{row.row.index + 1 + (page - 1) * limit}</span>
      },
      { Header: "Name", accessor: "name" },
      {
        Header: "Email",
        accessor: "email",
        Cell: (row) => <span className="text-sm lowercase text-slate-600 dark:text-slate-300">{row?.cell?.value}</span>,
      },
      { Header: "Phone", accessor: "phone" },
      { Header: "Address", accessor: "address" },
      { Header: "Created By", accessor: "createdBy.name" },
      { Header: "Updated By", accessor: "updatedBy.name" },
      {
        Header: "Status",
        accessor: "isActive",
        Cell: (row) => (
          <span
            className={`inline-block px-3 min-w-[90px] text-center mx-auto py-1 rounded-full bg-opacity-25 ${row?.cell?.value
              ? "text-white bg-primary-700"
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
              text={
                <>
                  <span className="hidden sm:inline">+ Create tenant</span>
                  <span className="inline sm:hidden">+ Create</span>
                </>
              }
              className="btn-primary py-2 px-3"
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
        <div className="md:flex md:space-y-0 space-y-5 justify-between mt-6 items-center">
          {/* Go to page */}
         <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-700 dark:text-slate-300">
            Go to page:
          </span>
          <input
            type="number"
            min="1"
            max={pages}
            value={page}
            onChange={(e) => {
              const newPage = Number(e.target.value);
              if (newPage >= 1 && newPage <= pages) setPage(newPage);
            }}
            className="w-16 border rounded-md px-2 py-1 text-center dark:bg-slate-800 dark:text-white"
          />
          <span className="text-slate-700 dark:text-slate-300">
            Page <strong>{page}</strong> of {pages}
          </span>
          <span className="text-slate-700 dark:text-slate-300">
            | Total {total} students
          </span>
        </div>

          {/* Page numbers and navigation */}
          <ul className="flex items-center space-x-3 rtl:space-x-reverse">
            {/* First Page */}
            <li className="text-xl text-slate-900 dark:text-white rtl:rotate-180">
              <button onClick={() => setPage(1)} disabled={page === 1}>
                <Icon icon="heroicons:chevron-double-left-solid" />
              </button>
            </li>

            {/* Previous */}
            <li>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                Prev
              </button>
            </li>

            {/* Page Numbers */}
            {Array.from({ length: pages }, (_, i) => i + 1).map((num) => (
              <li key={num}>
                <button
                  className={`text-sm rounded px-3 py-1 ${num === page
                    ? "bg-slate-900 text-white dark:bg-slate-600 dark:text-slate-200 font-medium"
                    : "bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-400 font-normal"
                    }`}
                  onClick={() => setPage(num)}
                >
                  {num}
                </button>
              </li>
            ))}

            {/* Next */}
            <li>
              <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}>
                Next
              </button>
            </li>

            {/* Last Page */}
            <li className="text-xl text-slate-900 dark:text-white rtl:rotate-180">
              <button onClick={() => setPage(pages)} disabled={page === pages}>
                <Icon icon="heroicons:chevron-double-right-solid" />
              </button>
            </li>
          </ul>

          {/* Page size selector */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Show</span>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="form-select py-2"
            >
              {[5, 10, 20, 30, 40].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TenantListing;
