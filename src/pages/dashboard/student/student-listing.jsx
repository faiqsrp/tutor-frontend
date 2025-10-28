import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import Swicth from "@/components/ui/Switch";
import {
  useTable,
  useRowSelect,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from "react-table";
import GlobalFilter from "../../table/react-tables/GlobalFilter";
import Loader from "@/assets/images/logo/logo.png";

const IndeterminateCheckbox = React.forwardRef(({ indeterminate, ...rest }, ref) => {
  const defaultRef = React.useRef();
  const resolvedRef = ref || defaultRef;
  React.useEffect(() => {
    resolvedRef.current.indeterminate = indeterminate;
  }, [resolvedRef, indeterminate]);
  return <input type="checkbox" ref={resolvedRef} {...rest} className="table-checkbox" />;
});

const StudentListing = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingIds, setUpdatingIds] = useState([]); // ids currently being updated

  // Pagination states
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pages, setPages] = useState(1);

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${import.meta.env.VITE_APP_BASE_URL}/user/students?page=${page}&limit=${limit}`,
          { headers: { Authorization: `${token}` } }
        );
        setStudents(response.data.data.students || []);
        const pagination = response.data.data.pagination || {};
        setTotal(pagination.total || 0);
        setPage(pagination.page || 1);
        setLimit(pagination.limit || limit);
        setPages(pagination.pages || 1);
      } catch (error) {
        console.error("Error fetching students:", error);
        toast.error("Failed to fetch students");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [page, limit]);

  // Toggle a single student's active status
  const handleToggle = async (id) => {
    // find student locally
    const student = students.find((s) => s._id === id);
    if (!student) {
      console.warn("Student not found for id:", id);
      return;
    }

    const newStatus = !student.isActive;

    try {
      // mark as updating
      setUpdatingIds((prev) => [...prev, id]);
      const token = localStorage.getItem("token");

      // call backend (adjust method/path if your backend expects a different signature)
      await axios.put(
        `${import.meta.env.VITE_APP_BASE_URL}/user/update-student-status/${id}`,
        { isActive: newStatus },
        { headers: { Authorization: `${token}` } }
      );

      // update local state so only this student's switch & badge update
      setStudents((prev) => prev.map((s) => (s._id === id ? { ...s, isActive: newStatus } : s)));

      toast.success(`Student ${newStatus ? "activated" : "deactivated"} successfully`);
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error("Failed to update student status");
    } finally {
      // remove from updating list
      setUpdatingIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const handleAction = (action, row) => {
    if (action === "edit") navigate(`/student-form/${row._id}`, { state: { mode: "edit" } });
    if (action === "view") navigate(`/student-form/${row._id}`, { state: { mode: "view" } });
  
  };

  // columns depend on students so table updates reflect toggles immediately
  const COLUMNS = useMemo(
    () => [
      {
        Header: "S.No",
        id: "serialNo",
        Cell: (row) => <span>{row.row.index + 1 + (page - 1) * limit}</span>,
      },
      {
        Header: "Name",
        accessor: "name",
        Cell: (row) => <span className="text-sm text-slate-600 dark:text-slate-300 capitalize">{row?.cell?.value}</span>,
      },
      {
        Header: "Email",
        accessor: "email",
        Cell: (row) => <span className="text-sm lowercase text-slate-600 dark:text-slate-300">{row?.cell?.value}</span>,
      },
      {
        Header: "Status",
        accessor: "isActive",
        Cell: (row) => (
          <span className="block w-full">
            <span
              className={`inline-block px-3 min-w-[90px] text-center mx-auto py-1 rounded-full bg-opacity-25 ${row?.cell?.value ? "text-white bg-primary-700" : "text-danger-500 bg-danger-500"
                }`}
            >
              {row?.cell?.value ? "Active" : "Inactive"}
            </span>
          </span>
        ),
      },
      {
        Header: "Created At",
        accessor: "createdAt",
        Cell: (row) => <span>{new Date(row?.cell?.value).toLocaleDateString("en-GB")}</span>,
      },
      {
        Header: "Action",
        accessor: "action",
        Cell: ({ row }) => {
          const student = row.original;
          const isUpdating = updatingIds.includes(student._id);

          return (
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <button className="action-btn" type="button" onClick={() => handleAction("view", student)}>
                <Icon icon="heroicons:eye" />
              </button>

              <button className="action-btn" type="button" onClick={() => handleAction("edit", student)}>
                <Icon icon="heroicons:pencil-square" />
              </button>
              <button className="action-btn" type="button" onClick={() => handleAction("delete", student)}>
                <Icon icon="heroicons:trash" />
              </button>
              <Swicth
                id={`switch-${student._id}`}
                value={!!student.isActive}
                onChange={() => handleToggle(student._id)}
                badge={false}
                disabled={isUpdating}
              />
            </div>
          );
        },
      },
    ],
    [page, limit, students, updatingIds] // include students & updatingIds so table updates immediately
  );

  const data = useMemo(() => students, [students]);

  const tableInstance = useTable(
    { columns: COLUMNS, data, manualPagination: true, pageCount: pages },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((cols) => [
        {
          id: "selection",
          Header: ({ getToggleAllRowsSelectedProps }) => <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />,
          Cell: ({ row }) => <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />,
        },
        ...cols,
      ]);
    }
  );

  const { getTableProps, getTableBodyProps, headerGroups, page: tablePage, prepareRow, state, setGlobalFilter } = tableInstance;
  const { globalFilter } = state;

  return (
    <Card noborder>
      <div className="md:flex justify-between items-center mb-6">
        <h4 className="card-title">Students</h4>
        <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-6">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-slate-100 table-fixed dark:divide-slate-700" {...getTableProps()}>
              <thead className="border-t border-slate-100 dark:border-slate-800">
                {headerGroups.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <th {...column.getHeaderProps(column.getSortByToggleProps())} className="table-th">
                        {column.render("Header")}
                        <span>{column.isSorted ? (column.isSortedDesc ? " 🔽" : " 🔼") : ""}</span>
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
                        <img src={Loader} alt="Loading..." className="w-100 h-32" />
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
          Page {page} of {pages} | Total {total} students
        </span>

        <div className="flex items-center space-x-3">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">
            Prev
          </button>
          <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">
            Next
          </button>
        </div>
      </div>
    </Card>
  );
};

export default StudentListing;
